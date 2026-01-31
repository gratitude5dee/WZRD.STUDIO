import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { track_id, wallet_address } = await req.json();

    console.log('[request-play] Checking entitlement for track:', track_id, 'wallet:', wallet_address);

    if (!track_id || !wallet_address) {
      return new Response(
        JSON.stringify({ error: 'Missing track_id or wallet_address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for existing valid entitlement using RPC function
    const { data: entitlementData, error: entitlementError } = await supabase
      .rpc('get_entitlement', {
        p_track_id: track_id,
        p_user_wallet: wallet_address
      });

    if (entitlementError) {
      console.error('[request-play] Error checking entitlement:', entitlementError);
    }

    // If valid entitlement exists, return it
    if (entitlementData && entitlementData.length > 0) {
      const ent = entitlementData[0];
      console.log('[request-play] Found valid entitlement, expires:', ent.expires_at);
      
      // Get track info for audio URL
      const { data: track } = await supabase
        .from('music_tracks')
        .select('audio_path, title, artist')
        .eq('id', track_id)
        .single();

      if (!track) {
        return new Response(
          JSON.stringify({ error: 'Track not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate signed URL for audio
      const { data: signedUrlData, error: signedUrlError } = await supabase
        .storage
        .from('audio')
        .createSignedUrl(track.audio_path, 600); // 10 minutes

      if (signedUrlError) {
        console.error('[request-play] Error creating signed URL:', signedUrlError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate audio URL' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          allowed: true,
          has_entitlement: true,
          entitlement_id: ent.id,
          access_token: "",
          expires_at: ent.expires_at,
          tx_hash: "",
          audio_url: signedUrlData.signedUrl,
          track: {
            title: track.title,
            artist: track.artist
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No valid entitlement - get track info for payment prompt
    const { data: track, error: trackError } = await supabase
      .from('music_tracks')
      .select('id, title, artist, price, artist_wallet, cover_path')
      .eq('id', track_id)
      .single();

    if (trackError || !track) {
      console.error('[request-play] Track not found:', trackError);
      return new Response(
        JSON.stringify({ error: 'Track not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[request-play] No entitlement found, returning payment required');

    return new Response(
      JSON.stringify({
        allowed: false,
        has_entitlement: false,
        price: track.price,
        track: {
          id: track.id,
          title: track.title,
          artist: track.artist,
          artist_wallet: track.artist_wallet,
          cover_path: track.cover_path
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[request-play] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
