
import { useState, useEffect, useCallback, useRef } from 'react';

interface CursorState {
  x: number;
  y: number;
  isMouseDown: boolean;
  isMoving: boolean;
  holdDuration: number; // Milliseconds the mouse has been held down
  isLoading: boolean; // Loading state for visual feedback
}

const initialState: CursorState = {
  x: -100, // Start off-screen
  y: -100,
  isMouseDown: false,
  isMoving: false,
  holdDuration: 0,
  isLoading: false,
};

// Debounce helper
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

export function useCustomCursor() {
  const [cursorState, setCursorState] = useState<CursorState>(initialState);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMoveTimeRef = useRef<number>(Date.now());
  const requestRef = useRef<number>(); // For requestAnimationFrame

  // --- Mouse Move Handler ---
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const now = Date.now();
    setCursorState(prev => ({
        ...prev,
        x: event.clientX,
        y: event.clientY,
        isMoving: prev.isMouseDown // Only moving if dragging
    }));
    lastMoveTimeRef.current = now;
  }, []);

  // Debounced version to set isMoving back to false
  const handleMouseStop = useCallback(debounce(() => {
    setCursorState(prev => ({ ...prev, isMoving: false }));
  }, 100), []); // 100ms delay after last move to stop trail

  // --- Mouse Down Handler (Start Charging) ---
  const handleMouseDown = useCallback((event: MouseEvent) => {
    // Ignore right-clicks etc.
    if (event.button !== 0) return;

    setCursorState(prev => ({
        ...prev,
        isMouseDown: true,
        holdDuration: 0,
        x: event.clientX, // Update position on click too
        y: event.clientY,
    }));

    // Start interval to track hold duration
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(() => {
      setCursorState(prev => ({
        ...prev,
        holdDuration: prev.isMouseDown ? prev.holdDuration + 50 : 0 // Increment duration
      }));
    }, 50); // Update duration every 50ms
  }, []);

  // --- Mouse Up Handler (Stop Charging) ---
  const handleMouseUp = useCallback((event: MouseEvent) => {
     if (event.button !== 0) return;

    setCursorState(prev => ({
        ...prev,
        isMouseDown: false,
        isMoving: false,
        holdDuration: 0 // Reset duration
    }));
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  // --- Effect to Add/Remove Listeners ---
  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
        handleMouseMove(e);
        handleMouseStop(); // Call debounced stop handler
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Restore default cursor
      document.body.style.cursor = '';
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleMouseStop]); // Include debounced handler dependency

  const setIsLoading = (loading: boolean) => {
    setCursorState(prev => ({ ...prev, isLoading: loading }));
  };

  return { ...cursorState, setIsLoading };
}
