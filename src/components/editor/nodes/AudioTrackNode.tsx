import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Music, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioTrackNodeData {
  trackId: string;
  name: string;
  duration: number;
  volume: number;
}

export const AudioTrackNode = memo((props: NodeProps) => {
  const { data, selected } = props;
  const nodeData = data as unknown as AudioTrackNodeData;
  
  return (
    <div
      className={cn(
        "bg-zinc-900 rounded-lg border-2 shadow-xl p-4 min-w-[200px]",
        selected ? "border-blue-500 shadow-blue-500/50" : "border-white/[0.12]"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-blue-400" />
          <div className="text-sm font-medium text-white truncate">
            {nodeData.name}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="w-3 h-3 text-white/60" />
          <div className="flex-1 h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${nodeData.volume * 100}%` }}
            />
          </div>
          <span className="text-xs text-white/60">{Math.round(nodeData.volume * 100)}%</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
    </div>
  );
});

AudioTrackNode.displayName = 'AudioTrackNode';
