
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { FAL_MODELS, submitToFalQueue } from '../_shared/falai-client.ts';

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const falImageSize = convertImageSizeToFalFormat(imageSize);
    console.log(`[generate-shot-image][Shot ${shotId}] Using aspect ratio: ${aspectRatio}, FAL image size:`, falImageSize);

    try {
      // Use Lovable AI Gateway with Gemini 2.5 Flash Image (Nano banana)
      console.log(`[generate-shot-image][Shot ${shotId}] Calling Lovable AI Gateway with Nano banana...`);
      
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured');
      }

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            { role: 'user', content: shot.visual_prompt }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error(`[generate-shot-image][Shot ${shotId}] AI Gateway error: ${aiResponse.status} - ${errorText}`);
        if (aiResponse.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (aiResponse.status === 402) {
          throw new Error('Credits exhausted. Please add credits to your workspace.');
        }
        throw new Error(`AI Gateway error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const base64Image = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!base64Image) {
        throw new Error('No image returned from AI Gateway');
      }

      console.log(`[generate-shot-image][Shot ${shotId}] Image generated successfully, uploading to storage...`);

      // Extract base64 data (remove data:image/png;base64, prefix if present)
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
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

    } catch (error) {
      console.error(`[generate-shot-image][Shot ${shotId}] Error in image generation: ${error.message}`);
      
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
