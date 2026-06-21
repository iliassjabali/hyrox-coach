import type { WorkoutSession } from '../domain/workout-session';
import type { SessionRepository } from '../application/ports/out/session-repository.port';

// In-memory fake honoring the SessionRepository contract — for application tests.
export class InMemorySessionRepository implements SessionRepository {
  private readonly store = new Map<string, WorkoutSession>();

  async saveAll(sessions: WorkoutSession[]): Promise<void> {
    for (const session of sessions) {
      this.store.set(session.id, session);
    }
  }

  async listAll(): Promise<WorkoutSession[]> {
    return [...this.store.values()];
  }
}
