import { motion } from 'framer-motion';
import {
  Video,
  Music2,
  Wand2,
  TrendingUp,
  Sparkles,
  Clock,
  DollarSign,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Video,
    title: 'UGC at Scale',
    description:
      'Generate authentic user-generated content that converts. Create 100+ ad variations in the time it takes agencies to make one.',
    highlight: '100x faster',
    color: 'purple',
  },
  {
    icon: Music2,
    title: 'Music Video Production',
    description:
      'From visualizers to full narratives. Perfect for indie labels who need professional music videos without the $20K+ price tag.',
    highlight: 'Save 90%',
    color: 'violet',
  },
  {
    icon: Wand2,
    title: 'AI-Powered Creative',
    description:
      'Let AI handle the heavy lifting. Generate storyboards, visuals, and edits from a simple text prompt or reference.',
    highlight: 'Text to Video',
    color: 'indigo',
  },
  {
    icon: TrendingUp,
    title: 'Platform-Ready Formats',
    description:
      'Export optimized for TikTok, Instagram, YouTube Shorts, and paid ads. Every aspect ratio, every platform, instantly.',
    highlight: 'All Platforms',
    color: 'purple',
  },
  {
    icon: Clock,
    title: 'Hours, Not Weeks',
    description:
      'What takes traditional production weeks, WZRD delivers in hours. Rapid iteration means you can test more, learn faster.',
    highlight: '48hr Turnaround',
    color: 'violet',
  },
  {
    icon: DollarSign,
    title: 'Agency Costs, Eliminated',
    description:
      'Stop paying agency markups for AI-generated content. Own your creative pipeline and scale without the overhead.',
    highlight: '10x ROI',
    color: 'indigo',
  },
];

export function FeatureGrid() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-32 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Why Creators Choose WZRD
          </span>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Replace Your Agency.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
              Keep Your Budget.
            </span>
          </h2>

          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            The same AI tools major studios use, now accessible to indie labels, DTC brands, and
            content teams who refuse to overpay.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={cn(
                'group relative p-8 rounded-2xl',
                'bg-gradient-to-b from-white/[0.05] to-transparent',
                'border border-white/[0.08]',
                'hover:border-purple-500/30 hover:bg-white/[0.08]',
                'transition-all duration-500',
              )}
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

              <div
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center mb-6',
                  'bg-purple-500/10 border border-purple-500/20',
                  'group-hover:bg-purple-500/20 group-hover:border-purple-500/30',
                  'transition-all duration-300',
                )}
              >
                <feature.icon className="w-7 h-7 text-purple-400" />
              </div>

              <span
                className={cn(
                  'inline-block px-2.5 py-1 rounded-md text-xs font-semibold mb-4',
                  'bg-purple-500/20 text-purple-300',
                )}
              >
                {feature.highlight}
              </span>

              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-white/50 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-white/40 mb-6">
            Join 500+ indie labels and brands already creating with WZRD
          </p>
          <a
            href="/login?mode=signup"
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
              'bg-white/5 border border-white/10',
              'hover:bg-white/10 text-white font-medium',
              'transition-all duration-300',
            )}
          >
            Start Free Trial
            <Zap className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default FeatureGrid;
