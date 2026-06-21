// Driven port: persistence for classified workout sessions. Returns DOMAIN objects.
import type { WorkoutSession } from '../../../domain/workout-session';

export interface SessionRepository {
  saveAll(sessions: WorkoutSession[]): Promise<void>;
  listAll(): Promise<WorkoutSession[]>;
}
