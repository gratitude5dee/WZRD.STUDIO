import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, ChevronDown, Settings, Image as ImageIcon, 
  Type, Video, Wand2, Check, MoreHorizontal
} from 'lucide-react';
import { ImageCountSelector } from './ImageCountSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { ModelListItem } from '../StudioUtils';

interface Model {
  id: string;
  name: string;
  description?: string;
  credits?: number;
  time?: string;
  icon?: string;
}

interface BlockFloatingToolbarProps {
  blockType: 'text' | 'image' | 'video';
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  aspectRatio?: string;
  onAspectRatioChange?: (ratio: string) => void;
  onSettingsClick?: () => void;
  models?: Model[];
  className?: string;
  generationCount?: number;
  onGenerationCountChange?: (count: number) => void;
  onAISuggestion?: () => void;
}

const ASPECT_RATIOS = [
  { label: '1:1', value: '1:1' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
];

const DEFAULT_MODELS = {
  text: [
    { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast and efficient', credits: 1, time: '~2s', icon: 'sparkles-blue' },
    { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Previous generation', credits: 1, time: '~3s', icon: 'sparkles-blue' },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most capable Gemini', credits: 5, time: '~8s', icon: 'sparkles-blue' },
    { id: 'openai/gpt-5', name: 'GPT-5', description: 'Most capable', credits: 26, time: '~12s', icon: 'sparkles' },
    { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Balanced performance', credits: 8, time: '~6s', icon: 'sparkles' },
    { id: 'openai/gpt-4o-mini', name: 'GPT 4o Mini', description: 'Fast and affordable', credits: 2, time: '~3s', icon: 'sparkles' },
    { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4', description: 'Top-tier reasoning', credits: 20, time: '~10s', icon: 'sparkles-orange' },
    { id: 'anthropic/claude-haiku-3.5', name: 'Claude Haiku 3.5', description: 'Fast Claude model', credits: 3, time: '~4s', icon: 'sparkles-orange' },
  ],
  image: [
    { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5', description: 'Fast image generation', credits: 2, time: '~4s', icon: 'image' },
    { id: 'flux-schnell', name: 'Flux Schnell', description: 'Ultra-fast quality', credits: 3, time: '~3s', icon: 'image' },
    { id: 'flux-dev', name: 'Flux Dev', description: 'Highest quality', credits: 5, time: '~8s', icon: 'image' },
  ],
  video: [
    { id: 'gemini-2.5-flash-video', name: 'Gemini 2.5', description: 'Video generation', credits: 10, time: '~30s', icon: 'video' },
    { id: 'luma-dream', name: 'Luma Dream', description: 'Cinematic quality', credits: 25, time: '~90s', icon: 'video' },
  ],
};

const getBlockIcon = (type: 'text' | 'image' | 'video') => {
  switch (type) {
    case 'text': return Type;
    case 'image': return ImageIcon;
    case 'video': return Video;
  }
};

const getModelIcon = (iconType?: string) => {
  if (iconType === 'sparkles-blue') return <Sparkles className="h-4 w-4 text-blue-400" />;
  if (iconType === 'sparkles-orange') return <Sparkles className="h-4 w-4 text-orange-400" />;
  if (iconType === 'sparkles') return <Sparkles className="h-4 w-4 text-zinc-400" />;
  if (iconType === 'image') return <ImageIcon className="h-4 w-4 text-purple-400" />;
  if (iconType === 'video') return <Video className="h-4 w-4 text-amber-400" />;
  return <Sparkles className="h-4 w-4 text-zinc-400" />;
};

export const BlockFloatingToolbar: React.FC<BlockFloatingToolbarProps> = ({
  blockType,
  selectedModel,
  onModelChange,
  aspectRatio,
  onAspectRatioChange,
  onSettingsClick,
  models,
  className,
  generationCount = 1,
  onGenerationCountChange,
  onAISuggestion
}) => {
  const BlockIcon = getBlockIcon(blockType);
  const availableModels = models || DEFAULT_MODELS[blockType];
  const showAspectRatio = (blockType === 'image' || blockType === 'video') && aspectRatio && onAspectRatioChange;

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-zinc-800 rounded-lg shadow-lg",
        className
      )}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <TooltipProvider>
        {/* Magic Wand Icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-1.5 hover:bg-zinc-800/50 rounded-md transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onAISuggestion?.();
              }}
            >
              <Wand2 className="w-4 h-4 text-zinc-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent>AI Suggestions</TooltipContent>
        </Tooltip>

        {/* Count Selector for Image/Video blocks */}
        {(blockType === 'image' || blockType === 'video') && onGenerationCountChange && (
          <>
            <div className="w-px h-5 bg-zinc-800" />
            <ImageCountSelector
              value={generationCount}
              onChange={onGenerationCountChange}
              min={1}
              max={20}
            />
          </>
        )}

        <div className="w-px h-5 bg-zinc-800" />

        {/* Model Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-zinc-800/50 rounded-md transition-colors">
              <span className="text-xs font-medium text-zinc-300">
                {availableModels.find(m => m.id === selectedModel)?.name || selectedModel}
              </span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 bg-[#1a1a1a] border-zinc-800 p-2">
            <DropdownMenuLabel className="text-xs text-zinc-500 uppercase tracking-wider px-2">Select Model</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {availableModels.map((model) => (
                <div key={model.id} onClick={() => onModelChange(model.id)}>
                  <ModelListItem
                    icon={getModelIcon(model.icon)}
                    name={model.name}
                    description={model.description}
                    credits={model.credits || 1}
                    time={model.time || '~5s'}
                    isSelected={selectedModel === model.id}
                    onClick={() => onModelChange(model.id)}
                  />
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-5 bg-zinc-800" />

        {/* More Options Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSettingsClick?.();
              }}
              className="p-1.5 hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-zinc-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent>More Options</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
