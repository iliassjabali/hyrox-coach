// Example domain — replace with the real aggregate (e.g. WorkoutSession).
// Pure TS: no zod, no drizzle, no ai-sdk, no framework imports.
import { InvalidExample } from './errors';

export class ExampleId {
  private constructor(public readonly value: string) {}

  static of(value: string): ExampleId {
    if (!value.trim()) throw new InvalidExample('ExampleId must not be empty');
    return new ExampleId(value);
  }
}

export class Example {
  private constructor(
    public readonly id: ExampleId,
    public readonly label: string,
  ) {}

  static create(id: ExampleId, label: string): Example {
    if (!label.trim()) throw new InvalidExample('label must not be empty');
    return new Example(id, label);
  }
}
