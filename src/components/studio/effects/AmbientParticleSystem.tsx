/**
 * AmbientParticleSystem.tsx
 * Slow-drifting ambient particles for canvas atmosphere
 */

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: string;
  initialX: number;
  initialY: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

interface AmbientParticleSystemProps {
  particleCount?: number;
  className?: string;
}

/**
 * Generate random particles with varied properties
 */
const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `particle-${i}`,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    size: 1 + Math.random() * 2, // 1-3px
    opacity: 0.1 + Math.random() * 0.2, // 0.1-0.3
    duration: 20 + Math.random() * 40, // 20-60s for very slow drift
    delay: Math.random() * 10, // Staggered start
    driftX: (Math.random() - 0.5) * 30, // -15% to +15% horizontal drift
    driftY: (Math.random() - 0.5) * 20, // -10% to +10% vertical drift
  }));
};

/**
 * Single floating particle with slow drift animation
 */
const FloatingParticle = memo(({ particle }: { particle: Particle }) => {
  return (
    <motion.div
      className="absolute rounded-full bg-white pointer-events-none"
      style={{
        left: `${particle.initialX}%`,
        top: `${particle.initialY}%`,
        width: particle.size,
        height: particle.size,
        willChange: 'transform, opacity',
      }}
      initial={{
        opacity: 0,
        x: 0,
        y: 0,
      }}
      animate={{
        opacity: [0, particle.opacity, particle.opacity, 0],
        x: [0, particle.driftX * 10, particle.driftX * 20, particle.driftX * 30],
        y: [0, particle.driftY * 10, particle.driftY * 20, particle.driftY * 30],
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'linear',
        times: [0, 0.1, 0.9, 1],
      }}
    />
  );
});

FloatingParticle.displayName = 'FloatingParticle';

/**
 * Ambient particle system that renders slow-drifting particles
 * for atmospheric effect on the canvas
 */
export const AmbientParticleSystem = memo(({ 
  particleCount = 25,
  className 
}: AmbientParticleSystemProps) => {
  // Generate particles once
  const particles = useMemo(() => generateParticles(particleCount), [particleCount]);

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className || ''}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <FloatingParticle key={particle.id} particle={particle} />
      ))}
    </div>
  );
});

AmbientParticleSystem.displayName = 'AmbientParticleSystem';

export default AmbientParticleSystem;
