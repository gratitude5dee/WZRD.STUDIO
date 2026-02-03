
import React from 'react';
import { Sparkles, MessageSquare, Database, Mic } from 'lucide-react';

interface TechLogoIconProps {
  type: 'kling' | 'luma' | 'hailou' | 'runway';
}

export const TechLogoIcon = ({ type }: TechLogoIconProps) => {
  const getIcon = () => {
    switch (type) {
      case 'kling':
        return <Sparkles className="w-6 h-6 text-purple-400" />;
      case 'luma':
        return <MessageSquare className="w-6 h-6 text-rose-400" />;
      case 'hailou':
        return <Database className="w-6 h-6 text-emerald-400" />;
      case 'runway':
        return <Mic className="w-6 h-6 text-blue-400" />;
    }
  };

  const getName = () => {
    switch (type) {
      case 'kling':
        return 'Kling AI';
      case 'luma':
        return 'Luma';
      case 'hailou':
        return 'Hailou AI';
      case 'runway':
        return 'Runway';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/5 rounded-full p-3 mb-2">
        {getIcon()}
      </div>
      <span className="text-xs text-zinc-500">{getName()}</span>
    </div>
  );
};

export default TechLogoIcon;
