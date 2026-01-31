import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EartoneIntroProps {
  onComplete: () => void;
  skipEnabled?: boolean;
}

export function EartoneIntro({ onComplete, skipEnabled = true }: EartoneIntroProps) {
  const [phase, setPhase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Phase progression: 0ms, 600ms, 1800ms, 3200ms, 5000ms, 6800ms, 8200ms, 9800ms
  const phaseTimings = [0, 600, 1800, 3200, 5000, 6800, 8200, 9800, 11500];

  useEffect(() => {
    const timeouts = phaseTimings.map((timing, index) => {
      return setTimeout(() => {
        if (index < phaseTimings.length - 1) {
          setPhase(index);
        } else {
          setIsComplete(true);
          setTimeout(() => onComplete(), 800);
        }
      }, timing);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = () => {
    if (skipEnabled) {
      setIsComplete(true);
      setTimeout(() => onComplete(), 300);
    }
  };

  // Floating orbs data
  const orbData = [
    { x: '15%', y: '20%', size: 300, delay: 0 },
    { x: '80%', y: '70%', size: 200, delay: 0.5 },
    { x: '60%', y: '15%', size: 150, delay: 1 },
  ];

  // Particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 3,
  }));

  const letters = ['E', 'A', 'R', 'T', 'O', 'N', 'E'];
  const taglineWords = ['Content', '·', 'Music', '·', 'Media'];

  return (
    <AnimatePresence mode="wait">
      {!isComplete && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.15,
            filter: 'blur(30px) brightness(2)',
            transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
          }}
          onClick={handleSkip}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: '15vh',
            paddingBottom: '40px',
            background: 'linear-gradient(180deg, #0a0a0a 0%, #151210 50%, #0a0a0a 100%)',
            cursor: skipEnabled ? 'pointer' : 'default',
            overflow: 'hidden',
          }}
        >
          {/* Ambient floating orbs */}
          {orbData.map((orb, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: phase >= 1 ? 0.15 : 0,
                scale: phase >= 1 ? 1 : 0.5,
                x: mousePosition.x * (30 + i * 10),
                y: mousePosition.y * (30 + i * 10),
              }}
              transition={{
                opacity: { duration: 2, delay: orb.delay },
                scale: { duration: 2, delay: orb.delay },
                x: { duration: 0.5, ease: 'easeOut' },
                y: { duration: 0.5, ease: 'easeOut' },
              }}
              style={{
                position: 'absolute',
                left: orb.x,
                top: orb.y,
                width: orb.size,
                height: orb.size,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(196, 149, 106, 0.3) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Ambient particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: phase >= 1 ? [0, 0.6, 0] : 0,
                scale: phase >= 1 ? [0, 1, 0] : 0,
                y: phase >= 1 ? [0, -40] : 0,
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay + 1,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
                borderRadius: '50%',
                background: 'rgba(196, 149, 106, 0.6)',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Vignette overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.7) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Enhanced Radar */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: phase >= 1 ? 1 : 0,
              opacity: phase >= 1 ? 1 : 0,
            }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              width: '320px',
              height: '320px',
              transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
              {/* Concentric rings */}
              {[80, 65, 50, 35, 20].map((radius, i) => (
                <motion.circle
                  key={radius}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="rgba(196, 149, 106, 0.25)"
                  strokeWidth="0.5"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: phase >= 1 ? 1 : 0,
                    opacity: phase >= 1 ? [0.1, 0.4, 0.1] : 0,
                  }}
                  transition={{
                    scale: { duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 2, delay: i * 0.1 + 1, repeat: Infinity, ease: 'easeInOut' },
                  }}
                />
              ))}

              {/* Axis lines */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 1 ? 0.3 : 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <line x1="100" y1="15" x2="100" y2="185" stroke="rgba(196, 149, 106, 0.2)" strokeWidth="0.5" />
                <line x1="15" y1="100" x2="185" y2="100" stroke="rgba(196, 149, 106, 0.2)" strokeWidth="0.5" />
                <line x1="30" y1="30" x2="170" y2="170" stroke="rgba(196, 149, 106, 0.1)" strokeWidth="0.5" />
                <line x1="170" y1="30" x2="30" y2="170" stroke="rgba(196, 149, 106, 0.1)" strokeWidth="0.5" />
              </motion.g>

              {/* Rotating sweep */}
              <motion.g
                initial={{ rotate: -45 }}
                animate={{ rotate: phase >= 1 ? 315 : -45 }}
                transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
                style={{ transformOrigin: '100px 100px' }}
              >
                <path
                  d="M 100 100 L 100 20 A 80 80 0 0 1 156.57 43.43 Z"
                  fill="url(#sweepGradient)"
                />
              </motion.g>

              {/* Center pulse */}
              <motion.circle
                cx="100"
                cy="100"
                r="6"
                fill="#C4956A"
                initial={{ scale: 0 }}
                animate={{
                  scale: phase >= 1 ? [1, 1.3, 1] : 0,
                  opacity: phase >= 1 ? [0.8, 1, 0.8] : 0,
                }}
                transition={{
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
              <motion.circle
                cx="100"
                cy="100"
                r="3"
                fill="#fff"
                initial={{ scale: 0 }}
                animate={{ scale: phase >= 1 ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              />

              {/* Detection blips */}
              {phase >= 2 && (
                <>
                  <motion.circle
                    cx="140"
                    cy="70"
                    r="3"
                    fill="#C4956A"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.6] }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                  <motion.circle
                    cx="60"
                    cy="130"
                    r="2"
                    fill="#C4956A"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.6] }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  />
                </>
              )}

              <defs>
                <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(196, 149, 106, 0.6)" />
                  <stop offset="50%" stopColor="rgba(196, 149, 106, 0.2)" />
                  <stop offset="100%" stopColor="rgba(196, 149, 106, 0)" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* EARTONE Wordmark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '180px',
              perspective: '1200px',
            }}
          >
            {letters.map((letter, index) => (
              <motion.span
                key={index}
                initial={{
                  y: 120,
                  opacity: 0,
                  rotateX: -90,
                  filter: 'blur(10px)',
                }}
                animate={phase >= 2 ? {
                  y: 0,
                  opacity: 1,
                  rotateX: 0,
                  filter: 'blur(0px)',
                } : {
                  y: 120,
                  opacity: 0,
                  rotateX: -90,
                  filter: 'blur(10px)',
                }}
                transition={{
                  duration: 1,
                  delay: index * 0.06,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
                style={{
                  display: 'inline-block',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(56px, 12vw, 108px)',
                  fontWeight: 300,
                  letterSpacing: '0.12em',
                  color: '#C4956A',
                  textShadow: '0 0 60px rgba(196, 149, 106, 0.4)',
                  cursor: 'default',
                  transform: index === 6 ? 'scaleX(-1)' : 'none',
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>

          {/* Subtle line beneath wordmark */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: phase >= 2 ? 1 : 0,
              opacity: phase >= 2 ? 0.5 : 0,
            }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '200px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #C4956A, transparent)',
              marginTop: '24px',
            }}
          />

          {/* Tagline: Content · Music · Media ... */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 3 ? 1 : 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginTop: '48px',
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(13px, 1.8vw, 16px)',
              fontWeight: 400,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
            }}
          >
            {taglineWords.map((word, index) => (
              <motion.span
                key={index}
                initial={{ y: 30, opacity: 0, filter: 'blur(8px)' }}
                animate={{
                  y: phase >= 3 ? 0 : 30,
                  opacity: phase >= 3 ? 1 : 0,
                  filter: phase >= 3 ? 'blur(0px)' : 'blur(8px)',
                }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  color: word === '·' ? 'rgba(196, 149, 106, 0.5)' : 'rgba(232, 219, 197, 0.85)',
                }}
              >
                {word}
              </motion.span>
            ))}

            {/* Animated ellipsis */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? [0.3, 0.8, 0.3] : 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
              style={{ color: 'rgba(196, 149, 106, 0.6)', letterSpacing: '0.3em' }}
            >
              ...
            </motion.span>
          </motion.div>

          {/* CULTURE - Emphasized */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, letterSpacing: '0em' }}
            animate={{
              scale: phase >= 4 ? 1 : 0.7,
              opacity: phase >= 4 ? 1 : 0,
              letterSpacing: phase >= 4 ? '0.35em' : '0em',
            }}
            transition={{
              duration: 1.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              marginTop: '32px',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(36px, 7vw, 64px)',
              fontWeight: 600,
              fontStyle: 'italic',
              color: '#C4956A',
              textTransform: 'uppercase',
              textShadow: phase >= 5 ? '0 0 80px rgba(196, 149, 106, 0.6)' : 'none',
              transition: 'text-shadow 1s ease',
            }}
          >
            CULTURE
          </motion.div>

          {/* Powered by thirdweb */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: phase >= 5 ? 0.8 : 0,
              y: phase >= 5 ? 0 : 30,
            }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginTop: 'auto',
              marginBottom: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(232, 219, 197, 0.4)',
              }}
            >
              eartone powered by
            </span>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: phase >= 5 ? 1 : 0,
                scale: phase >= 5 ? 1 : 0.9,
              }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {/* Thirdweb logo */}
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <motion.path
                  d="M16 2L4 9v14l12 7 12-7V9L16 2z"
                  stroke="rgba(232, 219, 197, 0.9)"
                  strokeWidth="1.5"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: phase >= 5 ? 1 : 0 }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.path
                  d="M16 30V16M4 9l12 7 12-7"
                  stroke="rgba(232, 219, 197, 0.5)"
                  strokeWidth="1"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: phase >= 5 ? 1 : 0 }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '15px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: 'rgba(232, 219, 197, 0.9)',
                }}
              >
                thirdweb
              </span>
            </motion.div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'rgba(196, 149, 106, 0.1)',
            }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: phase / 7 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #C4956A, #D4A97A)',
                transformOrigin: 'left',
              }}
            />
          </motion.div>

          {/* Skip hint */}
          {skipEnabled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 2 ? 0.4 : 0 }}
              transition={{ delay: 1, duration: 1 }}
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '24px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                letterSpacing: '0.1em',
                color: 'rgba(232, 219, 197, 0.4)',
                textTransform: 'uppercase',
              }}
            >
              Click to skip
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
