
import React from 'react';
import { useCustomCursor } from '@/hooks/useCustomCursor';
import { motion, AnimatePresence } from 'framer-motion';

interface TrailParticle {
    id: number;
    x: number;
    y: number;
    timestamp: number;
    rotation: number; // Added rotation for more dynamic trails
}

const MAX_HOLD_DURATION = 1500; // Max duration for scaling effect (ms)
const MAX_SCALE = 1.8;
const BASE_SCALE = 0.6; // Initial size when clicked
const TRAIL_LIFESPAN = 400; // How long trail particles last (ms)
const TRAIL_INTERVAL = 30; // How often to add a particle (ms)

interface CustomCursorProps {
    isLoading?: boolean;
}

const CustomCursor: React.FC<CustomCursorProps> = ({ isLoading = false }) => {
    const { x, y, isMouseDown, isMoving, holdDuration } = useCustomCursor();
    const [trails, setTrails] = React.useState<TrailParticle[]>([]);
    const lastTrailTimeRef = React.useRef<number>(0);

    // Calculate scale and opacity based on hold duration
    const chargeProgress = Math.min(holdDuration / MAX_HOLD_DURATION, 1);
    const scale = isMouseDown ? BASE_SCALE + chargeProgress * (MAX_SCALE - BASE_SCALE) : 0.3; // Scale from BASE_SCALE to MAX_SCALE
    const opacity = isMouseDown ? 0.6 + chargeProgress * 0.4 : 0.3; // Fade in intensity
    const blurAmount = isMouseDown ? 4 + chargeProgress * 8 : 2; // Increase blur
    const glowIntensity = 0.5 + chargeProgress * 1.5; // Control glow via shadow opacity

    // Dynamic glow colors
    const glowColorCore = `rgba(180, 210, 255, ${0.6 + chargeProgress * 0.4})`;
    const glowColorMid = `rgba(100, 150, 255, ${0.4 + chargeProgress * 0.4})`;
    const glowColorOuter = `rgba(59, 130, 246, ${0.2 + chargeProgress * 0.3})`;

    // Enhanced multi-layered box shadow for more dramatic glow
    const dynamicBoxShadow = `0 0 ${blurAmount * 0.4}px ${blurAmount * 0.2}px ${glowColorCore}, 
                             0 0 ${blurAmount * 1}px ${blurAmount * 0.5}px ${glowColorMid}, 
                             0 0 ${blurAmount * 2.5}px ${blurAmount * 1}px ${glowColorOuter}`;

    // Add trail particles when moving while mouse is down
    React.useEffect(() => {
        if (isMouseDown && isMoving) {
            const now = Date.now();
            if (now - lastTrailTimeRef.current > TRAIL_INTERVAL) {
                setTrails(prev => [
                    ...prev,
                    { 
                        id: now + Math.random(), 
                        x, 
                        y, 
                        timestamp: now,
                        rotation: Math.random() * 90 - 45 // Random rotation between -45 and 45 degrees
                    }
                ]);
                lastTrailTimeRef.current = now;
            }
        }

        // Cleanup old trails
        const timeoutId = setTimeout(() => {
            setTrails(prev => prev.filter(p => Date.now() - p.timestamp < TRAIL_LIFESPAN));
        }, TRAIL_LIFESPAN + 50); // Check slightly after lifespan

        return () => clearTimeout(timeoutId);

    }, [x, y, isMouseDown, isMoving]);

    // Render only if position is valid (not initial -100)
    if (x < 0 || y < 0) {
        return null;
    }

    return (
        <>
            {/* Loading Ring */}
            {isLoading && (
                <motion.div
                    className="fixed top-0 left-0 pointer-events-none z-[10000]"
                    style={{
                        x: x - 12,
                        y: y - 12,
                        width: '24px',
                        height: '24px',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <div className="w-full h-full rounded-full border-2 border-dashed border-purple-400/70 border-t-purple-600" />
                </motion.div>
            )}

            {/* Cursor Orb */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-blue-400"
                style={{
                    x: x - 8, // Center the orb (adjust size if needed)
                    y: y - 8,
                    width: '16px',
                    height: '16px',
                    boxShadow: dynamicBoxShadow,
                    filter: `blur(${blurAmount}px)`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale, opacity }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 0.5,
                }}
            >
                {/* Inner Core (Optional) */}
                <div className="w-4 h-4 rounded-full bg-white/80"></div>
            </motion.div>

            {/* Trails */}
            <AnimatePresence>
                {trails.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="fixed top-0 left-0 pointer-events-none z-[9998] w-1 h-4 rounded-[1px]" // Lightning shape
                        style={{
                            x: particle.x - 0.5, // Center the particle
                            y: particle.y - 2,
                            background: 'radial-gradient(circle, rgba(150, 180, 255, 0.8) 0%, rgba(59, 130, 246, 0) 70%)', // Lightning gradient
                            rotate: `${particle.rotation}deg`, // Random rotation
                        }}
                        initial={{ opacity: 0.7, scale: 0.8 }}
                        animate={{ opacity: 0.7, scale: 0.8 }} // Keep initial state while visible
                        exit={{
                            opacity: 0,
                            scale: 0.2,
                            transition: { duration: TRAIL_LIFESPAN / 1000, ease: "easeOut" }
                        }}
                    />
                ))}
            </AnimatePresence>
        </>
    );
};

export default CustomCursor;
