import React, { memo, useMemo, useState } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import { motion } from 'framer-motion';
import { HANDLE_COLORS, HANDLE_GLOW_COLORS, DataType, EdgeStatus } from '@/types/computeFlow';

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
}: EdgeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const edgeData = data as ComputeEdgeData | undefined;
  
  // Dynamic curvature based on distance for smoother curves
  const distance = Math.hypot(targetX - sourceX, targetY - sourceY);
  const curvature = Math.min(0.5, Math.max(0.25, distance / 600));
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature,
  });

  const dataType = edgeData?.dataType || 'any';
  const color = HANDLE_COLORS[dataType];
  const glowColor = HANDLE_GLOW_COLORS[dataType];
  const status = edgeData?.status || 'idle';
  
  const { strokeWidth, strokeDasharray, glowIntensity } = useMemo(() => {
    const isActive = selected || isHovered;
    switch (status) {
      case 'running':
        return { 
          strokeWidth: isActive ? 3.5 : 3,
          strokeDasharray: 'none',
          glowIntensity: 0.4,
        };
      case 'succeeded':
        return { 
          strokeWidth: isActive ? 4 : 3.5,
          strokeDasharray: 'none',
          glowIntensity: 0.5,
        };
      case 'error':
        return { 
          strokeWidth: isActive ? 4 : 3.5,
          strokeDasharray: 'none',
          glowIntensity: 0.6,
        };
      default:
        return { 
          strokeWidth: isActive ? 3 : 2.5,
          strokeDasharray: 'none',
          glowIntensity: isActive ? 0.35 : 0.2,
        };
    }
  }, [status, selected, isHovered]);

  const gradientId = `edge-gradient-${id}`;
  const glowFilterId = `edge-glow-${id}`;
  const errorColor = '#ef4444';
  const activeColor = status === 'error' ? errorColor : color;

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Definitions */}
      <defs>
        {/* Gradient for edge */}
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={sourceX} y1={sourceY} x2={targetX} y2={targetY}>
          <stop offset="0%" stopColor={activeColor} stopOpacity="1" />
          <stop offset="50%" stopColor={activeColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={activeColor} stopOpacity="0.75" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={selected || isHovered ? "5" : "3"} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Invisible hit area for easier selection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        className="cursor-pointer"
      />
      
      {/* Outer atmospheric glow */}
      <path
        d={edgePath}
        fill="none"
        stroke={status === 'error' ? 'rgba(239, 68, 68, 0.3)' : glowColor}
        strokeWidth={strokeWidth + 12}
        strokeLinecap="round"
        style={{ 
          filter: 'blur(8px)',
          opacity: glowIntensity,
          transition: 'opacity 0.2s ease',
        }}
      />
      
      {/* Inner glow */}
      <path
        d={edgePath}
        fill="none"
        stroke={activeColor}
        strokeWidth={strokeWidth + 6}
        strokeOpacity={0.2}
        strokeLinecap="round"
        style={{ filter: 'blur(4px)' }}
      />
      
      {/* Main edge line */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={strokeDasharray}
        style={{
          transition: 'stroke-width 0.15s ease',
          filter: selected ? `url(#${glowFilterId})` : undefined,
        }}
      />

      {/* Animated flow for running status */}
      {status === 'running' && (
        <g>
          {/* Animated dashed overlay */}
          <path
            d={edgePath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray="10 5"
            strokeLinecap="round"
            opacity={0.6}
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-15"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Traveling particles */}
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              r={5}
              fill={color}
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: '100%' }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity, 
                ease: 'linear',
                delay: i * 0.4,
              }}
              style={{ 
                offsetPath: `path('${edgePath}')`,
                filter: `drop-shadow(0 0 6px ${color})`,
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
          strokeWidth={8}
          strokeLinecap="round"
          initial={{ opacity: 0.9, pathLength: 0 }}
          animate={{ opacity: 0, pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 10px ${color})` }}
        />
      )}

      {/* Error pulse animation */}
      {status === 'error' && (
        <path
          d={edgePath}
          fill="none"
          stroke={errorColor}
          strokeWidth={strokeWidth + 2}
          strokeLinecap="round"
          opacity={0.5}
          style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
        />
      )}

      {/* Source endpoint - double ring design */}
      <circle
        cx={sourceX}
        cy={sourceY}
        r={isHovered || selected ? 7 : 6}
        fill="#09090b"
        stroke={activeColor}
        strokeWidth={2.5}
        style={{ 
          transition: 'r 0.15s ease',
          filter: (isHovered || selected) ? `drop-shadow(0 0 4px ${activeColor})` : undefined,
        }}
      />
      <circle
        cx={sourceX}
        cy={sourceY}
        r={2.5}
        fill={activeColor}
      />
      
      {/* Target endpoint - double ring design */}
      <circle
        cx={targetX}
        cy={targetY}
        r={isHovered || selected ? 7 : 6}
        fill="#09090b"
        stroke={activeColor}
        strokeWidth={2.5}
        style={{ 
          transition: 'r 0.15s ease',
          filter: (isHovered || selected) ? `drop-shadow(0 0 4px ${activeColor})` : undefined,
        }}
      />
      <circle
        cx={targetX}
        cy={targetY}
        r={2.5}
        fill={activeColor}
      />

      {/* Direction arrow at midpoint */}
      {status !== 'running' && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <circle
            r={8}
            fill="#09090b"
            stroke={activeColor}
            strokeWidth={1.5}
            opacity={isHovered || selected ? 1 : 0.7}
          />
          <path
            d="M-3,-3 L3,0 L-3,3"
            fill={activeColor}
            transform={`rotate(${Math.atan2(targetY - sourceY, targetX - sourceX) * 180 / Math.PI})`}
          />
        </g>
      )}

      {/* Label */}
      {edgeData?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 20}px)`,
              pointerEvents: 'all',
            }}
            className="bg-zinc-900/95 px-2.5 py-1 rounded-lg text-xs text-zinc-300 border border-zinc-700/60 backdrop-blur-sm shadow-lg"
          >
            {edgeData.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </g>
  );
});

ComputeEdge.displayName = 'ComputeEdge';
