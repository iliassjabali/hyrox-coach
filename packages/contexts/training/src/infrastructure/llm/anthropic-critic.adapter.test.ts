import { describe, expect, it } from 'vitest';
import { AnthropicCriticAdapter } from './anthropic-critic.adapter';
import type { StructuredLlmCall } from './structured-llm-call';
import { SessionType } from '../../domain/session-type';
import { WeeklyPlan } from '../../domain/weekly-plan';

const weekStartingOn = new Date('2026-06-08T00:00:00Z');
const plan = WeeklyPlan.create({
  weekStartingOn,
  sessions: [{ day: 1, type: SessionType.of('run'), focus: 'easy' }],
});

const callReturning = (object: unknown): StructuredLlmCall =>
  async (opts) => ({ object: opts.schema.parse(object), usage: { inputTokens: 30, outputTokens: 10 } });

describe('AnthropicCriticAdapter', () => {
  it('maps an accepting model output to an accepted PlanVerdict', async () => {
    const adapter = new AnthropicCriticAdapter(
      callReturning({ accepted: true, reasons: [], suggestedFixes: [] }),
    );
    const { verdict, usage } = await adapter.review({ plan, sessions: [] });

    expect(verdict.isAccepted).toBe(true);
    expect(usage).toEqual({ inputTokens: 30, outputTokens: 10 });
  });

  it('maps a rejecting model output to a rejected PlanVerdict with reasons + fixes', async () => {
    const adapter = new AnthropicCriticAdapter(
      callReturning({ accepted: false, reasons: ['too hard'], suggestedFixes: ['cut a session'] }),
    );
    const { verdict } = await adapter.review({ plan, sessions: [] });

    expect(verdict.isAccepted).toBe(false);
    expect(verdict.reasons).toEqual(['too hard']);
    expect(verdict.suggestedFixes).toEqual(['cut a session']);
  });

  it('falls back to a reason when the model rejects without one', async () => {
    const adapter = new AnthropicCriticAdapter(
      callReturning({ accepted: false, reasons: [], suggestedFixes: [] }),
    );
    const { verdict } = await adapter.review({ plan, sessions: [] });

    expect(verdict.isAccepted).toBe(false);
    expect(verdict.reasons.length).toBeGreaterThan(0);
  });
});
