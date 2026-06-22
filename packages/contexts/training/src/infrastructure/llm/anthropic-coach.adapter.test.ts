import { describe, expect, it } from 'vitest';
import { AnthropicCoachAdapter } from './anthropic-coach.adapter';
import type { StructuredLlmCall } from './structured-llm-call';
import { SessionType } from '../../domain/session-type';
import { WorkoutSession } from '../../domain/workout-session';

const fakeCall: StructuredLlmCall = async (opts) => ({
  object: opts.schema.parse({
    sessions: [{ day: 1, type: 'run', focus: 'easy aerobic' }],
  }),
  usage: { inputTokens: 100, outputTokens: 40 },
});

const history = [
  WorkoutSession.create({
    id: 's1',
    date: new Date('2026-06-01T07:00:00Z'),
    type: SessionType.of('run'),
    durationSeconds: 1800,
  }),
];

describe('AnthropicCoachAdapter', () => {
  it('maps model output to a domain WeeklyPlan + usage', async () => {
    const adapter = new AnthropicCoachAdapter(fakeCall);
    const weekStartingOn = new Date('2026-06-08T00:00:00Z');

    const { plan, usage } = await adapter.generatePlan({ sessions: history, weekStartingOn });

    expect(plan.weekStartingOn).toEqual(weekStartingOn);
    expect(plan.sessions[0]!.type.value).toBe('run');
    expect(plan.sessions[0]!.focus).toBe('easy aerobic');
    expect(usage).toEqual({ inputTokens: 100, outputTokens: 40 });
  });
});
