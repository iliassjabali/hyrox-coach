import { MODELS } from './models';

export interface RoleModels {
  classifier: string;
  coach: string;
  critic: string;
}

// Resolves the per-role Claude model ids, allowing env overrides so the system
// can run on a single tier (e.g. Haiku across all roles) when paid Opus/Sonnet
// access is unavailable. Falls back to the design defaults in MODELS. An empty
// string is treated as unset.
export function resolveModels(env: Record<string, string | undefined> = process.env): RoleModels {
  return {
    classifier: env['EVAL_CLASSIFIER_MODEL'] || MODELS.classifier,
    coach: env['EVAL_COACH_MODEL'] || MODELS.coach,
    critic: env['EVAL_CRITIC_MODEL'] || MODELS.critic,
  };
}
