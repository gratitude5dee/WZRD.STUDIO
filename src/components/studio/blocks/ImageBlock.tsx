import React, { useState, useRef, useEffect } from 'react';
import BlockBase from './BlockBase';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGeminiImage } from '@/hooks/useGeminiImage';
import { Download, Copy, Maximize2, Sparkles, Info, Upload, Video, MessageSquare, Send, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { BlockFloatingToolbar } from './BlockFloatingToolbar';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

interface ImageBlockProps {
  id: string;
  onSelect: () => void;
  isSelected: boolean;
  onRegisterRef?: (blockId: string, element: HTMLElement | null, connectionPoints: Record<string, { x: number; y: number }>) => void;
  onConnectionPointClick?: (blockId: string, point: 'top' | 'right' | 'bottom' | 'left', e: React.MouseEvent) => void;
  getInput?: (blockId: string, inputId: string) => any;
  setOutput?: (blockId: string, outputId: string, value: any) => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  connectedPoints?: Array<'top' | 'right' | 'bottom' | 'left'>;
  onSpawnBlocks?: (blocks: Array<{
    id: string;
    type: 'text' | 'image' | 'video';
    position: { x: number; y: number };
    initialData?: any;
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
  onConnectionPointClick,
  getInput,
  setOutput,
  selectedModel,
  onModelChange,
  connectedPoints = [],
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
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const { isGenerating, generateImage } = useGeminiImage();

  // Simulate progress during generation
  useEffect(() => {
    if (isGenerating) {
      setProgress(0);
      setTimeRemaining(30);
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 95));
        setTimeRemaining(prev => Math.max(prev - 1, 1));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [isGenerating]);

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
    
    console.log('🎨 Generation started:', { generationCount, prompt, aspectRatio });
    
    if (generationCount === 1) {
      console.log('📸 Generating single image');
      const results = await generateImage(prompt, 1, aspectRatio);
      console.log('✅ Single image result:', results);
      if (results && results.length > 0) {
        setGeneratedImage({ 
          url: results[0].url, 
          generationTime: results[0].generationTime 
        });
        toast.success('Image generated!');
      }
    } else if (generationCount > 1) {
      console.log(`🎭 Generating ${generationCount} images for spawning`);
      
      if (!onSpawnBlocks) {
        toast.error('Multi-image generation not supported in this context');
        return;
      }
      
      const results = await generateImage(prompt, generationCount, aspectRatio);
      console.log(`✅ Received ${results?.length || 0} images from generation`);
      
      if (results && results.length > 0) {
        const BLOCK_SPACING = 400;
        const BLOCKS_PER_ROW = 3;
        
        const newBlocks = results.map((img, index) => {
          const row = Math.floor(index / BLOCKS_PER_ROW);
          const col = index % BLOCKS_PER_ROW;
          
          const newBlock = {
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
              aspectRatio: aspectRatio,
              mode: 'display' // Display spawned images immediately
            }
          };
          
          console.log(`📦 Created block ${index + 1}:`, {
            id: newBlock.id,
            position: newBlock.position,
            hasImage: !!newBlock.initialData?.imageUrl,
            mode: newBlock.initialData.mode
          });
          
          return newBlock;
        });
        
        console.log(`🚀 Spawning ${newBlocks.length} blocks`);
        onSpawnBlocks(newBlocks);
        toast.success(`Spawned ${newBlocks.length} image blocks!`);
      } else {
        console.error('❌ No images generated');
        toast.error('Failed to generate images');
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
      <motion.div 
        ref={blockRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-80 h-80 rounded-[20px] overflow-hidden cursor-pointer group shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        onClick={() => {
          setDisplayMode('input');
          onSelect();
        }}
      >
        <img
          src={generatedImage.url}
          alt={prompt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        
        {/* Bottom Badge Overlay with frosted glass */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
          <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg max-w-[60%]">
            <span className="text-xs font-medium text-white/90 line-clamp-1">
              {generateShortTitle(prompt)}
            </span>
          </div>
          <div className="px-2.5 py-1 bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-md border border-white/20 rounded-lg shadow-lg">
            <span className="text-[10px] font-bold text-white tracking-wide">
              {selectedModel?.includes('flux') ? '⚡ Flux' : selectedModel?.includes('recraft') ? '🎨 Recraft' : '✨ AI'}
            </span>
          </div>
        </div>

        {/* Hover actions overlay with reduced opacity */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
          <Button
            size="icon"
            className="bg-white/90 hover:bg-white text-black shadow-lg transform hover:scale-110 transition-transform"
            onClick={(e) => handleDownload(generatedImage.url, e)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            className="bg-white/90 hover:bg-white text-black shadow-lg transform hover:scale-110 transition-transform"
            onClick={(e) => handleCopy(generatedImage.url, e)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            className="bg-white/90 hover:bg-white text-black shadow-lg transform hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              setDisplayMode('input');
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            className="bg-white/90 hover:bg-white text-black shadow-lg transform hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              toast.info('Variation feature coming soon');
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>

        {/* Selection indicator with corner dots */}
        {isSelected && (
          <>
            <div className="absolute inset-0 border-2 border-blue-500/70 rounded-[20px] pointer-events-none shadow-[0_0_0_4px_rgba(59,130,246,0.15)]" />
            <div className="absolute top-1 left-1 w-2 h-2 bg-blue-500 rounded-full" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-blue-500 rounded-full" />
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          </>
        )}
      </motion.div>
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
        onRegisterRef={onRegisterRef}
        onConnectionPointClick={onConnectionPointClick}
        connectedPoints={connectedPoints}
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
          {/* Empty State - Enhanced Suggestion Menu */}
          {!prompt && !generatedImage && !isGenerating && (
            <div className="space-y-1.5 mb-3">
              <button 
                className="w-full flex items-center gap-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 p-3 rounded-lg transition-all text-left text-xs group border border-transparent hover:border-zinc-700/50"
                onClick={() => toast.info('Documentation coming soon')}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="flex-1">Learn about Image Blocks</span>
                <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
              </button>
              <button 
                className="w-full flex items-center gap-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 p-3 rounded-lg transition-all text-left text-xs group border border-transparent hover:border-zinc-700/50"
                onClick={() => toast.info('Upload feature coming soon')}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <span className="flex-1">Upload an Image</span>
                <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
              </button>
              <button 
                className="w-full flex items-center gap-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 p-3 rounded-lg transition-all text-left text-xs group border border-transparent hover:border-zinc-700/50"
                onClick={() => toast.info('Video combination coming soon')}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                  <Video className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="flex-1">Combine images into a video</span>
                <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
              </button>
              <button 
                className="w-full flex items-center gap-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 p-3 rounded-lg transition-all text-left text-xs group border border-transparent hover:border-zinc-700/50"
                onClick={() => toast.info('Image to video coming soon')}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                  <Video className="w-3.5 h-3.5 text-green-400" />
                </div>
                <span className="flex-1">Turn an image into a video</span>
                <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
              </button>
              <button 
                className="w-full flex items-center gap-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 p-3 rounded-lg transition-all text-left text-xs group border border-transparent hover:border-zinc-700/50"
                onClick={(e) => {
                  e.stopPropagation();
                  // Trigger visual intelligence workflow
                  if (onSpawnBlocks && generatedImage) {
                    const textBlockId = uuidv4();
                    const textBlock = {
                      id: textBlockId,
                      type: 'text' as const,
                      position: {
                        x: blockPosition.x + 450,
                        y: blockPosition.y
                      },
                      initialData: {
                        mode: 'visual-intelligence',
                        connectedImageUrl: generatedImage.url,
                        connectedImagePrompt: prompt
                      }
                    };
                    onSpawnBlocks([textBlock]);
                    toast.success('Visual Q&A block created! Ask your question.');
                  } else {
                    toast.info('Generate an image first');
                  }
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span className="flex-1">Ask a question about an image</span>
                <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
              </button>
            </div>
          )}

          {/* Prompt Input with Counter and Send */}
          <div className="relative">
            <Textarea
              placeholder='Try "An ethereal aurora over a snowy landscape"'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px] bg-zinc-900/50 border-zinc-800/40 text-zinc-100 placeholder:text-zinc-500 resize-none pr-20"
              disabled={isGeneratingPrompt || isGenerating}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
              <Badge className="bg-zinc-800 text-zinc-400 text-xs border-zinc-700/50 hover:bg-zinc-700 cursor-pointer" onClick={() => setGenerationCount(prev => prev < 4 ? prev + 1 : 1)}>
                {generationCount}×
              </Badge>
              <Button
                size="icon"
                className="h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || isGeneratingPrompt}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Loading State with Progress */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="aspect-square rounded-xl bg-zinc-900/50 border border-zinc-800/30 relative overflow-hidden">
                {/* Animated Progress Overlay */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Timer Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-black/60 text-white text-xs backdrop-blur-sm border-0">
                    ~{timeRemaining}s
                  </Badge>
                </div>
                
                {/* Bottom Info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="text-xs text-zinc-400 max-w-[200px] truncate">
                    {prompt}
                  </div>
                  {generationCount > 1 && (
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                      <Plus className="w-3 h-3 text-white" />
                      <span className="text-xs text-white">{generationCount}×</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Generating image...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1 bg-zinc-800/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Generated Image with Enhanced Display */}
          {generatedImage && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group cursor-pointer rounded-xl overflow-hidden bg-zinc-800/30 aspect-square"
            >
              <img
                src={generatedImage.url}
                alt="Generated"
                className="w-full h-full object-cover"
              />
              
              {/* Generation Time Badge */}
              {generatedImage.generationTime && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-black/60 text-white text-xs backdrop-blur-sm border-0">
                    ~{generatedImage.generationTime}s
                  </Badge>
                </div>
              )}
              
              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  className="bg-white/90 hover:bg-white text-black shadow-lg"
                  onClick={(e) => handleDownload(generatedImage.url, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  className="bg-white/90 hover:bg-white text-black shadow-lg"
                  onClick={(e) => handleCopy(generatedImage.url, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  className="bg-white/90 hover:bg-white text-black shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDisplayMode('display');
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </BlockBase>
    </div>
  );
};

export default ImageBlock;
