import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AssetsGalleryPanel, type Asset } from './panels/AssetsGalleryPanel';
import { WorkflowGeneratorTab } from './WorkflowGeneratorTab';
import { ShineBorder } from '@/components/ui/shine-border';
import type { NodeDefinition, EdgeDefinition } from '@/types/computeFlow';

type RightPanelTab = 'gallery' | 'workflow';

interface StudioRightPanelProps {
  projectId?: string;
  onAssetSelect?: (asset: Asset) => void;
  onWorkflowGenerated?: (nodes: NodeDefinition[], edges: EdgeDefinition[]) => void;
}

export function StudioRightPanel({
  projectId,
  onAssetSelect,
  onWorkflowGenerated,
}: StudioRightPanelProps) {
  const [activeTab, setActiveTab] = useState<RightPanelTab>('gallery');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleWorkflowGenerated = useCallback(
    (nodes: NodeDefinition[], edges: EdgeDefinition[]) => {
      onWorkflowGenerated?.(nodes, edges);
    },
    [onWorkflowGenerated]
  );

  const tabs = [
    { id: 'gallery' as const, label: 'Gallery', icon: Inbox },
    { id: 'workflow' as const, label: 'Workflow', icon: Sparkles },
  ];

  return (
    <motion.aside
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsCollapsed(false)}
            className="p-2 bg-surface-1/95 backdrop-blur-2xl border border-border-subtle rounded-xl shadow-2xl shadow-black/40 hover:bg-surface-2 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-surface-1/95 backdrop-blur-2xl border border-border-subtle rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Collapse button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="absolute top-2 right-2 z-10 p-1 rounded-lg bg-surface-2/80 hover:bg-surface-3 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-text-tertiary" />
            </button>

            {/* Tab buttons */}
            <div className="flex border-b border-border-subtle">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'relative flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-text-primary'
                        : 'text-text-tertiary hover:text-text-secondary'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive && tab.id === 'workflow' && 'text-accent-purple')} />
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="right-panel-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-purple"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {activeTab === 'gallery' && projectId && (
                  <motion.div
                    key="gallery"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <AssetsGalleryPanel
                      projectId={projectId}
                      onAssetSelect={onAssetSelect}
                      onClose={() => setIsCollapsed(true)}
                    />
                  </motion.div>
                )}

                {activeTab === 'workflow' && (
                  <motion.div
                    key="workflow"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="relative"
                  >
                    <WorkflowGeneratorTab onWorkflowGenerated={handleWorkflowGenerated} />
                    <ShineBorder
                      shineColor={['hsl(var(--accent-purple))', 'hsl(var(--accent-amber))']}
                      borderWidth={1}
                      duration={4}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

export default StudioRightPanel;
