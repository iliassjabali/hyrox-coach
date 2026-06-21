// Driving port: classify raw sessions into typed, persisted WorkoutSessions.
import type { RawSessionInput } from '../../dto/raw-session-input';

export interface ClassifySessionsInput {
  sessions: RawSessionInput[];
}

export interface ClassifySessionsOutput {
  classified: number;
  byType: Record<string, number>;
}

export interface ClassifySessions {
  execute(input: ClassifySessionsInput): Promise<ClassifySessionsOutput>;
}
