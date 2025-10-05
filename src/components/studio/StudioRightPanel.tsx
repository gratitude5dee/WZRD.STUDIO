import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ModelSelector from './ModelSelector';
import { useFalModels } from '@/hooks/useFalModels';
interface StudioRightPanelProps {
  selectedBlockType: 'text' | 'image' | 'video' | null;
  selectedBlockId?: string | null;
}
const StudioRightPanel = ({
  selectedBlockType,
  selectedBlockId
}: StudioRightPanelProps) => {
  // State for model selection per block type
  const [textModelId, setTextModelId] = useState<string>('');
  const [imageModelId, setImageModelId] = useState<string>('');
  const [videoModelId, setVideoModelId] = useState<string>('');

  // State for dropdown visibility
  const [showTextModelDropdown, setShowTextModelDropdown] = useState(false);
  const [showImageModelDropdown, setShowImageModelDropdown] = useState(false);
  const [showVideoModelDropdown, setShowVideoModelDropdown] = useState(false);

  // State for image/video settings
  const [quality, setQuality] = useState([80]);
  const [seed, setSeed] = useState('');
  const [size, setSize] = useState('1024x1024');

  // Fetch models using the hook
  const {
    models,
    isLoading,
    error
  } = useFalModels({
    autoFetch: true
  });

  // Helper functions to get models by category
  const getTextModels = () => {
    return models.filter(model => model.category === 'text-generation' || model.category === 'llm');
  };
  const getImageModels = () => {
    return models.filter(model => model.category === 'image-generation' || model.category === 'text-to-image');
  };
  const getVideoModels = () => {
    return models.filter(model => model.category === 'video-generation' || model.category === 'text-to-video');
  };
  const getModels = () => {
    switch (selectedBlockType) {
      case 'text':
        return getTextModels();
      case 'image':
        return getImageModels();
      case 'video':
        return getVideoModels();
      default:
        return [];
    }
  };
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
  const handleModelSelect = (modelId: string) => {
    switch (selectedBlockType) {
      case 'text':
        setTextModelId(modelId);
        setShowTextModelDropdown(false);
        break;
      case 'image':
        setImageModelId(modelId);
        setShowImageModelDropdown(false);
        break;
      case 'video':
        setVideoModelId(modelId);
        setShowVideoModelDropdown(false);
        break;
    }
  };
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
  const availableModels = getModels();
  const selectedModelId = getSelectedModelId();
  if (!selectedBlockType) {
    return;
  }
  return <div className="w-80 h-full bg-zinc-900 border-l border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-400 capitalize">
          {selectedBlockType} Settings
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Model Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-zinc-400">Model</Label>
          {isLoading ? <div className="text-zinc-500 text-sm">Loading models...</div> : error ? <div className="text-red-400 text-sm">Error loading models: {error}</div> : <ModelSelector models={availableModels} selectedModelId={selectedModelId} onModelSelect={handleModelSelect} modelType={selectedBlockType} isOpen={getDropdownState()} toggleOpen={toggleModelDropdown} />}
        </div>

        {/* Settings for Image and Video */}
        {(selectedBlockType === 'image' || selectedBlockType === 'video') && <>
            {/* Quality Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-zinc-400">Quality</Label>
                <span className="text-xs text-zinc-500">{quality[0]}%</span>
              </div>
              <Slider value={quality} onValueChange={setQuality} max={100} min={10} step={10} className="w-full" />
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-zinc-400">Size</Label>
              <div className="grid grid-cols-2 gap-2">
                {['512x512', '1024x1024', '1536x1024', '1024x1536'].map(sizeOption => <Button key={sizeOption} variant={size === sizeOption ? 'default' : 'outline'} size="sm" onClick={() => setSize(sizeOption)} className="text-xs">
                    {sizeOption}
                  </Button>)}
              </div>
            </div>

            {/* Seed Input */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-zinc-400">Seed</Label>
              <Input value={seed} onChange={e => setSeed(e.target.value)} placeholder="Random seed (optional)" className="text-sm" />
            </div>
          </>}
      </div>
    </div>;
};
export default StudioRightPanel;