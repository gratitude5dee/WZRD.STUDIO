
import React, { RefObject, useEffect } from 'react';
import { useVideoEditor } from '@/providers/VideoEditorProvider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface PreviewPanelProps {
  videoRef: RefObject<HTMLVideoElement>;
}

const PreviewPanel = ({ videoRef }: PreviewPanelProps) => {
  const {
    playback,
    project,
    togglePlayPause,
    setCurrentTime,
    setDuration
  } = useVideoEditor();

  // Update duration when video metadata is loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoRef, setDuration, setCurrentTime]);

  // Handle seeking
  const handleSeek = (newValue: number[]) => {
    if (videoRef.current) {
      const newTime = newValue[0];
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Format time as MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Video preview */}
      <div className="flex-1 bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          className="max-h-full max-w-full"
          src=""
          poster="/placeholder.svg"
        />
      </div>
      
      {/* Playback controls */}
      <div className="bg-[#0A0D16] border-t border-[#1D2130] p-3">
        {/* Timeline slider */}
        <div className="mb-2 px-2">
          <Slider
            value={[playback.currentTime]}
            min={0}
            max={project.duration || 100}
            step={0.01}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-zinc-400 mt-1">
            <span>{formatTime(playback.currentTime)}</span>
            <span>{formatTime(project.duration)}</span>
          </div>
        </div>
        
        {/* Playback buttons */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#1D2130] p-2 h-9 w-9"
            onClick={() => setCurrentTime(0)}
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#1D2130] bg-[#1D2130] p-2 h-10 w-10 rounded-full"
            onClick={togglePlayPause}
          >
            {playback.isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#1D2130] p-2 h-9 w-9"
            onClick={() => {
              if (videoRef.current) {
                const nextTime = Math.min(project.duration, playback.currentTime + 10);
                setCurrentTime(nextTime);
                videoRef.current.currentTime = nextTime;
              }
            }}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
