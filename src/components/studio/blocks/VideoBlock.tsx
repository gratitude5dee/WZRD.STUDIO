
import React, { useState } from 'react';
import { Upload, Play, Pause, Sparkles } from 'lucide-react';
import BlockBase, { ConnectionPoint } from './BlockBase';
import { useGeminiVideo } from '@/hooks/useGeminiVideo';
import { geminiVideoModel } from '@/types/modelTypes';

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
  setOutput
}) => {
  const [prompt, setPrompt] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const { isGenerating, videoUrl, progress, generateVideo } = useGeminiVideo();

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

  return (
    <BlockBase
      id={id}
      type="video"
      title="VIDEO"
      onSelect={onSelect}
      isSelected={isSelected}
      generationTime="~3m"
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
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-zinc-400">{geminiVideoModel.name}</span>
          </div>
          <span className="text-amber-400 text-xs">{geminiVideoModel.time}</span>
        </div>

        {videoUrl ? (
          <div className="relative group">
            <video
              src={videoUrl}
              className="w-full h-auto rounded-lg"
              loop
              controls
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 flex flex-col gap-3 min-h-[150px] bg-zinc-800/20">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              className="w-full bg-zinc-800/50 border border-zinc-700 px-3 py-1.5 rounded text-sm focus:outline-none focus:border-amber-500 pointer-events-auto cursor-text"
              placeholder="Describe the video you want to create..."
              disabled={isGenerating}
            />

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Generating video...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-amber-600 to-amber-400 h-2 rounded-full transition-all duration-500"
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
          className="w-full px-3 py-2 text-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded shadow-glow-purple-sm hover:shadow-glow-purple-md transition-all-std disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Video...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Video
            </>
          )}
        </button>
      </div>
    </BlockBase>
  );
};

export default VideoBlock;
