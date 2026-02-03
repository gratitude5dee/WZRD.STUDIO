import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  History,
  HelpCircle,
  Type,
  Image as ImageIcon,
  Video,
  Upload,
  Workflow,
  MessageCircle,
  Hand,
  MousePointer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FlowsPanel } from './panels/FlowsPanel';
import { HistoryPanel } from './panels/HistoryPanel';
import { WalkthroughTooltip } from './panels/HelpWalkthroughPanel';
import { useWalkthrough } from '@/hooks/useWalkthrough';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { ShineBorder } from '@/components/ui/shine-border';

interface StudioSidebarProps {
  onAddBlock: (blockType: 'text' | 'image' | 'video' | 'upload') => void;
  projectId?: string;
  interactionMode?: 'pan' | 'select';
  onToggleInteractionMode?: () => void;
}

type PanelType = 'add' | 'flows' | 'history' | null;

const StudioSidebar = ({ 
  onAddBlock, 
  projectId, 
  interactionMode = 'pan',
  onToggleInteractionMode 
}: StudioSidebarProps) => {
  const { addNode } = useComputeFlowStore();
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const walkthrough = useWalkthrough();
  const panelRef = useRef<HTMLDivElement>(null);

  const togglePanel = (panel: PanelType) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const handleAddComment = useCallback(() => {
    addNode({
      id: crypto.randomUUID(),
      kind: 'comment',
      version: '1.0.0',
      label: 'Comment',
      position: { x: 250, y: 250 },
      size: { w: 300, h: 180 },
      inputs: [],
      outputs: [],
      status: 'idle',
      params: {
        title: 'New Comment',
        content: '',
        color: '#FBBF24',
      },
    });
    toast.success('Comment added to canvas');
  }, [addNode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setActivePanel(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      {/* Floating Sidebar - Vertically Centered - Reduced width - Moved right by 5px */}
      <aside className="fixed left-[10px] top-1/2 -translate-y-1/2 z-40">
        <motion.div 
          className="relative bg-surface-1/95 backdrop-blur-2xl border border-border-subtle rounded-2xl shadow-2xl shadow-black/40 p-1 flex flex-col items-center gap-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Primary Add Node Button with ShineBorder */}
          <div className="relative">
            <SidebarButton
              icon={Plus}
              label="Add Node"
              active={activePanel === 'add'}
              onClick={() => togglePanel('add')}
              data-walkthrough="add-button"
              primary
            />
            {activePanel === 'add' && (
              <ShineBorder 
                shineColor={["hsl(var(--accent-purple))", "hsl(var(--accent-teal))"]} 
                borderWidth={2}
                duration={4}
              />
            )}
          </div>

          <Divider />

          {/* Pan/Select Mode Toggle */}
          {onToggleInteractionMode && (
            <div className="relative">
              <SidebarButton
                icon={interactionMode === 'pan' ? Hand : MousePointer}
                label={interactionMode === 'pan' ? 'Pan Mode (H)' : 'Select Mode (V)'}
                active={interactionMode === 'select'}
                onClick={onToggleInteractionMode}
                modeIndicator={interactionMode}
              />
            </div>
          )}

          <SidebarButton
            icon={Workflow}
            label="Flows"
            active={activePanel === 'flows'}
            onClick={() => togglePanel('flows')}
            data-walkthrough="flows-button"
          />

          <SidebarButton
            icon={History}
            label="History"
            active={activePanel === 'history'}
            onClick={() => togglePanel('history')}
            data-walkthrough="history-button"
          />

          <Divider />

          <SidebarButton icon={MessageCircle} label="Add Comment" onClick={handleAddComment} />

          <SidebarButton 
            icon={HelpCircle} 
            label="Help & Tour" 
            onClick={() => walkthrough.start()} 
          />

        </motion.div>
      </aside>

      {/* Panels Container */}
      <div ref={panelRef}>
        <AnimatePresence mode="wait">
          {activePanel === 'add' && (
            <PanelWrapper>
              <AddNodeMenu
                onAddBlock={(type) => {
                  onAddBlock(type);
                  setActivePanel(null);
                }}
              />
            </PanelWrapper>
          )}

          {activePanel === 'flows' && projectId && (
            <PanelWrapper>
              <FlowsPanel projectId={projectId} onClose={() => setActivePanel(null)} />
            </PanelWrapper>
          )}

          {activePanel === 'history' && (
            <PanelWrapper>
              <HistoryPanel onClose={() => setActivePanel(null)} />
            </PanelWrapper>
          )}

        </AnimatePresence>
      </div>

      <AnimatePresence>
        {walkthrough.isActive && walkthrough.currentStep && (
          <WalkthroughTooltip
            step={walkthrough.currentStep}
            onNext={walkthrough.next}
            onPrev={walkthrough.prev}
            onClose={walkthrough.stop}
            currentIndex={walkthrough.currentStepIndex}
            totalSteps={walkthrough.totalSteps}
          />
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};

const Divider = () => (
  <div className="w-8 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent my-1.5" />
);

interface SidebarButtonProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  accent?: boolean;
  primary?: boolean;
  badge?: number;
  modeIndicator?: 'pan' | 'select';
  'data-walkthrough'?: string;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon: Icon,
  label,
  active,
  onClick,
  accent,
  primary,
  badge,
  modeIndicator,
  ...props
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <motion.button
        onClick={onClick}
        className={cn(
          'relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200',
          primary
            ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/30'
            : active
              ? 'bg-accent-purple/20 text-accent-purple'
              : modeIndicator === 'select'
                ? 'bg-accent-teal/15 text-accent-teal'
                : accent
                  ? 'text-text-secondary hover:text-accent-purple hover:bg-accent-purple/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        <Icon className="w-4 h-4" />
        {badge !== undefined && badge > 0 && (
          <motion.span 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-rose text-[10px] font-bold text-white flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            {badge}
          </motion.span>
        )}
        {modeIndicator && (
          <motion.span 
            className={cn(
              'absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
              modeIndicator === 'pan' ? 'bg-text-tertiary' : 'bg-accent-teal'
            )}
            layoutId="mode-indicator"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </motion.button>
    </TooltipTrigger>
    <TooltipContent side="right" className="text-xs bg-surface-2 border-border-subtle">
      {label}
    </TooltipContent>
  </Tooltip>
);

interface PanelWrapperProps {
  children: React.ReactNode;
  offsetY?: number;
}

const PanelWrapper: React.FC<PanelWrapperProps> = ({ children, offsetY = 0 }) => (
  <motion.div
    className="fixed left-[60px] top-1/2 z-50"
    style={{ transform: `translateY(calc(-50% + ${offsetY}px))` }}
    initial={{ opacity: 0, x: -16, scale: 0.96 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: -16, scale: 0.96 }}
    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
  >
    {/* Arrow connector pointing back to sidebar */}
    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-surface-1 border-b-[6px] border-b-transparent" />
    {children}
  </motion.div>
);

const AddNodeMenu: React.FC<{
  onAddBlock: (type: 'text' | 'image' | 'video' | 'upload') => void;
}> = ({ onAddBlock }) => {
  const menuItems = [
    { type: 'text' as const, icon: Type, label: 'Text', shortcut: 'T', color: 'text-accent-teal' },
    { type: 'image' as const, icon: ImageIcon, label: 'Image', shortcut: 'I', color: 'text-accent-purple' },
    { type: 'video' as const, icon: Video, label: 'Video', shortcut: 'V', color: 'text-accent-rose' },
    { type: 'upload' as const, icon: Upload, label: 'Upload', shortcut: 'U', color: 'text-accent-amber' },
  ];

  return (
    <motion.div 
      className="w-48 bg-surface-1/98 backdrop-blur-2xl border border-border-subtle rounded-xl overflow-hidden shadow-2xl shadow-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      <div className="p-1.5 space-y-0.5">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.type}
            onClick={() => onAddBlock(item.type)}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-surface-2 transition-colors group"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, delay: index * 0.03 }}
            whileHover={{ x: 3 }}
          >
            <div className="flex items-center gap-2.5">
              <item.icon className={cn("w-4 h-4 transition-colors", item.color)} />
              <span className="text-sm text-text-primary">{item.label}</span>
            </div>
            <span className="text-[10px] text-text-tertiary group-hover:text-text-secondary transition-colors px-1.5 py-0.5 rounded bg-surface-2 group-hover:bg-surface-3">{item.shortcut}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default StudioSidebar;
