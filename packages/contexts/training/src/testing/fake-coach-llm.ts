import type { WeeklyPlan } from '../domain/weekly-plan';
import type { CoachLlm, CoachLlmInput, CoachResult } from '../application/ports/out/coach-llm.port';
import type { TokenUsage } from '../application/ports/out/token-usage';

// Fake Coach: returns a fixed plan and records every call (to assert critic feedback).
export class FakeCoachLlm implements CoachLlm {
  readonly calls: CoachLlmInput[] = [];

  constructor(
    private readonly plan: WeeklyPlan,
    private readonly usage: TokenUsage = { inputTokens: 0, outputTokens: 0 },
  ) {}

  async generatePlan(input: CoachLlmInput): Promise<CoachResult> {
    this.calls.push(input);
    return { plan: this.plan, usage: this.usage };
  }
}
