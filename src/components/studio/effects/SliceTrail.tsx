/**
 * SliceTrail.tsx
 * Velocity-based slice trail visualization for gesture detection
 */

import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Point {
  x: number;
  y: number;
  timestamp: number;
}

interface SliceTrailProps {
  trail: Point[];
  isActive: boolean;
  isHighVelocity: boolean;
}

const CONFIG = {
  normalColor: 'rgba(255, 255, 255, 0.4)',
  sliceColor: '#FF4444',
  sliceGlowColor: 'rgba(255, 68, 68, 0.6)',
  maxOpacity: 0.8,
  maxWidth: 4,
  minWidth: 1,
  glowRadius: 6,
};

/**
 * Fading trail segments that appear during fast mouse movements
 */
export const SliceTrail = memo(({ trail, isActive, isHighVelocity }: SliceTrailProps) => {
  // Generate path segments from trail
  const segments = useMemo(() => {
    if (trail.length < 2) return [];
    
    return trail.slice(0, -1).map((point, i) => {
      const nextPoint = trail[i + 1];
      const progress = i / trail.length;
      const opacity = (1 - progress) * CONFIG.maxOpacity;
      const width = CONFIG.maxWidth - (progress * (CONFIG.maxWidth - CONFIG.minWidth));
      
      return {
        id: `segment-${i}`,
        from: point,
        to: nextPoint,
        opacity,
        width,
      };
    });
  }, [trail]);

  const color = isHighVelocity ? CONFIG.sliceColor : CONFIG.normalColor;
  const glowColor = isHighVelocity ? CONFIG.sliceGlowColor : 'transparent';

  return (
    <AnimatePresence>
      {isActive && trail.length > 1 && (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 9999 }}
        >
          <defs>
            <filter id="slice-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Trail segments */}
          {segments.map((segment) => (
            <motion.line
              key={segment.id}
              x1={segment.from.x}
              y1={segment.from.y}
              x2={segment.to.x}
              y2={segment.to.y}
              stroke={color}
              strokeWidth={segment.width}
              strokeLinecap="round"
              initial={{ opacity: segment.opacity }}
              animate={{ opacity: segment.opacity }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              style={{
                filter: isHighVelocity ? 'url(#slice-glow)' : undefined,
              }}
            />
          ))}

          {/* Leading head glow (only in slice mode) */}
          {isHighVelocity && trail[0] && (
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              {/* Outer glow */}
              <motion.circle
                cx={trail[0].x}
                cy={trail[0].y}
                r={CONFIG.glowRadius * 2}
                fill={glowColor}
                style={{ filter: 'blur(8px)' }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Inner core */}
              <circle
                cx={trail[0].x}
                cy={trail[0].y}
                r={CONFIG.glowRadius}
                fill={CONFIG.sliceColor}
                style={{
                  filter: `drop-shadow(0 0 8px ${CONFIG.sliceGlowColor})`,
                }}
              />
            </motion.g>
          )}
        </svg>
      )}
    </AnimatePresence>
  );
});

SliceTrail.displayName = 'SliceTrail';

export default SliceTrail;
