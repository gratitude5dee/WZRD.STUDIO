/**
 * SliceEffect.tsx
 * Particle dispersion animation for edge slice interactions
 */

import React, { memo, useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SliceEffectProps {
  x: number;
  y: number;
  isActive: boolean;
  onComplete?: () => void;
}

interface Particle {
  id: string;
  angle: number;
  velocity: number;
  size: number;
  life: number;
  color: string;
}

const CONFIG = {
  particleCount: 12,
  baseVelocity: 100,
  velocityVariance: 50,
  baseSize: 2,
  sizeVariance: 3,
  baseLife: 0.5,
  lifeVariance: 0.3,
  colors: ['#FF4444', '#FF6666', '#FF8888', '#FFAAAA'],
  flashDuration: 0.15,
};

/**
 * Generate particles with random properties
 */
const generateParticles = (): Particle[] => {
  return Array.from({ length: CONFIG.particleCount }, (_, i) => ({
    id: `particle-${i}`,
    angle: (i / CONFIG.particleCount) * Math.PI * 2,
    velocity: CONFIG.baseVelocity + Math.random() * CONFIG.velocityVariance,
    size: CONFIG.baseSize + Math.random() * CONFIG.sizeVariance,
    life: CONFIG.baseLife + Math.random() * CONFIG.lifeVariance,
    color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
  }));
};

/**
 * Single particle with radial motion
 */
const SliceParticle = memo(({ 
  particle, 
  originX, 
  originY 
}: { 
  particle: Particle; 
  originX: number; 
  originY: number;
}) => {
  const endX = Math.cos(particle.angle) * particle.velocity;
  const endY = Math.sin(particle.angle) * particle.velocity;

  return (
    <motion.circle
      cx={originX}
      cy={originY}
      r={particle.size}
      fill={particle.color}
      initial={{ 
        opacity: 1, 
        scale: 1,
      }}
      animate={{ 
        opacity: [1, 0.8, 0],
        scale: [1, 0.8, 0.3],
        cx: originX + endX,
        cy: originY + endY,
      }}
      transition={{
        duration: particle.life,
        ease: 'easeOut',
      }}
      style={{
        filter: `drop-shadow(0 0 3px ${particle.color})`,
      }}
    />
  );
});

SliceParticle.displayName = 'SliceParticle';

/**
 * Flash effect at cut point
 */
const FlashEffect = memo(({ x, y }: { x: number; y: number }) => (
  <motion.circle
    cx={x}
    cy={y}
    r={4}
    fill="white"
    initial={{ opacity: 1, scale: 1, r: 4 }}
    animate={{ 
      opacity: [1, 0],
      scale: [1, 3],
      r: [4, 24],
    }}
    transition={{ 
      duration: CONFIG.flashDuration,
      ease: 'easeOut',
    }}
    style={{
      filter: 'blur(2px)',
    }}
  />
));

FlashEffect.displayName = 'FlashEffect';

/**
 * Complete slice effect with particles and flash
 */
export const SliceEffect = memo(({ x, y, isActive, onComplete }: SliceEffectProps) => {
  const [showEffect, setShowEffect] = useState(false);
  const particles = useMemo(() => generateParticles(), []);

  // Trigger effect when isActive becomes true
  useEffect(() => {
    if (isActive) {
      setShowEffect(true);
      
      // Auto-cleanup after longest particle life
      const maxLife = Math.max(...particles.map(p => p.life)) * 1000 + 100;
      const timer = setTimeout(() => {
        setShowEffect(false);
        onComplete?.();
      }, maxLife);

      return () => clearTimeout(timer);
    }
  }, [isActive, particles, onComplete]);

  return (
    <AnimatePresence>
      {showEffect && (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 9999 }}
        >
          <defs>
            <filter id="slice-particle-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Flash at cut point */}
          <FlashEffect x={x} y={y} />

          {/* Radial particles */}
          <g filter="url(#slice-particle-glow)">
            {particles.map((particle) => (
              <SliceParticle
                key={particle.id}
                particle={particle}
                originX={x}
                originY={y}
              />
            ))}
          </g>

          {/* Core flash */}
          <motion.circle
            cx={x}
            cy={y}
            r={6}
            fill="#FF4444"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: [1, 0],
              scale: [1, 0.5],
            }}
            transition={{ 
              duration: 0.3,
              ease: 'easeOut',
            }}
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255, 68, 68, 0.8))',
            }}
          />
        </svg>
      )}
    </AnimatePresence>
  );
});

SliceEffect.displayName = 'SliceEffect';

export default SliceEffect;
