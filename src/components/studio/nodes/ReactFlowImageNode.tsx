import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import ImageBlock from '../blocks/ImageBlock';
import { NodeStatusBadge } from '../status/NodeStatusBadge';

export const ReactFlowImageNode = memo(({ id, data, selected }: NodeProps) => {
  const status = (data as any)?.status || 'idle';
  const progress = (data as any)?.progress || 0;
  const error = (data as any)?.error;
  const onSpawnBlocks = (data as any)?.onSpawnBlocks;
  const blockPosition = (data as any)?.blockPosition || { x: 0, y: 0 };
  
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
      id: 'image-output',
      type: 'source' as const,
      position: Position.Right,
      dataType: 'image' as const,
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
        <ImageBlock
          id={id}
          onSelect={() => {}}
          isSelected={selected || false}
          selectedModel={(data as any)?.selectedModel}
          initialData={(data as any)?.initialData}
          displayMode="input"
          blockPosition={blockPosition}
          onSpawnBlocks={onSpawnBlocks}
        />
      </div>
    </BaseNode>
  );
});

ReactFlowImageNode.displayName = 'ReactFlowImageNode';
