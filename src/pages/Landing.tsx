import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lightbulb, Wand, Image, Settings, Play, ChevronDown, Sparkles, MessageSquare, Database, Mic, Orbit, Atom, Zap, Star, Brain, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { PortalHeader } from '@/components/ui/portal-header';
import { Button } from '@/components/ui/button';
import TechBadge from '@/components/landing/TechBadge';
import TechHighlight from '@/components/landing/TechHighlight';
import FeatureCard from '@/components/landing/FeatureCard';
import FeatureHighlight from '@/components/landing/FeatureHighlight';
import TestimonialCard from '@/components/landing/TestimonialCard';
import PricingCard from '@/components/landing/PricingCard';
import TechLogoIcon from '@/components/landing/TechLogoIcon';
const Landing = () => {
  const navigate = useNavigate();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState('lyrical');
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = window.scrollY / totalHeight;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleGetStarted = () => {
    navigate('/login');
  };
  const fadeInUp = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };
  return <div className="bg-cosmic-void text-foreground relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="fixed inset-0 bg-nebula-field opacity-20 pointer-events-none" />
      <div className="fixed inset-0 particle-field opacity-15 pointer-events-none" />
      
      {/* Fixed progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-cosmic-void/50 z-50 backdrop-blur-sm">
        <motion.div className="h-full bg-gradient-to-r from-cosmic-stellar via-cosmic-plasma to-cosmic-quantum" style={{
        width: `${scrollProgress * 100}%`
      }} />
      </div>

      
      {/* Hero Section - Cosmic Portal */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Cosmic Background Layers */}
        <div className="absolute inset-0 bg-cosmic-void" />
        <div className="absolute inset-0 bg-stellar-burst opacity-30" />
        <div className="absolute inset-0 bg-quantum-flow opacity-20" />
        
        {/* Background video with cosmic filter */}
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-40" style={{
        filter: 'brightness(0.3) saturate(1.2) hue-rotate(220deg)'
      }}>
          <source src="/bgvid.mp4" type="video/mp4" />
        </video>

        {/* Cosmic particles overlay */}
        <div className="absolute inset-0 particle-field opacity-30 pointer-events-none" />
        
        {/* Content - Cosmic Portal Interface */}
        <div className="container mx-auto px-6 z-20 max-w-6xl relative">
          <motion.div className="text-center" initial="hidden" animate="visible" variants={{
          hidden: {
            opacity: 0
          },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2
            }
          }
        }}>
            {/* Cosmic Logo Portal */}
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4 mb-8">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cosmic-stellar to-cosmic-temporal flex items-center justify-center">
                  <Orbit className="w-8 h-8 text-cosmic-void animate-spin" style={{
                  animationDuration: '8s'
                }} />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-cosmic-nebula flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold glow-text-cosmic font-serif tracking-wide">WZRD.STUDIO</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-cosmic-stellar/20 text-cosmic-stellar px-2 py-0.5 rounded-full border border-cosmic-stellar/30">UniversalAI</span>
                  <span className="text-xs bg-cosmic-nebula/20 text-cosmic-nebula px-2 py-0.5 rounded-full border border-cosmic-nebula/30">ALPHA</span>
                </div>
              </div>
            </motion.div>
            
            
            {/* Cosmic Headline */}
            <motion.h2 variants={fadeInUp} className="text-5xl md:text-7xl font-bold mb-8 leading-tight glow-text-cosmic">
              AI-Powered Music Video Generator
            </motion.h2>
            
            {/* Sub-headline with stellar accent */}
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 font-light">
              Transform your audio tracks into stunning <span className="text-cosmic-stellar">music videos</span>, 
              <span className="text-cosmic-plasma"> lyrical visualizations</span>, and 
              <span className="text-cosmic-quantum"> promotional clips</span> with our cutting-edge generative media platform 
              powered by <span className="glow-text-primary">leading multi-modal image, audio, and video models</span>.
            </motion.p>
            
            {/* Cosmic CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <GlassButton onClick={handleGetStarted} variant="stellar" size="xl" glow="intense" particle className="w-full sm:w-auto min-w-[200px]">
                <Zap className="w-5 h-5" />
                Enter the Portal
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </GlassButton>
              
              <GlassButton variant="cosmic" onClick={() => setIsVideoModalOpen(true)} size="xl" glow="medium" className="w-full sm:w-auto min-w-[200px]">
                <Play className="w-4 h-4 fill-current" />
                Witness the Magic
              </GlassButton>
            </motion.div>

            {/* Tech stack badges */}
            <motion.div variants={fadeInUp} className="mt-12 flex flex-wrap justify-center gap-4">
              <TechBadge icon={<Sparkles className="w-4 h-4" />} name="Anthropic" description="Powered by Claude AI" color="text-purple-400" />
              <TechBadge icon={<MessageSquare className="w-4 h-4" />} name="Lovable" description="Rapid UI Development" color="text-rose-400" />
              <TechBadge icon={<Database className="w-4 h-4" />} name="Supabase" description="Secure Data Platform" color="text-emerald-400" />
              <TechBadge icon={<Mic className="w-4 h-4" />} name="ElevenLabs" description="Voice Generation" color="text-blue-400" />
            </motion.div>

            {/* Scroll indicator */}
            <motion.div variants={fadeInUp} className="absolute bottom-10 left-0 right-0 flex justify-center" animate={{
            y: [0, 10, 0]
          }} transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}>
              <ChevronDown className="w-6 h-6 text-white/60" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Rest of sections */}
      
      {/* How it Works Section */}
      <section className="py-24 relative z-20 bg-[#0A0D16]/90">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-100px"
        }} variants={{
          hidden: {
            opacity: 0
          },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2
            }
          }
        }} className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4 text-white">
              How It Works
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Create stunning music videos from your audio tracks in four simple steps
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <FeatureCard icon={<Lightbulb className="w-8 h-8 text-yellow-400" />} title="Upload Your Song" description="Start with any audio track. Our AI analyzes lyrics, beat patterns, and musical mood to understand your song's essence." delay={0.1} techBadge="Advanced Generative AI" />
            
            {/* Step 2 */}
            <FeatureCard icon={<Wand className="w-8 h-8 text-purple-400" />} title="Generate Visuals" description="AI creates scenes that sync with your audio's rhythm and meaning using intelligent audio analysis." delay={0.2} techBadge="Intelligent Audio Analysis" />
            
            {/* Step 3 */}
            <FeatureCard icon={<Image className="w-8 h-8 text-blue-400" />} title="Customize & Refine" description="Fine-tune visual effects, scene transitions, and style elements with scalable cloud rendering." delay={0.3} techBadge="Scalable Cloud Rendering" />
            
            {/* Step 4 */}
            <FeatureCard icon={<Settings className="w-8 h-8 text-green-400" />} title="Export & Share" description="Render in HD with custom artist styles and share your professional music video across platforms." delay={0.4} techBadge="Custom Artist Styles" />
          </div>
        </div>
      </section>
      
      {/* Interactive Demo Section */}
      <section className="py-24 relative z-20 bg-gradient-to-b from-[#0A0D16] to-[#0F1320]">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-100px"
        }} variants={{
          hidden: {
            opacity: 0
          },
          visible: {
            opacity: 1
          }
        }} className="text-center mb-16">
            <motion.div variants={fadeInUp} className="inline-block text-sm font-medium text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full mb-3">
              Interactive Demo
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4 text-white">
              See the Magic in Action
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-zinc-300 max-w-2xl mx-auto mb-8">
              Explore how our platform transforms audio tracks into visual masterpieces
            </motion.p>
            
            {/* Demo navigation */}
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-2 mb-12">
              <Button variant={activeDemo === 'lyrical' ? 'default' : 'ghost'} className={activeDemo === 'lyrical' ? 'bg-purple-700' : 'hover:bg-white/5'} onClick={() => setActiveDemo('lyrical')}>
                Lyrical Visualization
              </Button>
              <Button variant={activeDemo === 'beat' ? 'default' : 'ghost'} className={activeDemo === 'beat' ? 'bg-purple-700' : 'hover:bg-white/5'} onClick={() => setActiveDemo('beat')}>
                Beat-Synced Motion
              </Button>
              <Button variant={activeDemo === 'scenery' ? 'default' : 'ghost'} className={activeDemo === 'scenery' ? 'bg-purple-700' : 'hover:bg-white/5'} onClick={() => setActiveDemo('scenery')}>
                AI-Generated Scenery
              </Button>
              <Button variant={activeDemo === 'style' ? 'default' : 'ghost'} className={activeDemo === 'style' ? 'bg-purple-700' : 'hover:bg-white/5'} onClick={() => setActiveDemo('style')}>
                Artist Style Transfer
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Demo showcase */}
          <motion.div initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-100px"
        }} variants={fadeInUp} className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div key={activeDemo} initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} transition={{
              duration: 0.3
            }} className="relative aspect-video bg-gradient-to-br from-[#0F1320] to-[#1D1E3A]">
                {/* Demo content would go here */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-6">
                    {activeDemo === 'lyrical' && <>
                        <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Lyrical Visualization</h3>
                        <p className="text-zinc-300 max-w-md mx-auto mb-4">AI interprets your lyrics and creates matching visual narratives that tell your song's story.</p>
                        <TechHighlight name="Advanced Generative AI" />
                      </>}
                    {activeDemo === 'beat' && <>
                        <MessageSquare className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Beat-Synced Motion</h3>
                        <p className="text-zinc-300 max-w-md mx-auto mb-4">Visual elements pulse and move in perfect sync with your music's rhythm and tempo.</p>
                        <TechHighlight name="Intelligent Audio Analysis" />
                      </>}
                    {activeDemo === 'scenery' && <>
                        <Mic className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">AI-Generated Scenery</h3>
                        <p className="text-zinc-300 max-w-md mx-auto mb-4">Dynamic backgrounds and environments based on your song's mood and energy.</p>
                        <TechHighlight name="Scalable Cloud Rendering" />
                      </>}
                    {activeDemo === 'style' && <>
                        <Database className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Artist Style Transfer</h3>
                        <p className="text-zinc-300 max-w-md mx-auto mb-4">Apply specific artistic styles to match your brand and create unique visual identities.</p>
                        <TechHighlight name="Custom Artist Styles" />
                      </>}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
      
      {/* Feature Deep Dive Section */}
      <section className="py-24 relative z-20 bg-gradient-to-b from-[#0F1320] to-[#0A0D16]">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-100px"
        }} variants={{
          hidden: {
            opacity: 0
          },
          visible: {
            opacity: 1
          }
        }} className="text-center mb-16">
            <motion.div variants={fadeInUp} className="inline-block text-sm font-medium text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full mb-3">
              Technology Stack
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Powered by Industry-Leading AI
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-zinc-300 max-w-2xl mx-auto">
              WZRD.STUDIO integrates cutting-edge technologies to deliver unmatched creative capabilities
            </motion.p>
          </motion.div>
          
          {/* Advanced Generative AI Feature */}
          <FeatureHighlight title="Advanced Generative AI" description="Our intelligent music and lyric analysis systems are powered by cutting-edge AI that understands musical structure, mood, and lyrical meaning. Transform any song into compelling visual narratives with nuanced understanding of rhythm and emotion." imageSrc="/lovable-uploads/1e1aab33-e5d2-4ef2-b40d-84a2e2679e3c.png" isImageRight={false} techBadge="Advanced Generative AI" techIcon={<Sparkles className="w-5 h-5" />} />
          
          {/* Intelligent Audio Analysis Feature */}
          <FeatureHighlight title="Intelligent Audio Analysis" description="Real-time beat detection and mood mapping technology analyzes your audio tracks to identify tempo, key changes, emotional peaks, and lyrical themes. Our system creates perfectly synchronized visual elements that pulse and move with your music." imageSrc="/lovable-uploads/96cbbf8f-bdb1-4d37-9c62-da1306d5fb96.png" isImageRight={true} techBadge="Intelligent Audio Analysis" techIcon={<MessageSquare className="w-5 h-5" />} />
          
          {/* Scalable Cloud Rendering Feature */}
          <FeatureHighlight title="Scalable Cloud Rendering" description="High-performance video processing infrastructure ensures your music videos render quickly and efficiently. Process multiple tracks simultaneously while maintaining 4K quality, with secure storage and collaboration features for teams." imageSrc="/lovable-uploads/1e1aab33-e5d2-4ef2-b40d-84a2e2679e3c.png" isImageRight={false} techBadge="Scalable Cloud Rendering" techIcon={<Database className="w-5 h-5" />} />
          
          {/* Custom Artist Styles Feature */}
          <FeatureHighlight title="Custom Artist Styles" description="Personalized visual style generation allows you to create unique artistic identities for your music videos. Choose from preset styles or train custom looks that match your brand, ensuring every video reflects your artistic vision." imageSrc="/lovable-uploads/96cbbf8f-bdb1-4d37-9c62-da1306d5fb96.png" isImageRight={true} techBadge="Custom Artist Styles" techIcon={<Mic className="w-5 h-5" />} />
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-24 relative z-20 bg-[#0A0D16]">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-100px"
        }} variants={{
          hidden: {
            opacity: 0
          },
          visible: {
            opacity: 1
          }
        }} className="text-center mb-16">
            <motion.div variants={fadeInUp} className="inline-block text-sm font-medium text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full mb-3">
              Testimonials
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4 text-white">
              What Musicians Are Saying
            </motion.h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard quote="WZRD.STUDIO transformed my bedroom recordings into professional music videos in minutes. The beat-sync technology is incredible!" author="Alex Rivera" title="Independent Musician" delay={0.1} />
            <TestimonialCard quote="The AI perfectly captures the mood of my tracks. Every visual perfectly matches my drops and builds - it's like having a video director who truly understands electronic music." author="DJ Luna" title="Electronic Producer" delay={0.2} />
            <TestimonialCard quote="We went from having no budget for music videos to creating viral content that perfectly captures our sound. The lyrical visualization feature is pure magic." author="The Midnight Collective" title="Indie Rock Band" delay={0.3} />
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-24 relative z-20 bg-gradient-to-b from-[#0A0D16] to-[#0F1320]">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-100px"
        }} variants={{
          hidden: {
            opacity: 0
          },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2
            }
          }
        }} className="text-center mb-16">
            <motion.div variants={fadeInUp} className="inline-block text-sm font-medium text-green-400 bg-green-400/10 px-3 py-1 rounded-full mb-3">
              Pricing
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Pay only for what you use with our credit-based system
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard title="Starter" price="Free" description="Perfect for trying out music video generation" features={["100 free credits upon signup", "Basic music video generation", "Beat detection", "Standard visual effects", "Community support"]} ctaText="Get Started Free" ctaAction={handleGetStarted} popular={false} delay={0.1} />
            
            <PricingCard title="Creator" price="$29" description="For serious musicians and content creators" features={["2,500 credits per month", "Advanced lyric analysis", "Custom style presets", "Full HD video output", "Social media formats", "Priority support"]} ctaText="Sign Up Now" ctaAction={handleGetStarted} popular={true} delay={0.2} />
            
            <PricingCard title="Studio" price="$99" description="For labels and production companies" features={["10,000 credits per month", "4K video output", "Multi-track audio support", "Brand customization", "Advanced motion graphics", "Dedicated support"]} ctaText="Contact Sales" ctaAction={handleGetStarted} popular={false} delay={0.3} />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative z-20 bg-gradient-to-b from-[#0F1320] to-[#0A0D16]">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-100px"
        }} variants={{
          hidden: {
            opacity: 0
          },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2
            }
          }
        }}>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Start Creating Today
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-zinc-300 mb-8">
              Join thousands of creators already using WZRD.STUDIO to bring their stories to life.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Button onClick={handleGetStarted} className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-6 rounded-md shadow-glow-purple-sm hover:shadow-glow-purple-md transition-all-std group" size="lg">
                Sign Up & Get Free Credits <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="mt-8 flex justify-center gap-6">
              <TechLogoIcon type="kling" />
              <TechLogoIcon type="luma" />
              <TechLogoIcon type="hailou" />
              <TechLogoIcon type="runway" />
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 px-6 bg-[#080B13] text-zinc-400 relative z-20 border-t border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-yellow-300/80 tracking-tight font-serif mb-4">WZRD.STUDIO</h3>
              <p className="text-sm text-zinc-500 mb-4">AI-Powered Music Video Generator</p>
              <div className="flex gap-4">
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-white">Platform</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Access</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-white">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-white">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-zinc-500">© 2025 WZRD.STUDIO. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;