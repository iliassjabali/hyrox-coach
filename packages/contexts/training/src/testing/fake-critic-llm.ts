import type { PlanVerdict } from '../domain/plan-verdict';
import type {
  CriticLlm,
  CriticLlmInput,
  CriticResult,
} from '../application/ports/out/critic-llm.port';
import type { TokenUsage } from '../application/ports/out/token-usage';

// Fake Critic: returns scripted verdicts in sequence (repeats the last one once exhausted).
export class FakeCriticLlm implements CriticLlm {
  readonly calls: CriticLlmInput[] = [];
  private index = 0;

  constructor(
    private readonly verdicts: PlanVerdict[],
    private readonly usage: TokenUsage = { inputTokens: 0, outputTokens: 0 },
  ) {}

  async review(input: CriticLlmInput): Promise<CriticResult> {
    this.calls.push(input);
    const verdict = this.verdicts[Math.min(this.index, this.verdicts.length - 1)]!;
    this.index += 1;
    return { verdict, usage: this.usage };
  }
}
