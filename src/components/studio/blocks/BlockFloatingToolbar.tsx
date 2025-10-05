import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, ChevronDown, Settings, Image as ImageIcon, 
  Type, Video, Wand2 
} from 'lucide-react';
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

interface Model {
  id: string;
  name: string;
  description?: string;
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
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gpt-5', name: 'GPT-5' },
    { id: 'gpt-5-mini', name: 'GPT-5 Mini' },
  ],
  image: [
    { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5' },
    { id: 'flux-dev', name: 'Flux Dev' },
    { id: 'flux-schnell', name: 'Flux Schnell' },
  ],
  video: [
    { id: 'gemini-2.5-flash-video', name: 'Gemini 2.5' },
    { id: 'luma', name: 'Luma Dream' },
  ],
};

const getBlockIcon = (type: 'text' | 'image' | 'video') => {
  switch (type) {
    case 'text': return Type;
    case 'image': return ImageIcon;
    case 'video': return Video;
  }
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
}) => {
  const BlockIcon = getBlockIcon(blockType);
  const availableModels = models || DEFAULT_MODELS[blockType];
  const showAspectRatio = (blockType === 'image' || blockType === 'video') && aspectRatio && onAspectRatioChange;

  return (
    <div 
      className={cn(
        "absolute -top-14 left-0 right-0 h-12 flex items-center gap-2 px-3",
        "bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg z-50 animate-fade-in",
        className
      )}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <TooltipProvider>
        {/* Block Type Icon */}
        <div className="flex items-center justify-center w-8 h-8 rounded bg-zinc-800/50">
          <BlockIcon className="h-4 w-4 text-zinc-400" />
        </div>

        <div className="h-6 w-px bg-zinc-700" />

        {/* Model Selector */}
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 gap-2 text-zinc-300 hover:text-white hover:bg-zinc-800"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs">{selectedModel}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Select Model</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableModels.map((model) => (
                  <DropdownMenuItem 
                    key={model.id} 
                    onClick={() => onModelChange(model.id)}
                    className={cn(selectedModel === model.name && "bg-zinc-800")}
                  >
                    {model.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>Model Selection</TooltipContent>
        </Tooltip>

        {/* Aspect Ratio Selector (Image/Video only) */}
        {showAspectRatio && (
          <>
            <div className="h-6 w-px bg-zinc-700" />
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-2 text-zinc-300 hover:text-white hover:bg-zinc-800"
                    >
                      <span className="text-xs">{aspectRatio}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Aspect Ratio</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {ASPECT_RATIOS.map((ar) => (
                      <DropdownMenuItem 
                        key={ar.value} 
                        onClick={() => onAspectRatioChange?.(ar.value)}
                        className={cn(aspectRatio === ar.value && "bg-zinc-800")}
                      >
                        {ar.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>Aspect Ratio</TooltipContent>
            </Tooltip>
          </>
        )}

        <div className="flex-1" />

        {/* Settings Button */}
        {onSettingsClick && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-zinc-800"
                onClick={onSettingsClick}
              >
                <Settings className="h-4 w-4 text-zinc-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Block Settings</TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};
