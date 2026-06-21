// Driven port: the Critic LLM (Sonnet adapter). Reviews a plan for safety/plausibility.
import type { WeeklyPlan } from '../../../domain/weekly-plan';
import type { WorkoutSession } from '../../../domain/workout-session';
import type { PlanVerdict } from '../../../domain/plan-verdict';
import type { TokenUsage } from './token-usage';

export interface CriticLlmInput {
  plan: WeeklyPlan;
  sessions: WorkoutSession[];
}

export interface CriticResult {
  verdict: PlanVerdict;
  usage: TokenUsage;
}

export interface CriticLlm {
  review(input: CriticLlmInput): Promise<CriticResult>;
}
