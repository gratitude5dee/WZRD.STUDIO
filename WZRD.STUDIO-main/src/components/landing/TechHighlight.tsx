
import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, MessageSquare, Database, Mic } from 'lucide-react';

interface TechHighlightProps {
  name: string;
}

export const TechHighlight = ({ name }: TechHighlightProps) => {
  const getIconAndColor = () => {
    switch (name) {
      case 'Kling AI':
        return { icon: <Sparkles className="w-4 h-4" />, color: 'bg-purple-400/20 text-purple-400' };
      case 'Luma':
        return { icon: <MessageSquare className="w-4 h-4" />, color: 'bg-rose-400/20 text-rose-400' };
      case 'Hailou AI':
        return { icon: <Database className="w-4 h-4" />, color: 'bg-emerald-400/20 text-emerald-400' };
      case 'Runway':
        return { icon: <Mic className="w-4 h-4" />, color: 'bg-blue-400/20 text-blue-400' };
      default:
        return { icon: <Sparkles className="w-4 h-4" />, color: 'bg-gray-400/20 text-gray-400' };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <div className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm", color)}>
      {icon}
      <span>{name}</span>
    </div>
  );
};

export default TechHighlight;
