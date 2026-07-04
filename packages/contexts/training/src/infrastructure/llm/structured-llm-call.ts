import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import type { ZodType } from 'zod';
import { retryOnError } from './retry';

// The model occasionally returns output that fails schema validation; a fresh
// generation almost always succeeds, so retry those specifically. Transient API
// errors (429/5xx) are already retried inside generateObject via maxRetries.
function isSchemaGenerationFailure(error: unknown): boolean {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /no object generated|did not match schema|response did not match/i.test(text);
}

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

// Converts an internal Anthropic model id (e.g. claude-opus-4-8) to a Vercel AI
// Gateway slug (e.g. anthropic/claude-opus-4.8). Gateway slugs are dot-versioned.
export function toGatewaySlug(model: string): string {
  return `anthropic/${model.replace(/(\d+)-(\d+)$/, '$1.$2')}`;
}

// Resolves the model for generateObject. When AI_GATEWAY_API_KEY is present we pass
// a plain "provider/model" string, which the AI SDK routes through the Vercel AI
// Gateway. Otherwise we call Anthropic directly (needs ANTHROPIC_API_KEY).
function resolveModel(model: string): ReturnType<typeof anthropic> | string {
  if (process.env['AI_GATEWAY_API_KEY']) return toGatewaySlug(model);
  return anthropic(model);
}

// Default implementation: Claude via the Vercel AI SDK, routed through the Vercel AI
// Gateway when AI_GATEWAY_API_KEY is set. Transient-error retry is configured here
// (infrastructure), behind the port — the application never sees it.
export const anthropicStructuredCall: StructuredLlmCall = async (options) => {
  const { object, usage } = await retryOnError(
    () =>
      generateObject({
        model: resolveModel(options.model),
        schema: options.schema,
        system: options.system,
        prompt: options.prompt,
        maxRetries: 3,
      }),
    { attempts: 3, shouldRetry: isSchemaGenerationFailure },
  );
  return {
    object,
    usage: {
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
    },
  };
};
