import React, { useState, useEffect } from 'react';
import { Sparkles, Info, Video, Wand2, Download, RotateCw, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import BlockBase, { ConnectionPoint } from './BlockBase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useGeminiVideo } from '@/hooks/useGeminiVideo';
import { geminiVideoModel } from '@/types/modelTypes';
import { BlockFloatingToolbar } from './BlockFloatingToolbar';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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
  onConnectionPointClick?: (blockId: string, point: 'top' | 'right' | 'bottom' | 'left', e: React.MouseEvent) => void;
  getInput?: (blockId: string, inputId: string) => any;
  setOutput?: (blockId: string, outputId: string, value: any) => void;
  connectedPoints?: Array<'top' | 'right' | 'bottom' | 'left'>;
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
  onConnectionPointClick,
  getInput,
  setOutput,
  connectedPoints = [],
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
    if (modelId === 'gemini-2.5-flash-video') return 'Veo 3 Fast';
    if (modelId === 'luma-dream') return 'Luma Dream';
    return 'Veo 3 Fast';
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

  const handleDownload = async (videoUrl: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Video downloaded');
    } catch (error) {
      toast.error('Failed to download video');
    }
  };

  const handleModelChange = (modelId: string) => {
    if (externalOnModelChange) {
      externalOnModelChange(modelId);
    }
  };

  const generatedVideo = videoUrl ? { url: videoUrl } : null;

  return (
    <BlockBase
      id={id}
      type="video"
      title="Video"
      onSelect={onSelect}
      isSelected={isSelected}
      model={getModelDisplayName(selectedModel)}
      onRegisterRef={onRegisterRef}
      onConnectionPointClick={onConnectionPointClick}
      connectedPoints={connectedPoints}
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
      {/* Suggestions Mode - Enhanced Empty State */}
      {mode === 'suggestions' && (
        <div className="space-y-1.5 mb-3">
          <button 
            className="w-full flex items-center gap-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 p-3 rounded-lg transition-all text-left text-xs group border border-transparent hover:border-zinc-700/50"
            onClick={() => toast.info('Documentation coming soon')}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
              <Info className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="flex-1">Learn about Video Blocks</span>
            <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
          </button>
          
          <div className="pt-2 pb-1 px-2">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Try to...</p>
          </div>
          
          <button 
            className="w-full flex items-center gap-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 p-3 rounded-lg transition-all text-left text-xs group border border-transparent hover:border-zinc-700/50"
            onClick={() => {
              setPrompt('Cinematic drone shot flying over a misty mountain range at golden hour');
              setMode('prompt');
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-colors text-base">
              🏔️
            </div>
            <span className="flex-1">Create cinematic drone footage</span>
            <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
          </button>
          <button 
            className="w-full flex items-center gap-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 p-3 rounded-lg transition-all text-left text-xs group border border-transparent hover:border-zinc-700/50"
            onClick={() => {
              setPrompt('Time-lapse of a sunset over a calm ocean with vibrant colors');
              setMode('prompt');
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors text-base">
              🌅
            </div>
            <span className="flex-1">Generate time-lapse sequence</span>
            <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
          </button>
          <button 
            className="w-full flex items-center gap-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 p-3 rounded-lg transition-all text-left text-xs group border border-transparent hover:border-zinc-700/50"
            onClick={() => {
              setPrompt('Abstract morphing shapes with neon colors in a dark environment');
              setMode('prompt');
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-500/20 transition-colors text-base">
              ✨
            </div>
            <span className="flex-1">Create abstract visual effects</span>
            <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
          </button>
        </div>
      )}

      {/* Prompt Mode with Loading State */}
      {mode === 'prompt' && (
        <div className="space-y-3">
          {isGenerating ? (
            <>
              {/* Loading Visualization */}
              <div className="aspect-video rounded-xl bg-zinc-900/50 border border-zinc-800/30 relative overflow-hidden">
                {/* Animated Progress Overlay */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Timer Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-black/60 text-white text-xs backdrop-blur-sm border-0">
                    ~{estimatedTime}s
                  </Badge>
                </div>
                
                {/* Bottom Progress Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="text-xs text-zinc-400 mb-2 flex items-center justify-between">
                    <span className="truncate flex-1">{prompt}</span>
                    <span className="ml-2 shrink-0">{generationStage}</span>
                  </div>
                  <div className="h-1 bg-zinc-800/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Prompt Input */}
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
                  className="min-h-[80px] bg-zinc-900/50 border-zinc-800/40 text-zinc-100 placeholder:text-zinc-500 resize-none pr-20"
                  placeholder='Try "A serene waterfall in a lush forest..."'
                  disabled={isGenerating}
                />
                <div className="absolute bottom-2 right-2">
                  <Button
                    size="icon"
                    className="h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerate();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    disabled={isGenerating || !prompt.trim()}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Display Mode */}
      {mode === 'display' && generatedVideo && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
            <video
              src={generatedVideo.url}
              className="w-full h-full object-contain"
              loop
              muted={isMuted}
              autoPlay
              playsInline
              onMouseDown={(e) => e.stopPropagation()}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-200"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(generatedVideo.url);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download
            </Button>
            <div className="flex-1" />
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleGenerate();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={isGenerating}
            >
              <RotateCw className="w-3.5 h-3.5 mr-1.5" />
              Regenerate
            </Button>
          </div>
        </motion.div>
      )}
    </BlockBase>
  );
};

export default VideoBlock;
