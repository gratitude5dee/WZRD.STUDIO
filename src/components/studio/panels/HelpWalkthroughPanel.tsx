import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { type WalkthroughStep } from '@/hooks/useWalkthrough';
import { createPortal } from 'react-dom';

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
    const offset = 12;

    switch (step.placement) {
      case 'right':
        top = rect.top + rect.height / 2 - (tooltipRect?.height || 100) / 2;
        left = rect.right + offset;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - (tooltipRect?.height || 100) / 2;
        left = rect.left - (tooltipRect?.width || 280) - offset;
        break;
      case 'top':
        top = rect.top - (tooltipRect?.height || 100) - offset;
        left = rect.left + rect.width / 2 - (tooltipRect?.width || 280) / 2;
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2 - (tooltipRect?.width || 280) / 2;
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
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={onClose} />

      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[9999] w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
        style={{ top: position.top, left: position.left }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent-purple" />
              <h3 className="text-sm font-semibold text-white">{step.title}</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded">
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">{step.content}</p>
        </div>

        <div className="px-4 py-3 bg-zinc-800/50 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Step {currentIndex + 1} of {totalSteps}
          </span>
          <div className="flex items-center gap-2">
            {currentIndex > 0 && (
              <button
                onClick={onPrev}
                className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg flex items-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" />
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="px-3 py-1.5 text-xs bg-accent-purple hover:bg-accent-purple/80 text-white rounded-lg flex items-center gap-1"
            >
              {currentIndex === totalSteps - 1 ? 'Finish' : 'Next'}
              {currentIndex < totalSteps - 1 && <ChevronRight className="w-3 h-3" />}
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
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3) !important;
    border-radius: 8px;
  }
`;
