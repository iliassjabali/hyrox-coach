import { describe, expect, it } from 'vitest';
import { PlanVerdict } from './plan-verdict';
import { InvalidPlanVerdict } from './errors';

describe('PlanVerdict', () => {
  it('accepts a plan with no reasons or fixes', () => {
    const verdict = PlanVerdict.accepted();
    expect(verdict.isAccepted).toBe(true);
    expect(verdict.reasons).toEqual([]);
    expect(verdict.suggestedFixes).toEqual([]);
  });

  it('rejects a plan, recording the reasons', () => {
    const verdict = PlanVerdict.rejected(['weekly volume jumps >50%']);
    expect(verdict.isAccepted).toBe(false);
    expect(verdict.reasons).toEqual(['weekly volume jumps >50%']);
  });

  it('carries suggested fixes on rejection', () => {
    const verdict = PlanVerdict.rejected(['too hard'], ['cut one interval session']);
    expect(verdict.suggestedFixes).toEqual(['cut one interval session']);
  });

  it('requires at least one reason to reject', () => {
    expect(() => PlanVerdict.rejected([])).toThrow(InvalidPlanVerdict);
  });

  it('exposes immutable reason/fix arrays', () => {
    const verdict = PlanVerdict.rejected(['r'], ['f']);
    expect(() => (verdict.reasons as string[]).push('x')).toThrow();
    expect(() => (verdict.suggestedFixes as string[]).push('y')).toThrow();
  });
});
