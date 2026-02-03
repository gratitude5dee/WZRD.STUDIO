/**
 * TravelingPulse.tsx
 * Animated orb that travels along edge path during execution
 */

import React, { memo, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TravelingPulseProps {
  path: string;
  progress: number; // 0-1
  color?: string;
  size?: number;
  isActive?: boolean;
}

const CONFIG = {
  defaultColor: '#00D4FF',
  defaultSize: 8,
  glowBlur: 12,
  trailLength: 0.15, // Percentage of path for trail
};

/**
 * Animated pulse that travels along an SVG path
 */
export const TravelingPulse = memo(({
  path,
  progress,
  color = CONFIG.defaultColor,
  size = CONFIG.defaultSize,
  isActive = true,
}: TravelingPulseProps) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailPositions, setTrailPositions] = useState<{ x: number; y: number; opacity: number }[]>([]);

  // Update position based on progress
  useEffect(() => {
    if (!pathRef.current || !isActive) return;

    const pathLength = pathRef.current.getTotalLength();
    const point = pathRef.current.getPointAtLength(pathLength * Math.min(progress, 1));
    setPosition({ x: point.x, y: point.y });

    // Calculate trail positions
    const trailSteps = 5;
    const trails = [];
    for (let i = 1; i <= trailSteps; i++) {
      const trailProgress = Math.max(0, progress - (CONFIG.trailLength * i / trailSteps));
      const trailPoint = pathRef.current.getPointAtLength(pathLength * trailProgress);
      trails.push({
        x: trailPoint.x,
        y: trailPoint.y,
        opacity: 1 - (i / (trailSteps + 1)),
      });
    }
    setTrailPositions(trails);
  }, [path, progress, isActive]);

  if (!isActive || progress <= 0) return null;

  const filterId = `traveling-pulse-glow-${Math.random().toString(36).substr(2, 9)}`;
  const gradientId = `traveling-pulse-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <g className="traveling-pulse">
      <defs>
        {/* Hidden path for measurement */}
        <path
          ref={pathRef}
          d={path}
          fill="none"
          stroke="none"
        />

        {/* Glow filter */}
        <filter id={filterId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={CONFIG.glowBlur / 2} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Radial gradient for orb */}
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor="white" />
          <stop offset="40%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Trail behind orb */}
      {trailPositions.map((trail, i) => (
        <circle
          key={`trail-${i}`}
          cx={trail.x}
          cy={trail.y}
          r={size * 0.6 * trail.opacity}
          fill={color}
          opacity={trail.opacity * 0.5}
          style={{
            filter: `blur(${2 + i}px)`,
          }}
        />
      ))}

      {/* Outer glow */}
      <motion.circle
        cx={position.x}
        cy={position.y}
        r={size * 2}
        fill={color}
        opacity={0.3}
        style={{
          filter: `blur(${CONFIG.glowBlur}px)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main orb */}
      <motion.circle
        cx={position.x}
        cy={position.y}
        r={size}
        fill={`url(#${gradientId})`}
        filter={`url(#${filterId})`}
        animate={{
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Core bright center */}
      <circle
        cx={position.x}
        cy={position.y}
        r={size * 0.3}
        fill="white"
        opacity={0.9}
      />
    </g>
  );
});

TravelingPulse.displayName = 'TravelingPulse';

export default TravelingPulse;
