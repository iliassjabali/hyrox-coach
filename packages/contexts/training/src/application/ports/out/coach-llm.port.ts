// Driven port: the Coach LLM (Opus adapter). Produces a domain WeeklyPlan.
import type { WeeklyPlan } from '../../../domain/weekly-plan';
import type { WorkoutSession } from '../../../domain/workout-session';
import type { TokenUsage } from './token-usage';

export interface CoachLlmInput {
  sessions: WorkoutSession[];
  weekStartingOn: Date;
  criticFeedback?: string[];
}

export interface CoachResult {
  plan: WeeklyPlan;
  usage: TokenUsage;
}

export interface CoachLlm {
  generatePlan(input: CoachLlmInput): Promise<CoachResult>;
}
