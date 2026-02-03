/**
 * useSpringPhysics.ts
 * Spring physics simulation for fluid connection lines
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface SpringState {
  position: Point;
  velocity: Point;
  target: Point;
}

interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

interface UseSpringPhysicsOptions {
  initialPosition?: Point;
  config?: Partial<SpringConfig>;
}

interface UseSpringPhysicsReturn {
  position: Point;
  velocity: number;
  isSettled: boolean;
  setTarget: (target: Point) => void;
  reset: (position?: Point) => void;
}

const DEFAULT_CONFIG: SpringConfig = {
  stiffness: 120,
  damping: 14,
  mass: 1,
};

const VELOCITY_THRESHOLD = 0.01;
const POSITION_THRESHOLD = 0.1;

/**
 * Hook that provides spring physics simulation for smooth, elastic animations
 */
export function useSpringPhysics(
  options: UseSpringPhysicsOptions = {}
): UseSpringPhysicsReturn {
  const {
    initialPosition = { x: 0, y: 0 },
    config = {},
  } = options;

  const springConfig = { ...DEFAULT_CONFIG, ...config };

  const [state, setState] = useState<SpringState>({
    position: initialPosition,
    velocity: { x: 0, y: 0 },
    target: initialPosition,
  });

  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Calculate if spring is settled
  const isSettled = useCallback((current: SpringState): boolean => {
    const dx = current.target.x - current.position.x;
    const dy = current.target.y - current.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocityMagnitude = Math.sqrt(
      current.velocity.x * current.velocity.x + 
      current.velocity.y * current.velocity.y
    );
    
    return distance < POSITION_THRESHOLD && velocityMagnitude < VELOCITY_THRESHOLD;
  }, []);

  // Physics simulation step
  const simulate = useCallback((deltaTime: number, current: SpringState): SpringState => {
    const { stiffness, damping, mass } = springConfig;

    // Spring force: F = -k * displacement
    const dx = current.position.x - current.target.x;
    const dy = current.position.y - current.target.y;
    
    const springForceX = -stiffness * dx;
    const springForceY = -stiffness * dy;
    
    // Damping force: F = -c * velocity
    const dampingForceX = -damping * current.velocity.x;
    const dampingForceY = -damping * current.velocity.y;
    
    // Total acceleration: a = F / m
    const accelerationX = (springForceX + dampingForceX) / mass;
    const accelerationY = (springForceY + dampingForceY) / mass;
    
    // Update velocity: v = v + a * dt
    const newVelocityX = current.velocity.x + accelerationX * deltaTime;
    const newVelocityY = current.velocity.y + accelerationY * deltaTime;
    
    // Update position: x = x + v * dt
    const newPositionX = current.position.x + newVelocityX * deltaTime;
    const newPositionY = current.position.y + newVelocityY * deltaTime;

    return {
      position: { x: newPositionX, y: newPositionY },
      velocity: { x: newVelocityX, y: newVelocityY },
      target: current.target,
    };
  }, [springConfig]);

  // Animation loop
  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const deltaTime = Math.min((time - lastTimeRef.current) / 1000, 0.1); // Cap at 100ms
      lastTimeRef.current = time;

      setState((current) => {
        if (isSettled(current)) {
          return {
            ...current,
            position: current.target,
            velocity: { x: 0, y: 0 },
          };
        }
        return simulate(deltaTime, current);
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [simulate, isSettled]);

  // Set new target position
  const setTarget = useCallback((target: Point) => {
    setState((current) => ({
      ...current,
      target,
    }));
  }, []);

  // Reset to initial or specified position
  const reset = useCallback((position?: Point) => {
    const newPosition = position || initialPosition;
    setState({
      position: newPosition,
      velocity: { x: 0, y: 0 },
      target: newPosition,
    });
  }, [initialPosition]);

  // Calculate velocity magnitude
  const velocityMagnitude = Math.sqrt(
    state.velocity.x * state.velocity.x + 
    state.velocity.y * state.velocity.y
  );

  return {
    position: state.position,
    velocity: velocityMagnitude,
    isSettled: isSettled(state),
    setTarget,
    reset,
  };
}

export default useSpringPhysics;
