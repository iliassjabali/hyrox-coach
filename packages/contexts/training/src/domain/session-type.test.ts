import { describe, expect, it } from 'vitest';
import { SessionType } from './session-type';
import { InvalidSessionType } from './errors';

describe('SessionType', () => {
  it('accepts the four Hyrox-relevant types', () => {
    for (const value of ['run', 'sled', 'burpees', 'mixed']) {
      expect(SessionType.of(value).value).toBe(value);
    }
  });

  it('is case-insensitive and trims, normalizing to lowercase', () => {
    expect(SessionType.of('RUN').value).toBe('run');
    expect(SessionType.of('  Sled ').value).toBe('sled');
  });

  it('rejects an unknown type', () => {
    expect(() => SessionType.of('cycling')).toThrow(InvalidSessionType);
  });

  it('compares by value', () => {
    expect(SessionType.of('run').equals(SessionType.of('run'))).toBe(true);
    expect(SessionType.of('run').equals(SessionType.of('sled'))).toBe(false);
  });
});
