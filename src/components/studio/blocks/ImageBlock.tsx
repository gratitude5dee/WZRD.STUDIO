import React, { useState, useEffect } from 'react';
import BlockBase, { ConnectionPoint } from './BlockBase';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGeminiImage } from '@/hooks/useGeminiImage';
import { Loader2, Download, Wand2, Sparkles, Copy, ZoomIn, ChevronDown, Settings } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  { label: '1× Single', value: 1 },
  { label: '2× Pair', value: 2 },
  { label: '4× Grid', value: 4 },
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
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);
  const { isGenerating, images, generateImage } = useGeminiImage();

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
    if (images.length === 1) return 'grid-cols-1';
    if (images.length === 2) return 'grid-cols-2';
    if (images.length >= 4) return 'grid-cols-2';
    return 'grid-cols-1';
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
    >
      <div 
        className="space-y-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hover Toolbar */}
        {isHovered && (
          <div className="absolute -top-12 left-0 right-0 flex items-center justify-center gap-2 animate-fade-in z-50">
            <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-2">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-xs">Gemini 2.5</span>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Gemini 2.5 Flash</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>Model Selection</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-2">
                          <span className="text-xs">{aspectRatio}</span>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {ASPECT_RATIOS.map(ratio => (
                          <DropdownMenuItem
                            key={ratio.value}
                            onClick={() => setAspectRatio(ratio.value)}
                          >
                            {ratio.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>Aspect Ratio</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-2">
                          <span className="text-xs">{generationCount}×</span>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {GENERATION_COUNTS.map(count => (
                          <DropdownMenuItem
                            key={count.value}
                            onClick={() => setGenerationCount(count.value)}
                          >
                            {count.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>Generation Count</TooltipContent>
                </Tooltip>

                <div className="h-4 w-px bg-border" />

                {images.length > 0 && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            images.forEach((img, i) => handleDownload(img.url, `image-${i + 1}.png`));
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download All</TooltipContent>
                    </Tooltip>

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
                  </>
                )}
              </TooltipProvider>
            </div>
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

        {/* Prompt Input */}
        <div className="space-y-2">
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
            placeholder="Describe the image you want to generate..."
            className="min-h-[80px] resize-none cursor-text bg-zinc-800/50 border-zinc-700"
            disabled={isGenerating}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{prompt.length} characters</span>
          </div>
        </div>

        {/* Generated Images Grid */}
        {images.length > 0 && (
          <div className={`grid ${getGridClass()} gap-3`}>
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800/50 aspect-square"
                onMouseEnter={() => setHoveredImageId(image.id)}
                onMouseLeave={() => setHoveredImageId(null)}
              >
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Hover Overlay */}
                {hoveredImageId === image.id && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center gap-2 animate-fade-in">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(image.url, `image-${image.id}.png`);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(image.url);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Full Size</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <Wand2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}

                {/* Generation Badge */}
                {images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm border border-border rounded-md px-2 py-1 text-xs font-medium">
                    {images.indexOf(image) + 1}/{images.length}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className={`grid ${getGridClass()} gap-3`}>
            {Array.from({ length: generationCount }).map((_, i) => (
              <div
                key={i}
                className="relative rounded-lg border border-zinc-700 bg-zinc-800/50 aspect-square flex items-center justify-center animate-pulse"
              >
                <div className="text-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
                  <p className="text-sm text-muted-foreground">Generating...</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && !isGenerating && (
          <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center space-y-3 bg-zinc-800/20">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No images generated yet</p>
              <p className="text-xs text-muted-foreground">
                Enter a prompt and click generate to create images
              </p>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGenerate();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isGenerating || !prompt.trim()}
            className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded shadow-glow-purple-sm hover:shadow-glow-purple-md transition-all-std disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating {generationCount}× images...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate {generationCount}× {generationCount === 1 ? 'Image' : 'Images'}
              </>
            )}
          </button>

          {images.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerate();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={isGenerating || !prompt.trim()}
              className="px-3 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-300 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              More
            </button>
          )}
        </div>
      </div>
    </BlockBase>
  );
};

export default ImageBlock;
