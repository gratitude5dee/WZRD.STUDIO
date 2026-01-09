
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ModelListItem } from './StudioUtils';
import ModelSelector, { Model } from './ModelSelector';

interface StudioSidePanelsProps {
  selectedBlockType: 'text' | 'image' | 'video' | null;
}

// Text models with their icons
const TEXT_MODELS: Model[] = [
  { id: 'gemini-2-flash', name: 'Gemini 2.0 Flash', credits: 2, time: '~4s', description: 'A powerful language model from Gemini.' },
  { id: 'gpt4o-mini', name: 'GPT 4o Mini', credits: 2, time: '~4s' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', credits: 2, time: '~4s' },
];

// Image models with their icons - using full Fal.ai model IDs
const IMAGE_MODELS: Model[] = [
  { id: 'fal-ai/flux/dev', name: 'Flux Dev', credits: 42, time: '~10s', description: 'Highly customizable image model.' },
  { id: 'fal-ai/flux-pro/v1.1', name: 'Flux Pro 1.1', credits: 75, time: '~24s' },
  { id: 'fal-ai/ideogram/v2', name: 'Ideogram 2.0', credits: 100, time: '~18s' },
  { id: 'fal-ai/recraft-v3', name: 'Recraft V3', credits: 50, time: '~14s' },
  { id: 'fal-ai/flux/schnell', name: 'Flux Schnell', credits: 20, time: '~3s', description: 'Ultra-fast generation.' },
];

// Video models with their icons - using full Fal.ai model IDs
const VIDEO_MODELS: Model[] = [
  { id: 'fal-ai/minimax/video-01', name: 'Hailuo Minimax', credits: 375, time: '~4m', description: 'Powerful, motion-heavy model.' },
  { id: 'fal-ai/magi-1', name: 'MAGI-1', credits: 200, time: '~30s', description: 'Fast video generation.' },
  { id: 'fal-ai/wan/v2.1/text-to-video', name: 'WAN 2.1', credits: 438, time: '~3m' },
  { id: 'fal-ai/kling-video/v1.6/pro/text-to-video', name: 'Kling Pro 1.6', credits: 419, time: '~5m' },
  { id: 'fal-ai/kling-video/v1.5/pro/text-to-video', name: 'Kling Pro 1.5', credits: 625, time: '~5m' },
  { id: 'fal-ai/luma-dream-machine', name: 'Luma Dream', credits: 500, time: '~2m' },
  { id: 'fal-ai/pika/v2', name: 'Pika', credits: 563, time: '~30s' },
  { id: 'fal-ai/ltx-video/v0.9.1', name: 'Lightricks LTXV', credits: 25, time: '~10s' },
];

export const StudioRightPanel = ({ selectedBlockType }: StudioSidePanelsProps) => {
// Model selector state - using full model IDs
  const [textModelId, setTextModelId] = useState('gemini-2-flash');
  const [imageModelId, setImageModelId] = useState('fal-ai/flux/dev');
  const [videoModelId, setVideoModelId] = useState('fal-ai/magi-1');
  
  // Model dropdown states
  const [showTextModelDropdown, setShowTextModelDropdown] = useState(false);
  const [showImageModelDropdown, setShowImageModelDropdown] = useState(false);
  const [showVideoModelDropdown, setShowVideoModelDropdown] = useState(false);
  
  // Image settings state
  const [quality, setQuality] = useState(100);
  const [seed, setSeed] = useState('339071969');
  const [size, setSize] = useState('1:1');
  
  // If no block is selected, return empty panel
  if (!selectedBlockType) {
    return <div className="w-64 h-full bg-black border-l border-zinc-800/50"></div>;
  }
  
  // Get models based on selected block type
  const getModels = () => {
    switch (selectedBlockType) {
      case 'text':
        return TEXT_MODELS;
      case 'image':
        return IMAGE_MODELS;
      case 'video':
        return VIDEO_MODELS;
      default:
        return [];
    }
  };
  
  // Get selected model id based on block type
  const getSelectedModelId = () => {
    switch (selectedBlockType) {
      case 'text':
        return textModelId;
      case 'image':
        return imageModelId;
      case 'video':
        return videoModelId;
      default:
        return '';
    }
  };
  
  // Handle model selection based on block type
  const handleModelSelect = (modelId: string) => {
    switch (selectedBlockType) {
      case 'text':
        setTextModelId(modelId);
        break;
      case 'image':
        setImageModelId(modelId);
        break;
      case 'video':
        setVideoModelId(modelId);
        break;
    }
  };
  
  // Toggle model dropdown based on block type
  const toggleModelDropdown = () => {
    switch (selectedBlockType) {
      case 'text':
        setShowTextModelDropdown(!showTextModelDropdown);
        break;
      case 'image':
        setShowImageModelDropdown(!showImageModelDropdown);
        break;
      case 'video':
        setShowVideoModelDropdown(!showVideoModelDropdown);
        break;
    }
  };
  
  // Get dropdown state based on block type
  const getDropdownState = () => {
    switch (selectedBlockType) {
      case 'text':
        return showTextModelDropdown;
      case 'image':
        return showImageModelDropdown;
      case 'video':
        return showVideoModelDropdown;
      default:
        return false;
    }
  };
  
  return (
    <div className="w-64 h-full bg-zinc-900/75 border-l border-zinc-800/50">
      <div className="p-5 space-y-6">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 font-medium">MODEL</label>
          <ModelSelector
            models={getModels()}
            selectedModelId={getSelectedModelId()}
            onModelSelect={handleModelSelect}
            modelType={selectedBlockType}
            isOpen={getDropdownState()}
            toggleOpen={toggleModelDropdown}
          />
        </div>
        
        {(selectedBlockType === 'image' || selectedBlockType === 'video') && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs text-zinc-500 font-medium">QUALITY</label>
                <span className="text-white">{quality}</span>
              </div>
              <Slider 
                value={[quality]}
                min={1} 
                max={100} 
                step={1}
                onValueChange={(value) => setQuality(value[0])}
                className="mt-2"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 font-medium">SIZE</label>
              <button className="w-full flex items-center justify-between p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-md">
                <span className="text-zinc-300">Square (1:1)</span>
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 font-medium">SEED</label>
              <Input 
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
