import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ShotCard } from './shot';
import ShotConnectionLines from './shot/ShotConnectionLines';
import ShotCardSkeleton from './shot/ShotCardSkeleton';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { ShotDetails } from '@/types/storyboardTypes';
import { cn } from '@/lib/utils';
import { useShotStream, ShotStreamStatus } from '@/hooks/useShotStream';

interface ShotConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePoint: 'left' | 'right';
  targetPoint: 'left' | 'right';
}

interface ActiveConnection {
  sourceId: string;
  sourcePoint: 'left' | 'right';
  cursorX: number;
  cursorY: number;
}

interface ShotsRowProps {
  sceneId: string;
  sceneNumber: number;
  projectId: string;
  onSceneDelete?: (sceneId: string) => void;
  isSelected?: boolean;
}

const buildShotFromPartial = (
  partial: Partial<ShotDetails>,
  defaults: { sceneId: string; projectId: string; fallbackNumber: number }
): ShotDetails => ({
  id: partial.id ?? crypto.randomUUID(),
  scene_id: partial.scene_id ?? defaults.sceneId,
  project_id: partial.project_id ?? defaults.projectId,
  shot_number: partial.shot_number ?? defaults.fallbackNumber,
  shot_type: partial.shot_type ?? 'medium',
  prompt_idea: partial.prompt_idea ?? '',
  visual_prompt: partial.visual_prompt ?? '',
  dialogue: partial.dialogue ?? '',
  sound_effects: partial.sound_effects ?? '',
  image_url: partial.image_url ?? null,
  image_status: partial.image_status ?? 'completed',
  video_url: partial.video_url ?? null,
  video_status: partial.video_status ?? 'pending',
  luma_generation_id: partial.luma_generation_id ?? null,
  audio_url: partial.audio_url ?? null,
  audio_status: partial.audio_status ?? 'pending',
  failure_reason: partial.failure_reason ?? null,
  created_at: partial.created_at ?? new Date().toISOString(),
  updated_at: partial.updated_at ?? new Date().toISOString()
});

const placeholderCopy: Record<ShotStreamStatus, string> = {
  creating: 'Creating shot shell…',
  drafting: 'Drafting narrative…',
  enriching: 'Enriching details…',
  ready: 'Shot ready'
};

