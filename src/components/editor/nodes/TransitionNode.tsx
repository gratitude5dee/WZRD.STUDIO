import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransitionNodeData {
  type: 'fade' | 'dissolve' | 'wipe';
  duration: number;
}

export const TransitionNode = memo((props: NodeProps) => {
  const { data, selected } = props;
  const nodeData = data as unknown as TransitionNodeData;
  
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg border-2 shadow-xl p-3",
        selected ? "border-pink-500 shadow-pink-500/50" : "border-white/[0.12]"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
      />

      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-pink-400" />
        <div className="text-sm font-medium text-white capitalize">
          {nodeData.type}
        </div>
      </div>

      <div className="text-xs text-white/60 mt-1">
        {nodeData.duration}ms
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-pink-500 border-2 border-white"
      />
    </div>
  );
});

TransitionNode.displayName = 'TransitionNode';
