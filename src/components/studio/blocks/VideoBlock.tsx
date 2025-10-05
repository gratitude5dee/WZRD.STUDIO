import React, { useState } from 'react';
import { Upload, Play, Pause, Sparkles } from 'lucide-react';
import BlockBase, { ConnectionPoint } from './BlockBase';
import { useGeminiVideo } from '@/hooks/useGeminiVideo';
import { geminiVideoModel } from '@/types/modelTypes';
import { BlockFloatingToolbar } from './BlockFloatingToolbar';

export interface VideoBlockProps {
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
  onInputFocus?: () => void;
  onInputBlur?: () => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

const VideoBlock: React.FC<VideoBlockProps> = ({ 
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
  setOutput,
  onInputFocus,
  onInputBlur,
  selectedModel: externalSelectedModel,
  onModelChange: externalOnModelChange
}) => {
  const [prompt, setPrompt] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const { isGenerating, videoUrl, progress, generateVideo } = useGeminiVideo();

  // Use external model if provided, otherwise use default
  const selectedModel = externalSelectedModel || 'gemini-2.5-flash-video';
  const getModelDisplayName = (modelId: string) => {
    if (modelId === 'gemini-2.5-flash-video') return 'Gemini 2.5';
    if (modelId === 'luma-dream') return 'Luma Dream';
    return 'Gemini 2.5';
  };

  // Check for connected input and use it as prompt if available
  React.useEffect(() => {
    if (getInput) {
      const connectedInput = getInput(id, 'prompt-input');
      if (connectedInput && typeof connectedInput === 'string') {
        setPrompt(connectedInput);
      }
    }
  }, [getInput, id]);

  // Update output whenever video is generated
  React.useEffect(() => {
    if (videoUrl && setOutput) {
      setOutput(id, 'video-output', videoUrl);
    }
  }, [videoUrl, setOutput, id]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generateVideo(prompt);
  };

  const handleModelChange = (modelId: string) => {
    if (externalOnModelChange) {
      externalOnModelChange(modelId);
    }
  };

  return (
    <BlockBase
      id={id}
      type="video"
      title="Video"
      onSelect={onSelect}
      isSelected={isSelected}
      model={getModelDisplayName(selectedModel)}
      toolbar={
        <BlockFloatingToolbar
          blockType="video"
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
        />
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs mb-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="text-zinc-500">{geminiVideoModel.name}</span>
        </div>

        {videoUrl ? (
          <div className="relative group">
            <video
              src={videoUrl}
              className="w-full h-auto rounded-lg border border-zinc-800/50"
              loop
              controls
            />
          </div>
        ) : (
          <div className="border border-dashed border-zinc-800/50 rounded-lg p-4 flex flex-col gap-2.5 min-h-[150px] bg-zinc-950/30">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => {
                e.stopPropagation();
                onInputFocus?.();
              }}
              onBlur={() => onInputBlur?.()}
              className="w-full bg-zinc-950/50 border border-zinc-800/50 px-3 py-2 rounded text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 cursor-text"
              placeholder="Describe the video you want to create..."
              disabled={isGenerating}
            />

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Generating video...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-zinc-800/50 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-amber-600 to-amber-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleGenerate();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={isGenerating || !prompt.trim()}
          className="w-full px-3 py-2 text-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Video</span>
            </>
          )}
        </button>
      </div>
    </BlockBase>
  );
};

export default VideoBlock;
