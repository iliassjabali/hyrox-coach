import { createDb, ensureSchema } from '@hyrox/db';
import { buildTraining } from '@hyrox/training/composition';
import {
  AnthropicClassifierAdapter,
  AnthropicCoachAdapter,
  AnthropicCriticAdapter,
  DrizzleRunLog,
  DrizzleSessionRepository,
  resolveModels,
  SystemClock,
} from '@hyrox/training/infrastructure';
import type { TrpcContext } from './trpc';

let cached: TrpcContext | undefined;

// Production composition root: wires the real adapters once and reuses them.
export async function createProductionContext(): Promise<TrpcContext> {
  if (!cached) {
    const db = createDb(process.env['DATABASE_URL'] ?? 'file:hyrox.db');
    await ensureSchema(db);
    // Per-role models, overridable via EVAL_*_MODEL env vars so the app can run on
    // a single free tier (Haiku across roles) when paid Opus/Sonnet is unavailable.
    const models = resolveModels();
    cached = {
      training: buildTraining({
        classifierLlm: new AnthropicClassifierAdapter(undefined, models.classifier),
        coachLlm: new AnthropicCoachAdapter(undefined, models.coach),
        criticLlm: new AnthropicCriticAdapter(undefined, models.critic),
        sessionRepository: new DrizzleSessionRepository(db),
        runLog: new DrizzleRunLog(db),
        clock: new SystemClock(),
      }),
    };
  }
  return cached;
}
