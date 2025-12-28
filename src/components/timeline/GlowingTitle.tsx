import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowingTitleProps {
  title: string;
  className?: string;
  glowColor?: string;
}

export function GlowingTitle({
  title,
  className,
  glowColor = '#00D9FF' // Default cyan
}: GlowingTitleProps) {
  return (
    <motion.h1
      className={cn(
        'text-4xl font-bold relative',
        'animate-glow',
        className
      )}
      animate={{
        textShadow: [
          `0 0 4px ${glowColor}66, 0 0 8px ${glowColor}4D, 0 0 12px ${glowColor}33`,
          `0 0 8px ${glowColor}99, 0 0 16px ${glowColor}80, 0 0 24px ${glowColor}4D, 0 0 32px ${glowColor}33`,
          `0 0 4px ${glowColor}66, 0 0 8px ${glowColor}4D, 0 0 12px ${glowColor}33`
        ]
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {title}

      {/* Additional glow layer for depth */}
      <span
        className="absolute inset-0 blur-md opacity-40 -z-10"
        style={{
          color: glowColor,
          textShadow: `0 0 20px ${glowColor}`
        }}
      >
        {title}
      </span>
    </motion.h1>
  );
}
