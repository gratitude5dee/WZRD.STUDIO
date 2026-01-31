import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EartoneIntro } from '@/components/EartoneIntro';

export default function Intro() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setTimeout(() => setContentVisible(true), 100);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Intro Animation */}
      {showIntro && (
        <EartoneIntro onComplete={handleIntroComplete} skipEnabled={true} />
      )}

      {/* Transition to Landing */}
      <AnimatePresence>
        {contentVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => navigate('/landing')}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'hsl(var(--background))',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(32px, 6vw, 48px)',
                fontWeight: 300,
                letterSpacing: '0.15em',
                color: 'hsl(var(--foreground))',
              }}
            >
              Welcome
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
