
import React, { useEffect, useMemo, useRef } from 'react';
import { useVideoEditor } from '@/providers/VideoEditorProvider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Player, PlayerRef } from '@remotion/player';
import VideoComposition from './VideoComposition';
import type { MediaItem } from '@/store/videoEditorStore';

interface PreviewPanelProps {
  clips: MediaItem[];
  audioTracks: MediaItem[];
}

const PreviewPanel = ({ clips, audioTracks }: PreviewPanelProps) => {
  const {
    playback,
    project,
    togglePlayPause,
    setCurrentTime,
    setDuration,
    play,
    pause
  } = useVideoEditor();

  const playerRef = useRef<PlayerRef>(null);

  const { isPlaying, currentTime } = playback;
  const { duration, fps: projectFps, resolution } = project;

  const fps = projectFps > 0 ? projectFps : 30;
  const compositionWidth = resolution?.width ?? 1920;
  const compositionHeight = resolution?.height ?? 1080;

  const compositionProps = useMemo(() => ({ clips, audioTracks }), [clips, audioTracks]);

  const fallbackDuration = useMemo(() => {
    const clipMax = clips.reduce((max, clip) => {
      const start = clip.startTime ?? 0;
      const clipDuration = clip.duration ?? 0;
      return Math.max(max, start + clipDuration);
    }, 0);

    const audioMax = audioTracks.reduce((max, track) => {
      const start = track.startTime ?? 0;
      const trackDuration = track.duration ?? 0;
      return Math.max(max, start + trackDuration);
    }, 0);

    return Math.max(clipMax, audioMax, 0);
  }, [clips, audioTracks]);

  const effectiveDuration = duration > 0 ? duration : fallbackDuration;
  const durationInFrames = Math.max(Math.round((effectiveDuration || 0) * fps), 1);
  const currentFrame = Math.min(durationInFrames - 1, Math.max(0, Math.round(currentTime * fps)));

  const handleSeek = (newValue: number[]) => {
    const newTime = newValue[0];
    setCurrentTime(newTime);
    if (playerRef.current) {
      const targetFrame = Math.max(0, Math.min(durationInFrames - 1, Math.round(newTime * fps)));
      playerRef.current.seekTo(targetFrame);
    }
  };

  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    playerRef.current?.setVolume?.(playback.volume);
  }, [playback.volume]);

  useEffect(() => {
    if (effectiveDuration > 0 && Math.abs(duration - effectiveDuration) > 0.001) {
      setDuration(effectiveDuration);
    }
  }, [duration, effectiveDuration, setDuration]);

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
        <div className="w-full h-full max-h-full flex items-center justify-center">
          <div className="w-full h-full" style={{ aspectRatio: `${compositionWidth} / ${compositionHeight}` }}>
            <Player
              ref={playerRef}
              component={VideoComposition as any}
              durationInFrames={durationInFrames}
              fps={fps}
              compositionWidth={compositionWidth}
              compositionHeight={compositionHeight}
              inputProps={compositionProps}
              controls={false}
              loop={playback.isLooping}
              autoPlay={false}
              clickToPlay={false}
              doubleClickToFullscreen={false}
              playbackRate={playback.playbackRate}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Playback controls */}
      <div className="bg-[#0A0D16] border-t border-[#1D2130] p-3">
        {/* Timeline slider */}
        <div className="mb-2 px-2">
          <Slider
            value={[playback.currentTime]}
            min={0}
            max={effectiveDuration || 0}
            step={0.01}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-zinc-400 mt-1">
            <span>{formatTime(playback.currentTime)}</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Playback buttons */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#1D2130] p-2 h-9 w-9"
            onClick={() => {
              setCurrentTime(0);
              playerRef.current?.seekTo(0);
            }}
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
              const nextTime = Math.min(effectiveDuration, playback.currentTime + 10);
              setCurrentTime(nextTime);
              if (playerRef.current) {
                const nextFrame = Math.round(nextTime * fps);
                playerRef.current.seekTo(Math.min(durationInFrames - 1, nextFrame));
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
