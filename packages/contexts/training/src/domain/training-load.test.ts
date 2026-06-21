import { describe, expect, it } from 'vitest';
import { TrainingLoad } from './training-load';
import { InvalidTrainingLoad } from './errors';

// Banister TRIMP: duration_min * HRr * 0.64 * e^(1.92*HRr),
// HRr = (avg - rest) / (max - rest).
// 60 min, avg 150, rest 50, max 200 -> HRr=0.6667 -> ~92.08
const input = {
  durationSeconds: 3600,
  averageHeartRate: 150,
  restingHeartRate: 50,
  maxHeartRate: 200,
};

describe('TrainingLoad.trimp', () => {
  it('computes the Banister TRIMP for a session', () => {
    expect(TrainingLoad.trimp(input)).toBeCloseTo(92.08, 1);
  });

  it('scales linearly with duration', () => {
    const single = TrainingLoad.trimp(input);
    const doubled = TrainingLoad.trimp({ ...input, durationSeconds: input.durationSeconds * 2 });
    expect(doubled).toBeCloseTo(single * 2, 5);
  });

  it('clamps heart-rate reserve at 1 when avg exceeds max', () => {
    const atMax = TrainingLoad.trimp({ ...input, averageHeartRate: input.maxHeartRate });
    const aboveMax = TrainingLoad.trimp({ ...input, averageHeartRate: input.maxHeartRate + 20 });
    expect(aboveMax).toBeCloseTo(atMax, 5);
  });

  it('rejects a non-positive duration', () => {
    expect(() => TrainingLoad.trimp({ ...input, durationSeconds: 0 })).toThrow(
      InvalidTrainingLoad,
    );
  });

  it('rejects a max heart rate not above resting', () => {
    expect(() =>
      TrainingLoad.trimp({ ...input, maxHeartRate: 50, restingHeartRate: 50 }),
    ).toThrow(InvalidTrainingLoad);
  });
});
