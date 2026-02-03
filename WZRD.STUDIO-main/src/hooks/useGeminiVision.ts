import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useGeminiVision = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (imageUrl: string, question: string) => {
    if (!imageUrl || !question.trim()) {
      toast.error('Please provide both an image and a question');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        'gemini-image-analysis',
        {
          body: { 
            imageUrl, 
            question,
            model: 'google/gemini-2.5-flash'
          }
        }
      );

      if (invokeError) throw invokeError;

      if (!data?.response) {
        throw new Error('No response from AI');
      }

      return data.response;
    } catch (err) {
      console.error('Error analyzing image:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyzeImage, isAnalyzing, error };
};
