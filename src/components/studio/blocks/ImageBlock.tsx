import React, { useState, useRef, useEffect } from 'react';
import BlockBase from './BlockBase';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGeminiImage } from '@/hooks/useGeminiImage';
import { Download, Copy, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import { BlockFloatingToolbar } from './BlockFloatingToolbar';
import { v4 as uuidv4 } from 'uuid';

interface ImageBlockProps {
  id: string;
  onSelect: () => void;
  isSelected: boolean;
  onRegisterRef?: (blockId: string, element: HTMLElement | null, connectionPoints: Record<string, { x: number; y: number }>) => void;
  getInput?: (blockId: string, inputId: string) => any;
  setOutput?: (blockId: string, outputId: string, value: any) => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  onSpawnBlocks?: (blocks: Array<{
    id: string;
    type: 'image';
    position: { x: number; y: number };
    initialData?: {
      prompt?: string;
      imageUrl?: string;
      generationTime?: number;
      aspectRatio?: string;
    };
  }>) => void;
  blockPosition?: { x: number; y: number };
  initialData?: {
    prompt?: string;
    imageUrl?: string;
    generationTime?: number;
    aspectRatio?: string;
  };
  displayMode?: 'input' | 'display';
}

const ImageBlock: React.FC<ImageBlockProps> = ({
  id,
  onSelect,
  isSelected,
  onRegisterRef,
  getInput,
  setOutput,
  selectedModel,
  onModelChange,
  onSpawnBlocks,
  blockPosition = { x: 0, y: 0 },
  initialData,
  displayMode: initialDisplayMode
}) => {
  const blockRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState(initialData?.prompt || '');
  const [aspectRatio, setAspectRatio] = useState(initialData?.aspectRatio || '1:1');
  const [generationCount, setGenerationCount] = useState(1);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [displayMode, setDisplayMode] = useState<'input' | 'display'>(
    initialDisplayMode || (initialData?.imageUrl ? 'display' : 'input')
  );
  const [generatedImage, setGeneratedImage] = useState<{ url: string; generationTime?: number } | null>(
    initialData?.imageUrl ? { url: initialData.imageUrl, generationTime: initialData.generationTime } : null
  );
  const { isGenerating, generateImage } = useGeminiImage();

  const generateShortTitle = (fullPrompt: string): string => {
    const words = fullPrompt.trim().split(/\s+/);
    const significantWords = words.filter(w => 
      w.length > 3 && !['with', 'and', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for'].includes(w.toLowerCase())
    );
    return significantWords.slice(0, 3).join(' ').slice(0, 30);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    if (generationCount === 1) {
      const results = await generateImage(prompt, 1, aspectRatio);
      if (results && results.length > 0) {
        setGeneratedImage({ 
          url: results[0].url, 
          generationTime: results[0].generationTime 
        });
      }
    } else if (generationCount > 1 && onSpawnBlocks) {
      const results = await generateImage(prompt, generationCount, aspectRatio);
      
      if (results && results.length > 0) {
        const BLOCK_SPACING = 400;
        const BLOCKS_PER_ROW = 3;
        
        const newBlocks = results.map((img, index) => {
          const row = Math.floor(index / BLOCKS_PER_ROW);
          const col = index % BLOCKS_PER_ROW;
          
          return {
            id: uuidv4(),
            type: 'image' as const,
            position: {
              x: blockPosition.x + (col * BLOCK_SPACING),
              y: blockPosition.y + ((row + 1) * BLOCK_SPACING)
            },
            initialData: {
              prompt: prompt,
              imageUrl: img.url,
              generationTime: img.generationTime,
              aspectRatio: aspectRatio
            }
          };
        });
        
        onSpawnBlocks(newBlocks);
        toast.success(`Spawned ${generationCount} image blocks`);
      }
    }
  };

  const handleDownload = async (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleCopy = async (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleAISuggestion = async () => {
    if (isGeneratingPrompt) return;
    
    setIsGeneratingPrompt(true);
    try {
      const supabase = (await import('@/integrations/supabase/client')).supabase;
      
      let systemPrompt: string;
      let userPrompt: string;
      
      if (!prompt.trim()) {
        systemPrompt = "You are a creative AI assistant that generates detailed, vivid image prompts. Generate a single creative and detailed prompt for an AI image generator. Be specific about style, lighting, composition, and subject matter.";
        userPrompt = "Generate a creative image prompt";
      } else {
        systemPrompt = "You are an expert at improving image generation prompts. Enhance the given prompt by adding specific details about style, lighting, composition, colors, and atmosphere while keeping the core concept. Return only the improved prompt text.";
        userPrompt = prompt;
      }
      
      const { data, error } = await supabase.functions.invoke('gemini-text-generation', {
        body: {
          prompt: userPrompt,
          systemPrompt,
          model: 'google/gemini-2.5-flash'
        }
      });

      if (error) throw error;
      
      const generatedText = data?.choices?.[0]?.message?.content;
      if (generatedText) {
        setPrompt(generatedText.trim());
        toast.success(prompt ? 'Prompt improved!' : 'Prompt generated!');
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast.error('Failed to generate prompt suggestion');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Display mode - prominent image with overlay
  if (displayMode === 'display' && generatedImage) {
    return (
      <div 
        ref={blockRef}
        className="relative w-80 h-80 rounded-2xl overflow-hidden cursor-pointer group"
        onClick={() => {
          setDisplayMode('input');
          onSelect();
        }}
      >
        <img
          src={generatedImage.url}
          alt={prompt}
          className="w-full h-full object-cover"
        />
        
        {/* Top gradient overlay with title */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4">
          <div className="flex items-start justify-between">
            <h3 className="text-white font-medium text-sm leading-tight max-w-[200px]">
              {generateShortTitle(prompt)}
            </h3>
            {generatedImage.generationTime && (
              <span className="text-white/90 text-xs font-medium px-2 py-1 bg-white/10 rounded-md backdrop-blur-sm">
                ~{generatedImage.generationTime}s
              </span>
            )}
          </div>
        </div>

        {/* Hover actions overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white text-black"
            onClick={(e) => handleDownload(generatedImage.url, e)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white text-black"
            onClick={(e) => handleCopy(generatedImage.url, e)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white text-black"
            onClick={(e) => {
              e.stopPropagation();
              setDisplayMode('input');
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-blue-500 rounded-2xl pointer-events-none" />
        )}
      </div>
    );
  }

  // Input mode - full editing interface
  return (
    <div ref={blockRef}>
      <BlockBase
        id={id}
        type="image"
        title={prompt ? generateShortTitle(prompt) : "Image Generation"}
        onSelect={onSelect}
        isSelected={isSelected}
        model={selectedModel}
        toolbar={
          <BlockFloatingToolbar
            blockType="image"
            selectedModel={selectedModel || ''}
            onModelChange={onModelChange || (() => {})}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            onSettingsClick={() => {}}
            generationCount={generationCount}
            onGenerationCountChange={setGenerationCount}
            onAISuggestion={handleAISuggestion}
          />
        }
      >
        <div className="space-y-3">
          {/* Prompt Input */}
          <Textarea
            placeholder={isGeneratingPrompt ? "Generating prompt..." : "Describe the image you want to generate..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[80px] bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 resize-none"
            disabled={isGeneratingPrompt}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || isGeneratingPrompt}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </Button>

          {/* Single Generated Image */}
          {generatedImage && (
            <div
              className="relative group cursor-pointer rounded-lg overflow-hidden bg-zinc-800/30 aspect-square"
            >
              <img
                src={generatedImage.url}
                alt="Generated"
                className="w-full h-full object-cover"
              />
              
              {/* Generation Time Badge */}
              {generatedImage.generationTime && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md">
                  <span className="text-xs text-zinc-300">~{generatedImage.generationTime}s</span>
                </div>
              )}
              
              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => handleDownload(generatedImage.url, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => handleCopy(generatedImage.url, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDisplayMode('input');
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && !generatedImage && (
            <div className="aspect-square rounded-lg bg-zinc-800/30 animate-pulse" />
          )}
        </div>
      </BlockBase>
    </div>
  );
};

export default ImageBlock;
