import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { Upload } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeStatusBadge } from '../status/NodeStatusBadge';

export const ReactFlowUploadNode = memo(({ id, data, selected }: NodeProps) => {
  const status = (data as any)?.status || 'idle';
  const progress = (data as any)?.progress || 0;
  const error = (data as any)?.error;
  const onDuplicate = (data as any)?.onDuplicate;
  const onDelete = (data as any)?.onDelete;

  const handles = [
    {
      id: 'upload-output',
      type: 'source' as const,
      position: Position.Right,
      dataType: 'image' as const,
      label: 'Source',
    },
  ];

  return (
    <BaseNode
      handles={handles}
      nodeType="image"
      isSelected={selected}
      hoverMenu={{
        onDuplicate,
        onDelete,
      }}
    >
      <NodeStatusBadge status={status} progress={progress} error={error} />
      <div className="w-80 bg-[#1a1a1a] border border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f0f0f] border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-white" />
            <span className="text-white font-mono text-sm">Upload</span>
          </div>
          <span className="text-zinc-400 text-xs">Source</span>
        </div>
        <div className="p-4 space-y-3 text-sm text-zinc-300">
          <div className="rounded border border-dashed border-zinc-700 bg-zinc-900/60 p-4 text-center">
            <p className="text-white font-medium">Drop files or click to upload</p>
            <p className="text-xs text-zinc-500 mt-2">Images, video, or audio</p>
          </div>
          <div className="text-xs text-zinc-500">Outputs connect to image inputs.</div>
        </div>
      </div>
    </BaseNode>
  );
});

ReactFlowUploadNode.displayName = 'ReactFlowUploadNode';
