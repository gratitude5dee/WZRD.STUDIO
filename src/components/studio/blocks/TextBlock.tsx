
import React, { useState } from 'react';
import BlockBase, { ConnectionPoint } from './BlockBase';
import { Textarea } from '@/components/ui/textarea';
import { useGeminiText } from '@/hooks/useGeminiText';
import ModelSelector from '../ModelSelector';
import { geminiTextModels } from '@/types/modelTypes';
import { Sparkles, X } from 'lucide-react';
import TextBlockSuggestions from './TextBlockSuggestions';
import { ActionTemplate, BlockMode, ConnectedInput } from '@/types/studioTypes';
import { Badge } from '@/components/ui/badge';

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
  onInputBlur
}) => {
  const [mode, setMode] = useState<BlockMode>('suggestions');
  const [prompt, setPrompt] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-flash');
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ActionTemplate | null>(null);
  const { isGenerating, output, generateText } = useGeminiText();

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
      model={selectedModel}
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
        <div className="space-y-3">
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
            className="min-h-[120px] text-sm bg-zinc-800/50 border border-zinc-700 focus:border-blue-500 resize-none cursor-text"
            placeholder="Type your prompt..."
            disabled={isGenerating}
          />
          
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>TAB</span>
              <span>to send</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerate();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={isGenerating || !prompt.trim()}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Send"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Output Mode */}
      {mode === 'output' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-green-400" />
              <span className="text-zinc-400">Generated Text</span>
            </div>
          </div>

          {output && (
            <div className="p-3 bg-zinc-900/50 rounded border border-zinc-700 max-h-60 overflow-y-auto">
              <pre className="text-sm text-zinc-300 whitespace-pre-wrap">{output}</pre>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBackToPrompt();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
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
                className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-white rounded"
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
                className="px-3 py-1 text-xs bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    Regenerate
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
