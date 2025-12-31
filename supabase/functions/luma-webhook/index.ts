import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  let lumaJobId: string | null = null;
  let generationId: string | null = null;
  let shotId: string | null = null;

  try {
    // Parse the webhook payload
    const payload = await req.json();
    lumaJobId = payload.id || null;
    
    console.log(`[Luma Webhook] Received webhook for Luma job ID: ${lumaJobId || 'UNKNOWN'}`);
    console.log(`[Luma Webhook] Payload:`, JSON.stringify(payload, null, 2));

    // Validate the webhook payload
    if (!lumaJobId || !payload.status) {
      console.error("[Luma Webhook] Invalid webhook payload:", payload);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid webhook payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the generation record for this Luma job
    console.log(`[Luma Webhook][${lumaJobId}] Looking up generation record...`);
    const { data: generation, error: genError } = await supabase
      .from("generations")
      .select("id, user_id, project_id, shot_id, api_provider")
      .eq("external_request_id", lumaJobId)
      .maybeSingle(); // Use maybeSingle to handle the case where no record is found

    if (genError) {
      console.error(`[Luma Webhook][${lumaJobId}] Error finding generation record:`, genError);
      return new Response(
        JSON.stringify({ success: false, error: "Error finding generation record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!generation) {
      // Important: Return 200 OK even if not found, so Luma doesn't keep retrying
      console.warn(`[Luma Webhook][${lumaJobId}] Generation record not found. Acknowledging webhook.`);
      return new Response(
        JSON.stringify({ success: true, message: "Generation not found, webhook acknowledged" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    generationId = generation.id;
    shotId = generation.shot_id;

    console.log(`[Luma Webhook][Gen ${generationId} / Shot ${shotId}] Processing webhook with status: ${payload.status}`);

    // Map Luma status to our status
    let status = "pending";
    if (payload.status === "completed") {
      status = "completed";
    } else if (payload.status === "failed") {
      status = "failed";
    } else if (payload.status === "started") {
      status = "dreaming";
    } else if (payload.status === "queued") {
      status = "submitted";
    }

    // Update the generation record
    const updateData: Record<string, any> = {
      status,
      callback_received_at: new Date().toISOString(),
    };

    // Handle failures
    if (status === "failed") {
      updateData.failure_reason = payload.failure_reason || "Unknown error";
      
      // Update the shot status as well
      if (generation.api_provider === "luma_image") {
        console.log(`[Luma Webhook][Shot ${shotId}] Updating shot status to 'failed' due to Luma failure.`);
        const { error: shotUpdateError } = await supabase
          .from("shots")
          .update({ 
            image_status: "failed",
            failure_reason: updateData.failure_reason
          })
          .eq("id", generation.shot_id);
          
        if (shotUpdateError) {
          console.error(`[Luma Webhook][Shot ${shotId}] Error updating shot status to failed: ${shotUpdateError.message}`);
        } else {
          console.log(`[Luma Webhook][Shot ${shotId}] Shot status updated to failed.`);
        }
      }
    }

    // Handle successful completions
    if (status === "completed" && payload.output) {
      // For image generation
      if (generation.api_provider === "luma_image" && payload.output.images && payload.output.images[0]) {
        const imageUrl = payload.output.images[0];
        console.log(`[Luma Webhook][Shot ${shotId}] Image completed. URL: ${imageUrl}`);
        
        // Create a media asset entry
        console.log(`[Luma Webhook][Shot ${shotId}] Creating media asset record...`);
        const { data: mediaAsset, error: mediaError } = await supabase
          .from("media_assets")
          .insert({
            user_id: generation.user_id,
            project_id: generation.project_id,
            cdn_url: imageUrl,
            file_name: `luma_image_${payload.id}.png`,
            mime_type: "image/png",
            asset_type: "image",
            purpose: "generation_result"
          })
          .select()
          .single();
          
        if (mediaError) {
          console.error(`[Luma Webhook][Shot ${shotId}] Error creating media asset: ${mediaError.message}`);
        } else {
          console.log(`[Luma Webhook][Shot ${shotId}] Media asset created with ID: ${mediaAsset.id}`);
          updateData.result_media_asset_id = mediaAsset.id;
          
          // Update the shot with the new image URL
          console.log(`[Luma Webhook][Shot ${shotId}] Updating shot with image URL and status 'completed'...`);
          const { error: shotUpdateError } = await supabase
            .from("shots")
            .update({ 
              image_url: imageUrl,
              image_status: "completed",
              failure_reason: null // Clear any failure reason on success
            })
            .eq("id", generation.shot_id);
            
          if (shotUpdateError) {
            console.error(`[Luma Webhook][Shot ${shotId}] Error updating shot with image URL: ${shotUpdateError.message}`);
          } else {
            console.log(`[Luma Webhook][Shot ${shotId}] Shot updated with image URL.`);
          }
        }
      } else if (generation.api_provider === "luma_image") {
        console.warn(`[Luma Webhook][Shot ${shotId}] Luma reported 'completed' but no image URL found in payload.`);
        // Override the status to failed
        status = "failed";
        updateData.status = status;
        updateData.failure_reason = "Luma completed without providing an image URL";
        
        // Update the shot status to failed
        const { error: shotUpdateError } = await supabase
          .from("shots")
          .update({ 
            image_status: "failed",
            failure_reason: updateData.failure_reason
          })
          .eq("id", generation.shot_id);
          
        if (shotUpdateError) {
          console.error(`[Luma Webhook][Shot ${shotId}] Error updating shot status to failed: ${shotUpdateError.message}`);
        } else {
          console.log(`[Luma Webhook][Shot ${shotId}] Shot status updated to failed due to missing image URL.`);
        }
      }
      
      // For video generation
      if (generation.api_provider === "luma_video" && payload.output.videos && payload.output.videos[0]) {
        const videoUrl = payload.output.videos[0];
        console.log(`[Luma Webhook][Shot ${shotId}] Video completed. URL: ${videoUrl}`);
        
        // Create a media asset entry
        console.log(`[Luma Webhook][Shot ${shotId}] Creating video media asset record...`);
        const { data: mediaAsset, error: mediaError } = await supabase
          .from("media_assets")
          .insert({
            user_id: generation.user_id,
            project_id: generation.project_id,
            cdn_url: videoUrl,
            file_name: `luma_video_${payload.id}.mp4`,
            mime_type: "video/mp4",
            asset_type: "video",
            purpose: "generation_result"
          })
          .select()
          .single();
          
        if (mediaError) {
          console.error(`[Luma Webhook][Shot ${shotId}] Error creating video media asset: ${mediaError.message}`);
        } else {
          console.log(`[Luma Webhook][Shot ${shotId}] Video media asset created with ID: ${mediaAsset.id}`);
          updateData.result_media_asset_id = mediaAsset.id;
          
          // Note: You could update the shot with the video URL here if needed
        }
      }
    }

    // Update the generation record
    console.log(`[Luma Webhook][Gen ${generationId}] Updating generation record with status: ${status}`);
    const { error: updateError } = await supabase
      .from("generations")
      .update(updateData)
      .eq("id", generation.id);

    if (updateError) {
      console.error(`[Luma Webhook][Gen ${generationId}] Error updating generation: ${updateError.message}`);
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Luma Webhook][Gen ${generationId}] Webhook processing completed successfully.`);
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error(`[Luma Webhook][${lumaJobId || 'UNKNOWN'}] Unexpected error: ${errorMessage}`, errorStack);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
