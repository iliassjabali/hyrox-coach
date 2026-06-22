import { workoutSessions, type Db } from '@hyrox/db';
import { WorkoutSession } from '../../domain/workout-session';
import type { CreateWorkoutSessionProps } from '../../domain/workout-session';
import { SessionType } from '../../domain/session-type';
import type { SessionRepository } from '../../application/ports/out/session-repository.port';

type Row = typeof workoutSessions.$inferSelect;

// Driven adapter: persists/loads WorkoutSessions via Drizzle. Maps rows <-> domain;
// Drizzle/SQL types never leak above this layer.
export class DrizzleSessionRepository implements SessionRepository {
  constructor(private readonly db: Db) {}

  async saveAll(sessions: WorkoutSession[]): Promise<void> {
    for (const session of sessions) {
      const row = toRow(session);
      await this.db
        .insert(workoutSessions)
        .values(row)
        .onConflictDoUpdate({ target: workoutSessions.id, set: row });
    }
  }

  async listAll(): Promise<WorkoutSession[]> {
    const rows = await this.db.select().from(workoutSessions);
    return rows.map(fromRow);
  }
}

function toRow(session: WorkoutSession): typeof workoutSessions.$inferInsert {
  return {
    id: session.id,
    date: session.date,
    type: session.type.value,
    durationSeconds: session.durationSeconds,
    distanceMeters: session.distanceMeters ?? null,
    averageHeartRate: session.averageHeartRate ?? null,
  };
}

function fromRow(row: Row): WorkoutSession {
  const props: CreateWorkoutSessionProps = {
    id: row.id,
    date: row.date,
    type: SessionType.of(row.type),
    durationSeconds: row.durationSeconds,
    ...(row.distanceMeters !== null ? { distanceMeters: row.distanceMeters } : {}),
    ...(row.averageHeartRate !== null ? { averageHeartRate: row.averageHeartRate } : {}),
  };
  return WorkoutSession.create(props);
}
