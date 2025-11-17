/**
 * Bezier Connection Component
 * Renders connections between nodes with smooth cubic Bezier curves
 * Features: Type-specific colors, animated flow effects, interactive states
 */

import { memo, useState } from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';
import { motion } from 'framer-motion';
import { studioTheme, studioLayout } from '@/lib/studio/theme';
import { getConnectionColor, getConnectionStrokeWidth } from '@/lib/studio/connection-manager';

export type EdgeStatus = 'idle' | 'active' | 'success' | 'error';

export interface BezierConnectionData {
  status?: EdgeStatus;
  label?: string;
  dataType?: 'text' | 'image' | 'video' | 'data';
}

export const BezierConnection = memo<EdgeProps>(({
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
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const edgeData = data as BezierConnectionData | undefined;
  
  const status = edgeData?.status || 'idle';
  const dataType = edgeData?.dataType || 'data';
  
  // Calculate Bezier path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: studioLayout.connection.curveStrength,
  });
  
  // Get color based on data type
  const color = getConnectionColor(dataType);
  
  // Get stroke width based on state
  const strokeWidth = getConnectionStrokeWidth(
    selected || false,
    isHovered,
    status
  );
  
  // Determine if connection should be animated
  const isAnimated = status === 'active' || selected;
  
  // Get glow color with opacity
  const glowColor = selected 
    ? `${studioTheme.accent.purple}66`
    : status === 'success'
    ? `${studioTheme.accent.primary}66`
    : status === 'error'
    ? `${studioTheme.accent.red}66`
    : `${color}40`;
  
  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <defs>
        {/* Glow filter */}
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Gradient for animated flow */}
        {isAnimated && (
          <linearGradient id={`flow-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
            <animate
              attributeName="x1"
              values="-100%;100%"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values="0%;200%"
              dur="2s"
              repeatCount="indefinite"
            />
          </linearGradient>
        )}
      </defs>
      
      {/* Invisible wider path for easier clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={studioLayout.connection.strokeWidth * 6}
        className="cursor-pointer"
        style={{ pointerEvents: 'stroke' }}
      />
      
      {/* Glow layer */}
      <path
        id={`${id}-glow`}
        d={edgePath}
        fill="none"
        stroke={glowColor}
        strokeWidth={strokeWidth * 3}
        strokeOpacity={0.3}
        style={{ filter: 'blur(6px)' }}
        className={`pointer-events-none transition-all duration-300 ${
          selected || isHovered ? 'opacity-100' : 'opacity-60'
        }`}
      />
      
      {/* Main connection path */}
      <path
        id={String(id)}
        d={edgePath}
        fill="none"
        stroke={selected ? studioTheme.accent.purple : status === 'error' ? studioTheme.accent.red : color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={status === 'active' ? '8 4' : undefined}
        className={`transition-all duration-300 ${
          status === 'active' ? 'animate-[studio-flow_2s_linear_infinite]' : ''
        }`}
        style={{
          filter: selected ? `url(#glow-${String(id)})` : 'none',
        }}
        markerEnd={markerEnd}
      />
      
      {/* Animated flow particles for active connections */}
      {isAnimated && (
        <>
          {/* Primary particle */}
          <motion.circle
            r={4}
            fill={selected ? studioTheme.accent.purple : color}
            initial={{ offsetDistance: '0%', opacity: 0 }}
            animate={{ 
              offsetDistance: '100%',
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={edgePath}
            />
          </motion.circle>
          
          {/* Secondary particle (delayed) */}
          <motion.circle
            r={3}
            fill={selected ? studioTheme.accent.purple : color}
            opacity={0.6}
            initial={{ offsetDistance: '0%', opacity: 0 }}
            animate={{ 
              offsetDistance: '100%',
              opacity: [0, 0.6, 0.6, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.5,
            }}
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={edgePath}
            />
          </motion.circle>
        </>
      )}
      
      {/* Success flash effect */}
      {status === 'success' && (
        <motion.circle
          cx={labelX}
          cy={labelY}
          r={8}
          fill={studioTheme.accent.primary}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 3 }}
          transition={{ duration: 0.8 }}
        />
      )}
      
      {/* Connection endpoint dots */}
      <circle
        cx={sourceX}
        cy={sourceY}
        r={strokeWidth + 1}
        fill={selected ? studioTheme.accent.purple : color}
        className="transition-all duration-300"
        opacity={0.8}
      />
      <circle
        cx={targetX}
        cy={targetY}
        r={strokeWidth + 1}
        fill={selected ? studioTheme.accent.purple : color}
        className="transition-all duration-300"
        opacity={0.8}
      />
      
      {/* Label (if provided) */}
      {edgeData?.label && (isHovered || selected) && (
        <g>
          <foreignObject
            x={labelX - 50}
            y={labelY - 12}
            width={100}
            height={24}
            className="pointer-events-none"
          >
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`px-2 py-1 text-[10px] font-medium rounded-md backdrop-blur-sm
                  ${selected 
                    ? 'bg-zinc-900/90 border border-purple-500/50 text-purple-300 shadow-lg shadow-purple-500/20' 
                    : 'bg-zinc-900/90 border border-zinc-700/50 text-zinc-300'
                  }`}
              >
                {edgeData.label}
              </motion.div>
            </div>
          </foreignObject>
        </g>
      )}
    </g>
  );
});

BezierConnection.displayName = 'BezierConnection';
