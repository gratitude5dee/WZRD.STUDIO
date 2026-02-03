/**
 * PhysicsHandle.tsx
 * Enhanced connection handle with data-type coloring and physics-inspired animations
 */

import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DataType } from '@/types/computeFlow';

interface PhysicsHandleProps {
  id: string;
  type: 'source' | 'target';
  position: Position;
  dataType?: DataType;
  isConnectable?: boolean;
  className?: string;
}

// Data-type specific colors
const HANDLE_TYPE_COLORS: Record<string, { ring: string; fill: string; glow: string }> = {
  image: { ring: '#E879F9', fill: '#E879F9', glow: 'rgba(232, 121, 249, 0.6)' },
  video: { ring: '#F472B6', fill: '#F472B6', glow: 'rgba(244, 114, 182, 0.6)' },
  text: { ring: '#60A5FA', fill: '#60A5FA', glow: 'rgba(96, 165, 250, 0.6)' },
  audio: { ring: '#34D399', fill: '#34D399', glow: 'rgba(52, 211, 153, 0.6)' },
  tensor: { ring: '#F59E0B', fill: '#F59E0B', glow: 'rgba(245, 158, 11, 0.6)' },
  json: { ring: '#6366F1', fill: '#6366F1', glow: 'rgba(99, 102, 241, 0.6)' },
  any: { ring: '#A78BFA', fill: '#A78BFA', glow: 'rgba(167, 139, 250, 0.6)' },
};

const CONFIG = {
  outerSize: 12,
  innerSize: 4,
  borderWidth: 2,
  hoverScale: 1.3,
  connectingScale: 1.5,
  glowBlur: 12,
};

/**
 * Physics-inspired handle with smooth hover/connecting animations
 */
export const PhysicsHandle = memo(({
  id,
  type,
  position,
  dataType = 'any',
  isConnectable = true,
  className,
}: PhysicsHandleProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const colors = HANDLE_TYPE_COLORS[dataType] || HANDLE_TYPE_COLORS.any;

  const scale = isConnecting ? CONFIG.connectingScale : isHovered ? CONFIG.hoverScale : 1;
  const glowOpacity = isConnecting ? 1 : isHovered ? 0.8 : 0;

  return (
    <Handle
      id={id}
      type={type}
      position={position}
      isConnectable={isConnectable}
      className={cn(
        'group !w-0 !h-0 !border-0 !bg-transparent',
        className
      )}
      style={{
        // Position adjustment based on handle position
        ...(position === Position.Left && { left: -6 }),
        ...(position === Position.Right && { right: -6, left: 'auto' }),
        ...(position === Position.Top && { top: -6 }),
        ...(position === Position.Bottom && { bottom: -6, top: 'auto' }),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsConnecting(false);
      }}
      onMouseDown={() => setIsConnecting(true)}
      onMouseUp={() => setIsConnecting(false)}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="relative flex items-center justify-center"
          animate={{ scale }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: CONFIG.outerSize + 8,
              height: CONFIG.outerSize + 8,
              backgroundColor: colors.glow,
              filter: `blur(${CONFIG.glowBlur}px)`,
            }}
            animate={{ opacity: glowOpacity }}
            transition={{ duration: 0.2 }}
          />

          {/* Outer ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: CONFIG.outerSize,
              height: CONFIG.outerSize,
              border: `${CONFIG.borderWidth}px solid ${colors.ring}`,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
            animate={{
              borderColor: isConnecting ? 'white' : colors.ring,
            }}
            transition={{ duration: 0.15 }}
          />

          {/* Inner dot */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: CONFIG.innerSize,
              height: CONFIG.innerSize,
              backgroundColor: colors.fill,
            }}
            animate={{
              backgroundColor: isConnecting ? 'white' : colors.fill,
              scale: isConnecting ? 1.2 : 1,
            }}
            transition={{ duration: 0.15 }}
          />

          {/* Pulse animation when connecting */}
          {isConnecting && (
            <motion.div
              className="absolute rounded-full"
              style={{
                width: CONFIG.outerSize + 4,
                height: CONFIG.outerSize + 4,
                border: `1px solid ${colors.ring}`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>
      </div>
    </Handle>
  );
});

PhysicsHandle.displayName = 'PhysicsHandle';

export default PhysicsHandle;
