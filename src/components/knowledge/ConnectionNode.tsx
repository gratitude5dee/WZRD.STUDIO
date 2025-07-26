import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GlassCard } from '@/components/ui/glass-card';
import { Zap, ArrowRight } from 'lucide-react';

interface ConnectionNodeData {
  label: string;
  strength: number;
  type: 'relates' | 'causes' | 'enables' | 'requires';
}

export const ConnectionNode = memo<NodeProps<ConnectionNodeData>>(({ data, selected }) => {
  const getTypeColor = () => {
    switch (data.type) {
      case 'relates': return 'plasma';
      case 'causes': return 'temporal';
      case 'enables': return 'quantum';
      case 'requires': return 'stellar';
      default: return 'nebula';
    }
  };

  return (
    <GlassCard 
      variant="void"
      depth="shallow"
      glow={selected ? "medium" : "none"}
      interactive="none"
      className="min-w-[120px] cursor-pointer"
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-cosmic-stellar !w-2 !h-2 !border-2 !border-cosmic-void"
      />
      
      <div className="p-3 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Zap className={`w-3 h-3 text-cosmic-${getTypeColor()}`} />
          <ArrowRight className={`w-3 h-3 text-cosmic-${getTypeColor()}`} />
        </div>
        
        <p className="text-xs font-medium text-foreground mb-1">
          {data.label}
        </p>
        
        <span className={`text-xs px-2 py-0.5 rounded-full bg-cosmic-${getTypeColor()}/20 text-cosmic-${getTypeColor()} border border-cosmic-${getTypeColor()}/30`}>
          {data.type}
        </span>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-cosmic-stellar !w-2 !h-2 !border-2 !border-cosmic-void"
      />
    </GlassCard>
  );
});

ConnectionNode.displayName = 'ConnectionNode';