/**
 * Studio Hooks Index
 * Central export for all Studio-specific hooks
 */

export { useStudioKeyboardShortcuts, STUDIO_SHORTCUTS } from './useStudioKeyboardShortcuts';
export type { StudioKeyboardShortcutsOptions } from './useStudioKeyboardShortcuts';

export { useStudioMouse } from './useStudioMouse';
export type { MouseInteractionState, UseStudioMouseOptions } from './useStudioMouse';

export { useConnectionDrawing } from './useConnectionDrawing';
export type { ConnectionDrawingState, UseConnectionDrawingOptions } from './useConnectionDrawing';

export { useSelectionBox } from './useSelectionBox';
export type { SelectionBox, UseSelectionBoxOptions } from './useSelectionBox';

export { useNodePositionSync } from './useNodePositionSync';

// Physics Canvas hooks
export { useSpringPhysics } from './useSpringPhysics';
export { useGestureVelocity } from './useGestureVelocity';
export { useGridSnapping } from './useGridSnapping';
export { usePhysicsLoop } from './usePhysicsLoop';
