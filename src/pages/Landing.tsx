import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, ChevronDown, Sparkles, Brain, Zap, Star, Palette, Users, Trophy, Shield, Clock, TrendingUp, Music, Eye, Layers, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { CinematicIntro } from '@/components/landing/CinematicIntro';
import { MatrixLoader } from '@/components/landing/MatrixLoader';
import { ParticleField } from '@/components/landing/ParticleField';

const Landing = () => {
  const navigate = useNavigate();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState('emotional');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollRevealed, setScrollRevealed] = useState<string[]>([]);
  const [showMatrixLoader, setShowMatrixLoader] = useState(true);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = window.scrollY / totalHeight;
      setScrollProgress(progress);
    };

    // Scroll reveal observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.getAttribute('data-reveal-id');
            if (elementId) {
              setScrollRevealed(prev => [...prev, elementId]);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('[data-reveal-id]').forEach(el => observer.observe(el));
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleMatrixComplete = () => {
    setShowMatrixLoader(false);
    setShowIntro(true);
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6 } 
    }
  };

  return (
    <>
      {/* Matrix Loader */}
      {showMatrixLoader && (
        <MatrixLoader onComplete={handleMatrixComplete} />
      )}

      {/* Cinematic Intro */}
      {showIntro && (
        <CinematicIntro onComplete={() => setShowIntro(false)} />
      )}

      <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
        {/* PHASE 1: Enhanced Multi-Layer Cosmic Background */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Base cosmic void */}
          <div className="absolute inset-0 bg-black" />
          
          {/* Animated gradient meshes */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(147,51,234,0.08),transparent_40%)] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.06),transparent_40%)] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
          
          {/* Particle field layers */}
          <ParticleField phase="ambient" particleCount={120} />
          <div className="absolute inset-0 particle-field opacity-10" />
          
          {/* Floating cosmic orbs with trails */}
          <div className="absolute top-20 left-[10%] w-64 h-64 bg-cosmic-stellar/20 rounded-full blur-[120px] animate-float" />
          <div className="absolute top-[30%] right-[15%] w-96 h-96 bg-cosmic-nebula/15 rounded-full blur-[150px] animate-float" style={{ animationDelay: '2s', animationDuration: '20s' }} />
          <div className="absolute bottom-[20%] left-[20%] w-48 h-48 bg-cosmic-plasma/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '4s', animationDuration: '18s' }} />
          <div className="absolute bottom-[40%] right-[25%] w-72 h-72 bg-cosmic-quantum/12 rounded-full blur-[130px] animate-float" style={{ animationDelay: '6s', animationDuration: '22s' }} />
          
          {/* Subtle scan lines for depth */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.02)_50%)] bg-[length:100%_4px]" />
        </div>
      
      {/* PHASE 2: Premium Glassmorphic Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 backdrop-blur-2xl bg-gradient-to-b from-black/95 via-black/90 to-black/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-cosmic-stellar/5 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 py-4 relative z-10">
          <div className="flex items-center justify-between">
            {/* Logo with subtle glow */}
            <div className="flex items-center gap-3">
              <AnimatedLogo size="lg" showVersion={false} />
              <div className="hidden md:block h-6 w-px bg-gradient-to-b from-transparent via-cosmic-stellar/50 to-transparent" />
            </div>
            
            {/* Navigation Links with Glass Hover */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { href: '#features', label: 'Features' },
                { href: '#how-it-works', label: 'How It Works' },
                { href: '#pricing', label: 'Pricing' },
                { href: '#testimonials', label: 'Reviews' }
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative group text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-300"
                >
                  {link.label}
                  {/* Animated underline */}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cosmic-stellar via-cosmic-plasma to-cosmic-nebula group-hover:w-full transition-all duration-300 rounded-full shadow-[0_0_8px_hsl(var(--cosmic-stellar)/0.6)]" />
                </a>
              ))}
            </div>
            
            {/* Enhanced CTA Button */}
            <GlassButton
              onClick={handleGetStarted}
              variant="cosmic"
              size="lg"
              glow="intense"
              particle={true}
              className="relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Creating
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              {/* Pulse animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-cosmic-stellar/20 to-cosmic-plasma/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </GlassButton>
          </div>
        </div>
        
        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cosmic-stellar/30 to-transparent" />
      </nav>

      {/* PHASE 3: Premium Hero Section with Glassmorphism */}
      <section className="min-h-screen flex items-center relative overflow-hidden pt-24">
        {/* Multi-layer background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-nebula/5 via-transparent via-50% to-cosmic-plasma/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(147,51,234,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.12),transparent_50%)]" />
        
        {/* Enhanced cosmic floating orbs with trails */}
        <div className="absolute top-32 left-[8%] w-80 h-80 bg-cosmic-stellar/25 rounded-full blur-[140px] animate-float">
          <div className="absolute inset-0 bg-cosmic-stellar/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        </div>
        <div className="absolute top-[35%] right-[12%] w-96 h-96 bg-cosmic-nebula/20 rounded-full blur-[160px] animate-float" style={{ animationDelay: '2s', animationDuration: '20s' }}>
          <div className="absolute inset-0 bg-cosmic-nebula/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-[25%] left-[15%] w-64 h-64 bg-cosmic-plasma/25 rounded-full blur-[120px] animate-float" style={{ animationDelay: '4s', animationDuration: '18s' }}>
          <div className="absolute inset-0 bg-cosmic-plasma/35 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Content Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10"
          >
            {/* Headline Container */}
            <div className="space-y-6">
              <motion.h1 
                className="text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  Transform
                </span>
                <span className="block relative group">
                  <span className="bg-gradient-to-r from-cosmic-stellar via-cosmic-plasma to-cosmic-nebula bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(147,51,234,0.5)] animate-shimmer bg-[length:200%_100%]">
                    Music into Magic
                  </span>
                </span>
              </motion.h1>
              
              {/* Subheadline with glass container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cosmic-void/40 to-transparent backdrop-blur-md rounded-2xl -z-10" />
                <p className="text-xl lg:text-2xl text-zinc-300 max-w-xl leading-relaxed p-6 relative">
                  Create <span className="text-cosmic-stellar font-semibold">stunning music videos</span> with AI that understands your sound. 
                  Professional results in <span className="text-cosmic-plasma font-semibold">minutes</span>, not months.
                </p>
              </motion.div>
            </div>
            
            {/* CTA Button Group with Glass Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative"
            >
              {/* Background glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cosmic-stellar/20 to-cosmic-plasma/20 blur-3xl opacity-50 rounded-3xl" />
              
              <div className="relative flex flex-col sm:flex-row gap-4 p-2 backdrop-blur-xl bg-cosmic-void/20 rounded-2xl border border-white/10">
                <GlassButton
                  onClick={handleGetStarted}
                  variant="cosmic"
                  size="xl"
                  glow="intense"
                  particle={true}
                  className="flex-1 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Create Your First Video
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cosmic-stellar via-cosmic-plasma to-cosmic-nebula opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-2xl" />
                </GlassButton>
                
                <GlassButton 
                  onClick={() => setIsVideoModalOpen(true)}
                  variant="void"
                  size="xl"
                  glow="medium"
                  className="flex-1 group"
                >
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </GlassButton>
              </div>
            </motion.div>
            
            {/* Trust Badges with Enhanced Glass */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center gap-8 pt-6"
            >
              {/* Artists Badge */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-lg bg-gradient-to-r from-cosmic-void/40 to-cosmic-shadow/30 border border-white/10">
                <Users className="w-4 h-4 text-cosmic-stellar" />
                <span className="text-sm text-zinc-400">
                  Trusted by <span className="text-white font-semibold">50K+</span> artists
                </span>
              </div>
              
              {/* Rating Badge */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-lg bg-gradient-to-r from-cosmic-void/40 to-cosmic-shadow/30 border border-white/10">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-cosmic-stellar text-cosmic-stellar" />
                  ))}
                </div>
                <span className="text-sm text-zinc-400">
                  <span className="text-white font-semibold">4.9</span>/5
                </span>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right Visual Column */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative group"
          >
            {/* Outer glow container */}
            <div className="absolute -inset-8 bg-gradient-to-br from-cosmic-stellar/20 via-cosmic-plasma/20 to-cosmic-nebula/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />
            
            {/* Main Glass Card */}
            <GlassCard 
              variant="cosmic" 
              depth="deep" 
              glow="intense" 
              shimmer 
              particle={true}
              className="relative p-8 transform-gpu group-hover:scale-[1.02] transition-transform duration-500"
            >
              {/* Inner border glow */}
              <div className="absolute inset-0 rounded-2xl border-2 border-cosmic-stellar/20 pointer-events-none" />
              <div className="absolute inset-0 rounded-2xl border border-cosmic-plasma/30 blur-sm pointer-events-none" />
              
              {/* Video Container */}
              <div className="aspect-video bg-gradient-to-br from-cosmic-stellar/20 via-cosmic-plasma/15 to-cosmic-nebula/20 rounded-2xl overflow-hidden relative ring-1 ring-white/10">
                <video 
                  className="w-full h-full object-cover rounded-2xl"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                >
                  <source src="/bgvid.mp4" type="video/mp4" />
                  <div className="flex items-center justify-center h-full bg-cosmic-void/50">
                    <div className="text-8xl animate-pulse">🎬</div>
                  </div>
                </video>
                
                {/* Video overlay effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                
                {/* Play button overlay */}
                <button 
                  onClick={() => setIsVideoModalOpen(true)}
                  className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(147,51,234,0.5)] hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </button>
              </div>
              
              {/* Caption with glass effect */}
              <div className="mt-6 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cosmic-void/30 to-transparent backdrop-blur-sm rounded-lg -z-10" />
                <div className="py-4 px-6">
                  <div className="text-white font-semibold text-lg mb-1 drop-shadow-[0_0_10px_rgba(147,51,234,0.5)]">
                    Generative Media Interface
                  </div>
                  <div className="text-sm text-zinc-400 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 text-cosmic-quantum" />
                    Professional quality in minutes
                  </div>
                </div>
              </div>
              
              {/* Corner accent decorations */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cosmic-stellar/50 rounded-tl-lg" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-cosmic-plasma/50 rounded-br-lg" />
            </GlassCard>
            
            {/* Floating accent particles */}
            <div className="absolute -top-4 -right-4 w-3 h-3 bg-cosmic-stellar rounded-full blur-sm animate-float" />
            <div className="absolute -bottom-4 -left-4 w-2 h-2 bg-cosmic-plasma rounded-full blur-sm animate-float" style={{ animationDelay: '1s' }} />
          </motion.div>
        </div>
        
        {/* Scroll indicator with glass effect */}
        <motion.div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <div className="px-4 py-2 rounded-full backdrop-blur-xl bg-cosmic-void/30 border border-white/10 shadow-[0_0_20px_rgba(147,51,234,0.2)]">
            <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">Scroll to explore</span>
          </div>
          <ChevronDown className="w-5 h-5 text-zinc-500 group-hover:text-cosmic-stellar animate-bounce transition-colors" />
        </motion.div>
      </section>

      {/* Social Proof Banner */}
      <section className="py-20 bg-gradient-to-r from-cosmic-stellar/5 to-cosmic-nebula/5 backdrop-blur-sm relative">
        <div className="absolute inset-0 particle-field opacity-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-12 text-white">Join the Music Video Revolution</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-cosmic-stellar mb-2">50K+</div>
                <div className="text-zinc-400">Videos Created</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-cosmic-plasma mb-2">2M+</div>
                <div className="text-zinc-400">Views Generated</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-cosmic-nebula mb-2">98%</div>
                <div className="text-zinc-400">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-cosmic-quantum mb-2">4.9★</div>
                <div className="text-zinc-400">User Rating</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Problem */}
            <motion.div 
              data-reveal-id="problem"
              className={cn(
                "transition-all duration-800 ease-out",
                scrollRevealed.includes('problem') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <h2 className="text-4xl font-bold mb-6 text-red-400">The $50,000 Problem</h2>
              <div className="space-y-4 text-zinc-400">
                <p className="text-lg">Professional music videos cost <span className="text-red-400 font-bold">$10,000-$50,000+</span></p>
                <p>Most musicians can't afford cinematic visuals for their art</p>
                <p>DIY videos lack the polish to compete on social platforms</p>
                <p>Traditional production takes weeks or months</p>
              </div>
              <GlassCard variant="void" className="mt-8 p-6 border-red-400/30">
                <div className="text-red-400 font-semibold mb-2">Reality Check:</div>
                <div className="text-sm text-zinc-500">90% of independent musicians never create a professional music video due to cost barriers</div>
              </GlassCard>
            </motion.div>
            
            {/* Solution */}
            <motion.div 
              data-reveal-id="solution"
              className={cn(
                "transition-all duration-800 ease-out",
                scrollRevealed.includes('solution') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <h2 className="text-4xl font-bold mb-6 text-cosmic-stellar">The AI Solution</h2>
              <div className="space-y-4 text-zinc-400">
                <p className="text-lg">Create <span className="text-cosmic-stellar font-bold">Hollywood-quality videos</span> for under $30</p>
                <p>AI understands your music's emotion, rhythm, and lyrics</p>
                <p>Generate multiple concepts in minutes, not months</p>
                <p>Perfect sync with beat drops, mood changes, and crescendos</p>
              </div>
              <GlassCard variant="stellar" glow="subtle" className="mt-8 p-6">
                <div className="text-cosmic-stellar font-semibold mb-2">Game Changer:</div>
                <div className="text-sm text-zinc-400">Transform any bedroom recording into a viral-ready masterpiece</div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 relative bg-cosmic-void/5">
        <div className="absolute inset-0 particle-field opacity-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            data-reveal-id="how-it-works-title"
            className={cn(
              "text-center mb-16 transition-all duration-800 ease-out",
              scrollRevealed.includes('how-it-works-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            )}
          >
            <h2 className="text-5xl font-bold mb-6 text-white">
              From Track to Viral in 4 Steps
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Our AI doesn't just add visuals—it creates a story that amplifies your music's emotional impact
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <motion.div 
              data-reveal-id="step-1"
              className={cn(
                "text-center group transition-all duration-800 ease-out",
                scrollRevealed.includes('step-1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-cosmic-stellar to-cosmic-plasma rounded-full mx-auto mb-6 flex items-center justify-center text-3xl transform transition-all duration-300 group-hover:scale-110 shadow-[0_0_24px_hsl(var(--cosmic-stellar)/0.4)]">
                🎵
              </div>
              <h3 className="text-xl font-bold mb-4 text-cosmic-stellar">Upload & Analyze</h3>
              <p className="text-zinc-400">AI scans your track's BPM, key, mood, and lyrical themes in seconds</p>
              <div className="mt-4 text-xs text-cosmic-stellar font-semibold">✨ Advanced Audio AI</div>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              data-reveal-id="step-2"
              className={cn(
                "text-center group transition-all duration-800 ease-out",
                scrollRevealed.includes('step-2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-cosmic-plasma to-cosmic-nebula rounded-full mx-auto mb-6 flex items-center justify-center text-3xl transform transition-all duration-300 group-hover:scale-110 shadow-[0_0_24px_hsl(var(--cosmic-plasma)/0.4)]">
                🧠
              </div>
              <h3 className="text-xl font-bold mb-4 text-cosmic-plasma">Generate Concepts</h3>
              <p className="text-zinc-400">Multiple storylines and visual styles tailored to your genre and vibe</p>
              <div className="mt-4 text-xs text-cosmic-plasma font-semibold">✨ Creative AI</div>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              data-reveal-id="step-3"
              className={cn(
                "text-center group transition-all duration-800 ease-out",
                scrollRevealed.includes('step-3') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-cosmic-nebula to-cosmic-quantum rounded-full mx-auto mb-6 flex items-center justify-center text-3xl transform transition-all duration-300 group-hover:scale-110 shadow-[0_0_24px_hsl(var(--cosmic-nebula)/0.4)]">
                🎬
              </div>
              <h3 className="text-xl font-bold mb-4 text-cosmic-nebula">Perfect Sync</h3>
              <p className="text-zinc-400">Visuals automatically sync to beat drops, vocals, and emotional peaks</p>
              <div className="mt-4 text-xs text-cosmic-nebula font-semibold">✨ Rhythm AI</div>
            </motion.div>
            
            {/* Step 4 */}
            <motion.div 
              data-reveal-id="step-4"
              className={cn(
                "text-center group transition-all duration-800 ease-out",
                scrollRevealed.includes('step-4') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-cosmic-quantum to-cosmic-stellar rounded-full mx-auto mb-6 flex items-center justify-center text-3xl transform transition-all duration-300 group-hover:scale-110 shadow-[0_0_24px_hsl(var(--cosmic-quantum)/0.4)]">
                🚀
              </div>
              <h3 className="text-xl font-bold mb-4 text-cosmic-quantum">Export & Dominate</h3>
              <p className="text-zinc-400">Download in 4K for platforms or social-optimized formats</p>
              <div className="mt-4 text-xs text-cosmic-quantum font-semibold">✨ Cloud Rendering</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold mb-6 text-white">
              Revolutionary AI Technology
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Each feature is designed to understand and amplify your music's unique emotional signature
            </p>
          </motion.div>
          
          {/* Feature 1: Emotional AI */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block bg-cosmic-stellar/20 text-cosmic-stellar px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-cosmic-stellar/30">
                🧠 Emotional Intelligence AI
              </div>
              <h3 className="text-4xl font-bold mb-6 text-white">Feels Your Music's Soul</h3>
              <p className="text-xl text-zinc-400 mb-6">
                Our AI doesn't just hear notes—it understands <span className="text-cosmic-stellar">emotional context</span>. 
                Melancholy verses get intimate visuals, explosive choruses get dynamic action.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-cosmic-stellar/30 rounded-full flex items-center justify-center border border-cosmic-stellar/50">✓</div>
                  <span className="text-zinc-400">Mood detection from musical keys and progressions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-cosmic-stellar/30 rounded-full flex items-center justify-center border border-cosmic-stellar/50">✓</div>
                  <span className="text-zinc-400">Lyrical sentiment analysis for visual storytelling</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-cosmic-stellar/30 rounded-full flex items-center justify-center border border-cosmic-stellar/50">✓</div>
                  <span className="text-zinc-400">Dynamic adaptation to tempo and energy changes</span>
                </div>
              </div>
            </motion.div>
            <GlassCard 
              variant="stellar"
              depth="medium"
              glow="subtle"
              className="p-8"
            >
              <div className="aspect-video bg-gradient-to-br from-cosmic-stellar/20 to-cosmic-plasma/20 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 particle-field opacity-20"></div>
                <div className="text-6xl animate-pulse relative z-10">🎭</div>
              </div>
              <div className="mt-4 text-center text-sm text-zinc-400">
                AI analyzing emotional peaks in real-time
              </div>
            </GlassCard>
          </div>
          
          {/* Feature 2: Beat Sync Mastery */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <GlassCard 
              variant="nebula"
              depth="medium"
              glow="subtle"
              className="order-2 md:order-1 p-8"
            >
              <div className="aspect-video bg-gradient-to-br from-cosmic-plasma/20 to-cosmic-nebula/20 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 particle-field opacity-20"></div>
                <div className="text-6xl animate-bounce relative z-10">🥁</div>
              </div>
              <div className="mt-4 text-center text-sm text-zinc-400">
                Perfect synchronization with every beat
              </div>
            </GlassCard>
            <motion.div 
              className="order-1 md:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-block bg-cosmic-plasma/20 text-cosmic-plasma px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-cosmic-plasma/30">
                🎵 Beat-Sync Mastery
              </div>
              <h3 className="text-4xl font-bold mb-6 text-white">Every Frame Matches Your Rhythm</h3>
              <p className="text-xl text-zinc-400 mb-6">
                Millisecond-perfect synchronization that makes your audience <span className="text-cosmic-plasma">feel</span> the music. 
                Cuts, transitions, and effects align with your track's natural flow.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-cosmic-plasma/30 rounded-full flex items-center justify-center border border-cosmic-plasma/50">✓</div>
                  <span className="text-zinc-400">Advanced beat detection algorithms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-cosmic-plasma/30 rounded-full flex items-center justify-center border border-cosmic-plasma/50">✓</div>
                  <span className="text-zinc-400">Smart scene transitions on musical phrases</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-cosmic-plasma/30 rounded-full flex items-center justify-center border border-cosmic-plasma/50">✓</div>
                  <span className="text-zinc-400">Visual effects timed to instrumental solos</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 relative bg-cosmic-void/5">
        <div className="absolute inset-0 particle-field opacity-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold mb-6 text-white">
              Artists Are Going Viral
            </h2>
            <p className="text-xl text-zinc-400">Real stories from musicians who transformed their careers</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <GlassCard 
              variant="stellar"
              depth="medium"
              glow="subtle"
              className="p-8 hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cosmic-stellar to-cosmic-plasma rounded-full mr-4 shadow-[0_0_16px_hsl(var(--cosmic-stellar)/0.4)]"></div>
                <div>
                  <div className="font-bold text-white">Alex Rivera</div>
                  <div className="text-sm text-zinc-500">@alexbeats • 2.1M followers</div>
                </div>
              </div>
              <p className="text-zinc-400 mb-4">
                "My bedroom track went from 500 views to 2.1M in 3 days after using WZRD.STUDIO. 
                The AI perfectly captured the dark synthwave vibe I was going for. Now I have a record deal."
              </p>
              <div className="text-cosmic-stellar text-sm font-semibold">📈 +420,000% view increase</div>
            </GlassCard>
            
            {/* Testimonial 2 */}
            <GlassCard 
              variant="nebula"
              depth="medium"
              glow="subtle"
              className="p-8 hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cosmic-plasma to-cosmic-nebula rounded-full mr-4 shadow-[0_0_16px_hsl(var(--cosmic-plasma)/0.4)]"></div>
                <div>
                  <div className="font-bold text-white">Luna Collective</div>
                  <div className="text-sm text-zinc-500">Indie Band • 150K monthly listeners</div>
                </div>
              </div>
              <p className="text-zinc-400 mb-4">
                "We spent our entire budget on recording. WZRD.STUDIO gave us Hollywood-level visuals for $29. 
                Our song 'Neon Dreams' is now our biggest hit."
              </p>
              <div className="text-cosmic-plasma text-sm font-semibold">🎵 #1 on indie charts for 6 weeks</div>
            </GlassCard>
            
            {/* Testimonial 3 */}
            <GlassCard 
              variant="quantum"
              depth="medium"
              glow="subtle"
              className="p-8 hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cosmic-nebula to-cosmic-quantum rounded-full mr-4 shadow-[0_0_16px_hsl(var(--cosmic-nebula)/0.4)]"></div>
                <div>
                  <div className="font-bold text-white">DJ Quantum</div>
                  <div className="text-sm text-zinc-500">Electronic Producer • 890K followers</div>
                </div>
              </div>
              <p className="text-zinc-400 mb-4">
                "The beat-sync is absolutely insane. Every drop, every build—perfectly matched. 
                My fans think I hired a team of 20 people. It's just me and WZRD.STUDIO."
              </p>
              <div className="text-cosmic-quantum text-sm font-semibold">🔥 Featured on Beatport top 10</div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold mb-6 text-white">
              Pricing That Makes Sense
            </h2>
            <p className="text-xl text-zinc-400">
              Professional results without the professional price tag
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <GlassCard 
              variant="void"
              depth="medium"
              glow="subtle"
              className="p-8 hover:scale-105 transition-all duration-300"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-white">Starter</h3>
                <div className="text-5xl font-bold text-cosmic-stellar">FREE</div>
                <p className="text-zinc-400 mt-2">Perfect for testing the magic</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cosmic-stellar/30 rounded-full flex items-center justify-center text-xs border border-cosmic-stellar/50">✓</div>
                  <span className="text-zinc-400">100 free credits (2-3 videos)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cosmic-stellar/30 rounded-full flex items-center justify-center text-xs border border-cosmic-stellar/50">✓</div>
                  <span className="text-zinc-400">720p HD output</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cosmic-stellar/30 rounded-full flex items-center justify-center text-xs border border-cosmic-stellar/50">✓</div>
                  <span className="text-zinc-400">Basic beat detection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cosmic-stellar/30 rounded-full flex items-center justify-center text-xs border border-cosmic-stellar/50">✓</div>
                  <span className="text-zinc-400">3 style presets</span>
                </div>
              </div>
              <GlassButton 
                onClick={handleGetStarted}
                variant="stellar"
                glow="subtle"
                className="w-full"
              >
                Start Creating Now
              </GlassButton>
            </GlassCard>
            
            {/* Creator Plan */}
            <GlassCard 
              variant="cosmic"
              depth="deep"
              glow="intense"
              particle
              shimmer
              className="p-8 hover:scale-105 transition-all duration-300 relative border-2 border-cosmic-plasma"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-cosmic-plasma px-4 py-1 rounded-full text-sm font-bold text-white shadow-[0_0_16px_hsl(var(--cosmic-plasma)/0.6)]">
                MOST POPULAR
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-white">Creator</h3>
                <div className="text-5xl font-bold text-cosmic-plasma">$29</div>
                <p className="text-zinc-400 mt-2">For serious musicians</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cosmic-plasma/30 rounded-full flex items-center justify-center text-xs border border-cosmic-plasma/50">✓</div>
                  <span className="text-zinc-400">2,500 credits/month (50+ videos)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cosmic-plasma/30 rounded-full flex items-center justify-center text-xs border border-cosmic-plasma/50">✓</div>
                  <span className="text-zinc-400">4K Ultra HD output</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cosmic-plasma/30 rounded-full flex items-center justify-center text-xs border border-cosmic-plasma/50">✓</div>
                  <span className="text-zinc-400">Advanced lyric analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cosmic-plasma/30 rounded-full flex items-center justify-center text-xs border border-cosmic-plasma/50">✓</div>
                  <span className="text-zinc-400">50+ premium styles</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cosmic-plasma/30 rounded-full flex items-center justify-center text-xs border border-cosmic-plasma/50">✓</div>
                  <span className="text-zinc-400">Social media formats</span>
                </div>
              </div>
              <GlassButton 
                onClick={handleGetStarted}
                variant="cosmic"
                glow="medium"
                className="w-full"
              >
                Upgrade to Creator
              </GlassButton>
            </GlassCard>
            
            {/* Studio Plan */}
            <GlassCard 
              variant="void"
              depth="medium"
              glow="subtle"
              className="p-8 hover:scale-105 transition-all duration-300"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-white">Studio</h3>
                <div className="text-5xl font-bold text-cosmic-nebula">$99</div>
                <p className="text-zinc-400 mt-2">For labels & agencies</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cosmic-nebula/30 rounded-full flex items-center justify-center text-xs border border-cosmic-nebula/50">✓</div>
                  <span className="text-zinc-400">10,000 credits/month (200+ videos)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cosmic-nebula/30 rounded-full flex items-center justify-center text-xs border border-cosmic-nebula/50">✓</div>
                  <span className="text-zinc-400">8K cinema-grade output</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cosmic-nebula/30 rounded-full flex items-center justify-center text-xs border border-cosmic-nebula/50">✓</div>
                  <span className="text-zinc-400">Custom style training</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cosmic-nebula/30 rounded-full flex items-center justify-center text-xs border border-cosmic-nebula/50">✓</div>
                  <span className="text-zinc-400">Team collaboration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cosmic-nebula/30 rounded-full flex items-center justify-center text-xs border border-cosmic-nebula/50">✓</div>
                  <span className="text-zinc-400">API access</span>
                </div>
              </div>
              <GlassButton 
                onClick={handleGetStarted}
                variant="void"
                glow="subtle"
                className="w-full"
              >
                Contact Sales
              </GlassButton>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative bg-gradient-to-b from-cosmic-void/10 to-black">
        <div className="absolute inset-0 particle-field opacity-15 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-6xl font-bold mb-6 text-white">
              Your Music Deserves More
            </h2>
            <p className="text-2xl text-zinc-400 mb-12">
              Join 50,000+ artists who chose to amplify their art with AI. 
              <br /><span className="text-cosmic-plasma">Your breakthrough moment is one video away.</span>
            </p>
            
            <div className="space-y-4">
              <GlassButton
                onClick={handleGetStarted}
                variant="cosmic"
                size="xl"
                glow="intense"
                particle
                className="px-12 py-6 text-xl"
              >
                🚀 Start Your Free Trial Now
              </GlassButton>
              <p className="text-sm text-zinc-500">
                100 free credits • No credit card required • 2-minute setup
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="text-2xl font-bold text-white mb-4">
                WZRD.STUDIO
              </div>
              <p className="text-zinc-400 mb-4">
                Transforming music into visual magic with revolutionary AI technology.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-zinc-500 hover:text-white transition-colors">📘</a>
                <a href="#" className="text-zinc-500 hover:text-white transition-colors">🐦</a>
                <a href="#" className="text-zinc-500 hover:text-white transition-colors">📷</a>
                <a href="#" className="text-zinc-500 hover:text-white transition-colors">🎵</a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Platform</h3>
              <div className="space-y-2 text-zinc-400">
                <a href="#" className="block hover:text-white transition-colors">Features</a>
                <a href="#" className="block hover:text-white transition-colors">Pricing</a>
                <a href="#" className="block hover:text-white transition-colors">API</a>
                <a href="#" className="block hover:text-white transition-colors">Integrations</a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Resources</h3>
              <div className="space-y-2 text-zinc-400">
                <a href="#" className="block hover:text-white transition-colors">Documentation</a>
                <a href="#" className="block hover:text-white transition-colors">Tutorials</a>
                <a href="#" className="block hover:text-white transition-colors">Community</a>
                <a href="#" className="block hover:text-white transition-colors">Blog</a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Company</h3>
              <div className="space-y-2 text-zinc-400">
                <a href="#" className="block hover:text-white transition-colors">About</a>
                <a href="#" className="block hover:text-white transition-colors">Careers</a>
                <a href="#" className="block hover:text-white transition-colors">Contact</a>
                <a href="#" className="block hover:text-white transition-colors">Privacy</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-zinc-500 text-sm">© 2025 WZRD.STUDIO. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-zinc-400">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-gradient-to-br from-refined-rich/20 to-refined-pink/20 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-white/60">Demo video coming soon...</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
};

export default Landing;