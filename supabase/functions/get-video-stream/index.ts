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
    const { video_id, access_token } = await req.json();

    console.log('Validating video stream access:', { video_id, access_token: access_token?.slice(0, 8) + '...' });

    if (!video_id || !access_token) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: video_id and access_token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate the stream session
    const { data: stream, error: streamError } = await supabase
      .from('music_video_streams')
      .select('id, video_id, expires_at')
      .eq('video_id', video_id)
      .eq('access_token', access_token)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (streamError) {
      console.error('Stream validation error:', streamError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate stream session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!stream) {
      console.log('No valid stream session found');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired stream session' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch video details
    const { data: video, error: videoError } = await supabase
      .from('music_videos')
      .select('id, title, artist, video_path')
      .eq('id', video_id)
      .single();

    if (videoError || !video) {
      console.error('Video fetch error:', videoError);
      return new Response(
        JSON.stringify({ error: 'Video not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check video path type
    const isDemoVideo = video.video_path.startsWith('demo/');
    const isPublicVideo = video.video_path.startsWith('/');
    let videoUrl: string;

    if (isPublicVideo) {
      // For public folder videos, return the relative path - frontend will handle the full URL
      videoUrl = video.video_path;
      console.log('Using public video path for:', video.title);
    } else if (isDemoVideo) {
      // For demo videos, use a sample video from a public source
      videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      console.log('Using demo video URL for:', video.title);
    } else {
      // Generate signed URL for actual videos in storage
      const { data: signedUrl, error: signedUrlError } = await supabase.storage
        .from('videos')
        .createSignedUrl(video.video_path, 600); // 10 minute validity

      if (signedUrlError || !signedUrl) {
        console.error('Signed URL error:', signedUrlError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate video URL' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      videoUrl = signedUrl.signedUrl;
    }

    console.log('Video stream access granted for:', video.title);

    return new Response(
      JSON.stringify({
        url: videoUrl,
        expires_at: stream.expires_at,
        video: {
          title: video.title,
          artist: video.artist,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error getting video stream:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
