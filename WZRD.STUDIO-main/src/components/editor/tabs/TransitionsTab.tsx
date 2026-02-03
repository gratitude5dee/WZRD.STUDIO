import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, Layers } from 'lucide-react';

interface Transition {
  id: string;
  name: string;
  type: 'fade' | 'dissolve' | 'wipe' | 'slide' | 'zoom' | 'blur';
  duration: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}

interface TransitionsTabProps {
  onSelectTransition: (transition: Transition) => void;
}

const transitions: Transition[] = [
  { id: 'fade', name: 'Fade', type: 'fade', duration: 500 },
  { id: 'dissolve', name: 'Dissolve', type: 'dissolve', duration: 750 },
  { id: 'wipe-left', name: 'Wipe Left', type: 'wipe', duration: 500, direction: 'left' },
  { id: 'wipe-right', name: 'Wipe Right', type: 'wipe', duration: 500, direction: 'right' },
  { id: 'wipe-up', name: 'Wipe Up', type: 'wipe', duration: 500, direction: 'up' },
  { id: 'wipe-down', name: 'Wipe Down', type: 'wipe', duration: 500, direction: 'down' },
  { id: 'slide-left', name: 'Slide Left', type: 'slide', duration: 500, direction: 'left' },
  { id: 'slide-right', name: 'Slide Right', type: 'slide', duration: 500, direction: 'right' },
  { id: 'zoom-in', name: 'Zoom In', type: 'zoom', duration: 500 },
  { id: 'zoom-out', name: 'Zoom Out', type: 'zoom', duration: 500 },
  { id: 'blur', name: 'Blur', type: 'blur', duration: 600 },
];

export const TransitionsTab: React.FC<TransitionsTabProps> = ({ onSelectTransition }) => {
  const handleDragStart = useCallback(
    (e: React.DragEvent, transition: Transition) => {
      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'transition', data: transition }));
      e.dataTransfer.effectAllowed = 'copy';
    },
    []
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
          <Layers className="w-4 h-4" />
          <span>Drag a transition between clips</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {transitions.map((transition) => (
          <div
            key={transition.id}
            onClick={() => onSelectTransition(transition)}
            draggable
            onDragStart={(e) => handleDragStart(e, transition)}
            className={cn(
              'aspect-video bg-zinc-800 rounded-lg overflow-hidden cursor-pointer',
              'hover:ring-2 hover:ring-purple-500 transition-all',
              'flex flex-col items-center justify-center gap-2 p-3',
              'group'
            )}
          >
            {/* Transition Visual Preview */}
            <div className="relative w-full h-8 flex items-center justify-center">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded" />
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-300 font-medium">{transition.name}</p>
              <p className="text-[10px] text-zinc-500">{transition.duration}ms</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

TransitionsTab.displayName = 'TransitionsTab';
