import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Wand2, Layers, Share2, Sparkles, Film, Zap } from 'lucide-react';

const features = [
  {
    icon: Wand2,
    title: 'AI-Powered Generation',
    description: 'Direct the model with structured prompts, references, and instant visual feedback.',
  },
  {
    icon: Layers,
    title: 'Node-Based Workflow',
    description: 'Build modular pipelines that scale from single shots to full productions.',
  },
  {
    icon: Share2,
    title: 'Realtime Collaboration',
    description: 'Invite teammates, comment inline, and ship faster with synced playback.',
  },
  {
    icon: Sparkles,
    title: 'Cinematic Presets',
    description: 'Apply curated lighting, color, and motion presets inspired by modern studios.',
  },
  {
    icon: Film,
    title: 'Timeline Precision',
    description: 'Trim, layer, and remix assets with frame-accurate control across formats.',
  },
  {
    icon: Zap,
    title: 'Fast Iteration',
    description: 'Render previews in seconds and ship polished deliverables with confidence.',
  },
];

export const FeatureGrid = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Built for modern studios</p>
          <h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">
            Every feature optimized for speed and storytelling
          </h2>
          <p className="mt-4 text-base text-white/70">
            From node-based generation to collaborative reviews, WZRD keeps your team in flow.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.25)] backdrop-blur"
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-blue-500/10" />
              </div>
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 text-violet-200">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="relative z-10 mt-4 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="relative z-10 mt-2 text-sm text-white/60">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
