import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Type, Image, Video, Upload, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddBlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlockType: (type: 'text' | 'image' | 'video') => void;
  position: { x: number; y: number };
}

const blockOptions = [
  { type: 'text' as const, icon: Type, label: 'Text', shortcut: 'T' },
  { type: 'image' as const, icon: Image, label: 'Image', shortcut: 'I' },
  { type: 'video' as const, icon: Video, label: 'Video', shortcut: 'V' },
];

export const AddBlockDialog: React.FC<AddBlockDialogProps> = ({
  isOpen,
  onClose,
  onSelectBlockType,
  position,
}) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 't':
          e.preventDefault();
          onSelectBlockType('text');
          break;
        case 'i':
          e.preventDefault();
          onSelectBlockType('image');
          break;
        case 'v':
          e.preventDefault();
          onSelectBlockType('video');
          break;
        case 'escape':
          e.preventDefault();
          onClose();
          break;
        case 'arrowup':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(0, prev - 1));
          break;
        case 'arrowdown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(blockOptions.length - 1, prev + 1));
          break;
        case 'enter':
          e.preventDefault();
          onSelectBlockType(blockOptions[selectedIndex].type);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSelectBlockType, selectedIndex]);

  // Reset selected index when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md bg-zinc-900/95 backdrop-blur-xl border-zinc-800/50 p-0 gap-0 animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="pb-2">
            <h3 className="text-sm font-medium text-zinc-400">Add Block</h3>
          </div>

          {/* Block Options */}
          <div className="space-y-1">
            {blockOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.type}
                  onClick={() => onSelectBlockType(option.type)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-colors",
                    selectedIndex === index
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-normal">{option.label}</span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">{option.shortcut}</span>
                </button>
              );
            })}
          </div>

          {/* Add Source Section */}
          <div className="pt-2">
            <h4 className="text-xs font-medium text-zinc-500 mb-2 px-1">Add Source</h4>
            <button
              onClick={() => {
                // Future upload functionality
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <span className="text-sm font-normal">Upload</span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">U</span>
            </button>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <span className="font-mono">↑↓</span> Navigate
              </span>
              <span className="flex items-center gap-1">
                <span className="font-mono">↵</span> Select
              </span>
            </div>
            <button className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-400 transition-colors py-1">
              <Info className="w-3 h-3" />
              <span>Learn about Blocks</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
