
import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

export const HeroSection = () => {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center text-center px-4">
      {/* Cosmic background */}
      <div className="absolute inset-0 bg-black z-0">
        <div className="absolute inset-0 bg-cosmic-void/10" />
        <div className="absolute inset-0 particle-field opacity-15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_50%)]" />
      </div>
      
      {/* Cosmic floating orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-cosmic-stellar/20 rounded-full animate-float blur-3xl"></div>
      <div className="absolute top-40 right-20 w-48 h-48 bg-cosmic-nebula/20 rounded-full animate-float blur-3xl" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-cosmic-plasma/20 rounded-full animate-float blur-3xl" style={{ animationDelay: '2s' }}></div>
      
      {/* Content */}
      <div className="z-10 max-w-4xl">
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-white">Create.</span>
          <span className="text-white">Generate.</span>
          <span className="text-white">Innovate.</span>
        </motion.h1>

        <motion.h2 
          className="text-5xl md:text-7xl font-bold mb-10 bg-gradient-to-r from-cosmic-stellar via-cosmic-plasma to-cosmic-nebula bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          AI-Powered Media
        </motion.h2>

        <motion.p 
          className="text-xl text-zinc-400 max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Transform your creative vision into reality with cutting-edge AI technology.
          Generate images, videos, and multimedia content in minutes - no expertise required.
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 flex flex-col items-center cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        onClick={scrollToContent}
      >
        <span className="text-zinc-500 mb-2">Scroll to explore</span>
        <ArrowDown className="text-zinc-500 animate-bounce" />
      </motion.div>
    </section>
  );
};
