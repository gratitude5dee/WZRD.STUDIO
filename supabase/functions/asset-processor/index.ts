// ============================================================================
// EDGE FUNCTION: asset-processor
// PURPOSE: Background job to process uploaded assets (thumbnails, metadata)
// ROUTE: POST /functions/v1/asset-processor (invoked by cron or queue)
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import {
  writableStreamFromWriter,
} from "https://deno.land/std@0.177.0/streams/conversion.ts";
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

const THUMBNAIL_BUCKET = "asset-thumbnails";
const PREVIEW_BUCKET = "asset-previews";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const STORAGE_BASE_URL = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public`
  : null;

const decoder = new TextDecoder();

type Metadata = Record<string, unknown> & {
  file_size?: number;
};
type ProcessingResult = {
  metadata: Metadata;
  thumbnailPath: string | null;
  thumbnailUrl: string | null;
  previewPath: string | null;
  previewUrl: string | null;
};

const MAX_THUMB_EDGE = 512;

async function streamBlobToFile(blob: Blob, filePath: string) {
  const file = await Deno.open(filePath, {
    write: true,
    create: true,
    truncate: true,
  });
  try {
    await blob.stream().pipeTo(writableStreamFromWriter(file));
  } finally {
    file.close();
  }
}

async function probeMedia(filePath: string) {
  try {
    const command = new Deno.Command("ffprobe", {
      args: [
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        filePath,
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await command.output();
    if (code !== 0) {
      throw new Error(
        `FFprobe failed (${code}): ${decoder.decode(stderr) || "unknown error"}`,
      );
    }
    return JSON.parse(decoder.decode(stdout));
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(
        "FFprobe binary not available in runtime. Install FFmpeg with ffprobe support.",
      );
    }
    throw error;
  }
}

async function runFfmpeg(args: string[], errorLabel: string) {
  try {
    const command = new Deno.Command("ffmpeg", {
      args,
      stdout: "null",
      stderr: "piped",
    });
    const { code, stderr } = await command.output();
    if (code !== 0) {
      throw new Error(
        `${errorLabel}: ${decoder.decode(stderr) || "ffmpeg exited with error"}`,
      );
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(
        "FFmpeg binary not available in runtime. Install FFmpeg for previews/thumbnails.",
      );
    }
    throw error;
  }
}

function buildPublicUrl(bucket: string | null, path: string | null) {
  if (!bucket || !path || !STORAGE_BASE_URL) return null;
  return `${STORAGE_BASE_URL}/${bucket}/${path}`;
}

async function uploadFile(
  supabaseAdmin: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
  bytes: Uint8Array,
  contentType: string,
) {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, new Blob([bytes]), {
      contentType,
      upsert: true,
    });
  if (error) {
    throw new Error(`Failed to upload ${bucket}/${path}: ${error.message}`);
  }
  return path;
}

async function processImage(
  supabaseAdmin: ReturnType<typeof createClient>,
  tempFilePath: string,
  assetId: string,
  mimeType: string | null,
): Promise<ProcessingResult> {
  const imageBytes = await Deno.readFile(tempFilePath);
  const image = await Image.decode(imageBytes);
  const metadata: Metadata = {
    width: image.width,
    height: image.height,
    aspect_ratio: Number((image.width / image.height).toFixed(5)),
    file_size: imageBytes.length,
    processed_at: new Date().toISOString(),
    format: mimeType,
  };

  const resized = image.resize(MAX_THUMB_EDGE, Image.RESIZE_AUTO);
  const thumbBytes = await resized.encodeJPEG(85);
  const thumbnailPath = `${assetId}/thumb-${Date.now()}.jpg`;
  await uploadFile(
    supabaseAdmin,
    THUMBNAIL_BUCKET,
    thumbnailPath,
    thumbBytes,
    "image/jpeg",
  );

  return {
    metadata,
    thumbnailPath,
    thumbnailUrl: buildPublicUrl(THUMBNAIL_BUCKET, thumbnailPath),
    previewPath: null,
    previewUrl: null,
  };
}

function parseFrameRate(rate?: string) {
  if (!rate || rate === "0/0") return null;
  const [num, den] = rate.split("/").map((x) => Number(x));
  if (!num || !den) return null;
  return Number((num / den).toFixed(3));
}

async function processVideo(
  supabaseAdmin: ReturnType<typeof createClient>,
  tempDir: string,
  tempFilePath: string,
  assetId: string,
): Promise<ProcessingResult> {
  const probe = await probeMedia(tempFilePath);
  const videoStream = probe.streams?.find((s: any) => s.codec_type === "video");
  const audioStream = probe.streams?.find((s: any) => s.codec_type === "audio");
  const durationSec = Number(
    videoStream?.duration ?? audioStream?.duration ?? probe.format?.duration ?? 0,
  );
  const metadata: Metadata = {
    width: videoStream?.width ?? null,
    height: videoStream?.height ?? null,
    aspect_ratio:
      videoStream?.width && videoStream?.height
        ? Number((videoStream.width / videoStream.height).toFixed(5))
        : null,
    duration_ms: Math.round(durationSec * 1000),
    frame_rate: parseFrameRate(videoStream?.avg_frame_rate),
    video_codec: videoStream?.codec_name,
    audio_codec: audioStream?.codec_name,
    bitrate: Number(probe.format?.bit_rate ?? videoStream?.bit_rate ?? 0),
    processed_at: new Date().toISOString(),
  };

  const thumbnailFile = `${tempDir}/thumb-${assetId}.jpg`;
  await runFfmpeg(
    [
      "-y",
      "-i",
      tempFilePath,
      "-frames:v",
      "1",
      "-vf",
      `thumbnail,scale=${MAX_THUMB_EDGE}:-1`,
      thumbnailFile,
    ],
    "Failed to generate video thumbnail",
  );
  const thumbnailBytes = await Deno.readFile(thumbnailFile);
  const thumbnailPath = `${assetId}/thumb-${Date.now()}.jpg`;
  await uploadFile(
    supabaseAdmin,
    THUMBNAIL_BUCKET,
    thumbnailPath,
    thumbnailBytes,
    "image/jpeg",
  );

  const previewFile = `${tempDir}/preview-${assetId}.mp4`;
  const safeDuration = Number.isFinite(durationSec) && durationSec > 0
    ? durationSec
    : 6;
  const previewSeconds = safeDuration > 8 ? 8 : Math.max(safeDuration, 3);
  await runFfmpeg(
    [
      "-y",
      "-ss",
      "0",
      "-i",
      tempFilePath,
      "-t",
      previewSeconds.toFixed(2),
      "-vf",
      "scale='min(960,iw)':-2",
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "30",
      previewFile,
    ],
    "Failed to generate video preview",
  );
  const previewBytes = await Deno.readFile(previewFile);
  const previewPath = `${assetId}/preview-${Date.now()}.mp4`;
  await uploadFile(
    supabaseAdmin,
    PREVIEW_BUCKET,
    previewPath,
    previewBytes,
    "video/mp4",
  );

  return {
    metadata,
    thumbnailPath,
    thumbnailUrl: buildPublicUrl(THUMBNAIL_BUCKET, thumbnailPath),
    previewPath,
    previewUrl: buildPublicUrl(PREVIEW_BUCKET, previewPath),
  };
}

async function processAudio(
  supabaseAdmin: ReturnType<typeof createClient>,
  tempDir: string,
  tempFilePath: string,
  assetId: string,
): Promise<ProcessingResult> {
  const probe = await probeMedia(tempFilePath);
  const audioStream = probe.streams?.find((s: any) => s.codec_type === "audio");
  const durationSec = Number(audioStream?.duration ?? probe.format?.duration ?? 0);
  const metadata: Metadata = {
    duration_ms: Math.round(durationSec * 1000),
    audio_codec: audioStream?.codec_name,
    channels: audioStream?.channels,
    sample_rate: audioStream?.sample_rate
      ? Number(audioStream.sample_rate)
      : null,
    bitrate: Number(probe.format?.bit_rate ?? audioStream?.bit_rate ?? 0),
    processed_at: new Date().toISOString(),
  };

  const previewFile = `${tempDir}/preview-${assetId}.mp3`;
  const safeDuration = Number.isFinite(durationSec) && durationSec > 0
    ? durationSec
    : 30;
  const previewSeconds = safeDuration > 30 ? 30 : Math.max(safeDuration, 10);
  await runFfmpeg(
    [
      "-y",
      "-i",
      tempFilePath,
      "-t",
      previewSeconds.toFixed(2),
      "-acodec",
      "mp3",
      "-b:a",
      "192k",
      previewFile,
    ],
    "Failed to generate audio preview",
  );
  const previewBytes = await Deno.readFile(previewFile);
  const previewPath = `${assetId}/preview-${Date.now()}.mp3`;
  await uploadFile(
    supabaseAdmin,
    PREVIEW_BUCKET,
    previewPath,
    previewBytes,
    "audio/mpeg",
  );

  return {
    metadata,
    thumbnailPath: null,
    thumbnailUrl: null,
    previewPath,
    previewUrl: buildPublicUrl(PREVIEW_BUCKET, previewPath),
  };
}

serve(async (req) => {
  try {
    // Use service role for background processing
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get pending processing jobs
    const { data: pendingJobs, error: queryError } = await supabaseAdmin
      .from("processing_queue")
      .select(`
        *,
        project_assets (*)
      `)
      .eq("status", "pending")
      .lt("attempts", 3) // Don't retry more than 3 times
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(10);

    if (queryError || !pendingJobs || pendingJobs.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: "No pending jobs" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const job of pendingJobs) {
      const asset = job.project_assets;
      if (!asset) {
        // Mark job as failed if asset not found
        await supabaseAdmin
          .from("processing_queue")
          .update({
            status: "failed",
            error_message: "Asset not found",
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);
        continue;
      }

      try {
        // Update job status to processing
        await supabaseAdmin
          .from("processing_queue")
          .update({
            status: "processing",
            started_at: new Date().toISOString(),
            attempts: job.attempts + 1,
          })
          .eq("id", job.id);

        // Update asset status to processing
        await supabaseAdmin
          .from("project_assets")
          .update({ processing_status: "processing" })
          .eq("id", asset.id);

        // Download file from storage (streamed to disk)
        const { data: fileData, error: downloadError } = await supabaseAdmin
          .storage
          .from(asset.storage_bucket)
          .download(asset.storage_path);

        if (downloadError || !fileData) {
          throw new Error(`Failed to download file: ${downloadError?.message}`);
        }

        const tempDir = await Deno.makeTempDir({ prefix: "asset-proc" });
        const ext = asset.file_name?.split(".").pop() ?? "bin";
        const tempFilePath = `${tempDir}/${asset.id}.${ext}`;
        await streamBlobToFile(fileData, tempFilePath);

        let processingResult: ProcessingResult;

        if (asset.asset_type === "image") {
          processingResult = await processImage(
            supabaseAdmin,
            tempFilePath,
            asset.id,
            asset.mime_type ?? null,
          );
        } else if (asset.asset_type === "video") {
          processingResult = await processVideo(
            supabaseAdmin,
            tempDir,
            tempFilePath,
            asset.id,
          );
        } else if (asset.asset_type === "audio") {
          processingResult = await processAudio(
            supabaseAdmin,
            tempDir,
            tempFilePath,
            asset.id,
          );
        } else {
          const stat = await Deno.stat(tempFilePath);
          processingResult = {
            metadata: {
              file_size: stat.size,
              processed_at: new Date().toISOString(),
            },
            thumbnailPath: null,
            thumbnailUrl: null,
            previewPath: null,
            previewUrl: null,
          };
        }

        let metadata = processingResult.metadata;
        if (metadata) {
          metadata = {
            ...metadata,
            file_size: metadata.file_size ?? (await Deno.stat(tempFilePath)).size,
          };
        }

        // Cleanup temp directory
        try {
          await Deno.remove(tempDir, { recursive: true });
        } catch (cleanupError) {
          console.warn("Failed to cleanup temp dir", cleanupError);
        }

        // Update asset with metadata
        await supabaseAdmin
          .from("project_assets")
          .update({
            processing_status: "completed",
            media_metadata: metadata,
            thumbnail_bucket: processingResult.thumbnailPath
              ? THUMBNAIL_BUCKET
              : null,
            thumbnail_path: processingResult.thumbnailPath,
            thumbnail_url: processingResult.thumbnailUrl,
            preview_bucket: processingResult.previewPath ? PREVIEW_BUCKET : null,
            preview_path: processingResult.previewPath,
            preview_url: processingResult.previewUrl,
          })
          .eq("id", asset.id);

        // Mark job as completed
        await supabaseAdmin
          .from("processing_queue")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        results.push({ id: asset.id, status: "success" });

      } catch (error) {
        console.error(`Error processing asset ${asset.id}:`, error);

        // Update asset with error
        await supabaseAdmin
          .from("project_assets")
          .update({
            processing_status: "failed",
            processing_error: error.message,
          })
          .eq("id", asset.id);

        // Update job with error
        await supabaseAdmin
          .from("processing_queue")
          .update({
            status: job.attempts + 1 >= 3 ? "failed" : "pending",
            error_message: error.message,
            completed_at: job.attempts + 1 >= 3 ? new Date().toISOString() : null,
          })
          .eq("id", job.id);

        results.push({ id: asset.id, status: "failed", error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Worker error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
