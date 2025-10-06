
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

    console.log(`[generate-visual-prompt][Shot ${shotId}] Calling Lovable AI Gateway with Gemini 2.5 Flash...`);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Call Lovable AI Gateway with Gemini 2.5 Flash
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[generate-visual-prompt][Shot ${shotId}] AI Gateway error: ${aiResponse.status} - ${errorText}`);
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Credits exhausted. Please add credits to your workspace.');
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const visualPrompt = aiData.choices?.[0]?.message?.content?.trim();

    if (!visualPrompt) {
      throw new Error('No response received from AI Gateway');
    }
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
