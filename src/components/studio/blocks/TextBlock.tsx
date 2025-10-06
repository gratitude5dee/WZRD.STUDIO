import React, { useState, useEffect } from 'react';
import BlockBase, { ConnectionPoint } from './BlockBase';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGeminiText } from '@/hooks/useGeminiText';
import { Sparkles, Copy, RotateCw, Download, Info } from 'lucide-react';
import TextBlockSuggestions from './TextBlockSuggestions';
import { ActionTemplate, BlockMode, ConnectedInput } from '@/types/studioTypes';
import { BlockFloatingToolbar } from './BlockFloatingToolbar';
import { motion } from 'framer-motion';

export interface TextBlockProps {
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
  onCreateConnectedNodes?: (sourceBlockId: string, template: ActionTemplate) => void;
  connectedInputs?: ConnectedInput[];
  onInputFocus?: () => void;
  onInputBlur?: () => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

const TextBlock: React.FC<TextBlockProps> = ({ 
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
  onCreateConnectedNodes,
  connectedInputs = [],
  onInputFocus,
  onInputBlur,
  selectedModel: externalSelectedModel,
  onModelChange: externalOnModelChange
}) => {
  const [mode, setMode] = useState<BlockMode>('suggestions');
  const [prompt, setPrompt] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<ActionTemplate | null>(null);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(8);
  const { isGenerating, output, generateText } = useGeminiText();

  // Simulate progress during generation
  useEffect(() => {
    if (isGenerating) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 10;
        });
        setEstimatedTime(prev => Math.max(0, prev - 1));
      }, 800);
      return () => clearInterval(interval);
    } else if (output) {
      setProgress(100);
      setEstimatedTime(0);
    }
  }, [isGenerating, output]);

  // Use external model if provided, otherwise use default
  const selectedModel = externalSelectedModel || 'google/gemini-2.5-flash';
  const getModelDisplayName = (modelId: string) => {
    if (modelId === 'google/gemini-2.5-flash') return 'Gemini 2.5 Flash';
    if (modelId === 'openai/gpt-5') return 'GPT-5';
    if (modelId === 'openai/gpt-5-mini') return 'GPT-5 Mini';
    return 'Gemini 2.5 Flash';
  };

  // Check for connected input and use it as prompt if available
  React.useEffect(() => {
    if (getInput) {
      const connectedInput = getInput(id, 'input');
      if (connectedInput && typeof connectedInput === 'string') {
        setPrompt(connectedInput);
      }
    }
  }, [getInput, id]);

  // Update output whenever text is generated
  React.useEffect(() => {
    if (output && setOutput) {
      setOutput(id, 'output', output);
    }
  }, [output, setOutput, id]);

  const handleSelectAction = (template: ActionTemplate) => {
    setSelectedTemplate(template);
    setPrompt(template.defaultPrompt);
    
    if (template.createNodes.length > 0 && onCreateConnectedNodes) {
      onCreateConnectedNodes(id, template);
    }
    
    setMode('prompt');
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    // Build full prompt with connected inputs
    let fullPrompt = prompt;
    if (connectedInputs.length > 0) {
      fullPrompt += '\n\nInputs:\n';
      connectedInputs.forEach((input, idx) => {
        fullPrompt += `\n${idx + 1}. [${input.type}]: ${input.value || 'No data'}`;
      });
    }
    
    generateText(fullPrompt, selectedModel);
    setMode('output');
  };

  const handleModelChange = (modelId: string) => {
    if (externalOnModelChange) {
      externalOnModelChange(modelId);
    }
  };

  const handleClear = () => {
    setPrompt("");
    setMode('suggestions');
    setSelectedTemplate(null);
  };

  const handleBackToPrompt = () => {
    setMode('prompt');
  };

  return (
    <BlockBase
      id={id}
      type="text"
      title="Text"
      onSelect={onSelect}
      isSelected={isSelected}
      model={getModelDisplayName(selectedModel)}
      toolbar={
        <BlockFloatingToolbar
          blockType="text"
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
        />
      }
    >
      {/* Suggestions Mode */}
      {mode === 'suggestions' && (
        <TextBlockSuggestions onSelectAction={handleSelectAction} />
      )}

      {/* Prompt Mode */}
      {mode === 'prompt' && (
        <div className="space-y-3">
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
              placeholder='Try "Write a compelling product description for..."'
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
              <Badge className="bg-zinc-800 text-zinc-400 text-xs border-zinc-700/50">
                {prompt.length}
              </Badge>
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

          {/* Loading State */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="min-h-[120px] rounded-xl bg-zinc-900/50 border border-zinc-800/30 relative overflow-hidden p-4">
                {/* Animated Progress Overlay */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Timer Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-black/60 text-white text-xs backdrop-blur-sm border-0">
                    ~{estimatedTime}s
                  </Badge>
                </div>
                
                {/* Bottom Progress */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="text-xs text-zinc-400 mb-2 truncate">
                    {prompt}
                  </div>
                  <div className="h-1 bg-zinc-800/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Output Mode */}
      {mode === 'output' && output && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          {/* Output Display */}
          <div className="relative">
            <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/30 max-h-[200px] overflow-y-auto">
              <div className="text-sm text-zinc-100 leading-relaxed whitespace-pre-wrap">
                {output}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-200"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(output);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-200"
              onClick={(e) => {
                e.stopPropagation();
                const blob = new Blob([output], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'generated-text.txt';
                a.click();
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

export default TextBlock;
