import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { FAL_MODELS_BY_CATEGORY, ALL_FAL_MODELS, getModelsByCategory, getModelById } from '../_shared/falai-client.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    await authenticateRequest(req.headers);

    // Handle both URL params and request body params
    const url = new URL(req.url);
    let category = url.searchParams.get('category');
    let search = url.searchParams.get('search');
    let capabilities = url.searchParams.getAll('capabilities');
    let modelId = url.searchParams.get('id');

    // If request has a body, parse params from it
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.params) {
          const bodyParams = new URLSearchParams(body.params);
          category = category || bodyParams.get('category');
          search = search || bodyParams.get('search');
          if (!capabilities.length) {
            capabilities = bodyParams.getAll('capabilities');
          }
          modelId = modelId || bodyParams.get('id');
        }
      } catch (e) {
        // If body parsing fails, continue with URL params
      }
    }

    // Get specific model by ID
    if (modelId) {
      const model = getModelById(modelId);
      if (!model) {
        return errorResponse('Model not found', 404);
      }
      return successResponse({ model });
    }

    let filteredModels = ALL_FAL_MODELS;

    // Filter by category
    if (category) {
      filteredModels = getModelsByCategory(category);
    }

    // Filter by search term
    if (search) {
      filteredModels = filteredModels.filter(model =>
        model.name.toLowerCase().includes(search.toLowerCase()) ||
        model.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by capabilities (if the model has a capabilities field)
    if (capabilities.length > 0) {
      filteredModels = filteredModels.filter(model => {
        const modelCapabilities = extractCapabilities(model);
        return capabilities.every(cap => modelCapabilities.includes(cap));
      });
    }

    return successResponse({
      models: filteredModels,
      total: filteredModels.length,
      categories: Object.keys(FAL_MODELS_BY_CATEGORY),
    });
  } catch (error) {
    console.error('Edge function error:', error);
    
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    return errorResponse(error.message || 'Failed to get models', 500);
  }
});

function extractCapabilities(model: any): string[] {
  const capabilities = [];
  const desc = model.description.toLowerCase();
  const name = model.name.toLowerCase();
  
  // Extract capabilities from model name and description
  if (desc.includes('image') || name.includes('image')) capabilities.push('image');
  if (desc.includes('video') || name.includes('video')) capabilities.push('video');
  if (desc.includes('audio') || name.includes('audio')) capabilities.push('audio');
  if (desc.includes('3d') || desc.includes('mesh')) capabilities.push('3d');
  if (desc.includes('text-to-')) capabilities.push('generation');
  if (desc.includes('edit') || desc.includes('inpaint')) capabilities.push('editing');
  if (desc.includes('upscale') || desc.includes('enhance')) capabilities.push('enhancement');
  if (desc.includes('speech') || desc.includes('tts')) capabilities.push('speech');
  if (desc.includes('music') || desc.includes('sound')) capabilities.push('audio-generation');
  
  return capabilities;
}