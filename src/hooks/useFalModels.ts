import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface FalModel {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  credits?: number;
  time?: string;
}

interface UseFalModelsOptions {
  category?: string;
  autoFetch?: boolean;
}

export const useFalModels = (options: UseFalModelsOptions = {}) => {
  const { category, autoFetch = true } = options;
  const [models, setModels] = useState<FalModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchModels = async (searchCategory?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (searchCategory || category) {
        params.append('category', searchCategory || category!);
      }
      
      const { data, error: supabaseError } = await supabase.functions.invoke('falai-models', {
        body: { params: params.toString() }
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (data?.models) {
        // Transform the models to match our interface
        const transformedModels: FalModel[] = data.models.map((model: any) => ({
          id: model.id,
          name: model.name,
          description: model.description,
          category: model.category,
          icon: model.icon || '🤖',
          credits: model.credits || 1,
          time: model.time || '~30s'
        }));
        
        setModels(transformedModels);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch models';
      setError(errorMessage);
      toast({
        title: 'Error fetching models',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getModelsByCategory = (searchCategory: string) => {
    return models.filter(model => model.category === searchCategory);
  };

  const getModelById = (modelId: string) => {
    return models.find(model => model.id === modelId);
  };

  useEffect(() => {
    if (autoFetch) {
      fetchModels();
    }
  }, [category, autoFetch]);

  return {
    models,
    isLoading,
    error,
    fetchModels,
    getModelsByCategory,
    getModelById,
    refetch: () => fetchModels()
  };
};