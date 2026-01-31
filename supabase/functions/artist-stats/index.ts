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
    const { wallet_address } = await req.json();
    
    console.log(`[artist-stats] Stats request for wallet: ${wallet_address}`);

    if (!wallet_address) {
      console.error('[artist-stats] Missing wallet_address');
      return new Response(
        JSON.stringify({ error: 'Missing wallet_address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get all tracks by this artist
    const { data: tracks, error: tracksError } = await supabaseAdmin
      .from('tracks')
      .select('id, title, artist, price, cover_path, created_at')
      .eq('artist_wallet', wallet_address)
      .order('created_at', { ascending: false });

    if (tracksError) {
      console.error('[artist-stats] Failed to fetch tracks:', tracksError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tracks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trackIds = tracks?.map(t => t.id) || [];
    const totalTracks = tracks?.length || 0;

    console.log(`[artist-stats] Found ${totalTracks} tracks`);

    // Get total streams for artist's tracks
    let totalStreams = 0;
    let totalEarnings = 0;

    if (trackIds.length > 0) {
      // Count streams
      const { count: streamCount, error: streamError } = await supabaseAdmin
        .from('streams')
        .select('*', { count: 'exact', head: true })
        .in('track_id', trackIds);

      if (!streamError) {
        totalStreams = streamCount || 0;
      }

      // Get total earnings from transactions
      const { data: transactions, error: txError } = await supabaseAdmin
        .from('transactions')
        .select('amount')
        .in('track_id', trackIds);

      if (!txError && transactions) {
        totalEarnings = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
      }
    }

    console.log(`[artist-stats] Stats: ${totalStreams} streams, ${totalEarnings} ETH earnings`);

    // Get recent transactions (last 10)
    let recentTransactions: any[] = [];
    if (trackIds.length > 0) {
      const { data: txData, error: recentTxError } = await supabaseAdmin
        .from('transactions')
        .select(`
          id,
          amount,
          payer_wallet,
          tx_hash,
          created_at,
          track_id
        `)
        .in('track_id', trackIds)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!recentTxError && txData) {
        // Enrich with track info
        recentTransactions = txData.map(tx => {
          const track = tracks?.find(t => t.id === tx.track_id);
          return {
            ...tx,
            track_title: track?.title || 'Unknown',
            track_artist: track?.artist || 'Unknown'
          };
        });
      }
    }

    return new Response(
      JSON.stringify({
        wallet_address,
        stats: {
          total_tracks: totalTracks,
          total_streams: totalStreams,
          total_earnings: totalEarnings,
          earnings_formatted: `${totalEarnings.toFixed(4)} ETH`
        },
        tracks: tracks || [],
        recent_transactions: recentTransactions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[artist-stats] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
