import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Connection } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image,
  Type,
  Video,
  Wand2,
  Box,
  Workflow,
  Send,
  GitBranch,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HANDLE_COLORS, HANDLE_GLOW_COLORS, Port, DataType, isTypeCompatible } from '@/types/computeFlow';
import { NodeHoverMenu } from './NodeHoverMenu';

export interface ComputeNodeData {
  kind: string;
  label: string;
  inputs: Port[];
  outputs: Port[];
  params: Record<string, any>;
  status: 'idle' | 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled' | 'dirty';
  progress?: number;
  preview?: { type: string; url?: string; data?: any };
  collapsed?: boolean;
  color?: string;
  model?: string;
  onExecute?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onModelChange?: (modelId: string) => void;
  onParamsChange?: (params: Record<string, any>) => void;
}

const NODE_ICONS: Record<string, React.ElementType> = {
  Image: Image,
  Text: Type,
  Video: Video,
  Prompt: Wand2,
  Model: Box,
  Transform: Workflow,
  Output: Send,
  Gateway: GitBranch,
};

const MODEL_OPTIONS: Record<string, string[]> = {
  Image: ['Flux Dev', 'Flux Pro', 'SDXL', 'Midjourney'],
  Text: ['GPT-4o', 'Claude 3.5', 'Gemini Pro', 'Llama 3'],
  Video: ['Minimax', 'Runway Gen-3', 'Pika', 'Kling'],
};

const HELPER_TEXT: Record<string, string> = {
  Image: "Try 'An abstract geometric pattern with vibrant colors'",
  Text: "Try 'Write a compelling product description'",
  Video: "Try 'A cinematic drone shot over mountains'",
  Prompt: "Connect text or image inputs to enhance prompts",
  Model: "Select and configure AI model parameters",
  Transform: "Apply transformations to your data",
  Output: "Export or save your generated content",
  Gateway: "Route data based on conditions",
};

