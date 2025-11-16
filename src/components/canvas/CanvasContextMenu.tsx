import { useEffect, useState } from 'react';
import { Copy, Scissors, Trash2, ArrowUp, ArrowDown, Download, Sparkles } from 'lucide-react';
import { useCanvasStore } from '@/lib/stores/canvas-store';
import { toast } from 'sonner';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAiTransform?: () => void;
}

export function CanvasContextMenu({ x, y, onClose, onAiTransform }: CanvasContextMenuProps) {
  const { selectedIds, copy, paste, duplicate, deleteSelected, bringToFront, sendToBack } = useCanvasStore();
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    // Adjust position if menu would go off screen
    const menuWidth = 200;
    const menuHeight = 300;
    const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
    const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y;
    setPosition({ x: adjustedX, y: adjustedY });
  }, [x, y]);

  const handleAction = (action: () => void, message?: string) => {
    action();
    if (message) toast.success(message);
    onClose();
  };

  const hasSelection = selectedIds.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className="fixed z-[60] w-52 bg-background border rounded-lg shadow-lg py-1"
        style={{ left: position.x, top: position.y }}
      >
        {hasSelection ? (
          <>
            <MenuItem
              icon={<Copy className="w-4 h-4" />}
              label="Copy"
              shortcut="⌘C"
              onClick={() => handleAction(copy, 'Copied to clipboard')}
            />
            <MenuItem
              icon={<Scissors className="w-4 h-4" />}
              label="Duplicate"
              shortcut="⌘D"
              onClick={() => handleAction(duplicate, 'Duplicated selection')}
            />
            <div className="h-px bg-border my-1" />
            <MenuItem
              icon={<ArrowUp className="w-4 h-4" />}
              label="Bring to Front"
              shortcut="⌘]"
              onClick={() => {
                selectedIds.forEach(id => bringToFront(id));
                handleAction(() => {}, 'Moved to front');
              }}
            />
            <MenuItem
              icon={<ArrowDown className="w-4 h-4" />}
              label="Send to Back"
              shortcut="⌘["
              onClick={() => {
                selectedIds.forEach(id => sendToBack(id));
                handleAction(() => {}, 'Moved to back');
              }}
            />
            <div className="h-px bg-border my-1" />
            {onAiTransform && (
              <MenuItem
                icon={<Sparkles className="w-4 h-4" />}
                label="AI Transform"
                onClick={() => {
                  onAiTransform();
                  onClose();
                }}
              />
            )}
            <MenuItem
              icon={<Download className="w-4 h-4" />}
              label="Export Selection"
              onClick={() => handleAction(() => {}, 'Export coming soon')}
            />
            <div className="h-px bg-border my-1" />
            <MenuItem
              icon={<Trash2 className="w-4 h-4" />}
              label="Delete"
              shortcut="⌫"
              onClick={() => handleAction(deleteSelected, `Deleted ${selectedIds.length} object(s)`)}
              danger
            />
          </>
        ) : (
          <>
            <MenuItem
              icon={<Copy className="w-4 h-4" />}
              label="Paste"
              shortcut="⌘V"
              onClick={() => handleAction(paste, 'Pasted from clipboard')}
            />
            <div className="h-px bg-border my-1" />
            <MenuItem
              icon={<Sparkles className="w-4 h-4" />}
              label="Generate Here"
              onClick={() => {
                onAiTransform?.();
                onClose();
              }}
            />
          </>
        )}
      </div>
    </>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, shortcut, onClick, danger }: MenuItemProps) {
  return (
    <button
      className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent ${
        danger ? 'text-destructive hover:text-destructive' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      {shortcut && (
        <span className="text-xs text-muted-foreground">{shortcut}</span>
      )}
    </button>
  );
}
