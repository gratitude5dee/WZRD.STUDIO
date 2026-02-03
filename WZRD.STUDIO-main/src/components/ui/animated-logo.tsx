import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedLogoProps {
  className?: string;
  showVersion?: boolean;
  size?: "sm" | "md" | "lg";
  autoplay?: boolean;
  delay?: number;
}

export function AnimatedLogo({ 
  className, 
  showVersion = true, 
  size = "md", 
  autoplay = true,
  delay = 0 
}: AnimatedLogoProps) {
  const [animationStage, setAnimationStage] = useState<'idle' | 'particles' | 'materialization' | 'complete'>('idle');
  const logoControls = useAnimation();
  const badgeControls = useAnimation();
  
  const sizeClasses = {
    sm: "h-6",
    md: "h-8", 
    lg: "h-12",
  };

  const particleCount = 8;
  const particles = Array.from({ length: particleCount }, (_, i) => i);

  useEffect(() => {
    if (!autoplay) return;

    const startAnimation = async () => {
      // Wait for delay
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Stage 1: Particle Formation
      setAnimationStage('particles');
      
      // Stage 2: Digital Materialization
      setTimeout(() => {
        setAnimationStage('materialization');
        logoControls.start({
          opacity: [0, 0.3, 1],
          scale: [0.8, 1.05, 1],
          filter: [
            'blur(8px) brightness(0.5)',
            'blur(2px) brightness(1.2)', 
            'blur(0px) brightness(1)'
          ],
          transition: {
            duration: 1.2,
            times: [0, 0.6, 1],
            ease: "easeOut"
          }
        });
      }, 800);

      // Stage 3: Brand Identity Reveal
      setTimeout(() => {
        setAnimationStage('complete');
        if (showVersion) {
          badgeControls.start({
            opacity: [0, 1],
            x: [-20, 0],
            scale: [0.8, 1.1, 1],
            transition: {
              duration: 0.8,
              times: [0, 0.7, 1],
              ease: "backOut"
            }
          });
        }
      }, 1600);
    };

    startAnimation();
  }, [autoplay, delay, logoControls, badgeControls, showVersion]);

  // Particle animation variants
  const particleVariants = {
    hidden: { 
      opacity: 0,
      scale: 0,
      x: 0,
      y: 0
    },
    forming: (i: number) => ({
      opacity: [0, 1, 0.8],
      scale: [0, 1.5, 1],
      x: [
        Math.cos((i / particleCount) * Math.PI * 2) * 60,
        Math.cos((i / particleCount) * Math.PI * 2) * 20,
        0
      ],
      y: [
        Math.sin((i / particleCount) * Math.PI * 2) * 60,
        Math.sin((i / particleCount) * Math.PI * 2) * 20,
        0
      ],
      transition: {
        duration: 0.8,
        times: [0, 0.6, 1],
        ease: "easeOut",
        delay: i * 0.08
      }
    }),
    dispersed: {
      opacity: 0,
      scale: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  // Logo glow animation for materialization
  const glowVariants = {
    idle: {
      boxShadow: '0 0 0 rgba(124, 58, 237, 0)',
    },
    materializing: {
      boxShadow: [
        '0 0 20px rgba(124, 58, 237, 0.3)',
        '0 0 40px rgba(124, 58, 237, 0.6)', 
        '0 0 20px rgba(124, 58, 237, 0.3)'
      ],
      transition: {
        duration: 1.2,
        times: [0, 0.5, 1],
        repeat: 1
      }
    },
    complete: {
      boxShadow: '0 0 8px rgba(124, 58, 237, 0.2)',
    }
  };

  return (
    <div className={cn("flex items-center gap-2 relative", className)}>
      {/* Particle System */}
      <div className="absolute inset-0 flex items-center justify-start">
        <AnimatePresence>
          {animationStage === 'particles' && particles.map((i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="forming" 
              exit="dispersed"
              variants={particleVariants}
              className="absolute w-1 h-1 bg-gradient-to-r from-refined-rich to-refined-pink rounded-full"
              style={{
                left: size === 'lg' ? '24px' : size === 'md' ? '16px' : '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Main Logo */}
      <motion.div
        className="relative"
        variants={glowVariants}
        animate={
          animationStage === 'materialization' ? 'materializing' : 
          animationStage === 'complete' ? 'complete' : 'idle'
        }
      >
        <motion.img
          src="/lovable-uploads/wzrdtechlogo.png"
          alt="WZRD.TECH Logo"
          className={cn("object-contain", sizeClasses[size])}
          initial={{ opacity: 0 }}
          animate={logoControls}
          whileHover={{
            scale: 1.05,
            filter: 'brightness(1.1)',
            transition: { duration: 0.2 }
          }}
        />
        
        {/* Scanning effect overlay during materialization */}
        <AnimatePresence>
          {animationStage === 'materialization' && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-refined-rich/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1,
                ease: "easeInOut",
                repeat: 1
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Alpha Badge */}
      {showVersion && (
        <motion.span
          initial={{ opacity: 0, x: -20, scale: 0.8 }}
          animate={badgeControls}
          className="text-xs text-white/50 bg-surface-dark px-2 py-0.5 rounded relative overflow-hidden"
          whileHover={{
            scale: 1.05,
            backgroundColor: 'hsl(var(--refined-rich) / 0.2)',
            transition: { duration: 0.2 }
          }}
        >
          {/* Glitch effect on hover */}
          <motion.span
            className="relative z-10"
            whileHover={{
              textShadow: '2px 0 rgba(244, 114, 182, 0.8), -2px 0 rgba(124, 58, 237, 0.8)'
            }}
          >
            ALPHA
          </motion.span>
          
          {/* Background pulse */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-refined-rich/20 to-refined-pink/20"
            animate={animationStage === 'complete' ? {
              opacity: [0, 0.3, 0],
              scale: [1, 1.05, 1]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 2
            }}
          />
        </motion.span>
      )}
      
      {/* Breathing animation for complete state */}
      <AnimatePresence>
        {animationStage === 'complete' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.1, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-refined-rich/20 via-refined-pink/20 to-refined-lavender/20 rounded-lg blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}