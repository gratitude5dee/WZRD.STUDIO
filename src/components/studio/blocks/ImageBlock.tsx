import React, { useState, useEffect } from 'react';
import BlockBase, { ConnectionPoint } from './BlockBase';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGeminiImage } from '@/hooks/useGeminiImage';
import { 
  Loader2, Download, Wand2, Sparkles, Copy, ZoomIn, ChevronDown, Settings, 
  Info, Upload, Combine, Video, Menu, Plus, Minus, MoreHorizontal, Type, Image as ImageIcon, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BlockFloatingToolbar } from './BlockFloatingToolbar';

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
  onInputFocus?: () => void;
  onInputBlur?: () => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

const ASPECT_RATIOS = [
  { label: '1:1 Square', value: '1:1' },
  { label: '16:9 Landscape', value: '16:9' },
  { label: '9:16 Portrait', value: '9:16' },
  { label: '4:3 Standard', value: '4:3' },
  { label: '3:4 Portrait', value: '3:4' },
];

const GENERATION_COUNTS = Array.from({ length: 20 }, (_, i) => ({
  label: `${i + 1}×`,
  value: i + 1,
}));

const SUGGESTIONS = [
  { icon: Upload, label: 'Upload an image', disabled: true },
  { icon: Combine, label: 'Combine images into a video', disabled: true },
  { icon: Video, label: 'Turn an image into a video', disabled: true },
  { icon: Menu, label: 'Ask a question about an image', disabled: true },
];

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
  setOutput,
  onInputFocus,
  onInputBlur,
  selectedModel: externalSelectedModel,
  onModelChange: externalOnModelChange
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generationCount, setGenerationCount] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { isGenerating, images, generateImage, clearImages } = useGeminiImage();

  // Use external model if provided, otherwise use default
  const selectedModel = externalSelectedModel || 'gemini-2.5-flash-image';
  const getModelDisplayName = (modelId: string) => {
    if (modelId === 'gemini-2.5-flash-image') return 'Gemini 2.5';
    if (modelId === 'flux-dev') return 'Flux Dev';
    if (modelId === 'flux-schnell') return 'Flux Schnell';
    return 'Gemini 2.5';
  };

  // Sync prompt from connected inputs
  useEffect(() => {
    if (getInput) {
      const connectedInput = getInput(id, 'prompt-input');
      if (connectedInput && typeof connectedInput === 'string') {
        setPrompt(connectedInput);
      }
    }
  }, [getInput, id]);

  // Send images to outputs
  useEffect(() => {
    if (images.length > 0 && setOutput) {
      setOutput(id, 'image-output', images);
    }
  }, [images, id, setOutput]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    await generateImage(prompt, generationCount, aspectRatio);
  };

  const handleDownload = (imageUrl: string, imageName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      toast.success('Image copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy image');
    }
  };

  const getGridClass = () => {
    const count = images.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-2';
    return 'grid-cols-2';
  };

  const getLoadingPlaceholders = () => {
    return Array.from({ length: generationCount }).map((_, i) => (
      <div
        key={`loading-${i}`}
        className="relative aspect-square rounded-lg border border-zinc-700/50 bg-zinc-900/50 overflow-hidden"
        style={{
          animationDelay: `${i * 100}ms`
        }}
      >
        <div 
          className="absolute inset-0 animate-shimmer"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(113, 113, 122, 0.15), transparent)',
            backgroundSize: '200% 100%',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500 mx-auto" />
          </div>
        </div>
      </div>
    ));
  };

  const handleModelChange = (modelId: string) => {
    if (externalOnModelChange) {
      externalOnModelChange(modelId);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div>
          <BlockBase
            id={id}
            type="image"
            title="Image"
            onSelect={onSelect}
            isSelected={isSelected}
            model={getModelDisplayName(selectedModel)}
            toolbar={
            <BlockFloatingToolbar
                blockType="image"
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                generationCount={generationCount}
                onGenerationCountChange={setGenerationCount}
              />
            }
          >
      <div 
        className="space-y-3 relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Empty State with Suggestions */}
        {images.length === 0 && !isGenerating && (
          <div className="space-y-3">
            {/* Learn Banner */}
            <div className="flex items-center justify-between gap-2 p-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-blue-400/70 flex-shrink-0" />
                <span className="text-xs text-zinc-400">Learn about Image Blocks</span>
              </div>
              <ArrowRight className="h-3 w-3 text-zinc-600" />
            </div>

            {/* Try to... Suggestions */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 font-medium">Try to...</p>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    disabled={suggestion.disabled}
                    className="flex items-center gap-2 p-2.5 bg-zinc-900/20 border border-zinc-800/50 rounded-lg hover:bg-zinc-800/30 hover:border-zinc-700/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left group"
                  >
                    <suggestion.icon className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-400 flex-shrink-0 transition-colors" />
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">{suggestion.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Prompt Input */}
        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={(e) => {
              e.stopPropagation();
              onInputFocus?.();
            }}
            onBlur={() => onInputBlur?.()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            placeholder="Try 'A vintage poster of a travelling circus'"
            className="min-h-[90px] resize-none cursor-text bg-zinc-950/30 border-zinc-800/50 text-zinc-200 placeholder:text-zinc-600 focus:border-blue-500/50 focus:bg-zinc-950/50 text-sm transition-all"
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
          {/* Circular Action Button */}
          {prompt && !isGenerating && images.length === 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerate();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all shadow-lg hover:shadow-blue-500/20"
              title="Generate"
            >
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Loading State - Grid of Placeholders */}
        {isGenerating && (
          <div className="space-y-3">
            <div className={cn("grid gap-3", getGridClass())}>
              {getLoadingPlaceholders()}
            </div>
            
            {/* Prompt Display at Bottom */}
            {prompt && (
              <div className="p-2.5 bg-zinc-900/50 border border-zinc-700/50 rounded-lg">
                <p className="text-sm text-zinc-400">{prompt}</p>
              </div>
            )}
          </div>
        )}

        {/* Generated Images with Enhanced Cards */}
        {images.length > 0 && !isGenerating && (
          <div className="space-y-3">
            <div 
              className={cn("grid gap-3 transition-transform duration-300", getGridClass())}
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
            >
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-800/50 bg-zinc-900 hover:border-zinc-700/50 transition-all animate-fade-in"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                  onMouseEnter={() => setHoveredImageId(image.id)}
                  onMouseLeave={() => setHoveredImageId(null)}
                >
                  {/* Image */}
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />

                  {/* Generation Counter Badge */}
                  <div className={cn(
                    "absolute bottom-2 right-2 px-2 py-1 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-md transition-opacity",
                    hoveredImageId === image.id ? "opacity-100" : "opacity-0"
                  )}>
                    <span className="text-xs font-medium text-zinc-300">{generationCount}×</span>
                  </div>
                  
                  {/* Hover Overlay with Actions */}
                  <div className={cn(
                    "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity flex items-center justify-center gap-2",
                    hoveredImageId === image.id ? "opacity-100" : "opacity-0"
                  )}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(image.url, `image-${image.id}`);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <Download className="h-4 w-4" />
                            <span className="text-xs">Download</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Download Image</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(image.url);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="text-xs">Copy</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Copy to Clipboard</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <ZoomIn className="h-4 w-4" />
                            <span className="text-xs">Zoom</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">View Full Size</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <Wand2 className="h-4 w-4" />
                            <span className="text-xs">Edit</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Edit Image</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>

            {/* Prompt Display at Bottom */}
            {prompt && (
              <div className="p-2.5 bg-zinc-900/50 border border-zinc-700/50 rounded-lg">
                <p className="text-sm text-zinc-400">{prompt}</p>
              </div>
            )}

            {/* Generate More Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerate();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={isGenerating || !prompt}
              className="w-full"
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate {generationCount}× More
            </Button>
          </div>
        )}

      </div>
    </BlockBase>
    </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-52 bg-zinc-900/95 backdrop-blur-sm border-zinc-700">
        <ContextMenuItem 
          className="text-zinc-300 hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white cursor-pointer"
          onClick={() => toast.info('Converting to Text block...')}
        >
          <Type className="mr-2 h-4 w-4" />
          <span>Text</span>
          <span className="ml-auto text-xs text-zinc-500">T</span>
        </ContextMenuItem>
        
        <ContextMenuItem 
          className="text-zinc-300 hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white cursor-pointer"
          disabled
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          <span>Image</span>
          <span className="ml-auto text-xs text-zinc-500">I</span>
        </ContextMenuItem>
        
        <ContextMenuItem 
          className="text-zinc-300 hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white cursor-pointer"
          onClick={() => toast.info('Converting to Video block...')}
        >
          <Video className="mr-2 h-4 w-4" />
          <span>Video</span>
          <span className="ml-auto text-xs text-zinc-500">V</span>
        </ContextMenuItem>
        
        <ContextMenuSeparator className="bg-zinc-700" />
        
        <div className="px-2 py-1.5 text-xs text-zinc-500">
          <div className="flex items-center justify-center gap-2">
            <span>↕ Navigate</span>
            <span>⏎ Select</span>
          </div>
        </div>
        
        <ContextMenuSeparator className="bg-zinc-700" />
        
        <ContextMenuItem 
          className="text-zinc-400 hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white cursor-pointer"
          onClick={() => window.open('https://docs.example.com/blocks', '_blank')}
        >
          <Info className="mr-2 h-4 w-4" />
          <span>Learn about Blocks</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ImageBlock;
