import { describe, expect, it } from 'vitest';
import { WorkoutSession } from './workout-session';
import { SessionType } from './session-type';
import { InvalidWorkoutSession } from './errors';

const validProps = {
  id: 's1',
  date: new Date('2026-06-01T07:00:00Z'),
  type: SessionType.of('run'),
  durationSeconds: 1800,
};

describe('WorkoutSession', () => {
  it('creates a valid session and exposes its properties', () => {
    const session = WorkoutSession.create(validProps);
    expect(session.id).toBe('s1');
    expect(session.type.value).toBe('run');
    expect(session.durationSeconds).toBe(1800);
  });

  it('requires a non-empty id', () => {
    expect(() => WorkoutSession.create({ ...validProps, id: '  ' })).toThrow(
      InvalidWorkoutSession,
    );
  });

  it('requires a positive duration', () => {
    expect(() => WorkoutSession.create({ ...validProps, durationSeconds: 0 })).toThrow(
      InvalidWorkoutSession,
    );
  });

  it('rejects a negative distance', () => {
    expect(() =>
      WorkoutSession.create({ ...validProps, distanceMeters: -1 }),
    ).toThrow(InvalidWorkoutSession);
  });

  it('rejects an implausible average heart rate', () => {
    expect(() =>
      WorkoutSession.create({ ...validProps, averageHeartRate: 15 }),
    ).toThrow(InvalidWorkoutSession);
  });

  it('compares by identity, not by attributes', () => {
    const a = WorkoutSession.create(validProps);
    const sameIdDifferentData = WorkoutSession.create({ ...validProps, durationSeconds: 999 });
    const differentId = WorkoutSession.create({ ...validProps, id: 's2' });

    expect(a.equals(sameIdDifferentData)).toBe(true);
    expect(a.equals(differentId)).toBe(false);
  });
});
