
import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShotCard } from './shot'; // Updated import path
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { ShotDetails } from '@/types/storyboardTypes';
import { cn } from '@/lib/utils';

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
            <TooltipProvider>
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
            </TooltipProvider>
          )}
        </div>
      </div>

      <ScrollArea className="pb-3">
        <div className="flex space-x-4 pb-3 px-2 min-h-[180px] perspective-1000 transform-style-3d">
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
                    >
                      <ShotCard
                        shot={shot}
                        onUpdate={(updates) => handleShotUpdate(shot.id, updates)}
                        onDelete={() => handleDeleteShot(shot.id)}
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
