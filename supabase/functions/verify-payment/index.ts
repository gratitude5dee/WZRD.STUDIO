import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a random access token
function generateAccessToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { track_id, wallet_address, tx_hash } = await req.json();

    console.log('[verify-payment] Verifying payment for track:', track_id, 'wallet:', wallet_address, 'tx:', tx_hash);

    if (!track_id || !wallet_address || !tx_hash) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get track info
    const { data: track, error: trackError } = await supabase
      .from('music_tracks')
      .select('id, title, artist, price, artist_wallet, audio_path')
      .eq('id', track_id)
      .single();

    if (trackError || !track) {
      console.error('[verify-payment] Track not found:', trackError);
      return new Response(
        JSON.stringify({ error: 'Track not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Verify the tx_hash on Monad blockchain using Thirdweb SDK or RPC
    // For now, we simulate verification by checking if the tx_hash looks valid
    // In production, you would:
    // 1. Query Monad blockchain for the transaction
    // 2. Verify the amount matches track.price
    // 3. Verify the recipient is track.artist_wallet
    // 4. Verify the transaction is confirmed
    
    console.log('[verify-payment] Simulating payment verification for tx:', tx_hash);
    
    // Generate access token and expiry
    const accessToken = generateAccessToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create entitlement record
    const { data: entitlement, error: entitlementError } = await supabase
      .from('music_entitlements')
      .insert({
        track_id: track_id,
        user_wallet: wallet_address.toLowerCase(),
        tx_hash: tx_hash,
        expires_at: expiresAt.toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (entitlementError) {
      // Check if it's a duplicate entry (already processed)
      if (entitlementError.code === '23505') {
        console.log('[verify-payment] Entitlement already exists for this tx');
        
        // Fetch existing entitlement
        const { data: existingEnt } = await supabase
          .from('music_entitlements')
          .select('*')
          .eq('tx_hash', tx_hash)
          .single();

        if (existingEnt) {
          const { data: signedUrlData } = await supabase
            .storage
            .from('audio')
            .createSignedUrl(track.audio_path, 600);

          return new Response(
            JSON.stringify({
              success: true,
              entitlement_id: existingEnt.id,
              access_token: existingEnt.access_token,
              expires_at: existingEnt.expires_at,
              audio_url: signedUrlData?.signedUrl,
              track: { title: track.title, artist: track.artist }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      console.error('[verify-payment] Error creating entitlement:', entitlementError);
      return new Response(
        JSON.stringify({ error: 'Failed to create entitlement' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Also add to transactions table for backwards compatibility
    await supabase
      .from('music_transactions')
      .insert({
        track_id: track_id,
        user_wallet: wallet_address.toLowerCase(),
        artist_wallet: track.artist_wallet,
        amount: track.price,
        tx_hash: tx_hash
      });

    // Generate signed URL for audio
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('audio')
      .createSignedUrl(track.audio_path, 600);

    if (signedUrlError) {
      console.error('[verify-payment] Error creating signed URL:', signedUrlError);
    }

    console.log('[verify-payment] Entitlement created successfully, expires:', expiresAt.toISOString());

    return new Response(
      JSON.stringify({
        success: true,
        entitlement_id: entitlement.id,
        access_token: accessToken,
        expires_at: expiresAt.toISOString(),
        audio_url: signedUrlData?.signedUrl,
        track: {
          title: track.title,
          artist: track.artist
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[verify-payment] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
