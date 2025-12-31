import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Images,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Clock,
  Sparkles,
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

  const galleryItems: GalleryItem[] = useMemo(() => {
    return nodeDefinitions
      .filter((node) => node.preview?.url || node.preview?.data)
      .map((node) => ({
        id: node.id,
        url: node.preview?.url || '',
        type: (node.preview?.type as GalleryItem['type']) || 'image',
        timestamp: new Date(),
        nodeLabel: node.label,
      }))
      .slice(0, 20);
  }, [nodeDefinitions]);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={onToggle}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-40 bg-surface-2/90 border border-border-default rounded-l-xl p-3 hover:bg-surface-3 transition-colors shadow-xl"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed right-0 top-14 bottom-0 z-40 bg-surface-1 border-l border-border-subtle',
              'flex flex-col overflow-hidden',
              className
            )}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Images className="w-4 h-4 text-text-secondary" />
                <h3 className="text-sm font-medium text-text-primary">Gallery</h3>
                <span className="px-1.5 py-0.5 rounded bg-surface-3 text-[10px] font-medium text-text-secondary">
                  {galleryItems.length}
                </span>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-surface-3 text-text-tertiary" onClick={onToggle}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {galleryItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-3">
                    <Sparkles className="w-7 h-7 text-text-disabled" />
                  </div>
                  <p className="text-sm text-text-secondary mb-1">No generations yet</p>
                  <p className="text-xs text-text-tertiary">Generated content will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {galleryItems.map((item) => (
                    <GalleryThumbnail
                      key={item.id}
                      item={item}
                      onAddToCanvas={onAddToCanvas}
                      onSelectItem={setSelectedItem}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-border-subtle bg-surface-2/50">
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recent outputs
                </span>
                <span>{galleryItems.length} items</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => onAddToCanvas?.(selectedItem)}
                  className="p-2 rounded-lg bg-accent-purple hover:bg-accent-purple/80 text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    /* Download */
                  }}
                  className="p-2 rounded-lg bg-surface-3 hover:bg-surface-4 text-text-primary transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-lg bg-surface-3 hover:bg-surface-4 text-text-primary transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {selectedItem.nodeLabel && (
                <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg">
                  <p className="text-sm text-text-secondary">{selectedItem.nodeLabel}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

interface GalleryThumbnailProps {
  item: GalleryItem;
  onAddToCanvas?: (item: GalleryItem) => void;
  onSelectItem: (item: GalleryItem) => void;
}

const GalleryThumbnail = ({ item, onAddToCanvas, onSelectItem }: GalleryThumbnailProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="group relative aspect-square rounded-xl overflow-hidden bg-surface-3 border border-border-subtle hover:border-accent-purple/50 cursor-pointer transition-colors"
    onClick={() => onSelectItem(item)}
  >
    {item.type === 'image' && item.url ? (
      <img src={item.url} alt="" className="w-full h-full object-cover" />
    ) : item.type === 'text' ? (
      <div className="w-full h-full p-2 text-[10px] text-text-tertiary overflow-hidden">{item.url}</div>
    ) : (
      <div className="w-full h-full flex items-center justify-center">
        <Images className="w-6 h-6 text-text-disabled" />
      </div>
    )}

    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToCanvas?.(item);
        }}
        className="p-2 rounded-lg bg-accent-purple hover:bg-accent-purple/80 text-white"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="p-2 rounded-lg bg-surface-3 hover:bg-surface-4 text-text-primary"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>

    {item.nodeLabel && (
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-[11px] text-text-secondary truncate">{item.nodeLabel}</p>
      </div>
    )}
  </motion.div>
);

export default StudioGalleryPanel;
