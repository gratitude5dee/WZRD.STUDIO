import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TextAnimate } from '@/components/ui/text-animate';

interface GlowingTitleProps {
  title: string;
  className?: string;
  glowColor?: string;
  animate?: boolean;
}

export function GlowingTitle({
  title,
  className,
  glowColor = '#00D9FF',
  animate = true
}: GlowingTitleProps) {
  return (
    <motion.div
      className={cn('relative', className)}
      animate={animate ? {
        filter: [
          `drop-shadow(0 0 4px ${glowColor}66)`,
          `drop-shadow(0 0 12px ${glowColor}80)`,
          `drop-shadow(0 0 4px ${glowColor}66)`
        ]
      } : undefined}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      <TextAnimate 
        animation="blurInUp" 
        by="character"
        className="text-4xl font-bold"
        style={{
          textShadow: `0 0 8px ${glowColor}99, 0 0 16px ${glowColor}80`
        }}
      >
        {title}
      </TextAnimate>

      {/* Additional glow layer for depth */}
      <span
        className="absolute inset-0 blur-md opacity-40 -z-10 text-4xl font-bold"
        style={{
          color: glowColor,
          textShadow: `0 0 20px ${glowColor}`
        }}
        aria-hidden
      >
        {title}
      </span>
    </motion.div>
  );
}
