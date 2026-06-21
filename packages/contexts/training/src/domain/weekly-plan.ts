import type { SessionType } from './session-type';
import { InvalidWeeklyPlan } from './errors';

export interface PlannedSession {
  day: number; // 0 (Mon) .. 6 (Sun) relative to weekStartingOn
  type: SessionType;
  focus: string;
}

export interface CreateWeeklyPlanProps {
  weekStartingOn: Date;
  sessions: PlannedSession[];
}

const DAYS_IN_WEEK = 7;

// Entity: the Coach's weekly plan (domain form, before tRPC/LLM serialization).
// Invariants enforced in the factory.
export class WeeklyPlan {
  private constructor(
    public readonly weekStartingOn: Date,
    public readonly sessions: readonly PlannedSession[],
  ) {}

  static create(props: CreateWeeklyPlanProps): WeeklyPlan {
    const { weekStartingOn, sessions } = props;

    if (Number.isNaN(weekStartingOn.getTime())) {
      throw new InvalidWeeklyPlan('weekStartingOn must be a valid Date');
    }
    if (sessions.length === 0) {
      throw new InvalidWeeklyPlan('a weekly plan must have at least one session');
    }
    for (const session of sessions) {
      if (!Number.isInteger(session.day) || session.day < 0 || session.day >= DAYS_IN_WEEK) {
        throw new InvalidWeeklyPlan(`session day must be an integer 0-6 (got ${session.day})`);
      }
      if (!session.focus.trim()) {
        throw new InvalidWeeklyPlan('session focus must not be empty');
      }
    }

    const frozen = sessions.map((s) => Object.freeze({ ...s }));
    return new WeeklyPlan(weekStartingOn, Object.freeze(frozen));
  }
}
