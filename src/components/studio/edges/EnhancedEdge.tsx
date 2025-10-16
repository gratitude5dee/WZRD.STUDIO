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
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.3, // Smoother, more professional curves
  });

  return (
    <>
      <defs>
        {/* Professional gradient */}
        <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="1" />
          <stop offset="50%" stopColor="#8B5CF6" stopOpacity="1" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="1" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation={selected ? "6" : "3"} result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer glow layer */}
      <path
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={selected ? 10 : 8}
        stroke={`url(#gradient-${id})`}
        fill="none"
        opacity={0.2}
        filter={`url(#glow-${id})`}
        style={{ pointerEvents: 'none' }}
      />

      {/* Main edge path with smooth gradient */}
      <path
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={selected ? 3 : 2.5}
        stroke={`url(#gradient-${id})`}
        fill="none"
        style={{
          ...style,
          filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))',
        }}
        markerEnd={markerEnd}
      />

      {/* Animated flow particles - Multiple for better effect */}
      {[0, 0.4, 0.8].map((delay, i) => (
        <circle 
          key={i}
          r="3" 
          fill="#60A5FA"
          opacity={0.8}
        >
          <animateMotion 
            dur="2s" 
            repeatCount="indefinite" 
            path={edgePath}
            begin={`${delay}s`}
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="2s"
            repeatCount="indefinite"
            begin={`${delay}s`}
          />
        </circle>
      ))}
    </>
  );
};

export default EnhancedEdge;
