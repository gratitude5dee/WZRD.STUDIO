import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map aspect ratios to Fal.ai image sizes
function getImageSizeFromAspectRatio(aspectRatio: string): string {
  switch (aspectRatio) {
    case "16:9":
      return "landscape_16_9";
    case "9:16":
      return "portrait_9_16";
    case "1:1":
      return "square";
    case "4:3":
      return "landscape_4_3";
    case "3:4":
      return "portrait_3_4";
    default:
      return "landscape_16_9"; // Default landscape
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
    
    if (!shotId) {
      console.error("[generate-shot-image] Missing shot_id in request");
      return new Response(
        JSON.stringify({ success: false, error: "Missing shot ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-shot-image][Shot ${shotId}] Request received.`);

    // Check if FAL_KEY is configured
    const falKey = Deno.env.get("FAL_KEY");
    if (!falKey) {
      console.error(`[generate-shot-image][Shot ${shotId}] FAL_KEY is not configured`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Fal.ai API key is not configured. Please set the FAL_KEY in your Supabase project settings." 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    console.log(`[generate-shot-image][Shot ${shotId}] Starting image generation process.`);

    // Update shot status to generating
    console.log(`[generate-shot-image][Shot ${shotId}] Updating status to 'generating'.`);
    const { error: statusUpdateError } = await supabase
      .from("shots")
      .update({ 
        image_status: "generating",
        failure_reason: null // Clear any previous failure reason
      })
      .eq("id", shotId);
      
    if (statusUpdateError) {
      console.error(`[generate-shot-image][Shot ${shotId}] Failed to update status: ${statusUpdateError.message}`);
      // Continue anyway as this is not critical for the actual generation
    }

    console.log(`[generate-shot-image][Shot ${shotId}] Status updated to 'generating'. Visual prompt: ${shot.visual_prompt.substring(0, 60)}...`);

    // Get the user information to associate the generation with
    console.log(`[generate-shot-image][Shot ${shotId}] Getting user information...`);
    const { data: authData, error: authError } = await supabase.auth.getUser(
      req.headers.get("Authorization")?.split("Bearer ")[1] || ""
    );

    if (authError || !authData.user) {
      console.error(`[generate-shot-image][Shot ${shotId}] Error getting user: ${authError?.message}`);
      return new Response(
        JSON.stringify({ success: false, error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get project's aspect ratio (default to 16:9 if not found)
    console.log(`[generate-shot-image][Shot ${shotId}] Fetching project data for aspect ratio...`);
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("aspect_ratio")
      .eq("id", shot.project_id)
      .single();

    if (projectError) {
      console.warn(`[generate-shot-image][Shot ${shotId}] Error fetching project: ${projectError.message}, using default aspect ratio.`);
    }

    const aspectRatio = project?.aspect_ratio || "16:9";
    const imageSize = getImageSizeFromAspectRatio(aspectRatio);
    console.log(`[generate-shot-image][Shot ${shotId}] Using aspect ratio: ${aspectRatio}, image size: ${imageSize}`);

    try {
      // Generate image using Fal.ai's flux-schnell model
      console.log(`[generate-shot-image][Shot ${shotId}] Calling Fal.ai for image generation...`);
      
      const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: shot.visual_prompt,
          image_size: imageSize,
          num_inference_steps: 4,
          num_images: 1,
          enable_safety_checker: true
        }),
      });

      const responseText = await response.text();
      console.log(`[generate-shot-image][Shot ${shotId}] Fal.ai response status: ${response.status}`);

      if (!response.ok) {
        console.error(`[generate-shot-image][Shot ${shotId}] Fal.ai API error: ${responseText}`);
        throw new Error(`Fal.ai API error (${response.status}): ${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log(`[generate-shot-image][Shot ${shotId}] Fal.ai generation successful`);

      // Fal.ai returns image URLs directly
      if (result.images && result.images[0] && result.images[0].url) {
        const imageUrl = result.images[0].url;
        
        // Download the image from Fal.ai and upload to Supabase storage
        console.log(`[generate-shot-image][Shot ${shotId}] Downloading image from Fal.ai...`);
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to download image from Fal.ai: ${imageResponse.status}`);
        }
        
        const imageBuffer = await imageResponse.arrayBuffer();
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

        // Update shot with the generated image
        const { error: updateError } = await supabase
          .from("shots")
          .update({ 
            image_url: publicUrl,
            image_status: "completed"
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
      } else {
        throw new Error('No image data returned from Fal.ai');
      }

    } catch (error) {
      console.error(`[generate-shot-image][Shot ${shotId}] Error in Fal.ai generation: ${error.message}`);
      
      // Update shot status to failed
      console.log(`[generate-shot-image][Shot ${shotId}] Updating status to 'failed' due to error.`);
      await supabase
        .from("shots")
        .update({ 
          image_status: "failed",
          failure_reason: error.message
        })
        .eq("id", shotId);
        
      console.log(`[generate-shot-image][Shot ${shotId}] Status updated to 'failed' with reason: ${error.message}`);

      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error(`[generate-shot-image][Shot ${shotId || 'UNKNOWN'}] Unexpected error: ${error.message}`, error.stack);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});