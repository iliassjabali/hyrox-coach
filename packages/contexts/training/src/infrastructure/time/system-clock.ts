import type { Clock } from '../../application/ports/out/clock.port';

// Driven adapter for the Clock port. The only place `new Date()` lives.
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
