import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useGeminiVideo = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const checkStatus = async (id: string) => {
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

  const generateVideo = async (prompt: string, imageUrl?: string) => {
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setProgress(0);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-video-generation', {
        body: { prompt, imageUrl }
      });

      if (error) throw error;

      setJobId(data.jobId);
      toast.success('Video generation started');

      // Poll for completion
      const pollInterval = setInterval(async () => {
        const completed = await checkStatus(data.jobId);
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

  return { isGenerating, videoUrl, progress, error, generateVideo };
};
