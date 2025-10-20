
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

const FPS = 30;
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

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
  const lastFrameRef = useRef(0);
  
  const { isPlaying, currentTime, volume } = playback;
  const { duration } = project;

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
  const durationInFrames = Math.max(Math.round((effectiveDuration || 0) * FPS), 1);

  const handleSeek = (newValue: number[]) => {
    const newTime = newValue[0];
    setCurrentTime(newTime);
    const frame = Math.round(newTime * FPS);
    lastFrameRef.current = frame;
    playerRef.current?.seekTo(frame);
  };

  useEffect(() => {
    if (!playerRef.current) return;
    const targetFrame = Math.round(currentTime * FPS);
    if (Math.abs(targetFrame - lastFrameRef.current) > 1) {
      lastFrameRef.current = targetFrame;
      playerRef.current.seekTo(targetFrame);
    }
  }, [currentTime]);

  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying]);

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
        <div className="w-full h-full flex items-center justify-center">
          <Player
            ref={playerRef}
            component={VideoComposition}
            compositionWidth={CANVAS_WIDTH}
            compositionHeight={CANVAS_HEIGHT}
            fps={FPS}
            durationInFrames={durationInFrames}
            inputProps={{ clips, audioTracks }}
            style={{ width: '100%', height: '100%' }}
            className="max-h-full max-w-full"
            controls={false}
            loop={false}
            autoPlay={false}
            clickToPlay={false}
            doubleClickToFullscreen
            spaceKeyToPlayOrPause={false}
            playbackRate={1}
            volume={volume}
            showVolumeControls={false}
            playing={isPlaying}
            onFrameUpdate={(frame) => {
              lastFrameRef.current = frame;
              const time = frame / FPS;
              if (Math.abs(time - currentTime) > 1 / FPS) {
                setCurrentTime(time);
              }
            }}
            onPlay={() => play()}
            onPause={() => pause()}
            onEnded={() => {
              pause();
              setCurrentTime(effectiveDuration);
            }}
          />
        </div>
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
            onClick={() => {
              setCurrentTime(0);
              lastFrameRef.current = 0;
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
              const nextTime = Math.min(project.duration, playback.currentTime + 10);
              setCurrentTime(nextTime);
              const frame = Math.round(nextTime * FPS);
              lastFrameRef.current = frame;
              playerRef.current?.seekTo(frame);
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
