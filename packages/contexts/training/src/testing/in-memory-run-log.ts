import type { RunLog, RunLogEntry } from '../application/ports/out/run-log.port';

// In-memory fake capturing run-log entries for assertions.
export class InMemoryRunLog implements RunLog {
  readonly entries: RunLogEntry[] = [];

  async record(entry: RunLogEntry): Promise<void> {
    this.entries.push(entry);
  }
}
