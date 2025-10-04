
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
      title="TEXT"
      onSelect={onSelect}
      isSelected={isSelected}
      generationTime="~2s"
      supportsConnections={supportsConnections}
      connectionPoints={connectionPoints}
      onShowHistory={onShowHistory}
      onStartConnection={onStartConnection}
      onFinishConnection={onFinishConnection}
      onDragEnd={onDragEnd}
      onRegisterRef={onRegisterRef}
    >
      {/* Suggestions Mode */}
      {mode === 'suggestions' && (
        <TextBlockSuggestions onSelectAction={handleSelectAction} />
      )}

      {/* Prompt Mode */}
      {mode === 'prompt' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span className="text-zinc-400">Gemini AI</span>
            </div>
            <span className="text-green-400 text-xs">FREE until Oct 6</span>
          </div>

          {/* Connected Inputs Display */}
          {connectedInputs.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">Connected Inputs: {connectedInputs.length}</div>
              <div className="space-y-1">
                {connectedInputs.map((input, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-xs">
                      {input.type}
                    </Badge>
                    <span className="text-zinc-500 truncate">
                      {input.value ? String(input.value).substring(0, 30) + '...' : 'Waiting for data'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ModelSelector
            models={geminiTextModels}
            selectedModelId={selectedModel}
            onModelSelect={setSelectedModel}
            modelType="text"
            isOpen={isModelSelectorOpen}
            toggleOpen={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
          />
          
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
            className="min-h-[80px] text-sm bg-zinc-800/50 border border-zinc-700 focus:border-blue-500 resize-none cursor-text"
            placeholder="Enter your prompt here..."
            disabled={isGenerating}
          />
          
          <div className="flex justify-between items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
              disabled={isGenerating}
            >
              <X className="w-3 h-3" />
              Reset
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerate();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={isGenerating || !prompt.trim()}
              className="px-3 py-1 text-xs bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded shadow-glow-purple-sm hover:shadow-glow-purple-md transition-all-std disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Generate
                </>
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
