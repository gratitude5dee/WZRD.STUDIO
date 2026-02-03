import { motion } from 'framer-motion';
import { Music2, ShoppingBag, Megaphone, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

const useCases = [
  {
    icon: Music2,
    title: 'Indie Labels',
    subtitle: 'Music Videos & Visualizers',
    description:
      'Turn tracks into stunning visuals. Create lyric videos, album visualizers, and full music videos without hiring a production crew.',
    stats: '80% cost reduction vs. traditional production',
    image: '/images/use-case-music.jpg',
  },
  {
    icon: ShoppingBag,
    title: 'DTC Brands',
    subtitle: 'Product Ads & Social Content',
    description:
      'Generate product videos, lifestyle content, and ad creatives at scale. Test 50 variations instead of betting on one.',
    stats: '10x more creative variants',
  },
  {
    icon: Megaphone,
    title: 'Content Agencies',
    subtitle: 'Client Work at Scale',
    description:
      'Deliver more to clients without growing headcount. WZRD handles the production, you handle the strategy.',
    stats: '5x client capacity',
  },
  {
    icon: Film,
    title: 'UGC Studios',
    subtitle: 'Authentic Content Creation',
    description:
      'Create UGC-style content that feels native to each platform. Perfect for brands that need volume with authenticity.',
    stats: '100+ videos per week',
  },
];

export function UseCasesSection() {
  return (
    <section className="py-32 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Built for Creators Who{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
              Move Fast
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Whether you&apos;re launching an album or scaling ad spend, WZRD adapts to your
            creative workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={cn(
                'group relative p-8 rounded-2xl overflow-hidden',
                'bg-gradient-to-br from-white/[0.06] to-white/[0.02]',
                'border border-white/[0.08]',
                'hover:border-purple-500/30',
                'transition-all duration-500',
              )}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        'bg-purple-500/15 border border-purple-500/25',
                      )}
                    >
                      <useCase.icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{useCase.title}</h3>
                      <p className="text-sm text-purple-300">{useCase.subtitle}</p>
                    </div>
                  </div>
                </div>

                <p className="text-white/60 mb-6 leading-relaxed">{useCase.description}</p>

                <div
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                    'bg-purple-500/10 border border-purple-500/20',
                  )}
                >
                  <span className="text-sm font-semibold text-purple-300">{useCase.stats}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UseCasesSection;
