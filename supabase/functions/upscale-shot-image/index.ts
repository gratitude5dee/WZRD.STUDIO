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
    const { shot_id, image_url, scale = 2, model = 'creative' } = await req.json();

    if (!shot_id || !image_url) {
      throw new Error('Missing required parameters');
    }

    console.log('Upscaling image for shot:', shot_id);
    console.log('Scale:', scale, 'Model:', model);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const falKey = Deno.env.get('FAL_KEY');

    if (!falKey) {
      throw new Error('FAL_KEY not configured');
    }

    // Update status to processing
    await supabase
      .from('shots')
      .update({ upscale_status: 'processing' })
      .eq('id', shot_id);

    // Call FAL.ai upscaler endpoint
    // Using clarity-upscaler or similar
    const modelId = model === 'creative'
      ? 'fal-ai/clarity-upscaler'
      : 'fal-ai/aura-sr';

    const falResponse = await fetch(`https://fal.run/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: image_url,
        scale: scale,
        creativity: model === 'creative' ? 0.35 : 0
      })
    });

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      console.error('FAL.ai error:', errorText);
      throw new Error(`FAL.ai request failed: ${falResponse.statusText}`);
    }

    const falData = await falResponse.json();
    const upscaledUrl = falData.image?.url;

    if (!upscaledUrl) {
      throw new Error('No upscaled image returned from FAL.ai');
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

    // Add upscale record to history
    history.push({
      url: upscaledUrl,
      type: 'upscaled',
      scale: scale,
      model: model,
      timestamp: new Date().toISOString()
    });

    // Update shot with upscaled image
    const { error: updateError } = await supabase
      .from('shots')
      .update({
        upscaled_image_url: upscaledUrl,
        upscale_status: 'ready',
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
        image_url: upscaledUrl,
        scale: scale
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Upscale shot image error:', error);

    // Update status to failed
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { shot_id } = await req.json();
    if (shot_id) {
      await supabase
        .from('shots')
        .update({ upscale_status: 'failed' })
        .eq('id', shot_id);
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to upscale image';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
