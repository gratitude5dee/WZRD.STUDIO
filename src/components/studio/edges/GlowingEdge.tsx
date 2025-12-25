import { memo } from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';

export const GlowingEdge = memo(({
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

  return (
    <>
      <path
        id={`${id}-glow`}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={8}
        stroke="url(#edge-glow-gradient)"
        fill="none"
        filter="url(#glow)"
        style={{ opacity: 0.5 }}
      />

      <path
        id={`${id}-pulse`}
        className="react-flow__edge-path animate-pulse-glow"
        d={edgePath}
        strokeWidth={4}
        stroke="url(#edge-gradient)"
        fill="none"
        filter="url(#glow)"
      />

      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={2}
        stroke="#a78bfa"
        fill="none"
        markerEnd={markerEnd}
      />

      <circle r="3" fill="#c4b5fd">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
      </circle>

      <defs>
        <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        <linearGradient id="edge-glow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>

        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </>
  );
});

GlowingEdge.displayName = 'GlowingEdge';

export default GlowingEdge;
