
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { authenticateRequest, AuthError } from '../_shared/auth.ts';

interface RequestBody {
  shot_id: string;
  voice_id?: string;
  model_id?: string;
}

// Constants
const BUCKET_NAME = 'audio';
const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"; // George voice
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";

// Helper function to update shot status
async function updateShotStatus(
  supabaseClient: any,
  shotId: string,
  status: 'pending' | 'generating' | 'completed' | 'failed',
  audioUrl: string | null = null,
  failureReason: string | null = null
) {
  const updates: any = { audio_status: status };
  if (audioUrl !== null) updates.audio_url = audioUrl;
  if (failureReason !== null) updates.failure_reason = failureReason;

  console.log(`[Shot ${shotId}] Updating status to '${status}'${audioUrl ? ' with URL' : ''}${failureReason ? ' Reason: ' + failureReason : ''}`);
  
  const { error } = await supabaseClient
    .from('shots')
    .update(updates)
    .eq('id', shotId);

  if (error) {
    console.error(`[Shot ${shotId}] Failed to update status:`, error);
  }
}

// Generate a unique hash from content and parameters
function generateHash(text: string, voiceId: string, modelId: string): string {
  // Simple hash function for demo purposes
  return btoa(text + voiceId + modelId)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
    .substring(0, 40);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  let shotId: string | null = null;

  try {
    const user = await authenticateRequest(req.headers);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!elevenLabsApiKey) {
      return errorResponse('Server configuration error: Missing ElevenLabs API key', 500);
    }

    // Parse request
    const { shot_id, voice_id = DEFAULT_VOICE_ID, model_id = DEFAULT_MODEL_ID }: RequestBody = await req.json();
    shotId = shot_id;
    
    if (!shotId) {
      return errorResponse('shot_id is required', 400);
    }

    console.log(`[Shot ${shotId}] Received request to generate audio`);

    // Fetch shot data
    const { data: shotData, error: fetchError } = await supabaseClient
      .from('shots')
      .select('dialogue, prompt_idea, project_id, scene_id')
      .eq('id', shotId)
      .single();

    if (fetchError || !shotData) {
      console.error(`[Shot ${shotId}] Error fetching shot data:`, fetchError?.message);
      await updateShotStatus(supabaseClient, shotId, 'failed', null, `Shot not found: ${fetchError?.message}`);
      return errorResponse('Shot not found or failed to fetch', 404, fetchError?.message);
    }

    // Determine text to convert
    const textToConvert = shotData.dialogue || shotData.prompt_idea || '';
    if (!textToConvert) {
      console.log(`[Shot ${shotId}] No dialogue or prompt idea found. Skipping TTS.`);
      await updateShotStatus(supabaseClient, shotId, 'completed', null);
      return successResponse({ message: 'No text found for TTS.', shot_id: shotId, audio_url: null });
    }

    // Generate hash for caching
    const contentHash = generateHash(textToConvert, voice_id, model_id);
    const storageFilePath = `${shotData.project_id}/${shotData.scene_id}/${shotId}/${contentHash}.mp3`;
    
    console.log(`[Shot ${shotId}] Content hash: ${contentHash}, path: ${storageFilePath}`);

    // Check if audio already exists in storage
    const { data: existingFile } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storageFilePath);

    if (existingFile?.publicUrl) {
      try {
        const headResponse = await fetch(existingFile.publicUrl, { method: 'HEAD' });
        if (headResponse.ok) {
          console.log(`[Shot ${shotId}] Audio file found in cache: ${existingFile.publicUrl}`);
          await updateShotStatus(supabaseClient, shotId, 'completed', existingFile.publicUrl);
          return successResponse({
            message: 'Audio retrieved from cache',
            shot_id: shotId,
            audio_url: existingFile.publicUrl,
            from_cache: true
          });
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.log(`[Shot ${shotId}] Error checking cache: ${msg}`);
      }
    }

    // Update status to generating
    await updateShotStatus(supabaseClient, shotId, 'generating');
    console.log(`[Shot ${shotId}] Generating audio with ElevenLabs`);

    try {
      // Call ElevenLabs API
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey
        },
        body: JSON.stringify({
          text: textToConvert,
          model_id: model_id,
          output_format: "mp3"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
      }

      // Get audio content
      const audioArrayBuffer = await response.arrayBuffer();
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .upload(storageFilePath, audioArrayBuffer, {
          contentType: 'audio/mpeg',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabaseClient.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storageFilePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL after upload');
      }

      // Update shot with audio URL
      await updateShotStatus(supabaseClient, shotId, 'completed', urlData.publicUrl);

      return successResponse({
        message: 'Audio generated and stored successfully',
        shot_id: shotId,
        audio_url: urlData.publicUrl
      });

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Shot ${shotId}] Error generating audio:`, error);
      await updateShotStatus(supabaseClient, shotId!, 'failed', null, errorMsg);
      return errorResponse(`Failed to generate or store audio: ${errorMsg}`, 500);
    }

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown server error';
    console.error(`[Shot ${shotId || 'UNKNOWN'}] Top-level error:`, error);
    
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    return errorResponse(errorMsg, 500);
  }
});
