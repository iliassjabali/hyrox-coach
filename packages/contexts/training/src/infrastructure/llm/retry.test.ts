import { describe, it, expect } from 'vitest';
import { retryOnError } from './retry';

describe('retryOnError', () => {
  it('returns the first successful result without retrying', async () => {
    let calls = 0;
    const result = await retryOnError(async () => {
      calls += 1;
      return 'ok';
    });
    expect(result).toBe('ok');
    expect(calls).toBe(1);
  });

  it('retries on error and succeeds on a later attempt', async () => {
    let calls = 0;
    const result = await retryOnError(
      async () => {
        calls += 1;
        if (calls < 3) throw new Error('transient');
        return 'recovered';
      },
      { attempts: 3 },
    );
    expect(result).toBe('recovered');
    expect(calls).toBe(3);
  });

  it('rethrows the last error after exhausting attempts', async () => {
    let calls = 0;
    await expect(
      retryOnError(
        async () => {
          calls += 1;
          throw new Error(`fail ${calls}`);
        },
        { attempts: 2 },
      ),
    ).rejects.toThrow('fail 2');
    expect(calls).toBe(2);
  });

  it('does not retry when shouldRetry returns false', async () => {
    let calls = 0;
    await expect(
      retryOnError(
        async () => {
          calls += 1;
          throw new Error('fatal');
        },
        { attempts: 5, shouldRetry: () => false },
      ),
    ).rejects.toThrow('fatal');
    expect(calls).toBe(1);
  });
});
