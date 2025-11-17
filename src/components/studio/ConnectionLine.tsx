import { ConnectionLineComponentProps, getBezierPath } from '@xyflow/react';
import { studioLayout } from '@/lib/studio/theme';

export const CustomConnectionLine = ({
  fromX,
  fromY,
  toX,
  toY,
  fromHandle,
}: ConnectionLineComponentProps) => {
  // Use Bezier path instead of straight path
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
    curvature: studioLayout.connection.curveStrength,
  });

  const getHandleColor = () => {
    if (!fromHandle?.id) return { stroke: 'hsl(217 91% 60%)', glow: 'rgba(59, 130, 246, 0.6)' };
    if (fromHandle.id.includes('text')) return { stroke: 'hsl(217 91% 60%)', glow: 'rgba(59, 130, 246, 0.6)' };
    if (fromHandle.id.includes('image')) return { stroke: 'hsl(258 90% 66%)', glow: 'rgba(139, 92, 246, 0.6)' };
    if (fromHandle.id.includes('video')) return { stroke: 'hsl(45 90% 60%)', glow: 'rgba(251, 191, 36, 0.6)' };
    return { stroke: 'hsl(217 91% 60%)', glow: 'rgba(59, 130, 246, 0.6)' };
  };

  const color = getHandleColor();

  return (
    <g>
      {/* Outer glow - animated pulse */}
      <path
        fill="none"
        stroke={color.glow}
        strokeWidth={12}
        strokeOpacity={0.4}
        d={edgePath}
        style={{ filter: 'blur(8px)' }}
        className="animate-pulse"
      />
      
      {/* Mid glow */}
      <path
        fill="none"
        stroke={color.stroke}
        strokeWidth={8}
        strokeOpacity={0.3}
        d={edgePath}
        style={{ filter: 'blur(4px)' }}
      />
      
      {/* Main line with dash animation */}
      <path
        fill="none"
        stroke={color.stroke}
        strokeWidth={3}
        strokeDasharray="8 4"
        d={edgePath}
        className="animate-[dash_0.5s_linear_infinite]"
      />
      
      {/* Animated particle */}
      <circle
        r="4"
        fill={color.stroke}
        className="opacity-90"
      >
        <animateMotion
          dur="0.8s"
          repeatCount="indefinite"
          path={edgePath}
        />
        <animate
          attributeName="opacity"
          values="0.5;1;0.5"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* End circle with pulsing ring */}
      <circle
        cx={toX}
        cy={toY}
        fill="hsl(var(--background))"
        r={6}
        stroke={color.stroke}
        strokeWidth={3}
        className="drop-shadow-lg"
      />
      
      {/* Pulsing ring around end circle */}
      <circle
        cx={toX}
        cy={toY}
        fill="none"
        r={10}
        stroke={color.stroke}
        strokeWidth={2}
        opacity={0.5}
        className="animate-ping"
      />
      
      {/* Source indicator */}
      <circle
        cx={fromX}
        cy={fromY}
        fill={color.stroke}
        r={4}
        className="drop-shadow-lg"
      />
    </g>
  );
};
