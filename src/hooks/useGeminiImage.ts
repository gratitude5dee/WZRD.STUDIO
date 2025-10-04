import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useGeminiImage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (prompt: string) => {
    setIsGenerating(true);
    setError(null);
    setImageUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-image-generation', {
        body: { prompt, editMode: false }
      });

      if (error) throw error;

      setImageUrl(data.imageUrl);
      toast.success('Image generated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const editImage = async (sourceImageUrl: string, instruction: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-image-generation', {
        body: { prompt: instruction, imageUrl: sourceImageUrl, editMode: true }
      });

      if (error) throw error;

      setImageUrl(data.imageUrl);
      toast.success('Image edited successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit image';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, imageUrl, error, generateImage, editImage };
};
