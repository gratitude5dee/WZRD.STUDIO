import React from 'react';
import { motion } from 'framer-motion';
import { EdgeStatus } from '@/types/computeFlow';

interface EnhancedEdgeProps {
  id: string;
  path: string;
  status: EdgeStatus;
  isSelected: boolean;
  onSelect: () => void;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
}

export const EnhancedEdge: React.FC<EnhancedEdgeProps> = ({
  id,
  path,
  status,
  isSelected,
  onSelect,
  sourcePosition,
  targetPosition
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return { stroke: '#3b82f6', glow: 'rgba(59, 130, 246, 0.6)' };
      case 'succeeded':
        return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' };
      case 'error':
        return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)' };
      default:
        return { stroke: '#52525b', glow: 'rgba(82, 82, 91, 0.4)' };
    }
  };

  const colors = getStatusColor();
  const isActive = status === 'running';

  return (
    <g>
      {/* Gradient Definition */}
      <defs>
        <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.8" />
          <stop offset="50%" stopColor={colors.stroke} stopOpacity="1" />
          <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.8" />
        </linearGradient>
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Glow Layer */}
      <path
        d={path}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={isSelected ? 8 : 6}
        opacity={0.3}
        filter={`url(#glow-${id})`}
        pointerEvents="none"
      />

      {/* Main Path */}
      <path
        d={path}
        fill="none"
        stroke={isSelected ? colors.stroke : `url(#gradient-${id})`}
        strokeWidth={isSelected ? 3 : 2}
        strokeLinecap="round"
        strokeDasharray={status === 'running' ? '10 5' : 'none'}
        className="cursor-pointer transition-all duration-300"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as SVGPathElement).style.strokeWidth = '4';
          (e.currentTarget as SVGPathElement).style.filter = `drop-shadow(0 0 8px ${colors.glow})`;
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            (e.currentTarget as SVGPathElement).style.strokeWidth = '2';
            (e.currentTarget as SVGPathElement).style.filter = 'none';
          }
        }}
      >
        {/* Running Animation */}
        {isActive && (
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="15"
            dur="0.5s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Connection Dots at Endpoints */}
      <circle
        cx={sourcePosition.x}
        cy={sourcePosition.y}
        r={4}
        fill={colors.stroke}
        className="transition-all duration-300"
        opacity={0.8}
      />
      <circle
        cx={targetPosition.x}
        cy={targetPosition.y}
        r={4}
        fill={colors.stroke}
        className="transition-all duration-300"
        opacity={0.8}
      />

      {/* Animated Flow Particles - only when running */}
      {isActive && (
        <>
          {/* Primary particle */}
          <motion.circle
            r={3}
            fill={colors.stroke}
            opacity={0.9}
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={path}
            />
          </motion.circle>

          {/* Secondary particle with offset */}
          <motion.circle
            r={2}
            fill={colors.stroke}
            opacity={0.6}
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={path}
              begin="0.5s"
            />
          </motion.circle>

          {/* Tertiary particle */}
          <motion.circle
            r={2}
            fill={colors.stroke}
            opacity={0.4}
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={path}
              begin="1s"
            />
          </motion.circle>
        </>
      )}

      {/* Directional Arrow */}
      {!isActive && (
        <g opacity={0.6}>
          <defs>
            <marker
              id={`arrowhead-${id}`}
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3, 0 6"
                fill={colors.stroke}
              />
            </marker>
          </defs>
          <path
            d={path}
            fill="none"
            stroke="transparent"
            strokeWidth="2"
            markerEnd={`url(#arrowhead-${id})`}
          />
        </g>
      )}

      {/* Success Flash Effect */}
      {status === 'succeeded' && (
        <motion.path
          d={path}
          fill="none"
          stroke="#10b981"
          strokeWidth="4"
          opacity={1}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      )}
    </g>
  );
};
