// Driven port — what the application calls out to. Returns DOMAIN objects, never rows.
import type { Example, ExampleId } from '../../../domain/example';

export interface ExampleRepository {
  save(example: Example): Promise<void>;
  findById(id: ExampleId): Promise<Example | null>;
}
