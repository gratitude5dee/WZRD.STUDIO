
import { ModelType } from '@/types/modelTypes';
import { supabase } from '@/integrations/supabase/client';

async function pollResult(requestId: string): Promise<any> {
  let attempts = 0;
  const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max wait
  
  while (attempts < maxAttempts) {
    try {
      console.log('Polling for result, attempt:', attempts + 1);
      
      // Call the fal-poll edge function instead of direct API
      const { data, error } = await supabase.functions.invoke('fal-poll', {
        body: { requestId }
      });
      
      if (error) {
        console.error('Poll request failed:', error);
        throw new Error(`Poll request failed: ${error.message}`);
      }
      
      console.log('Poll response:', data);
      
      if (data.status === 'COMPLETED') {
        return data.result;
      } else if (data.status === 'FAILED') {
        throw new Error('Generation failed');
      }

      // Wait 2 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    } catch (error) {
      console.error('Poll attempt failed:', error);
      throw error;
    }
  }

  throw new Error('Timeout waiting for result');
}

export const generateText = async (prompt: string, selectedModel: ModelType) => {
  try {
    console.log('Making request with:', { prompt, selectedModel });

    // For Groq models, use the groq-chat function directly
    if (selectedModel.startsWith('groq/')) {
      const { data, error } = await supabase.functions.invoke('groq-chat', {
        body: {
          prompt,
          model: selectedModel.replace('groq/', ''), // Remove the 'groq/' prefix
          temperature: 0.7,
          maxTokens: 1024
        }
      });

      if (error) {
        console.error('Groq request failed:', error);
        throw new Error(error.message || 'Failed to generate text');
      }

      return data;
    }

    // For other models, use the existing fal-proxy logic
    const { data, error } = await supabase.functions.invoke('fal-proxy', {
      body: {
        endpoint: 'fal-ai/ideogram/v2',
        input: {
          prompt,
          model: selectedModel,
        },
        mode: 'queue'
      }
    });

    if (error) {
      console.error('Initial request failed:', error);
      throw new Error(error.message || 'Failed to generate text');
    }

    console.log('Initial response:', data);

    const requestId = data.requestId;
    if (!requestId) {
      console.error('No request ID received:', data);
      throw new Error('No request ID received');
    }

    // Poll for the result
    return await pollResult(requestId);
  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
};
