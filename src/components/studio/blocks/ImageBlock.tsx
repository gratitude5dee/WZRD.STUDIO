import React, { useState, useEffect } from 'react';
import BlockBase, { ConnectionPoint } from './BlockBase';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGeminiImage } from '@/hooks/useGeminiImage';
import { 
  Loader2, Download, Wand2, Sparkles, Copy, ZoomIn, ChevronDown, Settings, 
  Info, Upload, Combine, Video, Menu, Plus, Minus, MoreHorizontal 
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
}

const ASPECT_RATIOS = [
  { label: '1:1 Square', value: '1:1' },
  { label: '16:9 Landscape', value: '16:9' },
  { label: '9:16 Portrait', value: '9:16' },
  { label: '4:3 Standard', value: '4:3' },
  { label: '3:4 Portrait', value: '3:4' },
];

const GENERATION_COUNTS = [
  { label: '1×', value: 1 },
  { label: '2×', value: 2 },
  { label: '4×', value: 4 },
];

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
  onInputBlur
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generationCount, setGenerationCount] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isToolbarHovered, setIsToolbarHovered] = useState(false);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedModel, setSelectedModel] = useState('Gemini 2.5');
  const { isGenerating, images, generateImage, clearImages } = useGeminiImage();

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
        {/* Shimmer animation */}
        <div 
          className="absolute inset-0 animate-shimmer"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(113, 113, 122, 0.15), transparent)',
            backgroundSize: '200% 100%',
          }}
        />
        
        {/* Progress text - centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500 mx-auto" />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <BlockBase
      id={id}
      type="image"
      title="IMAGE"
      onSelect={onSelect}
      isSelected={isSelected}
      generationTime={images.length > 0 ? new Date(images[images.length - 1].timestamp).toLocaleTimeString() : "~8s"}
      supportsConnections={supportsConnections}
      connectionPoints={connectionPoints}
      onShowHistory={onShowHistory}
      onStartConnection={onStartConnection}
      onFinishConnection={onFinishConnection}
      onDragEnd={onDragEnd}
      onRegisterRef={onRegisterRef}
      promptDisplay={isGenerating && prompt ? prompt : undefined}
      estimatedTime={isGenerating ? "~4s" : undefined}
    >
      <div 
        className="space-y-4 relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Floating Hover Toolbar - Only show when we have content */}
        {(isHovered || isToolbarHovered) && (images.length > 0 || isGenerating) && (
          <div 
            className="absolute -top-14 left-0 right-0 h-12 flex items-center gap-2 px-3 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg z-50 animate-fade-in"
            onMouseEnter={() => setIsToolbarHovered(true)}
            onMouseLeave={() => setIsToolbarHovered(false)}
          >
            <TooltipProvider>
              {/* Model Selector */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 gap-2 text-zinc-300 hover:text-white">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs">{selectedModel}</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuLabel>Select Model</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSelectedModel('Gemini 2.5')}>
                        Gemini 2.5 Flash
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedModel('Flux Dev')}>
                        Flux Dev
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedModel('Flux Schnell')}>
                        Flux Schnell
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>Model Selection</TooltipContent>
              </Tooltip>

              <div className="h-6 w-px bg-zinc-700" />

              {/* Aspect Ratio Selector */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 gap-2 text-zinc-300 hover:text-white">
                        <span className="text-xs">{aspectRatio}</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Aspect Ratio</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {ASPECT_RATIOS.map((ar) => (
                        <DropdownMenuItem 
                          key={ar.value} 
                          onClick={() => setAspectRatio(ar.value)}
                          className={cn(aspectRatio === ar.value && "bg-zinc-800")}
                        >
                          {ar.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>Aspect Ratio</TooltipContent>
              </Tooltip>

              {/* Generation Count */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 gap-2 text-zinc-300 hover:text-white">
                        <span className="text-xs">{generationCount}×</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Generate</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {GENERATION_COUNTS.map((count) => (
                        <DropdownMenuItem 
                          key={count.value} 
                          onClick={() => setGenerationCount(count.value)}
                          className={cn(generationCount === count.value && "bg-zinc-800")}
                        >
                          {count.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>Generation Count</TooltipContent>
              </Tooltip>

              <div className="flex-1" />

              {/* Settings */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>

              {/* Download All */}
              {images.length > 1 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        images.forEach(img => handleDownload(img.url, `image-${img.id}`));
                        toast.success(`Downloaded ${images.length} images`);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-xs">All</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download All Images</TooltipContent>
                </Tooltip>
              )}

              {/* More Options */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        clearImages();
                      }}>
                        Clear All Images
                      </DropdownMenuItem>
                      <DropdownMenuItem>Export Settings</DropdownMenuItem>
                      <DropdownMenuItem>View History</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>More Options</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Zoom Controls - Positioned on the right side of the block */}
        {(isHovered || isToolbarHovered) && (
          <div className="absolute -right-12 bottom-4 flex flex-col gap-0 bg-background/95 backdrop-blur-sm border border-zinc-700 rounded-lg overflow-hidden z-50 animate-fade-in">
            <button 
              className="h-10 w-10 flex items-center justify-center hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white border-b border-zinc-700"
              onClick={(e) => {
                e.stopPropagation();
                setZoomLevel(Math.min(3, zoomLevel + 0.5));
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Plus className="h-4 w-4" />
            </button>
            
            <div className="h-10 w-10 flex items-center justify-center text-sm text-zinc-300 border-b border-zinc-700 font-medium">
              {generationCount}
            </div>
            
            <button 
              className="h-10 w-10 flex items-center justify-center hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setZoomLevel(Math.max(0.5, zoomLevel - 0.5));
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Generation Multiplier Badge - Bottom Right Corner */}
        {!isGenerating && images.length === 0 && (
          <div className="absolute -bottom-2 -right-2 px-2 py-1 rounded-md bg-background/95 backdrop-blur-sm border border-zinc-700 shadow-lg z-50">
            <span className="text-xs text-zinc-400 font-medium">{generationCount}×</span>
          </div>
        )}

        {/* Model Info */}
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-zinc-400">Gemini 2.5 Flash Image</span>
          </div>
          <span className="text-green-400 text-xs">FREE</span>
        </div>

        {/* Empty State with Suggestions */}
        {images.length === 0 && !isGenerating && (
          <div className="space-y-3">
            {/* Learn Banner */}
            <div className="flex items-center gap-2 p-2.5 bg-zinc-900/50 border border-zinc-700/50 rounded-lg">
              <Info className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
              <span className="text-xs text-zinc-400">Learn about Image Blocks</span>
            </div>

            {/* Try to... Suggestions */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 px-1">Try to...</p>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    disabled={suggestion.disabled}
                    className="flex items-center gap-2 p-2.5 bg-zinc-900/30 border border-zinc-700/50 rounded-lg hover:bg-zinc-800/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
                  >
                    <suggestion.icon className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                    <span className="text-xs text-zinc-400">{suggestion.label}</span>
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
            placeholder=""
            className="min-h-[140px] resize-none cursor-text bg-zinc-900/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-zinc-600 pr-12"
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
          
          {/* Prompt suggestion overlay */}
          {!prompt && images.length === 0 && !isGenerating && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">Try </span>
                <span className="text-sm text-zinc-400">"A 3D render of a futuristic hovercar"</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded text-xs text-zinc-500">
                  <span>⇧</span>
                  <span>TAB</span>
                </div>
                <button className="p-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded hover:bg-zinc-700/50 transition-colors">
                  <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </button>
              </div>
            </div>
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
                  className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-700/50 bg-zinc-900 hover:border-zinc-600 transition-all animate-fade-in"
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

        {/* Generate Button - Prominent when no images */}
        {!isGenerating && images.length === 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGenerate();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={!prompt || isGenerating}
            className="w-full h-11 text-sm px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded shadow-glow-purple-sm hover:shadow-glow-purple-md transition-all-std disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate {generationCount}× Image{generationCount > 1 ? 's' : ''}
          </button>
        )}
      </div>
    </BlockBase>
  );
};

export default ImageBlock;
