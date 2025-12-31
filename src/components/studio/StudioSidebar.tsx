import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  History,
  Layers,
  Inbox,
  Wand2,
  Settings,
  HelpCircle,
  Type,
  Image as ImageIcon,
  Video,
  Upload,
  FolderOpen,
  Workflow,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import FlowSelector, { Flow } from './FlowSelector';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AssetLibrary, AssetUploader } from '@/components/assets';
import type { ProjectAsset, AssetType } from '@/types/assets';
import { ProfileButton } from '@/components/layout/ProfileButton';
import { WorkflowGeneratorTab } from './WorkflowGeneratorTab';
import type { NodeDefinition, EdgeDefinition } from '@/types/computeFlow';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from '@/components/ui/logo';

interface StudioSidebarProps {
  onAddBlock: (blockType: 'text' | 'image' | 'video' | 'upload') => void;
  projectId?: string;
  onAssetSelect?: (asset: ProjectAsset) => void;
}

const ACCEPTED_STUDIO_FILE_TYPES = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.mp4',
  '.mov',
  '.webm',
  '.mp3',
  '.wav',
  '.ogg',
];

const detectAssetTypeFromFile = (file: File): AssetType => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type === 'application/pdf') return 'document';
  return 'other';
};

const MOCK_FLOWS: Flow[] = [
  {
    id: 'game-character',
    name: 'Game Character Generation',
    blocks: 139,
  },
  {
    id: 'magic-frogs',
    name: 'magic frogs',
    blocks: 9,
  },
  {
    id: 'cinematic',
    name: 'Cinematic Portrait',
    blocks: 9,
  },
  {
    id: 'branching',
    name: 'Branching',
    blocks: 79,
  },
  {
    id: 'aesthetic',
    name: 'Aesthetic Style Extraction',
    blocks: 39,
  },
  {
    id: 'love-me',
    name: 'LOVE ME, LOVE ME NOT',
    blocks: 3,
  },
];

