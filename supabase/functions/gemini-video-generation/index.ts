import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const { prompt, imageUrl, jobId } = await req.json();

    const LUMA_API_KEY = Deno.env.get("LUMA_API_KEY");
    if (!LUMA_API_KEY) {
      return errorResponse('LUMA_API_KEY is not configured', 500);
    }

    // If jobId is provided, check status
    if (jobId) {
      const statusResponse = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${jobId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${LUMA_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!statusResponse.ok) {
        return errorResponse("Failed to check video status", 500);
      }

      const statusData = await statusResponse.json();
      return successResponse({
        status: statusData.state,
        videoUrl: statusData.assets?.video,
        progress: statusData.state === 'completed' ? 100 : statusData.state === 'processing' ? 50 : 10
      });
    }

    // Create new video generation
    if (!prompt) {
      return errorResponse('Prompt is required', 400);
    }

    console.log('Generating video with Luma Ray 2');

    const body: any = {
      prompt,
      aspect_ratio: "16:9",
      modality: "video",
      model: imageUrl ? "ray-2-flash" : "ray-2",
    };

    if (imageUrl) {
      body.keyframes = {
        frame0: { type: "image", url: imageUrl }
      };
    }

    const response = await fetch("https://api.lumalabs.ai/dream-machine/v1/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LUMA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Luma API error:", response.status, errorText);
      return errorResponse("Failed to start video generation", 500);
    }

    const data = await response.json();

    return successResponse({
      jobId: data.id,
      status: 'queued',
      progress: 0
    });
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(error instanceof Error ? error.message : "Unknown error", 500);
  }
});
