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
    const { track_id, access_token } = await req.json();
    
    console.log(`[get-stream] Request for track: ${track_id}`);

    if (!track_id || !access_token) {
      console.error('[get-stream] Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing track_id or access_token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Verify the stream session is valid and not expired
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('streams')
      .select('id, track_id, expires_at, payer_wallet')
      .eq('track_id', track_id)
      .eq('access_token', access_token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (sessionError) {
      console.error('[get-stream] Session query error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!session) {
      console.log('[get-stream] No valid session found');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session', code: 'SESSION_EXPIRED' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[get-stream] Valid session found, expires: ${session.expires_at}`);

    // Get the track's audio path
    const { data: track, error: trackError } = await supabaseAdmin
      .from('tracks')
      .select('audio_path, title, artist')
      .eq('id', track_id)
      .single();

    if (trackError || !track) {
      console.error('[get-stream] Track not found:', trackError);
      return new Response(
        JSON.stringify({ error: 'Track not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a signed URL for the audio file (valid for 10 minutes)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
      .storage
      .from('audio')
      .createSignedUrl(track.audio_path, 600); // 600 seconds = 10 minutes

    if (signedUrlError || !signedUrlData) {
      console.error('[get-stream] Failed to generate signed URL:', signedUrlError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate stream URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[get-stream] Signed URL generated for track: ${track.title}`);

    return new Response(
      JSON.stringify({
        url: signedUrlData.signedUrl,
        expires_at: session.expires_at,
        track: {
          title: track.title,
          artist: track.artist
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[get-stream] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
