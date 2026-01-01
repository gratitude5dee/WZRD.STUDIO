'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShineBorder } from '@/components/ui/shine-border';
import { SpotlightOverlay } from './SpotlightOverlay';
import { AnimatedPointer } from './AnimatedPointer';
import type { OnboardingStep } from '@/hooks/useOnboardingTour';

interface OnboardingTourProps {
  isActive: boolean;
  currentStep: OnboardingStep | null;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onGoToStep: (index: number) => void;
}

export function OnboardingTour({
  isActive,
  currentStep,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onComplete,
  onGoToStep,
}: OnboardingTourProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const updateTargetPosition = useCallback(() => {
    if (!currentStep) return;

    const element = document.querySelector(currentStep.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);

      const padding = currentStep.spotlightPadding || 8;
      const tooltipOffset = 16;

      let x = 0;
      let y = 0;

      switch (currentStep.placement) {
        case 'top':
          x = rect.left + rect.width / 2;
          y = rect.top - padding - tooltipOffset;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2;
          y = rect.bottom + padding + tooltipOffset;
          break;
        case 'left':
          x = rect.left - padding - tooltipOffset;
          y = rect.top + rect.height / 2;
          break;
        case 'right':
          x = rect.right + padding + tooltipOffset;
          y = rect.top + rect.height / 2;
          break;
      }

      setTooltipPosition({ x, y });
    }
  }, [currentStep]);

  useEffect(() => {
    if (isActive && currentStep) {
      updateTargetPosition();
      
      // Update on scroll/resize
      window.addEventListener('scroll', updateTargetPosition, true);
      window.addEventListener('resize', updateTargetPosition);

      return () => {
        window.removeEventListener('scroll', updateTargetPosition, true);
        window.removeEventListener('resize', updateTargetPosition);
      };
    }
  }, [isActive, currentStep, updateTargetPosition]);

  if (!isActive || !currentStep) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  const getTooltipTransform = () => {
    switch (currentStep.placement) {
      case 'top':
        return 'translate(-50%, -100%)';
      case 'bottom':
        return 'translate(-50%, 0)';
      case 'left':
        return 'translate(-100%, -50%)';
      case 'right':
        return 'translate(0, -50%)';
      default:
        return 'translate(-50%, 0)';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999]"
      >
        {/* Spotlight Overlay */}
        <SpotlightOverlay
          targetRect={targetRect}
          padding={currentStep.spotlightPadding || 8}
        />

        {/* Animated Pointer */}
        {targetRect && (
          <AnimatedPointer
            targetX={targetRect.left + targetRect.width / 2}
            targetY={targetRect.top + targetRect.height / 2}
          />
        )}

        {/* Tooltip */}
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: getTooltipTransform(),
          }}
          className="w-80 max-w-[90vw] z-[10000]"
        >
          <div className="relative rounded-2xl bg-surface-1/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-border-default dark:border-white/10 shadow-2xl overflow-hidden">
            <ShineBorder
              shineColor={['#8B5CF6', '#F59E0B']}
              borderWidth={1}
              duration={6}
            />
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-amber flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-text-tertiary dark:text-muted-foreground">
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
              </div>
              <button
                onClick={onSkip}
                className="p-1.5 rounded-lg hover:bg-surface-2 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4 text-text-tertiary dark:text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-text-primary dark:text-foreground mb-2">
                {currentStep.title}
              </h3>
              <p className="text-sm text-text-secondary dark:text-muted-foreground leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-1.5 py-3 border-t border-b border-border-subtle dark:border-white/5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => onGoToStep(i)}
                  className="p-1"
                >
                  <motion.div
                    animate={{
                      scale: i === currentStepIndex ? 1.3 : 1,
                      opacity: i === currentStepIndex ? 1 : i < currentStepIndex ? 0.7 : 0.4,
                    }}
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      i === currentStepIndex
                        ? 'bg-accent-purple'
                        : i < currentStepIndex
                        ? 'bg-accent-purple/50'
                        : 'bg-text-tertiary/30 dark:bg-white/20'
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-4">
              <button
                onClick={onPrev}
                disabled={isFirstStep}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isFirstStep
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-surface-2 dark:hover:bg-white/5 text-text-secondary dark:text-muted-foreground'
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={isLastStep ? onComplete : onNext}
                className={cn(
                  'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  'bg-gradient-to-r from-accent-purple to-accent-purple/80 text-white',
                  'hover:shadow-[0_0_20px_hsl(var(--accent-purple)/0.4)]'
                )}
              >
                {isLastStep ? 'Get Started' : 'Next'}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
