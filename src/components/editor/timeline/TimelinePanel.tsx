import { useEffect, useMemo, useRef } from 'react';
import { useVideoEditorStore, Clip } from '@/store/videoEditorStore';
import { TimelineTrack } from './TimelineTrack';
import { TimelineRuler } from './TimelineRuler';
import TimelinePlayhead from '../TimelinePlayhead';

export default function TimelinePanel() {
  const clips = useVideoEditorStore((state) => state.clips);
  const audioTracks = useVideoEditorStore((state) => state.audioTracks);
  const zoom = useVideoEditorStore((state) => state.timeline.zoom);
  const scrollOffset = useVideoEditorStore((state) => state.timeline.scrollOffset);
  const setTimelineScroll = useVideoEditorStore((state) => state.setTimelineScroll);
  const composition = useVideoEditorStore((state) => state.composition);
  const selectClip = useVideoEditorStore((state) => state.selectClip);
  const selectAudioTrack = useVideoEditorStore((state) => state.selectAudioTrack);
  const clearClipSelection = useVideoEditorStore((state) => state.clearClipSelection);
  const clearAudioSelection = useVideoEditorStore((state) => state.clearAudioTrackSelection);
  const selectedClipIds = useVideoEditorStore((state) => state.selectedClipIds);
  const selectedAudioTrackIds = useVideoEditorStore((state) => state.selectedAudioTrackIds);
  const playback = useVideoEditorStore((state) => state.playback);
  const scrollRef = useRef<HTMLDivElement>(null);

  const videoTracks = useMemo(() => groupByTrack(clips), [clips]);

  const durationMs = useMemo(() => {
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

    return Math.max(composition.duration, clipDuration, audioDuration);
  }, [audioTracks, clips, composition.duration]);

  useEffect(() => {
    if (scrollRef.current && Math.abs(scrollRef.current.scrollLeft - scrollOffset) > 2) {
      scrollRef.current.scrollLeft = scrollOffset;
    }
  }, [scrollOffset]);

  // Auto-scroll timeline during playback
  useEffect(() => {
    if (playback.isPlaying && scrollRef.current) {
      const playheadPosition = (playback.currentTime / 1000) * zoom;
      const viewportWidth = scrollRef.current.clientWidth;
      const scrollLeft = scrollRef.current.scrollLeft;
      
      // Auto-scroll if playhead is near right edge (within 100px) or past it
      if (playheadPosition > scrollLeft + viewportWidth - 100) {
        scrollRef.current.scrollTo({
          left: playheadPosition - 200,
          behavior: 'smooth'
        });
      }
    }
  }, [playback.currentTime, playback.isPlaying, zoom]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    setTimelineScroll(scrollRef.current.scrollLeft);
  };

  const handleEmptyClick = () => {
    clearClipSelection();
    clearAudioSelection();
  };

  return (
    <div className="h-full bg-muted/30 flex flex-col border-t border-border">
      <TimelineRuler zoom={zoom} scrollOffset={scrollOffset} durationMs={durationMs} />
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto bg-muted/20 relative"
        onScroll={handleScroll}
        onClick={handleEmptyClick}
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, hsl(var(--border) / 0.3) 19px, hsl(var(--border) / 0.3) 20px)',
        }}
      >
        {/* Playhead */}
        <TimelinePlayhead
          currentTime={playback.currentTime / 1000}
          duration={durationMs / 1000}
          pixelsPerSecond={zoom}
          scrollOffset={scrollOffset}
        />
        {videoTracks.length === 0 && audioTracks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Drop media files here to create timeline clips
          </div>
        )}
        {videoTracks.map((trackClips, index) => (
          <TimelineTrack
            key={`video-${index}`}
            type="video"
            index={index}
            clips={trackClips}
            zoom={zoom}
            selectedIds={selectedClipIds}
            onSelect={(clipId, additive) => selectClip(clipId, additive)}
          />
        ))}
        {audioTracks.map((track, index) => (
          <TimelineTrack
            key={`audio-${track.id}`}
            type="audio"
            index={index}
            audioTrack={track}
            zoom={zoom}
            selectedIds={selectedAudioTrackIds}
            onSelect={(trackId, additive) => selectAudioTrack(trackId, additive)}
          />
        ))}
      </div>
    </div>
  );
}

function groupByTrack(clips: Clip[]): Clip[][] {
  const tracks = new Map<number, Clip[]>();
  clips.forEach((clip) => {
    const trackIndex = clip.trackIndex ?? 0;
    if (!tracks.has(trackIndex)) {
      tracks.set(trackIndex, []);
    }
    tracks.get(trackIndex)!.push(clip);
  });
  return Array.from(tracks.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, value]) => value);
}
