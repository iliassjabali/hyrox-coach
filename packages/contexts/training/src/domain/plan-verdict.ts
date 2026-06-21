import { InvalidPlanVerdict } from './errors';

// Value object: the Critic's verdict on a WeeklyPlan. Immutable, compared by value.
export class PlanVerdict {
  private constructor(
    public readonly isAccepted: boolean,
    public readonly reasons: readonly string[],
    public readonly suggestedFixes: readonly string[],
  ) {}

  static accepted(): PlanVerdict {
    return new PlanVerdict(true, Object.freeze([]), Object.freeze([]));
  }

  static rejected(reasons: string[], suggestedFixes: string[] = []): PlanVerdict {
    if (reasons.length === 0) {
      throw new InvalidPlanVerdict('a rejection must give at least one reason');
    }
    return new PlanVerdict(
      false,
      Object.freeze([...reasons]),
      Object.freeze([...suggestedFixes]),
    );
  }
}
