import React, { useState, useEffect } from 'react';
import BlockBase, { ConnectionPoint } from './BlockBase';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
              className="min-h-[120px] text-sm bg-zinc-900/50 border-zinc-800/40 rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-zinc-900/70 resize-none cursor-text transition-all"
              placeholder='Try "Write a compelling product description for..."'
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-zinc-800/80 border-zinc-700/50 text-zinc-400">
                {prompt.length} chars
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 font-medium">
              <kbd className="px-1.5 py-0.5 bg-zinc-800/50 border border-zinc-700/50 rounded text-[9px]">TAB</kbd> to send
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerate();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={isGenerating || !prompt.trim()}
              className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              title="Send"
            >
              {isGenerating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-xs text-white font-medium">Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-white" />
                  <span className="text-xs text-white font-medium">Generate</span>
                </>
              )}
            </button>
          </div>

          {/* Loading State */}
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 p-3 bg-zinc-900/30 rounded-xl border border-zinc-800/30"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-zinc-400">Generating text...</span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-black/40 border-zinc-700/50 text-zinc-400">
                  ~{estimatedTime}s
                </Badge>
              </div>
              <div className="h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Output Mode */}
      {mode === 'output' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          {/* Output Display */}
          {output && (
            <div className="relative group">
              <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/30 max-h-[300px] overflow-y-auto custom-scrollbar">
                <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-mono">
                  {output}
                </div>
              </div>
              
              {/* Top Badge */}
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className="text-[10px] bg-green-500/10 border-green-500/30 text-green-400">
                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                  Generated
                </Badge>
              </div>

              {/* Character Count Badge */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Badge variant="outline" className="text-[10px] bg-black/80 border-zinc-700/50 text-zinc-400 backdrop-blur-sm">
                  {output.length} chars
                </Badge>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBackToPrompt();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-all"
            >
              Edit Prompt
            </button>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(output || '');
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="p-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-all group/btn"
                title="Copy"
              >
                <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-zinc-200" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const blob = new Blob([output || ''], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'generated-text.txt';
                  a.click();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="p-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-all group/btn"
                title="Download"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-zinc-200" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerate();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                disabled={isGenerating}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-all"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-xs text-white font-medium">Regenerating...</span>
                  </>
                ) : (
                  <>
                    <RotateCw className="w-3 h-3 text-white" />
                    <span className="text-xs text-white font-medium">Regenerate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </BlockBase>
  );
};

export default TextBlock;
