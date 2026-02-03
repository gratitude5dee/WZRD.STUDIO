
import { ArrowDown, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { enableDemoMode } from "@/utils/demoMode";

export const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  const handleStartDemo = () => {
    enableDemoMode();
    navigate('/home');
  };

  return (
    <section className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center text-center px-4 py-20">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.3), transparent),
            radial-gradient(ellipse 50% 35% at 50% 0%, rgba(236, 72, 153, 0.12), transparent 60%),
            #000000
          `,
        }}
      />
      
      {/* Cosmic floating orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full animate-float blur-3xl"></div>
      <div className="absolute top-40 right-20 w-48 h-48 bg-pink-500/20 rounded-full animate-float blur-3xl" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-purple-600/20 rounded-full animate-float blur-3xl" style={{ animationDelay: '2s' }}></div>
      
      {/* Content */}
      <div className="z-10 max-w-5xl w-full">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-purple-400">✦</span>
          <span className="text-sm text-white/90">AI-Powered Workflow Studio</span>
        </motion.div>

        <motion.h1 
          className="text-7xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-white">WZRD</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">FLOW</span>
        </motion.h1>

        <motion.p 
          className="text-lg md:text-xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Create stunning AI-generated content with our Creator Dashboard. Perfect for creators, 
          designers, developers, and builders who want to bring their ideas to life.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button
            size="lg"
            onClick={handleStartDemo}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-10 py-7 text-lg shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 font-semibold"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Try Demo
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/login?mode=signup')}
            className="border-white/20 text-white hover:bg-white/10 px-10 py-7 text-lg backdrop-blur-sm font-semibold"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.p 
          className="text-white/50 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          ✨ No credit card required • 🎨 Start creating in seconds • 🔒 100% secure
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 flex flex-col items-center cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        onClick={scrollToContent}
      >
        <span className="text-zinc-500 mb-2 text-sm">Scroll to explore</span>
        <ArrowDown className="text-zinc-500 animate-bounce w-5 h-5" />
      </motion.div>
    </section>
  );
};
