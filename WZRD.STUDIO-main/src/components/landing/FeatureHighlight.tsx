
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureHighlightProps {
  title: string;
  description: string;
  imageSrc: string;
  isImageRight: boolean;
  techBadge?: string;
  techIcon?: React.ReactNode;
}

export const FeatureHighlight = ({ 
  title, 
  description, 
  imageSrc, 
  isImageRight,
  techBadge,
  techIcon
}: FeatureHighlightProps) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      className={cn("flex flex-col md:flex-row items-center gap-8 mb-24", 
        isImageRight ? "md:flex-row-reverse" : ""
      )}
    >
      <div className="flex-1">
        {techBadge && techIcon && (
          <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full mb-4">
            <span className={getTechColor(techBadge)}>
              {techIcon}
            </span>
            <span className="text-sm">{techBadge}</span>
          </div>
        )}
        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">{title}</h3>
        <p className="text-lg text-zinc-300 mb-6">{description}</p>
        <Button variant="outline" className="border-white/20 hover:bg-white/10">
          Learn More <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 perspective-1000">
        <div className="transform-style-3d hover:rotateX-2 hover:rotateY-3 transition-all-std">
          <img 
            src={imageSrc} 
            alt={title} 
            className="rounded-lg shadow-2xl border border-white/10 w-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

const getTechColor = (tech: string) => {
  switch (tech) {
    case 'Anthropic':
      return 'text-purple-400';
    case 'Lovable':
      return 'text-rose-400';
    case 'Supabase':
      return 'text-emerald-400';
    case 'ElevenLabs':
      return 'text-blue-400';
    default:
      return 'text-white';
  }
};

export default FeatureHighlight;
