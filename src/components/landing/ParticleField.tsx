import { motion } from "framer-motion";
import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

interface ParticleFieldProps {
  phase: 'void' | 'converge' | 'connect' | 'ambient';
  particleCount?: number;
}

export function ParticleField({ phase, particleCount = 80 }: ParticleFieldProps) {
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 0.5,
      duration: Math.random() * 2 + 2,
      color: i % 3 === 0 ? 'hsl(var(--glow-primary))' : i % 3 === 1 ? 'hsl(var(--glow-secondary))' : 'hsl(var(--glow-accent))',
    }));
  }, [particleCount]);

  const getParticleVariants = (particle: Particle) => {
    const centerX = 50;
    const centerY = 40;

    return {
      void: {
        x: `${particle.x}vw`,
        y: `${particle.y}vh`,
        scale: 0,
        opacity: 0,
      },
      converge: {
        x: `${particle.x}vw`,
        y: `${particle.y}vh`,
        scale: 1,
        opacity: 0.6,
        transition: {
          duration: 0.8,
          delay: particle.delay,
          ease: [0.4, 0, 0.2, 1],
        }
      },
      connect: {
        x: `${centerX + (particle.x - centerX) * 0.3}vw`,
        y: `${centerY + (particle.y - centerY) * 0.3}vh`,
        scale: 1.2,
        opacity: 0.8,
        transition: {
          duration: 1.5,
          delay: particle.delay * 0.5,
          ease: [0.22, 1, 0.36, 1],
        }
      },
      ambient: {
        x: [`${centerX + (particle.x - centerX) * 0.3}vw`, `${centerX + (particle.x - centerX) * 0.35}vw`, `${centerX + (particle.x - centerX) * 0.3}vw`],
        y: [`${centerY + (particle.y - centerY) * 0.3}vh`, `${centerY + (particle.y - centerY) * 0.35}vh`, `${centerY + (particle.y - centerY) * 0.3}vh`],
        scale: [1.2, 1.3, 1.2],
        opacity: [0.4, 0.6, 0.4],
        transition: {
          duration: particle.duration * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }
      }
    };
  };

  // Neural connections between nearby particles
  const connections = useMemo(() => {
    if (phase !== 'connect' && phase !== 'ambient') return [];
    
    const connectionList: Array<{ from: Particle; to: Particle; distance: number }> = [];
    const centerX = 50;
    const centerY = 40;
    
    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach((p2) => {
        const adjustedX1 = centerX + (p1.x - centerX) * 0.3;
        const adjustedY1 = centerY + (p1.y - centerY) * 0.3;
        const adjustedX2 = centerX + (p2.x - centerX) * 0.3;
        const adjustedY2 = centerY + (p2.y - centerY) * 0.3;
        
        const distance = Math.sqrt(
          Math.pow(adjustedX2 - adjustedX1, 2) + Math.pow(adjustedY2 - adjustedY1, 2)
        );
        
        if (distance < 15) {
          connectionList.push({ from: p1, to: p2, distance });
        }
      });
    });
    
    return connectionList.slice(0, 40); // Limit connections for performance
  }, [particles, phase]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 4}px ${particle.color}`,
          }}
          variants={getParticleVariants(particle)}
          initial="void"
          animate={phase}
        />
      ))}

      {/* Neural Connections */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((conn, i) => {
          const centerX = 50;
          const centerY = 40;
          const x1 = centerX + (conn.from.x - centerX) * 0.3;
          const y1 = centerY + (conn.from.y - centerY) * 0.3;
          const x2 = centerX + (conn.to.x - centerX) * 0.3;
          const y2 = centerY + (conn.to.y - centerY) * 0.3;
          
          return (
            <motion.line
              key={i}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="url(#connectionGradient)"
              strokeWidth="0.5"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{
                opacity: phase === 'connect' || phase === 'ambient' ? 0.3 : 0,
                pathLength: phase === 'connect' || phase === 'ambient' ? 1 : 0,
              }}
              transition={{
                duration: 1,
                delay: i * 0.02,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--glow-primary))" />
            <stop offset="50%" stopColor="hsl(var(--glow-secondary))" />
            <stop offset="100%" stopColor="hsl(var(--glow-accent))" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
