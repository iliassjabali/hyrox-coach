import { describe, expect, it } from 'vitest';
import { WeeklyPlan } from './weekly-plan';
import { SessionType } from './session-type';
import { InvalidWeeklyPlan } from './errors';

const weekStartingOn = new Date('2026-06-01T00:00:00Z'); // a Monday
const planned = (day: number, focus = 'easy aerobic') => ({
  day,
  type: SessionType.of('run'),
  focus,
});

describe('WeeklyPlan', () => {
  it('creates a plan exposing its planned sessions', () => {
    const plan = WeeklyPlan.create({ weekStartingOn, sessions: [planned(1), planned(3)] });
    expect(plan.sessions).toHaveLength(2);
    expect(plan.sessions[0]!.type.value).toBe('run');
    expect(plan.sessions[0]!.day).toBe(1);
  });

  it('requires at least one session', () => {
    expect(() => WeeklyPlan.create({ weekStartingOn, sessions: [] })).toThrow(
      InvalidWeeklyPlan,
    );
  });

  it('rejects a day outside 0-6', () => {
    expect(() => WeeklyPlan.create({ weekStartingOn, sessions: [planned(7)] })).toThrow(
      InvalidWeeklyPlan,
    );
  });

  it('rejects an empty focus', () => {
    expect(() =>
      WeeklyPlan.create({ weekStartingOn, sessions: [planned(1, '  ')] }),
    ).toThrow(InvalidWeeklyPlan);
  });

  it('exposes an immutable sessions array', () => {
    const plan = WeeklyPlan.create({ weekStartingOn, sessions: [planned(1)] });
    expect(() => (plan.sessions as unknown[]).push({})).toThrow();
  });
});
