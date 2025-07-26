import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GlassCard } from '@/components/ui/glass-card';
import { Layers, Sparkles } from 'lucide-react';

interface KnowledgeClusterData {
  label: string;
  description: string;
  category: 'cluster';
  concepts: string[];
  strength: number;
}

export const KnowledgeCluster = memo<NodeProps<KnowledgeClusterData>>(({ data, selected }) => {
  return (
    <GlassCard 
      variant="nebula"
      depth="deep"
      glow={selected ? "intense" : "medium"}
      interactive="none"
      particle
      shimmer
      className="min-w-[280px] max-w-[320px] cursor-pointer"
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-cosmic-nebula !w-3 !h-3 !border-2 !border-cosmic-void"
      />
      
      <div className="p-5 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Layers className="w-6 h-6 text-cosmic-nebula" />
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-cosmic-stellar animate-pulse" />
          </div>
          <h3 className="font-bold text-lg glow-text-secondary">
            {data.label}
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {data.description}
        </p>
        
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-cosmic-nebula uppercase tracking-wide">
            Contains {data.concepts.length} Concepts
          </h4>
          <div className="flex flex-wrap gap-1">
            {data.concepts.map((concept, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 rounded-full bg-cosmic-nebula/10 text-cosmic-nebula border border-cosmic-nebula/20"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
        
        {/* Cluster strength indicator */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Cluster Coherence</span>
            <span className="text-cosmic-nebula">{Math.round(data.strength * 100)}%</span>
          </div>
          <div className="w-full bg-cosmic-void/30 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-cosmic-nebula to-cosmic-plasma transition-all duration-500"
              style={{ width: `${data.strength * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-cosmic-nebula !w-3 !h-3 !border-2 !border-cosmic-void"
      />
    </GlassCard>
  );
});

KnowledgeCluster.displayName = 'KnowledgeCluster';