'use client';

import { motion } from 'framer-motion';

interface SpotlightOverlayProps {
  targetRect: DOMRect | null;
  padding?: number;
}

export function SpotlightOverlay({ targetRect, padding = 8 }: SpotlightOverlayProps) {
  if (!targetRect) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />
    );
  }

  const { left, top, width, height } = targetRect;
  const spotlightX = left - padding;
  const spotlightY = top - padding;
  const spotlightWidth = width + padding * 2;
  const spotlightHeight = height + padding * 2;
  const borderRadius = 16;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <mask id="spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{
              x: spotlightX,
              y: spotlightY,
              width: spotlightWidth,
              height: spotlightHeight,
              opacity: 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            rx={borderRadius}
            ry={borderRadius}
            fill="black"
          />
        </mask>

        {/* Glow effect */}
        <filter id="spotlight-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background overlay with mask */}
      <rect
        width="100%"
        height="100%"
        fill="rgba(0, 0, 0, 0.7)"
        mask="url(#spotlight-mask)"
        className="backdrop-blur-sm"
      />

      {/* Spotlight border glow */}
      <motion.rect
        initial={{ opacity: 0 }}
        animate={{
          x: spotlightX,
          y: spotlightY,
          width: spotlightWidth,
          height: spotlightHeight,
          opacity: 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        rx={borderRadius}
        ry={borderRadius}
        fill="none"
        stroke="url(#spotlight-gradient)"
        strokeWidth="2"
        filter="url(#spotlight-glow)"
      />

      {/* Gradient for border */}
      <defs>
        <linearGradient id="spotlight-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--accent-purple))" stopOpacity="0.8" />
          <stop offset="50%" stopColor="hsl(var(--amber))" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(var(--accent-purple))" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
