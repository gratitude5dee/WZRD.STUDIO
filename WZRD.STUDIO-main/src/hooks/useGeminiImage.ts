import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  aspectRatio?: string;
  model?: string;
  generationTime?: number; // in seconds
}

export const useGeminiImage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (prompt: string, count: number = 1, aspectRatio?: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const newImages: GeneratedImage[] = [];
      
      for (let i = 0; i < count; i++) {
        const startTime = Date.now();
        const { data, error } = await supabase.functions.invoke('gemini-image-generation', {
          body: { prompt, editMode: false, aspectRatio }
        });

        if (error) throw error;

        const generationTime = Math.round((Date.now() - startTime) / 1000);

        newImages.push({
          id: `${Date.now()}-${i}`,
          url: data.imageUrl,
          prompt,
          timestamp: Date.now(),
          aspectRatio,
          model: 'gemini-2.5-flash-image-preview',
          generationTime
        });
      }

      setImages(prev => [...prev, ...newImages]);
      toast.success(`Generated ${count} image${count > 1 ? 's' : ''} successfully`);
      return newImages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const editImage = async (sourceImageUrl: string, instruction: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('gemini-image-generation', {
        body: { prompt: instruction, imageUrl: sourceImageUrl, editMode: true }
      });

      if (error) throw error;

      const generationTime = Math.round((Date.now() - startTime) / 1000);

      const editedImage: GeneratedImage = {
        id: `${Date.now()}`,
        url: data.imageUrl,
        prompt: instruction,
        timestamp: Date.now(),
        model: 'gemini-2.5-flash-image-preview',
        generationTime
      };

      setImages(prev => [...prev, editedImage]);
      toast.success('Image edited successfully');
      return editedImage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit image';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImages = () => setImages([]);
  const removeImage = (id: string) => setImages(prev => prev.filter(img => img.id !== id));

  return { isGenerating, images, error, generateImage, editImage, clearImages, removeImage };
};
