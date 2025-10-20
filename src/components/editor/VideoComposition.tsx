import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Img, Sequence, Video, useVideoConfig } from 'remotion';
import type { MediaItem } from '@/store/videoEditorStore';

export interface VideoCompositionProps {
  clips: MediaItem[];
  audioTracks: MediaItem[];
}

const MIN_DURATION_FRAMES = 1;

const getTimelineDuration = (item: MediaItem): number => {
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
  const videoConfig = useVideoConfig();
  const fps = videoConfig?.fps ?? 30;

  const sortedClips = useMemo(
    () =>
      [...clips].sort((a, b) => {
        const startA = a.startTime ?? 0;
        const startB = b.startTime ?? 0;
        return startA - startB;
      }),
    [clips]
  );

  const sortedAudioTracks = useMemo(
    () =>
      [...audioTracks].sort((a, b) => {
        const startA = a.startTime ?? 0;
        const startB = b.startTime ?? 0;
        return startA - startB;
      }),
    [audioTracks]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {sortedClips.map((clip) => {
        const from = getStartFrame(clip, fps);
        const durationInFrames = getDurationInFrames(clip, fps);

        return (
          <Sequence key={clip.id} from={from} durationInFrames={durationInFrames}>
            {clip.type === 'video' ? (
              <Video src={clip.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Img src={clip.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </Sequence>
        );
      })}

      {sortedAudioTracks.map((track) => {
        if (track.type !== 'audio') {
          return null;
        }

        const from = getStartFrame(track, fps);
        const durationInFrames = getDurationInFrames(track, fps);
        const volume = track.isMuted ? 0 : track.volume;

        return (
          <Sequence key={track.id} from={from} durationInFrames={durationInFrames}>
            <Audio src={track.url} volume={volume} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default VideoComposition;
