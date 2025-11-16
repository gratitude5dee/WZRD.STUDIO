
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
    <section className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center text-center px-4">
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
      <div className="z-10 max-w-4xl">
        <motion.h1 
          className="text-6xl md:text-7xl font-bold mb-6 tracking-tight text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Create AI-Powered Videos
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mt-2">
            Without Limits
          </span>
        </motion.h1>

        <motion.p 
          className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Node-based AI workflow studio. Generate, edit, and export professional videos 
          using the latest AI models - all in your browser.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button
            size="lg"
            onClick={handleStartDemo}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Try Demo - No Signup Required
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/login?mode=signup')}
            className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm"
          >
            Sign Up Free
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
