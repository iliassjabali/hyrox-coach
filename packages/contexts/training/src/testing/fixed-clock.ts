import type { Clock } from '../application/ports/out/clock.port';

// Deterministic clock for tests.
export class FixedClock implements Clock {
  constructor(private readonly fixed: Date) {}

  now(): Date {
    return this.fixed;
  }
}