export const ComputeNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = (data as unknown) as ComputeNodeData;
  const { getEdges } = useReactFlow();
  const [collapsed, setCollapsed] = useState(nodeData.collapsed ?? false);
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(nodeData.model || MODEL_OPTIONS[nodeData.kind]?.[0] || '');

  const Icon = NODE_ICONS[nodeData.kind] || Box;
  const helperText = HELPER_TEXT[nodeData.kind] || '';
  const models = MODEL_OPTIONS[nodeData.kind] || [];

  useEffect(() => {
    if (nodeData.model && nodeData.model !== selectedModel) {
      setSelectedModel(nodeData.model);
    }
  }, [nodeData.model, selectedModel]);

  // Get primary color based on node type
  const primaryColor = useMemo(() => {
    const outputType = nodeData.outputs?.[0]?.datatype || 'any';
    return HANDLE_COLORS[outputType as DataType] || HANDLE_COLORS.any;
  }, [nodeData.outputs]);

  // Status indicator styles with premium glow effects
  const statusStyles = useMemo(() => {
    switch (nodeData.status) {
      case 'running': return { 
        ring: 'ring-2 ring-blue-500/60', 
        dot: 'bg-blue-500',
        glow: '0 0 20px rgba(59, 130, 246, 0.4)',
        animate: true,
      };
      case 'succeeded': return { 
        ring: 'ring-2 ring-emerald-500/60', 
        dot: 'bg-emerald-500',
        glow: '0 0 16px rgba(16, 185, 129, 0.3)',
        animate: false,
      };
      case 'failed': return { 
        ring: 'ring-2 ring-red-500/60', 
        dot: 'bg-red-500',
        glow: '0 0 16px rgba(239, 68, 68, 0.3)',
        animate: false,
      };
      case 'queued': return { 
        ring: 'ring-2 ring-amber-500/50', 
        dot: 'bg-amber-500',
        glow: '0 0 12px rgba(245, 158, 11, 0.2)',
        animate: true,
      };
      default: return { 
        ring: selected ? 'ring-2 ring-purple-500/50' : '', 
        dot: 'bg-zinc-600',
        glow: selected ? '0 0 24px rgba(139, 92, 246, 0.25)' : undefined,
        animate: false,
      };
    }
  }, [nodeData.status, selected]);

  // Handle validation for connections
  const isValidConnection = useCallback((connection: Connection) => {
    const edges = getEdges();
    const targetPort = nodeData.inputs?.find(p => p.id === connection.targetHandle);
    if (!targetPort) return false;
    return true;
  }, [nodeData.inputs, getEdges]);

  const handleModelChange = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    nodeData.onModelChange?.(modelId);
    if (nodeData.onParamsChange) {
      nodeData.onParamsChange({ ...nodeData.params, model: modelId });
    }
  }, [nodeData]);

  // Hover state for node
  const [isNodeHovered, setIsNodeHovered] = useState(false);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onMouseEnter={() => setIsNodeHovered(true)}
      onMouseLeave={() => setIsNodeHovered(false)}
      className={cn(
        'relative flex flex-col rounded-2xl border backdrop-blur-md',
        'min-w-[280px] max-w-[320px] transition-all duration-200',
        'bg-zinc-900/95',
        statusStyles.ring,
        isNodeHovered && !selected && 'border-zinc-700/80',
        !isNodeHovered && !selected && 'border-zinc-800/80',
        selected && 'border-purple-500/50'
      )}
      style={{ 
        boxShadow: statusStyles.glow 
          ? `${statusStyles.glow}, 0 8px 32px rgba(0, 0, 0, 0.5)`
          : isNodeHovered 
            ? `0 0 24px ${primaryColor}15, 0 12px 40px rgba(0, 0, 0, 0.5)`
            : '0 8px 32px rgba(0, 0, 0, 0.4)',
        transform: isNodeHovered && !selected ? 'translateY(-2px)' : undefined,
      }}
    >
      <NodeHoverMenu
        isVisible={isNodeHovered}
        selectedModel={selectedModel}
        modelOptions={models.map((model) => ({ id: model, label: model }))}
        onModelChange={models.length ? handleModelChange : undefined}
        onGenerate={nodeData.onExecute}
        onDuplicate={nodeData.onDuplicate}
        onDelete={nodeData.onDelete}
      />
      {/* Compact Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {/* Icon with glow */}
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ 
            backgroundColor: `${primaryColor}15`,
            boxShadow: `0 0 12px ${primaryColor}20`
          }}
        >
          <Icon className="w-4 h-4" style={{ color: primaryColor }} />
        </div>
        
        {/* Type Label */}
        <span className="text-sm font-medium text-zinc-300">{nodeData.kind}</span>
        
        {/* Model Selector (if applicable) */}
        {models.length > 0 && (
          <div className="ml-auto flex items-center gap-1 text-xs text-zinc-500 bg-zinc-800/60 px-2 py-1 rounded-md">
            <Sparkles className="w-3 h-3" />
            <span className="text-zinc-400">{selectedModel}</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        )}

        {/* Status dot */}
        <div className={cn('w-2 h-2 rounded-full', statusStyles.dot, 
          nodeData.status === 'running' && 'animate-pulse'
        )} />
        
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-zinc-700/50 rounded transition-colors text-zinc-500 hover:text-zinc-300"
        >
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Content (collapsible) */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              {/* Preview Area */}
              {nodeData.preview ? (
                <div className="rounded-xl overflow-hidden border border-zinc-800/50 bg-zinc-950/50">
                  {nodeData.preview.type === 'image' && nodeData.preview.url && (
                    <img 
                      src={nodeData.preview.url} 
                      alt="Preview" 
                      className="w-full h-36 object-cover"
                    />
                  )}
                  {nodeData.preview.type === 'text' && (
                    <div className="p-2.5 text-xs text-zinc-400 max-h-24 overflow-y-auto">
                      {nodeData.preview.data}
                    </div>
                  )}
                </div>
              ) : (
                /* Empty preview placeholder */
                <div className="h-32 rounded-xl border border-dashed border-zinc-800/60 bg-zinc-950/30 flex items-center justify-center">
                  <div className="text-center">
                    <Icon className="w-8 h-8 text-zinc-700 mx-auto mb-1" />
                    <span className="text-xs text-zinc-600">No preview</span>
                  </div>
                </div>
              )}

              {/* Progress bar for running state */}
              {nodeData.status === 'running' && nodeData.progress !== undefined && (
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ backgroundColor: primaryColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${nodeData.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              {/* Quick action button */}
              <button
                onClick={nodeData.onExecute}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium',
                  'transition-all duration-200',
                  nodeData.status === 'running' 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:text-purple-300'
                )}
                disabled={nodeData.status === 'running'}
              >
                {nodeData.status === 'running' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Generate
                  </>
                )}
              </button>

              {/* Helper text */}
              {helperText && (
                <p className="text-[10px] text-zinc-600 italic leading-relaxed">
                  {helperText}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Handles (Left side) - Premium double-ring design */}
      {nodeData.inputs?.map((port, index) => {
        const totalInputs = nodeData.inputs?.length || 1;
        const baseOffset = collapsed ? 24 : 56;
        const spacing = collapsed ? 0 : 44;
        const top = baseOffset + index * spacing;
        const color = HANDLE_COLORS[port.datatype as DataType] || HANDLE_COLORS.any;
        const glowColor = HANDLE_GLOW_COLORS[port.datatype as DataType] || HANDLE_GLOW_COLORS.any;
        const isHovered = hoveredHandle === port.id;

        return (
          <React.Fragment key={port.id}>
            {/* Outer glow ring on hover */}
            {isHovered && (
              <div
                className="absolute rounded-full pointer-events-none animate-pulse"
                style={{
                  width: 24,
                  height: 24,
                  left: -12,
                  top: top - 12,
                  background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                }}
              />
            )}
            <Handle
              type="target"
              position={Position.Left}
              id={port.id}
              className="!rounded-full transition-all duration-200 ease-out"
              style={{
                width: isHovered ? 16 : 14,
                height: isHovered ? 16 : 14,
                background: '#09090b',
                border: `2.5px solid ${color}`,
                top,
                left: isHovered ? -8 : -7,
                boxShadow: isHovered 
                  ? `0 0 16px ${color}, 0 0 8px ${glowColor}, inset 0 0 4px ${color}40`
                  : `0 0 6px ${color}40`,
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
              }}
              onMouseEnter={() => setHoveredHandle(port.id)}
              onMouseLeave={() => setHoveredHandle(null)}
              isValidConnection={isValidConnection}
            />
            {/* Inner dot */}
            <div
              className="absolute rounded-full pointer-events-none transition-all duration-200"
              style={{
                width: isHovered ? 6 : 5,
                height: isHovered ? 6 : 5,
                background: color,
                left: isHovered ? -3 : -2.5,
                top: top - (isHovered ? 3 : 2.5),
              }}
            />
            {/* Label tooltip */}
            <AnimatePresence>
              {isHovered && !collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  className="absolute left-0 -translate-x-full pr-3 pointer-events-none z-50"
                  style={{ top: top - 10 }}
                >
                  <div 
                    className="px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap"
                    style={{ 
                      background: `${color}15`,
                      color: color,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {port.name}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </React.Fragment>
        );
      })}

      {/* Output Handles (Right side) - Premium double-ring design */}
      {nodeData.outputs?.map((port, index) => {
        const baseOffset = collapsed ? 24 : 56;
        const spacing = collapsed ? 0 : 44;
        const top = baseOffset + index * spacing;
        const color = HANDLE_COLORS[port.datatype as DataType] || HANDLE_COLORS.any;
        const glowColor = HANDLE_GLOW_COLORS[port.datatype as DataType] || HANDLE_GLOW_COLORS.any;
        const isHovered = hoveredHandle === port.id;

        return (
          <React.Fragment key={port.id}>
            {/* Outer glow ring on hover */}
            {isHovered && (
              <div
                className="absolute rounded-full pointer-events-none animate-pulse"
                style={{
                  width: 24,
                  height: 24,
                  right: -12,
                  top: top - 12,
                  background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                }}
              />
            )}
            <Handle
              type="source"
              position={Position.Right}
              id={port.id}
              className="!rounded-full transition-all duration-200 ease-out"
              style={{
                width: isHovered ? 16 : 14,
                height: isHovered ? 16 : 14,
                background: '#09090b',
                border: `2.5px solid ${color}`,
                top,
                right: isHovered ? -8 : -7,
                boxShadow: isHovered 
                  ? `0 0 16px ${color}, 0 0 8px ${glowColor}, inset 0 0 4px ${color}40`
                  : `0 0 6px ${color}40`,
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
              }}
              onMouseEnter={() => setHoveredHandle(port.id)}
              onMouseLeave={() => setHoveredHandle(null)}
            />
            {/* Inner dot */}
            <div
              className="absolute rounded-full pointer-events-none transition-all duration-200"
              style={{
                width: isHovered ? 6 : 5,
                height: isHovered ? 6 : 5,
                background: color,
                right: isHovered ? -3 : -2.5,
                top: top - (isHovered ? 3 : 2.5),
              }}
            />
            {/* Label tooltip */}
            <AnimatePresence>
              {isHovered && !collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="absolute right-0 translate-x-full pl-3 pointer-events-none z-50"
                  style={{ top: top - 10 }}
                >
                  <div 
                    className="px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap"
                    style={{ 
                      background: `${color}15`,
                      color: color,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {port.name}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </React.Fragment>
        );
      })}
    </motion.div>
  );
});

ComputeNode.displayName = 'ComputeNode';
