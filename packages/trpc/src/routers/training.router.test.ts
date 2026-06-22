import { describe, expect, it } from 'vitest';
import { buildTraining } from '@hyrox/training/composition';
import {
  FakeClassifierLlm,
  FakeCoachLlm,
  FakeCriticLlm,
  FixedClock,
  InMemoryRunLog,
  InMemorySessionRepository,
} from '@hyrox/training/testing';
import { SessionType, WeeklyPlan, PlanVerdict } from '@hyrox/training';
import { appRouter } from './index';
import { createCallerFactory } from '../trpc';

const createCaller = createCallerFactory(appRouter);
const weekStartingOn = new Date('2026-06-08T00:00:00Z');

function fakeTraining() {
  return buildTraining({
    classifierLlm: new FakeClassifierLlm([
      { id: 'a1', type: SessionType.of('run'), confidence: 0.9 },
    ]),
    coachLlm: new FakeCoachLlm(
      WeeklyPlan.create({
        weekStartingOn,
        sessions: [{ day: 1, type: SessionType.of('run'), focus: 'easy aerobic' }],
      }),
    ),
    criticLlm: new FakeCriticLlm([PlanVerdict.accepted()]),
    sessionRepository: new InMemorySessionRepository(),
    runLog: new InMemoryRunLog(),
    clock: new FixedClock(new Date('2026-06-05T10:00:00Z')),
  });
}

describe('appRouter.training', () => {
  it('coachAthlete returns an accepted plan via the tRPC procedure', async () => {
    const caller = createCaller({ training: fakeTraining() });

    const result = await caller.training.coachAthlete({
      sessions: [{ id: 'a1', date: new Date('2026-06-01T07:00:00Z'), durationSeconds: 1800 }],
      weekStartingOn: new Date('2026-06-08T00:00:00Z'),
    });

    expect(result.accepted).toBe(true);
    expect(result.plan.sessions[0]!.type).toBe('run');
    expect(result.plan.sessions[0]!.focus).toBe('easy aerobic');
  });

  it('classifySessions classifies and summarises by type', async () => {
    const caller = createCaller({ training: fakeTraining() });

    const result = await caller.training.classifySessions({
      sessions: [{ id: 'a1', date: new Date('2026-06-01T07:00:00Z'), durationSeconds: 1800 }],
    });

    expect(result.classified).toBe(1);
    expect(result.byType).toEqual({ run: 1 });
  });

  it('rejects invalid input (non-positive duration)', async () => {
    const caller = createCaller({ training: fakeTraining() });

    await expect(
      caller.training.classifySessions({
        sessions: [{ id: 'a1', date: new Date('2026-06-01T07:00:00Z'), durationSeconds: 0 }],
      }),
    ).rejects.toThrow();
  });
});
