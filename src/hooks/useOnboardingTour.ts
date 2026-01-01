import { useState, useCallback, useEffect } from 'react';

export interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;
}

const HOME_TOUR_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="dashboard-title"]',
    title: 'Welcome to Your Dashboard',
    description: 'This is your central hub for managing all your creative projects.',
    placement: 'bottom',
    spotlightPadding: 12,
  },
  {
    id: 'stats',
    target: '[data-tour="stats-section"]',
    title: 'Track Your Metrics',
    description: 'Monitor project activity, generated assets, and available credits at a glance.',
    placement: 'bottom',
    spotlightPadding: 16,
  },
  {
    id: 'projects',
    target: '[data-tour="projects-section"]',
    title: 'Your Projects',
    description: 'All your projects are displayed here. Click any project to open it.',
    placement: 'top',
    spotlightPadding: 20,
  },
  {
    id: 'new-project',
    target: '[data-tour="new-project-btn"]',
    title: 'Create New Project',
    description: 'Click here to start a new AI-powered video project.',
    placement: 'left',
    spotlightPadding: 8,
  },
  {
    id: 'search',
    target: '[data-tour="search-bar"]',
    title: 'Search & Filter',
    description: 'Quickly find projects by name or description.',
    placement: 'bottom',
    spotlightPadding: 8,
  },
  {
    id: 'sidebar',
    target: '[data-tour="sidebar-nav"]',
    title: 'Navigation',
    description: 'Switch between views, access shared projects, and explore the community.',
    placement: 'right',
    spotlightPadding: 12,
  },
];

export function useOnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(() => {
    return localStorage.getItem('onboarding-tour-completed') === 'true';
  });

  const steps = HOME_TOUR_STEPS;
  const currentStep = isActive ? steps[currentStepIndex] : null;
  const totalSteps = steps.length;

  const start = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
  }, []);

  const complete = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setHasCompleted(true);
    localStorage.setItem('onboarding-tour-completed', 'true');
  }, []);

  const next = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      complete();
    }
  }, [currentStepIndex, steps.length, complete]);

  const prev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  }, [steps.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stop();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        next();
      } else if (e.key === 'ArrowLeft') {
        prev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, next, prev, stop]);

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    hasCompleted,
    start,
    stop,
    complete,
    next,
    prev,
    goToStep,
  };
}
