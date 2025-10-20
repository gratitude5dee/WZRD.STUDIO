import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import ImageBlock from '../blocks/ImageBlock';

export const ReactFlowImageNode = memo(({ id, data, selected }: NodeProps) => {
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
      <div className="w-80">
        <ImageBlock
          id={id}
          onSelect={() => {}}
          isSelected={selected || false}
          selectedModel={(data as any)?.selectedModel}
          initialData={(data as any)?.initialData}
          displayMode="input"
        />
      </div>
    </BaseNode>
  );
});

ReactFlowImageNode.displayName = 'ReactFlowImageNode';
