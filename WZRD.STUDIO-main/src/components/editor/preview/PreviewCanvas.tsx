import { useEffect, useMemo, useRef } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { useVideoEditorStore } from '@/store/videoEditorStore';
import { EditorComposition } from '../remotion/EditorComposition';
import { CanvasControls } from './CanvasControls';

interface PreviewCanvasProps {
  selectedClipIds: string[];
}

export default function PreviewCanvas({ selectedClipIds }: PreviewCanvasProps) {
  const clips = useVideoEditorStore((state) => state.clips);
  const audioTracks = useVideoEditorStore((state) => state.audioTracks);
  const composition = useVideoEditorStore((state) => state.composition);
  const playback = useVideoEditorStore((state) => state.playback);
  const seek = useVideoEditorStore((state) => state.seek);
  const pause = useVideoEditorStore((state) => state.pause);
  const keyframes = useVideoEditorStore((state) => state.keyframes);
  const playerRef = useRef<PlayerRef>(null);

  const totalDurationMs = useMemo(() => {
    const clipDuration = clips.reduce((max, clip) => {
      const start = clip.startTime ?? 0;
      const end = start + (clip.duration ?? 0);
      return Math.max(max, end);
    }, 0);

    const audioDuration = audioTracks.reduce((max, track) => {
      const start = track.startTime ?? 0;
      const end = start + (track.duration ?? 0);
      return Math.max(max, end);
    }, 0);

    return Math.max(composition.duration, clipDuration, audioDuration, 1000);
  }, [audioTracks, clips, composition.duration]);

  const durationInFrames = useMemo(() => {
    return Math.max(1, Math.ceil((totalDurationMs / 1000) * composition.fps));
  }, [composition.fps, totalDurationMs]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const handler = ({ detail }: { detail: { frame: number } }) => {
      const currentTime = (detail.frame / composition.fps) * 1000;
      console.log('🎬 Player timeupdate:', { frame: detail.frame, currentTime });
      seek(currentTime);
    };

    player.addEventListener('timeupdate', handler);
    return () => player.removeEventListener('timeupdate', handler);
  }, [composition.fps, seek]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) {
      console.warn('⚠️ Player ref not ready');
      return;
    }
    
    console.log('🎬 Playback state changed:', playback.isPlaying);
    
    if (playback.isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [playback.isPlaying]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const desiredFrame = Math.max(0, Math.round((playback.currentTime / 1000) * composition.fps));
    const currentFrame = player.getCurrentFrame();
    if (currentFrame !== desiredFrame) {
      player.seekTo(desiredFrame);
    }
  }, [composition.fps, playback.currentTime]);

  const aspectRatioValue = useMemo(() => {
    const [w, h] = composition.aspectRatio.split(':').map(Number);
    return w && h ? `${w} / ${h}` : '16 / 9';
  }, [composition.aspectRatio]);

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Video Preview */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-transparent to-muted/10" />
        <div 
          className="relative w-full max-w-[1280px] mx-auto shadow-2xl rounded-lg overflow-hidden border border-border/50"
          style={{ aspectRatio: aspectRatioValue }}
        >
          <Player
            ref={playerRef}
            component={EditorComposition as any}
            durationInFrames={durationInFrames}
            fps={composition.fps}
            compositionWidth={composition.width}
            compositionHeight={composition.height}
            inputProps={{
              clips,
              audioTracks,
              composition,
              selectedClipIds,
              keyframes,
            }}
            controls={false}
            spaceKeyToPlayOrPause={false}
            clickToPlay={false}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Canvas Controls */}
      <CanvasControls />
    </div>
  );
}
