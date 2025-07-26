
export async function initiateLumaImageGeneration({
  supabase,
  userId,
  shotId,
  projectId,
  prompt,
  aspectRatio = '16:9'
}: {
  supabase: any;
  userId: string;
  shotId: string;
  projectId: string;
  prompt: string;
  aspectRatio?: string;
}) {
  const lumaApiKey = Deno.env.get("LUMA_API_KEY");
  if (!lumaApiKey) {
    console.error(`[Luma Helper][Shot ${shotId}] Missing LUMA_API_KEY in environment variables`);
    throw new Error("Missing Luma API key in environment variables");
  }

  // Determine model to use based on configuration or defaults
  const model = "photon-flash-1"; // Default model for image generation

  // Log the initiation
  console.log(`[Luma Helper][Shot ${shotId}] Calling Luma API (${model}, ${aspectRatio}) with prompt: ${prompt.substring(0, 75)}...`);
  console.log(`[Luma Helper][Shot ${shotId}] User ID: ${userId}`);

  // Prepare the request body for Luma API
  const requestBody = {
    prompt,
    aspect_ratio: aspectRatio,
    modality: "image",
    model,
  };

  try {
    // Call Luma API
    console.log(`[Luma Helper][Shot ${shotId}] Sending request to Luma API...`);
    const response = await fetch("https://api.lumalabs.ai/dream-machine/v1/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lumaApiKey}`
      },
      body: JSON.stringify(requestBody),
    });

    // Log response status for debugging
    console.log(`[Luma Helper][Shot ${shotId}] Luma API Response Status: ${response.status}`);
    
    // Get the response body as text
    const responseBodyText = await response.text();
    console.log(`[Luma Helper][Shot ${shotId}] Luma API Response Body: ${responseBodyText}`);

    if (!response.ok) {
      throw new Error(`Luma API Error (${response.status}): ${responseBodyText}`);
    }

    // Parse the response JSON
    const data = JSON.parse(responseBodyText);
    console.log(`[Luma Helper][Shot ${shotId}] Luma response contains ID: ${data.id}`);
    
    // Store the generation record in our database
    console.log(`[Luma Helper][Shot ${shotId}] Inserting generation record to database...`);
    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        project_id: projectId,
        shot_id: shotId,
        api_provider: "luma_image",
        external_request_id: data.id,
        request_payload: requestBody,
        status: "submitted"
      })
      .select('id')
      .single();

    if (insertError) {
      console.error(`[Luma Helper][Shot ${shotId}] Failed to record generation in database: ${insertError.message}`);
      throw new Error(`Database error: ${insertError.message}`);
    }

    console.log(`[Luma Helper][Shot ${shotId}] Generation record created with ID: ${generation.id}`);
    return {
      generation_id: generation.id,
      luma_id: data.id,
      message: "Image generation started successfully"
    };
  } catch (error) {
    console.error(`[Luma Helper][Shot ${shotId}] Error: ${error.message}`);
    throw error;
  }
}

export async function initiateLumaVideoGeneration({
  supabase,
  userId,
  shotId,
  projectId,
  imageUrl
}: {
  supabase: any;
  userId: string;
  shotId: string;
  projectId: string;
  imageUrl: string;
}) {
  const lumaApiKey = Deno.env.get("LUMA_API_KEY");
  if (!lumaApiKey) {
    console.error(`[Luma Helper][Shot ${shotId}] Missing LUMA_API_KEY in environment variables`);
    throw new Error("Missing Luma API key in environment variables");
  }

  // Determine model to use
  const model = "ray-2-flash"; // Default model for video generation from image
  
  // Log the initiation
  console.log(`[Luma Helper][Shot ${shotId}] Initiating video generation with Luma Ray model (${model}) from image`);
  console.log(`[Luma Helper][Shot ${shotId}] User ID: ${userId}`);

  // Prepare the request body for Luma API
  const requestBody = {
    input_image_url: imageUrl,
    model,
  };

  try {
    // Call Luma API
    console.log(`[Luma Helper][Shot ${shotId}] Sending request to Luma API for video generation...`);
    const response = await fetch("https://api.lumalabs.ai/ray/video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lumaApiKey}`
      },
      body: JSON.stringify(requestBody),
    });

    // Log response status for debugging
    console.log(`[Luma Helper][Shot ${shotId}] Luma API Response Status: ${response.status}`);
    
    // Get the response body as text
    const responseBodyText = await response.text();
    console.log(`[Luma Helper][Shot ${shotId}] Luma API Response Body: ${responseBodyText}`);

    if (!response.ok) {
      throw new Error(`Luma API Error (${response.status}): ${responseBodyText}`);
    }

    // Parse the response JSON
    const data = JSON.parse(responseBodyText);
    console.log(`[Luma Helper][Shot ${shotId}] Luma video generation response contains ID: ${data.id}`);
    
    // Store the generation record in our database
    console.log(`[Luma Helper][Shot ${shotId}] Inserting video generation record to database...`);
    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        project_id: projectId,
        shot_id: shotId,
        api_provider: "luma_video",
        external_request_id: data.id,
        request_payload: requestBody,
        status: "submitted"
      })
      .select('id')
      .single();

    if (insertError) {
      console.error(`[Luma Helper][Shot ${shotId}] Failed to record video generation in database: ${insertError.message}`);
      throw new Error(`Database error: ${insertError.message}`);
    }

    console.log(`[Luma Helper][Shot ${shotId}] Video generation record created with ID: ${generation.id}`);
    return {
      generation_id: generation.id,
      luma_id: data.id,
      message: "Video generation started successfully"
    };
  } catch (error) {
    console.error(`[Luma Helper][Shot ${shotId}] Error in video generation: ${error.message}`);
    throw error;
  }
}
