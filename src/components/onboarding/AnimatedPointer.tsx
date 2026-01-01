'use client';

import { motion } from 'framer-motion';

interface AnimatedPointerProps {
  targetX: number;
  targetY: number;
}

export function AnimatedPointer({ targetX, targetY }: AnimatedPointerProps) {
  return (
    <>
      {/* Ripple effect at target */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: [0.5, 1.5, 2],
          opacity: [0.6, 0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut',
        }}
        style={{
          position: 'fixed',
          left: targetX,
          top: targetY,
          transform: 'translate(-50%, -50%)',
        }}
        className="w-12 h-12 rounded-full border-2 border-accent-purple pointer-events-none z-[9998]"
      />

      {/* Pulsing dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          x: targetX - 8,
          y: targetY - 8,
          scale: [1, 1.2, 1],
          opacity: 1,
        }}
        transition={{
          x: { type: 'spring', stiffness: 300, damping: 30 },
          y: { type: 'spring', stiffness: 300, damping: 30 },
          scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="fixed w-4 h-4 rounded-full bg-gradient-to-br from-accent-purple to-amber shadow-[0_0_20px_hsl(var(--accent-purple)/0.6)] pointer-events-none z-[9998]"
      />

      {/* Inner glow */}
      <motion.div
        animate={{ 
          x: targetX - 4,
          y: targetY - 4,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className="fixed w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white] pointer-events-none z-[9999]"
      />
    </>
  );
}
