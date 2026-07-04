import { describe, it, expect } from 'vitest';
import { resolveModels } from './resolve-models';
import { MODELS } from './models';

describe('resolveModels', () => {
  it('defaults to the design tiers when no overrides are set', () => {
    expect(resolveModels({})).toEqual({
      classifier: MODELS.classifier,
      coach: MODELS.coach,
      critic: MODELS.critic,
    });
  });

  it('honours per-role env overrides (e.g. Haiku across roles for free-tier runs)', () => {
    const models = resolveModels({
      EVAL_COACH_MODEL: 'claude-haiku-4-5',
      EVAL_CRITIC_MODEL: 'claude-haiku-4-5',
    });
    expect(models.coach).toBe('claude-haiku-4-5');
    expect(models.critic).toBe('claude-haiku-4-5');
    expect(models.classifier).toBe(MODELS.classifier);
  });

  it('treats an empty-string override as unset and falls back to the default', () => {
    expect(resolveModels({ EVAL_COACH_MODEL: '' }).coach).toBe(MODELS.coach);
  });
});
