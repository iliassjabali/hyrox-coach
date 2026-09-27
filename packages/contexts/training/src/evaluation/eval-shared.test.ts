import { describe, it, expect } from 'vitest';
import { assertUsableBaseUrl } from './eval-shared';

// Regression test: ANTHROPIC_BASE_URL=https://api.anthropic.com (no /v1) leaks into
// this project's environment from the Claude Code CLI harness. The Vercel AI SDK's
// @ai-sdk/anthropic provider appends "/messages" directly to that base URL rather
// than adding "/v1" itself, so every live eval call 404s at
// https://api.anthropic.com/messages — this is exactly what silently produced
// completed: 0 in the committed ablation.json run.
describe('assertUsableBaseUrl', () => {
  it('throws a clear error when ANTHROPIC_BASE_URL is missing the /v1 path segment', () => {
    expect(() => assertUsableBaseUrl({ ANTHROPIC_BASE_URL: 'https://api.anthropic.com' })).toThrow(/v1/);
  });

  it('does not throw when ANTHROPIC_BASE_URL already ends in /v1', () => {
    expect(() => assertUsableBaseUrl({ ANTHROPIC_BASE_URL: 'https://api.anthropic.com/v1' })).not.toThrow();
  });

  it('does not throw when ANTHROPIC_BASE_URL is unset', () => {
    expect(() => assertUsableBaseUrl({})).not.toThrow();
  });
});
