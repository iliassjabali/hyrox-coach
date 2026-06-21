// Domain errors — thrown by entities/use-cases, never HTTP errors.
export class DomainError extends Error {}

export class InvalidExample extends DomainError {}

export class ExampleNotFound extends DomainError {
  constructor(id: string) {
    super(`Example not found: ${id}`);
  }
}

// --- real domain errors ---------------------------------------------------
export class InvalidSessionType extends DomainError {
  constructor(value: string) {
    super(`Unknown session type: "${value}" (expected run | sled | burpees | mixed)`);
  }
}

export class InvalidWorkoutSession extends DomainError {}
