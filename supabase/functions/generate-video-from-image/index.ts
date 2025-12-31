import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { FAL_MODELS, submitToFalQueue, FalResponse } from "../_shared/falai-client.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define the expected video result structure from FAL
interface FalVideoData {
  video?: { url: string; duration?: number; frames?: number };
  url?: string;
  duration?: number;
  frames?: number;
  videos?: Array<{ url: string; duration?: number; frames?: number }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { shot_id, image_url } = await req.json();

    if (!shot_id || !image_url) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing shot ID or image URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get shot information
    const { data: shot, error: shotError } = await supabase
      .from("shots")
      .select("id, project_id")
      .eq("id", shot_id)
      .single();

    if (shotError || !shot) {
      console.error(`Error fetching shot: ${shotError?.message}`);
      return new Response(
        JSON.stringify({ success: false, error: shotError?.message || "Shot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Shot ${shot_id}] Starting video generation process from image.`);

    // Get the user information to associate the generation with
    const { data: authData, error: authError } = await supabase.auth.getUser(
      req.headers.get("Authorization")?.split("Bearer ")[1] || ""
    );

    if (authError || !authData.user) {
      console.error(`Error getting user: ${authError?.message}`);
      return new Response(
        JSON.stringify({ success: false, error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      console.log(`[Shot ${shot_id}] Starting video generation with LTX Video 13B Distilled`);
      
      // Generate video from image using LTX Video 13B Distilled
      const result = await submitToFalQueue(FAL_MODELS.LTX_VIDEO_13B_DISTILLED_IMAGE_TO_VIDEO, {
        image_url: image_url,
        prompt: "Natural motion and camera movement, cinematic quality",
        negative_prompt: "worst quality, inconsistent motion, blurry, jittery, distorted",
        resolution: "720p",
        aspect_ratio: "auto",
        num_frames: 121,
        first_pass_num_inference_steps: 8,
        first_pass_skip_final_steps: 1,
        second_pass_num_inference_steps: 8,
        second_pass_skip_initial_steps: 5,
        frame_rate: 30,
        expand_prompt: false,
        reverse_video: false,
        enable_safety_checker: true,
        constant_rate_factor: 35
      }) as FalResponse<FalVideoData | string>;

      console.log(`[Shot ${shot_id}] Fal.ai response:`, JSON.stringify(result, null, 2));

      // Handle different possible response formats
      let videoUrl: string | undefined;
      let videoDuration: number | undefined;
      let videoFrames: number | undefined;

      // Check various possible response structures
      if (result.success && result.data) {
        const data = result.data;
        
        // Format 3: result.data is the video URL string
        if (typeof data === 'string' && data.startsWith('http')) {
          videoUrl = data;
        } else if (typeof data === 'object') {
          const videoData = data as FalVideoData;
          
          // Format 1: result.data.video.url
          if (videoData.video?.url) {
            videoUrl = videoData.video.url;
            videoDuration = videoData.video.duration;
            videoFrames = videoData.video.frames;
          }
          // Format 2: result.data.url (direct video URL)
          else if (videoData.url) {
            videoUrl = videoData.url;
            videoDuration = videoData.duration;
            videoFrames = videoData.frames;
          }
          // Format 4: Check if data has a videos array
          else if (videoData.videos && videoData.videos.length > 0) {
            videoUrl = videoData.videos[0].url;
            videoDuration = videoData.videos[0].duration;
            videoFrames = videoData.videos[0].frames;
          }
        }
      }

      if (!videoUrl) {
        console.error(`[Shot ${shot_id}] No video URL found in response structure:`, result);
        throw new Error(`No video URL found in Fal.ai response. Response structure: ${JSON.stringify(result)}`);
      }

      console.log(`[Shot ${shot_id}] Video URL found: ${videoUrl}`);

      // Store the generated video in Supabase storage
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video from URL: ${videoResponse.status} ${videoResponse.statusText}`);
      }
      
      const videoBuffer = await videoResponse.arrayBuffer();
      const fileName = `shot-${shot_id}-video-${Date.now()}.mp4`;
      
      const { error: uploadError } = await supabase.storage
        .from('workflow-media')
        .upload(fileName, videoBuffer, {
          contentType: 'video/mp4'
        });

      if (uploadError) {
        console.error(`Error uploading video: ${uploadError.message}`);
        throw new Error(`Failed to upload video: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('workflow-media')
        .getPublicUrl(fileName);

      // Update the shot with the video URL
      const { error: updateError } = await supabase
        .from('shots')
        .update({ 
          video_url: publicUrl,
          video_status: 'completed' 
        })
        .eq('id', shot_id);

      if (updateError) {
        console.error(`Error updating shot: ${updateError.message}`);
      }

      console.log(`[Shot ${shot_id}] Video generation completed successfully`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          video_url: publicUrl,
          duration: videoDuration,
          frames: videoFrames
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Shot ${shot_id}] Error in generate-video-from-image: ${error}`);
      
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Unexpected error: ${errorMsg}`);
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
