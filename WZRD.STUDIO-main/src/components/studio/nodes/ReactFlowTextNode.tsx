import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import TextBlock from '../blocks/TextBlock';
import { NodeStatusBadge } from '../status/NodeStatusBadge';

const TEXT_MODEL_OPTIONS = [
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { id: 'openai/gpt-5-mini', label: 'GPT-5 Mini' },
  { id: 'openai/gpt-5', label: 'GPT-5' },
];

export const ReactFlowTextNode = memo(({ id, data, selected }: NodeProps) => {
  // Extract status from data if available
  const status = (data as any)?.status || 'idle';
  const progress = (data as any)?.progress || 0;
  const error = (data as any)?.error;
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
    <BaseNode
      handles={handles}
      nodeType="text"
      isSelected={selected}
      hoverMenu={{
        selectedModel: (data as any)?.selectedModel,
        modelOptions: TEXT_MODEL_OPTIONS,
        onModelChange,
        onGenerate,
        onDuplicate,
        onDelete,
      }}
    >
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
          onModelChange={onModelChange}
          initialData={(data as any)?.initialData}
        />
      </div>
    </BaseNode>
  );
});

ReactFlowTextNode.displayName = 'ReactFlowTextNode';
