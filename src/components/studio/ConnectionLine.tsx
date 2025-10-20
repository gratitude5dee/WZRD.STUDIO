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
      <path
        fill="none"
        stroke={getHandleColor()}
        strokeWidth={2.5}
        strokeDasharray="8 4"
        d={edgePath}
        className="animated"
      />
      <circle
        cx={toX}
        cy={toY}
        fill="hsl(var(--background))"
        r={3}
        stroke={getHandleColor()}
        strokeWidth={2}
      />
    </g>
  );
};
