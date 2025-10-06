import React from 'react';
import { Video, Volume2, Image as ImageIcon, LucideIcon } from 'lucide-react';

interface TimelineTrackProps {
  type: 'video' | 'audio' | 'effects';
  label: string;
  children?: React.ReactNode;
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({ type, label, children }) => {
  const getTrackIcon = (): LucideIcon => {
    switch (type) {
      case 'video':
        return Video;
      case 'audio':
        return Volume2;
      default:
        return ImageIcon;
    }
  };

  const Icon = getTrackIcon();

  return (
    <div className="h-16 border-b border-zinc-800/40 flex items-center relative">
      {/* Track Label */}
      <div className="w-20 flex-none bg-zinc-900/90 backdrop-blur-sm h-full border-r border-zinc-800/40 flex items-center justify-center gap-2 flex-col">
        <div className="w-8 h-8 rounded-md bg-zinc-800/50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-zinc-400" />
        </div>
        <span className="text-[10px] font-medium text-zinc-400">{label}</span>
      </div>
      
      {/* Track Content Area */}
      <div 
        className="flex-1 h-full relative"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(113, 113, 122, 0.08) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default TimelineTrack;
