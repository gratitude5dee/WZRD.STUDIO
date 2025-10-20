import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, ChevronDown, Settings, Image as ImageIcon, 
  Type, Video, Wand2, Check, MoreHorizontal, Zap, TrendingUp, Target
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ModelListItem } from '../StudioUtils';
import { motion } from 'framer-motion';

// Model configurations with enhanced metadata
const MODEL_METADATA = {
  text: [
    { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast & balanced', badge: 'Free', icon: Zap, color: 'text-green-400' },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Best reasoning & context', badge: 'Premium', icon: Target, color: 'text-purple-400' },
    { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Efficient & affordable', badge: 'Paid', icon: TrendingUp, color: 'text-blue-400' },
    { id: 'openai/gpt-5', name: 'GPT-5', description: 'Top performance', badge: 'Paid', icon: Target, color: 'text-orange-400' }
  ],
  image: [
    { id: 'google/gemini-2.5-flash-image-preview', name: 'Gemini 2.5 Flash', description: 'Fast AI image generation', badge: 'Free', icon: Zap, color: 'text-green-400' },
    { id: 'fal-ai/flux-pro/v1.1', name: 'Flux Pro', description: 'Highest quality', badge: 'Premium', icon: Target, color: 'text-purple-400' },
    { id: 'fal-ai/flux-dev', name: 'Flux Dev', description: 'Best for creative work', badge: 'Free', icon: Zap, color: 'text-green-400' },
    { id: 'fal-ai/recraft-v3', name: 'Recraft V3', description: 'Fast generation', badge: 'Free', icon: Zap, color: 'text-blue-400' }
  ],
  video: [
    { id: 'gemini-2.5-flash-video', name: 'Veo 3 Fast', description: 'Fast video generation', badge: 'Free', icon: Zap, color: 'text-green-400' },
    { id: 'luma-dream', name: 'Luma Dream', description: 'Cinematic quality', badge: 'Premium', icon: Target, color: 'text-purple-400' }
  ]
};

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
    { id: 'google/gemini-2.5-flash-image-preview', name: 'Gemini 2.5 Flash', description: 'Fast AI image generation', credits: 2, time: '~4s', icon: 'image' },
    { id: 'flux-schnell', name: 'Flux Schnell', description: 'Ultra-fast quality', credits: 3, time: '~3s', icon: 'image' },
    { id: 'flux-dev', name: 'Flux Dev', description: 'Highest quality', credits: 5, time: '~8s', icon: 'image' },
  ],
  video: [
    { id: 'gemini-2.5-flash-video', name: 'Veo 3 Fast', description: 'Fast video generation', credits: 10, time: '~30s', icon: 'video' },
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
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const BlockIcon = getBlockIcon(blockType);
  const availableModels = models || DEFAULT_MODELS[blockType];
  const metadataModels = MODEL_METADATA[blockType];
  const currentModel = metadataModels?.find(m => m.id === selectedModel) || metadataModels?.[0];
  const showAspectRatio = (blockType === 'image' || blockType === 'video') && aspectRatio && onAspectRatioChange;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ 
        duration: 0.2,
        type: 'spring',
        stiffness: 300,
        damping: 25
      }}
      className={cn(
        "flex items-center gap-2 px-3 py-2",
        "bg-gradient-to-br from-zinc-900/98 to-zinc-800/98 backdrop-blur-xl",
        "border border-zinc-700/50 rounded-xl",
        "shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]",
        className
      )}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <TooltipProvider>
        {/* Magic Wand Icon with keyboard hint */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-1.5 hover:bg-zinc-800/70 rounded-lg transition-all hover:scale-105 group/btn relative"
              onClick={(e) => {
                e.stopPropagation();
                onAISuggestion?.();
              }}
            >
              <Wand2 className="w-4 h-4 text-zinc-400 group-hover/btn:text-purple-400 transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex items-center gap-2">
            <span>AI Suggestions</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded">⌘K</kbd>
          </TooltipContent>
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

        {/* Enhanced Model Selector Dropdown */}
        <DropdownMenu open={isModelMenuOpen} onOpenChange={setIsModelMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 px-3 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2"
            >
              {currentModel && <currentModel.icon className={`w-3.5 h-3.5 ${currentModel.color}`} />}
              <span>{currentModel?.name || 'Select Model'}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-64 bg-zinc-900/98 backdrop-blur-md border-zinc-800 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            align="start"
            sideOffset={8}
          >
            {metadataModels?.map((model, index) => (
              <div key={model.id}>
                {index > 0 && <DropdownMenuSeparator className="bg-zinc-800" />}
                <DropdownMenuItem
                  className="flex items-start gap-3 p-3 cursor-pointer focus:bg-zinc-800 group"
                  onClick={() => {
                    onModelChange(model.id);
                    setIsModelMenuOpen(false);
                  }}
                >
                  <div className={`w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-700 transition-colors`}>
                    <model.icon className={`w-4 h-4 ${model.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-white">{model.name}</span>
                      {selectedModel === model.id && (
                        <Check className="w-3.5 h-3.5 text-blue-400 ml-auto flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 leading-tight">{model.description}</p>
                    <Badge 
                      className={`mt-1.5 text-[10px] h-4 px-1.5 ${
                        model.badge === 'Free' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : model.badge === 'Premium'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {model.badge}
                    </Badge>
                  </div>
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-5 bg-zinc-800" />

        {/* More Options Button with keyboard hint */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSettingsClick?.();
              }}
              className="p-1.5 hover:bg-zinc-800/70 rounded-lg transition-all hover:scale-105 group/btn"
            >
              <MoreHorizontal className="w-4 h-4 text-zinc-400 group-hover/btn:text-white transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex items-center gap-2">
            <span>More Options</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded">⌘.</kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
};
