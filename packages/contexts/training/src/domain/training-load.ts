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

// ACWR rolling windows, in days.
const ACWR_ACUTE_DAYS = 7;
const ACWR_CHRONIC_DAYS = 28;

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

  // Acute:chronic workload ratio (Gabbett). `dailyLoads` is ordered oldest-first,
  // one aggregate load value per day (e.g. summed daily TRIMP), most recent last.
  // Acute = mean daily load over the last 7 days; chronic = mean over the last 28;
  // ACWR = acute / chronic. The commonly cited "sweet spot" is ~0.8--1.3.
  static acwr(dailyLoads: readonly number[]): number {
    if (dailyLoads.length < ACWR_CHRONIC_DAYS) {
      throw new InvalidTrainingLoad(
        `acwr requires at least ${ACWR_CHRONIC_DAYS} days of daily load`,
      );
    }
    if (dailyLoads.some((value) => !Number.isFinite(value) || value < 0)) {
      throw new InvalidTrainingLoad('daily loads must be finite and non-negative');
    }

    const mean = (values: readonly number[]): number =>
      values.reduce((sum, value) => sum + value, 0) / values.length;

    const acute = mean(dailyLoads.slice(-ACWR_ACUTE_DAYS));
    const chronic = mean(dailyLoads.slice(-ACWR_CHRONIC_DAYS));

    if (chronic === 0) {
      throw new InvalidTrainingLoad('chronic load is zero; ACWR is undefined');
    }

    return acute / chronic;
  }
}
