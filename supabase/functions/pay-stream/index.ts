import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a random access token
function generateAccessToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a mock transaction hash (in production, this would come from blockchain)
function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { track_id, payer_wallet, amount } = await req.json();
    
    console.log(`[pay-stream] Payment request for track: ${track_id} from wallet: ${payer_wallet}`);

    if (!track_id || !payer_wallet) {
      console.error('[pay-stream] Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing track_id or payer_wallet' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get the track details
    const { data: track, error: trackError } = await supabaseAdmin
      .from('music_tracks')
      .select('id, title, artist, price, artist_wallet')
      .eq('id', track_id)
      .single();

    if (trackError || !track) {
      console.error('[pay-stream] Track not found:', trackError);
      return new Response(
        JSON.stringify({ error: 'Track not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentAmount = amount || track.price;
    
    console.log(`[pay-stream] Processing payment of ${paymentAmount} for "${track.title}"`);

    // TODO: In production, integrate with Thirdweb x402 Protocol here
    // For now, we simulate a successful payment
    // The actual implementation would:
    // 1. Verify wallet signature
    // 2. Process on-chain payment via Thirdweb
    // 3. Wait for transaction confirmation
    
    const txHash = generateTxHash();
    const accessToken = generateAccessToken();
    const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Create stream session
    const { data: stream, error: streamError } = await supabaseAdmin
      .from('music_streams')
      .insert({
        track_id: track.id,
        user_wallet: payer_wallet,
        access_token: accessToken,
        stream_id: streamId,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (streamError) {
      console.error('[pay-stream] Failed to create stream session:', streamError);
      return new Response(
        JSON.stringify({ error: 'Failed to create stream session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[pay-stream] Stream session created: ${streamId}`);

    // Record the transaction
    const { error: txError } = await supabaseAdmin
      .from('music_transactions')
      .insert({
        track_id: track.id,
        user_wallet: payer_wallet,
        artist_wallet: track.artist_wallet,
        amount: paymentAmount,
        tx_hash: txHash
      });

    if (txError) {
      console.error('[pay-stream] Failed to record transaction:', txError);
      // Don't fail the request, stream session is already created
    } else {
      console.log(`[pay-stream] Transaction recorded: ${txHash}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        stream: {
          id: stream.id,
          stream_id: streamId,
          access_token: accessToken,
          expires_at: expiresAt,
          tx_hash: txHash
        },
        track: {
          id: track.id,
          title: track.title,
          artist: track.artist
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[pay-stream] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
