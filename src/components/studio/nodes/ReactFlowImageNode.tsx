import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import ImageBlock from '../blocks/ImageBlock';
import { NodeStatusBadge } from '../status/NodeStatusBadge';

const IMAGE_MODEL_OPTIONS = [
  { id: 'google/gemini-2.5-flash-image-preview', label: 'Gemini 2.5 Flash' },
  { id: 'fal-ai/flux/dev', label: 'Flux Dev' },
  { id: 'fal-ai/flux-pro/v1.1', label: 'Flux Pro' },
  { id: 'fal-ai/recraft-v3', label: 'Recraft V3' },
];

export const ReactFlowImageNode = memo(({ id, data, selected }: NodeProps) => {
  const status = (data as any)?.status || 'idle';
  const progress = (data as any)?.progress || 0;
  const error = (data as any)?.error;
  const onSpawnBlocks = (data as any)?.onSpawnBlocks;
  const blockPosition = (data as any)?.blockPosition || { x: 0, y: 0 };
  const onModelChange = (data as any)?.onModelChange;
  const onGenerate = (data as any)?.onGenerate ?? (data as any)?.onExecute;
  const onDuplicate = (data as any)?.onDuplicate;
  const onDelete = (data as any)?.onDelete;
  
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
    <BaseNode
      handles={handles}
      nodeType="image"
      isSelected={selected}
      hoverMenu={{
        selectedModel: (data as any)?.selectedModel,
        modelOptions: IMAGE_MODEL_OPTIONS,
        onModelChange,
        onGenerate,
        onDuplicate,
        onDelete,
      }}
    >
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
          onModelChange={onModelChange}
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
