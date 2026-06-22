import { describe, expect, it } from 'vitest';
import { AnthropicClassifierAdapter } from './anthropic-classifier.adapter';
import type { StructuredLlmCall } from './structured-llm-call';

// Fake structured-call: validates canned data against the adapter's real schema,
// returning typed output — exercises the mapping without hitting the network.
const fakeCall: StructuredLlmCall = async (opts) => ({
  object: opts.schema.parse({
    classifications: [{ id: 'a1', type: 'run', confidence: 0.9 }],
  }),
  usage: { inputTokens: 12, outputTokens: 3 },
});

describe('AnthropicClassifierAdapter', () => {
  it('maps model output to domain SessionType + usage', async () => {
    const adapter = new AnthropicClassifierAdapter(fakeCall);

    const result = await adapter.classify([
      { id: 'a1', date: new Date('2026-06-01T07:00:00Z'), durationSeconds: 1800 },
    ]);

    expect(result.classifications[0]!.type.value).toBe('run');
    expect(result.classifications[0]!.confidence).toBe(0.9);
    expect(result.usage).toEqual({ inputTokens: 12, outputTokens: 3 });
  });
});
