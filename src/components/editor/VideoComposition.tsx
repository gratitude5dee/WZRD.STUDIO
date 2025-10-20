import React, { useMemo } from 'react';
// import { AbsoluteFill, Audio, Img, Sequence, Video, useVideoConfig } from 'remotion';
import type { MediaItem } from '@/store/videoEditorStore';

export interface VideoCompositionProps {
  clips: MediaItem[];
  audioTracks: MediaItem[];
}

const MIN_DURATION_FRAMES = 1;

const getTimelineDuration = (item: MediaItem): number => {
  const start = item.startTime ?? 0;
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
  // Remotion not available - placeholder component
  return (
    <div style={{ backgroundColor: '#000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <p>Video Composition Placeholder</p>
    </div>
  );
};

export default VideoComposition;
