
import React, { useState, useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ShotCard } from './shot';
import ShotConnectionLines from './shot/ShotConnectionLines';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { ShotDetails } from '@/types/storyboardTypes';
import { cn } from '@/lib/utils';

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

const ShotsRow = ({ sceneId, sceneNumber, projectId, onSceneDelete, isSelected = false }: ShotsRowProps) => {
  const [shots, setShots] = useState<ShotDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [connections, setConnections] = useState<ShotConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<ActiveConnection | null>(null);
  const [shotRefs, setShotRefs] = useState<Map<string, { x: number; y: number; width: number; height: number }>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Fetch shots for this scene
  useEffect(() => {
    const fetchShots = async () => {
      setIsLoading(true);
      try {
        const shots = await supabaseService.shots.listByScene(sceneId);
        setShots(shots as ShotDetails[]);
      } catch (error: any) {
        console.error("Error fetching shots:", error);
        toast.error(`Failed to load shots: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShots();
  }, [sceneId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setIsSavingOrder(true);
      try {
        // Update shots array locally
        setShots((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          
          const reorderedItems = arrayMove(items, oldIndex, newIndex);
          
          // Update shot_number for all affected items
          return reorderedItems.map((item, index) => ({
            ...item,
            shot_number: index + 1
          }));
        });

        // After state update, save the new order to the database
        const updatedShots = shots.map((shot, index) => ({
          id: shot.id,
          shot_number: index + 1
        }));

        // Use Promise.all to update all shots in parallel
        await Promise.all(
          updatedShots.map(shot => 
            supabaseService.shots.update(shot.id, { shot_number: shot.shot_number })
          )
        );
      } catch (error: any) {
        console.error("Error updating shot order:", error);
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
      
      const newShot: ShotDetails = {
        id: shotId,
        scene_id: sceneId,
        project_id: projectId,
        shot_number: newShotNumber,
        shot_type: 'medium',
        prompt_idea: '',
        visual_prompt: '',
        dialogue: '',
        sound_effects: '',
        image_url: '',
        image_status: 'pending',
        video_url: null,
        video_status: 'pending',
        luma_generation_id: '',
        audio_url: '',
        audio_status: 'pending',
        failure_reason: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setShots(prev => [...prev, newShot]);
      toast.success('Shot added');
    } catch (error: any) {
      console.error("Error adding shot:", error);
      toast.error(`Failed to add shot: ${error.message}`);
    }
  };

  const handleDeleteShot = async (shotId: string) => {
    try {
      await supabaseService.shots.delete(shotId);
      
      setShots(shots.filter(shot => shot.id !== shotId));
      toast.success('Shot deleted');
    } catch (error: any) {
      console.error("Error deleting shot:", error);
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
      
      // Update local state
      setShots(shots.map(shot => 
        shot.id === shotId ? { ...shot, ...updates } : shot
      ));
    } catch (error: any) {
      console.error("Error updating shot:", error);
      toast.error(`Failed to update shot: ${error.message}`);
    }
  };

  // Connection management
  const handleConnectionPointClick = (shotId: string, point: 'left' | 'right') => {
    if (activeConnection) {
      // Complete the connection
      if (activeConnection.sourceId !== shotId) {
        const newConnection: ShotConnection = {
          id: `${activeConnection.sourceId}-${shotId}`,
          sourceId: activeConnection.sourceId,
          targetId: shotId,
          sourcePoint: activeConnection.sourcePoint,
          targetPoint: point
        };
        setConnections([...connections, newConnection]);
        toast.success('Shots connected');
      }
      setActiveConnection(null);
    } else {
      // Start a new connection
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

  // Update shot refs when shots change
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
    
    // Update refs after a short delay to ensure DOM is ready
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
        "p-4 rounded-lg transition-all duration-300 mb-8 relative group",
        isSelected 
          ? "bg-purple-900/10 ring-1 ring-purple-500/30 shadow-lg" 
          : "hover:bg-white/5"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold text-[#FFB628] glow-text-gold font-serif cursor-pointer hover:opacity-80">
          SCENE {sceneNumber}
        </h2>
        <div className="flex space-x-2">
          <Button 
            onClick={addShot}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-glow-purple-sm transition-all-std"
            disabled={isLoading || isSavingOrder}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Shot
          </Button>
          
          {onSceneDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="icon"
                  disabled={isDeleting}
                  onClick={handleDeleteScene}
                  className="transition-all-std"
                >
                  {isDeleting ? (
                    <span className="animate-spin">◌</span>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete scene and all its shots</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <ScrollArea className="pb-3">
        <div 
          ref={containerRef}
          className="flex space-x-4 pb-3 px-2 min-h-[180px] perspective-1000 transform-style-3d relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(113, 113, 122, 0.08) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {/* Connection Lines */}
          <ShotConnectionLines connections={connections} shotRefs={shotRefs} />
          
          {/* Preview Connection Line */}
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
          ) : shots.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full text-zinc-500">
              <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
              <p>No shots in this scene yet.</p>
              <Button 
                variant="ghost" 
                className="mt-2 text-zinc-400 hover:text-white"
                onClick={addShot}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add your first shot
              </Button>
            </div>
          ) : (
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
                        isSelected={selectedShotId === shot.id}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </SortableContext>
            </DndContext>
          )}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </motion.div>
  );
};

export default ShotsRow;
