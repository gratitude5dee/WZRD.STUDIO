import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import { CyberGrid } from '@/components/effects/CyberGrid';
import { Scanlines } from '@/components/effects/Scanlines';
import { FloatingParticles } from '@/components/effects/FloatingParticles';
import { CornerFrames } from '@/components/effects/CornerFrames';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { AnimatedLogo } from '@/components/ui/animated-logo';

export const CyberpunkHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated Grid Background */}
      <CyberGrid />
      
      {/* Video Layer */}
      <div className="absolute inset-0 opacity-20">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover mix-blend-screen"
        >
          <source src="/wzrdstudiointro1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container h-screen flex items-center pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          {/* Left: Main CTA */}
          <motion.div 
            className="col-span-1 lg:col-span-7 space-y-8"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            {/* Badge */}
            <motion.div
              className="inline-block px-4 py-2 border border-cyan-400/50 rounded-full font-body text-sm text-cyan-400 bg-cyan-400/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-cyan-400">▸</span> AI-POWERED WORKFLOW STUDIO
            </motion.div>
            
            {/* Hero Title */}
            <h1 className="font-display text-7xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tight">
              <span className="block text-white drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]">
                WZRD
              </span>
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-500 to-magenta-500 bg-clip-text text-transparent">
                FLOW
              </span>
            </h1>
            
            {/* Subtitle */}
            <motion.p
              className="font-body text-xl md:text-2xl text-cyan-300/80 tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="text-cyan-400">{'>'}</span> CREATE_TRANSFORM_DOMINATE
            </motion.p>
            
            {/* CTAs */}
            <motion.div 
              className="flex gap-6 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <MagneticButton 
                variant="primary"
                onClick={() => navigate('/home')}
              >
                <Zap className="w-5 h-5" />
                ENTER THE MATRIX
              </MagneticButton>
              
              <MagneticButton 
                variant="ghost"
                onClick={() => navigate('/login')}
              >
                ACCESS SYSTEM
                <ArrowRight className="w-5 h-5" />
              </MagneticButton>
            </motion.div>
            
            {/* Stats */}
            <motion.div
              className="flex gap-8 pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {[
                { value: '50K+', label: 'ACTIVE_USERS' },
                { value: '1M+', label: 'GENERATIONS' },
                { value: '99.9%', label: 'UPTIME' },
              ].map((stat, i) => (
                <div key={i} className="border-l-2 border-cyan-400/50 pl-4">
                  <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
                  <div className="font-body text-xs text-cyan-400/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Right: Visual Element */}
          <motion.div 
            className="hidden lg:block col-span-5 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            <div className="relative w-full h-96">
              {/* Holographic Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-magenta-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatedLogo size="lg" showVersion={false} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Effects */}
      <Scanlines />
      <FloatingParticles count={30} />
      <CornerFrames />
    </section>
  );
};
