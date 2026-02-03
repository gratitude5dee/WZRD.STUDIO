import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const ImageCountSelector: React.FC<ImageCountSelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 20,
  className
}) => {
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          decrement();
        }}
        disabled={value <= min}
        className="w-6 h-6 rounded-full bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center group"
        title="Decrease count"
      >
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
      </button>
      
      <div className="px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded-full backdrop-blur-sm">
        <span className="text-sm font-semibold text-zinc-200 min-w-[24px] text-center inline-block">
          {value}
        </span>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          increment();
        }}
        disabled={value >= max}
        className="w-6 h-6 rounded-full bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center group"
        title="Increase count"
      >
        <ChevronUp className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
      </button>
    </div>
  );
};
