import { describe, expect, it } from 'vitest';
import { createDb, ensureSchema, runLogs, type Db } from '@hyrox/db';
import { DrizzleSessionRepository } from './drizzle-session.repository';
import { DrizzleRunLog } from './drizzle-run-log.repository';
import { WorkoutSession } from '../../domain/workout-session';
import { SessionType } from '../../domain/session-type';

async function freshDb(): Promise<Db> {
  const db = createDb(':memory:');
  await ensureSchema(db);
  return db;
}

describe('DrizzleSessionRepository (libSQL in-memory)', () => {
  it('saves and lists sessions, round-tripping the domain object', async () => {
    const db = await freshDb();
    const repo = new DrizzleSessionRepository(db);
    await repo.saveAll([
      WorkoutSession.create({
        id: 's1',
        date: new Date('2026-06-01T07:00:00Z'),
        type: SessionType.of('run'),
        durationSeconds: 1800,
        distanceMeters: 5000,
        averageHeartRate: 150,
      }),
    ]);

    const all = await repo.listAll();
    expect(all).toHaveLength(1);
    expect(all[0]!.id).toBe('s1');
    expect(all[0]!.type.value).toBe('run');
    expect(all[0]!.distanceMeters).toBe(5000);
    expect(all[0]!.date.toISOString()).toBe('2026-06-01T07:00:00.000Z');
  });

  it('upserts on duplicate id', async () => {
    const db = await freshDb();
    const repo = new DrizzleSessionRepository(db);
    const base = { id: 's1', date: new Date('2026-06-01T07:00:00Z'), type: SessionType.of('run') };
    await repo.saveAll([WorkoutSession.create({ ...base, durationSeconds: 1000 })]);
    await repo.saveAll([WorkoutSession.create({ ...base, durationSeconds: 2000 })]);

    const all = await repo.listAll();
    expect(all).toHaveLength(1);
    expect(all[0]!.durationSeconds).toBe(2000);
  });
});

describe('DrizzleRunLog (libSQL in-memory)', () => {
  it('records a run-log entry', async () => {
    const db = await freshDb();
    const runLog = new DrizzleRunLog(db);
    await runLog.record({
      at: new Date('2026-06-05T10:00:00Z'),
      attempts: 2,
      accepted: true,
      usage: { inputTokens: 100, outputTokens: 50 },
    });

    const rows = await db.select().from(runLogs);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.accepted).toBe(true);
    expect(rows[0]!.inputTokens).toBe(100);
  });
});
