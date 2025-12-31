import { FC, useMemo, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
  Position,
} from '@xyflow/react';
import { motion } from 'framer-motion';
import { HANDLE_COLORS, HANDLE_GLOW_COLORS, DataType } from '@/types/computeFlow';
import { cn } from '@/lib/utils';

export type EdgeStatus = 'idle' | 'running' | 'succeeded' | 'error';

export const StudioEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const status = data?.status || 'idle';
  const dataType = (data?.dataType as DataType) || 'any';

  const [edgePath, labelX, labelY] = useMemo(() => {
    const distance = Math.abs(targetX - sourceX);
    const curveIntensity = Math.min(distance * 0.5, 150);
    const sourceControlX = sourceX + curveIntensity;
    const targetControlX = targetX - curveIntensity;
    const verticalOffset = (targetY - sourceY) * 0.1;
    const path = [
      `M ${sourceX} ${sourceY}`,
      `C ${sourceControlX} ${sourceY + verticalOffset},`,
      `${targetControlX} ${targetY - verticalOffset},`,
      `${targetX} ${targetY}`,
    ].join(' ');

    const [fallbackPath, fallbackLabelX, fallbackLabelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition: sourcePosition as Position,
      targetX,
      targetY,
      targetPosition: targetPosition as Position,
    });

    return [path || fallbackPath, fallbackLabelX, fallbackLabelY] as const;
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  const strokeColor = HANDLE_COLORS[dataType] || HANDLE_COLORS.any;
  const glowColor = HANDLE_GLOW_COLORS[dataType] || HANDLE_GLOW_COLORS.any;
  const isExecuting = status === 'running';
  const isSelected = selected;

  return (
    <>
      <BaseEdge
        id={`${id}-glow`}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: isHovered || isSelected ? 5 : 3,
          opacity: 0.35,
          filter: 'blur(6px)',
        }}
      />

      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: isHovered || isSelected ? 3 : 2,
          strokeLinecap: 'round',
          strokeDasharray: isExecuting ? '8 4' : undefined,
          animation: isExecuting ? 'dash 0.5s linear infinite' : undefined,
          filter: isHovered || isSelected ? `drop-shadow(0 0 8px ${glowColor})` : 'none',
        }}
        className={cn('transition-all duration-150', isHovered && 'cursor-pointer')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {isExecuting && (
        <g>
          <circle r="4" fill={strokeColor} filter={`drop-shadow(0 0 4px ${glowColor})`}>
            <animateMotion dur="1.2s" repeatCount="indefinite" path={edgePath} />
          </circle>
          <circle r="3" fill={strokeColor} opacity="0.6">
            <animateMotion dur="1.6s" repeatCount="indefinite" path={edgePath} begin="0.4s" />
          </circle>
        </g>
      )}

      {/* Success flash */}
      {status === 'succeeded' && (
        <EdgeLabelRenderer>
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
            }}
            className="w-4 h-4 rounded-full bg-green-500/50"
          />
        </EdgeLabelRenderer>
      )}

      {isHovered && (
        <EdgeLabelRenderer>
          <div
            className="absolute rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 shadow-lg"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
            }}
          >
            <span style={{ color: strokeColor }}>{dataType}</span>
          </div>
        </EdgeLabelRenderer>
      )}

      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan px-2 py-1 rounded text-xs bg-background border shadow-sm"
          >
            {String(data.label)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
