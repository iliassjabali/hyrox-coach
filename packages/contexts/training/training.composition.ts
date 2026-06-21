// Composition root for the training context.
// Binds the driven ports to use cases. The HOST (apps/web tRPC context, or a test)
// supplies the concrete adapters — this file stays free of infrastructure imports.
import { ClassifySessionsUseCase } from './src/application/use-cases/classify-sessions.use-case';
import { CoachAthleteUseCase } from './src/application/use-cases/coach-athlete.use-case';
import type { ClassifierLlm } from './src/application/ports/out/classifier-llm.port';
import type { CoachLlm } from './src/application/ports/out/coach-llm.port';
import type { CriticLlm } from './src/application/ports/out/critic-llm.port';
import type { SessionRepository } from './src/application/ports/out/session-repository.port';
import type { RunLog } from './src/application/ports/out/run-log.port';
import type { Clock } from './src/application/ports/out/clock.port';

export interface TrainingPorts {
  classifierLlm: ClassifierLlm;
  coachLlm: CoachLlm;
  criticLlm: CriticLlm;
  sessionRepository: SessionRepository;
  runLog: RunLog;
  clock: Clock;
}

export function buildTraining(ports: TrainingPorts) {
  return {
    classifySessions: new ClassifySessionsUseCase(ports.classifierLlm, ports.sessionRepository),
    coachAthlete: new CoachAthleteUseCase(
      ports.classifierLlm,
      ports.coachLlm,
      ports.criticLlm,
      ports.sessionRepository,
      ports.runLog,
      ports.clock,
    ),
  };
}

export type Training = ReturnType<typeof buildTraining>;
