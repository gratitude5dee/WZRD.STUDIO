import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronUp, ChevronDown, Check, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useComputeFlowStore } from '@/store/computeFlowStore';

interface QueueItem {
  id: string;
  label: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  progress?: number;
}

interface QueueIndicatorProps {
  className?: string;
}

export const QueueIndicator: React.FC<QueueIndicatorProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { nodeDefinitions } = useComputeFlowStore();

  // Derive queue items from node definitions
  const queueItems: QueueItem[] = nodeDefinitions
    .filter(node => ['queued', 'running'].includes(node.status))
    .map(node => ({
      id: node.id,
      label: node.label,
      status: node.status as QueueItem['status'],
      progress: node.progress,
    }));

  const activeCount = queueItems.filter(i => i.status === 'running').length;
  const queuedCount = queueItems.filter(i => i.status === 'queued').length;
  const totalCount = activeCount + queuedCount;

  // Don't render if queue is empty
  if (totalCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        className
      )}
      data-walkthrough="queue"
    >
      <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden min-w-[200px]">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {activeCount > 0 ? (
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            ) : (
              <Clock className="w-4 h-4 text-zinc-500" />
            )}
            <span className="text-sm font-medium text-zinc-300">Queue</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">
              {activeCount > 0 && (
                <span className="text-purple-400">{activeCount} active</span>
              )}
              {activeCount > 0 && queuedCount > 0 && ', '}
              {queuedCount > 0 && (
                <span className="text-amber-400">{queuedCount} queued</span>
              )}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronUp className="w-4 h-4 text-zinc-500" />
            )}
          </div>
        </button>

        {/* Expanded queue list */}
        <AnimatePresence>
          {isExpanded && queueItems.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-zinc-800"
            >
              <div className="max-h-48 overflow-y-auto">
                {queueItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800/50 last:border-b-0"
                  >
                    {/* Status icon */}
                    {item.status === 'running' ? (
                      <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin flex-shrink-0" />
                    ) : item.status === 'succeeded' ? (
                      <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    ) : item.status === 'failed' ? (
                      <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    )}

                    {/* Label and progress */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-300 truncate">{item.label}</p>
                      {item.status === 'running' && item.progress !== undefined && (
                        <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Progress percentage */}
                    {item.status === 'running' && item.progress !== undefined && (
                      <span className="text-[10px] text-zinc-500 flex-shrink-0">
                        {item.progress}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default QueueIndicator;
