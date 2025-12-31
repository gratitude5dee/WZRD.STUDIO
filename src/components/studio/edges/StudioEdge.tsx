import { FC } from 'react';
import { getBezierPath, EdgeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

export const StudioEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  animated,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const isRunning = animated || data?.status === 'running';
  const pathId = `edge-path-${id}`;

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        stroke="hsl(var(--accent-purple))"
        strokeWidth={6}
        strokeOpacity={isRunning ? 0.2 : 0}
        className={cn(isRunning && 'animate-pulse-subtle')}
      />

      <path
        id={pathId}
        d={edgePath}
        fill="none"
        stroke={isRunning ? 'hsl(var(--accent-purple))' : 'hsl(var(--border-default))'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={isRunning ? '8 4' : undefined}
        className={cn('transition-colors duration-300', isRunning && 'animate-dash')}
      />

      {isRunning && (
        <circle r={3} fill="hsl(var(--accent-purple))">
          <animateMotion dur="1.5s" repeatCount="indefinite">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      )}
    </>
  );
};
