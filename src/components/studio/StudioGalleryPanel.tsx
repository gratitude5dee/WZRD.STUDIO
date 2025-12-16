import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Images, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Maximize2,
  Trash2,
  Plus,
  Clock,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useComputeFlowStore } from '@/store/computeFlowStore';

interface GalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'text';
  timestamp: Date;
  nodeLabel?: string;
}

interface StudioGalleryPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onAddToCanvas?: (item: GalleryItem) => void;
  className?: string;
}

export const StudioGalleryPanel: React.FC<StudioGalleryPanelProps> = ({
  isOpen,
  onToggle,
  onAddToCanvas,
  className,
}) => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const { nodeDefinitions } = useComputeFlowStore();

  // Extract gallery items from node previews
  const galleryItems: GalleryItem[] = useMemo(() => {
    return nodeDefinitions
      .filter(node => node.preview?.url || node.preview?.data)
      .map(node => ({
        id: node.id,
        url: node.preview?.url || '',
        type: node.preview?.type as GalleryItem['type'] || 'image',
        timestamp: new Date(),
        nodeLabel: node.label,
      }))
      .slice(0, 20); // Limit to 20 most recent
  }, [nodeDefinitions]);

  return (
    <>
      {/* Toggle Button (visible when panel is closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={onToggle}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-40 bg-zinc-900/90 border border-zinc-800 rounded-l-xl p-3 hover:bg-zinc-800/90 transition-colors shadow-xl"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed right-0 top-16 bottom-0 z-40 bg-zinc-950/95 border-l border-zinc-800 backdrop-blur-md overflow-hidden flex flex-col',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Images className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-zinc-200">Gallery</span>
                <span className="text-xs text-zinc-600">({galleryItems.length})</span>
              </div>
              <button
                onClick={onToggle}
                className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-3">
              {galleryItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-3">
                    <Sparkles className="w-7 h-7 text-zinc-700" />
                  </div>
                  <p className="text-sm text-zinc-500 mb-1">No generations yet</p>
                  <p className="text-xs text-zinc-600">
                    Generated content will appear here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {galleryItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/60 hover:border-purple-500/50 transition-all cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      {item.type === 'image' && item.url ? (
                        <img
                          src={item.url}
                          alt="Generated"
                          className="w-full h-full object-cover"
                        />
                      ) : item.type === 'text' ? (
                        <div className="w-full h-full p-2 text-[8px] text-zinc-500 overflow-hidden">
                          {item.url}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Images className="w-6 h-6 text-zinc-700" />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCanvas?.(item);
                          }}
                          className="p-2 bg-purple-500/80 hover:bg-purple-500 rounded-lg transition-colors"
                          title="Add to canvas"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Download logic
                          }}
                          className="p-2 bg-zinc-700/80 hover:bg-zinc-600 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      {/* Label */}
                      {item.nodeLabel && (
                        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-[9px] text-zinc-400 truncate">
                            {item.nodeLabel}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer stats */}
            {galleryItems.length > 0 && (
              <div className="px-4 py-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recent outputs
                </span>
                <span>{galleryItems.length} items</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === 'image' && selectedItem.url && (
                <img
                  src={selectedItem.url}
                  alt="Generated"
                  className="max-w-full max-h-[80vh] object-contain rounded-xl"
                />
              )}
              
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => onAddToCanvas?.(selectedItem)}
                  className="p-2 bg-purple-500/80 hover:bg-purple-500 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => {/* Download */}}
                  className="p-2 bg-zinc-700/80 hover:bg-zinc-600 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Label */}
              {selectedItem.nodeLabel && (
                <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg">
                  <p className="text-sm text-zinc-300">{selectedItem.nodeLabel}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudioGalleryPanel;
