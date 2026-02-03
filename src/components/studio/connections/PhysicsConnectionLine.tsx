/**
 * PhysicsConnectionLine.tsx
 * Spring-physics based connection line with glow head and elastic trail
 */

import React, { memo, useMemo, useEffect } from 'react';
import { ConnectionLineComponentProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { useSpringPhysics } from '@/hooks/studio/useSpringPhysics';
import { useGridSnapping } from '@/hooks/studio/useGridSnapping';
import { GridSnapIndicator } from '../effects/GridSnapIndicator';

interface PhysicsConnectionLineProps extends ConnectionLineComponentProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

// Visual configuration
const CONFIG = {
  headColor: '#00D4FF',
  headGlowColor: 'rgba(0, 212, 255, 0.5)',
  headRadius: 4,
  glowBlur: 12,
  trailGradientLength: 200,
  strokeWidth: 2,
};

/**
 * Calculate spring-influenced bezier path
 */
const calculateSpringPath = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  velocity: number
): string => {
  const controlOffset = velocity * 0.3;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Dynamic curvature based on distance and velocity
  const curvature = Math.min(0.5, Math.max(0.15, distance / 400));
  const controlY = (start.y + end.y) / 2 + controlOffset + (dy > 0 ? curvature * 50 : -curvature * 50);
  const controlX = (start.x + end.x) / 2;
  
  return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`;
};

/**
 * Physics-based connection line with spring behavior
 */
export const PhysicsConnectionLine = memo(({
  fromX,
  fromY,
  toX,
  toY,
}: PhysicsConnectionLineProps) => {
  // Spring physics for smooth following
  const { position, velocity, setTarget } = useSpringPhysics({
    initialPosition: { x: toX, y: toY },
    config: {
      stiffness: 180,
      damping: 18,
      mass: 0.8,
    },
  });

  // Grid snapping
  const { checkSnap } = useGridSnapping();
  const snapResult = useMemo(() => checkSnap({ x: toX, y: toY }), [checkSnap, toX, toY]);

  // Update spring target when cursor moves
  useEffect(() => {
    setTarget(snapResult.snappedPosition);
  }, [snapResult.snappedPosition, setTarget]);

  // Calculate path with spring influence
  const path = useMemo(() => {
    return calculateSpringPath(
      { x: fromX, y: fromY },
      position,
      velocity
    );
  }, [fromX, fromY, position, velocity]);

  const gradientId = `physics-connection-gradient-${fromX}-${fromY}`;
  const glowFilterId = `physics-connection-glow-${fromX}-${fromY}`;

  return (
    <g className="physics-connection-line">
      <defs>
        {/* Trail gradient */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={CONFIG.headColor} stopOpacity="0.2" />
          <stop offset="70%" stopColor={CONFIG.headColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={CONFIG.headColor} stopOpacity="1" />
        </linearGradient>

        {/* Glow filter */}
        <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={CONFIG.glowBlur / 4} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer glow layer */}
      <path
        d={path}
        fill="none"
        stroke={CONFIG.headGlowColor}
        strokeWidth={CONFIG.strokeWidth * 4}
        strokeLinecap="round"
        style={{
          opacity: 0.3,
          filter: `blur(8px)`,
        }}
      />

      {/* Main trail with gradient */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={CONFIG.strokeWidth}
        strokeLinecap="round"
        filter={`url(#${glowFilterId})`}
      />

      {/* Leading head glow */}
      <circle
        cx={position.x}
        cy={position.y}
        r={CONFIG.headRadius * 2}
        fill={CONFIG.headGlowColor}
        style={{ filter: `blur(${CONFIG.glowBlur}px)` }}
      />

      {/* Leading head solid */}
      <circle
        cx={position.x}
        cy={position.y}
        r={CONFIG.headRadius}
        fill={CONFIG.headColor}
        stroke="white"
        strokeWidth={1}
        style={{ filter: `drop-shadow(0 0 4px ${CONFIG.headColor})` }}
      />

      {/* Grid snap indicator */}
      {snapResult.isSnapped && snapResult.gridPoint && (
        <GridSnapIndicator 
          x={snapResult.gridPoint.x} 
          y={snapResult.gridPoint.y} 
          isActive={true} 
        />
      )}
    </g>
  );
});

PhysicsConnectionLine.displayName = 'PhysicsConnectionLine';

export default PhysicsConnectionLine;
