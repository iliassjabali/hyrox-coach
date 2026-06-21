// Driven port: records each coaching run (attempts, outcome, token cost) for evaluation.
import type { TokenUsage } from './token-usage';

export interface RunLogEntry {
  at: Date;
  attempts: number;
  accepted: boolean;
  usage: TokenUsage;
}

export interface RunLog {
  record(entry: RunLogEntry): Promise<void>;
}
