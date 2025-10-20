import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import VideoBlock from '../blocks/VideoBlock';
import { NodeStatusBadge } from '../status/NodeStatusBadge';

export const ReactFlowVideoNode = memo(({ id, data, selected }: NodeProps) => {
  const status = (data as any)?.status || 'idle';
  const progress = (data as any)?.progress || 0;
  const error = (data as any)?.error;
  const handles = [
    {
      id: 'text-input',
      type: 'target' as const,
      position: Position.Left,
      dataType: 'text' as const,
      label: 'Prompt',
      maxConnections: 1,
    },
    {
      id: 'image-input',
      type: 'target' as const,
      position: Position.Left,
      dataType: 'image' as const,
      label: 'Image',
      maxConnections: 1,
    },
    {
      id: 'video-output',
      type: 'source' as const,
      position: Position.Right,
      dataType: 'video' as const,
      label: 'Output',
    },
  ];

  return (
    <BaseNode handles={handles}>
      <NodeStatusBadge 
        status={status}
        progress={progress}
        error={error}
      />
      
      <div className="w-80">
        <VideoBlock
          id={id}
          onSelect={() => {}}
          isSelected={selected || false}
          selectedModel={(data as any)?.selectedModel}
        />
      </div>
    </BaseNode>
  );
});

ReactFlowVideoNode.displayName = 'ReactFlowVideoNode';
