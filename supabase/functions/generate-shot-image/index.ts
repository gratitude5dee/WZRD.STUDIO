
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fal } from "https://esm.sh/@fal-ai/client@1.2.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configure FAL client
fal.config({
  credentials: Deno.env.get('FAL_KEY')
});

// Convert image size string to FAL.AI format
function convertImageSizeToFalFormat(imageSize: string): { width: number; height: number } | string {
  const dimensions = imageSize.split('x');
  if (dimensions.length !== 2) {
    return "landscape_4_3"; // Default fallback
  }
  
  const width = parseInt(dimensions[0]);
  const height = parseInt(dimensions[1]);
  
  // Check for standard sizes that have enum values
  if (width === 1024 && height === 1024) return "square_hd";
  if (width === 1536 && height === 1024) return "landscape_16_9";
  if (width === 1024 && height === 1536) return "portrait_16_9";
  if (width === 1152 && height === 1024) return "landscape_4_3";
  if (width === 1024 && height === 1152) return "portrait_4_3";
  
  // For custom sizes, return width/height object
  return { width, height };
}

// Map aspect ratios to image sizes for backwards compatibility
function getImageSizeFromAspectRatio(aspectRatio: string): string {
  switch (aspectRatio) {
    case "16:9":
      return "1536x1024"; // Landscape 16:9
    case "9:16":
      return "1024x1536"; // Portrait 9:16
    case "1:1":
      return "1024x1024"; // Square
    case "4:3":
      return "1152x1024"; // Landscape 4:3
    case "3:4":
      return "1024x1152"; // Portrait 3:4
    default:
      return "1536x1024"; // Default landscape 16:9
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  let shotId: string | null = null;
  try {
    const body = await req.json();
    shotId = body.shot_id;
    const styleReferenceOverride = body.style_reference_url;
    
    if (!shotId) {
      console.error("[generate-shot-image] Missing shot_id in request");
      return new Response(
        JSON.stringify({ success: false, error: "Missing shot ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-shot-image][Shot ${shotId}] Request received.`);

    // Get shot information including the visual prompt
    console.log(`[generate-shot-image][Shot ${shotId}] Fetching shot data...`);
    const { data: shot, error: shotError } = await supabase
      .from("shots")
      .select("id, project_id, visual_prompt, image_status")
      .eq("id", shotId)
      .single();

    if (shotError || !shot) {
      console.error(`[generate-shot-image][Shot ${shotId}] Error fetching shot: ${shotError?.message}`);
      return new Response(
        JSON.stringify({ success: false, error: shotError?.message || "Shot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if shot already has a visual prompt
    if (!shot.visual_prompt || shot.visual_prompt.trim() === "") {
      console.error(`[generate-shot-image][Shot ${shotId}] Visual prompt is missing or empty.`);
      return new Response(
        JSON.stringify({ success: false, error: "Shot doesn't have a visual prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-shot-image][Shot ${shotId}] Starting image generation with streaming.`);

    // Update shot status to generating immediately (instant UI feedback)
    console.log(`[generate-shot-image][Shot ${shotId}] Updating status to 'generating' with progress 0.`);
    const { error: statusUpdateError } = await supabase
      .from("shots")
      .update({ 
        image_status: "generating",
        image_progress: 0,
        failure_reason: null // Clear any previous failure reason
      })
      .eq("id", shotId);
      
    if (statusUpdateError) {
      console.error(`[generate-shot-image][Shot ${shotId}] Failed to update status: ${statusUpdateError.message}`);
    }

    // Get project's aspect ratio (default to 16:9 if not found)
    console.log(`[generate-shot-image][Shot ${shotId}] Fetching project data for aspect ratio...`);
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("aspect_ratio, style_reference_asset_id")
      .eq("id", shot.project_id)
      .single();

    if (projectError) {
      console.warn(`[generate-shot-image][Shot ${shotId}] Error fetching project: ${projectError.message}, using default aspect ratio.`);
    }

    const aspectRatio = project?.aspect_ratio || "16:9";
    const imageSize = getImageSizeFromAspectRatio(aspectRatio);
    const falImageSize = convertImageSizeToFalFormat(imageSize);
    console.log(`[generate-shot-image][Shot ${shotId}] Using aspect ratio: ${aspectRatio}, FAL image size:`, falImageSize);

    let styleReferenceUrl: string | undefined = styleReferenceOverride || undefined;
    if (!styleReferenceUrl && project?.style_reference_asset_id) {
      const { data: mediaItem, error: mediaError } = await supabase
        .from("media_items")
        .select("url, storage_bucket, storage_path")
        .eq("id", project.style_reference_asset_id)
        .single();

      if (!mediaError && mediaItem) {
        styleReferenceUrl =
          mediaItem.url ||
          (mediaItem.storage_bucket && mediaItem.storage_path
            ? `${supabaseUrl}/storage/v1/object/public/${mediaItem.storage_bucket}/${mediaItem.storage_path}`
            : undefined);
      }
    }

    try {
      // Use FAL.AI subscribe with onQueueUpdate for real-time progress
      console.log(`[generate-shot-image][Shot ${shotId}] Starting FAL.AI generation with FLUX Schnell...`);
      
      let lastProgress = 0;
      
      const falInput: { prompt: string; image_size: typeof falImageSize; num_inference_steps: number; num_images: number; enable_safety_checker: boolean; ip_adapter_style_reference?: string; style_strength?: number } = {
        prompt: shot.visual_prompt,
        image_size: falImageSize,
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      };

      if (styleReferenceUrl) {
        falInput.ip_adapter_style_reference = styleReferenceUrl;
        falInput.style_strength = 0.6;
      }

      const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: falInput as any,
        logs: true,
        onQueueUpdate: async (update) => {
          console.log(`[generate-shot-image][Shot ${shotId}] Queue update: ${update.status}`);
          
          let progress = 0;
          if (update.status === 'IN_QUEUE') {
            progress = 10;
            console.log(`[generate-shot-image][Shot ${shotId}] In queue, position: ${(update as any).position || 'unknown'}`);
          } else if (update.status === 'IN_PROGRESS') {
            progress = 50;
            // Log any progress messages from the model
            if ((update as any).logs) {
              (update as any).logs.forEach((log: any) => {
                console.log(`[generate-shot-image][Shot ${shotId}] Log: ${log.message}`);
              });
            }
          } else if (update.status === 'COMPLETED') {
            progress = 85;
          }
          
          // Update DB if progress increased
          if (progress > lastProgress) {
            lastProgress = progress;
            console.log(`[generate-shot-image][Shot ${shotId}] Updating progress to ${progress}%`);
            await supabase
              .from("shots")
              .update({ image_progress: progress })
              .eq("id", shotId);
          }
        },
      });

      console.log(`[generate-shot-image][Shot ${shotId}] Generation completed, result received`);

      // Access image URL from result (fal.subscribe returns the result directly)
      const resultData = result as { images?: Array<{ url: string }>; data?: { images?: Array<{ url: string }> } };
      const imageUrl = resultData?.images?.[0]?.url || resultData?.data?.images?.[0]?.url;
      if (!imageUrl) {
        throw new Error('No image URL returned from FAL.AI');
      }

      // Update progress to 90% before download/upload
      await supabase
        .from("shots")
        .update({ image_progress: 90, style_reference_used: !!styleReferenceUrl })
        .eq("id", shotId);

      console.log(`[generate-shot-image][Shot ${shotId}] Image generated successfully, downloading and uploading to storage...`);

      // Download the image from FAL.AI
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image from FAL.AI: ${imageResponse.status}`);
      }
      
      const imageBuffer = new Uint8Array(await imageResponse.arrayBuffer());
      const fileName = `shot-${shotId}-${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('workflow-media')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        console.error(`[generate-shot-image][Shot ${shotId}] Failed to upload image: ${uploadError.message}`);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('workflow-media')
        .getPublicUrl(fileName);

      // Update shot with the generated image and 100% progress
      const { error: updateError } = await supabase
        .from("shots")
        .update({ 
          image_url: publicUrl,
          image_status: "completed",
          image_progress: 100
        })
        .eq("id", shotId);

      if (updateError) {
        console.error(`[generate-shot-image][Shot ${shotId}] Failed to update shot with image: ${updateError.message}`);
        throw new Error(`Failed to update shot: ${updateError.message}`);
      }

      console.log(`[generate-shot-image][Shot ${shotId}] Image generation completed successfully`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          image_url: publicUrl,
          status: "completed"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error(`[generate-shot-image][Shot ${shotId}] Error in image generation: ${errorMsg}`);
      
      // Update shot status to failed
      console.log(`[generate-shot-image][Shot ${shotId}] Updating status to 'failed' due to error.`);
      await supabase
        .from("shots")
        .update({ 
          image_status: "failed",
          image_progress: 0,
          failure_reason: errorMsg
        })
        .eq("id", shotId);
        
      console.log(`[generate-shot-image][Shot ${shotId}] Status updated to 'failed' with reason: ${errorMsg}`);

      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error(`[generate-shot-image][Shot ${shotId || 'UNKNOWN'}] Unexpected error: ${errorMsg}`, errorStack);
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
