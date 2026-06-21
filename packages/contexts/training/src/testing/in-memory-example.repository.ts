import type { Example, ExampleId } from '../domain/example';
import type { ExampleRepository } from '../application/ports/out/example-repository.port';

// In-memory fake honoring the port contract — for application-layer tests.
export class InMemoryExampleRepository implements ExampleRepository {
  private readonly store = new Map<string, Example>();

  async save(example: Example): Promise<void> {
    this.store.set(example.id.value, example);
  }

  async findById(id: ExampleId): Promise<Example | null> {
    return this.store.get(id.value) ?? null;
  }
}
