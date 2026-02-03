import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shot_id, image_url, edit_prompt, original_prompt } = await req.json();

    if (!shot_id || !image_url || !edit_prompt) {
      throw new Error('Missing required parameters');
    }

    console.log('Editing image for shot:', shot_id);
    console.log('Edit prompt:', edit_prompt);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // For now, we'll use FAL.ai's image-to-image or flux-pro for editing
    // You would integrate with FAL.ai API here
    const falKey = Deno.env.get('FAL_KEY');

    if (!falKey) {
      throw new Error('FAL_KEY not configured');
    }

    // Call FAL.ai image editing endpoint
    // Using flux-pro or similar model with image-to-image capabilities
    const falResponse = await fetch('https://fal.run/fal-ai/flux-pro/v1.1', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: `${edit_prompt}. Original context: ${original_prompt}`,
        image_url: image_url,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        num_images: 1,
        enable_safety_checker: true
      })
    });

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      console.error('FAL.ai error:', errorText);
      throw new Error(`FAL.ai request failed: ${falResponse.statusText}`);
    }

    const falData = await falResponse.json();
    const editedImageUrl = falData.images?.[0]?.url;

    if (!editedImageUrl) {
      throw new Error('No edited image returned from FAL.ai');
    }

    // Get current image history
    const { data: shot, error: fetchError } = await supabase
      .from('shots')
      .select('image_history')
      .eq('id', shot_id)
      .single();

    if (fetchError) {
      console.error('Error fetching shot:', fetchError);
    }

    const history = shot?.image_history || [];

    // Add previous image to history
    history.push({
      url: image_url,
      type: 'pre-edit',
      edit_prompt: edit_prompt,
      timestamp: new Date().toISOString()
    });

    // Update shot with new image and history
    const { error: updateError } = await supabase
      .from('shots')
      .update({
        image_url: editedImageUrl,
        image_history: history,
        updated_at: new Date().toISOString()
      })
      .eq('id', shot_id);

    if (updateError) {
      console.error('Error updating shot:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        image_url: editedImageUrl,
        history_length: history.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: unknown) {
    console.error('Edit shot image error:', error);
    const message = error instanceof Error ? error.message : 'Failed to edit image';
    const details = error instanceof Error ? error.toString() : String(error);
    return new Response(
      JSON.stringify({
        error: message,
        details: details
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
