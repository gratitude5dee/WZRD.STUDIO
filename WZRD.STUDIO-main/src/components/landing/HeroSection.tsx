import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MotionBackground } from './MotionBackground';

interface HeroSectionProps {
  headline: string;
  subheadline: string;
}

export function HeroSection({ headline, subheadline }: HeroSectionProps) {
  return (
    <section className="relative min-h-[100vh] lg:min-h-[110vh] flex items-center justify-center overflow-hidden">
      <MotionBackground intensity="medium" />

      <div className="relative z-10 container mx-auto px-4 py-32 lg:py-40">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full',
                'bg-purple-500/10 border border-purple-500/20',
                'text-sm text-purple-300 font-medium',
                'backdrop-blur-sm',
              )}
            >
              <Sparkles className="w-4 h-4" />
              Now in Public Beta
              <ArrowRight className="w-3 h-3" />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={cn(
              'text-5xl sm:text-6xl lg:text-7xl xl:text-8xl',
              'font-bold tracking-tight',
              'bg-clip-text text-transparent',
              'bg-gradient-to-b from-white via-white to-white/60',
              'leading-[1.1] mb-8',
            )}
          >
            {headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={cn(
              'text-lg sm:text-xl lg:text-2xl',
              'text-white/60 max-w-3xl mx-auto',
              'leading-relaxed mb-12',
            )}
          >
            {subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/login?mode=signup"
              className={cn(
                'group relative inline-flex items-center gap-3',
                'px-8 py-4 rounded-xl',
                'bg-gradient-to-r from-purple-600 to-purple-700',
                'hover:from-purple-500 hover:to-purple-600',
                'text-white font-semibold text-lg',
                'shadow-[0_0_40px_rgba(139,92,246,0.3)]',
                'hover:shadow-[0_0_60px_rgba(139,92,246,0.5)]',
                'transition-all duration-300',
                'hover:-translate-y-1',
              )}
            >
              <Zap className="w-5 h-5" />
              Start Creating Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/demo"
              className={cn(
                'inline-flex items-center gap-3',
                'px-8 py-4 rounded-xl',
                'bg-white/5 border border-white/10',
                'hover:bg-white/10 hover:border-white/20',
                'text-white font-medium text-lg',
                'backdrop-blur-sm',
                'transition-all duration-300',
              )}
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-white/40">
              Trusted by <span className="text-white/60 font-medium">500+</span> creators and brands
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-white/30 uppercase tracking-widest">Scroll</span>
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-3 rounded-full bg-purple-400"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
