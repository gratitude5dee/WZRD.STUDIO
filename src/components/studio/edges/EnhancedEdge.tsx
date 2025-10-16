import { FC } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';

const EnhancedEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  return (
    <>
      <defs>
        <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="50%" stopColor="hsl(var(--accent))" />
          <stop offset="100%" stopColor="hsl(var(--primary))" />
        </linearGradient>
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation={selected ? "4" : "2"} result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow effect */}
      <path
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={selected ? 8 : 6}
        stroke={`url(#gradient-${id})`}
        fill="none"
        opacity={0.3}
        filter={`url(#glow-${id})`}
      />

      {/* Main edge path */}
      <path
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={selected ? 3 : 2.5}
        stroke={`url(#gradient-${id})`}
        fill="none"
        style={style}
        markerEnd={markerEnd}
      />

      {/* Animated flow particle */}
      <circle r="3" fill="hsl(var(--accent))">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
};

export default EnhancedEdge;
