/**
 * GridSnapIndicator.tsx
 * Crosshair indicator for grid snapping visual feedback
 */

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GridSnapIndicatorProps {
  x: number;
  y: number;
  isActive: boolean;
  size?: number;
  color?: string;
}

const CONFIG = {
  lineLength: 12,
  lineWidth: 1.5,
  dotRadius: 3,
  color: '#00D4FF',
  glowColor: 'rgba(0, 212, 255, 0.6)',
};

/**
 * Crosshair indicator that appears when connection snaps to grid
 */
export const GridSnapIndicator = memo(({
  x,
  y,
  isActive,
  size = CONFIG.lineLength,
  color = CONFIG.color,
}: GridSnapIndicatorProps) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.g
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {/* Horizontal line */}
          <motion.line
            x1={x - size}
            y1={y}
            x2={x + size}
            y2={y}
            stroke={color}
            strokeWidth={CONFIG.lineWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              filter: `drop-shadow(0 0 4px ${CONFIG.glowColor})`,
            }}
          />

          {/* Vertical line */}
          <motion.line
            x1={x}
            y1={y - size}
            x2={x}
            y2={y + size}
            stroke={color}
            strokeWidth={CONFIG.lineWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              filter: `drop-shadow(0 0 4px ${CONFIG.glowColor})`,
            }}
          />

          {/* Center dot with pulse */}
          <motion.circle
            cx={x}
            cy={y}
            r={CONFIG.dotRadius}
            fill={color}
            initial={{ scale: 0 }}
            animate={{ 
              scale: [1, 1.3, 1],
            }}
            transition={{ 
              scale: {
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            style={{
              filter: `drop-shadow(0 0 6px ${CONFIG.glowColor})`,
            }}
          />

          {/* Outer glow ring */}
          <motion.circle
            cx={x}
            cy={y}
            r={size * 0.8}
            fill="none"
            stroke={CONFIG.glowColor}
            strokeWidth={1}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [0.8, 1, 0.8],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.g>
      )}
    </AnimatePresence>
  );
});

GridSnapIndicator.displayName = 'GridSnapIndicator';

export default GridSnapIndicator;