const SidebarButton = ({
  icon: Icon,
  label,
  active,
  primary,
  badge,
  onClick,
  href,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  primary?: boolean;
  badge?: number;
  onClick?: () => void;
  href?: string;
}) => {
  const content = (
    <div
      className={cn(
        'relative w-10 h-10 rounded-xl flex items-center justify-center transition-all',
        'text-text-secondary hover:text-text-primary',
        active && 'bg-surface-3 text-text-primary shadow-inner',
        primary && !active && 'bg-accent-teal/10 text-accent-teal hover:bg-accent-teal/20'
      )}
    >
      <Icon className="w-5 h-5" />
      {badge ? (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-rose text-[10px] font-bold text-white flex items-center justify-center">
          {badge}
        </span>
      ) : null}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
            {content}
          </a>
        ) : (
          <button type="button" onClick={onClick}>
            {content}
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

const StudioSidebar = ({ onAddBlock, projectId, onAssetSelect }: StudioSidebarProps) => {
  const { addGeneratedWorkflow, saveGraph, executeGraphStreaming } = useComputeFlowStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFlowSelector, setShowFlowSelector] = useState(false);
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [showWorkflowPanel, setShowWorkflowPanel] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const flowSelectorRef = useRef<HTMLDivElement>(null);
  const workflowPanelRef = useRef<HTMLDivElement>(null);

  const handleWorkflowGenerated = useCallback(
    (nodes: NodeDefinition[], edges: EdgeDefinition[]) => {
      addGeneratedWorkflow(nodes, edges);
      if (projectId) {
        setTimeout(() => {
          saveGraph(projectId);
          toast.info('Workflow saved! Starting generation...');

          setTimeout(() => {
            executeGraphStreaming(projectId);
          }, 600);
        }, 500);
      }
      setShowWorkflowPanel(false);
    },
    [addGeneratedWorkflow, saveGraph, projectId, executeGraphStreaming]
  );

  const handleClickOutside = (event: MouseEvent) => {
    if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
      setShowAddMenu(false);
    }
    if (flowSelectorRef.current && !flowSelectorRef.current.contains(event.target as Node)) {
      setShowFlowSelector(false);
    }
    if (workflowPanelRef.current && !workflowPanelRef.current.contains(event.target as Node)) {
      setShowWorkflowPanel(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToolClick = (toolId: string) => {
    setActiveTool(activeTool === toolId ? null : toolId);
    if (toolId === 'add') {
      setShowAddMenu(!showAddMenu);
      setShowFlowSelector(false);
      setShowWorkflowPanel(false);
    } else if (toolId === 'templates') {
      setShowFlowSelector(!showFlowSelector);
      setShowAddMenu(false);
      setShowWorkflowPanel(false);
    } else if (toolId === 'assets') {
      setShowAssetsModal(true);
      setShowAddMenu(false);
      setShowFlowSelector(false);
      setShowWorkflowPanel(false);
    } else if (toolId === 'workflow') {
      setShowWorkflowPanel(!showWorkflowPanel);
      setShowAddMenu(false);
      setShowFlowSelector(false);
    } else {
      setShowAddMenu(false);
      setShowFlowSelector(false);
      setShowWorkflowPanel(false);
    }
  };

  const handleSelectFlow = (flowId: string) => {
    console.log(`Selected flow: ${flowId}`);
    setShowFlowSelector(false);
  };

  const handleAssetsSelected = (assets: ProjectAsset[]) => {
    if (!onAssetSelect || assets.length === 0) return;
    const selected = assets[assets.length - 1];
    onAssetSelect(selected);
    setShowAssetsModal(false);
  };

  const hasProject = Boolean(projectId);
  const distributionItem = {
    icon: Upload,
    label: 'Distribute via USync',
    href: 'https://usync.lovable.app',
  };
  const inboxCount = 3;

  return (
    <aside className="h-full w-16 bg-surface-1 border-r border-border-subtle flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-border-subtle">
        <Logo size="sm" showVersion={false} />
      </div>

      <TooltipProvider delayDuration={200}>
        <nav className="flex-1 py-4 flex flex-col items-center gap-2">
          <div className="relative" ref={addMenuRef}>
            <SidebarButton
              icon={Plus}
              label="Add"
              active={activeTool === 'add'}
              primary
              onClick={() => handleToolClick('add')}
            />

            <AnimatePresence>
              {showAddMenu && (
                <motion.div
                  className="absolute left-14 top-0 w-64 bg-surface-2 border border-border-default rounded-xl shadow-xl z-50"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-2">
                    <div className="px-3 py-2">
                      <h3 className="text-xs font-semibold text-text-tertiary">Add Block</h3>
                    </div>

                    <button
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-3 rounded-md text-text-primary text-sm"
                      onClick={() => {
                        onAddBlock('text');
                        setShowAddMenu(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-surface-3 w-7 h-7 rounded-full flex items-center justify-center">
                          <Type className="h-3.5 w-3.5 text-text-primary" />
                        </div>
                        <span>Text</span>
                      </div>
                      <span className="text-xs text-text-disabled">T</span>
                    </button>

                    <button
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-3 rounded-md text-text-primary text-sm"
                      onClick={() => {
                        onAddBlock('image');
                        setShowAddMenu(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-surface-3 w-7 h-7 rounded-full flex items-center justify-center">
                          <ImageIcon className="h-3.5 w-3.5 text-text-primary" />
                        </div>
                        <span>Image</span>
                      </div>
                      <span className="text-xs text-text-disabled">I</span>
                    </button>

                    <button
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-3 rounded-md text-text-primary text-sm"
                      onClick={() => {
                        onAddBlock('video');
                        setShowAddMenu(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-surface-3 w-7 h-7 rounded-full flex items-center justify-center">
                          <Video className="h-3.5 w-3.5 text-text-primary" />
                        </div>
                        <span>Video</span>
                      </div>
                      <span className="text-xs text-text-disabled">V</span>
                    </button>

                    <div className="border-t border-border-subtle my-2" />

                    <div className="px-3 py-2">
                      <h3 className="text-xs font-semibold text-text-tertiary">Add Source</h3>
                    </div>

                    <button
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-3 rounded-md text-text-primary text-sm"
                      onClick={() => {
                        onAddBlock('upload');
                        setShowAddMenu(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-surface-3 w-7 h-7 rounded-full flex items-center justify-center">
                          <Inbox className="h-3.5 w-3.5 text-text-primary" />
                        </div>
                        <span>Upload</span>
                      </div>
                      <span className="text-xs text-text-disabled">U</span>
                    </button>

                    <div className="border-t border-border-subtle my-2" />

                    <div className="px-3 py-2 space-y-2">
                      <div className="flex items-center justify-between text-xs text-text-tertiary">
                        <span>↑↓ Navigate</span>
                        <span>↵ Select</span>
                      </div>
                      <button className="w-full flex items-center justify-between px-2 py-2 hover:bg-surface-3 rounded-md text-text-primary text-sm">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="h-3.5 w-3.5 text-text-tertiary" />
                          <span>Learn about Blocks</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={flowSelectorRef}>
            <SidebarButton
              icon={Workflow}
              label="Flows"
              active={activeTool === 'templates'}
              onClick={() => handleToolClick('templates')}
            />

            <AnimatePresence>
              {showFlowSelector && (
                <motion.div
                  className="absolute left-14 top-0 w-72 z-50"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <FlowSelector flows={MOCK_FLOWS} onFlowSelect={handleSelectFlow} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <SidebarButton
            icon={Layers}
            label="Layers"
            active={activeTool === 'layers'}
            onClick={() => handleToolClick('layers')}
          />
          <SidebarButton
            icon={FolderOpen}
            label="Assets"
            active={activeTool === 'assets'}
            onClick={() => handleToolClick('assets')}
          />
          <SidebarButton
            icon={History}
            label="History"
            active={activeTool === 'history'}
            onClick={() => handleToolClick('history')}
          />
          <SidebarButton
            icon={Inbox}
            label="Inbox"
            active={activeTool === 'inbox'}
            badge={inboxCount}
            onClick={() => handleToolClick('inbox')}
          />
        </nav>

        <div className="mx-3 h-px bg-border-subtle" />

        <nav className="py-4 flex flex-col items-center gap-2">
          <div className="relative" ref={workflowPanelRef}>
            <SidebarButton
              icon={Wand2}
              label="AI"
              active={activeTool === 'workflow'}
              onClick={() => handleToolClick('workflow')}
            />

            <AnimatePresence>
              {showWorkflowPanel && (
                <motion.div
                  className="absolute left-14 bottom-0 w-80 bg-surface-2 border border-border-default rounded-2xl shadow-2xl z-50 overflow-hidden"
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <WorkflowGeneratorTab onWorkflowGenerated={handleWorkflowGenerated} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <SidebarButton
            icon={Settings}
            label="Settings"
            active={activeTool === 'settings'}
            onClick={() => handleToolClick('settings')}
          />
        </nav>

        <div className="p-3 border-t border-border-subtle flex flex-col items-center gap-3">
          <SidebarButton icon={distributionItem.icon} label={distributionItem.label} href={distributionItem.href} />
          <ProfileButton />
        </div>
      </TooltipProvider>

      <Dialog open={showAssetsModal} onOpenChange={setShowAssetsModal}>
        <DialogContent className="max-w-5xl bg-surface-2 border border-border-default text-text-primary">
          <DialogHeader>
            <DialogTitle>Project assets</DialogTitle>
            <DialogDescription className="text-text-tertiary">
              Upload media and reuse it across Studio, Editor, and Kanvas.
            </DialogDescription>
          </DialogHeader>

          {hasProject ? (
            <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
              <div className="space-y-4">
                <AssetUploader
                  projectId={projectId}
                  assetType="image"
                  label="Media"
                  visibility="project"
                  assetCategory="upload"
                  maxFiles={20}
                  maxSize={500 * 1024 * 1024}
                  acceptedFileTypes={ACCEPTED_STUDIO_FILE_TYPES}
                  getAssetTypeForFile={detectAssetTypeFromFile}
                />
                <p className="text-xs text-text-tertiary">
                  Uploaded assets will instantly appear in the library on the right.
                </p>
              </div>
              <AssetLibrary
                projectId={projectId}
                selectable
                onSelect={handleAssetsSelected}
                className="max-h-[70vh] overflow-y-auto"
              />
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-text-tertiary">
              Select a project to start managing assets.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default StudioSidebar;
