// Concrete driven adapters — imported by the host composition root (apps/web / trpc),
// never by domain or application code.
export { SystemClock } from './time/system-clock';
export { parseStravaCsv, CsvParseError } from './csv/strava-csv.parser';
export { DrizzleSessionRepository } from './persistence/drizzle-session.repository';
export { DrizzleRunLog } from './persistence/drizzle-run-log.repository';
export { AnthropicClassifierAdapter } from './llm/anthropic-classifier.adapter';
export { AnthropicCoachAdapter } from './llm/anthropic-coach.adapter';
export { AnthropicCriticAdapter } from './llm/anthropic-critic.adapter';
export { anthropicStructuredCall, type StructuredLlmCall } from './llm/structured-llm-call';
export { MODELS } from './llm/models';
