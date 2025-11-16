// ============================================================================
// EDGE FUNCTION: asset-processor
// PURPOSE: Background job to process uploaded assets (thumbnails, metadata)
// ROUTE: POST /functions/v1/asset-processor (invoked by cron or queue)
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

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

        // Download file from storage
        const { data: fileData, error: downloadError } = await supabaseAdmin
          .storage
          .from(asset.storage_bucket)
          .download(asset.storage_path);

        if (downloadError || !fileData) {
          throw new Error(`Failed to download file: ${downloadError?.message}`);
        }

        const metadata: any = {};
        let thumbnailPath: string | null = null;
        let thumbnailUrl: string | null = null;

        // Process based on asset type
        if (asset.asset_type === "image") {
          // Extract basic image metadata
          // Note: For production, you would use a proper image processing library
          // This is a simplified version
          const arrayBuffer = await fileData.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);

          // Basic metadata extraction (simplified)
          metadata.file_size = bytes.length;
          metadata.processed_at = new Date().toISOString();

          // For images, create a simple thumbnail placeholder
          // In production, you would use sharp or similar library
          // For now, we'll just mark it as processed
          metadata.has_thumbnail = false;

        } else if (asset.asset_type === "video") {
          // For video, extract metadata
          // This is a placeholder - actual implementation requires FFmpeg
          const arrayBuffer = await fileData.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);

          metadata.file_size = bytes.length;
          metadata.duration_ms = 0;
          metadata.fps = 30;
          metadata.codec = "unknown";
          metadata.processed_at = new Date().toISOString();

        } else if (asset.asset_type === "audio") {
          // Extract audio metadata
          const arrayBuffer = await fileData.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);

          metadata.file_size = bytes.length;
          metadata.duration_ms = 0;
          metadata.channels = 2;
          metadata.sample_rate = 48000;
          metadata.processed_at = new Date().toISOString();

        } else {
          // Generic processing
          const arrayBuffer = await fileData.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);

          metadata.file_size = bytes.length;
          metadata.processed_at = new Date().toISOString();
        }

        // Update asset with metadata
        await supabaseAdmin
          .from("project_assets")
          .update({
            processing_status: "completed",
            media_metadata: metadata,
            thumbnail_bucket: thumbnailPath ? "asset-thumbnails" : null,
            thumbnail_path: thumbnailPath,
            thumbnail_url: thumbnailUrl,
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
