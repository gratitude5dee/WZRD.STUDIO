import { memo } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import VideoBlock from '../blocks/VideoBlock';
import { NodeStatusBadge } from '../status/NodeStatusBadge';

const VIDEO_MODEL_OPTIONS = [
  { id: 'gemini-2.5-flash-video', label: 'Veo 3 Fast' },
  { id: 'luma-dream', label: 'Luma Dream' },
];

export const ReactFlowVideoNode = memo(({ id, data, selected }: NodeProps) => {
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
    <BaseNode
      handles={handles}
      nodeType="video"
      isSelected={selected}
      hoverMenu={{
        selectedModel: (data as any)?.selectedModel,
        modelOptions: VIDEO_MODEL_OPTIONS,
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
        <VideoBlock
          id={id}
          onSelect={() => {}}
          isSelected={selected || false}
          selectedModel={(data as any)?.selectedModel}
          onModelChange={onModelChange}
        />
      </div>
    </BaseNode>
  );
});

ReactFlowVideoNode.displayName = 'ReactFlowVideoNode';
