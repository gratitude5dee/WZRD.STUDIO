// ============================================================================
// EDGE FUNCTION: create-final-asset
// PURPOSE: Stitch together final project assets (images, videos, audio) using FFMPEG
// ROUTE: POST /functions/v1/create-final-asset
// VERSION: 1.0.0
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const EXPORT_BUCKET = "final-exports";

const decoder = new TextDecoder();

interface Asset {
  id: string;
  type: 'image' | 'video' | 'audio';
  subtype?: 'voiceover' | 'sfx' | 'music' | 'visual';
  url: string;
  duration_ms?: number;
  order_index: number;
  metadata?: Record<string, unknown>;
}

interface RequestBody {
  action?: 'create' | 'status';
  projectId?: string;
  assets?: Asset[];
  jobId?: string;
  settings?: {
    resolution?: string;
    fps?: number;
    codec?: string;
    quality?: string;
    includeAudio?: boolean;
  };
}

async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  await Deno.writeFile(outputPath, new Uint8Array(arrayBuffer));
}

async function runFfmpeg(args: string[], errorLabel: string): Promise<string> {
  try {
    const command = new Deno.Command("ffmpeg", {
      args,
      stdout: "piped",
      stderr: "piped",
    });
    const { code, stdout, stderr } = await command.output();

    if (code !== 0) {
      const errorMsg = decoder.decode(stderr);
      console.error(`${errorLabel}: ${errorMsg}`);
      throw new Error(`${errorLabel}: ${errorMsg || "ffmpeg exited with error"}`);
    }

    return decoder.decode(stdout);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error("FFmpeg binary not available in runtime");
    }
    throw error;
  }
}

async function getMediaDuration(filePath: string): Promise<number> {
  try {
    const command = new Deno.Command("ffprobe", {
      args: [
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        filePath,
      ],
      stdout: "piped",
      stderr: "piped",
    });
    const { stdout } = await command.output();
    const duration = parseFloat(decoder.decode(stdout).trim());
    return isNaN(duration) ? 5 : duration; // Default 5 seconds for images
  } catch {
    return 5; // Default duration
  }
}

