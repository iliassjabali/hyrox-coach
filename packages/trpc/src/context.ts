import { createDb, ensureSchema } from '@hyrox/db';
import { buildTraining } from '@hyrox/training/composition';
import {
  AnthropicClassifierAdapter,
  AnthropicCoachAdapter,
  AnthropicCriticAdapter,
  DrizzleRunLog,
  DrizzleSessionRepository,
  SystemClock,
} from '@hyrox/training/infrastructure';
import type { TrpcContext } from './trpc';

let cached: TrpcContext | undefined;

// Production composition root: wires the real adapters once and reuses them.
export async function createProductionContext(): Promise<TrpcContext> {
  if (!cached) {
    const db = createDb(process.env['DATABASE_URL'] ?? 'file:hyrox.db');
    await ensureSchema(db);
    cached = {
      training: buildTraining({
        classifierLlm: new AnthropicClassifierAdapter(),
        coachLlm: new AnthropicCoachAdapter(),
        criticLlm: new AnthropicCriticAdapter(),
        sessionRepository: new DrizzleSessionRepository(db),
        runLog: new DrizzleRunLog(db),
        clock: new SystemClock(),
      }),
    };
  }
  return cached;
}
