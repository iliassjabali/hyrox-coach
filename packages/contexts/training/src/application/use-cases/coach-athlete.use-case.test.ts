import { describe, expect, it } from 'vitest';
import { CoachAthleteUseCase } from './coach-athlete.use-case';
import type { CoachProgress } from '../ports/in/coach-athlete.port';
import { InMemorySessionRepository } from '../../testing/in-memory-session.repository';
import { InMemoryRunLog } from '../../testing/in-memory-run-log';
import { FakeClassifierLlm } from '../../testing/fake-classifier-llm';
import { FakeCoachLlm } from '../../testing/fake-coach-llm';
import { FakeCriticLlm } from '../../testing/fake-critic-llm';
import { FixedClock } from '../../testing/fixed-clock';
import { SessionType } from '../../domain/session-type';
import { WeeklyPlan } from '../../domain/weekly-plan';
import { PlanVerdict } from '../../domain/plan-verdict';

const raw = [
  { id: 'a1', date: new Date('2026-06-01T07:00:00Z'), durationSeconds: 1800, averageHeartRate: 150 },
];
const weekStartingOn = new Date('2026-06-08T00:00:00Z');

const planWith = (focus: string): WeeklyPlan =>
  WeeklyPlan.create({
    weekStartingOn,
    sessions: [{ day: 1, type: SessionType.of('run'), focus }],
  });

function makeDeps(coach: FakeCoachLlm, critic: FakeCriticLlm) {
  return {
    classifier: new FakeClassifierLlm([{ id: 'a1', type: SessionType.of('run'), confidence: 0.9 }]),
    coach,
    critic,
    repo: new InMemorySessionRepository(),
    runLog: new InMemoryRunLog(),
    clock: new FixedClock(new Date('2026-06-05T10:00:00Z')),
  };
}

describe('CoachAthleteUseCase', () => {
  it('classifies, coaches, and returns an accepted plan on first pass', async () => {
    const coach = new FakeCoachLlm(planWith('easy aerobic'));
    const critic = new FakeCriticLlm([PlanVerdict.accepted()]);
    const d = makeDeps(coach, critic);
    const useCase = new CoachAthleteUseCase(d.classifier, d.coach, d.critic, d.repo, d.runLog, d.clock);

    const result = await useCase.execute({ sessions: raw, weekStartingOn });

    expect(result.accepted).toBe(true);
    expect(result.attempts).toBe(1);
    expect(result.plan.sessions[0]!.focus).toBe('easy aerobic');
    expect(await d.repo.listAll()).toHaveLength(1); // sessions persisted
    expect(d.runLog.entries).toHaveLength(1); // run recorded
  });

  it('re-coaches with critic feedback when the first plan is rejected', async () => {
    const coach = new FakeCoachLlm(planWith('v1'));
    const critic = new FakeCriticLlm([
      PlanVerdict.rejected(['too much volume'], ['cut one session']),
      PlanVerdict.accepted(),
    ]);
    const d = makeDeps(coach, critic);
    const useCase = new CoachAthleteUseCase(d.classifier, d.coach, d.critic, d.repo, d.runLog, d.clock);

    const result = await useCase.execute({ sessions: raw, weekStartingOn });

    expect(result.accepted).toBe(true);
    expect(result.attempts).toBe(2);
    expect(coach.calls).toHaveLength(2);
    expect(coach.calls[1]!.criticFeedback).toEqual(['too much volume', 'cut one session']);
  });

  it('gives up after maxAttempts when the critic keeps rejecting', async () => {
    const coach = new FakeCoachLlm(planWith('v1'));
    const critic = new FakeCriticLlm([
      PlanVerdict.rejected(['nope']),
      PlanVerdict.rejected(['still nope']),
    ]);
    const d = makeDeps(coach, critic);
    const useCase = new CoachAthleteUseCase(d.classifier, d.coach, d.critic, d.repo, d.runLog, d.clock);

    const result = await useCase.execute({ sessions: raw, weekStartingOn, maxAttempts: 2 });

    expect(result.accepted).toBe(false);
    expect(result.attempts).toBe(2);
    expect(result.verdict.reasons).toEqual(['still nope']);
  });

  it('aggregates token cost across classifier, coach and critic calls', async () => {
    const coach = new FakeCoachLlm(planWith('x'), { inputTokens: 100, outputTokens: 50 });
    const critic = new FakeCriticLlm([PlanVerdict.accepted()], { inputTokens: 30, outputTokens: 10 });
    const d = makeDeps(coach, critic);
    // classifier fake reports zero usage
    const useCase = new CoachAthleteUseCase(d.classifier, d.coach, d.critic, d.repo, d.runLog, d.clock);

    const result = await useCase.execute({ sessions: raw, weekStartingOn });

    expect(result.cost).toEqual({ inputTokens: 130, outputTokens: 60 });
    expect(d.runLog.entries[0]!.at.toISOString()).toBe('2026-06-05T10:00:00.000Z');
  });

  it('emits stage-progress events for classify, each coach attempt, and each critic verdict', async () => {
    const coach = new FakeCoachLlm(planWith('v1'));
    const critic = new FakeCriticLlm([
      PlanVerdict.rejected(['too much volume'], ['cut one session']),
      PlanVerdict.accepted(),
    ]);
    const d = makeDeps(coach, critic);
    const useCase = new CoachAthleteUseCase(d.classifier, d.coach, d.critic, d.repo, d.runLog, d.clock);
    const events: CoachProgress[] = [];

    await useCase.execute({ sessions: raw, weekStartingOn, onProgress: (e) => events.push(e) });

    expect(events.map((e) => e.stage)).toEqual([
      'classified',
      'coaching',
      'reviewing',
      'critic',
      'coaching',
      'reviewing',
      'critic',
    ]);
    expect(events[0]).toMatchObject({
      stage: 'classified',
      byType: { run: 1 },
      perSession: [{ id: 'a1', type: 'run' }],
    });
    expect(events[1]).toMatchObject({ stage: 'coaching', attempt: 1 });
    expect(events[2]).toMatchObject({ stage: 'reviewing', attempt: 1 });
    expect(events[3]).toMatchObject({ stage: 'critic', attempt: 1, accepted: false });
    expect(events[6]).toMatchObject({ stage: 'critic', attempt: 2, accepted: true });

    // Richer detail for the streaming UI: each critic verdict carries the draft plan
    // it reviewed and the cumulative token count so far.
    const critic1 = events[3] as Extract<CoachProgress, { stage: 'critic' }>;
    expect(critic1.plan.sessions[0]!.focus).toBe('v1');
    expect(typeof critic1.tokens).toBe('number');
  });
});
