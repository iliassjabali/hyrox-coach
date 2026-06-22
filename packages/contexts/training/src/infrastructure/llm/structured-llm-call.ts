import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import type { ZodType } from 'zod';

// Seam between the LLM adapters and the AI SDK. Adapters depend on this interface
// so the domain mapping can be unit-tested with a fake call (no network).
export interface StructuredCallOptions<T> {
  model: string;
  system: string;
  prompt: string;
  schema: ZodType<T>;
}

export interface StructuredCallResult<T> {
  object: T;
  usage: { inputTokens: number; outputTokens: number };
}

export interface StructuredLlmCall {
  <T>(options: StructuredCallOptions<T>): Promise<StructuredCallResult<T>>;
}

// Default implementation: Anthropic via the Vercel AI SDK. Transient-error retry is
// configured here (infrastructure), behind the port — the application never sees it.
export const anthropicStructuredCall: StructuredLlmCall = async (options) => {
  const { object, usage } = await generateObject({
    model: anthropic(options.model),
    schema: options.schema,
    system: options.system,
    prompt: options.prompt,
    maxRetries: 3,
  });
  return {
    object,
    usage: {
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
    },
  };
};
