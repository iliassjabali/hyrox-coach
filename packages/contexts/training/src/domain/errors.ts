// Domain errors — thrown by entities/use-cases, never HTTP errors.
export class DomainError extends Error {}

export class InvalidSessionType extends DomainError {
  constructor(value: string) {
    super(`Unknown session type: "${value}" (expected run | sled | burpees | mixed)`);
  }
}

export class InvalidWorkoutSession extends DomainError {}

export class InvalidPlanVerdict extends DomainError {}

export class InvalidWeeklyPlan extends DomainError {}

export class InvalidTrainingLoad extends DomainError {}
