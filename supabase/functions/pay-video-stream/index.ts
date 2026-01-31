import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { video_id, payer_wallet, amount } = await req.json();

    console.log('Processing video payment:', { video_id, payer_wallet, amount });

    if (!video_id || !payer_wallet) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: video_id and payer_wallet' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch video details
    const { data: video, error: videoError } = await supabase
      .from('music_videos')
      .select('id, title, artist, price, artist_wallet')
      .eq('id', video_id)
      .maybeSingle();

    if (videoError || !video) {
      console.error('Video fetch error:', videoError);
      return new Response(
        JSON.stringify({ error: 'Video not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simulate x402 payment (in production, integrate with Thirdweb)
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // Generate stream session
    const streamId = `vstream_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const accessToken = Array.from({ length: 32 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]
    ).join('');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('Creating video stream session:', { streamId, expiresAt });

    // Insert stream record
    const { data: streamData, error: streamError } = await supabase
      .from('music_video_streams')
      .insert({
        video_id,
        user_wallet: payer_wallet.toLowerCase(),
        access_token: accessToken,
        stream_id: streamId,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (streamError) {
      console.error('Stream insert error:', streamError);
      return new Response(
        JSON.stringify({ error: 'Failed to create video stream session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record transaction
    const { error: txError } = await supabase
      .from('music_video_transactions')
      .insert({
        video_id,
        user_wallet: payer_wallet.toLowerCase(),
        artist_wallet: video.artist_wallet,
        tx_hash: txHash,
        amount: amount || video.price,
      });

    if (txError) {
      console.error('Transaction insert error:', txError);
    }

    console.log('Video payment successful:', { streamId, video: video.title });

    return new Response(
      JSON.stringify({
        success: true,
        stream: {
          id: streamData.id,
          stream_id: streamId,
          access_token: accessToken,
          expires_at: expiresAt.toISOString(),
          tx_hash: txHash,
        },
        video: {
          id: video.id,
          title: video.title,
          artist: video.artist,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing video payment:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
