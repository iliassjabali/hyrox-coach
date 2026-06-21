// Composition root for the training context.
// Binds driven ports to concrete adapters and returns ready-to-use use cases.
// The host (apps/web tRPC context, or a test) supplies the adapters.
import { CreateExampleUseCase } from './src/application/use-cases/create-example.use-case';
import type { ExampleRepository } from './src/application/ports/out/example-repository.port';

export interface TrainingPorts {
  exampleRepository: ExampleRepository;
}

export function buildTraining(ports: TrainingPorts) {
  return {
    createExample: new CreateExampleUseCase(ports.exampleRepository),
  };
}

export type Training = ReturnType<typeof buildTraining>;
