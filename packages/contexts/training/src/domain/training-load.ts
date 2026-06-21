import { InvalidTrainingLoad } from './errors';

export interface TrimpInput {
  durationSeconds: number;
  averageHeartRate: number;
  restingHeartRate: number;
  maxHeartRate: number;
}

// Banister men's coefficients. (Sex-specific variants can be added behind a param later.)
const COEFF = 0.64;
const EXP_FACTOR = 1.92;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

// Domain service: computes training load from a session + the athlete's HR profile.
// Pure — no I/O, no athlete entity required (callers pass resting/max HR explicitly).
export class TrainingLoad {
  static trimp(input: TrimpInput): number {
    const { durationSeconds, averageHeartRate, restingHeartRate, maxHeartRate } = input;

    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new InvalidTrainingLoad('durationSeconds must be a positive number');
    }
    if (maxHeartRate <= restingHeartRate) {
      throw new InvalidTrainingLoad('maxHeartRate must be greater than restingHeartRate');
    }

    const hrReserve = clamp(
      (averageHeartRate - restingHeartRate) / (maxHeartRate - restingHeartRate),
      0,
      1,
    );
    const durationMinutes = durationSeconds / 60;

    return durationMinutes * hrReserve * COEFF * Math.exp(EXP_FACTOR * hrReserve);
  }
}
