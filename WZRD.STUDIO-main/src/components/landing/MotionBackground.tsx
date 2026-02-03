import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MotionBackgroundProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'intense';
}

export function MotionBackground({
  className,
  intensity = 'medium',
}: MotionBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);

  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 });
  const springY2 = useSpring(y2, { stiffness: 80, damping: 25 });

  const particles = useMemo(() => {
    const count = intensity === 'intense' ? 50 : intensity === 'medium' ? 30 : 15;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
  }, [intensity]);

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
    >
      <div className="absolute inset-0 bg-black" />

      <motion.div
        className="absolute -top-[40%] left-1/2 -translate-x-1/2 w-[150%] aspect-square"
        style={{ y: springY1, opacity }}
      >
        <div className="w-full h-full rounded-full bg-gradient-radial from-purple-600/20 via-purple-900/10 to-transparent blur-3xl" />
      </motion.div>

      <motion.div
        className="absolute top-1/4 -left-[20%] w-[60%] aspect-square"
        style={{ y: springY2 }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-radial from-violet-600/15 via-purple-800/5 to-transparent blur-3xl" />
      </motion.div>

      <motion.div
        className="absolute top-1/3 -right-[20%] w-[50%] aspect-square"
        style={{ y: y3 }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-radial from-indigo-500/15 via-purple-700/5 to-transparent blur-3xl" />
      </motion.div>

      <svg
        className="absolute bottom-0 left-0 w-full h-[60%] opacity-30"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
            <stop offset="50%" stopColor="rgba(124, 58, 237, 0.2)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" />
          </linearGradient>
          <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(124, 58, 237, 0.2)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.15)" />
            <stop offset="100%" stopColor="rgba(124, 58, 237, 0.2)" />
          </linearGradient>
        </defs>

        <motion.path
          d="M0,300 C360,200 720,400 1080,300 C1260,250 1380,350 1440,300 L1440,600 L0,600 Z"
          fill="url(#wave-gradient-1)"
          animate={{
            d: [
              'M0,300 C360,200 720,400 1080,300 C1260,250 1380,350 1440,300 L1440,600 L0,600 Z',
              'M0,350 C360,250 720,350 1080,250 C1260,200 1380,300 1440,350 L1440,600 L0,600 Z',
              'M0,300 C360,200 720,400 1080,300 C1260,250 1380,350 1440,300 L1440,600 L0,600 Z',
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.path
          d="M0,400 C360,350 720,450 1080,400 C1260,380 1380,420 1440,400 L1440,600 L0,600 Z"
          fill="url(#wave-gradient-2)"
          animate={{
            d: [
              'M0,400 C360,350 720,450 1080,400 C1260,380 1380,420 1440,400 L1440,600 L0,600 Z',
              'M0,450 C360,400 720,500 1080,450 C1260,430 1380,470 1440,450 L1440,600 L0,600 Z',
              'M0,400 C360,350 720,450 1080,400 C1260,380 1380,420 1440,400 L1440,600 L0,600 Z',
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </svg>

      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-purple-400/40"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay,
          }}
        />
      ))}

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black via-black/80 to-transparent" />
    </div>
  );
}

export default MotionBackground;
