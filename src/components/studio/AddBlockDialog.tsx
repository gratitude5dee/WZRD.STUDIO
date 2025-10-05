import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Type, Image, Video, Upload, ArrowUp, ArrowDown } from 'lucide-react';
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
        className="bg-zinc-900/95 backdrop-blur-sm border-zinc-800 p-0 max-w-md"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800">
          <DialogTitle className="text-white text-lg font-medium">Add Block</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="space-y-1 mb-6">
            {blockOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.type}
                  onClick={() => onSelectBlockType(option.type)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors",
                    selectedIndex === index
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <kbd className="px-2 py-1 text-xs bg-zinc-800 rounded border border-zinc-700 text-zinc-400">
                    {option.shortcut}
                  </kbd>
                </button>
              );
            })}
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Add Source
            </h3>
            <button
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-colors"
              onClick={() => {
                // Future upload functionality
                onClose();
              }}
            >
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5" />
                <span className="text-sm font-medium">Upload</span>
              </div>
              <kbd className="px-2 py-1 text-xs bg-zinc-800 rounded border border-zinc-700 text-zinc-400">
                U
              </kbd>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              <ArrowDown className="w-3 h-3" />
              <span>to navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">Enter</kbd>
              <span>to select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">Esc</kbd>
              <span>to close</span>
            </div>
          </div>
          <a
            href="https://docs.lovable.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Learn about Blocks
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
