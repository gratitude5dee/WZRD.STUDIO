import { motion } from 'framer-motion';
import { Sparkles, Zap, Layout, Blocks } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'Create stunning visuals, videos, and content with advanced AI models at your fingertips.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate high-quality content in seconds with our optimized workflow engine.',
  },
  {
    icon: Layout,
    title: 'Visual Workflow Builder',
    description: 'Build complex creative workflows with our intuitive drag-and-drop interface.',
  },
  {
    icon: Blocks,
    title: 'Modular & Flexible',
    description: 'Connect different AI models and tools to create your perfect creative pipeline.',
  },
];

export default function Features() {
  return (
    <section className="py-24 px-4 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#e78a53]/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Everything you need to create, collaborate, and scale your creative workflows
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-[#e78a53]/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#e78a53] to-[#e78a53]/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-white/60 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
