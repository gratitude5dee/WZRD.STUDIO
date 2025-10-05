import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast and efficient', credits: 1, time: '~2s', icon: 'sparkles' },
  { id: 'openai/gpt-5', name: 'GPT-5', description: 'Most capable', credits: 26, time: '~12s', icon: 'sparkles' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Balanced performance', credits: 8, time: '~6s', icon: 'sparkles' },
];

const IMAGE_MODELS: Model[] = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5', description: 'Fast image generation', credits: 2, time: '~4s', icon: 'image' },
  { id: 'flux-schnell', name: 'Flux Schnell', description: 'Ultra-fast quality', credits: 3, time: '~3s', icon: 'image' },
  { id: 'flux-dev', name: 'Flux Dev', description: 'Highest quality', credits: 5, time: '~8s', icon: 'image' },
];

const VIDEO_MODELS: Model[] = [
  { id: 'gemini-2.5-flash-video', name: 'Gemini 2.5', description: 'Video generation', credits: 10, time: '~30s', icon: 'video' },
  { id: 'luma-dream', name: 'Luma Dream', description: 'Cinematic quality', credits: 25, time: '~90s', icon: 'video' },
];

const getModelsForBlockType = (blockType: 'text' | 'image' | 'video' | null): Model[] => {
  if (blockType === 'text') return TEXT_MODELS;
  if (blockType === 'image') return IMAGE_MODELS;
  if (blockType === 'video') return VIDEO_MODELS;
  return [];
};

const getModelIcon = (iconType: string) => {
  if (iconType === 'sparkles') return <Sparkles className="h-4 w-4 text-blue-400" />;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="fixed top-4 right-4 max-w-sm w-80 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 text-white p-0 shadow-2xl translate-x-0 translate-y-0"
        style={{ transform: 'none' }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          onClose();
        }}
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
      </DialogContent>
    </Dialog>
  );
};

export default BlockSettingsModal;
