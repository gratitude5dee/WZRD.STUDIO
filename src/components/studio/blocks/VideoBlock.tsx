import React, { useState, useEffect } from 'react';
import { Sparkles, Info, Video, Wand2, Download, RotateCw, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import BlockBase, { ConnectionPoint } from './BlockBase';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useGeminiVideo } from '@/hooks/useGeminiVideo';
import { geminiVideoModel } from '@/types/modelTypes';
import { BlockFloatingToolbar } from './BlockFloatingToolbar';
import { motion } from 'framer-motion';

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
  const [mode, setMode] = useState<'suggestions' | 'prompt' | 'display'>('suggestions');
  const [prompt, setPrompt] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames] = useState(120);
  const [generationStage, setGenerationStage] = useState<string>('Initializing');
  const [estimatedTime, setEstimatedTime] = useState(45);
  const { isGenerating, videoUrl, progress, generateVideo } = useGeminiVideo();

  // Simulate detailed generation progress
  useEffect(() => {
    if (isGenerating) {
      const stages = ['Initializing', 'Generating frames', 'Rendering', 'Finalizing'];
      let stageIndex = 0;
      
      const interval = setInterval(() => {
        setCurrentFrame(prev => Math.min(prev + Math.floor(Math.random() * 5) + 1, totalFrames));
        setEstimatedTime(prev => Math.max(0, prev - 1));
        
        const newStageIndex = Math.floor((currentFrame / totalFrames) * stages.length);
        if (newStageIndex !== stageIndex && newStageIndex < stages.length) {
          stageIndex = newStageIndex;
          setGenerationStage(stages[stageIndex]);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else if (videoUrl) {
      setCurrentFrame(totalFrames);
      setEstimatedTime(0);
    }
  }, [isGenerating, videoUrl, currentFrame, totalFrames]);

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
    setMode('prompt');
    setCurrentFrame(0);
    setEstimatedTime(45);
    setGenerationStage('Initializing');
    generateVideo(prompt);
  };

  const handleSelectSuggestion = (suggestionText: string) => {
    setPrompt(suggestionText);
    setMode('prompt');
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
      {/* Suggestions Mode */}
      {mode === 'suggestions' && (
        <div className="space-y-3">
          <button
            onClick={() => {/* TODO: Open help modal */}}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900/30 hover:bg-zinc-800/50 rounded-lg border border-zinc-800/30 hover:border-zinc-700/50 transition-all"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Learn about Video Blocks</span>
          </button>

          <div className="space-y-1.5">
            {[
              { icon: '🎬', label: 'Cinematic drone shot', desc: 'Create aerial footage' },
              { icon: '⏱️', label: 'Time-lapse', desc: 'Accelerated scene progression' },
              { icon: '🌅', label: 'Sunset scene', desc: 'Golden hour ambiance' },
              { icon: '🎨', label: 'Abstract motion', desc: 'Artistic visual effects' },
            ].map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggestion(suggestion.label)}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/30 hover:border-zinc-700/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-zinc-800/50 group-hover:bg-zinc-700/50 rounded-lg transition-colors">
                    <span className="text-base">{suggestion.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-zinc-200 group-hover:text-white transition-colors font-medium">
                      {suggestion.label}
                    </div>
                    <div className="text-[11px] text-zinc-500 group-hover:text-zinc-400 mt-0.5 transition-colors truncate">
                      {suggestion.desc}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-800/30">
            <div className="text-[11px] text-zinc-500 text-center">
              Or describe your video concept...
            </div>
          </div>
        </div>
      )}

      {/* Prompt/Loading Mode */}
      {mode === 'prompt' && !videoUrl && (
        <div className="space-y-3">
          {isGenerating ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {/* Loading Visualization */}
              <div className="aspect-video rounded-xl bg-zinc-900/50 border border-zinc-800/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-amber-500/5 animate-pulse" />
                
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] bg-black/60 border-zinc-700/50 text-zinc-400 backdrop-blur-sm">
                    🎬 {generationStage}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-black/60 border-zinc-700/50 text-zinc-400 backdrop-blur-sm">
                    ~{estimatedTime}s
                  </Badge>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-zinc-400 max-w-[200px] truncate">
                      {prompt}
                    </div>
                    <div className="text-xs text-zinc-400">
                      Frame {currentFrame}/{totalFrames}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{generationStage}...</span>
                  <span className="text-zinc-500">{Math.floor((currentFrame / totalFrames) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentFrame / totalFrames) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => {
                    e.stopPropagation();
                    onInputFocus?.();
                  }}
                  onBlur={() => onInputBlur?.()}
                  className="min-h-[100px] text-sm bg-zinc-900/50 border-zinc-800/40 rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:border-purple-500/50 resize-none cursor-text"
                  placeholder='Try "Cinematic drone shot over misty mountains at sunrise"'
                  disabled={isGenerating}
                />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerate();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                disabled={isGenerating || !prompt.trim()}
                className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-sm font-medium">Generate Video</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Display Mode */}
      {videoUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <div className="relative group rounded-xl overflow-hidden">
            <video
              src={videoUrl}
              className="w-full aspect-video object-cover"
              loop
              muted={isMuted}
              autoPlay
            />

            {/* Top Overlay */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="text-[10px] bg-purple-500/10 border-purple-500/30 text-purple-400">
                  <Video className="w-2.5 h-2.5 mr-1" />
                  Generated
                </Badge>
                <Badge className="bg-white/10 text-white backdrop-blur-sm text-[10px]">
                  {getModelDisplayName(selectedModel)}
                </Badge>
              </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2.5 bg-white/90 hover:bg-white rounded-full transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-zinc-900" /> : <Play className="w-4 h-4 text-zinc-900" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="p-2.5 bg-white/90 hover:bg-white rounded-full transition-all"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-zinc-900" /> : <Volume2 className="w-4 h-4 text-zinc-900" />}
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2.5 bg-white/90 hover:bg-white rounded-full transition-all"
              >
                <Download className="w-4 h-4 text-zinc-900" />
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2.5 bg-white/90 hover:bg-white rounded-full transition-all"
              >
                <Maximize2 className="w-4 h-4 text-zinc-900" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMode('suggestions');
              }}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-all"
            >
              New Video
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerate();
              }}
              className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Wand2 className="w-3 h-3 text-white" />
              <span className="text-xs text-white font-medium">Create Variation</span>
            </button>
          </div>
        </motion.div>
      )}
    </BlockBase>
  );
};

export default VideoBlock;
