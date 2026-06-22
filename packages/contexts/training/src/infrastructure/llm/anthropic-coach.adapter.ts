import { z } from 'zod';
import { SessionType } from '../../domain/session-type';
import { WeeklyPlan } from '../../domain/weekly-plan';
import type { PlannedSession } from '../../domain/weekly-plan';
import type { WorkoutSession } from '../../domain/workout-session';
import type { CoachLlm, CoachLlmInput, CoachResult } from '../../application/ports/out/coach-llm.port';
import { anthropicStructuredCall, type StructuredLlmCall } from './structured-llm-call';
import { MODELS } from './models';

const schema = z.object({
  sessions: z.array(
    z.object({
      day: z.number().int().min(0).max(6),
      type: z.enum(['run', 'sled', 'burpees', 'mixed']),
      focus: z.string().min(1),
    }),
  ),
});

// Driven adapter for CoachLlm — Claude Opus.
export class AnthropicCoachAdapter implements CoachLlm {
  constructor(
    private readonly call: StructuredLlmCall = anthropicStructuredCall,
    private readonly model: string = MODELS.coach,
  ) {}

  async generatePlan(input: CoachLlmInput): Promise<CoachResult> {
    const { object, usage } = await this.call({
      model: this.model,
      system:
        'You are a Hyrox coach. Given recent training history, produce a balanced, ' +
        'progressive weekly plan. Each session has a day (0=Mon..6=Sun), a type ' +
        '(run|sled|burpees|mixed) and a short focus.',
      prompt: buildPrompt(input),
      schema,
    });

    const sessions: PlannedSession[] = object.sessions.map((session) => ({
      day: session.day,
      type: SessionType.of(session.type),
      focus: session.focus,
    }));

    return {
      plan: WeeklyPlan.create({ weekStartingOn: input.weekStartingOn, sessions }),
      usage,
    };
  }
}

function buildPrompt(input: CoachLlmInput): string {
  const history = input.sessions.map((session: WorkoutSession) => ({
    date: session.date.toISOString(),
    type: session.type.value,
    durationSeconds: session.durationSeconds,
    distanceMeters: session.distanceMeters ?? null,
    averageHeartRate: session.averageHeartRate ?? null,
  }));
  const parts = [
    `Week starting: ${input.weekStartingOn.toISOString()}`,
    `Recent history:\n${JSON.stringify(history, null, 2)}`,
  ];
  if (input.criticFeedback && input.criticFeedback.length > 0) {
    parts.push(`Revise to address this critic feedback:\n- ${input.criticFeedback.join('\n- ')}`);
  }
  return parts.join('\n\n');
}
