import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Share2, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import InfiniteCanvas from '@/components/canvas/InfiniteCanvas';
import { LayersPanel } from '@/components/canvas/LayersPanel';
import { LeftSidebar } from '@/components/canvas/LeftSidebar';
import { GenerationPanel } from '@/components/canvas/GenerationPanel';
import { CollaboratorsPanel } from '@/components/canvas/CollaboratorsPanel';
import { CanvasContextMenu } from '@/components/canvas/CanvasContextMenu';
import { Cursors } from '@/components/canvas/Cursors';
import { ExportDialog } from '@/components/canvas/ExportDialog';
import { ShareDialog } from '@/components/canvas/ShareDialog';
import { useCanvasStore } from '@/lib/stores/canvas-store';
import { useAuth } from '@/providers/AuthProvider';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { usePresence } from '@/hooks/usePresence';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAutoSave } from '@/hooks/useAutoSave';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { CanvasObject, ImageData } from '@/types/canvas';

export default function KanvasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [projectId, setProjectId] = useState<string>('temp-project');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { objects, addObject, setProjectId: setStoreProjectId } = useCanvasStore();
  
  // Real-time sync
  useRealtimeSync(projectId);
  
  // Presence tracking
  const { onlineUsers, updateCursor } = usePresence(projectId);
  
  // Auto-save
  const { forceSave } = useAutoSave({
    projectId,
    data: { objects },
    enabled: true,
    debounceMs: 2000,
    onSaveStart: () => setSaveStatus('saving'),
    onSaveSuccess: () => setSaveStatus('saved'),
    onSaveError: () => setSaveStatus('error'),
  });

  // Initialize project
  useEffect(() => {
    const initializeProject = async () => {
      if (!user) return;

      try {
        // Try to load existing project or create new one
        const { data: existingProjects } = await supabase
          .from('canvas_projects')
          .select('id')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);

        let projectId: string;

        if (existingProjects && existingProjects.length > 0) {
          projectId = existingProjects[0].id;
        } else {
          // Create new project
          const { data: newProject, error } = await supabase
            .from('canvas_projects')
            .insert({
              user_id: user.id,
              name: 'Untitled Canvas',
              settings: {},
              viewport: { x: 0, y: 0, scale: 1 }
            })
            .select('id')
            .single();

          if (error) throw error;
          projectId = newProject.id;
        }

        setProjectId(projectId);
        setStoreProjectId(projectId);
      } catch (error) {
        console.error('Failed to initialize project:', error);
        toast.error('Failed to initialize canvas project');
      }
    };

    initializeProject();
  }, [user, setStoreProjectId]);

  // Update canvas size based on container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasContainerRef.current) {
        const { width, height } = canvasContainerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const handleSaveProject = async () => {
    try {
      toast.loading('Saving project...', { id: 'save-project' });

      // Here you would save to Supabase
      // For now, we'll just save to localStorage as a backup
      localStorage.setItem(`kanvas-project-${projectId}`, JSON.stringify({
        objects,
        projectId,
        savedAt: new Date().toISOString(),
      }));

      toast.success('Project saved successfully', { id: 'save-project' });
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save project', { id: 'save-project' });
    }
  };

  const handleExportImage = async () => {
    setExportDialogOpen(true);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Uploading image...', { id: 'upload-image' });

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `kanvas/${user?.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Create image object
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const newObject: CanvasObject = {
          id: crypto.randomUUID(),
          type: 'image',
          layerIndex: objects.length,
          transform: {
            x: 100,
            y: 100,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
          },
          visibility: true,
          locked: false,
          data: {
            url: urlData.publicUrl,
            width: img.width,
            height: img.height,
          } as ImageData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addObject(newObject);
        toast.success('Image uploaded successfully', { id: 'upload-image' });
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image', { id: 'upload-image' });
    }
  };

  // Keyboard shortcuts (after functions are defined)
  useKeyboardShortcuts(handleExportImage, handleSaveProject);

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0A]">
      {/* Top Header with Logo */}
      <header className="h-16 border-b border-border/30 flex items-center px-6 bg-[#0A0A0A]">
        <Logo className="h-8 w-auto" />
      </header>

      {/* Secondary Header with Navigation */}
      <header className="h-14 border-b border-border/30 flex items-center justify-between px-4 bg-[#0A0A0A]">
        <div className="flex items-center gap-4 animate-pulse">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/home')}
            className="text-purple-400 hover:text-purple-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
          </Button>
          <h1 className="text-lg font-semibold text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-pulse">
            Kanvas Project
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>

          <Button variant="outline" size="sm" onClick={handleSaveProject} className="relative">
            <Save className={`w-4 h-4 mr-2 ${saveStatus === 'saving' ? 'animate-pulse' : ''}`} />
            {saveStatus === 'error' && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
            )}
            Save
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportImage}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button variant="default" size="sm" onClick={() => setShareDialogOpen(true)}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Canvas Area */}
        <div ref={canvasContainerRef} className="flex-1 relative">
          <InfiniteCanvas
            projectId={projectId}
            width={canvasSize.width}
            height={canvasSize.height}
            onObjectSelect={(ids) => setSelectedIds(ids)}
          />
          
          {/* Collaborators Panel */}
          <CollaboratorsPanel projectId={projectId} onlineUsers={onlineUsers} />
          
          {/* Other users' cursors */}
          <Cursors users={onlineUsers} currentUserId={user?.id} />
          
          {/* Context Menu */}
          {contextMenu && (
            <CanvasContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onClose={() => setContextMenu(null)}
              onAiTransform={() => {
                setContextMenu(null);
                // Focus on generation panel
                document.querySelector('.generation-panel')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          )}
          
          {/* AI Generation Panel */}
          <GenerationPanel />
        </div>

        {/* Right Panel - Layers */}
        <div className="w-80 border-l border-border/30">
          <LayersPanel />
        </div>
      </div>
      
      {/* Dialogs */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        objects={objects}
        viewport={{ x: 0, y: 0, scale: 1 }}
        selectedIds={selectedIds}
      />
      
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        canvasId={projectId}
      />
    </div>
  );
}
