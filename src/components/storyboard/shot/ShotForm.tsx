
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2 } from 'lucide-react';
import { useAIGeneration } from './useAIGeneration';
import { useAudioGeneration } from './useAudioGeneration';
import ShotAudio from './ShotAudio';
import { ImageStatus, AudioStatus } from '@/types/storyboardTypes';

interface ShotFormProps {
  id?: string;
  shotType: string | null;
  promptIdea: string | null;
  dialogue: string | null;
  soundEffects?: string | null;
  visualPrompt?: string;
  imageStatus?: ImageStatus;
  audioUrl?: string | null;
  audioStatus?: AudioStatus;
  isGeneratingPrompt?: boolean;
  isGeneratingImage?: boolean;
  isGeneratingAudio?: boolean;
  isGeneratingRef?: React.MutableRefObject<boolean>;
  onShotTypeChange: (value: string) => void;
  onPromptIdeaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDialogueChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSoundEffectsChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setLocalVisualPrompt?: (prompt: string) => void;
  setLocalImageStatus?: (status: ImageStatus) => void;
  setIsGeneratingPrompt?: (isGenerating: boolean) => void;
  setIsGeneratingImage?: (isGenerating: boolean) => void;
  setLocalAudioUrl?: (url: string | null) => void;
  setLocalAudioStatus?: (status: AudioStatus) => void;
  setIsGeneratingAudio?: (isGenerating: boolean) => void;
  onSave?: () => Promise<void>;
  onCancel?: () => void;
  isExpanded?: boolean;
}

const shotTypeOptions = [
  { value: 'wide', label: 'Wide Shot' },
  { value: 'medium', label: 'Medium Shot' },
  { value: 'close', label: 'Close-Up' },
  { value: 'extreme_close_up', label: 'Extreme Close-Up' },
  { value: 'establishing', label: 'Establishing Shot' },
  { value: 'pov', label: 'POV Shot' },
  { value: 'over_the_shoulder', label: 'Over-the-Shoulder' },
  { value: 'aerial', label: 'Aerial Shot' },
  { value: 'low_angle', label: 'Low Angle' },
  { value: 'high_angle', label: 'High Angle' },
  { value: 'dutch_angle', label: 'Dutch Angle' },
  { value: 'tracking', label: 'Tracking Shot' },
  { value: 'insert', label: 'Insert Shot' },
];

