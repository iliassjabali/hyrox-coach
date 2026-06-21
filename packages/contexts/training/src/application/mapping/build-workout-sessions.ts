import { WorkoutSession } from '../../domain/workout-session';
import type { CreateWorkoutSessionProps } from '../../domain/workout-session';
import type { RawSessionInput } from '../dto/raw-session-input';
import type { SessionClassification } from '../ports/out/classifier-llm.port';

// Combine raw activities with their classifications into typed domain sessions.
// Shared by ClassifySessions and the CoachAthlete orchestrator.
export function buildWorkoutSessions(
  raw: RawSessionInput[],
  classifications: SessionClassification[],
): WorkoutSession[] {
  const rawById = new Map(raw.map((session) => [session.id, session]));

  return classifications.map((classification) => {
    const source = rawById.get(classification.id);
    if (!source) {
      throw new Error(`classifier returned an unknown session id: ${classification.id}`);
    }
    const props: CreateWorkoutSessionProps = {
      id: source.id,
      date: source.date,
      type: classification.type,
      durationSeconds: source.durationSeconds,
      ...(source.distanceMeters !== undefined ? { distanceMeters: source.distanceMeters } : {}),
      ...(source.averageHeartRate !== undefined
        ? { averageHeartRate: source.averageHeartRate }
        : {}),
    };
    return WorkoutSession.create(props);
  });
}
