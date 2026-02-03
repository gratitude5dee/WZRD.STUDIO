import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function NewReleasePromo() {
  return (
    <section className="py-24 px-4 bg-black relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative p-12 rounded-3xl border border-[#8b5cf6]/30 bg-gradient-to-br from-[#8b5cf6]/10 via-black to-black overflow-hidden"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6]/20 via-transparent to-[#8b5cf6]/20 animate-pulse pointer-events-none" />
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-white font-medium">New Release</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Experience the Future of Creative Workflows
            </h2>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              Try our new AI-powered studio with enhanced models, faster processing, and intuitive workflow design.
            </p>
            
            <Link to="/demo">
              <button className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-bold rounded-full bg-gradient-to-b from-[#8b5cf6] to-[#7c3aed] text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-200">
                Try Demo Now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
