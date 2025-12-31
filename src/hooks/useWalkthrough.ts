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
    content: 'Click here to add different types of nodes: Text, Image, Video, or Upload.',
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
    id: 'sidebar-ai',
    target: '[data-walkthrough="ai-workflow-button"]',
    title: 'AI Workflow Generator',
    content: 'Describe what you want to create and AI will generate a workflow for you!',
    placement: 'right',
  },
  {
    id: 'sidebar-assets',
    target: '[data-walkthrough="assets-button"]',
    title: 'Project Assets',
    content: 'Browse uploaded files and AI-generated outputs.',
    placement: 'right',
  },
  {
    id: 'canvas',
    target: '[data-walkthrough="canvas"]',
    title: 'Workflow Canvas',
    content: 'Drag nodes around, connect them to build your creative pipeline.',
    placement: 'bottom',
  },
  {
    id: 'bottom-bar',
    target: '[data-walkthrough="queue"]',
    title: 'Generation Queue',
    content: 'Monitor your running generations and see progress here.',
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
