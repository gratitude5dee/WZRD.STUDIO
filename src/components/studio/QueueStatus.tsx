import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Zap, Clock, CheckCircle2, XCircle } from 'lucide-react';

export interface QueueItem {
  id: string;
  nodeId: string;
  nodeType: 'text' | 'image' | 'video';
  status: 'queued' | 'generating' | 'complete' | 'failed';
  progress?: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

interface QueueStatusProps {
  queue: QueueItem[];
  onCancelItem?: (itemId: string) => void;
}

export const QueueStatus = ({ queue, onCancelItem }: QueueStatusProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeItems = queue.filter((item) => 
    item.status === 'queued' || item.status === 'generating'
  );
  const completedItems = queue.filter((item) => item.status === 'complete');
  const failedItems = queue.filter((item) => item.status === 'failed');

  const getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'queued':
        return <Clock className="w-3.5 h-3.5 text-[#A1A1AA]" />;
      case 'generating':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Zap className="w-3.5 h-3.5 text-[#6366F1]" />
          </motion.div>
        );
      case 'complete':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />;
      case 'failed':
        return <XCircle className="w-3.5 h-3.5 text-[#EF4444]" />;
    }
  };

  const getStatusColor = (status: QueueItem['status']) => {
    switch (status) {
      case 'queued':
        return 'text-[#A1A1AA]';
      case 'generating':
        return 'text-[#6366F1]';
      case 'complete':
        return 'text-[#10B981]';
      case 'failed':
        return 'text-[#EF4444]';
    }
  };

  if (queue.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 right-4 z-40"
    >
      <div className="bg-[#141416] border border-[#3F3F46] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Header - Always Visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#1C1C1F] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {activeItems.length > 0 ? (
                <>
                  <motion.div
                    className="w-2 h-2 bg-[#6366F1] rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-sm font-semibold text-[#FAFAFA]">
                    {activeItems.length} Active
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-[#52525B] rounded-full" />
                  <span className="text-sm font-semibold text-[#FAFAFA]">Queue Empty</span>
                </>
              )}
            </div>
            
            {(completedItems.length > 0 || failedItems.length > 0) && (
              <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                {completedItems.length > 0 && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                    {completedItems.length}
                  </span>
                )}
                {failedItems.length > 0 && (
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-[#EF4444]" />
                    {failedItems.length}
                  </span>
                )}
              </div>
            )}
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp className="w-4 h-4 text-[#A1A1AA]" />
          </motion.div>
        </button>

        {/* Expanded Queue List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-[#27272A]"
            >
              <div className="max-h-[300px] overflow-y-auto">
                {queue.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="px-4 py-3 border-b border-[#27272A] last:border-b-0 hover:bg-[#1C1C1F] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium text-[#FAFAFA] truncate">
                            {item.nodeType.charAt(0).toUpperCase() + item.nodeType.slice(1)} Node
                          </span>
                          <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status === 'generating' && item.progress
                              ? `${item.progress}%`
                              : item.status}
                          </span>
                        </div>

                        {/* Progress Bar for Generating */}
                        {item.status === 'generating' && item.progress !== undefined && (
                          <div className="h-1 bg-[#27272A] rounded-full overflow-hidden mb-1">
                            <motion.div
                              className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        )}

                        {/* Error Message */}
                        {item.status === 'failed' && item.error && (
                          <p className="text-xs text-[#EF4444] truncate">{item.error}</p>
                        )}

                        {/* Timestamp */}
                        <p className="text-xs text-[#52525B]">
                          {item.startedAt
                            ? `Started ${new Date(item.startedAt).toLocaleTimeString()}`
                            : 'Queued'}
                        </p>
                      </div>

                      {/* Cancel Button (only for queued/generating) */}
                      {(item.status === 'queued' || item.status === 'generating') &&
                        onCancelItem && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancelItem(item.id);
                            }}
                            className="px-2 py-1 text-xs text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#27272A] rounded transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
