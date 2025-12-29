import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type GenerationPhase = 'idle' | 'images' | 'videos' | 'complete';

interface ShotData {
  id: string;
  scene_id: string;
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
    active: number;
  };
  errors: Array<{ shotId: string; error: string }>;
}

/**
 * True parallel processing with worker pool pattern.
 * Maintains exactly `concurrency` active promises at all times until queue is exhausted.
 */
async function processWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  processor: (item: T) => Promise<R>,
  onProgress?: (completed: number, active: number) => void
): Promise<R[]> {
  const results: R[] = [];
  const queue = [...items];
  let active = 0;
  let completed = 0;

  return new Promise((resolve) => {
    const processNext = async () => {
      if (queue.length === 0 && active === 0) {
        resolve(results);
        return;
      }

      while (active < concurrency && queue.length > 0) {
        const item = queue.shift()!;
        active++;
        onProgress?.(completed, active);

        processor(item)
          .then((result) => {
            results.push(result);
            completed++;
            active--;
            onProgress?.(completed, active);
            processNext();
          })
          .catch((error) => {
            results.push({ success: false, error } as unknown as R);
            completed++;
            active--;
            onProgress?.(completed, active);
            processNext();
          });
      }
    };

    processNext();
  });
}

export function useProjectAutoGenerate(projectId: string) {
  const [state, setState] = useState<AutoGenerateState>({
    phase: 'idle',
    progress: { total: 0, completed: 0, active: 0 },
    errors: [],
  });

  const [allShots, setAllShots] = useState<ShotData[]>([]);
  const isRunningRef = useRef(false);

  // Fetch ALL shots for the entire project (across all scenes)
  const fetchAllProjectShots = useCallback(async (): Promise<ShotData[]> => {
    try {
      // Get all scenes for this project first
      const { data: scenes, error: scenesError } = await supabase
        .from('scenes')
        .select('id')
        .eq('project_id', projectId);

      if (scenesError) throw scenesError;
      if (!scenes || scenes.length === 0) return [];

      const sceneIds = scenes.map(s => s.id);

      // Get all shots for all scenes
      const { data: shots, error: shotsError } = await supabase
        .from('shots')
        .select('id, scene_id, image_url, image_status, video_url, video_status, visual_prompt')
        .in('scene_id', sceneIds)
        .order('shot_number');

      if (shotsError) throw shotsError;
      setAllShots(shots || []);
      return shots || [];
    } catch (error) {
      console.error('Failed to fetch project shots:', error);
      return [];
    }
  }, [projectId]);

  // Determine current phase based on ALL shots in the project
  const determinePhase = useCallback((shots: ShotData[]): 'images' | 'videos' => {
    if (shots.length === 0) return 'images';
    const allHaveImages = shots.every(shot =>
      shot.image_status === 'completed' && shot.image_url
    );
    return allHaveImages ? 'videos' : 'images';
  }, []);

  // Get shots that need processing across the entire project
  const getShotsToProcess = useCallback((phase: 'images' | 'videos', shots: ShotData[]): ShotData[] => {
    if (phase === 'images') {
      return shots.filter(shot =>
        shot.image_status !== 'completed' || !shot.image_url
      );
    } else {
      return shots.filter(shot =>
        shot.image_status === 'completed' &&
        shot.image_url &&
        shot.video_status !== 'completed'
      );
    }
  }, []);

  // Generate image for a single shot
  const generateImage = async (shot: ShotData): Promise<{ success: boolean; shotId: string; error?: any }> => {
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

  // Generate video from image for a single shot
  const generateVideo = async (shot: ShotData): Promise<{ success: boolean; shotId: string; error?: any }> => {
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

  // Start auto-generate process for the ENTIRE PROJECT
  const startAutoGenerate = async () => {
    if (isRunningRef.current) {
      toast.info('Generation already in progress');
      return;
    }

    isRunningRef.current = true;

    try {
      const shots = await fetchAllProjectShots();

      if (shots.length === 0) {
        toast.error('No shots found in the project');
        isRunningRef.current = false;
        return;
      }

      const phase = determinePhase(shots);
      const shotsToProcess = getShotsToProcess(phase, shots);

      if (shotsToProcess.length === 0) {
        if (phase === 'images') {
          toast.info('All images already generated. Click again to generate videos.');
          setState({
            phase: 'videos',
            progress: { total: 0, completed: 0, active: 0 },
            errors: []
          });
        } else {
          toast.success('All content already generated!');
          setState({
            phase: 'complete',
            progress: { total: 0, completed: 0, active: 0 },
            errors: []
          });
        }
        isRunningRef.current = false;
        return;
      }

      setState({
        phase,
        progress: { total: shotsToProcess.length, completed: 0, active: 0 },
        errors: [],
      });

      toast.info(`Starting ${phase} generation for ${shotsToProcess.length} shots across all scenes`);

      // Higher concurrency for project-wide parallel processing
      const MAX_CONCURRENT = phase === 'images' ? 5 : 3;

      const processor = phase === 'images' ? generateImage : generateVideo;

      const results = await processWithConcurrency(
        shotsToProcess,
        MAX_CONCURRENT,
        processor,
        (completed, active) => {
          setState(prev => ({
            ...prev,
            progress: { ...prev.progress, completed, active }
          }));
        }
      );

      // Collect errors
      const errors = results
        .filter(r => !r.success)
        .map(r => ({ shotId: r.shotId, error: r.error?.message || 'Unknown error' }));

      const successCount = results.filter(r => r.success).length;
      const failCount = errors.length;

      if (failCount === 0) {
        toast.success(`${phase === 'images' ? 'Images' : 'Videos'} generated! (${successCount}/${shotsToProcess.length})`);
      } else {
        toast.warning(`Generated ${successCount}/${shotsToProcess.length}. ${failCount} failed.`);
      }

      // Update state based on completion
      const newPhase = phase === 'images' ? 'videos' : 'complete';
      setState(prev => ({ 
        ...prev, 
        phase: 'idle',
        errors
      }));

      // Refresh shots data
      await fetchAllProjectShots();

    } finally {
      isRunningRef.current = false;
    }
  };

  const nextPhase = allShots.length > 0 ? determinePhase(allShots) : 'images';

  return {
    state,
    allShots,
    startAutoGenerate,
    nextPhase,
    isProcessing: isRunningRef.current || (state.phase !== 'idle' && state.phase !== 'complete'),
    fetchAllProjectShots
  };
}
