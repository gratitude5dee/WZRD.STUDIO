import { motion } from 'framer-motion';
import { Layers, Film, Image as ImageIcon, Wand2 } from 'lucide-react';

export const CreativeSuiteVisual = () => {
  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden rounded-xl">
      {/* Mockup of storyboard interface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-full bg-gradient-to-br from-pink-950/30 via-purple-950/20 to-black rounded-xl border border-pink-500/20 p-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-pink-400" />
            <span className="text-xs text-white/60">STORYBOARD</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-pink-500/20 rounded text-xs text-pink-400">
              Share
            </button>
          </div>
        </div>

        {/* Grid of thumbnails */}
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="aspect-square bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded border border-white/10 flex items-center justify-center"
            >
              {i % 3 === 0 ? (
                <ImageIcon className="w-3 h-3 text-pink-400/50" />
              ) : i % 3 === 1 ? (
                <Film className="w-3 h-3 text-purple-400/50" />
              ) : (
                <Wand2 className="w-3 h-3 text-blue-400/50" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="absolute left-4 top-16 w-16 space-y-2">
          <div className="w-8 h-8 bg-pink-500/20 rounded flex items-center justify-center">
            <Layers className="w-4 h-4 text-pink-400" />
          </div>
          <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
            <Film className="w-4 h-4 text-purple-400" />
          </div>
          <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-blue-400" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
