/**
 * State Machine for Node Status Transitions
 * 
 * This module provides strict validation for node status transitions,
 * preventing invalid state changes that could corrupt the compute graph.
 * 
 * Valid State Diagram:
 * 
 *   idle ──────┐
 *     ▲        │
 *     │        ▼
 *   dirty   queued ──────► running ──────► succeeded
 *     ▲        │             │                │
 *     │        │             │                │
 *     │        ▼             ▼                │
 *     └──── canceled ◄──── failed ◄──────────┘
 *                              │
 *                              └──► dirty
 */

import type { NodeStatus } from './computeFlow';

export interface StatusTransition {
  from: NodeStatus[];
  to: NodeStatus;
  action: string;
  description: string;
}

/**
 * All valid status transitions in the compute flow system
 */
export const VALID_TRANSITIONS: StatusTransition[] = [
  // Initial queueing
  { 
    from: ['idle', 'failed', 'canceled', 'dirty'], 
    to: 'queued', 
    action: 'QUEUE',
    description: 'Node scheduled for execution'
  },
  
  // Execution start
  { 
    from: ['queued'], 
    to: 'running', 
    action: 'START',
    description: 'Node execution has begun'
  },
  
  // Successful completion
  { 
    from: ['running'], 
    to: 'succeeded', 
    action: 'COMPLETE',
    description: 'Node execution finished successfully'
  },
  
  // Failure
  { 
    from: ['running'], 
    to: 'failed', 
    action: 'FAIL',
    description: 'Node execution encountered an error'
  },
  
  // Cancellation
  { 
    from: ['running', 'queued'], 
    to: 'canceled', 
    action: 'CANCEL',
    description: 'Node execution was canceled by user'
  },
  
  // Invalidation (upstream changed)
  { 
    from: ['succeeded', 'failed'], 
    to: 'dirty', 
    action: 'INVALIDATE',
    description: 'Node output invalidated due to upstream changes'
  },
  
  // Reset to idle
  { 
    from: ['dirty', 'canceled', 'failed', 'succeeded'], 
    to: 'idle', 
    action: 'RESET',
    description: 'Node reset to initial state'
  },
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
  transition?: StatusTransition;
}

/**
 * Validates whether a status transition is allowed
 * 
 * @param current - Current node status
 * @param next - Desired next status
 * @returns Validation result with error message if invalid
 * 
 * @example
 * ```ts
 * const result = validateStatusTransition('idle', 'queued');
 * // { valid: true, transition: { from: ['idle', ...], to: 'queued', ... } }
 * 
 * const invalid = validateStatusTransition('idle', 'running');
 * // { valid: false, error: 'Invalid transition: idle → running. ...' }
 * ```
 */
export function validateStatusTransition(
  current: NodeStatus,
  next: NodeStatus
): ValidationResult {
  // Same status is always valid (no-op)
  if (current === next) {
    return { valid: true };
  }
  
  // Find a transition that allows this change
  const transition = VALID_TRANSITIONS.find(
    t => t.to === next && t.from.includes(current)
  );
  
  if (transition) {
    return { valid: true, transition };
  }
  
  // Build helpful error message
  const allowedFromCurrent = VALID_TRANSITIONS
    .filter(t => t.from.includes(current))
    .map(t => t.to);
  
  const allowedToCurrent = VALID_TRANSITIONS
    .filter(t => t.to === next)
    .map(t => t.from)
    .flat();
  
  const errorParts = [
    `Invalid transition: ${current} → ${next}.`,
    allowedFromCurrent.length > 0 
      ? `From '${current}', valid transitions are: [${allowedFromCurrent.join(', ')}].`
      : `No transitions available from '${current}'.`,
    allowedToCurrent.length > 0
      ? `To reach '${next}', node must be in: [${[...new Set(allowedToCurrent)].join(', ')}].`
      : `'${next}' is not a valid target status.`,
  ];
  
  return {
    valid: false,
    error: errorParts.join(' '),
  };
}

/**
 * Returns all valid next statuses from a given current status
 */
export function getValidNextStatuses(current: NodeStatus): NodeStatus[] {
  return VALID_TRANSITIONS
    .filter(t => t.from.includes(current))
    .map(t => t.to);
}

/**
 * Returns the action name for a transition (useful for logging/telemetry)
 */
export function getTransitionAction(from: NodeStatus, to: NodeStatus): string | null {
  const transition = VALID_TRANSITIONS.find(
    t => t.to === to && t.from.includes(from)
  );
  return transition?.action ?? null;
}

/**
 * Type guard to check if a string is a valid NodeStatus
 */
export function isValidNodeStatus(status: string): status is NodeStatus {
  const validStatuses: NodeStatus[] = [
    'idle', 'queued', 'running', 'succeeded', 'failed', 'canceled', 'dirty'
  ];
  return validStatuses.includes(status as NodeStatus);
}

/**
 * Guards a status update, throwing if invalid
 * Use this in reducers/setters to enforce state machine
 */
export function guardStatusTransition(
  current: NodeStatus,
  next: NodeStatus,
  nodeId?: string
): void {
  const result = validateStatusTransition(current, next);
  if (!result.valid) {
    const context = nodeId ? ` (node: ${nodeId})` : '';
    throw new Error(`Status transition error${context}: ${result.error}`);
  }
}
