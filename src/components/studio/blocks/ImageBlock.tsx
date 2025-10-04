
import React, { useState } from 'react';
import { Sparkles, Edit } from 'lucide-react';
import BlockBase, { ConnectionPoint } from './BlockBase';
import { useGeminiImage } from '@/hooks/useGeminiImage';
import { geminiImageModel } from '@/types/modelTypes';

export interface ImageBlockProps {
  id: string;
  onSelect: () => void;
  isSelected: boolean;
  supportsConnections?: boolean;
  connectionPoints?: ConnectionPoint[];
  onStartConnection?: (blockId: string, pointId: string, e: React.MouseEvent) => void;
  onFinishConnection?: (blockId: string, pointId: string) => void;
  onShowHistory?: () => void;
  onDragEnd?: (position: { x: number, y: number }) => void;
  onRegisterRef?: (blockId: string, element: HTMLElement | null, connectionPoints: Record<string, { x: number; y: number }>) => void;
  getInput?: (blockId: string, inputId: string) => any;
  setOutput?: (blockId: string, outputId: string, value: any) => void;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ 
  id, 
  onSelect, 
  isSelected,
  supportsConnections,
  connectionPoints,
  onStartConnection,
  onFinishConnection,
  onShowHistory,
  onDragEnd,
  onRegisterRef,
  getInput,
  setOutput
}) => {
  const [prompt, setPrompt] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const { isGenerating, imageUrl, generateImage, editImage } = useGeminiImage();

  // Check for connected input and use it as prompt if available
  React.useEffect(() => {
    if (getInput) {
      const connectedInput = getInput(id, 'prompt-input');
      if (connectedInput && typeof connectedInput === 'string') {
        setPrompt(connectedInput);
      }
    }
  }, [getInput, id]);

  // Update output whenever image is generated
  React.useEffect(() => {
    if (imageUrl && setOutput) {
      setOutput(id, 'image-output', imageUrl);
    }
  }, [imageUrl, setOutput, id]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    if (editMode && imageUrl) {
      editImage(imageUrl, prompt);
    } else {
      generateImage(prompt);
    }
  };

  return (
    <BlockBase
      id={id}
      type="image"
      title="IMAGE"
      onSelect={onSelect}
      isSelected={isSelected}
      generationTime="~8s"
      supportsConnections={supportsConnections}
      connectionPoints={connectionPoints}
      onShowHistory={onShowHistory}
      onStartConnection={onStartConnection}
      onFinishConnection={onFinishConnection}
      onDragEnd={onDragEnd}
      onRegisterRef={onRegisterRef}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-zinc-400">{geminiImageModel.name}</span>
          </div>
          <span className="text-green-400 text-xs">FREE</span>
        </div>

        {imageUrl ? (
          <div className="space-y-3">
            <div className="relative group">
              <img
                src={imageUrl}
                alt="Generated"
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => setEditMode(true)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded"
                >
                  <Edit size={16} />
                </button>
              </div>
            </div>

            {editMode && (
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 px-3 py-1.5 rounded text-sm focus:outline-none focus:border-purple-500"
                placeholder="Describe how to edit the image..."
              />
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 flex flex-col gap-3 min-h-[150px] bg-zinc-800/20">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 px-3 py-1.5 rounded text-sm focus:outline-none focus:border-purple-500"
              placeholder="Describe the image you want to create..."
              disabled={isGenerating}
            />
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded shadow-glow-purple-sm hover:shadow-glow-purple-md transition-all-std disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {editMode ? 'Edit Image' : 'Generate Image'}
            </>
          )}
        </button>
      </div>
    </BlockBase>
  );
};

export default ImageBlock;
