import React, { useState } from 'react';
import BlockBase, { ConnectionPoint } from './BlockBase';
import { Textarea } from '@/components/ui/textarea';
import { useGeminiText } from '@/hooks/useGeminiText';
import { Sparkles } from 'lucide-react';
import TextBlockSuggestions from './TextBlockSuggestions';
import { ActionTemplate, BlockMode, ConnectedInput } from '@/types/studioTypes';
import { BlockFloatingToolbar } from './BlockFloatingToolbar';

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
  const { isGenerating, output, generateText } = useGeminiText();

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
        <div className="space-y-2">
          <p className="text-xs text-zinc-500">Try to...</p>
          <TextBlockSuggestions onSelectAction={handleSelectAction} />
        </div>
      )}

      {/* Prompt Mode */}
      {mode === 'prompt' && (
        <div className="space-y-2.5">
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
            className="min-h-[100px] text-sm bg-zinc-950/50 border-zinc-800/50 text-zinc-200 placeholder:text-zinc-600 focus:border-blue-500/50 resize-none cursor-text"
            placeholder="Describe what you want to generate..."
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
          
          <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800/30">
            <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-medium">TAB to send</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerate();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={isGenerating || !prompt.trim()}
              className="w-5 h-5 rounded-md bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send"
            >
              {isGenerating ? (
                <div className="w-2.5 h-2.5 border border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Output Mode */}
      {mode === 'output' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs mb-1">
            <Sparkles className="w-3 h-3 text-green-400" />
            <span className="text-zinc-500">Generated Text</span>
          </div>

          {output && (
            <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 max-h-60 overflow-y-auto">
              <pre className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{output}</pre>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-1.5 border-t border-zinc-800/30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBackToPrompt();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Edit Prompt
            </button>
            <div className="flex gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(output || '');
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="px-2.5 py-1 text-[10px] bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 rounded transition-colors"
              >
                Copy
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerate();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                disabled={isGenerating}
                className="px-2.5 py-1 text-[10px] bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-1.5 disabled:opacity-50 transition-all"
              >
                {isGenerating ? (
                  <>
                    <div className="w-2.5 h-2.5 border border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Regenerate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </BlockBase>
  );
};

export default TextBlock;
