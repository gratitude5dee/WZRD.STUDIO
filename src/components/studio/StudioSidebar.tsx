import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  History,
  Inbox,
  HelpCircle,
  Type,
  Image as ImageIcon,
  Video,
  Upload,
  Workflow,
  MessageCircle,
  Sparkles,
  Hand,
  MousePointer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FlowsPanel } from './panels/FlowsPanel';
import { HistoryPanel } from './panels/HistoryPanel';
import { AssetsGalleryPanel, type Asset } from './panels/AssetsGalleryPanel';
import { WorkflowGeneratorTab } from './WorkflowGeneratorTab';
import { WalkthroughTooltip } from './panels/HelpWalkthroughPanel';
import { useWalkthrough } from '@/hooks/useWalkthrough';
import type { NodeDefinition, EdgeDefinition } from '@/types/computeFlow';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from '@/components/ui/logo';

interface StudioSidebarProps {
  onAddBlock: (blockType: 'text' | 'image' | 'video' | 'upload') => void;
  projectId?: string;
  onAssetSelect?: (asset: Asset) => void;
  interactionMode?: 'pan' | 'select';
  onToggleInteractionMode?: () => void;
}

type PanelType = 'add' | 'flows' | 'history' | 'workflow' | 'assets' | null;

const StudioSidebar = ({ 
  onAddBlock, 
  projectId, 
  onAssetSelect,
  interactionMode = 'pan',
  onToggleInteractionMode 
}: StudioSidebarProps) => {
  const { addGeneratedWorkflow, addNode, saveGraph, executeGraphStreaming } = useComputeFlowStore();
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const walkthrough = useWalkthrough();
  const panelRef = useRef<HTMLDivElement>(null);

  const togglePanel = (panel: PanelType) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const handleWorkflowGenerated = useCallback(
    (nodes: NodeDefinition[], edges: EdgeDefinition[]) => {
      addGeneratedWorkflow(nodes, edges);
      if (projectId) {
        setTimeout(() => {
          saveGraph(projectId);
          toast.info('Workflow saved! Starting generation...');
          setTimeout(() => executeGraphStreaming(projectId), 600);
        }, 500);
      }
      setActivePanel(null);
    },
    [addGeneratedWorkflow, saveGraph, projectId, executeGraphStreaming]
  );

  const handleAddComment = useCallback(() => {
    const commentNode: NodeDefinition = {
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
    };
    addNode(commentNode);
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
      {/* Floating Sidebar - Vertically Centered */}
      <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-40">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl shadow-black/30 p-2 flex flex-col items-center gap-1">
          {/* Primary Add Node Button */}
          <SidebarButton
            icon={Plus}
            label="Add Node"
            active={activePanel === 'add'}
            onClick={() => togglePanel('add')}
            data-walkthrough="add-button"
            primary
          />

          <Divider />

          {/* Pan/Select Mode Toggle */}
          {onToggleInteractionMode && (
            <SidebarButton
              icon={interactionMode === 'pan' ? Hand : MousePointer}
              label={interactionMode === 'pan' ? 'Pan Mode (H)' : 'Select Mode (V)'}
              active={interactionMode === 'select'}
              onClick={onToggleInteractionMode}
              modeIndicator={interactionMode}
            />
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

          <SidebarButton
            icon={Sparkles}
            label="AI Workflow"
            active={activePanel === 'workflow'}
            onClick={() => togglePanel('workflow')}
            accent
            data-walkthrough="ai-workflow-button"
          />

          <SidebarButton
            icon={Inbox}
            label="Assets"
            active={activePanel === 'assets'}
            onClick={() => togglePanel('assets')}
            data-walkthrough="assets-button"
          />

          <Divider />

          <SidebarButton icon={MessageCircle} label="Add Comment" onClick={handleAddComment} />

          <SidebarButton 
            icon={HelpCircle} 
            label="Help & Tour" 
            onClick={() => walkthrough.start()} 
          />

          <Divider />

          {/* Bottom Logo - using sm size with scale */}
          <div className="pt-1 pb-1 opacity-40 hover:opacity-70 transition-opacity scale-75">
            <Logo size="sm" showVersion={false} />
          </div>
        </div>
      </aside>

      {/* Panels Container */}
      <div ref={panelRef}>
        <AnimatePresence>
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

          {activePanel === 'workflow' && (
            <PanelWrapper offsetY={100}>
              <WorkflowGeneratorTab onWorkflowGenerated={handleWorkflowGenerated} />
            </PanelWrapper>
          )}

          {activePanel === 'assets' && projectId && (
            <PanelWrapper>
              <AssetsGalleryPanel
                projectId={projectId}
                onAssetSelect={(asset) => {
                  onAssetSelect?.(asset);
                  setActivePanel(null);
                }}
                onClose={() => setActivePanel(null)}
              />
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
  <div className="w-8 h-px bg-zinc-800/60 my-1" />
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
      <button
        onClick={onClick}
        className={cn(
          'relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
          primary
            ? 'bg-accent-purple text-white hover:bg-accent-purple/80 shadow-lg shadow-accent-purple/20'
            : active
              ? 'bg-accent-purple/20 text-accent-purple'
              : modeIndicator === 'select'
                ? 'bg-accent-teal/15 text-accent-teal'
                : accent
                  ? 'text-zinc-400 hover:text-accent-purple hover:bg-accent-purple/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/70'
        )}
        {...props}
      >
        <Icon className="w-[18px] h-[18px]" />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-rose text-[10px] font-bold text-white flex items-center justify-center">
            {badge}
          </span>
        )}
        {modeIndicator && (
          <span className={cn(
            'absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
            modeIndicator === 'pan' ? 'bg-zinc-500' : 'bg-accent-teal'
          )} />
        )}
      </button>
    </TooltipTrigger>
    <TooltipContent side="right" className="text-xs">
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
    className="fixed left-20 top-1/2 z-50"
    style={{ transform: `translateY(calc(-50% + ${offsetY}px))` }}
    initial={{ opacity: 0, x: -10, scale: 0.95 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: -10, scale: 0.95 }}
    transition={{ duration: 0.15 }}
  >
    {children}
  </motion.div>
);

const AddNodeMenu: React.FC<{
  onAddBlock: (type: 'text' | 'image' | 'video' | 'upload') => void;
}> = ({ onAddBlock }) => (
  <div className="w-56 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl overflow-hidden shadow-2xl">
    <div className="p-2 space-y-1">
      {[
        { type: 'text' as const, icon: Type, label: 'Text', shortcut: 'T' },
        { type: 'image' as const, icon: ImageIcon, label: 'Image', shortcut: 'I' },
        { type: 'video' as const, icon: Video, label: 'Video', shortcut: 'V' },
        { type: 'upload' as const, icon: Upload, label: 'Upload', shortcut: 'U' },
      ].map((item) => (
        <button
          key={item.type}
          onClick={() => onAddBlock(item.type)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-white">{item.label}</span>
          </div>
          <span className="text-xs text-zinc-600">{item.shortcut}</span>
        </button>
      ))}
    </div>
  </div>
);

export default StudioSidebar;