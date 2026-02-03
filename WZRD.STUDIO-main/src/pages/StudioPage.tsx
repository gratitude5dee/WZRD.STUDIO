import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import AppHeader from '@/components/AppHeader';
import StudioSidebar from '@/components/studio/StudioSidebar';
import StudioCanvas from '@/components/studio/StudioCanvas';
import StudioBottomBar from '@/components/studio/StudioBottomBar';
import BlockSettingsModal from '@/components/studio/BlockSettingsModal';
import { SettingsPanel } from '@/components/studio/panels/SettingsPanel';

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import type { AssetType } from '@/types/assets';
import type { Asset } from '@/components/studio/panels/AssetsGalleryPanel';
import type { NodeDefinition, EdgeDefinition } from '@/types/computeFlow';

export interface Block {
  id: string;
  type: 'text' | 'image' | 'video' | 'upload';
  position: {
    x: number;
    y: number;
  };
  initialData?: {
    prompt?: string;
    imageUrl?: string;
    generationTime?: number;
    aspectRatio?: string;
    mode?: string;
    connectedImageUrl?: string;
    connectedImagePrompt?: string;
    assetId?: string;
    assetType?: AssetType;
    assetUrl?: string;
  };
}

const StudioPage = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const { setActiveProject } = useAppStore();
  const { addGeneratedWorkflow, saveGraph, executeGraphStreaming } = useComputeFlowStore();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [blockModels, setBlockModels] = useState<Record<string, string>>({});
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [interactionMode, setInteractionMode] = useState<'pan' | 'select'>('pan');
  const [canvasState, setCanvasState] = useState({
    viewport: { x: 0, y: 0, zoom: 1 },
    settings: { showGrid: true },
  });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPayloadRef = useRef<string | null>(null);
  const lastChangeTypeRef = useRef<'blocks' | 'models' | 'canvas' | null>(null);

  const hashString = (value: string) => {
    let hash = 5381;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 33) ^ value.charCodeAt(i);
    }
    return (hash >>> 0).toString(36);
  };

  const getPayloadSignature = (payload: { blocks: Block[]; canvasState: typeof canvasState }) => {
    const blocksSignature = payload.blocks.map((block) => ({
      id: block.id,
      type: block.type,
      position: block.position,
      initialData: block.initialData,
      selectedModel: (block as Block & { selectedModel?: string }).selectedModel,
    }));

    return hashString(
      JSON.stringify({
        blocks: blocksSignature,
        canvasState: payload.canvasState,
      })
    );
  };

  // Handle workflow generated from right panel
  const handleWorkflowGenerated = useCallback(
    async (nodes: NodeDefinition[], edges: EdgeDefinition[]) => {
      addGeneratedWorkflow(nodes, edges);
      if (projectId) {
        await saveGraph(projectId);
        toast.info('Workflow saved! Starting generation...');
        await executeGraphStreaming(projectId);
      }
    },
    [addGeneratedWorkflow, saveGraph, projectId, executeGraphStreaming]
  );

  // Toggle interaction mode
  const handleToggleInteractionMode = useCallback(() => {
    setInteractionMode((prev) => (prev === 'pan' ? 'select' : 'pan'));
  }, []);

  // Keyboard shortcuts for pan/select mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key.toLowerCase() === 'h') {
        setInteractionMode('pan');
      } else if (e.key.toLowerCase() === 'v') {
        setInteractionMode('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load project state on mount
  useEffect(() => {
    const initializeProject = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }
      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('title')
          .eq('id', projectId)
          .single();
        if (projectError) throw projectError;
        setActiveProject(projectId, projectData?.title || 'Untitled');

        const { data: stateData, error: stateError } = await supabase.functions.invoke(
          'studio-load-state',
          { body: { projectId } }
        );
        if (stateError) throw stateError;
        if (stateData?.blocks) {
          console.log('📥 Loaded blocks from backend:', stateData.blocks.length);
          setBlocks(stateData.blocks);

          const models: Record<string, string> = {};
          stateData.blocks.forEach((block: Block & { selectedModel?: string }) => {
            const initialModel = block.selectedModel || (block.initialData?.imageUrl
              ? 'google/gemini-2.5-flash-image-preview'
              : undefined);
            if (initialModel) {
              models[block.id] = initialModel;
            }
          });
          setBlockModels(models);
        }

        if (stateData?.canvasState) {
          setCanvasState(stateData.canvasState);
        }

        const hydratedBlocks = stateData?.blocks ?? [];
        const hydratedCanvasState = stateData?.canvasState ?? {
          viewport: { x: 0, y: 0, zoom: 1 },
          settings: { showGrid: true },
        };
        lastSavedPayloadRef.current = getPayloadSignature({
          blocks: hydratedBlocks,
          canvasState: hydratedCanvasState,
        });
      } catch (error) {
        console.error('Error initializing project:', error);
        toast.error('Failed to load project state');
      } finally {
        setIsLoading(false);
      }
    };
    initializeProject();
  }, [projectId, setActiveProject]);

  // Auto-save with debounce
  const saveState = useCallback(async () => {
    if (!projectId) return;

    const blocksWithModels = blocks.map((block) => ({
      ...block,
      selectedModel: blockModels[block.id],
    }));

    const payload = {
      blocks: blocksWithModels,
      canvasState,
    };

    const payloadKey = getPayloadSignature(payload);
    if (payloadKey === lastSavedPayloadRef.current) {
      return;
    }

    setIsSaving(true);
    try {
      console.log('💾 Auto-saving state...', { blockCount: blocks.length });
      const { error } = await supabase.functions.invoke('studio-save-state', {
        body: {
          projectId,
          ...payload,
        },
      });
      if (error) throw error;
      setLastSaved(new Date());
      lastSavedPayloadRef.current = payloadKey;
      console.log('✅ State saved successfully');
    } catch (error) {
      console.error('Error saving state:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [projectId, blocks, blockModels, canvasState]);

  // Debounced auto-save effect
  useEffect(() => {
    if (isLoading || !projectId) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const delay = lastChangeTypeRef.current === 'canvas' ? 2000 : 1000;

    saveTimeoutRef.current = setTimeout(() => {
      saveState();
    }, delay);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [blocks, blockModels, canvasState, projectId, isLoading, saveState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleAddBlock = useCallback((blockOrType: Block | 'text' | 'image' | 'video' | 'upload') => {
    const newBlock =
      typeof blockOrType === 'string'
        ? {
            id: uuidv4(),
            type: blockOrType,
            position: {
              x: 400 + Math.random() * 200,
              y: 300 + Math.random() * 200,
            },
          }
        : blockOrType;
    lastChangeTypeRef.current = 'blocks';
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  }, []);

  const handleAssetInsert = useCallback(
    (asset: Asset) => {
      const assetUrl = asset.url;
      if (!assetUrl) {
        toast.error('Asset is still processing. Try again in a moment.');
        return;
      }

      let blockType: 'image' | 'video' | 'text' | 'upload' = 'upload';

      if (asset.type === 'image') {
        blockType = 'image';
      } else if (asset.type === 'video') {
        blockType = 'video';
      } else if (asset.type === 'audio') {
        blockType = 'upload';
      }

      const newBlock: Block = {
        id: uuidv4(),
        type: blockType,
        position: {
          x: 400 + Math.random() * 200,
          y: 300 + Math.random() * 200,
        },
        initialData: {
          imageUrl: asset.type === 'image' ? assetUrl : undefined,
          prompt: asset.name,
          assetId: asset.id,
          assetType: asset.type as AssetType,
          assetUrl,
        },
      };
      handleAddBlock(newBlock);
      toast.success(
        `${asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} asset added to the canvas.`
      );
    },
    [handleAddBlock]
  );

  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      lastChangeTypeRef.current = 'blocks';
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      if (selectedBlockId === blockId) {
        setSelectedBlockId(null);
      }
    },
    [selectedBlockId]
  );

  const handleUpdateBlockPosition = useCallback(
    (blockId: string, position: { x: number; y: number }) => {
      lastChangeTypeRef.current = 'blocks';
      setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, position } : b)));
    },
    []
  );

  const handleUpdateBlockData = useCallback((blockId: string, data: Partial<Block>) => {
    lastChangeTypeRef.current = 'blocks';
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, ...data } : b)));
  }, []);

  const handleSelectBlock = (id: string) => {
    setSelectedBlockId(id || null);
    setIsSettingsModalOpen(!!id);
  };

  const handleModelChange = (blockId: string, modelId: string) => {
    lastChangeTypeRef.current = 'models';
    setBlockModels((prev) => ({
      ...prev,
      [blockId]: modelId,
    }));
  };

  const handleCloseModal = () => {
    setIsSettingsModalOpen(false);
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const selectedBlockType = selectedBlock?.type || null;
  const selectedModel = selectedBlockId ? blockModels[selectedBlockId] : '';

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-white">
      <AppHeader onOpenSettings={() => setIsSettingsPanelOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <StudioSidebar
          onAddBlock={handleAddBlock}
          projectId={projectId}
          interactionMode={interactionMode}
          onToggleInteractionMode={handleToggleInteractionMode}
        />

        <div className="flex-1 flex bg-[#0a0a0a]">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <p className="text-sm text-zinc-400">Loading project...</p>
              </div>
            </div>
          ) : (
            <StudioCanvas
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={handleSelectBlock}
              onAddBlock={handleAddBlock}
              onDeleteBlock={handleDeleteBlock}
              onUpdateBlockPosition={handleUpdateBlockPosition}
              onUpdateBlockData={handleUpdateBlockData}
              blockModels={blockModels}
              onModelChange={handleModelChange}
              projectId={projectId}
              useComputeFlow={true}
              interactionMode={interactionMode}
              onToggleInteractionMode={handleToggleInteractionMode}
              onWorkflowGenerated={handleWorkflowGenerated}
              initialViewport={canvasState.viewport}
              initialSettings={canvasState.settings}
              onViewportChange={(viewport) => {
                lastChangeTypeRef.current = 'canvas';
                setCanvasState((prev) => ({
                  ...prev,
                  viewport,
                }));
              }}
              onCanvasSettingsChange={(settings) => {
                lastChangeTypeRef.current = 'canvas';
                setCanvasState((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    ...settings,
                  },
                }));
              }}
            />
          )}
        </div>

      </div>

      <StudioBottomBar isSaving={isSaving} lastSaved={lastSaved} />

      {/* Settings Panel Overlay */}
      {isSettingsPanelOpen && projectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <SettingsPanel projectId={projectId} onClose={() => setIsSettingsPanelOpen(false)} />
        </div>
      )}

      {/* Block Settings Modal */}
      <BlockSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleCloseModal}
        blockType={selectedBlockType}
        selectedModel={selectedModel}
        onModelChange={(modelId) => {
          if (selectedBlockId) {
            handleModelChange(selectedBlockId, modelId);
          }
        }}
      />
    </div>
  );
};

export default StudioPage;