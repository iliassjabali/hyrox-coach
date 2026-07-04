import { buildWorkoutSessions } from '../mapping/build-workout-sessions';
import type {
  CoachAthlete,
  CoachAthleteInput,
  CoachAthleteOutput,
  WeeklyPlanDto,
} from '../ports/in/coach-athlete.port';
import type { ClassifierLlm } from '../ports/out/classifier-llm.port';
import type { CoachLlm, CoachLlmInput } from '../ports/out/coach-llm.port';
import type { CriticLlm } from '../ports/out/critic-llm.port';
import type { SessionRepository } from '../ports/out/session-repository.port';
import type { RunLog } from '../ports/out/run-log.port';
import type { Clock } from '../ports/out/clock.port';
import type { TokenUsage } from '../ports/out/token-usage';
import type { WeeklyPlan } from '../../domain/weekly-plan';
import type { PlanVerdict } from '../../domain/plan-verdict';

const DEFAULT_MAX_ATTEMPTS = 3;

// Orchestrator use case: Classify -> persist -> (Coach -> Critic)* with retry on
// rejection -> record run cost. Semantic retry lives here; transient API retry/backoff
// lives in the LLM adapters (infrastructure).
export class CoachAthleteUseCase implements CoachAthlete {
  constructor(
    private readonly classifier: ClassifierLlm,
    private readonly coach: CoachLlm,
    private readonly critic: CriticLlm,
    private readonly sessions: SessionRepository,
    private readonly runLog: RunLog,
    private readonly clock: Clock,
  ) {}

  async execute(input: CoachAthleteInput): Promise<CoachAthleteOutput> {
    const maxAttempts = Math.max(1, input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS);

    const progress = input.onProgress ?? (() => {});

    const classification = await this.classifier.classify(input.sessions);
    const workouts = buildWorkoutSessions(input.sessions, classification.classifications);
    await this.sessions.saveAll(workouts);

    const byType: Record<string, number> = {};
    for (const c of classification.classifications) {
      byType[c.type.value] = (byType[c.type.value] ?? 0) + 1;
    }
    progress({ stage: 'classified', byType });

    const cost: TokenUsage = { ...classification.usage };
    let attempts = 0;
    let feedback: string[] = [];
    let plan!: WeeklyPlan;
    let verdict!: PlanVerdict;

    while (attempts < maxAttempts) {
      attempts += 1;

      const coachInput: CoachLlmInput = {
        sessions: workouts,
        weekStartingOn: input.weekStartingOn,
        ...(feedback.length > 0 ? { criticFeedback: feedback } : {}),
      };
      progress({ stage: 'coaching', attempt: attempts });
      const coached = await this.coach.generatePlan(coachInput);
      plan = coached.plan;
      add(cost, coached.usage);

      progress({ stage: 'reviewing', attempt: attempts });
      const reviewed = await this.critic.review({ plan, sessions: workouts });
      verdict = reviewed.verdict;
      add(cost, reviewed.usage);
      progress({
        stage: 'critic',
        attempt: attempts,
        accepted: verdict.isAccepted,
        reasons: [...verdict.reasons],
      });

      if (verdict.isAccepted) break;
      feedback = [...verdict.reasons, ...verdict.suggestedFixes];
    }

    await this.runLog.record({
      at: this.clock.now(),
      attempts,
      accepted: verdict.isAccepted,
      usage: cost,
    });

    return {
      plan: toPlanDto(plan),
      verdict: {
        isAccepted: verdict.isAccepted,
        reasons: [...verdict.reasons],
        suggestedFixes: [...verdict.suggestedFixes],
      },
      accepted: verdict.isAccepted,
      attempts,
      cost,
    };
  }
}

function add(into: TokenUsage, more: TokenUsage): void {
  into.inputTokens += more.inputTokens;
  into.outputTokens += more.outputTokens;
}

function toPlanDto(plan: WeeklyPlan): WeeklyPlanDto {
  return {
    weekStartingOn: plan.weekStartingOn.toISOString(),
    sessions: plan.sessions.map((session) => ({
      day: session.day,
      type: session.type.value,
      focus: session.focus,
    })),
  };
}
