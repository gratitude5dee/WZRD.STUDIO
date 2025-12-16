import React, { memo, useMemo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import { motion } from 'framer-motion';
import { HANDLE_COLORS, DataType, EdgeStatus } from '@/types/computeFlow';

export interface ComputeEdgeData {
  dataType?: DataType;
  status?: EdgeStatus;
  label?: string;
}

export const ComputeEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps) => {
  const edgeData = data as ComputeEdgeData | undefined;
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.4,
  });

  const color = HANDLE_COLORS[edgeData?.dataType || 'any'];
  const status = edgeData?.status || 'idle';
  
  const strokeStyle = useMemo(() => {
    switch (status) {
      case 'running':
        return { 
          strokeDasharray: '8 4',
          strokeWidth: selected ? 3 : 2.5,
        };
      case 'succeeded':
        return { 
          strokeWidth: selected ? 3.5 : 3,
          strokeDasharray: 'none',
        };
      case 'error':
        return { 
          stroke: '#ef4444', 
          strokeWidth: selected ? 3.5 : 3,
          strokeDasharray: 'none',
        };
      default:
        return { 
          strokeDasharray: '6 4',
          strokeWidth: selected ? 3 : 2,
        };
    }
  }, [status, selected]);

  return (
    <>
      {/* Invisible wider path for easier selection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
      />
      
      {/* Glow effect */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={(strokeStyle.strokeWidth as number) + 4}
        strokeOpacity={0.15}
        style={{ filter: 'blur(4px)' }}
      />
      
      {/* Visible edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: status === 'error' ? '#ef4444' : color,
          strokeWidth: strokeStyle.strokeWidth,
          strokeDasharray: strokeStyle.strokeDasharray,
          opacity: selected ? 1 : 0.8,
          transition: 'all 0.2s ease',
        }}
      />

      {/* Animated data flow particles for running status */}
      {status === 'running' && (
        <g>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              r={4}
              fill={color}
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: '100%' }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: 'linear',
                delay: i * 0.5,
              }}
              style={{ 
                offsetPath: `path('${edgePath}')`,
                filter: `drop-shadow(0 0 4px ${color})`,
              }}
            />
          ))}
        </g>
      )}

      {/* Success flash animation */}
      {status === 'succeeded' && (
        <motion.path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={6}
          initial={{ opacity: 0.8, pathLength: 0 }}
          animate={{ opacity: 0, pathLength: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      )}

      {/* Connection dots at endpoints */}
      <circle
        cx={sourceX}
        cy={sourceY}
        r={4}
        fill={color}
        stroke="#18181b"
        strokeWidth={2}
      />
      <circle
        cx={targetX}
        cy={targetY}
        r={4}
        fill={color}
        stroke="#18181b"
        strokeWidth={2}
      />

      {/* Label */}
      {edgeData?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="bg-zinc-800/90 px-2 py-1 rounded-md text-xs text-zinc-300 border border-zinc-700/50 backdrop-blur-sm"
          >
            {edgeData.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

ComputeEdge.displayName = 'ComputeEdge';
