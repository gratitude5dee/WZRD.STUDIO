import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MogIntroProps {
  onComplete: () => void;
  skipEnabled?: boolean;
}

export function MogIntro({ onComplete, skipEnabled = true }: MogIntroProps) {
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

  // Phase progression: 0ms, 500ms, 1600ms, 3000ms, 4800ms, 6400ms, 8200ms, 9800ms
  const phaseTimings = [0, 500, 1600, 3000, 4800, 6400, 8200, 9800, 11200];

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

  // Bioluminescent glow data
  const glowData = [
    { x: '10%', y: '18%', size: 320, delay: 0 },
    { x: '78%', y: '68%', size: 240, delay: 0.5 },
    { x: '55%', y: '12%', size: 180, delay: 1 },
  ];

  // Bubbles
  const bubbles = Array.from({ length: 45 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 3,
  }));

  const letters = ['L', 'O', 'B', 'S', 'T', 'E', 'R'];
  const taglineWords = ['Brine', '·', 'Rhythm', '·', 'Design'];

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
            paddingTop: '12vh',
            paddingBottom: '40px',
            background: 'linear-gradient(180deg, #041827 0%, #0c2a3f 45%, #041827 100%)',
            cursor: skipEnabled ? 'pointer' : 'default',
            overflow: 'hidden',
          }}
        >
          {/* Bioluminescent glows */}
          {glowData.map((glow, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: phase >= 1 ? 0.2 : 0,
                scale: phase >= 1 ? 1 : 0.5,
                x: mousePosition.x * (30 + i * 10),
                y: mousePosition.y * (30 + i * 10),
              }}
              transition={{
                opacity: { duration: 2, delay: glow.delay },
                scale: { duration: 2, delay: glow.delay },
                x: { duration: 0.5, ease: 'easeOut' },
                y: { duration: 0.5, ease: 'easeOut' },
              }}
              style={{
                position: 'absolute',
                left: glow.x,
                top: glow.y,
                width: glow.size,
                height: glow.size,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 108, 83, 0.28) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Rising bubbles */}
          {bubbles.map((bubble) => (
            <motion.div
              key={bubble.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: phase >= 1 ? [0, 0.6, 0] : 0,
                scale: phase >= 1 ? [0, 1, 0] : 0,
                y: phase >= 1 ? [0, -40] : 0,
              }}
              transition={{
                duration: bubble.duration,
                delay: bubble.delay + 1,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: bubble.size,
                height: bubble.size,
                borderRadius: '50%',
                background: 'rgba(160, 216, 255, 0.6)',
                boxShadow: '0 0 12px rgba(160, 216, 255, 0.4)',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Ocean vignette overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(11, 44, 63, 0.2) 0%, rgba(3, 16, 26, 0.85) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Lobster hero */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{
              scale: phase >= 1 ? 1 : 0.6,
              opacity: phase >= 1 ? 1 : 0,
            }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'relative',
              width: '320px',
              height: '320px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `translate(${mousePosition.x * 16}px, ${mousePosition.y * 16}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="lobsterBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff6b57" />
                  <stop offset="45%" stopColor="#ff8a5b" />
                  <stop offset="100%" stopColor="#ffb07c" />
                </linearGradient>
                <linearGradient id="lobsterShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(0,0,0,0.25)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </linearGradient>
              </defs>

              {/* Tail segments */}
              {[0, 1, 2, 3].map((segment) => (
                <motion.ellipse
                  key={segment}
                  cx="120"
                  cy={170 - segment * 18}
                  rx={32 - segment * 3}
                  ry={18 - segment * 2}
                  fill="url(#lobsterBody)"
                  opacity={0.9}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{
                    scale: phase >= 1 ? 1 : 0.7,
                    opacity: phase >= 1 ? 0.95 : 0,
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.2 + segment * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              ))}

              {/* Body */}
              <motion.ellipse
                cx="120"
                cy="95"
                rx="45"
                ry="60"
                fill="url(#lobsterBody)"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{
                  scale: phase >= 1 ? 1 : 0.6,
                  opacity: phase >= 1 ? 1 : 0,
                }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Body highlight */}
              <motion.path
                d="M110 50 C95 70 90 100 100 130"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: phase >= 2 ? 1 : 0,
                  opacity: phase >= 2 ? 0.6 : 0,
                }}
                transition={{ duration: 1.1, delay: 0.4 }}
              />

              {/* Eyes */}
              <motion.circle
                cx="104"
                cy="60"
                r="5"
                fill="#1d0b0b"
                initial={{ scale: 0 }}
                animate={{ scale: phase >= 2 ? 1 : 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              />
              <motion.circle
                cx="136"
                cy="60"
                r="5"
                fill="#1d0b0b"
                initial={{ scale: 0 }}
                animate={{ scale: phase >= 2 ? 1 : 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              />

              {/* Antennae */}
              <motion.path
                d="M100 45 C70 30 52 12 30 10"
                stroke="#ffb07c"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: phase >= 2 ? 1 : 0,
                  opacity: phase >= 2 ? 0.9 : 0,
                }}
                transition={{ duration: 1.2, delay: 0.5 }}
              />
              <motion.path
                d="M140 45 C170 30 188 12 210 10"
                stroke="#ffb07c"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: phase >= 2 ? 1 : 0,
                  opacity: phase >= 2 ? 0.9 : 0,
                }}
                transition={{ duration: 1.2, delay: 0.5 }}
              />

              {/* Claws */}
              <motion.g
                initial={{ rotate: -12, opacity: 0 }}
                animate={{
                  rotate: phase >= 2 ? 8 : -12,
                  opacity: phase >= 1 ? 1 : 0,
                }}
                transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                style={{ transformOrigin: '60px 90px' }}
              >
                <path
                  d="M52 90 C20 88 16 120 44 132 C64 140 84 128 80 110"
                  fill="url(#lobsterBody)"
                />
                <path
                  d="M45 100 C30 105 28 120 40 126"
                  stroke="url(#lobsterShadow)"
                  strokeWidth="4"
                  fill="none"
                />
              </motion.g>

              <motion.g
                initial={{ rotate: 12, opacity: 0 }}
                animate={{
                  rotate: phase >= 2 ? -8 : 12,
                  opacity: phase >= 1 ? 1 : 0,
                }}
                transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                style={{ transformOrigin: '180px 90px' }}
              >
                <path
                  d="M188 90 C220 88 224 120 196 132 C176 140 156 128 160 110"
                  fill="url(#lobsterBody)"
                />
                <path
                  d="M195 100 C210 105 212 120 200 126"
                  stroke="url(#lobsterShadow)"
                  strokeWidth="4"
                  fill="none"
                />
              </motion.g>
            </svg>
          </motion.div>

          {/* Lobster Wordmark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '64px',
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
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  color: '#ffb07c',
                  textShadow: '0 0 60px rgba(255, 138, 91, 0.45)',
                  cursor: 'default',
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
              opacity: phase >= 2 ? 0.6 : 0,
            }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '260px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #ff8a5b, transparent)',
              marginTop: '24px',
            }}
          />

          {/* Tagline: Brine · Rhythm · Design ... */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 3 ? 1 : 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginTop: '36px',
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
                  color: word === '·' ? 'rgba(255, 176, 124, 0.5)' : 'rgba(213, 235, 255, 0.85)',
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
              style={{ color: 'rgba(255, 176, 124, 0.6)', letterSpacing: '0.3em' }}
            >
              ...
            </motion.span>
          </motion.div>

          {/* Deep water callout */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, letterSpacing: '0em' }}
            animate={{
              scale: phase >= 4 ? 1 : 0.7,
              opacity: phase >= 4 ? 1 : 0,
              letterSpacing: phase >= 4 ? '0.28em' : '0em',
            }}
            transition={{
              duration: 1.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              marginTop: '28px',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(36px, 7vw, 64px)',
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#ffd6b3',
              textTransform: 'uppercase',
              textShadow: phase >= 5 ? '0 0 80px rgba(255, 176, 124, 0.6)' : 'none',
              transition: 'text-shadow 1s ease',
            }}
          >
            DEEP SEA
          </motion.div>

          {/* Seaside signature */}
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
                color: 'rgba(213, 235, 255, 0.5)',
              }}
            >
              welcome to the reef
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
                gap: '16px',
              }}
            >
              <span
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '13px',
                  letterSpacing: '-0.02em',
                  color: 'rgba(213, 235, 255, 0.8)',
                }}
              >
                Saltwater
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#5bdcff',
                }}
              >
                Currents
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255, 214, 179, 0.9)',
                }}
              >
                Lobster
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
              background: 'rgba(91, 220, 255, 0.12)',
            }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: phase / 7 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #5bdcff, #ff8a5b)',
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
              color: 'rgba(213, 235, 255, 0.45)',
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
