import { motion } from 'framer-motion';
import { Search, Globe } from 'lucide-react';

export const HighPerformanceVisual = () => {
  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      {/* Search bar mockup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 shadow-2xl shadow-purple-500/20">
          <div className="flex items-center gap-4 mb-4">
            <Globe className="w-5 h-5 text-purple-400" />
            <input
              type="text"
              placeholder="Search the web..."
              className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none text-lg"
              readOnly
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </motion.button>
          </div>
          
          {/* Decorative elements */}
          <div className="flex items-center gap-3 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 text-purple-400">📎</div>
              <span>Attach</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 text-purple-400">✈️</div>
              <span>Send</span>
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl -z-10 rounded-2xl" />
      </motion.div>
    </div>
  );
};
