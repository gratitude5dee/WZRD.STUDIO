/**
 * useGestureVelocity.ts
 * Gesture velocity tracking for slice detection and trail effects
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
  timestamp: number;
}

interface VelocityState {
  velocity: number;
  direction: { x: number; y: number };
  isHighVelocity: boolean;
  trail: Point[];
}

interface UseGestureVelocityOptions {
  velocityThreshold?: number;
  trailLength?: number;
  sampleRate?: number; // ms between samples
}

interface UseGestureVelocityReturn extends VelocityState {
  updatePosition: (x: number, y: number) => void;
  reset: () => void;
  isTracking: boolean;
}

const DEFAULT_OPTIONS = {
  velocityThreshold: 800, // px/s to trigger "slice" mode
  trailLength: 10,
  sampleRate: 16, // ~60fps
};

/**
 * Hook that tracks pointer/mouse velocity for gesture detection
 */
export function useGestureVelocity(
  options: UseGestureVelocityOptions = {}
): UseGestureVelocityReturn {
  const {
    velocityThreshold = DEFAULT_OPTIONS.velocityThreshold,
    trailLength = DEFAULT_OPTIONS.trailLength,
    sampleRate = DEFAULT_OPTIONS.sampleRate,
  } = options;

  const [state, setState] = useState<VelocityState>({
    velocity: 0,
    direction: { x: 0, y: 0 },
    isHighVelocity: false,
    trail: [],
  });

  const [isTracking, setIsTracking] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const trailRef = useRef<Point[]>([]);

  const calculateVelocity = useCallback((trail: Point[]): { velocity: number; direction: { x: number; y: number } } => {
    if (trail.length < 2) {
      return { velocity: 0, direction: { x: 0, y: 0 } };
    }

    const current = trail[0];
    const previous = trail[1];
    
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    const dt = (current.timestamp - previous.timestamp) / 1000; // Convert to seconds
    
    if (dt === 0) {
      return { velocity: 0, direction: { x: 0, y: 0 } };
    }

    const velocity = Math.sqrt(dx * dx + dy * dy) / dt;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    
    const direction = magnitude > 0
      ? { x: dx / magnitude, y: dy / magnitude }
      : { x: 0, y: 0 };

    return { velocity, direction };
  }, []);

  const updatePosition = useCallback((x: number, y: number) => {
    const now = performance.now();
    
    // Rate limit updates
    if (now - lastUpdateRef.current < sampleRate) {
      return;
    }
    
    lastUpdateRef.current = now;
    setIsTracking(true);

    const newPoint: Point = { x, y, timestamp: now };
    
    // Update trail with new point at the front
    trailRef.current = [newPoint, ...trailRef.current.slice(0, trailLength - 1)];
    
    const { velocity, direction } = calculateVelocity(trailRef.current);
    const isHighVelocity = velocity >= velocityThreshold;

    setState({
      velocity,
      direction,
      isHighVelocity,
      trail: [...trailRef.current],
    });
  }, [velocityThreshold, trailLength, sampleRate, calculateVelocity]);

  const reset = useCallback(() => {
    trailRef.current = [];
    setIsTracking(false);
    setState({
      velocity: 0,
      direction: { x: 0, y: 0 },
      isHighVelocity: false,
      trail: [],
    });
  }, []);

  // Decay tracking state if no updates
  useEffect(() => {
    const decayInterval = setInterval(() => {
      const now = performance.now();
      if (now - lastUpdateRef.current > 100 && isTracking) {
        setState((prev) => ({
          ...prev,
          velocity: prev.velocity * 0.9,
          isHighVelocity: prev.velocity * 0.9 >= velocityThreshold,
        }));

        if (state.velocity < 1) {
          setIsTracking(false);
        }
      }
    }, 50);

    return () => clearInterval(decayInterval);
  }, [isTracking, state.velocity, velocityThreshold]);

  return {
    ...state,
    updatePosition,
    reset,
    isTracking,
  };
}

export default useGestureVelocity;
