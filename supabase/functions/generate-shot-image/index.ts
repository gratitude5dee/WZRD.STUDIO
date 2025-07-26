import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initiateLumaImageGeneration } from "../_shared/luma.ts";

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

    // Check if LUMA_API_KEY is configured
    const lumaApiKey = Deno.env.get("LUMA_API_KEY");
    if (!lumaApiKey) {
      console.error(`[generate-shot-image][Shot ${shotId}] LUMA_API_KEY is not configured`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Luma API key is not configured. Please set the LUMA_API_KEY in your Supabase project settings." 
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
    console.log(`[generate-shot-image][Shot ${shotId}] Using aspect ratio: ${aspectRatio}`);

    try {
      // Call the helper function to initiate the Luma image generation
      console.log(`[generate-shot-image][Shot ${shotId}] Calling initiateLumaImageGeneration...`);
      
      const result = await initiateLumaImageGeneration({
        supabase,
        userId: authData.user.id,
        shotId: shotId,
        projectId: shot.project_id,
        prompt: shot.visual_prompt,
        aspectRatio
      });

      console.log(`[generate-shot-image][Shot ${shotId}] Luma image generation initiated successfully:`, result);
      return new Response(
        JSON.stringify({ success: true, ...result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error(`[generate-shot-image][Shot ${shotId}] Error in generate-shot-image: ${error.message}`);
      
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