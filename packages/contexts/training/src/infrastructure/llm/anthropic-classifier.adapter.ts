import { z } from 'zod';
import { SessionType } from '../../domain/session-type';
import type { RawSessionInput } from '../../application/dto/raw-session-input';
import type {
  ClassificationResult,
  ClassifierLlm,
} from '../../application/ports/out/classifier-llm.port';
import { anthropicStructuredCall, type StructuredLlmCall } from './structured-llm-call';
import { MODELS } from './models';

// Boundary schema: the structured output we ask the model for.
const schema = z.object({
  classifications: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['run', 'sled', 'burpees', 'mixed']),
      confidence: z.number().min(0).max(1),
    }),
  ),
});

// Driven adapter for ClassifierLlm — Claude Haiku.
export class AnthropicClassifierAdapter implements ClassifierLlm {
  constructor(
    private readonly call: StructuredLlmCall = anthropicStructuredCall,
    private readonly model: string = MODELS.classifier,
  ) {}

  async classify(sessions: RawSessionInput[]): Promise<ClassificationResult> {
    const { object, usage } = await this.call({
      model: this.model,
      system:
        'You classify endurance/strength activities into Hyrox-relevant types: ' +
        'run, sled, burpees, or mixed. Return a label and confidence (0-1) for every id.',
      prompt: buildPrompt(sessions),
      schema,
    });

    return {
      classifications: object.classifications.map((item) => ({
        id: item.id,
        type: SessionType.of(item.type),
        confidence: item.confidence,
      })),
      usage,
    };
  }
}

function buildPrompt(sessions: RawSessionInput[]): string {
  const rows = sessions.map((session) => ({
    id: session.id,
    date: session.date.toISOString(),
    durationSeconds: session.durationSeconds,
    distanceMeters: session.distanceMeters ?? null,
    averageHeartRate: session.averageHeartRate ?? null,
  }));
  return `Classify each session by Hyrox-relevant type:\n${JSON.stringify(rows, null, 2)}`;
}
