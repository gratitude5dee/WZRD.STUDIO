import { useEffect } from 'react';
import { useVideoEditorStore } from '@/store/videoEditorStore';

interface KeyboardShortcutHandlers {
  onExport?: () => void;
  onSave?: () => void;
}

/**
 * Global keyboard shortcuts for the video editor
 */
export function useEditorKeyboardShortcuts(handlers: KeyboardShortcutHandlers = {}) {
  const {
    playback,
    play,
    pause,
    setCurrentTime,
    composition,
    selectedClipIds,
    clips,
    updateClip,
    timeline,
    setTimelineZoom,
  } = useVideoEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Don't trigger shortcuts if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Space: Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        if (playback.isPlaying) {
          pause();
        } else {
          play();
        }
      }

      // Arrow Left: Previous frame
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const frameTime = 1000 / composition.fps;
        setCurrentTime(Math.max(0, playback.currentTime - frameTime));
      }

      // Arrow Right: Next frame
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const frameTime = 1000 / composition.fps;
        setCurrentTime(Math.min(composition.duration, playback.currentTime + frameTime));
      }

      // J: Rewind
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setCurrentTime(Math.max(0, playback.currentTime - 1000));
      }

      // K: Pause
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        pause();
      }

      // L: Fast forward
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setCurrentTime(Math.min(composition.duration, playback.currentTime + 1000));
      }

      // Home: Jump to start
      if (e.key === 'Home') {
        e.preventDefault();
        setCurrentTime(0);
      }

      // End: Jump to end
      if (e.key === 'End') {
        e.preventDefault();
        setCurrentTime(composition.duration);
      }

      // Delete/Backspace: Delete selected clips
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClipIds.length > 0) {
        e.preventDefault();
        // Note: Implement deleteClips in store or filter out selected clips
        console.log('Delete clips:', selectedClipIds);
      }

      // Cmd/Ctrl + A: Select all clips
      if (cmdOrCtrl && e.key === 'a') {
        e.preventDefault();
        // This would need to be implemented in the store
        // selectAllClips();
      }

      // Cmd/Ctrl + S: Save
      if (cmdOrCtrl && e.key === 's') {
        e.preventDefault();
        handlers.onSave?.();
      }

      // Cmd/Ctrl + E: Export
      if (cmdOrCtrl && e.key === 'e') {
        e.preventDefault();
        handlers.onExport?.();
      }

      // +/=: Zoom in
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setTimelineZoom(Math.min(200, timeline.zoom * 1.2));
      }

      // -: Zoom out
      if (e.key === '-') {
        e.preventDefault();
        setTimelineZoom(Math.max(20, timeline.zoom / 1.2));
      }

      // 0: Reset zoom
      if (e.key === '0' && cmdOrCtrl) {
        e.preventDefault();
        setTimelineZoom(60);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    playback,
    play,
    pause,
    setCurrentTime,
    composition,
    selectedClipIds,
    clips,
    updateClip,
    timeline,
    setTimelineZoom,
    handlers,
  ]);
}
