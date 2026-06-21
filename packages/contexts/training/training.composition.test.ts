import { describe, expect, it } from 'vitest';
import { buildTraining } from './training.composition';
import { InMemorySessionRepository } from './src/testing/in-memory-session.repository';
import { InMemoryRunLog } from './src/testing/in-memory-run-log';
import { FakeClassifierLlm } from './src/testing/fake-classifier-llm';
import { FakeCoachLlm } from './src/testing/fake-coach-llm';
import { FakeCriticLlm } from './src/testing/fake-critic-llm';
import { FixedClock } from './src/testing/fixed-clock';
import { SessionType } from './src/domain/session-type';
import { WeeklyPlan } from './src/domain/weekly-plan';
import { PlanVerdict } from './src/domain/plan-verdict';

const weekStartingOn = new Date('2026-06-08T00:00:00Z');

describe('buildTraining (composition root)', () => {
  it('wires use cases that run end-to-end with adapters', async () => {
    const training = buildTraining({
      classifierLlm: new FakeClassifierLlm([
        { id: 'a1', type: SessionType.of('run'), confidence: 0.9 },
      ]),
      coachLlm: new FakeCoachLlm(
        WeeklyPlan.create({
          weekStartingOn,
          sessions: [{ day: 1, type: SessionType.of('run'), focus: 'easy' }],
        }),
      ),
      criticLlm: new FakeCriticLlm([PlanVerdict.accepted()]),
      sessionRepository: new InMemorySessionRepository(),
      runLog: new InMemoryRunLog(),
      clock: new FixedClock(new Date('2026-06-05T10:00:00Z')),
    });

    expect(training.classifySessions).toBeDefined();

    const result = await training.coachAthlete.execute({
      sessions: [{ id: 'a1', date: new Date('2026-06-01T07:00:00Z'), durationSeconds: 1800 }],
      weekStartingOn,
    });

    expect(result.accepted).toBe(true);
  });
});
