import { Example, ExampleId } from '../../domain/example';
import type {
  CreateExample,
  CreateExampleInput,
  CreateExampleOutput,
} from '../ports/in/create-example.port';
import type { ExampleRepository } from '../ports/out/example-repository.port';

// Interactor: input DTO -> domain -> port -> output DTO. Depends on ports only.
export class CreateExampleUseCase implements CreateExample {
  constructor(private readonly examples: ExampleRepository) {}

  async execute(input: CreateExampleInput): Promise<CreateExampleOutput> {
    const example = Example.create(ExampleId.of(input.id), input.label);
    await this.examples.save(example);
    return { id: example.id.value, label: example.label };
  }
}
