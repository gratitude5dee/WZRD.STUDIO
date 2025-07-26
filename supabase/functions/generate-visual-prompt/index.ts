
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getVisualPromptSystemPrompt, getVisualPromptUserPrompt } from '../_shared/prompts.ts';

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
      console.error("[generate-visual-prompt] Missing shot_id in request");
      return new Response(
        JSON.stringify({ success: false, error: "Missing shot ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-visual-prompt][Shot ${shotId}] Request received.`);

    // Get shot information including the prompt idea, scene info, and project details
    console.log(`[generate-visual-prompt][Shot ${shotId}] Fetching shot, scene, and project data...`);
    const { data: shot, error: shotError } = await supabase
      .from("shots")
      .select(`
        id, 
        project_id,
        scene_id,
        shot_type,
        prompt_idea,
        scenes!inner(
          description,
          location,
          lighting,
          weather
        ),
        projects!inner(
          genre,
          tone,
          video_style,
          cinematic_inspiration
        )
      `)
      .eq("id", shotId)
      .single();

    if (shotError || !shot) {
      console.error(`[generate-visual-prompt][Shot ${shotId}] Error fetching shot: ${shotError?.message}`);
      return new Response(
        JSON.stringify({ success: false, error: shotError?.message || "Shot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-visual-prompt][Shot ${shotId}] Data fetched successfully.`);

    // Generate visual prompt using Groq
    const systemPrompt = getVisualPromptSystemPrompt();
    const userPrompt = getVisualPromptUserPrompt(
      shot.prompt_idea,
      shot.shot_type,
      {
        description: shot.scenes.description,
        location: shot.scenes.location,
        lighting: shot.scenes.lighting,
        weather: shot.scenes.weather
      },
      {
        genre: shot.projects.genre,
        tone: shot.projects.tone,
        video_style: shot.projects.video_style,
        cinematic_inspiration: shot.projects.cinematic_inspiration
      }
    );

    console.log(`[generate-visual-prompt][Shot ${shotId}] Calling Groq for visual prompt generation...`);
    
    // Call Groq via the groq-chat Edge Function
    const { data: groqResponse, error: groqError } = await supabase.functions.invoke('groq-chat', {
      body: {
        prompt: userPrompt,
        systemPrompt: systemPrompt,
        model: 'llama3-8b-8192', // Using the faster model since this is a simpler task
        temperature: 0.7,
        maxTokens: 200 // Visual prompts should be concise
      },
      headers: {
        'x-internal-request': 'true'
      }
    });

    if (groqError) {
      console.error(`[generate-visual-prompt][Shot ${shotId}] Groq API error:`, groqError);
      throw groqError;
    }

    if (!groqResponse?.text) {
      throw new Error('No response text received from Groq');
    }

    const visualPrompt = groqResponse.text.trim();
    console.log(`[generate-visual-prompt][Shot ${shotId}] Generated visual prompt:`, visualPrompt);

    // Update the shot with the generated visual prompt
    console.log(`[generate-visual-prompt][Shot ${shotId}] Updating shot with visual prompt and status 'prompt_ready'...`);
    const { error: updateError } = await supabase
      .from("shots")
      .update({ 
        visual_prompt: visualPrompt,
        image_status: "prompt_ready",
        failure_reason: null // Clear any previous failure reason
      })
      .eq("id", shotId);

    if (updateError) {
      console.error(`[generate-visual-prompt][Shot ${shotId}] Error updating shot with visual prompt: ${updateError.message}`);
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[generate-visual-prompt][Shot ${shotId}] Visual prompt generation successfully completed.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        visual_prompt: visualPrompt,
        shot_id: shotId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`[generate-visual-prompt][Shot ${shotId || 'UNKNOWN'}] Unexpected error: ${error.message}`, error.stack);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
