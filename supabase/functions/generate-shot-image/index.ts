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

// Map aspect ratios to OpenAI image sizes
function getImageSizeFromAspectRatio(aspectRatio: string): string {
  switch (aspectRatio) {
    case "16:9":
      return "1536x1024";
    case "9:16":
      return "1024x1536";
    case "1:1":
      return "1024x1024";
    case "4:3":
    case "3:4":
      return "1024x1024"; // OpenAI doesn't support these ratios, use square
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

    // Check if OPENAI_API_KEY is configured
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error(`[generate-shot-image][Shot ${shotId}] OPENAI_API_KEY is not configured`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "OpenAI API key is not configured. Please set the OPENAI_API_KEY in your Supabase project settings." 
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
      // Generate image using OpenAI's gpt-image-1 model
      console.log(`[generate-shot-image][Shot ${shotId}] Calling OpenAI for image generation...`);
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: shot.visual_prompt,
          size: imageSize,
          quality: 'high',
          output_format: 'png',
          n: 1
        }),
      });

      const responseText = await response.text();
      console.log(`[generate-shot-image][Shot ${shotId}] OpenAI response status: ${response.status}`);

      if (!response.ok) {
        console.error(`[generate-shot-image][Shot ${shotId}] OpenAI API error: ${responseText}`);
        throw new Error(`OpenAI API error (${response.status}): ${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log(`[generate-shot-image][Shot ${shotId}] OpenAI generation successful`);

      // OpenAI gpt-image-1 returns base64 data, we need to convert it to a URL
      if (result.data && result.data[0] && result.data[0].b64_json) {
        const base64Data = result.data[0].b64_json;
        
        // Upload the base64 image to Supabase storage
        const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
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
        throw new Error('No image data returned from OpenAI');
      }

    } catch (error) {
      console.error(`[generate-shot-image][Shot ${shotId}] Error in OpenAI generation: ${error.message}`);
      
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