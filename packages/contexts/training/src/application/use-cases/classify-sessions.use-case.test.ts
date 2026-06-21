import { describe, expect, it } from 'vitest';
import { ClassifySessionsUseCase } from './classify-sessions.use-case';
import { InMemorySessionRepository } from '../../testing/in-memory-session.repository';
import { FakeClassifierLlm } from '../../testing/fake-classifier-llm';
import { SessionType } from '../../domain/session-type';

const raw = [
  { id: 'a1', date: new Date('2026-06-01T07:00:00Z'), durationSeconds: 1800, averageHeartRate: 150 },
  { id: 'a2', date: new Date('2026-06-02T07:00:00Z'), durationSeconds: 1200 },
];

describe('ClassifySessionsUseCase', () => {
  it('classifies raw sessions, persists them, and summarises by type', async () => {
    const classifier = new FakeClassifierLlm([
      { id: 'a1', type: SessionType.of('run'), confidence: 0.9 },
      { id: 'a2', type: SessionType.of('sled'), confidence: 0.8 },
    ]);
    const repo = new InMemorySessionRepository();
    const useCase = new ClassifySessionsUseCase(classifier, repo);

    const result = await useCase.execute({ sessions: raw });

    expect(result.classified).toBe(2);
    expect(result.byType).toEqual({ run: 1, sled: 1 });
    expect(await repo.listAll()).toHaveLength(2);
  });

  it('throws when the classifier returns an unknown session id', async () => {
    const classifier = new FakeClassifierLlm([
      { id: 'ghost', type: SessionType.of('run'), confidence: 0.9 },
    ]);
    const useCase = new ClassifySessionsUseCase(classifier, new InMemorySessionRepository());

    await expect(useCase.execute({ sessions: raw })).rejects.toThrow();
  });
});
