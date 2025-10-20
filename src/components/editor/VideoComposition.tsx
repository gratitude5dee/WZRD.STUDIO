import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Img, Sequence, Video, useVideoConfig } from 'remotion';
import type { MediaItem } from '@/store/videoEditorStore';

export interface VideoCompositionProps {
  clips: MediaItem[];
  audioTracks: MediaItem[];
}

const MIN_DURATION_FRAMES = 1;

const getTimelineDuration = (item: MediaItem): number => {
  const start = item.startTime ?? 0;
  if (typeof item.endTime === 'number') {
    return Math.max(item.endTime - start, item.duration ?? 0, 0);
  }

  return Math.max(item.duration ?? 0, 0);
};

const getDurationInFrames = (item: MediaItem, fps: number) => {
  const seconds = getTimelineDuration(item);
  return Math.max(Math.round(seconds * fps), MIN_DURATION_FRAMES);
};

const getStartFrame = (item: MediaItem, fps: number) => {
  const startSeconds = item.startTime ?? 0;
  return Math.max(Math.round(startSeconds * fps), 0);
};

export const VideoComposition: React.FC<VideoCompositionProps> = ({ clips, audioTracks }) => {
  const { fps } = useVideoConfig();

  const orderedClips = useMemo(
    () => [...clips].sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0)),
    [clips]
  );

  const orderedAudio = useMemo(
    () => [...audioTracks].sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0)),
    [audioTracks]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {orderedClips.map((clip) => (
        <Sequence
          key={clip.id}
          from={getStartFrame(clip, fps)}
          durationInFrames={getDurationInFrames(clip, fps)}
        >
          {clip.type === 'image' ? (
            <Img src={clip.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Video src={clip.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </Sequence>
      ))}

      {orderedAudio.map((track) => (
        <Sequence
          key={track.id}
          from={getStartFrame(track, fps)}
          durationInFrames={getDurationInFrames(track, fps)}
        >
          <Audio src={track.url} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default VideoComposition;
