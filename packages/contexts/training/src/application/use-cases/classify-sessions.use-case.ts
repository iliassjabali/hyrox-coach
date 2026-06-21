import { WorkoutSession } from '../../domain/workout-session';
import type { CreateWorkoutSessionProps } from '../../domain/workout-session';
import type {
  ClassifySessions,
  ClassifySessionsInput,
  ClassifySessionsOutput,
} from '../ports/in/classify-sessions.port';
import type { ClassifierLlm } from '../ports/out/classifier-llm.port';
import type { SessionRepository } from '../ports/out/session-repository.port';

// Interactor: raw sessions -> Classifier (out-port) -> typed WorkoutSessions ->
// persisted (out-port) -> summary DTO. Depends only on ports.
export class ClassifySessionsUseCase implements ClassifySessions {
  constructor(
    private readonly classifier: ClassifierLlm,
    private readonly sessions: SessionRepository,
  ) {}

  async execute(input: ClassifySessionsInput): Promise<ClassifySessionsOutput> {
    const { classifications } = await this.classifier.classify(input.sessions);
    const rawById = new Map(input.sessions.map((session) => [session.id, session]));

    const workouts = classifications.map((classification) => {
      const raw = rawById.get(classification.id);
      if (!raw) {
        throw new Error(`classifier returned an unknown session id: ${classification.id}`);
      }
      const props: CreateWorkoutSessionProps = {
        id: raw.id,
        date: raw.date,
        type: classification.type,
        durationSeconds: raw.durationSeconds,
        ...(raw.distanceMeters !== undefined ? { distanceMeters: raw.distanceMeters } : {}),
        ...(raw.averageHeartRate !== undefined ? { averageHeartRate: raw.averageHeartRate } : {}),
      };
      return WorkoutSession.create(props);
    });

    await this.sessions.saveAll(workouts);

    const byType: Record<string, number> = {};
    for (const workout of workouts) {
      byType[workout.type.value] = (byType[workout.type.value] ?? 0) + 1;
    }

    return { classified: workouts.length, byType };
  }
}
