import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type GenerationPhase = 'idle' | 'images' | 'videos' | 'complete';

interface ShotData {
  id: string;
  image_url: string | null;
  image_status: string;
  video_url: string | null;
  video_status: string;
  visual_prompt?: string;
}

interface AutoGenerateState {
  phase: GenerationPhase;
  progress: {
    total: number;
    completed: number;
    current: string | null;
  };
  errors: Array<{ shotId: string; error: string }>;
}

interface ProcessResult {
  success: boolean;
  shotId: string;
  error?: any;
}

export function useAutoGenerate(sceneId: string) {
  const [state, setState] = useState<AutoGenerateState>({
    phase: 'idle',
    progress: { total: 0, completed: 0, current: null },
    errors: [],
  });

  const [shots, setShots] = useState<ShotData[]>([]);

  // Fetch shots for the scene
  const fetchShots = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('shots')
        .select('id, image_url, image_status, video_url, video_status, visual_prompt')
        .eq('scene_id', sceneId)
        .order('shot_number');

      if (error) throw error;
      setShots(data || []);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch shots:', error);
      return [];
    }
  }, [sceneId]);

  // Determine current phase based on shot states
  const determinePhase = useCallback((shotsData: ShotData[]): 'images' | 'videos' => {
    const allHaveImages = shotsData.every(shot =>
      shot.image_status === 'completed' && shot.image_url
    );
    return allHaveImages ? 'videos' : 'images';
  }, []);

  // Get shots that need processing
  const getShotsToProcess = useCallback((phase: 'images' | 'videos', shotsData: ShotData[]): ShotData[] => {
    if (phase === 'images') {
      // Shots that need image generation: not completed, or missing URL
      return shotsData.filter(shot =>
        shot.image_status !== 'completed' || !shot.image_url
      );
    } else {
      // Shots that have images and need videos: completed images, but video not completed
      return shotsData.filter(shot =>
        shot.image_status === 'completed' &&
        shot.image_url &&
        shot.video_status !== 'completed'
      );
    }
  }, []);

  // Process items in batches with controlled concurrency
  const processInBatches = async <T, R>(
    items: T[],
    concurrency: number,
    processor: (item: T) => Promise<R>
  ): Promise<R[]> => {
    const results: R[] = [];
    const executing: Promise<void>[] = [];

    for (const item of items) {
      const p = processor(item).then(result => {
        results.push(result);
      });
      executing.push(p);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        // Remove completed promises
        const completedIndex = executing.findIndex(e => {
          // Find the first completed promise
          return Promise.race([e, Promise.resolve('check')]).then(r => r === 'check');
        });
        if (completedIndex >= 0) {
          executing.splice(completedIndex, 1);
        }
      }
    }

    await Promise.all(executing);
    return results;
  };

  // Generate image for a shot
  const generateImage = async (shot: ShotData): Promise<ProcessResult> => {
    try {
      // Ensure visual prompt exists
      if (!shot.visual_prompt) {
        const { error: promptError } = await supabase.functions.invoke('generate-visual-prompt', {
          body: { shot_id: shot.id }
        });
        if (promptError) throw promptError;
      }

      // Generate image
      const { error } = await supabase.functions.invoke('generate-shot-image', {
        body: { shot_id: shot.id }
      });

      if (error) throw error;

      return { success: true, shotId: shot.id };
    } catch (error) {
      console.error('Image generation failed for shot:', shot.id, error);
      return { success: false, shotId: shot.id, error };
    }
  };

  // Generate video from image
  const generateVideo = async (shot: ShotData): Promise<ProcessResult> => {
    try {
      const { error } = await supabase.functions.invoke('generate-video-from-image', {
        body: {
          shot_id: shot.id,
          image_url: shot.image_url,
          prompt: shot.visual_prompt,
          duration: 5
        }
      });

      if (error) throw error;

      return { success: true, shotId: shot.id };
    } catch (error) {
      console.error('Video generation failed for shot:', shot.id, error);
      return { success: false, shotId: shot.id, error };
    }
  };

  // Start auto-generate process
  const startAutoGenerate = async () => {
    const shotsData = await fetchShots();

    if (shotsData.length === 0) {
      toast.error('No shots to process');
      return;
    }

    const phase = determinePhase(shotsData);
    const shotsToProcess = getShotsToProcess(phase, shotsData);

    if (shotsToProcess.length === 0) {
      if (phase === 'images') {
        toast.info('All images already generated. Click again to generate videos.');
        setState({
          phase: 'videos',
          progress: { total: 0, completed: 0, current: null },
          errors: []
        });
      } else {
        toast.success('All content already generated!');
        setState({
          phase: 'complete',
          progress: { total: 0, completed: 0, current: null },
          errors: []
        });
      }
      return;
    }

    setState({
      phase,
      progress: { total: shotsToProcess.length, completed: 0, current: null },
      errors: [],
    });

    toast.info(`Starting ${phase} generation for ${shotsToProcess.length} shots`);

    // Process with controlled concurrency
    const MAX_CONCURRENT = phase === 'images' ? 3 : 2; // Videos need more resources

    const results = await processInBatches(
      shotsToProcess,
      MAX_CONCURRENT,
      async (shot) => {
        setState(prev => ({
          ...prev,
          progress: { ...prev.progress, current: shot.id }
        }));

        const result = phase === 'images'
          ? await generateImage(shot)
          : await generateVideo(shot);

        setState(prev => ({
          ...prev,
          progress: {
            ...prev.progress,
            completed: prev.progress.completed + 1
          }
        }));

        if (!result.success) {
          setState(prev => ({
            ...prev,
            errors: [...prev.errors, { shotId: result.shotId, error: result.error?.message || 'Unknown error' }]
          }));
        }

        return result;
      }
    );

    // Refetch shots to get updated data
    await fetchShots();

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (failCount === 0) {
      toast.success(`${phase === 'images' ? 'Images' : 'Videos'} generated! (${successCount}/${shotsToProcess.length})`);
      setState(prev => ({ ...prev, phase: phase === 'images' ? 'videos' : 'complete' }));
    } else {
      toast.warning(`Generated ${successCount}/${shotsToProcess.length}. ${failCount} failed.`);
    }

    setState(prev => ({ ...prev, phase: 'idle' }));
  };

  return {
    state,
    shots,
    startAutoGenerate,
    nextPhase: shots.length > 0 ? determinePhase(shots) : 'images',
    isProcessing: state.phase !== 'idle' && state.phase !== 'complete',
    fetchShots
  };
}
