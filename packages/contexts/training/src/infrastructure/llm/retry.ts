export interface RetryOptions {
  attempts?: number;
  shouldRetry?: (error: unknown) => boolean;
}

// Bounded retry helper. Re-invokes `fn` up to `attempts` times while `shouldRetry`
// holds, then rethrows the last error. Used to absorb intermittent structured-output
// failures from the LLM (a fresh generation usually validates), keeping the
// orchestrator resilient rather than crashing a whole pipeline run.
export async function retryOnError<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const attempts = Math.max(1, options.attempts ?? 3);
  const shouldRetry = options.shouldRetry ?? (() => true);
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === attempts - 1 || !shouldRetry(error)) throw error;
    }
  }
  throw lastError;
}
