import type { SessionType } from './session-type';
import { InvalidWorkoutSession } from './errors';

export interface CreateWorkoutSessionProps {
  id: string;
  date: Date;
  type: SessionType;
  durationSeconds: number;
  distanceMeters?: number;
  averageHeartRate?: number;
}

// Plausible average-HR bounds for a workout (bpm); guards against bad sensor/import data.
const MIN_HEART_RATE = 30;
const MAX_HEART_RATE = 230;

// Entity: has identity (id), compared by id. Invariants enforced in the factory —
// an invalid WorkoutSession can never exist.
export class WorkoutSession {
  private constructor(
    public readonly id: string,
    public readonly date: Date,
    public readonly type: SessionType,
    public readonly durationSeconds: number,
    public readonly distanceMeters?: number,
    public readonly averageHeartRate?: number,
  ) {}

  static create(props: CreateWorkoutSessionProps): WorkoutSession {
    const { id, date, type, durationSeconds, distanceMeters, averageHeartRate } = props;

    if (!id.trim()) {
      throw new InvalidWorkoutSession('id must not be empty');
    }
    if (Number.isNaN(date.getTime())) {
      throw new InvalidWorkoutSession('date must be a valid Date');
    }
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new InvalidWorkoutSession('durationSeconds must be a positive number');
    }
    if (distanceMeters !== undefined && (!Number.isFinite(distanceMeters) || distanceMeters < 0)) {
      throw new InvalidWorkoutSession('distanceMeters must not be negative');
    }
    if (
      averageHeartRate !== undefined &&
      (averageHeartRate < MIN_HEART_RATE || averageHeartRate > MAX_HEART_RATE)
    ) {
      throw new InvalidWorkoutSession(
        `averageHeartRate must be between ${MIN_HEART_RATE} and ${MAX_HEART_RATE} bpm`,
      );
    }

    return new WorkoutSession(
      id.trim(),
      date,
      type,
      durationSeconds,
      distanceMeters,
      averageHeartRate,
    );
  }

  equals(other: WorkoutSession): boolean {
    return this.id === other.id;
  }
}
