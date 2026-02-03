/**
 * usePhysicsLoop.ts
 * RAF-based physics loop with delta-time calculation
 */

import { useRef, useEffect, useCallback } from 'react';

type PhysicsCallback = (deltaTime: number, elapsedTime: number) => void;

interface UsePhysicsLoopOptions {
  autoStart?: boolean;
  maxDeltaTime?: number; // Cap delta to prevent huge jumps
}

interface UsePhysicsLoopReturn {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
}

const DEFAULT_OPTIONS = {
  autoStart: true,
  maxDeltaTime: 0.1, // 100ms max
};

/**
 * Hook that provides a requestAnimationFrame-based physics loop
 * with proper delta-time calculation for frame-rate independent animations
 */
export function usePhysicsLoop(
  callback: PhysicsCallback,
  options: UsePhysicsLoopOptions = {}
): UsePhysicsLoopReturn {
  const {
    autoStart = DEFAULT_OPTIONS.autoStart,
    maxDeltaTime = DEFAULT_OPTIONS.maxDeltaTime,
  } = options;

  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);
  const callbackRef = useRef<PhysicsCallback>(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const loop = useCallback((time: number) => {
    if (!isRunningRef.current) return;

    // Initialize start time on first frame
    if (startTimeRef.current === 0) {
      startTimeRef.current = time;
      lastTimeRef.current = time;
    }

    // Calculate delta time in seconds
    const deltaTime = Math.min((time - lastTimeRef.current) / 1000, maxDeltaTime);
    const elapsedTime = (time - startTimeRef.current) / 1000;
    
    lastTimeRef.current = time;

    // Call the physics callback
    callbackRef.current(deltaTime, elapsedTime);

    // Schedule next frame
    frameRef.current = requestAnimationFrame(loop);
  }, [maxDeltaTime]);

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    
    isRunningRef.current = true;
    lastTimeRef.current = 0;
    startTimeRef.current = 0;
    frameRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
    }
  }, []);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      stop();
    };
  }, [autoStart, start, stop]);

  return {
    start,
    stop,
    isRunning: isRunningRef.current,
  };
}

export default usePhysicsLoop;