const ShotsRow = ({ sceneId, sceneNumber, projectId, onSceneDelete, isSelected = false }: ShotsRowProps) => {
  const [shots, setShots] = useState<ShotDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [connections, setConnections] = useState<ShotConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<ActiveConnection | null>(null);
  const [shotRefs, setShotRefs] = useState<Map<string, { x: number; y: number; width: number; height: number }>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const autoStartRef = useRef(false);

  const streamingEnabled = (import.meta.env.VITE_ENABLE_SHOT_STREAM ?? 'true') !== 'false';

  const handleStreamError = useCallback((error: Error) => {
    console.error('Shot streaming error', error);
    toast.error(`Shot streaming failed: ${error.message}`);
  }, []);

  const handleStreamReady = useCallback(
    (shot: Partial<ShotDetails>) => {
      if (!shot.id) return;
      setShots(prev => {
        const existingIndex = prev.findIndex(item => item.id === shot.id);
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = { ...next[existingIndex], ...shot };
          return next;
        }
        const fallback = buildShotFromPartial(shot, {
          sceneId,
          projectId,
          fallbackNumber: prev.length + 1
        });
        return [...prev, fallback];
      });
    },
    [projectId, sceneId]
  );

  const { isStreaming, latencyMs, messages, start: startStream } = useShotStream(projectId, {
    onShotReady: handleStreamReady,
    onError: handleStreamError
  });

  const streamingPlaceholders = useMemo(
    () => messages.filter(message => message.status !== 'ready'),
    [messages]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const hasShots = shots.length > 0;
  const hasPlaceholders = streamingEnabled && streamingPlaceholders.length > 0;

  const startShotGeneration = useCallback(() => {
    if (!streamingEnabled) return;
    performance.mark(`shot-stream:request:${sceneId}`);
    startStream({
      sceneId,
      existingShots: shots.map(s => ({ id: s.id, shot_number: s.shot_number }))
    });
    toast.info('Generating shots', {
      description: 'Streaming creative beats as they arrive'
    });
  }, [streamingEnabled, startStream, sceneId, shots]);

  // Fetch shots for this scene
  useEffect(() => {
    autoStartRef.current = false;
  }, [sceneId]);

  useEffect(() => {
    const fetchShots = async () => {
      setIsLoading(true);
      try {
        const fetched = await supabaseService.shots.listByScene(sceneId);
        setShots(fetched as ShotDetails[]);
      } catch (error: any) {
        console.error('Error fetching shots:', error);
        toast.error(`Failed to load shots: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShots();
  }, [sceneId]);

  useEffect(() => {
    if (!streamingEnabled || autoStartRef.current) return;
    if (!isLoading && shots.length === 0) {
      autoStartRef.current = true;
      startShotGeneration();
    }
  }, [streamingEnabled, isLoading, shots.length, startShotGeneration]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setIsSavingOrder(true);
      try {
        setShots(items => {
          const oldIndex = items.findIndex(item => item.id === active.id);
          const newIndex = items.findIndex(item => item.id === over.id);

          const reorderedItems = arrayMove(items, oldIndex, newIndex);
          return reorderedItems.map((item, index) => ({
            ...item,
            shot_number: index + 1
          }));
        });

        const updatedShots = shots.map((shot, index) => ({
          id: shot.id,
          shot_number: index + 1
        }));

        await Promise.all(
          updatedShots.map(shot =>
            supabaseService.shots.update(shot.id, { shot_number: shot.shot_number })
          )
        );
      } catch (error: any) {
        console.error('Error updating shot order:', error);
        toast.error(`Failed to save shot order: ${error.message}`);
      } finally {
        setIsSavingOrder(false);
      }
    }
  };

  const addShot = async () => {
    try {
      const newShotNumber = shots.length > 0
        ? Math.max(...shots.map(s => s.shot_number)) + 1
        : 1;

      const shotId = await supabaseService.shots.create({
        scene_id: sceneId,
        project_id: projectId,
        shot_number: newShotNumber,
        shot_type: 'medium',
        prompt_idea: '',
        image_status: 'pending'
      });

      const newShot = buildShotFromPartial(
        {
          id: shotId,
          shot_number: newShotNumber,
          shot_type: 'medium',
          prompt_idea: '',
          image_status: 'pending',
          image_url: '',
          audio_url: '',
          video_url: null,
          luma_generation_id: ''
        },
        { sceneId, projectId, fallbackNumber: newShotNumber }
      );

      setShots(prev => [...prev, newShot]);
      toast.success('Shot added');
    } catch (error: any) {
      console.error('Error adding shot:', error);
      toast.error(`Failed to add shot: ${error.message}`);
    }
  };

  const handleDeleteShot = async (shotId: string) => {
    try {
      await supabaseService.shots.delete(shotId);
      setShots(current => current.filter(shot => shot.id !== shotId));
      toast.success('Shot deleted');
    } catch (error: any) {
      console.error('Error deleting shot:', error);
      toast.error(`Failed to delete shot: ${error.message}`);
    }
  };

  const handleDeleteScene = async () => {
    if (!onSceneDelete) return;

    if (window.confirm(`Are you sure you want to delete Scene ${sceneNumber}? This will also delete all shots in this scene.`)) {
      setIsDeleting(true);
      try {
        await onSceneDelete(sceneId);
      } catch (error) {
        setIsDeleting(false);
      }
    }
  };

  const handleShotUpdate = async (shotId: string, updates: Partial<ShotDetails>) => {
    try {
      await supabaseService.shots.update(shotId, updates);
      setShots(prev => prev.map(shot =>
        shot.id === shotId ? { ...shot, ...updates } : shot
      ));
    } catch (error: any) {
      console.error('Error updating shot:', error);
      toast.error(`Failed to update shot: ${error.message}`);
    }
  };

  const handleConnectionPointClick = (shotId: string, point: 'left' | 'right') => {
    if (activeConnection) {
      if (activeConnection.sourceId !== shotId) {
        const newConnection: ShotConnection = {
          id: `${activeConnection.sourceId}-${shotId}`,
          sourceId: activeConnection.sourceId,
          targetId: shotId,
          sourcePoint: activeConnection.sourcePoint,
          targetPoint: point
        };
        setConnections(prev => [...prev, newConnection]);
        toast.success('Shots connected');
      }
      setActiveConnection(null);
    } else {
      setActiveConnection({
        sourceId: shotId,
        sourcePoint: point,
        cursorX: 0,
        cursorY: 0
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeConnection && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setActiveConnection({
        ...activeConnection,
        cursorX: e.clientX - rect.left,
        cursorY: e.clientY - rect.top
      });
    }
  };

  const handleMouseUp = () => {
    if (activeConnection) {
      setActiveConnection(null);
    }
  };

  const getConnectedPoints = (shotId: string) => {
    return {
      left: connections.some(c => (c.sourceId === shotId && c.sourcePoint === 'left') || (c.targetId === shotId && c.targetPoint === 'left')),
      right: connections.some(c => (c.sourceId === shotId && c.sourcePoint === 'right') || (c.targetId === shotId && c.targetPoint === 'right'))
    };
  };

  useEffect(() => {
    const updateRefs = () => {
      const newRefs = new Map();
      shots.forEach(shot => {
        const element = document.querySelector(`[data-shot-id="${shot.id}"]`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (containerRect) {
            newRefs.set(shot.id, {
              x: rect.left - containerRect.left,
              y: rect.top - containerRect.top,
              width: rect.width,
              height: rect.height
            });
          }
        }
      });
      setShotRefs(newRefs);
    };

    const timer = setTimeout(updateRefs, 100);
    return () => clearTimeout(timer);
  }, [shots]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative group mb-8 p-6 rounded-[20px] backdrop-blur-sm transition-all duration-300',
        'bg-gradient-to-br from-zinc-900/40 to-zinc-900/20',
        'border border-zinc-800/30 hover:border-zinc-700/50',
        'shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.02)]',
        isSelected && [
          'border-2 border-blue-500/60',
          'shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_12px_40px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.05)]',
          'bg-gradient-to-br from-blue-950/30 to-zinc-900/40'
        ]
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10
                backdrop-blur-sm border border-amber-500/30
                shadow-[0_0_24px_rgba(251,191,36,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
                flex items-center justify-center"
            >
              <span className="text-2xl font-bold text-amber-400 glow-text-gold">
                {sceneNumber}
              </span>
            </motion.div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400/60 rounded-full
              blur-sm animate-pulse"
            />
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-0.5">
              Scene
            </div>
            <h2 className="text-xl font-bold text-amber-400 glow-text-gold font-serif">
              Scene {sceneNumber}
            </h2>
          </div>
        </div>

        <div className="flex items-start gap-3">
          {streamingEnabled && (
            <div className="flex flex-col items-end gap-1">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={startShotGeneration}
                  size="sm"
                  className={cn(
                    'relative overflow-hidden backdrop-blur-sm',
                    'bg-gradient-to-br from-indigo-500/80 to-fuchsia-500/80',
                    'border border-indigo-400/40',
                    'shadow-[0_4px_20px_rgba(129,140,248,0.35),inset_0_1px_0_rgba(255,255,255,0.1)]',
                    'hover:shadow-[0_8px_28px_rgba(129,140,248,0.45),inset_0_1px_0_rgba(255,255,255,0.15)]',
                    'transition-all duration-300'
                  )}
                  disabled={isLoading || isStreaming}
                  aria-live="polite"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                  {isStreaming ? (
                    <Loader2 className="relative z-10 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="relative z-10 h-4 w-4" />
                  )}
                  <span className="relative z-10 ml-2">{isStreaming ? 'Streaming…' : 'Auto-generate'}</span>
                </Button>
              </motion.div>
              {latencyMs !== null && (
                <span className="text-xs text-blue-200/80">
                  First chunk {Math.round(latencyMs)} ms
                </span>
              )}
            </div>
          )}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={addShot}
              size="sm"
              className={cn(
                'relative overflow-hidden backdrop-blur-sm',
                'bg-gradient-to-br from-blue-600/90 to-purple-600/90',
                'border border-blue-500/30',
                'shadow-[0_4px_20px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]',
                'hover:shadow-[0_6px_28px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]',
                'transition-all duration-300'
              )}
              disabled={isLoading || isSavingOrder}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
              <Plus className="w-4 h-4 mr-2 relative z-10" />
              <span className="relative z-10">Add Shot</span>
            </Button>
          </motion.div>

          {onSceneDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    onClick={handleDeleteScene}
                    className={cn(
                      'backdrop-blur-sm bg-red-950/20 border border-red-500/30',
                      'hover:bg-red-900/40 hover:border-red-500/50',
                      'shadow-[0_2px_12px_rgba(239,68,68,0.2)]',
                      'hover:shadow-[0_4px_20px_rgba(239,68,68,0.3)]',
                      'transition-all duration-300'
                    )}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent className="glass-panel border-zinc-700">
                <p className="text-xs">Delete scene and all shots</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <ScrollArea className="pb-3">
        <div
          ref={containerRef}
          className={cn(
            'flex space-x-4 pb-3 px-2 min-h-[180px]',
            'perspective-1000 transform-style-3d relative',
            'before:absolute before:inset-0 before:pointer-events-none',
            'before:bg-[radial-gradient(circle,rgba(59,130,246,0.08)_1px,transparent_1px)]',
            'before:bg-[length:20px_20px]',
            'before:opacity-50'
          )}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <ShotConnectionLines connections={connections} shotRefs={shotRefs} />

          {activeConnection && shotRefs.get(activeConnection.sourceId) && (
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
              <defs>
                <linearGradient id="preview-gradient">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <path
                d={(() => {
                  const source = shotRefs.get(activeConnection.sourceId)!;
                  const sourceX = activeConnection.sourcePoint === 'left' ? source.x : source.x + source.width;
                  const sourceY = source.y + source.height / 2;
                  return `M ${sourceX} ${sourceY} L ${activeConnection.cursorX} ${activeConnection.cursorY}`;
                })()}
                stroke="url(#preview-gradient)"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
                className="animate-[dash_1s_linear_infinite]"
              />
            </svg>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center w-full text-zinc-500">
              <span className="animate-spin mr-2">◌</span> Loading shots...
            </div>
          ) : hasShots ? (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext items={shots.map(shot => shot.id)} strategy={horizontalListSortingStrategy}>
                <AnimatePresence initial={false}>
                  {shots.map((shot, index) => (
                    <motion.div
                      key={shot.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      data-shot-id={shot.id}
                    >
                      <ShotCard
                        shot={shot}
                        onUpdate={(updates) => handleShotUpdate(shot.id, updates)}
                        onDelete={() => handleDeleteShot(shot.id)}
                        onConnectionPointClick={handleConnectionPointClick}
                        connectedPoints={getConnectedPoints(shot.id)}
                        isSelected={false}
                      />
                    </motion.div>
                  ))}
                  {streamingEnabled && streamingPlaceholders.map((placeholder, index) => (
                    <motion.div
                      key={`placeholder-${placeholder.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.25, delay: index * 0.08 }}
                    >
                      <ShotCardSkeleton label={placeholderCopy[placeholder.status]} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </SortableContext>
            </DndContext>
          ) : hasPlaceholders ? (
            <div className="flex flex-wrap gap-4">
              {streamingPlaceholders.map((placeholder, index) => (
                <motion.div
                  key={`placeholder-${placeholder.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, delay: index * 0.08 }}
                >
                  <ShotCardSkeleton label={placeholderCopy[placeholder.status]} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={cn(
              'flex flex-col items-center justify-center w-full py-12',
              'rounded-xl bg-zinc-900/20 backdrop-blur-sm',
              'border border-dashed border-zinc-700/50'
            )}>
              <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center mb-4
                shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]">
                <AlertCircle className="w-6 h-6 text-zinc-500" />
              </div>

              <p className="text-zinc-400 text-sm mb-4">No shots in this scene yet.</p>

              <Button
                variant="ghost"
                className={cn(
                  'border border-zinc-700/50 bg-zinc-900/30',
                  'hover:bg-zinc-800/50 hover:border-zinc-600/50',
                  'text-zinc-300 hover:text-white'
                )}
                onClick={addShot}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add your first shot
              </Button>
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </motion.div>
  );
};

export default ShotsRow;
