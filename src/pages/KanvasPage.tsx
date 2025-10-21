import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Share2, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import InfiniteCanvas from '@/components/canvas/InfiniteCanvas';
import { LayersPanel } from '@/components/canvas/LayersPanel';
import { LeftSidebar } from '@/components/canvas/LeftSidebar';
import { AIChat } from '@/components/canvas/AIChat';
import { useCanvasStore } from '@/lib/stores/canvas-store';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { CanvasObject, ImageData } from '@/types/canvas';

export default function KanvasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [projectId, setProjectId] = useState<string>('temp-project');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { objects, addObject, setProjectId: setStoreProjectId } = useCanvasStore();

  // Initialize project
  useEffect(() => {
    if (user) {
      // Generate or load project ID
      const tempId = `kanvas-${user.id}-${Date.now()}`;
      setProjectId(tempId);
      setStoreProjectId(tempId);
    }
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
    try {
      toast.info('Export functionality coming soon!');
      // Here you would export the canvas to an image
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export image');
    }
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

          <Button variant="outline" size="sm" onClick={handleSaveProject}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportImage}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button variant="default" size="sm">
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
          
          {/* AI Chat Interface */}
          <AIChat />
        </div>

        {/* Right Panel - Layers */}
        <div className="w-80 border-l border-border/30">
          <LayersPanel />
        </div>
      </div>
    </div>
  );
}
