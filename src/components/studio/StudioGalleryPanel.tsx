import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Images,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Sparkles,
  Image as ImageIcon,
  Video,
  Type,
  Keyboard,
  Wand2,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import { Button } from '@/components/ui/button';
import { WorkflowGeneratorTab } from './WorkflowGeneratorTab';
import { ShineBorder } from '@/components/ui/shine-border';
import type { NodeDefinition, EdgeDefinition } from '@/types/computeFlow';

interface GalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'text';
  timestamp: Date;
  nodeLabel?: string;
}

type FilterTab = 'all' | 'images' | 'videos' | 'text';
type MainTab = 'gallery' | 'workflow';

interface StudioGalleryPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onAddToCanvas?: (item: GalleryItem) => void;
  onWorkflowGenerated?: (nodes: NodeDefinition[], edges: EdgeDefinition[]) => void;
  className?: string;
}

export const StudioGalleryPanel: React.FC<StudioGalleryPanelProps> = ({
  isOpen,
  onToggle,
  onAddToCanvas,
  onWorkflowGenerated,
  className,
}) => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('gallery');
  const { nodeDefinitions } = useComputeFlowStore();

  const handleWorkflowGenerated = useCallback(
    (nodes: NodeDefinition[], edges: EdgeDefinition[]) => {
      onWorkflowGenerated?.(nodes, edges);
    },
    [onWorkflowGenerated]
  );

  const mainTabs = [
    { id: 'gallery' as const, label: 'Gallery', icon: Inbox },
    { id: 'workflow' as const, label: 'Workflow', icon: Sparkles },
  ];

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

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return galleryItems;
    return galleryItems.filter((item) => {
      if (activeFilter === 'images') return item.type === 'image';
      if (activeFilter === 'videos') return item.type === 'video';
      if (activeFilter === 'text') return item.type === 'text';
      return true;
    });
  }, [galleryItems, activeFilter]);

  const filterTabs: { id: FilterTab; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: Images },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'text', label: 'Text', icon: Type },
  ];

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={onToggle}
            className="fixed right-[5px] top-[calc(50%-26px)] z-40 bg-surface-2/90 border border-border-default rounded-l-xl p-3 hover:bg-surface-3 transition-colors shadow-xl"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed right-0 top-14 bottom-0 z-40 bg-surface-1 border-l border-border-subtle shadow-2xl shadow-glow-purple-md',
              "relative flex flex-col overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-accent-purple/10 before:via-transparent before:to-accent-teal/10 before:opacity-80 before:pointer-events-none before:content-['']",
              className
            )}
          >
            {/* Header with Main Tabs */}
            <div className="flex items-center justify-between px-2 py-2 border-b border-border-subtle">
              <div className="flex items-center gap-1">
                {mainTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeMainTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMainTab(tab.id)}
                      data-walkthrough={tab.id === 'gallery' ? 'gallery-tab' : tab.id === 'workflow' ? 'workflow-tab' : undefined}
                      className={cn(
                        'relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors overflow-hidden',
                        isActive
                          ? 'bg-surface-3 text-text-primary'
                          : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-2'
                      )}
                    >
                      {/* Shimmer effect for active workflow tab */}
                      {isActive && tab.id === 'workflow' && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-purple/20 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                        />
                      )}
                      <Icon className={cn('w-4 h-4 relative z-10', isActive && tab.id === 'workflow' && 'text-accent-purple')} />
                      <span className="relative z-10">{tab.label}</span>
                      {tab.id === 'gallery' && (
                        <span className="px-1.5 py-0.5 rounded bg-surface-3 text-[10px] font-medium text-text-secondary relative z-10">
                          {filteredItems.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button className="p-1.5 rounded-lg hover:bg-surface-3 text-text-tertiary" onClick={onToggle}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeMainTab === 'gallery' && (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 px-3 py-2 border-b border-border-subtle">
                    {filterTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                          activeFilter === tab.id
                            ? 'bg-accent-purple/15 text-accent-purple'
                            : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-3'
                        )}
                      >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Content Grid */}
                  <div className="flex-1 overflow-y-auto p-3">
                    {filteredItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center px-6">
                        <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
                          <Sparkles className="w-7 h-7 text-text-disabled" />
                        </div>
                        <p className="text-sm text-text-secondary mb-1">No generations yet</p>
                        <p className="text-xs text-text-tertiary">
                          Run a workflow to see outputs here
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {filteredItems.map((item) => (
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

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-border-subtle bg-surface-2/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-tertiary">
                        {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                      </span>
                      <button className="flex items-center gap-1.5 text-text-tertiary hover:text-text-secondary transition-colors">
                        <Keyboard className="w-3.5 h-3.5" />
                        <span>Shortcuts</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeMainTab === 'workflow' && (
                <motion.div
                  key="workflow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex-1 overflow-hidden p-3"
                >
                  <div className="relative">
                    {/* Animated gradient glow background */}
                    <motion.div
                      className="absolute -inset-2 rounded-3xl opacity-40 blur-xl pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--accent-purple)), hsl(var(--accent-teal)), hsl(var(--accent-amber)))',
                        backgroundSize: '200% 200%',
                      }}
                      animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                    />
                    <WorkflowGeneratorTab onWorkflowGenerated={handleWorkflowGenerated} />
                    <ShineBorder
                      shineColor={['hsl(var(--accent-purple))', 'hsl(var(--accent-teal))', 'hsl(var(--accent-amber))']}
                      borderWidth={1.5}
                      duration={3}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
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
                <Button
                  size="icon"
                  onClick={() => onAddToCanvas?.(selectedItem)}
                  className="h-10 w-10 bg-accent-purple hover:bg-accent-purple/80"
                >
                  <Plus className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => {
                    if (selectedItem.url) {
                      const link = document.createElement('a');
                      link.href = selectedItem.url;
                      link.download = `generation-${selectedItem.id}.png`;
                      link.click();
                    }
                  }}
                  className="h-10 w-10"
                >
                  <Download className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => setSelectedItem(null)}
                  className="h-10 w-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {selectedItem.nodeLabel && (
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
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
    className="group relative aspect-square rounded-xl overflow-hidden bg-surface-3 border border-border-subtle hover:border-accent-purple/50 cursor-pointer transition-all"
    onClick={() => onSelectItem(item)}
  >
    {item.type === 'image' && item.url ? (
      <img src={item.url} alt="" className="w-full h-full object-cover" />
    ) : item.type === 'text' ? (
      <div className="w-full h-full p-3 text-xs text-text-tertiary overflow-hidden leading-relaxed">
        {item.url}
      </div>
    ) : (
      <div className="w-full h-full flex items-center justify-center">
        <Images className="w-8 h-8 text-text-disabled" />
      </div>
    )}

    {/* Hover Overlay */}
    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToCanvas?.(item);
        }}
        className="p-2.5 rounded-lg bg-accent-purple hover:bg-accent-purple/80 text-white transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (item.url) {
            const link = document.createElement('a');
            link.href = item.url;
            link.download = `generation-${item.id}.png`;
            link.click();
          }
        }}
        className="p-2.5 rounded-lg bg-surface-3 hover:bg-surface-4 text-text-primary transition-colors"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>

    {/* Label - Only visible on hover */}
    {item.nodeLabel && (
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-[11px] text-white truncate">{item.nodeLabel}</p>
      </div>
    )}
  </motion.div>
);

export default StudioGalleryPanel;
