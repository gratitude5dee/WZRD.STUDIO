
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ShotForm from './ShotForm';
import ShotImage from './ShotImage';
import ShotAudio from './ShotAudio';
import { ShotDetails } from '@/types/storyboardTypes';
import { useShotCardState } from './useShotCardState';
import { useAIGeneration } from './useAIGeneration';
import { useAudioGeneration } from './useAudioGeneration';
import { Button } from '@/components/ui/button';
import { Trash2, Move, Expand } from 'lucide-react';

interface ShotCardProps {
  shot: ShotDetails;
  onUpdate: (updates: Partial<ShotDetails>) => Promise<void>;
  onDelete: () => void;
  onConnectionPointClick?: (shotId: string, point: 'left' | 'right') => void;
  connectedPoints?: { left: boolean; right: boolean };
  isSelected?: boolean;
}

export const ShotCard: React.FC<ShotCardProps> = ({ 
  shot, 
  onUpdate, 
  onDelete, 
  onConnectionPointClick,
  connectedPoints = { left: false, right: false },
  isSelected = false
}) => {
  const {
    // State
    shotType,
    promptIdea,
    dialogue,
    soundEffects,
    localVisualPrompt,
    localImageUrl,
    localImageStatus,
    localImageProgress,
    localAudioUrl,
    localAudioStatus,
    localVideoUrl,
    localVideoStatus,
    isDeleting,
    isSaving,
    isGeneratingPrompt,
    isGeneratingImage,
    isGeneratingAudio,
    isGeneratingRef,
    
    // Setters
    setShotType,
    setPromptIdea,
    setDialogue,
    setSoundEffects,
    setLocalVisualPrompt,
    setLocalImageStatus,
    setLocalAudioUrl,
    setLocalAudioStatus,
    setLocalVideoUrl,
    setLocalVideoStatus,
    setIsDeleting,
    setIsGeneratingPrompt,
    setIsGeneratingImage,
    setIsGeneratingAudio,
    
    // Handlers
    handleShotTypeChange
  } = useShotCardState(shot, onUpdate);

  // Create additional state for expanded view and editing mode
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  const { handleGenerateVisualPrompt, handleGenerateImage } = useAIGeneration({
    shotId: shot.id,
    isGeneratingRef,
    setIsGeneratingPrompt,
    setIsGeneratingImage,
    setLocalVisualPrompt,
    setLocalImageStatus,
    localVisualPrompt
  });

  const { handleGenerateAudio } = useAudioGeneration({
    shotId: shot.id,
    isGeneratingRef,
    setIsGeneratingAudio,
    setLocalAudioUrl,
    setLocalAudioStatus
  });

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: shot.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Create proper event handlers for text inputs that work with the state setters
  const handlePromptIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptIdea(e.target.value);
  };

  const handleDialogueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDialogue(e.target.value);
  };

  const handleSoundEffectsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSoundEffects(e.target.value);
  };

  // Handlers for edit form
  const handleSave = async () => {
    setIsEditing(false);
    // No Promise is being returned here, which was causing the type error
    // But our updated interface will handle this correctly now
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAddShotType = () => {
    setIsEditing(true);
  };

  const validateAndDelete = () => {
    if (window.confirm('Are you sure you want to delete this shot?')) {
      setIsDeleting(true);
      onDelete();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.15, ease: "easeOut" }
      }}
      style={style}
      ref={setNodeRef}
      className={cn(
        "relative flex flex-col rounded-2xl backdrop-blur-xl w-[280px] min-h-[320px] group",
        "shot-card-glass transition-all duration-300",
        isSelected 
          ? 'border-2 border-primary/50 shadow-[0_0_0_4px_rgba(20,184,166,0.1),0_8px_32px_rgba(20,184,166,0.2),inset_0_1px_0_rgba(255,255,255,0.04)]' 
          : 'border border-white/[0.08] hover:border-white/[0.15]',
        "shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]",
        "hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]",
        isExpanded && "min-h-[480px] w-[360px]"
      )}
    >
      {/* Connection Points - Glass style */}
      <div 
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-30",
          "w-3.5 h-3.5 rounded-full transition-all duration-300 cursor-crosshair",
          connectedPoints.left
            ? "bg-primary/90 border-2 border-primary/60 shadow-[0_0_16px_rgba(20,184,166,0.7)] animate-pulse opacity-100"
            : "bg-[rgba(24,24,32,0.8)] border-2 border-white/[0.15] opacity-0 group-hover:opacity-100 hover:w-4 hover:h-4 hover:bg-primary/80 hover:border-primary/50 hover:shadow-[0_0_16px_rgba(20,184,166,0.6)]"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onConnectionPointClick?.(shot.id, 'left');
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">
          {connectedPoints.left ? '✓' : '+'}
        </div>
      </div>
      
      <div 
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-30",
          "w-3.5 h-3.5 rounded-full transition-all duration-300 cursor-crosshair",
          connectedPoints.right
            ? "bg-primary/90 border-2 border-primary/60 shadow-[0_0_16px_rgba(20,184,166,0.7)] animate-pulse opacity-100"
            : "bg-[rgba(24,24,32,0.8)] border-2 border-white/[0.15] opacity-0 group-hover:opacity-100 hover:w-4 hover:h-4 hover:bg-primary/80 hover:border-primary/50 hover:shadow-[0_0_16px_rgba(20,184,166,0.6)]"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onConnectionPointClick?.(shot.id, 'right');
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">
          {connectedPoints.right ? '✓' : '+'}
        </div>
      </div>

      {/* Drag handle - Glass style */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing",
          "bg-[rgba(0,0,0,0.4)] hover:bg-[rgba(0,0,0,0.6)]",
          "backdrop-blur-md p-1.5 rounded-xl border border-white/[0.1]",
          "opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-auto",
          "shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
        )}
        style={{ touchAction: 'none' }}
      >
        <Move className="h-4 w-4 text-zinc-400 pointer-events-none" />
      </div>
      
      {/* Expand/Collapse button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-10 z-30 h-8 w-8 p-1 bg-black/30 hover:bg-black/50 backdrop-blur-sm opacity-70 hover:opacity-100 transition-opacity pointer-events-auto"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Expand className="h-5 w-5 text-white" />
      </Button>
      
      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-2 right-2 z-30 h-8 w-8 p-1 bg-black/30 hover:bg-black/50 backdrop-blur-sm opacity-70 hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 pointer-events-auto"
        onClick={validateAndDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-5 w-5" />
      </Button>

      {/* Shot number badge - Glass pill style */}
      <motion.div 
        className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-amber/20 backdrop-blur-md text-amber border border-amber/25 text-[10px] font-semibold px-2.5 py-1 rounded-full"
        whileHover={{ scale: 1.05 }}
      >
        Shot {shot.shot_number}
      </motion.div>

      {/* Image section */}
      <div className="flex-shrink-0 pointer-events-auto" style={{ touchAction: 'auto' }}>
        <ShotImage
          shotId={shot.id}
          imageUrl={localImageUrl}
          videoUrl={localVideoUrl}
          videoStatus={localVideoStatus || 'pending'}
          status={localImageStatus}
          imageProgress={localImageProgress}
          isGenerating={isGeneratingPrompt || isGeneratingImage}
          hasVisualPrompt={!!localVisualPrompt}
          visualPrompt={localVisualPrompt}
          upscaleStatus={shot.upscale_status}
          onGenerateImage={handleGenerateImage}
          onGenerateVisualPrompt={handleGenerateVisualPrompt}
          onUpdate={(updates) => onUpdate(updates)}
        />
      </div>

      {/* Shot details */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        {isEditing ? (
          <ShotForm
            id={shot.id}
            shotType={shotType}
            promptIdea={promptIdea}
            dialogue={dialogue}
            soundEffects={soundEffects}
            visualPrompt={localVisualPrompt}
            imageStatus={localImageStatus}
            audioUrl={localAudioUrl}
            audioStatus={localAudioStatus}
            isGeneratingPrompt={isGeneratingPrompt}
            isGeneratingImage={isGeneratingImage}
            isGeneratingAudio={isGeneratingAudio}
            isGeneratingRef={isGeneratingRef}
            onShotTypeChange={handleShotTypeChange}
            onPromptIdeaChange={handlePromptIdeaChange}
            onDialogueChange={handleDialogueChange}
            onSoundEffectsChange={handleSoundEffectsChange}
            setLocalVisualPrompt={setLocalVisualPrompt}
            setLocalImageStatus={setLocalImageStatus}
            setIsGeneratingPrompt={setIsGeneratingPrompt}
            setIsGeneratingImage={setIsGeneratingImage}
            setLocalAudioUrl={setLocalAudioUrl}
            setLocalAudioStatus={setLocalAudioStatus}
            setIsGeneratingAudio={setIsGeneratingAudio}
            onSave={handleSave}
            onCancel={handleCancel}
            isExpanded={isExpanded}
          />
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 mb-2">
              {!shotType ? (
                <button 
                  onClick={handleAddShotType}
                  className="text-xs text-zinc-400 hover:text-zinc-300 mb-1 hover:underline"
                >
                  + Add shot type
                </button>
              ) : (
                <div className="text-xs text-purple-300 mb-1">
                  {shotType.replace(/_/g, ' ')}
                </div>
              )}
              
              <div className="text-xs text-zinc-400 line-clamp-3 mb-2">
                {promptIdea || "No description"}
              </div>
              
              {isExpanded && localVisualPrompt && (
                <div className="text-xs text-zinc-500 mt-1 border-t border-white/10 pt-1">
                  <span className="text-zinc-400 font-medium">Visual Prompt:</span>
                  <p className="line-clamp-4">{localVisualPrompt}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col mt-auto">
              {dialogue && (
                <div className="text-xs text-zinc-400 border-t border-white/10 pt-1 mb-1">
                  <span className="text-zinc-300 font-medium">Dialogue:</span>
                  <p className="italic line-clamp-2">{dialogue}</p>
                </div>
              )}
              
              <div className="flex justify-between mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-950/20 p-1 h-auto"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              </div>
              
              {/* Audio generation */}
              <ShotAudio
                audioUrl={localAudioUrl}
                status={localAudioStatus}
                isGenerating={isGeneratingAudio}
                hasDialogue={!!dialogue}
                onGenerateAudio={handleGenerateAudio}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
