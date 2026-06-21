import { describe, expect, it } from 'vitest';
import { CreateExampleUseCase } from './create-example.use-case';
import { InMemoryExampleRepository } from '../../testing/in-memory-example.repository';

describe('CreateExampleUseCase', () => {
  it('creates and persists an example', async () => {
    const repo = new InMemoryExampleRepository();
    const useCase = new CreateExampleUseCase(repo);

    const output = await useCase.execute({ id: 'e1', label: 'hello' });

    expect(output).toEqual({ id: 'e1', label: 'hello' });
    expect(await repo.findById((await import('../../domain/example')).ExampleId.of('e1'))).not.toBeNull();
  });

  it('rejects an empty label (domain invariant)', async () => {
    const useCase = new CreateExampleUseCase(new InMemoryExampleRepository());
    await expect(useCase.execute({ id: 'e1', label: '' })).rejects.toThrow();
  });
});