async function processAssets(
  supabaseAdmin: ReturnType<typeof createClient>,
  projectId: string,
  assets: Asset[],
  jobId: string,
  tempDir: string,
  settings: RequestBody['settings'] = {}
): Promise<string> {
  const {
    resolution = '1920x1080',
    fps = 30,
    codec = 'libx264',
    quality = '23',
    includeAudio = true,
  } = settings;

  const [width, height] = resolution.split('x').map(Number);

  // Sort assets by order index
  const sortedAssets = [...assets].sort((a, b) => a.order_index - b.order_index);

  // Separate visual and audio assets
  const visualAssets = sortedAssets.filter(a => a.type === 'image' || a.type === 'video');
  const audioAssets = sortedAssets.filter(a => a.type === 'audio');

  // Download all visual assets
  const visualFiles: Array<{ path: string; type: string; duration: number }> = [];

  for (let i = 0; i < visualAssets.length; i++) {
    const asset = visualAssets[i];
    const ext = asset.type === 'video' ? 'mp4' : 'jpg';
    const localPath = `${tempDir}/visual_${i}.${ext}`;

    await downloadFile(asset.url, localPath);

    const duration = asset.type === 'video'
      ? await getMediaDuration(localPath)
      : (asset.duration_ms ? asset.duration_ms / 1000 : 5);

    visualFiles.push({ path: localPath, type: asset.type, duration });

    // Update progress
    const progress = Math.round((i + 1) / visualAssets.length * 30);
    await supabaseAdmin
      .from('export_jobs')
      .update({ progress, status: 'processing' })
      .eq('id', jobId);
  }

  // Download all audio assets
  const audioFiles: Array<{ path: string; subtype: string; duration: number }> = [];

  if (includeAudio) {
    for (let i = 0; i < audioAssets.length; i++) {
      const asset = audioAssets[i];
      const localPath = `${tempDir}/audio_${i}.mp3`;

      await downloadFile(asset.url, localPath);
      const duration = await getMediaDuration(localPath);

      audioFiles.push({
        path: localPath,
        subtype: asset.subtype || 'music',
        duration,
      });
    }
  }

  // Update progress
  await supabaseAdmin
    .from('export_jobs')
    .update({ progress: 40, status: 'processing' })
    .eq('id', jobId);

  // Create concat file for visual assets
  const concatFilePath = `${tempDir}/concat.txt`;
  let concatContent = '';

  for (let i = 0; i < visualFiles.length; i++) {
    const file = visualFiles[i];

    if (file.type === 'image') {
      // Convert image to video segment
      const segmentPath = `${tempDir}/segment_${i}.mp4`;
      await runFfmpeg([
        '-y',
        '-loop', '1',
        '-i', file.path,
        '-t', file.duration.toString(),
        '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`,
        '-c:v', codec,
        '-pix_fmt', 'yuv420p',
        '-r', fps.toString(),
        segmentPath,
      ], `Failed to convert image ${i}`);
      concatContent += `file '${segmentPath}'\n`;
    } else {
      // Scale video to target resolution
      const scaledPath = `${tempDir}/scaled_${i}.mp4`;
      await runFfmpeg([
        '-y',
        '-i', file.path,
        '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`,
        '-c:v', codec,
        '-crf', quality,
        '-c:a', 'aac',
        '-r', fps.toString(),
        scaledPath,
      ], `Failed to scale video ${i}`);
      concatContent += `file '${scaledPath}'\n`;
    }

    // Update progress
    const progress = 40 + Math.round((i + 1) / visualFiles.length * 30);
    await supabaseAdmin
      .from('export_jobs')
      .update({ progress })
      .eq('id', jobId);
  }

  await Deno.writeTextFile(concatFilePath, concatContent);

  // Concatenate visual segments
  const visualOutputPath = `${tempDir}/visual_concat.mp4`;
  await runFfmpeg([
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatFilePath,
    '-c', 'copy',
    visualOutputPath,
  ], 'Failed to concatenate visual segments');

  // Update progress
  await supabaseAdmin
    .from('export_jobs')
    .update({ progress: 80 })
    .eq('id', jobId);

  // Get total video duration
  const totalDuration = await getMediaDuration(visualOutputPath);

  // Final output path
  const finalOutputPath = `${tempDir}/final_output.mp4`;

  // If we have audio, mix it with the video
  if (audioFiles.length > 0) {
    // Build filter complex for audio mixing
    const audioInputs = audioFiles.map((_, i) => `-i ${audioFiles[i].path}`).join(' ');
    const audioFilterParts: string[] = [];

    // Mix different audio types with different volumes
    audioFiles.forEach((audio, i) => {
      const volume = audio.subtype === 'voiceover' ? 1.0
        : audio.subtype === 'music' ? 0.3
        : 0.5; // sfx
      audioFilterParts.push(`[${i + 1}:a]volume=${volume}[a${i}]`);
    });

    const mixInputs = audioFiles.map((_, i) => `[a${i}]`).join('');
    const filterComplex = audioFilterParts.join(';') +
      `;${mixInputs}amix=inputs=${audioFiles.length}:duration=longest[aout]`;

    // Build final ffmpeg command with audio
    const ffmpegArgs = [
      '-y',
      '-i', visualOutputPath,
      ...audioFiles.flatMap(a => ['-i', a.path]),
      '-filter_complex', filterComplex,
      '-map', '0:v',
      '-map', '[aout]',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      finalOutputPath,
    ];

    await runFfmpeg(ffmpegArgs, 'Failed to mix audio');
  } else {
    // No audio, just copy the concatenated video
    await Deno.copyFile(visualOutputPath, finalOutputPath);
  }

  // Update progress
  await supabaseAdmin
    .from('export_jobs')
    .update({ progress: 90 })
    .eq('id', jobId);

  // Upload final output to storage
  const finalBytes = await Deno.readFile(finalOutputPath);
  const outputFileName = `${projectId}/${jobId}/final_export_${Date.now()}.mp4`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(EXPORT_BUCKET)
    .upload(outputFileName, finalBytes, {
      contentType: 'video/mp4',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload final video: ${uploadError.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(EXPORT_BUCKET)
    .getPublicUrl(outputFileName);

  return publicUrl;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body: RequestBody = await req.json();
    const { action = 'create', projectId, assets, jobId, settings } = body;

    // Handle status check
    if (action === 'status' && jobId) {
      const { data: job, error } = await supabaseAdmin
        .from('export_jobs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single();

      if (error || !job) {
        return new Response(JSON.stringify({ error: 'Job not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        status: job.status,
        progress: job.progress,
        outputUrl: job.output_url,
        error: job.error_message,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate request for create action
    if (!projectId || !assets || assets.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing projectId or assets' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project || project.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Project not found or access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create export job
    const { data: job, error: jobError } = await supabaseAdmin
      .from('export_jobs')
      .insert({
        project_id: projectId,
        user_id: user.id,
        status: 'processing',
        progress: 0,
        settings,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError || !job) {
      throw new Error(`Failed to create export job: ${jobError?.message}`);
    }

    // Process assets in the background
    const tempDir = await Deno.makeTempDir({ prefix: 'export-' });

    // Start processing (this would ideally be done in a background worker)
    // For now, we process synchronously
    try {
      const outputUrl = await processAssets(
        supabaseAdmin,
        projectId,
        assets,
        job.id,
        tempDir,
        settings
      );

      // Update job as completed
      await supabaseAdmin
        .from('export_jobs')
        .update({
          status: 'completed',
          progress: 100,
          output_url: outputUrl,
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      // Cleanup temp directory
      try {
        await Deno.remove(tempDir, { recursive: true });
      } catch {
        console.warn('Failed to cleanup temp directory');
      }

      return new Response(JSON.stringify({
        status: 'completed',
        jobId: job.id,
        outputUrl,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update job as failed
      await supabaseAdmin
        .from('export_jobs')
        .update({
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      // Cleanup temp directory
      try {
        await Deno.remove(tempDir, { recursive: true });
      } catch {
        console.warn('Failed to cleanup temp directory');
      }

      throw error;
    }

  } catch (error) {
    console.error('Error in create-final-asset:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
