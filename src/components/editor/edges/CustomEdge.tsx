import React, { FC } from 'react';
import { EdgeProps, getBezierPath, BaseEdge } from '@xyflow/react';

export const CustomEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        ...style,
        stroke: (data?.color as string) || '#8B5CF6',
        strokeWidth: 2,
      }}
    />
  );
};
