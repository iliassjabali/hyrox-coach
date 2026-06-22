import { z } from 'zod';
import { PlanVerdict } from '../../domain/plan-verdict';
import type { WeeklyPlan } from '../../domain/weekly-plan';
import type { WorkoutSession } from '../../domain/workout-session';
import type { CriticLlm, CriticLlmInput, CriticResult } from '../../application/ports/out/critic-llm.port';
import { anthropicStructuredCall, type StructuredLlmCall } from './structured-llm-call';
import { MODELS } from './models';

const schema = z.object({
  accepted: z.boolean(),
  reasons: z.array(z.string()),
  suggestedFixes: z.array(z.string()),
});

// Driven adapter for CriticLlm — Claude Sonnet.
export class AnthropicCriticAdapter implements CriticLlm {
  constructor(
    private readonly call: StructuredLlmCall = anthropicStructuredCall,
    private readonly model: string = MODELS.critic,
  ) {}

  async review(input: CriticLlmInput): Promise<CriticResult> {
    const { object, usage } = await this.call({
      model: this.model,
      system:
        'You are a critical reviewer of training plans. Check for safety and ' +
        'plausibility (excessive volume jumps, no recovery, unrealistic intensity). ' +
        'Accept or reject; if rejecting, give concrete reasons and suggested fixes.',
      prompt: buildPrompt(input),
      schema,
    });

    const verdict = object.accepted
      ? PlanVerdict.accepted()
      : PlanVerdict.rejected(
          object.reasons.length > 0 ? object.reasons : ['plan rejected without a stated reason'],
          object.suggestedFixes,
        );

    return { verdict, usage };
  }
}

function buildPrompt(input: CriticLlmInput): string {
  const plan = serializePlan(input.plan);
  const history = input.sessions.map((session: WorkoutSession) => ({
    date: session.date.toISOString(),
    type: session.type.value,
    durationSeconds: session.durationSeconds,
  }));
  return [
    `Proposed plan:\n${JSON.stringify(plan, null, 2)}`,
    `Athlete recent history:\n${JSON.stringify(history, null, 2)}`,
  ].join('\n\n');
}

function serializePlan(plan: WeeklyPlan) {
  return {
    weekStartingOn: plan.weekStartingOn.toISOString(),
    sessions: plan.sessions.map((session) => ({
      day: session.day,
      type: session.type.value,
      focus: session.focus,
    })),
  };
}
