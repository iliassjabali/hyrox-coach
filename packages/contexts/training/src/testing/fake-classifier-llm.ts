import type { RawSessionInput } from '../application/dto/raw-session-input';
import type {
  ClassificationResult,
  ClassifierLlm,
  SessionClassification,
} from '../application/ports/out/classifier-llm.port';

// Scripted fake: returns predetermined classifications — for deterministic tests.
export class FakeClassifierLlm implements ClassifierLlm {
  constructor(private readonly classifications: SessionClassification[]) {}

  async classify(_sessions: RawSessionInput[]): Promise<ClassificationResult> {
    return {
      classifications: this.classifications,
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }
}
