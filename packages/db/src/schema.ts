import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// SQLite (libSQL) schema. Postgres swap later is a dialect change behind the repo adapter.
export const workoutSessions = sqliteTable('workout_sessions', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp_ms' }).notNull(),
  type: text('type').notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  distanceMeters: integer('distance_meters'),
  averageHeartRate: integer('average_heart_rate'),
});

export const runLogs = sqliteTable('run_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  at: integer('at', { mode: 'timestamp_ms' }).notNull(),
  attempts: integer('attempts').notNull(),
  accepted: integer('accepted', { mode: 'boolean' }).notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
});
