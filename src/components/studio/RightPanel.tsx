import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Check, ChevronDown, Sparkles } from 'lucide-react';
import { Node } from 'reactflow';

interface GeneratedOutput {
  id: string;
  url: string;
  model: string;
  timestamp: Date;
  type: 'image' | 'text' | 'video';
}

interface RightPanelProps {
  selectedNode: Node | null;
  isOpen: boolean;
  onClose: () => void;
  onModelChange?: (model: string) => void;
  onAspectRatioChange?: (ratio: string) => void;
}

const AI_MODELS = [
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', category: 'text' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', category: 'text' },
  { id: 'openai/gpt-5', name: 'GPT-5', category: 'text' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', category: 'text' },
  { id: 'fal-ai/flux-pro', name: 'Flux Pro', category: 'image' },
  { id: 'fal-ai/flux-dev', name: 'Flux Dev', category: 'image' },
  { id: 'minimax/video-01', name: 'Minimax Video', category: 'video' },
  { id: 'luma/dream-machine', name: 'Luma Dream', category: 'video' },
];

const ASPECT_RATIOS = [
  { id: '16:9', name: 'Landscape (16:9)' },
  { id: '1:1', name: 'Square (1:1)' },
  { id: '9:16', name: 'Portrait (9:16)' },
  { id: '4:3', name: 'Classic (4:3)' },
];

export const RightPanel = ({
  selectedNode,
  isOpen,
  onClose,
  onModelChange,
  onAspectRatioChange,
}: RightPanelProps) => {
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-flash');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [hoveredOutput, setHoveredOutput] = useState<string | null>(null);

  // Mock outputs - replace with actual data
  const [outputs] = useState<GeneratedOutput[]>([
    {
      id: '1',
      url: '/lovable-uploads/075616c6-e4fc-4662-a4b8-68b746782b65.png',
      model: 'Flux Pro',
      timestamp: new Date(),
      type: 'image',
    },
    {
      id: '2',
      url: '/lovable-uploads/4e20f36a-2bff-48d8-b07b-257334e35506.png',
      model: 'Flux Dev',
      timestamp: new Date(),
      type: 'image',
    },
    {
      id: '3',
      url: '/lovable-uploads/96cbbf8f-bdb1-4d37-9c62-da1306d5fb96.png',
      model: 'Flux Pro',
      timestamp: new Date(),
      type: 'image',
    },
  ]);

  const nodeType = selectedNode?.data?.type?.toLowerCase() || '';
  const isImageNode = nodeType.includes('image');
  const isTextNode = nodeType.includes('text');
  const isVideoNode = nodeType.includes('video');

  const getRelevantModels = () => {
    if (isImageNode) return AI_MODELS.filter((m) => m.category === 'image');
    if (isVideoNode) return AI_MODELS.filter((m) => m.category === 'video');
    return AI_MODELS.filter((m) => m.category === 'text');
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    onModelChange?.(modelId);
  };

  const handleRatioChange = (ratioId: string) => {
    setSelectedRatio(ratioId);
    onAspectRatioChange?.(ratioId);
  };

  const handleDownload = (output: GeneratedOutput) => {
    const link = document.createElement('a');
    link.href = output.url;
    link.download = `wzrd-output-${output.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed right-0 top-0 h-full w-[400px] bg-[#141416] border-l border-[#27272A] shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#27272A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#6366F1]" />
              <h2 className="text-base font-semibold text-[#FAFAFA]">
                {selectedNode ? 'Node Settings' : 'Outputs'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#27272A] transition-colors"
            >
              <X className="w-4 h-4 text-[#A1A1AA]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedNode ? (
              <div className="p-4 space-y-6">
                {/* Model Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wide">
                    AI Model
                  </label>
                  <div className="relative">
                    <select
                      value={selectedModel}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full bg-[#1C1C1F] text-[#FAFAFA] text-sm px-3 py-2.5 rounded-lg border border-[#3F3F46] hover:border-[#52525B] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 appearance-none cursor-pointer"
                    >
                      {getRelevantModels().map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA] pointer-events-none" />
                  </div>
                </div>

                {/* Aspect Ratio Selector (for image nodes) */}
                {isImageNode && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wide">
                      Aspect Ratio
                    </label>
                    <div className="relative">
                      <select
                        value={selectedRatio}
                        onChange={(e) => handleRatioChange(e.target.value)}
                        className="w-full bg-[#1C1C1F] text-[#FAFAFA] text-sm px-3 py-2.5 rounded-lg border border-[#3F3F46] hover:border-[#52525B] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 appearance-none cursor-pointer"
                      >
                        {ASPECT_RATIOS.map((ratio) => (
                          <option key={ratio.id} value={ratio.id}>
                            {ratio.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA] pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Output Gallery */}
                {outputs.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wide">
                        Generated Outputs
                      </label>
                      <span className="text-xs text-[#52525B]">{outputs.length} items</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {outputs.map((output, idx) => (
                        <motion.div
                          key={output.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05, duration: 0.2 }}
                          onMouseEnter={() => setHoveredOutput(output.id)}
                          onMouseLeave={() => setHoveredOutput(null)}
                          className="aspect-square relative group cursor-pointer rounded-lg overflow-hidden border border-[#3F3F46] hover:border-[#6366F1] transition-all"
                        >
                          <img
                            src={output.url}
                            alt={`Output ${output.id}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Model Badge */}
                          <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md text-[10px] text-white font-medium">
                            {output.model}
                          </div>

                          {/* Hover Overlay */}
                          <AnimatePresence>
                            {hoveredOutput === output.id && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2"
                              >
                                <button
                                  onClick={() => handleDownload(output)}
                                  className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm border border-white/20 transition-colors"
                                >
                                  <Download className="w-4 h-4 text-white" />
                                </button>
                                <button
                                  onClick={() => {
                                    // Handle use/apply logic
                                  }}
                                  className="w-8 h-8 flex items-center justify-center bg-[#6366F1] hover:bg-[#5558E3] rounded-lg transition-colors"
                                >
                                  <Check className="w-4 h-4 text-white" />
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Node Info */}
                <div className="pt-4 border-t border-[#27272A]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#A1A1AA]">Node Type</span>
                      <span className="text-[#FAFAFA] font-medium">{selectedNode.data.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#A1A1AA]">Status</span>
                      <span className="text-[#10B981] font-medium">
                        {selectedNode.data.status || 'Idle'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#27272A] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#52525B]" />
                </div>
                <p className="text-sm text-[#A1A1AA] mb-1">No node selected</p>
                <p className="text-xs text-[#52525B]">Select a node to view settings and outputs</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
