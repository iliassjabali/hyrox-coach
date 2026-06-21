// Driving port: the end-to-end orchestrator (Classify -> Coach -> Critic).
import type { RawSessionInput } from '../../dto/raw-session-input';
import type { TokenUsage } from '../out/token-usage';

export interface CoachAthleteInput {
  sessions: RawSessionInput[];
  weekStartingOn: Date;
  maxAttempts?: number;
}

export interface PlannedSessionDto {
  day: number;
  type: string;
  focus: string;
}

export interface WeeklyPlanDto {
  weekStartingOn: string;
  sessions: PlannedSessionDto[];
}

export interface VerdictDto {
  isAccepted: boolean;
  reasons: string[];
  suggestedFixes: string[];
}

export interface CoachAthleteOutput {
  plan: WeeklyPlanDto;
  verdict: VerdictDto;
  accepted: boolean;
  attempts: number;
  cost: TokenUsage;
}

export interface CoachAthlete {
  execute(input: CoachAthleteInput): Promise<CoachAthleteOutput>;
}
