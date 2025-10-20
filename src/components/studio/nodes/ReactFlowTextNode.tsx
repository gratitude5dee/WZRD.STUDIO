import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import TextBlock from '../blocks/TextBlock';
import { NodeStatusBadge } from '../status/NodeStatusBadge';

export const ReactFlowTextNode = memo(({ id, data, selected }: NodeProps) => {
  // Extract status from data if available
  const status = (data as any)?.status || 'idle';
  const progress = (data as any)?.progress || 0;
  const error = (data as any)?.error;
  const handles = [
    {
      id: 'text-input',
      type: 'target' as const,
      position: Position.Left,
      dataType: 'text' as const,
      label: 'Input',
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
      id: 'text-output',
      type: 'source' as const,
      position: Position.Right,
      dataType: 'text' as const,
      label: 'Output',
    },
  ];

  return (
    <BaseNode handles={handles}>
      {/* Status indicator */}
      <NodeStatusBadge 
        status={status}
        progress={progress}
        error={error}
      />
      
      <div className="w-80">
        <TextBlock
          id={id}
          onSelect={() => {}}
          isSelected={selected || false}
          selectedModel={(data as any)?.selectedModel}
          initialData={(data as any)?.initialData}
        />
      </div>
    </BaseNode>
  );
});

ReactFlowTextNode.displayName = 'ReactFlowTextNode';
