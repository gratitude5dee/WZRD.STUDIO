import { motion } from 'framer-motion';
import { Music, Users, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UseCase {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  href: string;
}

const useCases: UseCase[] = [
  {
    icon: <Music className="w-8 h-8" />,
    title: 'Music Labels & Artists',
    description: 'Release-ready music videos in hours. Scale your visual content production without compromising creative control or quality.',
    cta: 'View case studies',
    href: '#testimonials'
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Content Creators',
    description: 'Multiply your output 10x. Transform raw footage into polished content with AI-assisted editing and automated post-production.',
    cta: 'Creator playbook',
    href: '#how-it-works'
  },
  {
    icon: <Building2 className="w-8 h-8" />,
    title: 'Production Companies',
    description: 'Scale video production without overhead. Enterprise tools for team collaboration, asset management, and workflow automation.',
    cta: 'Book enterprise demo',
    href: '/login'
  }
];

export const UseCasesSection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Built for Professionals
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Trusted by industry leaders across music, media, and entertainment
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group"
            >
              <div className="h-full bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 p-8 hover:border-zinc-700 transition-colors duration-300">
                <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 text-white group-hover:bg-zinc-700 transition-colors duration-300">
                  {useCase.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  {useCase.title}
                </h3>
                
                <p className="text-zinc-400 leading-relaxed mb-6">
                  {useCase.description}
                </p>
                
                <Button
                  variant="ghost"
                  className="text-white hover:text-white p-0 h-auto font-medium group/button"
                  asChild
                >
                  <a href={useCase.href} className="inline-flex items-center gap-2">
                    {useCase.cta}
                    <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform duration-200" />
                  </a>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
