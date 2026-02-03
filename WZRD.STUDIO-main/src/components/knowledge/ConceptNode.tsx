import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GlassCard } from '@/components/ui/glass-card';
import { Brain, Zap, Star, Orbit } from 'lucide-react';

interface ConceptNodeData {
  label: string;
  description: string;
  category: 'core' | 'technique' | 'creative' | 'new';
  connections: number;
  strength: number;
}

export const ConceptNode = memo<NodeProps<ConceptNodeData>>(({ data, selected }) => {
  const getCategoryIcon = () => {
    switch (data.category) {
      case 'core': return <Brain className="w-4 h-4" />;
      case 'technique': return <Zap className="w-4 h-4" />;
      case 'creative': return <Star className="w-4 h-4" />;
      default: return <Orbit className="w-4 h-4" />;
    }
  };

  const getCategoryColor = () => {
    switch (data.category) {
      case 'core': return 'stellar';
      case 'technique': return 'plasma';
      case 'creative': return 'quantum';
      default: return 'nebula';
    }
  };

  return (
    <GlassCard 
      variant={getCategoryColor() as any}
      depth="medium"
      glow={selected ? "intense" : "subtle"}
      interactive="none"
      particle={data.category === 'core'}
      shimmer
      className="min-w-[200px] max-w-[250px] cursor-pointer transition-all duration-300"
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-cosmic-stellar !w-2 !h-2 !border-2 !border-cosmic-void"
      />
      
      <div className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <div className={`text-cosmic-${getCategoryColor()}`}>
            {getCategoryIcon()}
          </div>
          <h3 className="font-semibold text-sm glow-text-primary line-clamp-1">
            {data.label}
          </h3>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {data.description}
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded-full bg-cosmic-${getCategoryColor()}/20 text-cosmic-${getCategoryColor()} border border-cosmic-${getCategoryColor()}/30`}>
            {data.category}
          </span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full bg-cosmic-${getCategoryColor()} animate-pulse`} />
            <span className="text-muted-foreground">{data.connections}</span>
          </div>
        </div>
        
        {/* Strength indicator */}
        <div className="w-full bg-cosmic-void/30 rounded-full h-1">
          <div 
            className={`h-1 rounded-full bg-cosmic-${getCategoryColor()} transition-all duration-500`}
            style={{ width: `${data.strength * 100}%` }}
          />
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-cosmic-stellar !w-2 !h-2 !border-2 !border-cosmic-void"
      />
    </GlassCard>
  );
});

ConceptNode.displayName = 'ConceptNode';