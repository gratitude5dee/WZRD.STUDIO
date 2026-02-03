/**
 * Unit Tests for Node Status State Machine
 * 
 * Tests all valid and invalid state transitions to ensure
 * the compute graph maintains consistent state.
 */

import { describe, it, expect } from 'vitest';
import {
  validateStatusTransition,
  getValidNextStatuses,
  getTransitionAction,
  guardStatusTransition,
  isValidNodeStatus,
  VALID_TRANSITIONS,
} from '@/types/nodeStatusMachine';
import type { NodeStatus } from '@/types/computeFlow';

describe('nodeStatusMachine', () => {
  describe('validateStatusTransition', () => {
    // Valid transitions from 'idle'
    describe('from idle', () => {
      it('allows idle → queued', () => {
        const result = validateStatusTransition('idle', 'queued');
        expect(result.valid).toBe(true);
        expect(result.transition?.action).toBe('QUEUE');
      });

      it('rejects idle → running', () => {
        const result = validateStatusTransition('idle', 'running');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid transition');
        expect(result.error).toContain('idle → running');
      });

      it('rejects idle → succeeded', () => {
        const result = validateStatusTransition('idle', 'succeeded');
        expect(result.valid).toBe(false);
      });

      it('rejects idle → failed', () => {
        const result = validateStatusTransition('idle', 'failed');
        expect(result.valid).toBe(false);
      });
    });

    // Valid transitions from 'queued'
    describe('from queued', () => {
      it('allows queued → running', () => {
        const result = validateStatusTransition('queued', 'running');
        expect(result.valid).toBe(true);
        expect(result.transition?.action).toBe('START');
      });

      it('allows queued → canceled', () => {
        const result = validateStatusTransition('queued', 'canceled');
        expect(result.valid).toBe(true);
        expect(result.transition?.action).toBe('CANCEL');
      });

      it('rejects queued → succeeded', () => {
        const result = validateStatusTransition('queued', 'succeeded');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid transition');
      });

      it('rejects queued → failed', () => {
        const result = validateStatusTransition('queued', 'failed');
        expect(result.valid).toBe(false);
      });

      it('rejects queued → idle (must reset via dirty/canceled)', () => {
        const result = validateStatusTransition('queued', 'idle');
        expect(result.valid).toBe(false);
      });
    });

    // Valid transitions from 'running'
    describe('from running', () => {
      it('allows running → succeeded', () => {
        const result = validateStatusTransition('running', 'succeeded');
        expect(result.valid).toBe(true);
        expect(result.transition?.action).toBe('COMPLETE');
      });

      it('allows running → failed', () => {
        const result = validateStatusTransition('running', 'failed');
        expect(result.valid).toBe(true);
        expect(result.transition?.action).toBe('FAIL');
      });

      it('allows running → canceled', () => {
        const result = validateStatusTransition('running', 'canceled');
        expect(result.valid).toBe(true);
        expect(result.transition?.action).toBe('CANCEL');
      });

      it('rejects running → queued (cannot re-queue running node)', () => {
        const result = validateStatusTransition('running', 'queued');
        expect(result.valid).toBe(false);
      });

      it('rejects running → idle', () => {
        const result = validateStatusTransition('running', 'idle');
        expect(result.valid).toBe(false);
      });
    });

    // Valid transitions from 'succeeded'
    describe('from succeeded', () => {
      it('allows succeeded → dirty', () => {
        const result = validateStatusTransition('succeeded', 'dirty');
        expect(result.valid).toBe(true);
        expect(result.transition?.action).toBe('INVALIDATE');
      });

      it('allows succeeded → idle', () => {
        const result = validateStatusTransition('succeeded', 'idle');
        expect(result.valid).toBe(true);
        expect(result.transition?.action).toBe('RESET');
      });

      it('rejects succeeded → running (must go through queued)', () => {
        const result = validateStatusTransition('succeeded', 'running');
        expect(result.valid).toBe(false);
      });
    });

    // Valid transitions from 'failed'
    describe('from failed', () => {
      it('allows failed → queued (retry)', () => {
        const result = validateStatusTransition('failed', 'queued');
        expect(result.valid).toBe(true);
      });

      it('allows failed → dirty', () => {
        const result = validateStatusTransition('failed', 'dirty');
        expect(result.valid).toBe(true);
      });

      it('allows failed → idle', () => {
        const result = validateStatusTransition('failed', 'idle');
        expect(result.valid).toBe(true);
      });

      it('rejects failed → running', () => {
        const result = validateStatusTransition('failed', 'running');
        expect(result.valid).toBe(false);
      });

      it('rejects failed → succeeded', () => {
        const result = validateStatusTransition('failed', 'succeeded');
        expect(result.valid).toBe(false);
      });
    });

    // Valid transitions from 'canceled'
    describe('from canceled', () => {
      it('allows canceled → queued (re-run)', () => {
        const result = validateStatusTransition('canceled', 'queued');
        expect(result.valid).toBe(true);
      });

      it('allows canceled → idle', () => {
        const result = validateStatusTransition('canceled', 'idle');
        expect(result.valid).toBe(true);
      });

      it('rejects canceled → running', () => {
        const result = validateStatusTransition('canceled', 'running');
        expect(result.valid).toBe(false);
      });
    });

    // Valid transitions from 'dirty'
    describe('from dirty', () => {
      it('allows dirty → queued', () => {
        const result = validateStatusTransition('dirty', 'queued');
        expect(result.valid).toBe(true);
      });

      it('allows dirty → idle', () => {
        const result = validateStatusTransition('dirty', 'idle');
        expect(result.valid).toBe(true);
      });

      it('rejects dirty → running', () => {
        const result = validateStatusTransition('dirty', 'running');
        expect(result.valid).toBe(false);
      });

      it('rejects dirty → succeeded', () => {
        const result = validateStatusTransition('dirty', 'succeeded');
        expect(result.valid).toBe(false);
      });
    });

    // Same status (no-op)
    describe('same status transitions', () => {
      const statuses: NodeStatus[] = ['idle', 'queued', 'running', 'succeeded', 'failed', 'canceled', 'dirty'];
      
      statuses.forEach(status => {
        it(`allows ${status} → ${status} (no-op)`, () => {
          const result = validateStatusTransition(status, status);
          expect(result.valid).toBe(true);
        });
      });
    });

    // Error message quality
    describe('error messages', () => {
      it('provides helpful error with valid targets from current', () => {
        const result = validateStatusTransition('idle', 'succeeded');
        expect(result.error).toContain('idle');
        expect(result.error).toContain('queued'); // Valid target from idle
      });

      it('provides helpful error with required sources for target', () => {
        const result = validateStatusTransition('idle', 'running');
        expect(result.error).toContain('running');
        expect(result.error).toContain('queued'); // Required source for running
      });
    });
  });

  describe('getValidNextStatuses', () => {
    it('returns [queued] for idle', () => {
      const next = getValidNextStatuses('idle');
      expect(next).toContain('queued');
      expect(next).not.toContain('running');
    });

    it('returns [running, canceled] for queued', () => {
      const next = getValidNextStatuses('queued');
      expect(next).toContain('running');
      expect(next).toContain('canceled');
      expect(next).toHaveLength(2);
    });

    it('returns [succeeded, failed, canceled] for running', () => {
      const next = getValidNextStatuses('running');
      expect(next).toContain('succeeded');
      expect(next).toContain('failed');
      expect(next).toContain('canceled');
      expect(next).toHaveLength(3);
    });

    it('returns [dirty, idle] for succeeded', () => {
      const next = getValidNextStatuses('succeeded');
      expect(next).toContain('dirty');
      expect(next).toContain('idle');
    });
  });

  describe('getTransitionAction', () => {
    it('returns QUEUE for idle → queued', () => {
      expect(getTransitionAction('idle', 'queued')).toBe('QUEUE');
    });

    it('returns START for queued → running', () => {
      expect(getTransitionAction('queued', 'running')).toBe('START');
    });

    it('returns COMPLETE for running → succeeded', () => {
      expect(getTransitionAction('running', 'succeeded')).toBe('COMPLETE');
    });

    it('returns FAIL for running → failed', () => {
      expect(getTransitionAction('running', 'failed')).toBe('FAIL');
    });

    it('returns CANCEL for running → canceled', () => {
      expect(getTransitionAction('running', 'canceled')).toBe('CANCEL');
    });

    it('returns INVALIDATE for succeeded → dirty', () => {
      expect(getTransitionAction('succeeded', 'dirty')).toBe('INVALIDATE');
    });

    it('returns RESET for dirty → idle', () => {
      expect(getTransitionAction('dirty', 'idle')).toBe('RESET');
    });

    it('returns null for invalid transition', () => {
      expect(getTransitionAction('idle', 'running')).toBeNull();
    });
  });

  describe('guardStatusTransition', () => {
    it('does not throw for valid transition', () => {
      expect(() => guardStatusTransition('idle', 'queued')).not.toThrow();
    });

    it('throws for invalid transition', () => {
      expect(() => guardStatusTransition('idle', 'running')).toThrow('Status transition error');
    });

    it('includes node ID in error when provided', () => {
      expect(() => guardStatusTransition('idle', 'running', 'node-123'))
        .toThrow('node-123');
    });

    it('does not throw for same status', () => {
      expect(() => guardStatusTransition('running', 'running')).not.toThrow();
    });
  });

  describe('isValidNodeStatus', () => {
    it('returns true for valid statuses', () => {
      expect(isValidNodeStatus('idle')).toBe(true);
      expect(isValidNodeStatus('queued')).toBe(true);
      expect(isValidNodeStatus('running')).toBe(true);
      expect(isValidNodeStatus('succeeded')).toBe(true);
      expect(isValidNodeStatus('failed')).toBe(true);
      expect(isValidNodeStatus('canceled')).toBe(true);
      expect(isValidNodeStatus('dirty')).toBe(true);
    });

    it('returns false for invalid statuses', () => {
      expect(isValidNodeStatus('pending')).toBe(false);
      expect(isValidNodeStatus('complete')).toBe(false);
      expect(isValidNodeStatus('')).toBe(false);
      expect(isValidNodeStatus('IDLE')).toBe(false);
    });
  });

  describe('VALID_TRANSITIONS coverage', () => {
    it('every status has at least one outgoing transition', () => {
      const statuses: NodeStatus[] = ['idle', 'queued', 'running', 'succeeded', 'failed', 'canceled', 'dirty'];
      
      statuses.forEach(status => {
        const hasOutgoing = VALID_TRANSITIONS.some(t => t.from.includes(status));
        expect(hasOutgoing).toBe(true);
      });
    });

    it('every status except idle is reachable', () => {
      const targets = new Set(VALID_TRANSITIONS.map(t => t.to));
      
      expect(targets.has('queued')).toBe(true);
      expect(targets.has('running')).toBe(true);
      expect(targets.has('succeeded')).toBe(true);
      expect(targets.has('failed')).toBe(true);
      expect(targets.has('canceled')).toBe(true);
      expect(targets.has('dirty')).toBe(true);
      expect(targets.has('idle')).toBe(true);
    });
  });
});
