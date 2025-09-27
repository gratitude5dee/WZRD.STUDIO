import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, ChevronDown, Sparkles, Brain, Zap, Star, Palette, Users, Trophy, Shield, Clock, TrendingUp, Music, Eye, Layers, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const navigate = useNavigate();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState('emotional');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollRevealed, setScrollRevealed] = useState<string[]>([]);

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
    <div className="bg-void-black text-white font-inter overflow-x-hidden">
      {/* Floating particles background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div 
          className="absolute inset-0 bg-repeat animate-stars"
          style={{
            backgroundImage: `
              radial-gradient(2px 2px at 20px 30px, hsl(var(--electric)), transparent),
              radial-gradient(2px 2px at 40px 70px, hsl(var(--neon-purple)), transparent),
              radial-gradient(1px 1px at 90px 40px, hsl(var(--cyber-pink)), transparent),
              radial-gradient(1px 1px at 130px 80px, hsl(var(--electric)), transparent),
              radial-gradient(2px 2px at 160px 30px, hsl(var(--neon-purple)), transparent)
            `,
            backgroundSize: '200px 100px'
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-morphism backdrop-blur-xl bg-void-black/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="font-cyber text-2xl font-bold text-electric" style={{
              textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor'
            }}>
              WZRD.STUDIO
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="hover:text-electric transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-electric transition-colors">How It Works</a>
              <a href="#pricing" className="hover:text-electric transition-colors">Pricing</a>
              <a href="#testimonials" className="hover:text-electric transition-colors">Reviews</a>
            </div>
            <GlassButton 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-electric to-neon-purple animate-cyber-glow-pulse hover:scale-105 transition-transform"
            >
              Start Creating
            </GlassButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Cyberpunk Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 245, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 245, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Background video */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          style={{ filter: 'brightness(0.3) saturate(1.2) hue-rotate(220deg)' }}
        >
          <source src="/bgvid.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-space/50 to-void-black"></div>
        
        {/* 3D Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-electric/20 rounded-full animate-float blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-neon-purple/20 rounded-full blur-xl" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-16 h-16 bg-cyber-pink/20 rounded-full blur-xl" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
          <div className="animate-slide-up">
            <motion.h1 
              className="font-cyber text-6xl md:text-8xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-electric" style={{ textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' }}>MUSIC</span><br/>
              <span className="text-neon-purple" style={{ textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' }}>MEETS</span><br/>
              <span className="text-cyber-pink" style={{ textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' }}>MAGIC</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Transform any track into <span className="text-electric font-semibold">cinematic masterpieces</span> with AI that understands your music's soul. No directors. No crews. Just pure creative freedom.
            </motion.p>
            
            <motion.div 
              className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <GlassButton
                onClick={handleGetStarted}
                size="xl"
                className="bg-gradient-to-r from-electric to-neon-purple animate-cyber-glow-pulse hover:scale-110 transition-all duration-300 shadow-2xl font-bold text-lg px-8 py-4"
              >
                <Music className="w-5 h-5 mr-2" />
                Create Your First Video FREE
              </GlassButton>
              <GlassButton
                onClick={() => setIsVideoModalOpen(true)}
                variant="ghost"
                size="xl"
                className="backdrop-blur-20 bg-white/5 hover:bg-white/10 transition-all font-semibold text-lg px-8 py-4"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch 60-Second Demo
              </GlassButton>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              <p className="text-sm text-gray-400 mb-4">Trusted by 50,000+ musicians worldwide</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-2xl">🎵</div>
                <div className="text-2xl">🎸</div>
                <div className="text-2xl">🎤</div>
                <div className="text-2xl">🎹</div>
                <div className="text-2xl">🥁</div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Floating 3D Music Video Preview */}
        <div className="absolute bottom-20 right-10 w-64 h-36 backdrop-blur-20 bg-white/5 border border-white/10 rounded-xl animate-float hidden lg:block" style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(0, 245, 255, 0.2) 50%, transparent 70%)',
          backgroundSize: '200% 200%',
          animation: 'float 6s ease-in-out infinite, hologram 3s ease-in-out infinite'
        }}>
          <div className="p-4 h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-electric to-neon-purple rounded-full mx-auto mb-2 flex items-center justify-center animate-pulse">
                <span className="text-2xl">🎬</span>
              </div>
              <p className="text-xs text-gray-300">Live Preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="py-12 bg-gradient-to-r from-electric/10 to-neon-purple/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Join the Music Video Revolution</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-cyber font-bold text-electric">50K+</div>
                <div className="text-gray-400">Videos Created</div>
              </div>
              <div>
                <div className="text-3xl font-cyber font-bold text-neon-purple">2M+</div>
                <div className="text-gray-400">Views Generated</div>
              </div>
              <div>
                <div className="text-3xl font-cyber font-bold text-cyber-pink">98%</div>
                <div className="text-gray-400">Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-3xl font-cyber font-bold text-electric">4.9★</div>
                <div className="text-gray-400">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-24 relative">
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
              <div className="space-y-4 text-gray-300">
                <p className="text-lg">Professional music videos cost <span className="text-red-400 font-bold">$10,000-$50,000+</span></p>
                <p>Most musicians can't afford cinematic visuals for their art</p>
                <p>DIY videos lack the polish to compete on social platforms</p>
                <p>Traditional production takes weeks or months</p>
              </div>
              <div className="mt-8 p-6 backdrop-blur-16 bg-red-400/5 border border-red-400/30 rounded-xl">
                <div className="text-red-400 font-semibold mb-2">Reality Check:</div>
                <div className="text-sm text-gray-400">90% of independent musicians never create a professional music video due to cost barriers</div>
              </div>
            </motion.div>
            
            {/* Solution */}
            <motion.div 
              data-reveal-id="solution"
              className={cn(
                "transition-all duration-800 ease-out",
                scrollRevealed.includes('solution') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <h2 className="text-4xl font-bold mb-6 text-electric" style={{ textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' }}>The AI Solution</h2>
              <div className="space-y-4 text-gray-300">
                <p className="text-lg">Create <span className="text-electric font-bold">Hollywood-quality videos</span> for under $30</p>
                <p>AI understands your music's emotion, rhythm, and lyrics</p>
                <p>Generate multiple concepts in minutes, not months</p>
                <p>Perfect sync with beat drops, mood changes, and crescendos</p>
              </div>
              <div className="mt-8 p-6 backdrop-blur-16 bg-electric/5 border border-electric/30 rounded-xl">
                <div className="text-electric font-semibold mb-2">Game Changer:</div>
                <div className="text-sm text-gray-400">Transform any bedroom recording into a viral-ready masterpiece</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative bg-deep-space/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            data-reveal-id="how-it-works-title"
            className={cn(
              "text-center mb-16 transition-all duration-800 ease-out",
              scrollRevealed.includes('how-it-works-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            )}
          >
            <h2 className="text-5xl font-cyber font-bold mb-6 text-electric" style={{ textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' }}>
              FROM TRACK TO VIRAL IN 4 STEPS
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
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
              <div className="w-20 h-20 bg-gradient-to-br from-electric to-neon-purple rounded-full mx-auto mb-6 flex items-center justify-center text-3xl transform transition-all duration-500 group-hover:scale-120 group-hover:rotate-y-180">
                🎵
              </div>
              <h3 className="text-xl font-bold mb-4 text-electric">Upload & Analyze</h3>
              <p className="text-gray-400">AI scans your track's BPM, key, mood, and lyrical themes in seconds</p>
              <div className="mt-4 text-xs text-electric font-semibold">✨ Advanced Audio AI</div>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              data-reveal-id="step-2"
              className={cn(
                "text-center group transition-all duration-800 ease-out",
                scrollRevealed.includes('step-2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-neon-purple to-cyber-pink rounded-full mx-auto mb-6 flex items-center justify-center text-3xl transform transition-all duration-500 group-hover:scale-120 group-hover:rotate-y-180">
                🧠
              </div>
              <h3 className="text-xl font-bold mb-4 text-neon-purple">Generate Concepts</h3>
              <p className="text-gray-400">Multiple storylines and visual styles tailored to your genre and vibe</p>
              <div className="mt-4 text-xs text-neon-purple font-semibold">✨ Creative AI</div>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              data-reveal-id="step-3"
              className={cn(
                "text-center group transition-all duration-800 ease-out",
                scrollRevealed.includes('step-3') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-cyber-pink to-electric rounded-full mx-auto mb-6 flex items-center justify-center text-3xl transform transition-all duration-500 group-hover:scale-120 group-hover:rotate-y-180">
                🎬
              </div>
              <h3 className="text-xl font-bold mb-4 text-cyber-pink">Perfect Sync</h3>
              <p className="text-gray-400">Visuals automatically sync to beat drops, vocals, and emotional peaks</p>
              <div className="mt-4 text-xs text-cyber-pink font-semibold">✨ Rhythm AI</div>
            </motion.div>
            
            {/* Step 4 */}
            <motion.div 
              data-reveal-id="step-4"
              className={cn(
                "text-center group transition-all duration-800 ease-out",
                scrollRevealed.includes('step-4') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-electric to-neon-purple rounded-full mx-auto mb-6 flex items-center justify-center text-3xl transform transition-all duration-500 group-hover:scale-120 group-hover:rotate-y-180">
                🚀
              </div>
              <h3 className="text-xl font-bold mb-4 text-electric">Export & Dominate</h3>
              <p className="text-gray-400">Download in 4K for platforms or social-optimized formats</p>
              <div className="mt-4 text-xs text-electric font-semibold">✨ Cloud Rendering</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            data-reveal-id="features-title"
            className={cn(
              "text-center mb-16 transition-all duration-800 ease-out",
              scrollRevealed.includes('features-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            )}
          >
            <h2 className="text-5xl font-cyber font-bold mb-6 text-neon-purple" style={{ textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' }}>
              REVOLUTIONARY AI TECHNOLOGY
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Each feature is designed to understand and amplify your music's unique emotional signature
            </p>
          </motion.div>
          
          {/* Feature 1: Emotional AI */}
          <motion.div 
            data-reveal-id="feature-1"
            className={cn(
              "grid md:grid-cols-2 gap-16 items-center mb-32 transition-all duration-800 ease-out",
              scrollRevealed.includes('feature-1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            )}
          >
            <div>
              <div className="inline-block bg-electric/20 text-electric px-4 py-2 rounded-full text-sm font-semibold mb-4">
                🧠 Emotional Intelligence AI
              </div>
              <h3 className="text-4xl font-bold mb-6">Feels Your Music's Soul</h3>
              <p className="text-xl text-gray-300 mb-6">
                Our AI doesn't just hear notes—it understands <span className="text-electric">emotional context</span>. 
                Melancholy verses get intimate visuals, explosive choruses get dynamic action.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-electric/30 rounded-full flex items-center justify-center">✓</div>
                  <span>Mood detection from musical keys and progressions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-electric/30 rounded-full flex items-center justify-center">✓</div>
                  <span>Lyrical sentiment analysis for visual storytelling</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-electric/30 rounded-full flex items-center justify-center">✓</div>
                  <span>Dynamic adaptation to tempo and energy changes</span>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-16 bg-white/5 border border-white/10 p-8 rounded-2xl">
              <div className="aspect-video bg-gradient-to-br from-electric/20 to-neon-purple/20 rounded-xl flex items-center justify-center">
                <div className="text-6xl animate-pulse">🎭</div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-400">
                AI analyzing emotional peaks in real-time
              </div>
            </div>
          </motion.div>
          
          {/* Feature 2: Beat Sync Mastery */}
          <motion.div 
            data-reveal-id="feature-2"
            className={cn(
              "grid md:grid-cols-2 gap-16 items-center mb-32 transition-all duration-800 ease-out",
              scrollRevealed.includes('feature-2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            )}
          >
            <div className="order-2 md:order-1 backdrop-blur-16 bg-white/5 border border-white/10 p-8 rounded-2xl">
              <div className="aspect-video bg-gradient-to-br from-neon-purple/20 to-cyber-pink/20 rounded-xl flex items-center justify-center">
                <div className="text-6xl animate-bounce">🥁</div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-400">
                Perfect synchronization with every beat
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-block bg-neon-purple/20 text-neon-purple px-4 py-2 rounded-full text-sm font-semibold mb-4">
                🎵 Beat-Sync Mastery
              </div>
              <h3 className="text-4xl font-bold mb-6">Every Frame Matches Your Rhythm</h3>
              <p className="text-xl text-gray-300 mb-6">
                Millisecond-perfect synchronization that makes your audience <span className="text-neon-purple">feel</span> the music. 
                Cuts, transitions, and effects align with your track's natural flow.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-neon-purple/30 rounded-full flex items-center justify-center">✓</div>
                  <span>Advanced beat detection algorithms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-neon-purple/30 rounded-full flex items-center justify-center">✓</div>
                  <span>Smart scene transitions on musical phrases</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-neon-purple/30 rounded-full flex items-center justify-center">✓</div>
                  <span>Visual effects timed to instrumental solos</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Feature 3: Style Adaptation */}
          <motion.div 
            data-reveal-id="feature-3"
            className={cn(
              "grid md:grid-cols-2 gap-16 items-center transition-all duration-800 ease-out",
              scrollRevealed.includes('feature-3') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            )}
          >
            <div>
              <div className="inline-block bg-cyber-pink/20 text-cyber-pink px-4 py-2 rounded-full text-sm font-semibold mb-4">
                🎨 Infinite Style Universe
              </div>
              <h3 className="text-4xl font-bold mb-6">Your Brand, Amplified</h3>
              <p className="text-xl text-gray-300 mb-6">
                From <span className="text-cyber-pink">cyberpunk neon</span> to vintage film noir—our AI adapts to any aesthetic. 
                Create a consistent visual identity across all your releases.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-cyber-pink/30 rounded-full flex items-center justify-center">✓</div>
                  <span>Genre-specific visual language database</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-cyber-pink/30 rounded-full flex items-center justify-center">✓</div>
                  <span>Custom brand palette integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-cyber-pink/30 rounded-full flex items-center justify-center">✓</div>
                  <span>Style consistency across multiple videos</span>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-16 bg-white/5 border border-white/10 p-8 rounded-2xl">
              <div className="aspect-video bg-gradient-to-br from-cyber-pink/20 to-electric/20 rounded-xl flex items-center justify-center">
                <div className="text-6xl" style={{ animation: 'float 6s ease-in-out infinite' }}>🎨</div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-400">
                Infinite visual styles at your command
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 relative bg-deep-space/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            data-reveal-id="testimonials-title"
            className={cn(
              "text-center mb-16 transition-all duration-800 ease-out",
              scrollRevealed.includes('testimonials-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            )}
          >
            <h2 className="text-5xl font-cyber font-bold mb-6 text-electric" style={{ textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' }}>
              ARTISTS ARE GOING VIRAL
            </h2>
            <p className="text-xl text-gray-300">Real stories from musicians who transformed their careers</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div 
              data-reveal-id="testimonial-1"
              className={cn(
                "backdrop-blur-16 bg-white/5 border border-white/10 p-8 rounded-2xl hover:scale-105 transition-all duration-300",
                scrollRevealed.includes('testimonial-1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-electric to-neon-purple rounded-full mr-4"></div>
                <div>
                  <div className="font-bold">Alex Rivera</div>
                  <div className="text-sm text-gray-400">@alexbeats • 2.1M followers</div>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "My bedroom track went from 500 views to 2.1M in 3 days after using WZRD.STUDIO. 
                The AI perfectly captured the dark synthwave vibe I was going for. Now I have a record deal."
              </p>
              <div className="text-electric text-sm font-semibold">📈 +420,000% view increase</div>
            </motion.div>
            
            {/* Testimonial 2 */}
            <motion.div 
              data-reveal-id="testimonial-2"
              className={cn(
                "backdrop-blur-16 bg-white/5 border border-white/10 p-8 rounded-2xl hover:scale-105 transition-all duration-300",
                scrollRevealed.includes('testimonial-2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-neon-purple to-cyber-pink rounded-full mr-4"></div>
                <div>
                  <div className="font-bold">Luna Collective</div>
                  <div className="text-sm text-gray-400">Indie Band • 150K monthly listeners</div>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "We spent our entire budget on recording. WZRD.STUDIO gave us Hollywood-level visuals for $29. 
                Our song 'Neon Dreams' is now our biggest hit."
              </p>
              <div className="text-neon-purple text-sm font-semibold">🎵 #1 on indie charts for 6 weeks</div>
            </motion.div>
            
            {/* Testimonial 3 */}
            <motion.div 
              data-reveal-id="testimonial-3"
              className={cn(
                "backdrop-blur-16 bg-white/5 border border-white/10 p-8 rounded-2xl hover:scale-105 transition-all duration-300",
                scrollRevealed.includes('testimonial-3') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyber-pink to-electric rounded-full mr-4"></div>
                <div>
                  <div className="font-bold">DJ Quantum</div>
                  <div className="text-sm text-gray-400">Electronic Producer • 890K followers</div>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "The beat-sync is absolutely insane. Every drop, every build—perfectly matched. 
                My fans think I hired a team of 20 people. It's just me and WZRD.STUDIO."
              </p>
              <div className="text-cyber-pink text-sm font-semibold">🔥 Featured on Beatport top 10</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            data-reveal-id="pricing-title"
            className={cn(
              "text-center mb-16 transition-all duration-800 ease-out",
              scrollRevealed.includes('pricing-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            )}
          >
            <h2 className="text-5xl font-cyber font-bold mb-6 text-neon-purple" style={{ textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' }}>
              PRICING THAT MAKES SENSE
            </h2>
            <p className="text-xl text-gray-300">
              Professional results without the professional price tag
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <motion.div 
              data-reveal-id="pricing-1"
              className={cn(
                "backdrop-blur-16 bg-white/5 border border-white/10 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl",
                scrollRevealed.includes('pricing-1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <div className="text-5xl font-cyber font-bold text-electric">FREE</div>
                <p className="text-gray-400 mt-2">Perfect for testing the magic</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-electric/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>100 free credits (2-3 videos)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-electric/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>720p HD output</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-electric/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>Basic beat detection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-electric/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>3 style presets</span>
                </div>
              </div>
              <GlassButton 
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-electric to-neon-purple py-3 hover:scale-105 transition-transform font-bold"
              >
                Start Creating Now
              </GlassButton>
            </motion.div>
            
            {/* Creator Plan */}
            <motion.div 
              data-reveal-id="pricing-2"
              className={cn(
                "backdrop-blur-16 bg-white/5 border-2 border-neon-purple p-8 rounded-2xl relative transition-all duration-300 hover:-translate-y-2",
                scrollRevealed.includes('pricing-2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
              style={{ boxShadow: '0 20px 40px rgba(191, 0, 255, 0.3)' }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-neon-purple px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Creator</h3>
                <div className="text-5xl font-cyber font-bold text-neon-purple">$29</div>
                <p className="text-gray-400 mt-2">For serious musicians</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-neon-purple/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>2,500 credits/month (50+ videos)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-neon-purple/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>4K Ultra HD output</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-neon-purple/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>Advanced lyric analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-neon-purple/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>50+ premium styles</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-neon-purple/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>Social media formats</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-neon-purple/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>Priority rendering</span>
                </div>
              </div>
              <GlassButton 
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-neon-purple to-cyber-pink py-3 hover:scale-105 transition-transform font-bold"
              >
                Upgrade to Creator
              </GlassButton>
            </motion.div>
            
            {/* Studio Plan */}
            <motion.div 
              data-reveal-id="pricing-3"
              className={cn(
                "backdrop-blur-16 bg-white/5 border border-white/10 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl",
                scrollRevealed.includes('pricing-3') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Studio</h3>
                <div className="text-5xl font-cyber font-bold text-cyber-pink">$99</div>
                <p className="text-gray-400 mt-2">For labels & agencies</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cyber-pink/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>10,000 credits/month (200+ videos)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cyber-pink/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>8K cinema-grade output</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cyber-pink/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>Custom style training</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cyber-pink/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>Team collaboration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cyber-pink/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>API access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-cyber-pink/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span>White-label options</span>
                </div>
              </div>
              <GlassButton 
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-cyber-pink to-electric py-3 hover:scale-105 transition-transform font-bold"
              >
                Contact Sales
              </GlassButton>
            </motion.div>
          </div>
          
          {/* Money Back Guarantee */}
          <motion.div 
            data-reveal-id="guarantee"
            className={cn(
              "text-center mt-16 transition-all duration-800 ease-out",
              scrollRevealed.includes('guarantee') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            )}
          >
            <div className="backdrop-blur-16 bg-white/5 border border-white/10 p-6 rounded-xl inline-block">
              <div className="text-electric font-bold mb-2">🛡️ 30-Day Money-Back Guarantee</div>
              <div className="text-gray-400">Not satisfied? Get a full refund, no questions asked.</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative bg-gradient-to-b from-deep-space to-void-black">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div
            data-reveal-id="final-cta"
            className={cn(
              "transition-all duration-800 ease-out",
              scrollRevealed.includes('final-cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            )}
          >
            <h2 className="text-6xl font-cyber font-bold mb-6 text-electric" style={{ textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' }}>
              YOUR MUSIC DESERVES MORE
            </h2>
            <p className="text-2xl text-gray-300 mb-12">
              Join 50,000+ artists who chose to amplify their art with AI. 
              <br/><span className="text-neon-purple">Your breakthrough moment is one video away.</span>
            </p>
            
            <div className="space-y-4">
              <GlassButton
                onClick={handleGetStarted}
                size="xl"
                className="bg-gradient-to-r from-electric via-neon-purple to-cyber-pink px-12 py-6 animate-cyber-glow-pulse hover:scale-110 transition-all duration-300 shadow-2xl font-bold text-xl"
              >
                <TrendingUp className="w-6 h-6 mr-2" />
                Start Your Free Trial Now
              </GlassButton>
              <p className="text-sm text-gray-400">
                100 free credits • No credit card required • 2-minute setup
              </p>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-16 flex justify-center items-center space-x-8 opacity-60">
              <div className="text-center">
                <div className="text-2xl mb-1">🔒</div>
                <div className="text-xs">Secure</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-xs">Instant</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs">Precise</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🎵</div>
                <div className="text-xs">Musical</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-void-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="font-cyber text-2xl font-bold text-electric mb-4" style={{ textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' }}>
                WZRD.STUDIO
              </div>
              <p className="text-gray-400 mb-4">
                Transforming music into visual magic with revolutionary AI technology.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-electric transition-colors">📘</a>
                <a href="#" className="text-gray-400 hover:text-electric transition-colors">🐦</a>
                <a href="#" className="text-gray-400 hover:text-electric transition-colors">📷</a>
                <a href="#" className="text-gray-400 hover:text-electric transition-colors">🎵</a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Platform</h3>
              <div className="space-y-2 text-gray-400">
                <a href="#features" className="block hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="block hover:text-white transition-colors">Pricing</a>
                <a href="#" className="block hover:text-white transition-colors">API</a>
                <a href="#" className="block hover:text-white transition-colors">Integrations</a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-white transition-colors">Documentation</a>
                <a href="#" className="block hover:text-white transition-colors">Tutorials</a>
                <a href="#" className="block hover:text-white transition-colors">Community</a>
                <a href="#" className="block hover:text-white transition-colors">Blog</a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-white transition-colors">About</a>
                <a href="#" className="block hover:text-white transition-colors">Careers</a>
                <a href="#" className="block hover:text-white transition-colors">Contact</a>
                <a href="#" className="block hover:text-white transition-colors">Privacy</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 WZRD.STUDIO. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
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
              className="bg-white/10 backdrop-blur-20 border border-white/20 rounded-2xl p-8 max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-gradient-to-br from-electric/20 to-neon-purple/20 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-20 h-20 text-white mb-4 mx-auto" />
                  <p className="text-lg text-gray-300">Demo video coming soon</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <GlassButton
                  onClick={() => setIsVideoModalOpen(false)}
                  variant="ghost"
                >
                  Close
                </GlassButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;