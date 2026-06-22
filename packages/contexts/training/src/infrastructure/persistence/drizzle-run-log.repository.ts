import { runLogs, type Db } from '@hyrox/db';
import type { RunLog, RunLogEntry } from '../../application/ports/out/run-log.port';

// Driven adapter: appends coaching-run records (cost/outcome) via Drizzle.
export class DrizzleRunLog implements RunLog {
  constructor(private readonly db: Db) {}

  async record(entry: RunLogEntry): Promise<void> {
    await this.db.insert(runLogs).values({
      at: entry.at,
      attempts: entry.attempts,
      accepted: entry.accepted,
      inputTokens: entry.usage.inputTokens,
      outputTokens: entry.usage.outputTokens,
    });
  }
}
