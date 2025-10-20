import { ConnectionLineComponentProps, getStraightPath } from '@xyflow/react';

export const CustomConnectionLine = ({
  fromX,
  fromY,
  toX,
  toY,
  fromHandle,
}: ConnectionLineComponentProps) => {
  const [edgePath] = getStraightPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
  });

  const getHandleColor = () => {
    if (!fromHandle?.id) return 'hsl(var(--primary))';
    if (fromHandle.id.includes('text')) return 'hsl(var(--chart-1))';
    if (fromHandle.id.includes('image')) return 'hsl(var(--chart-2))';
    if (fromHandle.id.includes('video')) return 'hsl(var(--chart-3))';
    return 'hsl(var(--primary))';
  };

  return (
    <g>
      {/* Glow effect */}
      <path
        fill="none"
        stroke={getHandleColor()}
        strokeWidth={8}
        strokeOpacity={0.3}
        d={edgePath}
        style={{ filter: 'blur(4px)' }}
      />
      {/* Main line */}
      <path
        fill="none"
        stroke={getHandleColor()}
        strokeWidth={3}
        strokeDasharray="8 4"
        d={edgePath}
        className="animated"
      />
      {/* End circle */}
      <circle
        cx={toX}
        cy={toY}
        fill="hsl(var(--background))"
        r={6}
        stroke={getHandleColor()}
        strokeWidth={3}
      />
    </g>
  );
};
