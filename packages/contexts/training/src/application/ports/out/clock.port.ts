// Driven port: time source. Real adapter is SystemClock; tests use a FixedClock.
export interface Clock {
  now(): Date;
}
