import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { executeFalModel } from '../_shared/falai-client.ts';

interface RequestBody {
  modelId: string
  inputs: Record<string, any>
  mode?: 'sync' | 'queue'
  metadata?: {
    userId?: string
    projectId?: string
    nodeId?: string
    source?: 'node-editor' | 'storyboard' | 'timeline'
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    await authenticateRequest(req.headers);

    const body: RequestBody = await req.json();
    const { modelId, inputs, mode = 'queue', metadata } = body;

    if (!modelId || typeof modelId !== 'string') {
      return errorResponse('Invalid model ID', 400);
    }

    console.log('Executing model:', {
      modelId,
      source: metadata?.source,
      userId: metadata?.userId,
    });

    const result = await executeFalModel(modelId, inputs, mode);

    return successResponse(result);
  } catch (error) {
    console.error('Edge function error:', error);
    
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    return errorResponse(error.message || 'Failed to execute model', 500);
  }
});