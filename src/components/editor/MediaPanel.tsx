
import React, { useRef } from 'react';
import { useVideoEditor } from '@/providers/VideoEditorProvider';
import { Plus, Film, Music, Image, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { AudioTrack, Clip } from '@/store/videoEditorStore';

const MediaPanel = () => {
  const {
    project,
    clips,
    audioTracks,
    addClip,
    addAudioTrack,
    removeClip,
    removeAudioTrack,
    selectClip,
    selectAudioTrack,
    selectedClipIds,
    selectedAudioTrackIds,
  } = useVideoEditor();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !project.id) return;

    const allowedTypes = {
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let mediaType: 'video' | 'image' | 'audio';

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

        const bucket = mediaType === 'audio' ? 'audio' : 'videos';
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${project.id}/${fileName}`;

        const { error: uploadError } = await supabase
          .storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase
          .storage
          .from(bucket)
          .getPublicUrl(filePath);

        const mediaItemId = await supabaseService.media.create(project.id, {
          type: mediaType,
          name: file.name,
          bucket,
          storagePath: filePath,
          durationMs: mediaType === 'image' ? 5000 : undefined,
          startTimeMs: 0,
        });

        if (mediaType === 'audio') {
          addAudioTrack({
            id: mediaItemId.id,
            type: 'audio',
            url: publicUrl,
            name: file.name,
            duration: 5,
            startTime: 0,
            volume: 1,
            isMuted: false,
          });
        } else {
          addClip({
            id: mediaItemId.id,
            type: mediaType,
            url: publicUrl,
            name: file.name,
            duration: 5,
            startTime: 0,
            layer: clips.length,
            transforms: {
              position: { x: 0, y: 0 },
              scale: { x: 1, y: 1 },
              rotation: 0,
              opacity: 1,
            },
          });
        }

        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddMedia = (type: 'video' | 'image' | 'audio') => {
    if (!project.id) {
      toast.error("Please create a project first");
      return;
    }

    const id = uuidv4();

    if (type === 'audio') {
      addAudioTrack({
        id,
        type: 'audio',
        url: '/placeholder-audio.mp3',
        name: `Audio ${audioTracks.length + 1}`,
        duration: 5,
        startTime: 0,
        volume: 1,
        isMuted: false,
      });
      return;
    }

    const clipType = type;
    addClip({
      id,
      type: clipType,
      url: clipType === 'video' ? '/placeholder-video.mp4' : '/placeholder-image.jpg',
      name: `${clipType === 'video' ? 'Video' : 'Image'} ${clips.filter(m => m.type === clipType).length + 1}`,
      duration: 5,
      startTime: 0,
      layer: clips.length,
      transforms: {
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        opacity: 1,
      },
    });
  };

  const handleDeleteMedia = async (id: string, projectId: string) => {
    try {
      // Find the media item to get its type
      const clipItem = clips.find(c => c.id === id);
      const audioItem = audioTracks.find(a => a.id === id);
      const mediaType = clipItem ? clipItem.type : audioItem ? 'audio' : null;
      
      if (!mediaType) return;
      
      await supabaseService.media.delete(id, mediaType);

      if (clips.some(item => item.id === id)) {
        removeClip(id);
      } else if (audioTracks.some(track => track.id === id)) {
        removeAudioTrack(id);
      }

      toast.success("Media deleted successfully");
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete media");
    }
  };

  const totalItems = clips.length + audioTracks.length;

  const renderMediaRow = (item: Clip | AudioTrack) => {
    const isAudio = item.type === 'audio';
    const isSelected = isAudio
      ? selectedAudioTrackIds.includes(item.id)
      : selectedClipIds.includes(item.id);

    const handleSelect = () => {
      if (isAudio) {
        selectAudioTrack(item.id);
      } else {
        selectClip(item.id);
      }
    };

    const duration = item.duration ?? 0;

    return (
      <div
        key={item.id}
        className={`p-2 rounded-md cursor-pointer border ${
          isSelected
            ? 'bg-[#1D2130] border-purple-500'
            : 'border-transparent hover:bg-[#1D2130]'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div onClick={handleSelect}>
            {item.type === 'video' && <Film className="h-5 w-5 text-blue-400" />}
            {item.type === 'image' && <Image className="h-5 w-5 text-purple-400" />}
            {item.type === 'audio' && <Music className="h-5 w-5 text-yellow-400" />}
          </div>
          <div className="flex-1 overflow-hidden" onClick={handleSelect}>
            <div className="text-sm font-medium truncate">{item.name}</div>
            <div className="text-xs text-zinc-400">{Math.round(duration)}s</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-zinc-400 hover:text-white hover:bg-red-900/30"
            onClick={() => handleDeleteMedia(item.id, project.id!)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
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
        {totalItems === 0 ? (
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
          <>
            {clips.map(renderMediaRow)}
            {audioTracks.map(renderMediaRow)}
          </>
        )}
      </div>
    </div>
  );
};

export default MediaPanel;
