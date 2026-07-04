import { z } from 'zod';
import { SessionType } from '../../domain/session-type';
import { WeeklyPlan } from '../../domain/weekly-plan';
import type { PlannedSession } from '../../domain/weekly-plan';
import type { WorkoutSession } from '../../domain/workout-session';
import type { CoachLlm, CoachLlmInput, CoachResult } from '../../application/ports/out/coach-llm.port';
import { anthropicStructuredCall, type StructuredLlmCall } from './structured-llm-call';
import { MODELS } from './models';

const sessionItem = z.object({
  day: z.number().int().min(0).max(6),
  type: z.enum(['run', 'sled', 'burpees', 'mixed']),
  focus: z.string().min(1),
});

// Opus occasionally serialises the whole object as a JSON string into `sessions`
// (e.g. {"sessions": "{\"sessions\":[...]}"}) instead of an array. Recover that
// shape before validation so a well-formed plan isn't rejected over formatting.
const schema: z.ZodType<{ sessions: z.infer<typeof sessionItem>[] }, z.ZodTypeDef, unknown> = z.preprocess((value) => {
  const candidate = value as { sessions?: unknown } | null;
  if (candidate && typeof candidate.sessions === 'string') {
    try {
      const parsed: unknown = JSON.parse(candidate.sessions);
      const array = Array.isArray(parsed)
        ? parsed
        : (parsed as { sessions?: unknown })?.sessions;
      if (Array.isArray(array)) return { sessions: array };
    } catch {
      // fall through to normal validation (which will surface the error)
    }
  }
  return value;
}, z.object({ sessions: z.array(sessionItem) }));

// Default Coach system prompt. Exposed so the prompt-variant ablation can compare
// it against alternative phrasings on identical inputs (see the evaluation harness).
export const DEFAULT_COACH_SYSTEM =
  'You are a Hyrox coach. Given recent training history, produce a balanced, ' +
  'progressive weekly plan. Each session has a day (0=Mon..6=Sun), a type ' +
  '(run|sled|burpees|mixed) and a short focus.';

// Driven adapter for CoachLlm — Claude Opus.
export class AnthropicCoachAdapter implements CoachLlm {
  constructor(
    private readonly call: StructuredLlmCall = anthropicStructuredCall,
    private readonly model: string = MODELS.coach,
    private readonly system: string = DEFAULT_COACH_SYSTEM,
  ) {}

  async generatePlan(input: CoachLlmInput): Promise<CoachResult> {
    const { object, usage } = await this.call({
      model: this.model,
      system: this.system,
      prompt: buildPrompt(input),
      schema,
    });

    const result = object as { sessions: z.infer<typeof sessionItem>[] };
    const sessions: PlannedSession[] = result.sessions.map((session) => ({
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