const ShotForm: React.FC<ShotFormProps> = ({
  id,
  shotType,
  promptIdea,
  dialogue,
  soundEffects,
  visualPrompt = '',
  imageStatus = 'pending',
  audioUrl = null,
  audioStatus = 'pending',
  isGeneratingPrompt = false,
  isGeneratingImage = false,
  isGeneratingAudio = false,
  isGeneratingRef,
  onShotTypeChange,
  onPromptIdeaChange,
  onDialogueChange,
  onSoundEffectsChange,
  setLocalVisualPrompt,
  setLocalImageStatus,
  setIsGeneratingPrompt,
  setIsGeneratingImage,
  setLocalAudioUrl,
  setLocalAudioStatus,
  setIsGeneratingAudio,
  onSave,
  onCancel,
  isExpanded
}) => {
  const aiGenerationProps = id && setIsGeneratingPrompt && setIsGeneratingImage &&
    setLocalVisualPrompt && setLocalImageStatus && isGeneratingRef
    ? {
        shotId: id,
        isGeneratingRef,
        setIsGeneratingPrompt,
        setIsGeneratingImage,
        setLocalVisualPrompt,
        setLocalImageStatus,
        localVisualPrompt: visualPrompt
      }
    : null;
  const { handleGenerateVisualPrompt, handleGenerateImage } = aiGenerationProps
    ? useAIGeneration(aiGenerationProps)
    : { handleGenerateVisualPrompt: () => {}, handleGenerateImage: () => {} };

  const audioGenerationProps = id && setIsGeneratingAudio && setLocalAudioUrl &&
    setLocalAudioStatus && isGeneratingRef
    ? {
        shotId: id,
        isGeneratingRef,
        setIsGeneratingAudio,
        setLocalAudioUrl,
        setLocalAudioStatus
      }
    : null;
  const { handleGenerateAudio } = audioGenerationProps
    ? useAudioGeneration(audioGenerationProps)
    : { handleGenerateAudio: async () => {} }; // Make the fallback async

  // Create an async wrapper for onSave that works with any return type
  const handleSaveClick = async () => {
    if (onSave) {
      // Call onSave and wait for it to complete if it returns a Promise
      await onSave();
    }
  };

  return (
    <div className="p-3 space-y-3 text-xs">
      <div>
        <Label htmlFor={`shot-type-${id}`} className="text-[10px] font-medium uppercase text-zinc-400 mb-0.5 block">
          Shot Type
        </Label>
        <Select value={shotType || 'medium'} onValueChange={onShotTypeChange}>
          <SelectTrigger id={`shot-type-${id}`} className="glass-input border-white/10 text-white text-[10px] h-7">
            <SelectValue placeholder="Select shot type" />
          </SelectTrigger>
          <SelectContent className="bg-black/80 backdrop-blur-md border-white/10 text-white">
            {shotTypeOptions.map(option => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={`prompt-idea-${id}`} className="text-[10px] font-medium uppercase text-zinc-400 mb-0.5 block">
          Shot Description
        </Label>
        <Textarea
          id={`prompt-idea-${id}`}
          value={promptIdea || ''}
          onChange={onPromptIdeaChange}
          className="glass-input text-white resize-none min-h-[60px] text-[11px]"
          placeholder="Describe what's happening..."
        />
      </div>
      <div>
        <Label htmlFor={`dialogue-${id}`} className="text-[10px] font-medium uppercase text-zinc-400 mb-0.5 block">
          Dialogue/VO
        </Label>
        <Textarea
          id={`dialogue-${id}`}
          value={dialogue || ''}
          onChange={onDialogueChange}
          className={`glass-input text-white resize-none min-h-[40px] text-[11px] ${
            !dialogue ? 'animate-pulse bg-gradient-to-r from-zinc-900/50 to-zinc-800/50' : ''
          }`}
          placeholder={!dialogue ? "Generating dialogue..." : "Spoken words..."}
        />
        {id && setIsGeneratingAudio && setLocalAudioUrl && setLocalAudioStatus && isGeneratingRef && (
          <ShotAudio
            audioUrl={audioUrl}
            status={audioStatus}
            isGenerating={isGeneratingAudio}
            hasDialogue={!!dialogue}
            onGenerateAudio={handleGenerateAudio}
          />
        )}
      </div>
      {onSoundEffectsChange && (
        <div>
          <Label htmlFor={`sound-effects-${id}`} className="text-[10px] font-medium uppercase text-zinc-400 mb-0.5 block">
            Sound FX
          </Label>
          <Textarea
            id={`sound-effects-${id}`}
            value={soundEffects || ''}
            onChange={onSoundEffectsChange}
            className={`glass-input text-white resize-none min-h-[40px] text-[11px] ${
              !soundEffects ? 'animate-pulse bg-gradient-to-r from-zinc-900/50 to-zinc-800/50' : ''
            }`}
            placeholder={!soundEffects ? "Generating sound effects..." : "e.g., footsteps, rain..."}
          />
        </div>
      )}
      {id && setIsGeneratingPrompt && setIsGeneratingImage && setLocalVisualPrompt &&
       setLocalImageStatus && isGeneratingRef && (
        <div className="mt-2">
          <Label htmlFor={`visual-prompt-${id}`} className="text-[10px] font-medium uppercase text-zinc-400 mb-0.5 flex justify-between items-center">
            <span>Visual Prompt</span>
            {(imageStatus === 'pending' || imageStatus === 'failed') && (
              <button
                onClick={handleGenerateVisualPrompt}
                className="text-blue-400 text-[9px] hover:text-blue-300 disabled:text-zinc-500"
                disabled={isGeneratingPrompt || isGeneratingImage || !promptIdea}
              >
                {isGeneratingPrompt ? 'Generating...' : 'Generate'}
              </button>
            )}
          </Label>
          <Textarea
            id={`visual-prompt-${id}`}
            value={visualPrompt || ''}
            readOnly
            className="glass-input text-white resize-none min-h-[60px] text-[10px] opacity-75"
            placeholder="Visual prompt will appear here..."
          />
          {visualPrompt && ['prompt_ready', 'failed', 'completed'].includes(imageStatus) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-1 w-full text-purple-400 border-purple-500/30 hover:bg-purple-500/10 h-7 text-xs bg-black/30 backdrop-blur-sm"
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || isGeneratingPrompt}
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImagePlus className="h-3 w-3 mr-1" />
                  Generate Image
                </>
              )}
            </Button>
          )}
        </div>
      )}
      {(onSave || onCancel) && (
        <div className="flex justify-end space-x-2 pt-1 mt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="text-zinc-400 border-white/10 hover:bg-white/5 h-7 text-xs bg-black/30 backdrop-blur-sm"
            >
              Cancel
            </Button>
          )}
          {onSave && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleSaveClick}
              className="bg-purple-600/80 hover:bg-purple-700/80 backdrop-blur-sm h-7 text-xs"
            >
              Save
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ShotForm;
