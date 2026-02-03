import React from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Undo2,
  Redo2,
  Trash2,
  Plus,
  Minus,
  Move,
  Link,
  Unlink,
  Edit3,
  Layers,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHistoryStore, type HistoryEntry } from '@/store/historyStore';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const TYPE_ICONS: Record<HistoryEntry['type'], React.ElementType> = {
  add_node: Plus,
  delete_node: Minus,
  move_node: Move,
  add_edge: Link,
  delete_edge: Unlink,
  edit_node: Edit3,
  batch: Layers,
  load_flow: FolderOpen,
};

const TYPE_COLORS: Record<HistoryEntry['type'], string> = {
  add_node: 'text-green-400',
  delete_node: 'text-red-400',
  move_node: 'text-blue-400',
  add_edge: 'text-purple-400',
  delete_edge: 'text-orange-400',
  edit_node: 'text-yellow-400',
  batch: 'text-cyan-400',
  load_flow: 'text-pink-400',
};

interface HistoryPanelProps {
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ onClose: _onClose }) => {
  const {
    entries,
    currentIndex,
    undo,
    redo,
    jumpToEntry,
    canUndo,
    canRedo,
    clear,
  } = useHistoryStore();

  const { setGraphAtomic } = useComputeFlowStore();

  const handleUndo = () => {
    const entry = undo();
    if (entry) {
      setGraphAtomic(entry.snapshot.nodes, entry.snapshot.edges, { skipHistory: true });
      toast.info('Undone: ' + entry.description);
    }
  };

  const handleRedo = () => {
    const entry = redo();
    if (entry) {
      setGraphAtomic(entry.snapshot.nodes, entry.snapshot.edges, { skipHistory: true });
      toast.info('Redone: ' + entry.description);
    }
  };

  const handleJumpTo = (index: number) => {
    const entry = jumpToEntry(index);
    if (entry) {
      setGraphAtomic(entry.snapshot.nodes, entry.snapshot.edges, { skipHistory: true });
      toast.info('Jumped to: ' + entry.description);
    }
  };

  const handleClear = () => {
    if (confirm('Clear all history? This cannot be undone.')) {
      clear();
      toast.success('History cleared');
    }
  };

  return (
    <div className="w-80 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl overflow-hidden shadow-2xl">
      <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-accent-teal" />
          <span className="text-sm font-medium text-white">History</span>
          <span className="text-xs text-zinc-500">({entries.length})</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={!canUndo()}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              canUndo()
                ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
            )}
            title="Undo (Cmd+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo()}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              canRedo()
                ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
            )}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          {entries.length > 0 && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="p-8 text-center">
            <History className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No history yet</p>
            <p className="text-xs text-zinc-600 mt-1">Actions will appear here</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {entries.map((entry, index) => {
              const Icon = TYPE_ICONS[entry.type];
              const colorClass = TYPE_COLORS[entry.type];
              const isCurrent = index === currentIndex;
              const isPast = index < currentIndex;

              return (
                <motion.button
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleJumpTo(index)}
                  className={cn(
                    'w-full p-3 rounded-lg text-left transition-all',
                    isCurrent
                      ? 'bg-accent-teal/20 border border-accent-teal/30'
                      : isPast
                        ? 'bg-zinc-800/30 opacity-60 hover:opacity-100'
                        : 'bg-zinc-800/50 hover:bg-zinc-800',
                    'border border-transparent hover:border-zinc-700/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('p-1.5 rounded-lg bg-zinc-800', colorClass)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{entry.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500">
                        <span>{entry.nodeCount} nodes</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(entry.timestamp, { addSuffix: true })}</span>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded bg-accent-teal/20 text-[10px] font-medium text-accent-teal">
                        Current
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-zinc-800/50 bg-zinc-900/50">
        <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-500">
          <span>
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">⌘Z</kbd> Undo
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">⌘⇧Z</kbd> Redo
          </span>
        </div>
      </div>
    </div>
  );
};
