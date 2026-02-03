import { useCallback, useEffect, useMemo, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Download, ZoomOut, ZoomIn, Maximize2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useVideoEditorStore } from '@/store/videoEditorStore';
import { ExportDialog } from './ExportDialog';

const formatTime = (timeMs: number) => {
  const safeTime = Math.max(0, Math.floor(timeMs));
  const minutes = Math.floor(safeTime / 60000);
  const seconds = Math.floor((safeTime % 60000) / 1000);
  const milliseconds = Math.floor((safeTime % 1000) / 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};

export default function PlaybackToolbar() {
  const [isExportDialogOpen, setExportDialogOpen] = useState(false);
  const playback = useVideoEditorStore((state) => state.playback);
  const timeline = useVideoEditorStore((state) => state.timeline);
  const composition = useVideoEditorStore((state) => state.composition);
  const play = useVideoEditorStore((state) => state.play);
  const pause = useVideoEditorStore((state) => state.pause);
  const seek = useVideoEditorStore((state) => state.seek);
  const zoomTimelineIn = useVideoEditorStore((state) => state.zoomTimelineIn);
  const zoomTimelineOut = useVideoEditorStore((state) => state.zoomTimelineOut);
  const clips = useVideoEditorStore((state) => state.clips);
  const audioTracks = useVideoEditorStore((state) => state.audioTracks);

  const totalDurationMs = useMemo(() => {
    const clipDuration = clips.reduce((max, clip) => {
      const end = (clip.startTime ?? 0) + (clip.duration ?? 0);
      return Math.max(max, end);
    }, 0);
    const audioDuration = audioTracks.reduce((max, track) => {
      const end = (track.startTime ?? 0) + (track.duration ?? 0);
      return Math.max(max, end);
    }, 0);
    return Math.max(composition.duration, clipDuration, audioDuration, 8000);
  }, [clips, audioTracks, composition.duration]);

  const togglePlayback = useCallback(() => {
    if (playback.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [pause, play, playback.isPlaying]);

  const skip = useCallback(
    (direction: 'forward' | 'backward') => {
      const delta = direction === 'forward' ? 33 : -33; // ~1 frame at 30fps
      const newTime = Math.max(0, Math.min(playback.currentTime + delta, totalDurationMs));
      seek(newTime);
    },
    [totalDurationMs, playback.currentTime, seek]
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        togglePlayback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlayback]);

  const currentTimecode = useMemo(() => formatTime(playback.currentTime), [playback.currentTime]);
  const durationTimecode = useMemo(() => formatTime(totalDurationMs), [totalDurationMs]);

  return (
    <div className="h-14 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 justify-center shadow-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => skip('backward')}
          className="text-white/70 hover:text-white hover:bg-white/5 w-8 h-8"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayback}
          className="text-white hover:bg-white/10 w-10 h-10 rounded-full bg-[#2a2a2a]"
        >
          {playback.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => skip('forward')}
          className="text-white/70 hover:text-white hover:bg-white/5 w-8 h-8"
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        <span className="text-sm text-white/70 tabular-nums min-w-[120px] text-center mx-2">
          {currentTimecode} | {durationTimecode}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => zoomTimelineOut()}
          className="text-white/70 hover:text-white hover:bg-white/5 w-8 h-8"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>

        <div className="w-24 h-1 bg-[#2a2a2a] rounded-full relative">
          <div 
            className="absolute left-0 top-0 h-full bg-[#10b981] rounded-full transition-all" 
            style={{ width: `${Math.min(100, (timeline.zoom / 200) * 100)}%` }}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => zoomTimelineIn()}
          className="text-white/70 hover:text-white hover:bg-white/5 w-8 h-8"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-white/70 hover:text-white hover:bg-white/5 w-8 h-8"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-white/70 hover:text-white hover:bg-white/5 w-8 h-8"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <ExportDialog open={isExportDialogOpen} onOpenChange={setExportDialogOpen} />
    </div>
  );
}
