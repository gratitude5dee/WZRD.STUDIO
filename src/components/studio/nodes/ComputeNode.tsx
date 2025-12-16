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
  GitBranch
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
  onExecute?: () => void;
  onDelete?: () => void;
  onParamsChange?: (params: Record<string, any>) => void;
}

const ROW_HEIGHT = 50;

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

export const ComputeNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = (data as unknown) as ComputeNodeData;
  const { getEdges } = useReactFlow();
  const [collapsed, setCollapsed] = useState(nodeData.collapsed ?? false);
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);

  const Icon = NODE_ICONS[nodeData.kind] || Box;

  // Calculate border color based on status
  const borderColor = useMemo(() => {
    switch (nodeData.status) {
      case 'running': return 'border-blue-500';
      case 'succeeded': return 'border-green-500';
      case 'failed': return 'border-red-500';
      case 'queued': return 'border-yellow-500';
      default: return selected ? 'border-purple-500' : 'border-zinc-700/50';
    }
  }, [nodeData.status, selected]);

  // Status icon
  const StatusIcon = useMemo(() => {
    switch (nodeData.status) {
      case 'running': return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
      case 'succeeded': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'queued': return <Loader2 className="w-4 h-4 text-yellow-400" />;
      default: return null;
    }
  }, [nodeData.status]);

  // Handle validation for connections
  const isValidConnection = useCallback((connection: Connection) => {
    const edges = getEdges();
    const targetPort = nodeData.inputs?.find(p => p.id === connection.targetHandle);
    
    if (!targetPort) return false;
    return true;
  }, [nodeData.inputs, getEdges]);

  // Get icon color based on output type
  const iconBgColor = useMemo(() => {
    const outputType = nodeData.outputs?.[0]?.datatype || 'any';
    return HANDLE_COLORS[outputType as DataType] || HANDLE_COLORS.any;
  }, [nodeData.outputs]);

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border-2 backdrop-blur-sm',
        'min-w-[380px] shadow-2xl transition-all duration-200',
        'bg-zinc-900/95',
        borderColor,
        nodeData.status === 'running' && 'animate-pulse'
      )}
      style={{ 
        boxShadow: selected 
          ? '0 0 30px rgba(139, 92, 246, 0.4), 0 8px 32px rgba(0, 0, 0, 0.5)' 
          : '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-700/50">
        {/* Node icon */}
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all"
          style={{ 
            backgroundColor: `${iconBgColor}20`,
            boxShadow: `0 0 20px ${iconBgColor}30`
          }}
        >
          <Icon className="w-5 h-5" style={{ color: iconBgColor }} />
        </div>
        
        {/* Title */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{nodeData.label}</h3>
          <span className="text-xs text-zinc-500">{nodeData.kind}</span>
        </div>

        {/* Status & Controls */}
        <div className="flex items-center gap-2">
          {StatusIcon}
          
          {nodeData.status === 'running' && nodeData.progress !== undefined && (
            <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${nodeData.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-zinc-700/50 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          
          <button
            onClick={nodeData.onExecute}
            className="p-1.5 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 rounded-lg transition-colors"
            title="Execute node"
          >
            <Play className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content (collapsible) */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Preview */}
              {nodeData.preview && (
                <div className="rounded-lg overflow-hidden border border-zinc-700/50">
                  {nodeData.preview.type === 'image' && nodeData.preview.url && (
                    <img 
                      src={nodeData.preview.url} 
                      alt="Preview" 
                      className="w-full h-40 object-cover"
                    />
                  )}
                  {nodeData.preview.type === 'text' && (
                    <div className="p-3 text-sm text-zinc-300 max-h-28 overflow-y-auto bg-zinc-800/50">
                      {nodeData.preview.data}
                    </div>
                  )}
                </div>
              )}

              {/* Parameters */}
              {nodeData.params && Object.keys(nodeData.params).length > 0 && (
                <div className="space-y-3">
                  {Object.entries(nodeData.params).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-xs text-zinc-500 font-medium capitalize">{key}</label>
                      <input
                        type="text"
                        value={String(value || '')}
                        onChange={(e) => nodeData.onParamsChange?.({ ...nodeData.params, [key]: e.target.value })}
                        className="bg-zinc-800/80 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                        placeholder={`Enter ${key}...`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state for params */}
              {(!nodeData.params || Object.keys(nodeData.params).length === 0) && !nodeData.preview && (
                <div className="text-center py-4 text-zinc-500 text-sm">
                  No parameters configured
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Handles (Left side) */}
      {nodeData.inputs?.map((port, index) => {
        const top = collapsed ? 32 : 80 + index * ROW_HEIGHT;
        const color = HANDLE_COLORS[port.datatype as DataType] || HANDLE_COLORS.any;

        return (
          <React.Fragment key={port.id}>
            {/* Handle label */}
            {!collapsed && (
              <span
                className="absolute left-0 -translate-x-full pr-3 text-xs font-mono text-zinc-400 pointer-events-none whitespace-nowrap"
                style={{ top: top - 6 }}
              >
                {port.name}
              </span>
            )}
            
            {/* Handle */}
            <Handle
              type="target"
              position={Position.Left}
              id={port.id}
              className="!rounded-sm !border-2 !border-zinc-800 transition-all duration-150"
              style={{
                width: 12,
                height: 12,
                background: color,
                top,
                transform: hoveredHandle === port.id ? 'scale(1.4)' : 'scale(1)',
                boxShadow: hoveredHandle === port.id ? `0 0 10px ${color}` : 'none',
              }}
              onMouseEnter={() => setHoveredHandle(port.id)}
              onMouseLeave={() => setHoveredHandle(null)}
              isValidConnection={isValidConnection}
            />
          </React.Fragment>
        );
      })}

      {/* Output Handles (Right side) */}
      {nodeData.outputs?.map((port, index) => {
        const top = collapsed ? 32 : 80 + index * ROW_HEIGHT;
        const color = HANDLE_COLORS[port.datatype as DataType] || HANDLE_COLORS.any;

        return (
          <React.Fragment key={port.id}>
            {/* Handle label */}
            {!collapsed && (
              <span
                className="absolute right-0 translate-x-full pl-3 text-xs font-mono text-zinc-400 pointer-events-none whitespace-nowrap"
                style={{ top: top - 6 }}
              >
                {port.name}
              </span>
            )}
            
            {/* Handle */}
            <Handle
              type="source"
              position={Position.Right}
              id={port.id}
              className="!rounded-sm !border-2 !border-zinc-800 transition-all duration-150"
              style={{
                width: 12,
                height: 12,
                background: color,
                top,
                transform: hoveredHandle === port.id ? 'scale(1.4)' : 'scale(1)',
                boxShadow: hoveredHandle === port.id ? `0 0 10px ${color}` : 'none',
              }}
              onMouseEnter={() => setHoveredHandle(port.id)}
              onMouseLeave={() => setHoveredHandle(null)}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
});

ComputeNode.displayName = 'ComputeNode';
