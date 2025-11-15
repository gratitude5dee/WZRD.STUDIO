import { useEffect } from 'react';
import { useVideoEditorStore } from '@/store/videoEditorStore';

const isMac = typeof navigator !== 'undefined' ? /Mac/i.test(navigator.platform) : false;

export function useEditorShortcuts() {
  const play = useVideoEditorStore((state) => state.play);
  const pause = useVideoEditorStore((state) => state.pause);
  const togglePlayPause = useVideoEditorStore((state) => state.togglePlayPause);
  const seek = useVideoEditorStore((state) => state.seek);
  const playback = useVideoEditorStore((state) => state.playback);
  const selectedClipIds = useVideoEditorStore((state) => state.selectedClipIds);
  const removeClip = useVideoEditorStore((state) => state.removeClip);
  const removeAudioTrack = useVideoEditorStore((state) => state.removeAudioTrack);
  const selectedAudioTrackIds = useVideoEditorStore((state) => state.selectedAudioTrackIds);
  const setTimelineZoom = useVideoEditorStore((state) => state.setTimelineZoom);
  const timeline = useVideoEditorStore((state) => state.timeline);
  const undo = useVideoEditorStore((state) => state.undo);
  const redo = useVideoEditorStore((state) => state.redo);
  const setInPoint = useVideoEditorStore((state) => state.setInPoint);
  const setOutPoint = useVideoEditorStore((state) => state.setOutPoint);
  const copySelectedClips = useVideoEditorStore((state) => state.copySelectedClips);
  const pasteClipboard = useVideoEditorStore((state) => state.pasteClipboard);
  const nudgeSelectedClips = useVideoEditorStore((state) => state.nudgeSelectedClips);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      const meta = isMac ? event.metaKey : event.ctrlKey;
      const shift = event.shiftKey;

      if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (key) {
        case ' ':
          event.preventDefault();
          togglePlayPause();
          return;
        case 'j':
          event.preventDefault();
          seek(Math.max(0, playback.currentTime - 500));
          return;
        case 'k':
          event.preventDefault();
          pause();
          return;
        case 'l':
          event.preventDefault();
          play();
          return;
        case 'Delete':
        case 'Backspace':
          if (selectedClipIds.length === 0 && selectedAudioTrackIds.length === 0) return;
          event.preventDefault();
          selectedClipIds.forEach((id) => removeClip(id));
          selectedAudioTrackIds.forEach((id) => removeAudioTrack(id));
          return;
        case 'ArrowLeft':
          event.preventDefault();
          nudgeSelectedClips(-timeline.gridSize);
          return;
        case 'ArrowRight':
          event.preventDefault();
          nudgeSelectedClips(timeline.gridSize);
          return;
        case '+':
          event.preventDefault();
          setTimelineZoom(timeline.zoom + 10);
          return;
        case '-':
          event.preventDefault();
          setTimelineZoom(timeline.zoom - 10);
          return;
        case 'i':
          event.preventDefault();
          setInPoint(playback.currentTime);
          return;
        case 'o':
          event.preventDefault();
          setOutPoint(playback.currentTime);
          return;
        default:
          break;
      }

      if (meta && key.toLowerCase() === 'z') {
        event.preventDefault();
        if (shift) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (meta && key.toLowerCase() === 'c') {
        event.preventDefault();
        copySelectedClips();
        return;
      }

      if (meta && key.toLowerCase() === 'v') {
        event.preventDefault();
        pasteClipboard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    copySelectedClips,
    nudgeSelectedClips,
    pasteClipboard,
    pause,
    play,
    playback.currentTime,
    redo,
    removeAudioTrack,
    removeClip,
    selectedAudioTrackIds,
    selectedClipIds,
    seek,
    setInPoint,
    setOutPoint,
    setTimelineZoom,
    timeline.gridSize,
    timeline.zoom,
    togglePlayPause,
    undo,
  ]);
}
