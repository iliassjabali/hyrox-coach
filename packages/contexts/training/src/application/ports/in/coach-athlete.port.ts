// Driving port: the end-to-end orchestrator (Classify -> Coach -> Critic).
import type { RawSessionInput } from '../../dto/raw-session-input';
import type { TokenUsage } from '../out/token-usage';

// Stage-progress events emitted as the orchestration runs, so a caller (e.g. a
// streaming UI) can show live progress through Classify -> Coach -> Critic.
export type CoachProgress =
  | {
      stage: 'classified';
      byType: Record<string, number>;
      perSession: { id: string; type: string }[];
    }
  | { stage: 'coaching'; attempt: number }
  | { stage: 'reviewing'; attempt: number }
  | {
      stage: 'critic';
      attempt: number;
      accepted: boolean;
      reasons: string[];
      plan: WeeklyPlanDto;
      tokens: number;
    };

export interface CoachAthleteInput {
  sessions: RawSessionInput[];
  weekStartingOn: Date;
  maxAttempts?: number;
  onProgress?: (event: CoachProgress) => void;
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
