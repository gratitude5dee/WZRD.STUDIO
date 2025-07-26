import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { executeFalModel } from '../_shared/falai-client.ts';

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
      return "1344x768";
    case "9:16":
      return "768x1344";
    case "1:1":
      return "1024x1024";
    case "4:3":
      return "1152x896";
    case "3:4":
      return "896x1152";
    default:
      return "1024x1024"; // Default square
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
    const falApiKey = Deno.env.get("FAL_KEY");
    if (!falApiKey) {
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
      // Generate image using Fal.ai FLUX.1 [dev] - reliable and fast model
      console.log(`[generate-shot-image][Shot ${shotId}] Calling Fal.ai for image generation...`);
      
      const falResponse = await executeFalModel('fal-ai/flux/dev', {
        prompt: shot.visual_prompt,
        image_size: imageSize,
        num_inference_steps: 28, // Standard for flux/dev model
        guidance_scale: 3.5, // Standard guidance for flux/dev
        num_images: 1,
        enable_safety_checker: true
      });

      console.log(`[generate-shot-image][Shot ${shotId}] Fal.ai response:`, falResponse);

      if (!falResponse.success) {
        throw new Error(falResponse.error || 'Fal.ai generation failed');
      }

      // Handle both sync and async responses
      if (falResponse.data) {
        // Synchronous response with immediate result
        const imageUrl = falResponse.data.images?.[0]?.url;
        if (imageUrl) {
          // Update shot with the generated image
          const { error: updateError } = await supabase
            .from("shots")
            .update({ 
              image_url: imageUrl,
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
              image_url: imageUrl,
              status: "completed"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          throw new Error('No image URL returned from Fal.ai');
        }
      } else if (falResponse.request_id) {
        // Asynchronous response - store request ID for polling
        const { error: updateError } = await supabase
          .from("shots")
          .update({ 
            luma_generation_id: falResponse.request_id, // Reuse this field for Fal.ai request ID
            image_status: "generating"
          })
          .eq("id", shotId);

        if (updateError) {
          console.error(`[generate-shot-image][Shot ${shotId}] Failed to update shot with request ID: ${updateError.message}`);
          throw new Error(`Failed to update shot: ${updateError.message}`);
        }

        console.log(`[generate-shot-image][Shot ${shotId}] Async generation started with request ID: ${falResponse.request_id}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            request_id: falResponse.request_id,
            status: "generating"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        throw new Error('Invalid response from Fal.ai - no data or request_id');
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