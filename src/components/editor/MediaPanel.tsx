
import React, { useRef } from 'react';
import { useVideoEditor } from '@/providers/VideoEditorProvider';
import { Plus, Film, Music, Image, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

const MediaPanel = () => {
  const { 
    mediaItems, 
    addMediaItem,
    removeMediaItem,
    selectMediaItem,
    selectedMediaIds,
    projectId
  } = useVideoEditor();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Function to handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !projectId) return;

    const allowedTypes = {
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg']
    };

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let mediaType: 'video' | 'image' | 'audio';
      
      // Determine media type
      if (allowedTypes.video.includes(file.type)) {
        mediaType = 'video';
      } else if (allowedTypes.image.includes(file.type)) {
        mediaType = 'image';
      } else if (allowedTypes.audio.includes(file.type)) {
        mediaType = 'audio';
      } else {
        toast.error(`Unsupported file type: ${file.type}`);
        continue;
      }

      try {
        toast.info(`Uploading ${file.name}...`);
        
        // Upload file to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${projectId}/${fileName}`;
        const bucket = mediaType === 'audio' ? 'audio' : 'videos';

        const { error: uploadError } = await supabase
          .storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const metadata = {
          mimeType: file.type,
          size: file.size,
          originalName: file.name
        };

        // Create media item in database and map to UI shape
        const createdItem = await supabaseService.media.create(projectId, {
          type: mediaType,
          name: file.name,
          bucket,
          storagePath: filePath,
          durationMs: mediaType === 'image' ? 5000 : undefined,
          startTimeMs: 0,
          metadata
        });

        // Add to local state
        addMediaItem(createdItem);
        
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Mock function to add media items
  const handleAddMedia = (type: 'video' | 'image' | 'audio') => {
    if (!projectId) {
      toast.error("Please create a project first");
      return;
    }
    
    const newMedia: Record<string, any> = {
      id: uuidv4(),
      type,
      startTime: 0,
      duration: 5,
    };
    
    switch (type) {
      case 'video':
        newMedia.name = `Video ${mediaItems.filter(m => m.type === 'video').length + 1}`;
        newMedia.url = '/placeholder.svg';
        break;
      case 'image':
        newMedia.name = `Image ${mediaItems.filter(m => m.type === 'image').length + 1}`;
        newMedia.url = '/placeholder.svg';
        break;
      case 'audio':
        newMedia.name = `Audio ${mediaItems.filter(m => m.type === 'audio').length + 1}`;
        newMedia.url = '';
        break;
    }
    
    addMediaItem(newMedia as any);
  };
  
  // Delete media item
  const handleDeleteMedia = async (id: string) => {
    try {
      // Remove from database
      const mediaItem = mediaItems.find(item => item.id === id);
      if (!mediaItem) {
        toast.error('Media item not found');
        return;
      }

      await supabaseService.media.delete(id, mediaItem.type);
      
      // Remove from local state
      removeMediaItem(id);
      toast.success("Media deleted successfully");
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete media");
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex-none flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Media Library</h3>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-[#1D2130] h-8 w-8 p-0"
            onClick={() => handleAddMedia('video')}
          >
            <Film className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-[#1D2130] h-8 w-8 p-0"
            onClick={() => handleAddMedia('image')}
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-[#1D2130] h-8 w-8 p-0"
            onClick={() => handleAddMedia('audio')}
          >
            <Music className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-[#1D2130] h-8 w-8 p-0"
            onClick={handleUploadClick}
          >
            <Upload className="h-4 w-4" />
          </Button>
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept="video/*, image/*, audio/*"
          />
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        {mediaItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Plus className="h-8 w-8 text-zinc-500 mb-2" />
            <p className="text-sm text-zinc-400">Add media to your project</p>
            <Button 
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleUploadClick}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          </div>
        ) : (
          mediaItems.map((item) => (
            <div 
              key={item.id}
              className={`p-2 rounded-md cursor-pointer border ${
                selectedMediaIds.includes(item.id) 
                  ? 'bg-[#1D2130] border-purple-500' 
                  : 'border-transparent hover:bg-[#1D2130]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div onClick={() => selectMediaItem(item.id)}>
                  {item.type === 'video' && <Film className="h-5 w-5 text-blue-400" />}
                  {item.type === 'image' && <Image className="h-5 w-5 text-green-400" />}
                  {item.type === 'audio' && <Music className="h-5 w-5 text-yellow-400" />}
                </div>
                <div 
                  className="flex-1 overflow-hidden"
                  onClick={() => selectMediaItem(item.id)}
                >
                  <div className="text-sm font-medium truncate">{item.name}</div>
                  <div className="text-xs text-zinc-400">{item.duration}s</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-zinc-400 hover:text-white hover:bg-red-900/30"
                  onClick={() => handleDeleteMedia(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MediaPanel;
