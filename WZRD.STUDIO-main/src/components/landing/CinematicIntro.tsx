import { useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { ParticleField } from "./ParticleField";
import { AnimatedBackground } from "./AnimatedBackground";
import { AnimatedLogo } from "../ui/animated-logo";

interface CinematicIntroProps {
  onComplete: () => void;
}

type Phase = 'void' | 'awakening' | 'synthesis' | 'revelation' | 'complete';

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [phase, setPhase] = useState<Phase>('void');
  const [particlePhase, setParticlePhase] = useState<'void' | 'converge' | 'connect' | 'ambient'>('void');
  const [bgPhase, setBgPhase] = useState<'void' | 'awakening' | 'energized' | 'active'>('void');
  const logoControls = useAnimation();
  const scanlineControls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      // Phase 1: Void Genesis (0-1.5s)
      await new Promise(resolve => setTimeout(resolve, 100));
      setParticlePhase('converge');
      setBgPhase('awakening');
      
      // Phase 2: Neural Synthesis (1.5-3.5s)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPhase('awakening');
      setParticlePhase('connect');
      setBgPhase('energized');
      
      // Start logo animation with delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Holographic scan effect
      scanlineControls.start({
        y: ['0%', '100%'],
        opacity: [0, 1, 1, 0],
        transition: {
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1],
        }
      });

      // Phase 3: Creative Explosion (3.5-5s)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPhase('synthesis');
      setParticlePhase('ambient');
      setBgPhase('active');

      // Phase 4: Studio Readiness (5-6s)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPhase('revelation');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPhase('complete');
      
      // Fade out intro
      await new Promise(resolve => setTimeout(resolve, 500));
      onComplete();
    };

    sequence();
  }, [onComplete, logoControls, scanlineControls]);

  const containerVariants = {
    void: {
      opacity: 1,
    },
    complete: {
      opacity: 0,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      }
    }
  };

  const logoContainerVariants = {
    void: {
      scale: 0.8,
      opacity: 0,
      y: 20,
    },
    awakening: {
      scale: 0.9,
      opacity: 0.5,
      y: 10,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }
    },
    synthesis: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      }
    },
    revelation: {
      scale: 1,
      opacity: 1,
      y: 0,
    }
  };

  const taglineVariants = {
    void: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    revelation: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        delay: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }
    }
  };

  const pulseVariants = {
    void: {
      scale: 1,
      opacity: 0,
    },
    awakening: {
      scale: [1, 1.5, 2],
      opacity: [0.5, 0.3, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeOut",
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {phase !== 'complete' && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          variants={containerVariants}
          initial="void"
          animate="void"
          exit={{ opacity: 0 }}
        >
          {/* Animated Background */}
          <AnimatedBackground phase={bgPhase} />

          {/* Particle Field */}
          <ParticleField phase={particlePhase} particleCount={100} />

          {/* Logo Container */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-8"
            variants={logoContainerVariants}
            initial="void"
            animate={phase}
          >
            {/* Energy Pulses behind logo */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              variants={pulseVariants}
              initial="void"
              animate={phase === 'awakening' || phase === 'synthesis' ? 'awakening' : 'void'}
            >
              <div 
                className="w-64 h-64 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--glow-primary)) 0%, transparent 70%)',
                }}
              />
            </motion.div>

            {/* Holographic Scanline */}
            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              animate={scanlineControls}
            >
              <div 
                className="absolute left-0 right-0 h-1 blur-sm"
                style={{
                  background: 'linear-gradient(to bottom, transparent, hsl(var(--glow-accent)), transparent)',
                  boxShadow: '0 0 20px hsl(var(--glow-accent))',
                }}
              />
            </motion.div>

            {/* Logo */}
            <div className="relative">
              <AnimatedLogo 
                size="lg" 
                showVersion={true}
                autoplay={phase === 'synthesis'}
                delay={0}
              />
            </div>

            {/* Tagline */}
            <motion.div
              className="text-center"
              variants={taglineVariants}
              initial="void"
              animate={phase}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white/90 tracking-wider">
                <span className="bg-gradient-to-r from-[hsl(var(--glow-primary))] via-[hsl(var(--glow-secondary))] to-[hsl(var(--glow-accent))] bg-clip-text text-transparent">
                  Digital Creativity Awakens
                </span>
              </h2>
            </motion.div>
          </motion.div>

          {/* Loading indicator */}
          {phase !== 'revelation' && (
            <motion.div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/50"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
