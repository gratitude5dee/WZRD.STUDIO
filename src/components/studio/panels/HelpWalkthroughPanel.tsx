import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { type WalkthroughStep } from '@/hooks/useWalkthrough';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface WalkthroughTooltipProps {
  step: WalkthroughStep;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  currentIndex: number;
  totalSteps: number;
}

export const WalkthroughTooltip: React.FC<WalkthroughTooltipProps> = ({
  step,
  onNext,
  onPrev,
  onClose,
  currentIndex,
  totalSteps,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.querySelector(step.target);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip?.getBoundingClientRect();

    let top = 0;
    let left = 0;
    const offset = 16;

    switch (step.placement) {
      case 'right':
        top = rect.top + rect.height / 2 - (tooltipRect?.height || 100) / 2;
        left = rect.right + offset;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - (tooltipRect?.height || 100) / 2;
        left = rect.left - (tooltipRect?.width || 320) - offset;
        break;
      case 'top':
        top = rect.top - (tooltipRect?.height || 100) - offset;
        left = rect.left + rect.width / 2 - (tooltipRect?.width || 320) / 2;
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2 - (tooltipRect?.width || 320) / 2;
        break;
      default:
        break;
    }

    setPosition({ top, left });

    target.classList.add('walkthrough-highlight');
    return () => target.classList.remove('walkthrough-highlight');
  }, [step]);

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/60 z-[9998]" onClick={onClose} />

      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="fixed z-[9999] w-80 bg-surface-1/98 backdrop-blur-2xl border border-border-subtle rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
        style={{ top: position.top, left: position.left }}
      >
        {/* Gradient accent border at top */}
        <div className="h-1 bg-gradient-to-r from-accent-purple via-accent-teal to-accent-amber" />

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-accent-purple/20">
                <Sparkles className="w-4 h-4 text-accent-purple" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">{step.title}</h3>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-text-tertiary" />
            </button>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{step.content}</p>
        </div>

        <div className="px-5 py-3.5 bg-surface-2/50 border-t border-border-subtle flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  i === currentIndex ? 'bg-accent-purple' : 'bg-surface-3'
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentIndex > 0 && (
              <button
                onClick={onPrev}
                className="px-3 py-1.5 text-sm bg-surface-3 hover:bg-surface-3/80 text-text-primary rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="px-4 py-1.5 text-sm bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {currentIndex === totalSteps - 1 ? 'Finish' : 'Next'}
              {currentIndex < totalSteps - 1 && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </>,
    document.body
  );
};

export const walkthroughStyles = `
  .walkthrough-highlight {
    position: relative;
    z-index: 9999 !important;
    box-shadow: 0 0 0 3px hsl(var(--accent-purple)), 0 0 30px hsla(var(--accent-purple) / 0.4) !important;
    border-radius: 12px;
  }
`;
