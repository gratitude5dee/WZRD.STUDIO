/**
 * PhysicsCanvas.tsx
 * Enhanced canvas wrapper with dot-grid, ambient particles, and depth overlay
 */

import React, { memo, useMemo, useCallback, useEffect, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AmbientParticleSystem } from '../effects/AmbientParticleSystem';

interface PhysicsCanvasProps {
  showGrid?: boolean;
  children?: React.ReactNode;
  className?: string;
}

// Canvas configuration
const CANVAS_CONFIG = {
  backgroundColor: 'hsl(228, 12%, 7%)', // --surface-0
  gridSize: 24,
  gridOpacity: 0.15,
  dotRadius: 1.5,
};

/**
 * Custom dot grid pattern that scales with zoom to maintain visual consistency
 */
const DotGridPattern = memo(({ zoom = 1, showGrid = true }: { zoom?: number; showGrid?: boolean }) => {
  // Calculate anti-zoom scaling for dots
  const scaledDotRadius = useMemo(() => {
    return CANVAS_CONFIG.dotRadius / Math.max(0.5, Math.min(zoom, 2));
  }, [zoom]);

  const patternId = 'physics-canvas-dots';
  
  if (!showGrid) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    >
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width={CANVAS_CONFIG.gridSize}
          height={CANVAS_CONFIG.gridSize}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={CANVAS_CONFIG.gridSize / 2}
            cy={CANVAS_CONFIG.gridSize / 2}
            r={scaledDotRadius}
            fill={`rgba(255, 255, 255, ${CANVAS_CONFIG.gridOpacity})`}
          />
        </pattern>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill={`url(#${patternId})`}
      />
    </svg>
  );
});

DotGridPattern.displayName = 'DotGridPattern';

/**
 * Radial gradient depth overlay for HUD feel
 */
const DepthOverlay = memo(() => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      background: `
        radial-gradient(
          ellipse at 50% 50%,
          transparent 0%,
          transparent 30%,
          rgba(0, 0, 0, 0.15) 70%,
          rgba(0, 0, 0, 0.35) 100%
        )
      `,
      zIndex: 1,
    }}
  />
));

DepthOverlay.displayName = 'DepthOverlay';

/**
 * Main PhysicsCanvas component
 * Replaces React Flow Background with custom dot grid and effects
 */
export const PhysicsCanvas = memo(({ 
  showGrid = true, 
  children,
  className 
}: PhysicsCanvasProps) => {
  const [zoom, setZoom] = useState(1);
  const { getZoom } = useReactFlow();

  // Update zoom level for anti-zoom scaling
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const currentZoom = getZoom();
        setZoom(currentZoom);
      } catch {
        // React Flow not ready yet
      }
    }, 100);

    return () => clearInterval(interval);
  }, [getZoom]);

  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden',
        className
      )}
      style={{
        backgroundColor: CANVAS_CONFIG.backgroundColor,
        contain: 'layout style paint',
      }}
    >
      {/* Custom dot grid */}
      <DotGridPattern zoom={zoom} showGrid={showGrid} />
      
      {/* Ambient floating particles */}
      <AmbientParticleSystem particleCount={25} />
      
      {/* Depth overlay for HUD feel */}
      <DepthOverlay />
      
      {/* Children (React Flow content) */}
      {children}
    </div>
  );
});

PhysicsCanvas.displayName = 'PhysicsCanvas';

export default PhysicsCanvas;
