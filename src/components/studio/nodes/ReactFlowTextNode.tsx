import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { BaseNode, BaseNodeHeader, BaseNodeHeaderTitle, BaseNodeContent } from './BaseNode';
import TextBlock from '../blocks/TextBlock';

export const ReactFlowTextNode = memo(({ id, data, selected }: NodeProps) => {
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
