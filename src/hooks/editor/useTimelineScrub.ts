import { useCallback, useEffect, useRef } from 'react';
import { useVideoEditorStore } from '@/store/videoEditorStore';

interface ScrubOptions {
  snapToFrames?: boolean;
  snapToClips?: boolean;
  snapThreshold?: number; // in seconds
}

export function useTimelineScrub(options: ScrubOptions = {}) {
  const {
    playback,
    setCurrentTime,
    clips,
    audioTracks,
    composition,
  } = useVideoEditorStore();
  
  const isScrubbing = useRef(false);
  const scrubStartTime = useRef(0);

  const {
    snapToFrames = true,
    snapToClips = true,
    snapThreshold = 0.1,
  } = options;

  const getSnapPoints = useCallback(() => {
    const points: number[] = [0]; // Always snap to start

    if (snapToClips) {
      // Add clip start and end times
      clips.forEach((clip) => {
        points.push(clip.startTime);
        points.push(clip.startTime + clip.duration);
      });

      // Add audio track start and end times
      audioTracks.forEach((track) => {
        points.push(track.startTime);
        points.push(track.startTime + track.duration);
      });
    }

    return [...new Set(points)].sort((a, b) => a - b);
  }, [clips, audioTracks, snapToClips]);

  const snapTime = useCallback(
    (time: number): number => {
      // Snap to frames
      if (snapToFrames) {
        const frameTime = 1 / composition.fps;
        time = Math.round(time / frameTime) * frameTime;
      }

      // Snap to clip edges
      if (snapToClips) {
        const snapPoints = getSnapPoints();
        const nearest = snapPoints.find(
          (point) => Math.abs(point - time) < snapThreshold
        );
        if (nearest !== undefined) {
          return nearest;
        }
      }

      return Math.max(0, Math.min(time, composition.duration));
    },
    [snapToFrames, snapToClips, snapThreshold, composition, getSnapPoints]
  );

  const startScrub = useCallback((time: number) => {
    isScrubbing.current = true;
    scrubStartTime.current = time;
    const snappedTime = snapTime(time);
    setCurrentTime(snappedTime);
  }, [snapTime, setCurrentTime]);

  const updateScrub = useCallback(
    (time: number) => {
      if (!isScrubbing.current) return;
      const snappedTime = snapTime(time);
      setCurrentTime(snappedTime);
    },
    [snapTime, setCurrentTime]
  );

  const endScrub = useCallback(() => {
    isScrubbing.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isScrubbing.current = false;
    };
  }, []);

  return {
    isScrubbing: isScrubbing.current,
    startScrub,
    updateScrub,
    endScrub,
    snapTime,
  };
}
