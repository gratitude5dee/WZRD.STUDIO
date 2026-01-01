import { useState, useCallback } from 'react';

export interface WalkthroughStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

const STUDIO_WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'sidebar-add',
    target: '[data-walkthrough="add-button"]',
    title: 'Add Nodes',
    content: 'Click here to add Text, Image, Video, or Upload nodes to your workflow.',
    placement: 'right',
  },
  {
    id: 'sidebar-flows',
    target: '[data-walkthrough="flows-button"]',
    title: 'Saved Flows',
    content: 'Save and load your workflow configurations here.',
    placement: 'right',
  },
  {
    id: 'sidebar-history',
    target: '[data-walkthrough="history-button"]',
    title: 'History & Undo',
    content: 'View your action history and undo/redo changes.',
    placement: 'right',
  },
  {
    id: 'workflow-tab',
    target: '[data-walkthrough="workflow-tab"]',
    title: 'AI Workflow Generator',
    content: 'Use AI to generate complete workflows from natural language descriptions!',
    placement: 'left',
  },
  {
    id: 'gallery-tab',
    target: '[data-walkthrough="gallery-tab"]',
    title: 'Asset Gallery',
    content: 'View all your generated images, videos, and uploaded files here.',
    placement: 'left',
  },
  {
    id: 'toolbar',
    target: '[data-walkthrough="toolbar"]',
    title: 'Canvas Toolbar',
    content: 'Run workflows, adjust view settings, and access zoom controls here.',
    placement: 'top',
  },
];

export function useWalkthrough() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const start = useCallback(() => {
    setIsActive(true);
    setCurrentStepIndex(0);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
  }, []);

  const next = useCallback(() => {
    if (currentStepIndex < STUDIO_WALKTHROUGH_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      stop();
    }
  }, [currentStepIndex, stop]);

  const prev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const currentStep = isActive ? STUDIO_WALKTHROUGH_STEPS[currentStepIndex] : null;

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps: STUDIO_WALKTHROUGH_STEPS.length,
    start,
    stop,
    next,
    prev,
  };
}
