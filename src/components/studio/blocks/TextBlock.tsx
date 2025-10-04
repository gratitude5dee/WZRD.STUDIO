
import React, { useState } from 'react';
import BlockBase, { ConnectionPoint } from './BlockBase';
import { Textarea } from '@/components/ui/textarea';
import { useGeminiText } from '@/hooks/useGeminiText';
import ModelSelector from '../ModelSelector';
import { geminiTextModels } from '@/types/modelTypes';
import { Sparkles } from 'lucide-react';

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
  onDragEnd
}) => {
  const [prompt, setPrompt] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-flash');
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const { isGenerating, output, generateText } = useGeminiText();

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generateText(prompt, selectedModel);
  };

  const handleClear = () => {
    setPrompt("");
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
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-zinc-400">Gemini AI</span>
          </div>
          <span className="text-green-400 text-xs">FREE until Oct 6</span>
        </div>

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
          className="min-h-[80px] text-sm bg-zinc-800/50 border border-zinc-700 focus:border-blue-500 resize-none"
          placeholder="Enter your prompt here..."
          disabled={isGenerating}
        />

        {output && (
          <div className="p-3 bg-zinc-900/50 rounded border border-zinc-700 max-h-40 overflow-y-auto">
            <pre className="text-sm text-zinc-300 whitespace-pre-wrap">{output}</pre>
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleClear}
            className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-white rounded"
            disabled={isGenerating}
          >
            Clear
          </button>
          <button
            onClick={handleGenerate}
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
    </BlockBase>
  );
};

export default TextBlock;
