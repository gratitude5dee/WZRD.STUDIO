import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Map model IDs to FAL model identifiers
const FAL_VIDEO_MODELS: Record<string, string> = {
  'gemini-2.5-flash-video': 'fal-ai/veo2',
  'veo3-fast': 'fal-ai/veo2',
  'kling-2-1': 'fal-ai/kling-video/v2.1/standard/text-to-video',
  'hailuo': 'fal-ai/minimax/video-01',
};

// Models that use Luma API
const LUMA_MODELS = ['luma-dream', 'luma-ray'];

export const useGeminiVideo = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const checkLumaStatus = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-video-generation', {
        body: { jobId: id }
      });

      if (error) throw error;

      setProgress(data.progress);

      if (data.status === 'completed' && data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setIsGenerating(false);
        toast.success('Video generated successfully');
        return true;
      } else if (data.status === 'failed') {
        throw new Error('Video generation failed');
      }

      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check video status';
      setError(errorMessage);
      setIsGenerating(false);
      toast.error(errorMessage);
      return true;
    }
  };

  const generateWithFal = async (prompt: string, model: string, imageUrl?: string) => {
    const falModelId = FAL_VIDEO_MODELS[model] || 'fal-ai/veo2';
    
    console.log(`[VideoGen] Using FAL model: ${falModelId}`);
    
    const inputs: Record<string, any> = {
      prompt,
      aspect_ratio: '16:9',
    };

    // Add image for image-to-video
    if (imageUrl) {
      inputs.image_url = imageUrl;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fal-stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            modelId: falModelId,
            inputs
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'FAL API error');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'progress') {
              setProgress(prev => Math.min(prev + 10, 90));
            } else if (data.type === 'done') {
              const result = data.result;
              const url = result?.video?.url || result?.url;
              
              if (url) {
                setVideoUrl(url);
                setProgress(100);
                toast.success('Video generated successfully');
              } else {
                throw new Error('No video URL in response');
              }
              setIsGenerating(false);
              return;
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch (e) {
            console.warn('Failed to parse SSE data:', e);
          }
        }
      }

      setIsGenerating(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'FAL video generation failed';
      setError(errorMessage);
      setIsGenerating(false);
      toast.error(errorMessage);
    }
  };

  const generateWithLuma = async (prompt: string, imageUrl?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-video-generation', {
        body: { prompt, imageUrl }
      });

      if (error) throw error;

      setJobId(data.jobId);
      toast.success('Video generation started');

      // Poll for completion
      const pollInterval = setInterval(async () => {
        const completed = await checkLumaStatus(data.jobId);
        if (completed) {
          clearInterval(pollInterval);
        }
      }, 5000);

      return () => clearInterval(pollInterval);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start video generation';
      setError(errorMessage);
      setIsGenerating(false);
      toast.error(errorMessage);
    }
  };

  const generateVideo = async (prompt: string, model: string = 'gemini-2.5-flash-video', imageUrl?: string) => {
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setProgress(0);

    const useLuma = LUMA_MODELS.some(lm => model.includes(lm));

    if (useLuma) {
      await generateWithLuma(prompt, imageUrl);
    } else {
      await generateWithFal(prompt, model, imageUrl);
    }
  };

  return { isGenerating, videoUrl, progress, error, generateVideo };
};
