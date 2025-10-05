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
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5 px-2 py-1 bg-zinc-900/50 border border-zinc-800 rounded-md">
        <span className="text-xs font-medium text-zinc-300 min-w-[24px] text-center">
          {value}:{value}
        </span>
      </div>
      <div className="flex flex-col">
        <button
          onClick={(e) => {
            e.stopPropagation();
            increment();
          }}
          disabled={value >= max}
          className="p-0.5 hover:bg-zinc-800/50 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Increase count"
        >
          <ChevronUp className="w-3 h-3 text-zinc-400" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            decrement();
          }}
          disabled={value <= min}
          className="p-0.5 hover:bg-zinc-800/50 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Decrease count"
        >
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>
      </div>
    </div>
  );
};
