import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

export type Db = ReturnType<typeof createDb>;

// Create a Drizzle DB over libSQL. url examples: 'file:local.db', ':memory:',
// or a Turso/libSQL URL for deploy.
export function createDb(url: string): ReturnType<typeof drizzle<typeof schema>> {
  const client = createClient({ url });
  return drizzle(client, { schema });
}

// Prototype schema bootstrap (production would use drizzle-kit migrations).
export async function ensureSchema(db: Db): Promise<void> {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id TEXT PRIMARY KEY,
      date INTEGER NOT NULL,
      type TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL,
      distance_meters INTEGER,
      average_heart_rate INTEGER
    )
  `);
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS run_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      at INTEGER NOT NULL,
      attempts INTEGER NOT NULL,
      accepted INTEGER NOT NULL,
      input_tokens INTEGER NOT NULL,
      output_tokens INTEGER NOT NULL
    )
  `);
}
