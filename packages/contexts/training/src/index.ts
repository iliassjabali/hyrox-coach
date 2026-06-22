// Public API of the context. Consumers import from here, never deep paths.

// domain
export * from './domain/session-type';
export * from './domain/workout-session';
export * from './domain/weekly-plan';
export * from './domain/plan-verdict';
export * from './domain/training-load';
export * from './domain/errors';

// application — driving ports + DTOs
export type * from './application/ports/in/classify-sessions.port';
export type * from './application/ports/in/coach-athlete.port';
export type * from './application/dto/raw-session-input';

// application — driven ports (implement these in infrastructure adapters)
export type * from './application/ports/out/token-usage';
export type * from './application/ports/out/classifier-llm.port';
export type * from './application/ports/out/coach-llm.port';
export type * from './application/ports/out/critic-llm.port';
export type * from './application/ports/out/session-repository.port';
export type * from './application/ports/out/run-log.port';
export type * from './application/ports/out/clock.port';

// use cases
export { ClassifySessionsUseCase } from './application/use-cases/classify-sessions.use-case';
export { CoachAthleteUseCase } from './application/use-cases/coach-athlete.use-case';

// evaluation (objective metrics)
export { accuracy, confusionMatrix, consistency, type Labelled } from './evaluation/classifier-metrics';
