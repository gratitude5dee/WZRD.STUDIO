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

const Landing = () => {
  const navigate = useNavigate();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState('emotional');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollRevealed, setScrollRevealed] = useState<string[]>([]);
  const [showIntro, setShowIntro] = useState(true);

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
    <>
      {/* Cinematic Intro */}
      {showIntro && (
        <CinematicIntro onComplete={() => setShowIntro(false)} />
      )}

      <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
        {/* Cosmic background effects */}
        <div className="fixed inset-0 bg-cosmic-void/10 pointer-events-none"></div>
        <div className="fixed inset-0 particle-field opacity-15 pointer-events-none"></div>
        <div className="fixed inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_50%)]"></div>
        </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <AnimatedLogo size="lg" showVersion={false} />
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-zinc-400 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-zinc-400 hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-zinc-400 hover:text-white transition-colors">Reviews</a>
            </div>
            <GlassButton
              onClick={handleGetStarted}
              variant="cosmic"
              glow="medium"
            >
              Start Creating
            </GlassButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-nebula/10 via-transparent to-cosmic-plasma/10"></div>
        
        {/* Cosmic floating orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-cosmic-stellar/20 rounded-full animate-float blur-3xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-cosmic-nebula/20 rounded-full animate-float blur-3xl" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-cosmic-plasma/20 rounded-full animate-float blur-3xl" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                <span className="block text-white">Transform</span>
                <span className="block bg-gradient-to-r from-cosmic-stellar via-cosmic-plasma to-cosmic-nebula bg-clip-text text-transparent">
                  Music into Magic
                </span>
              </h1>
              
              <p className="text-xl text-zinc-400 max-w-xl leading-relaxed">
                Create stunning music videos with AI that understands your sound. 
                Professional results in minutes, not months.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <GlassButton
                onClick={handleGetStarted}
                variant="cosmic"
                size="xl"
                glow="medium"
              >
                Create Your First Video
              </GlassButton>
              <GlassButton 
                variant="void"
                size="xl"
                glow="subtle"
              >
                Watch Demo
              </GlassButton>
            </div>
            
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-sm text-zinc-500">Trusted by 50K+ artists</div>
              <div className="flex space-x-2 text-cosmic-stellar">
                <span>★★★★★</span>
                <span className="text-sm text-zinc-500">4.9/5</span>
              </div>
            </div>
          </motion.div>
          
          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <GlassCard variant="cosmic" depth="deep" glow="medium" shimmer className="p-8">
              <div className="aspect-video bg-gradient-to-br from-cosmic-stellar/20 to-cosmic-nebula/20 rounded-2xl overflow-hidden relative">
                <video 
                  className="w-full h-full object-cover rounded-2xl"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                >
                  <source src="/bgvid.mp4" type="video/mp4" />
                  <div className="flex items-center justify-center h-full">
                    <div className="text-8xl animate-pulse">🎬</div>
                  </div>
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
              </div>
              <div className="mt-6 text-center">
                <div className="text-white font-semibold">Generative Media Interface</div>
                <div className="text-sm text-zinc-400 mt-1">Professional quality in minutes</div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
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