import { useEffect, useMemo, useRef } from 'react';
import { useVideoEditorStore, Clip } from '@/store/videoEditorStore';
import { TimelineTrack } from './TimelineTrack';
import { TimelineRuler } from './TimelineRuler';

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

  const handleScroll = () => {
    if (!scrollRef.current) return;
    setTimelineScroll(scrollRef.current.scrollLeft);
  };

  const handleEmptyClick = () => {
    clearClipSelection();
    clearAudioSelection();
  };

  return (
    <div className="h-[300px] bg-[#0F1117] border-t border-[#1D2130] flex flex-col">
      <TimelineRuler zoom={zoom} scrollOffset={scrollOffset} durationMs={durationMs} />
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        onScroll={handleScroll}
        onClick={handleEmptyClick}
      >
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
