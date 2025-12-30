import { ConnectionLineComponentProps, getBezierPath } from '@xyflow/react';
import { studioLayout } from '@/lib/studio/theme';
import { HANDLE_COLORS, HANDLE_GLOW_COLORS, DataType } from '@/types/computeFlow';

export const CustomConnectionLine = ({
  fromX,
  fromY,
  toX,
  toY,
  fromHandle,
}: ConnectionLineComponentProps) => {
  // Smooth bezier with dynamic curvature based on distance
  const distance = Math.hypot(toX - fromX, toY - fromY);
  const curvature = Math.min(0.5, Math.max(0.25, distance / 800));
  
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
    curvature,
  });

  // Detect data type from handle ID
  const getDataType = (): DataType => {
    if (!fromHandle?.id) return 'any';
    const id = fromHandle.id.toLowerCase();
    if (id.includes('image') || id.includes('reference')) return 'image';
    if (id.includes('text') || id.includes('prompt')) return 'text';
    if (id.includes('video')) return 'video';
    if (id.includes('audio')) return 'audio';
    return 'any';
  };

  const dataType = getDataType();
  const strokeColor = HANDLE_COLORS[dataType];
  const glowColor = HANDLE_GLOW_COLORS[dataType];

  // Calculate gradient ID for unique gradients
  const gradientId = `connection-gradient-${fromX}-${fromY}`;

  return (
    <g>
      {/* Gradient definition */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="1" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.6" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="connection-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer atmospheric glow */}
      <path
        fill="none"
        stroke={glowColor}
        strokeWidth={16}
        d={edgePath}
        style={{ filter: 'blur(12px)' }}
        opacity={0.5}
      />
      
      {/* Mid glow layer */}
      <path
        fill="none"
        stroke={strokeColor}
        strokeWidth={8}
        strokeOpacity={0.25}
        d={edgePath}
        style={{ filter: 'blur(6px)' }}
      />
      
      {/* Core line with gradient */}
      <path
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={3}
        strokeLinecap="round"
        d={edgePath}
        filter="url(#connection-glow)"
      />

      {/* Animated dashed overlay */}
      <path
        fill="none"
        stroke={strokeColor}
        strokeWidth={3}
        strokeDasharray="12 6"
        strokeLinecap="round"
        d={edgePath}
        opacity={0.8}
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-18"
          dur="0.6s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Fast traveling particle */}
      <circle r="5" fill={strokeColor} filter="url(#connection-glow)">
        <animateMotion dur="0.7s" repeatCount="indefinite" path={edgePath} />
        <animate attributeName="opacity" values="0.3;1;0.3" dur="0.7s" repeatCount="indefinite" />
        <animate attributeName="r" values="4;6;4" dur="0.7s" repeatCount="indefinite" />
      </circle>
      
      {/* Secondary slower particle for depth */}
      <circle r="3" fill={strokeColor} opacity={0.6}>
        <animateMotion dur="1.2s" repeatCount="indefinite" path={edgePath} begin="0.3s" />
      </circle>
      
      {/* Source handle - double ring design */}
      <circle
        cx={fromX}
        cy={fromY}
        r={7}
        fill="#09090b"
        stroke={strokeColor}
        strokeWidth={2.5}
        filter="url(#connection-glow)"
      />
      <circle
        cx={fromX}
        cy={fromY}
        r={3}
        fill={strokeColor}
      />
      
      {/* Target cursor - magnetic snap indicator */}
      <circle
        cx={toX}
        cy={toY}
        r={10}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        opacity={0.4}
      >
        <animate
          attributeName="r"
          values="8;14;8"
          dur="1s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.6;0.2;0.6"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Target center dot */}
      <circle
        cx={toX}
        cy={toY}
        r={6}
        fill="#09090b"
        stroke={strokeColor}
        strokeWidth={2.5}
      />
      <circle
        cx={toX}
        cy={toY}
        r={2.5}
        fill={strokeColor}
      />
    </g>
  );
};
