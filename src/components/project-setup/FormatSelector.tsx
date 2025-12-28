import React from 'react';
import { motion } from 'framer-motion';
import { Film, Megaphone, Music, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectFormat } from './types';

interface FormatOption {
  id: ProjectFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'custom',
    label: 'Custom',
    description: 'Full creative freedom for any project type',
    icon: <Sparkles className="w-6 h-6" />,
    gradient: 'from-purple-500/20 to-indigo-500/20',
  },
  {
    id: 'short_film',
    label: 'Short Film',
    description: 'Narrative-driven cinematic storytelling',
    icon: <Film className="w-6 h-6" />,
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'commercial',
    label: 'Commercial',
    description: 'Ad brief-driven marketing content',
    icon: <Megaphone className="w-6 h-6" />,
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    id: 'music_video',
    label: 'Music Video',
    description: 'Visual storytelling synced to audio',
    icon: <Music className="w-6 h-6" />,
    gradient: 'from-pink-500/20 to-rose-500/20',
  },
  {
    id: 'infotainment',
    label: 'Infotainment',
    description: 'Educational + entertainment content',
    icon: <BookOpen className="w-6 h-6" />,
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
];

interface FormatSelectorProps {
  selectedFormat: ProjectFormat;
  onFormatChange: (format: ProjectFormat) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onFormatChange,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {FORMAT_OPTIONS.map((option) => {
        const isSelected = selectedFormat === option.id;

        return (
          <motion.button
            key={option.id}
            onClick={() => onFormatChange(option.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'relative flex flex-col items-center p-4 rounded-xl border transition-all duration-300',
              'bg-gradient-to-br backdrop-blur-sm',
              option.gradient,
              isSelected
                ? 'border-primary/60 shadow-lg shadow-primary/20 ring-2 ring-primary/30'
                : 'border-white/10 hover:border-white/20'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors',
                isSelected
                  ? 'bg-primary/20 text-primary'
                  : 'bg-white/5 text-zinc-400'
              )}
            >
              {option.icon}
            </div>

            <h3
              className={cn(
                'font-medium text-sm mb-1 transition-colors',
                isSelected ? 'text-white' : 'text-zinc-300'
              )}
            >
              {option.label}
            </h3>

            <p className="text-xs text-zinc-500 text-center line-clamp-2">
              {option.description}
            </p>

            {isSelected && (
              <motion.div
                layoutId="format-indicator"
                className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                initial={false}
              >
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
