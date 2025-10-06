import React, { useEffect, useRef } from 'react';
import { Sparkles, Image as ImageIcon, Video, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModelListItem } from './StudioUtils';

interface Model {
  id: string;
  name: string;
  description?: string;
  credits: number;
  time: string;
  icon: string;
}

interface BlockSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockType: 'text' | 'image' | 'video' | null;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const TEXT_MODELS: Model[] = [
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast and efficient', credits: 1, time: '~2s', icon: 'sparkles-blue' },
  { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Previous generation', credits: 1, time: '~3s', icon: 'sparkles-blue' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most capable Gemini', credits: 5, time: '~8s', icon: 'sparkles-blue' },
  { id: 'openai/gpt-5', name: 'GPT-5', description: 'Most capable', credits: 26, time: '~12s', icon: 'sparkles' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Balanced performance', credits: 8, time: '~6s', icon: 'sparkles' },
  { id: 'openai/gpt-4o-mini', name: 'GPT 4o Mini', description: 'Fast and affordable', credits: 2, time: '~3s', icon: 'sparkles' },
  { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4', description: 'Top-tier reasoning', credits: 20, time: '~10s', icon: 'sparkles-orange' },
  { id: 'anthropic/claude-haiku-3.5', name: 'Claude Haiku 3.5', description: 'Fast Claude model', credits: 3, time: '~4s', icon: 'sparkles-orange' },
];

const IMAGE_MODELS: Model[] = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5', description: 'Fast image generation', credits: 2, time: '~4s', icon: 'image' },
  { id: 'flux-schnell', name: 'Flux Schnell', description: 'Ultra-fast quality', credits: 3, time: '~3s', icon: 'image' },
  { id: 'flux-dev', name: 'Flux Dev', description: 'Highest quality', credits: 5, time: '~8s', icon: 'image' },
];

const VIDEO_MODELS: Model[] = [
  { id: 'gemini-2.5-flash-video', name: 'Veo 3 Fast', description: 'Fast video generation', credits: 10, time: '~30s', icon: 'video' },
  { id: 'luma-dream', name: 'Luma Dream', description: 'Cinematic quality', credits: 25, time: '~90s', icon: 'video' },
];

const getModelsForBlockType = (blockType: 'text' | 'image' | 'video' | null): Model[] => {
  if (blockType === 'text') return TEXT_MODELS;
  if (blockType === 'image') return IMAGE_MODELS;
  if (blockType === 'video') return VIDEO_MODELS;
  return [];
};

const getModelIcon = (iconType: string) => {
  if (iconType === 'sparkles-blue') return <Sparkles className="h-4 w-4 text-blue-400" />;
  if (iconType === 'sparkles-orange') return <Sparkles className="h-4 w-4 text-orange-400" />;
  if (iconType === 'sparkles') return <Sparkles className="h-4 w-4 text-zinc-400" />;
  if (iconType === 'image') return <ImageIcon className="h-4 w-4 text-purple-400" />;
  if (iconType === 'video') return <Video className="h-4 w-4 text-amber-400" />;
  return <Sparkles className="h-4 w-4 text-zinc-400" />;
};

const BlockSettingsModal: React.FC<BlockSettingsModalProps> = ({
  isOpen,
  onClose,
  blockType,
  selectedModel,
  onModelChange,
}) => {
  const models = getModelsForBlockType(blockType);
  const currentModel = models.find(m => m.id === selectedModel);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="fixed top-[66px] right-4 w-80 bg-[#1a1a1a] border border-zinc-800 text-white shadow-2xl rounded-lg z-[100]"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Model</h3>
          <div className="flex items-center gap-2">
            {currentModel && getModelIcon(currentModel.icon)}
            <span className="text-sm font-semibold text-white">
              {currentModel?.name || 'Select Model'}
            </span>
          </div>
        </div>

        {/* Model List */}
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {models.map((model) => (
            <ModelListItem
              key={model.id}
              icon={getModelIcon(model.icon)}
              name={model.name}
              description={model.description}
              credits={model.credits}
              time={model.time}
              isSelected={selectedModel === model.id}
              onClick={() => onModelChange(model.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlockSettingsModal;
