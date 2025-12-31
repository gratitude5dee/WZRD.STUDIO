import React, { useCallback } from 'react';
import {
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  ArrowRight,
  Hexagon,
  Pentagon,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Element {
  id: string;
  name: string;
  type: 'shape' | 'line' | 'icon';
  shape?: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

interface ElementsTabProps {
  onSelectElement: (element: Element) => void;
}

const shapes: Element[] = [
  { id: 'rectangle', name: 'Rectangle', type: 'shape', shape: 'rectangle', icon: Square, color: '#8B5CF6' },
  { id: 'circle', name: 'Circle', type: 'shape', shape: 'circle', icon: Circle, color: '#3B82F6' },
  { id: 'triangle', name: 'Triangle', type: 'shape', shape: 'triangle', icon: Triangle, color: '#10B981' },
  { id: 'star', name: 'Star', type: 'shape', shape: 'star', icon: Star, color: '#F59E0B' },
  { id: 'heart', name: 'Heart', type: 'shape', shape: 'heart', icon: Heart, color: '#EF4444' },
  { id: 'hexagon', name: 'Hexagon', type: 'shape', shape: 'hexagon', icon: Hexagon, color: '#6366F1' },
  { id: 'pentagon', name: 'Pentagon', type: 'shape', shape: 'pentagon', icon: Pentagon, color: '#EC4899' },
  { id: 'arrow', name: 'Arrow', type: 'shape', shape: 'arrow', icon: ArrowRight, color: '#14B8A6' },
];

const lines: Element[] = [
  { id: 'line-solid', name: 'Solid Line', type: 'line', shape: 'solid', icon: Minus, color: '#FFFFFF' },
  { id: 'line-dashed', name: 'Dashed Line', type: 'line', shape: 'dashed', icon: Minus, color: '#FFFFFF' },
  { id: 'line-dotted', name: 'Dotted Line', type: 'line', shape: 'dotted', icon: Minus, color: '#FFFFFF' },
];

export const ElementsTab: React.FC<ElementsTabProps> = ({ onSelectElement }) => {
  const handleDragStart = useCallback(
    (e: React.DragEvent, element: Element) => {
      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'element', data: element }));
      e.dataTransfer.effectAllowed = 'copy';
    },
    []
  );

  const renderElementGrid = (elements: Element[], title: string) => (
    <div className="mb-6">
      <h3 className="text-xs text-zinc-400 mb-3 font-medium uppercase tracking-wide">{title}</h3>
      <div className="grid grid-cols-4 gap-2">
        {elements.map((element) => {
          const Icon = element.icon;
          return (
            <div
              key={element.id}
              onClick={() => onSelectElement(element)}
              draggable
              onDragStart={(e) => handleDragStart(e, element)}
              className={cn(
                'aspect-square bg-zinc-800 rounded-lg overflow-hidden cursor-pointer',
                'hover:ring-2 hover:ring-purple-500 transition-all',
                'flex items-center justify-center group'
              )}
            >
              {Icon && (
                <Icon
                  className="w-6 h-6 transition-transform group-hover:scale-110"
                  style={{ color: element.color }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="mb-4">
        <p className="text-xs text-zinc-400">
          Click or drag elements to add them to your composition
        </p>
      </div>

      {renderElementGrid(shapes, 'Shapes')}
      {renderElementGrid(lines, 'Lines')}

      {/* Color Swatches */}
      <div className="mb-6">
        <h3 className="text-xs text-zinc-400 mb-3 font-medium uppercase tracking-wide">
          Quick Colors
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            '#FFFFFF',
            '#000000',
            '#EF4444',
            '#F59E0B',
            '#10B981',
            '#3B82F6',
            '#8B5CF6',
            '#EC4899',
            '#6366F1',
            '#14B8A6',
          ].map((color) => (
            <div
              key={color}
              className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-700 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() =>
                onSelectElement({
                  id: `color-${color}`,
                  name: 'Color Block',
                  type: 'shape',
                  shape: 'rectangle',
                  icon: Square,
                  color,
                })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

ElementsTab.displayName = 'ElementsTab';
