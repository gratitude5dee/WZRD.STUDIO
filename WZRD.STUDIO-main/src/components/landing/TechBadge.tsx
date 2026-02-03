
import React from 'react';
import { cn } from '@/lib/utils';

interface TechBadgeProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  color: string;
}

export const TechBadge = ({ 
  icon, 
  name, 
  description, 
  color 
}: TechBadgeProps) => {
  const updatedName = (() => {
    switch (name) {
      case 'Anthropic': return 'Kling AI';
      case 'Lovable': return 'Luma';
      case 'Supabase': return 'Hailou AI';
      case 'ElevenLabs': return 'Runway';
      default: return name;
    }
  })();

  return (
    <div className={cn("inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full", color)}>
      {icon}
      <span className="text-sm font-medium text-white">{updatedName}</span>
    </div>
  );
};

export default TechBadge;
