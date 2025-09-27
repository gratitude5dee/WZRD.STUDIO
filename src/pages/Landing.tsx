import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, ChevronDown, Sparkles, Brain, Zap, Star, Palette, Users, Trophy, Shield, Clock, TrendingUp, Music, Eye, Layers, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

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
    <div className="min-h-screen bg-gradient-to-br from-surface-dark via-refined-deep to-surface-light text-white overflow-x-hidden">
      {/* Refined mesh background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-mesh-pattern"></div>
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo size="lg" showVersion={false} />
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-white/80 hover:text-white transition-colors">Reviews</a>
            </div>
            <GlassButton
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-refined-rich to-refined-pink hover:scale-105 transition-transform shadow-lg"
            >
              Start Creating
            </GlassButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-refined-deep/30 via-transparent to-refined-rich/20"></div>
        
        {/* Subtle floating elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-refined-rich/10 rounded-full animate-float blur-2xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-refined-pink/10 rounded-full animate-float blur-2xl" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-refined-lavender/10 rounded-full animate-float blur-2xl" style={{ animationDelay: '2s' }}></div>
        
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
                <span className="block bg-gradient-to-r from-refined-rich via-refined-pink to-refined-lavender bg-clip-text text-transparent">
                  Music into Magic
                </span>
              </h1>
              
              <p className="text-xl text-white/80 max-w-xl leading-relaxed">
                Create stunning music videos with AI that understands your sound. 
                Professional results in minutes, not months.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <GlassButton
                onClick={handleGetStarted}
                size="xl"
                className="bg-gradient-to-r from-refined-rich to-refined-pink hover:scale-105 transition-all duration-300 shadow-xl"
              >
                Create Your First Video
              </GlassButton>
              <GlassButton 
                variant="ghost"
                size="xl"
                className="backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/15 transition-all"
              >
                Watch Demo
              </GlassButton>
            </div>
            
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-sm text-white/60">Trusted by 50K+ artists</div>
              <div className="flex space-x-2 text-refined-lavender">
                <span>★★★★★</span>
                <span className="text-sm text-white/60">4.9/5</span>
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
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-refined-rich/20 to-refined-pink/20 rounded-2xl flex items-center justify-center">
                <div className="text-8xl animate-pulse">🎬</div>
              </div>
              <div className="mt-6 text-center">
                <div className="text-white/80 font-semibold">AI Music Video Generator</div>
                <div className="text-sm text-white/60 mt-1">Professional quality in minutes</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="py-16 bg-gradient-to-r from-refined-rich/10 to-refined-pink/10">
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
                <div className="text-4xl font-bold text-refined-rich mb-2">50K+</div>
                <div className="text-white/60">Videos Created</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-refined-pink mb-2">2M+</div>
                <div className="text-white/60">Views Generated</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-refined-lavender mb-2">98%</div>
                <div className="text-white/60">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-refined-rich mb-2">4.9★</div>
                <div className="text-white/60">User Rating</div>
              </div>
            </div>
          </motion.div>
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
              <div className="space-y-4 text-white/80">
                <p className="text-lg">Professional music videos cost <span className="text-red-400 font-bold">$10,000-$50,000+</span></p>
                <p>Most musicians can't afford cinematic visuals for their art</p>
                <p>DIY videos lack the polish to compete on social platforms</p>
                <p>Traditional production takes weeks or months</p>
              </div>
              <div className="mt-8 p-6 backdrop-blur-16 bg-red-400/5 border border-red-400/30 rounded-xl">
                <div className="text-red-400 font-semibold mb-2">Reality Check:</div>
                <div className="text-sm text-white/60">90% of independent musicians never create a professional music video due to cost barriers</div>
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
              <h2 className="text-4xl font-bold mb-6 text-refined-rich">The AI Solution</h2>
              <div className="space-y-4 text-white/80">
                <p className="text-lg">Create <span className="text-refined-rich font-bold">Hollywood-quality videos</span> for under $30</p>
                <p>AI understands your music's emotion, rhythm, and lyrics</p>
                <p>Generate multiple concepts in minutes, not months</p>
                <p>Perfect sync with beat drops, mood changes, and crescendos</p>
              </div>
              <div className="mt-8 p-6 backdrop-blur-16 bg-refined-rich/5 border border-refined-rich/30 rounded-xl">
                <div className="text-refined-rich font-semibold mb-2">Game Changer:</div>
                <div className="text-sm text-white/60">Transform any bedroom recording into a viral-ready masterpiece</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative bg-refined-deep/20">
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
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
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
              <div className="w-20 h-20 bg-gradient-to-br from-refined-rich to-refined-pink rounded-full mx-auto mb-6 flex items-center justify-center text-3xl transform transition-all duration-300 group-hover:scale-110">
                🎵
              </div>
              <h3 className="text-xl font-bold mb-4 text-refined-rich">Upload & Analyze</h3>
              <p className="text-white/60">AI scans your track's BPM, key, mood, and lyrical themes in seconds</p>
              <div className="mt-4 text-xs text-refined-rich font-semibold">✨ Advanced Audio AI</div>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              data-reveal-id="step-2"
              className={cn(
                "text-center group transition-all duration-800 ease-out",
                scrollRevealed.includes('step-2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-refined-pink to-refined-lavender rounded-full mx-auto mb-6 flex items-center justify-center text-3xl transform transition-all duration-300 group-hover:scale-110">
                🧠
              </div>
              <h3 className="text-xl font-bold mb-4 text-refined-pink">Generate Concepts</h3>
              <p className="text-white/60">Multiple storylines and visual styles tailored to your genre and vibe</p>
              <div className="mt-4 text-xs text-refined-pink font-semibold">✨ Creative AI</div>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              data-reveal-id="step-3"
              className={cn(
                "text-center group transition-all duration-800 ease-out",
                scrollRevealed.includes('step-3') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-refined-lavender to-refined-rich rounded-full mx-auto mb-6 flex items-center justify-center text-3xl transform transition-all duration-300 group-hover:scale-110">
                🎬
              </div>
              <h3 className="text-xl font-bold mb-4 text-refined-lavender">Perfect Sync</h3>
              <p className="text-white/60">Visuals automatically sync to beat drops, vocals, and emotional peaks</p>
              <div className="mt-4 text-xs text-refined-lavender font-semibold">✨ Rhythm AI</div>
            </motion.div>
            
            {/* Step 4 */}
            <motion.div 
              data-reveal-id="step-4"
              className={cn(
                "text-center group transition-all duration-800 ease-out",
                scrollRevealed.includes('step-4') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              )}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-refined-rich to-refined-pink rounded-full mx-auto mb-6 flex items-center justify-center text-3xl transform transition-all duration-300 group-hover:scale-110">
                🚀
              </div>
              <h3 className="text-xl font-bold mb-4 text-refined-rich">Export & Dominate</h3>
              <p className="text-white/60">Download in 4K for platforms or social-optimized formats</p>
              <div className="mt-4 text-xs text-refined-rich font-semibold">✨ Cloud Rendering</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section id="features" className="py-24 relative">
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
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
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
              <div className="inline-block bg-refined-rich/20 text-refined-rich px-4 py-2 rounded-full text-sm font-semibold mb-4">
                🧠 Emotional Intelligence AI
              </div>
              <h3 className="text-4xl font-bold mb-6 text-white">Feels Your Music's Soul</h3>
              <p className="text-xl text-white/70 mb-6">
                Our AI doesn't just hear notes—it understands <span className="text-refined-rich">emotional context</span>. 
                Melancholy verses get intimate visuals, explosive choruses get dynamic action.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-refined-rich/30 rounded-full flex items-center justify-center">✓</div>
                  <span className="text-white/70">Mood detection from musical keys and progressions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-refined-rich/30 rounded-full flex items-center justify-center">✓</div>
                  <span className="text-white/70">Lyrical sentiment analysis for visual storytelling</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-refined-rich/30 rounded-full flex items-center justify-center">✓</div>
                  <span className="text-white/70">Dynamic adaptation to tempo and energy changes</span>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="aspect-video bg-gradient-to-br from-refined-rich/20 to-refined-pink/20 rounded-xl flex items-center justify-center">
                <div className="text-6xl animate-pulse">🎭</div>
              </div>
              <div className="mt-4 text-center text-sm text-white/60">
                AI analyzing emotional peaks in real-time
              </div>
            </motion.div>
          </div>
          
          {/* Feature 2: Beat Sync Mastery */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <motion.div 
              className="order-2 md:order-1 backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-video bg-gradient-to-br from-refined-pink/20 to-refined-lavender/20 rounded-xl flex items-center justify-center">
                <div className="text-6xl animate-bounce">🥁</div>
              </div>
              <div className="mt-4 text-center text-sm text-white/60">
                Perfect synchronization with every beat
              </div>
            </motion.div>
            <motion.div 
              className="order-1 md:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-block bg-refined-pink/20 text-refined-pink px-4 py-2 rounded-full text-sm font-semibold mb-4">
                🎵 Beat-Sync Mastery
              </div>
              <h3 className="text-4xl font-bold mb-6 text-white">Every Frame Matches Your Rhythm</h3>
              <p className="text-xl text-white/70 mb-6">
                Millisecond-perfect synchronization that makes your audience <span className="text-refined-pink">feel</span> the music. 
                Cuts, transitions, and effects align with your track's natural flow.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-refined-pink/30 rounded-full flex items-center justify-center">✓</div>
                  <span className="text-white/70">Advanced beat detection algorithms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-refined-pink/30 rounded-full flex items-center justify-center">✓</div>
                  <span className="text-white/70">Smart scene transitions on musical phrases</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-refined-pink/30 rounded-full flex items-center justify-center">✓</div>
                  <span className="text-white/70">Visual effects timed to instrumental solos</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 relative bg-refined-deep/20">
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
            <p className="text-xl text-white/60">Real stories from musicians who transformed their careers</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div 
              className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl hover:scale-105 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-refined-rich to-refined-pink rounded-full mr-4"></div>
                <div>
                  <div className="font-bold text-white">Alex Rivera</div>
                  <div className="text-sm text-white/60">@alexbeats • 2.1M followers</div>
                </div>
              </div>
              <p className="text-white/70 mb-4">
                "My bedroom track went from 500 views to 2.1M in 3 days after using WZRD.STUDIO. 
                The AI perfectly captured the dark synthwave vibe I was going for. Now I have a record deal."
              </p>
              <div className="text-refined-rich text-sm font-semibold">📈 +420,000% view increase</div>
            </motion.div>
            
            {/* Testimonial 2 */}
            <motion.div 
              className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl hover:scale-105 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-refined-pink to-refined-lavender rounded-full mr-4"></div>
                <div>
                  <div className="font-bold text-white">Luna Collective</div>
                  <div className="text-sm text-white/60">Indie Band • 150K monthly listeners</div>
                </div>
              </div>
              <p className="text-white/70 mb-4">
                "We spent our entire budget on recording. WZRD.STUDIO gave us Hollywood-level visuals for $29. 
                Our song 'Neon Dreams' is now our biggest hit."
              </p>
              <div className="text-refined-pink text-sm font-semibold">🎵 #1 on indie charts for 6 weeks</div>
            </motion.div>
            
            {/* Testimonial 3 */}
            <motion.div 
              className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl hover:scale-105 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-refined-lavender to-refined-rich rounded-full mr-4"></div>
                <div>
                  <div className="font-bold text-white">DJ Quantum</div>
                  <div className="text-sm text-white/60">Electronic Producer • 890K followers</div>
                </div>
              </div>
              <p className="text-white/70 mb-4">
                "The beat-sync is absolutely insane. Every drop, every build—perfectly matched. 
                My fans think I hired a team of 20 people. It's just me and WZRD.STUDIO."
              </p>
              <div className="text-refined-lavender text-sm font-semibold">🔥 Featured on Beatport top 10</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 relative">
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
            <p className="text-xl text-white/60">
              Professional results without the professional price tag
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <motion.div 
              className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl hover:scale-105 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-white">Starter</h3>
                <div className="text-5xl font-bold text-refined-rich">FREE</div>
                <p className="text-white/60 mt-2">Perfect for testing the magic</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-refined-rich/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/70">100 free credits (2-3 videos)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-refined-rich/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/70">720p HD output</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-refined-rich/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/70">Basic beat detection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-refined-rich/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/70">3 style presets</span>
                </div>
              </div>
              <GlassButton 
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-refined-rich to-refined-pink hover:scale-105 transition-transform"
              >
                Start Creating Now
              </GlassButton>
            </motion.div>
            
            {/* Creator Plan */}
            <motion.div 
              className="backdrop-blur-xl bg-white/5 border-2 border-refined-pink p-8 rounded-2xl hover:scale-105 transition-all duration-300 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-refined-pink px-4 py-1 rounded-full text-sm font-bold text-white">
                MOST POPULAR
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-white">Creator</h3>
                <div className="text-5xl font-bold text-refined-pink">$29</div>
                <p className="text-white/60 mt-2">For serious musicians</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-refined-pink/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/70">2,500 credits/month (50+ videos)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-refined-pink/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/70">4K Ultra HD output</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-refined-pink/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/70">Advanced lyric analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-refined-pink/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/70">50+ premium styles</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-refined-pink/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/70">Social media formats</span>
                </div>
              </div>
              <GlassButton 
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-refined-pink to-refined-lavender hover:scale-105 transition-transform"
              >
                Upgrade to Creator
              </GlassButton>
            </motion.div>
            
            {/* Studio Plan */}
            <motion.div 
              className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl hover:scale-105 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-white">Studio</h3>
                <div className="text-5xl font-bold text-refined-lavender">$99</div>
                <p className="text-white/60 mt-2">For labels & agencies</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-refined-lavender/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/70">10,000 credits/month (200+ videos)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-refined-lavender/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/70">8K cinema-grade output</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-refined-lavender/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/70">Custom style training</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-refined-lavender/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/70">Team collaboration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-refined-lavender/30 rounded-full flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/70">API access</span>
                </div>
              </div>
              <GlassButton 
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-refined-lavender to-refined-rich hover:scale-105 transition-transform"
              >
                Contact Sales
              </GlassButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative bg-gradient-to-b from-refined-deep to-surface-dark">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-6xl font-bold mb-6 text-white">
              Your Music Deserves More
            </h2>
            <p className="text-2xl text-white/70 mb-12">
              Join 50,000+ artists who chose to amplify their art with AI. 
              <br /><span className="text-refined-pink">Your breakthrough moment is one video away.</span>
            </p>
            
            <div className="space-y-4">
              <GlassButton
                onClick={handleGetStarted}
                size="xl"
                className="bg-gradient-to-r from-refined-rich via-refined-pink to-refined-lavender px-12 py-6 text-xl hover:scale-110 transition-all duration-300 shadow-2xl"
              >
                🚀 Start Your Free Trial Now
              </GlassButton>
              <p className="text-sm text-white/60">
                100 free credits • No credit card required • 2-minute setup
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-surface-dark border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="text-2xl font-bold text-white mb-4">
                WZRD.STUDIO
              </div>
              <p className="text-white/60 mb-4">
                Transforming music into visual magic with revolutionary AI technology.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/60 hover:text-white transition-colors">📘</a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">🐦</a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">📷</a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">🎵</a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Platform</h3>
              <div className="space-y-2 text-white/60">
                <a href="#" className="block hover:text-white transition-colors">Features</a>
                <a href="#" className="block hover:text-white transition-colors">Pricing</a>
                <a href="#" className="block hover:text-white transition-colors">API</a>
                <a href="#" className="block hover:text-white transition-colors">Integrations</a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Resources</h3>
              <div className="space-y-2 text-white/60">
                <a href="#" className="block hover:text-white transition-colors">Documentation</a>
                <a href="#" className="block hover:text-white transition-colors">Tutorials</a>
                <a href="#" className="block hover:text-white transition-colors">Community</a>
                <a href="#" className="block hover:text-white transition-colors">Blog</a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Company</h3>
              <div className="space-y-2 text-white/60">
                <a href="#" className="block hover:text-white transition-colors">About</a>
                <a href="#" className="block hover:text-white transition-colors">Careers</a>
                <a href="#" className="block hover:text-white transition-colors">Contact</a>
                <a href="#" className="block hover:text-white transition-colors">Privacy</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">© 2025 WZRD.STUDIO. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-white/60">
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
  );
};

export default Landing;