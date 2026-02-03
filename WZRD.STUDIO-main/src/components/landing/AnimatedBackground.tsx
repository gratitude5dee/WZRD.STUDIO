import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  phase: 'void' | 'awakening' | 'energized' | 'active';
}

export function AnimatedBackground({ phase }: AnimatedBackgroundProps) {
  const gradientVariants = {
    void: {
      background: 'radial-gradient(circle at 50% 50%, hsl(220 25% 6%) 0%, hsl(220 25% 4%) 100%)',
    },
    awakening: {
      background: [
        'radial-gradient(circle at 50% 50%, hsl(220 25% 6%) 0%, hsl(220 25% 4%) 100%)',
        'radial-gradient(circle at 50% 40%, hsl(230 50% 15%) 0%, hsl(220 25% 4%) 50%, hsl(220 25% 6%) 100%)',
      ],
      transition: {
        duration: 1.5,
        ease: [0.22, 1, 0.36, 1],
      }
    },
    energized: {
      background: [
        'radial-gradient(circle at 50% 40%, hsl(230 50% 15%) 0%, hsl(220 25% 4%) 50%, hsl(220 25% 6%) 100%)',
        'radial-gradient(ellipse at 50% 30%, hsl(200 85% 25%) 0%, hsl(270 60% 20%) 30%, hsl(220 25% 6%) 60%, hsl(220 25% 4%) 100%)',
      ],
      transition: {
        duration: 2,
        ease: [0.22, 1, 0.36, 1],
      }
    },
    active: {
      background: [
        'radial-gradient(ellipse at 50% 30%, hsl(200 85% 25%) 0%, hsl(270 60% 20%) 30%, hsl(220 25% 6%) 60%, hsl(220 25% 4%) 100%)',
        'radial-gradient(ellipse at 50% 30%, hsl(200 85% 20%) 0%, hsl(270 60% 18%) 30%, hsl(220 25% 6%) 60%, hsl(220 25% 4%) 100%)',
        'radial-gradient(ellipse at 50% 30%, hsl(200 85% 25%) 0%, hsl(270 60% 20%) 30%, hsl(220 25% 6%) 60%, hsl(220 25% 4%) 100%)',
      ],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  const meshVariants = {
    void: {
      opacity: 0,
    },
    awakening: {
      opacity: 0.03,
      transition: {
        duration: 1,
        delay: 0.5,
      }
    },
    energized: {
      opacity: 0.05,
      transition: {
        duration: 1,
      }
    },
    active: {
      opacity: [0.05, 0.08, 0.05],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  const glowOrbVariants = {
    void: {
      scale: 0,
      opacity: 0,
    },
    awakening: {
      scale: 0.5,
      opacity: 0.1,
      transition: {
        duration: 1.5,
        ease: [0.22, 1, 0.36, 1],
      }
    },
    energized: {
      scale: 1,
      opacity: 0.15,
      transition: {
        duration: 1.5,
        ease: [0.22, 1, 0.36, 1],
      }
    },
    active: {
      scale: [1, 1.1, 1],
      opacity: [0.15, 0.2, 0.15],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main gradient background */}
      <motion.div
        className="absolute inset-0"
        variants={gradientVariants}
        initial="void"
        animate={phase}
      />

      {/* Glow orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, hsl(var(--glow-primary)) 0%, transparent 70%)',
        }}
        variants={glowOrbVariants}
        initial="void"
        animate={phase}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, hsl(var(--glow-secondary)) 0%, transparent 70%)',
        }}
        variants={glowOrbVariants}
        initial="void"
        animate={phase}
        transition={{ delay: 0.3 }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/2 w-96 h-96 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, hsl(var(--glow-accent)) 0%, transparent 70%)',
        }}
        variants={glowOrbVariants}
        initial="void"
        animate={phase}
        transition={{ delay: 0.6 }}
      />

      {/* Mesh pattern overlay */}
      <motion.div
        className="absolute inset-0 bg-noise opacity-0"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground) / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground) / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
        variants={meshVariants}
        initial="void"
        animate={phase}
      />

      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, hsl(220 25% 4%) 100%)',
          opacity: 0.5,
        }}
      />
    </div>
  );
}
