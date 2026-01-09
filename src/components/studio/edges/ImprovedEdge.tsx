import { memo } from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';

export const ImprovedEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const gradientId = `improved-edge-gradient-${id}`;
  const glowId = `improved-edge-glow-${id}`;

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        id={`${id}-glow`}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={10}
        stroke={`url(#${gradientId})`}
        fill="none"
        filter={`url(#${glowId})`}
        style={{ opacity: 0.35 }}
      />

      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={2.5}
        stroke={`url(#${gradientId})`}
        fill="none"
        markerEnd={markerEnd}
      />
    </>
  );
});

ImprovedEdge.displayName = 'ImprovedEdge';

export default ImprovedEdge;
