import React, { memo, useCallback, useMemo, useState } from 'react';
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
import { HANDLE_COLORS, Port, DataType, isTypeCompatible } from '@/types/computeFlow';

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

  // Get primary color based on node type
  const primaryColor = useMemo(() => {
    const outputType = nodeData.outputs?.[0]?.datatype || 'any';
    return HANDLE_COLORS[outputType as DataType] || HANDLE_COLORS.any;
  }, [nodeData.outputs]);

  // Status indicator styles
  const statusStyles = useMemo(() => {
    switch (nodeData.status) {
      case 'running': return { ring: 'ring-2 ring-blue-500/50', dot: 'bg-blue-500' };
      case 'succeeded': return { ring: 'ring-2 ring-green-500/50', dot: 'bg-green-500' };
      case 'failed': return { ring: 'ring-2 ring-red-500/50', dot: 'bg-red-500' };
      case 'queued': return { ring: 'ring-2 ring-amber-500/50', dot: 'bg-amber-500' };
      default: return { ring: selected ? 'ring-2 ring-purple-500/40' : '', dot: 'bg-zinc-600' };
    }
  }, [nodeData.status, selected]);

  // Handle validation for connections
  const isValidConnection = useCallback((connection: Connection) => {
    const edges = getEdges();
    const targetPort = nodeData.inputs?.find(p => p.id === connection.targetHandle);
    if (!targetPort) return false;
    return true;
  }, [nodeData.inputs, getEdges]);

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border border-zinc-800/80 backdrop-blur-md',
        'min-w-[280px] max-w-[320px] transition-all duration-200',
        'bg-zinc-900/90 shadow-xl',
        statusStyles.ring
      )}
      style={{ 
        boxShadow: selected 
          ? `0 0 40px ${primaryColor}20, 0 8px 32px rgba(0, 0, 0, 0.6)` 
          : '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}
    >
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

      {/* Input Handles (Left side) - Small circular */}
      {nodeData.inputs?.map((port, index) => {
        const top = collapsed ? 24 : 60 + index * 40;
        const color = HANDLE_COLORS[port.datatype as DataType] || HANDLE_COLORS.any;
        const isHovered = hoveredHandle === port.id;

        return (
          <React.Fragment key={port.id}>
            <Handle
              type="target"
              position={Position.Left}
              id={port.id}
              className="!rounded-full !border-2 transition-all duration-150"
              style={{
                width: isHovered ? 12 : 10,
                height: isHovered ? 12 : 10,
                background: color,
                borderColor: 'rgb(24 24 27)',
                top,
                boxShadow: isHovered ? `0 0 12px ${color}` : 'none',
              }}
              onMouseEnter={() => setHoveredHandle(port.id)}
              onMouseLeave={() => setHoveredHandle(null)}
              isValidConnection={isValidConnection}
            />
            {/* Tooltip label on hover */}
            {isHovered && !collapsed && (
              <div
                className="absolute left-0 -translate-x-full pr-2 text-[10px] text-zinc-400 whitespace-nowrap pointer-events-none"
                style={{ top: top - 5 }}
              >
                {port.name}
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Output Handles (Right side) - Small circular */}
      {nodeData.outputs?.map((port, index) => {
        const top = collapsed ? 24 : 60 + index * 40;
        const color = HANDLE_COLORS[port.datatype as DataType] || HANDLE_COLORS.any;
        const isHovered = hoveredHandle === port.id;

        return (
          <React.Fragment key={port.id}>
            <Handle
              type="source"
              position={Position.Right}
              id={port.id}
              className="!rounded-full !border-2 transition-all duration-150"
              style={{
                width: isHovered ? 12 : 10,
                height: isHovered ? 12 : 10,
                background: color,
                borderColor: 'rgb(24 24 27)',
                top,
                boxShadow: isHovered ? `0 0 12px ${color}` : 'none',
              }}
              onMouseEnter={() => setHoveredHandle(port.id)}
              onMouseLeave={() => setHoveredHandle(null)}
            />
            {/* Tooltip label on hover */}
            {isHovered && !collapsed && (
              <div
                className="absolute right-0 translate-x-full pl-2 text-[10px] text-zinc-400 whitespace-nowrap pointer-events-none"
                style={{ top: top - 5 }}
              >
                {port.name}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
});

ComputeNode.displayName = 'ComputeNode';
