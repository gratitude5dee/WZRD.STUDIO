import { useCallback, useEffect, useMemo, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Download } from 'lucide-react';
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
  const setTimelineZoom = useVideoEditorStore((state) => state.setTimelineZoom);

  const togglePlayback = useCallback(() => {
    if (playback.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [pause, play, playback.isPlaying]);

  const skip = useCallback(
    (direction: 'forward' | 'backward') => {
      const delta = direction === 'forward' ? 1000 : -1000;
      const newTime = Math.max(
        0,
        Math.min(playback.currentTime + delta, composition.duration || playback.currentTime + delta)
      );
      seek(newTime);
    },
    [composition.duration, playback.currentTime, seek]
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        togglePlayback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlayback]);

  const currentTimecode = useMemo(() => formatTime(playback.currentTime), [playback.currentTime]);
  const durationTimecode = useMemo(() => formatTime(composition.duration), [composition.duration]);

  return (
    <div className="h-12 bg-[#0F1117] border-b border-[#1D2130] flex items-center px-4 justify-between text-white text-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="text-white hover:bg-[#1D2130]"
          size="icon"
          onClick={() => skip('backward')}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className="text-white hover:bg-[#1D2130]"
          size="icon"
          onClick={togglePlayback}
        >
          {playback.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          className="text-white hover:bg-[#1D2130]"
          size="icon"
          onClick={() => skip('forward')}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        <div className="ml-4 font-mono">
          {currentTimecode} / {durationTimecode}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-[#8E94A8]">
          <span>Zoom</span>
          <Slider
            className="w-32"
            min={10}
            max={400}
            step={5}
            value={[timeline.zoom]}
            onValueChange={(value) => setTimelineZoom(value[0])}
          />
        </div>
        <Button className="bg-[#9b87f5] hover:bg-[#b5a3f9] text-white" onClick={() => setExportDialogOpen(true)}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      <ExportDialog open={isExportDialogOpen} onOpenChange={setExportDialogOpen} />
    </div>
  );
}
