import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Film, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoClipNodeData {
  clipId: string;
  name: string;
  url: string;
  duration: number;
  thumbnailUrl?: string;
}

export const VideoClipNode = memo((props: NodeProps) => {
  const { data, selected } = props;
  const nodeData = data as unknown as VideoClipNodeData;
  
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        "relative bg-zinc-900 rounded-lg border-2 shadow-xl overflow-hidden min-w-[240px]",
        selected ? "border-purple-500 shadow-purple-500/50" : "border-white/[0.12]"
      )}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />

      {/* Thumbnail */}
      {nodeData.thumbnailUrl && (
        <div className="h-32 w-full bg-black overflow-hidden">
          <img
            src={nodeData.thumbnailUrl}
            alt={nodeData.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-purple-400" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {nodeData.name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/60">
          <Clock className="w-3 h-3" />
          <span>{formatDuration(nodeData.duration)}</span>
        </div>

        {/* Progress bar placeholder */}
        <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
          <div className="h-full w-0 bg-purple-500 transition-all" />
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
      />
    </div>
  );
});

VideoClipNode.displayName = 'VideoClipNode';
