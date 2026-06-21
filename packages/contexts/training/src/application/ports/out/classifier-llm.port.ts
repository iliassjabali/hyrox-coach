// Driven port: the Classifier LLM (Haiku adapter). Returns domain SessionType +
// a confidence, plus token usage for cost tracking. No HTTP/SDK types leak here.
import type { SessionType } from '../../../domain/session-type';
import type { RawSessionInput } from '../../dto/raw-session-input';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface SessionClassification {
  id: string;
  type: SessionType;
  confidence: number;
}

export interface ClassificationResult {
  classifications: SessionClassification[];
  usage: TokenUsage;
}

export interface ClassifierLlm {
  classify(sessions: RawSessionInput[]): Promise<ClassificationResult>;
}
