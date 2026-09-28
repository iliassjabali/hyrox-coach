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

// ACWR (acute:chronic workload ratio): acute = mean daily load over the last 7 days,
// chronic = mean daily load over the last 28 days, ACWR = acute / chronic (Gabbett).
describe('TrainingLoad.acwr', () => {
  const steady = Array.from({ length: 28 }, () => 100);

  it('is 1.0 when daily load is steady over the 28-day window', () => {
    expect(TrainingLoad.acwr(steady)).toBeCloseTo(1.0, 5);
  });

  it('rises above 1 when the last 7 days spike above the chronic baseline', () => {
    const loads = [
      ...Array.from({ length: 21 }, () => 50),
      ...Array.from({ length: 7 }, () => 100),
    ];
    // acute = 100; chronic = (21*50 + 7*100)/28 = 62.5; ACWR = 1.6
    expect(TrainingLoad.acwr(loads)).toBeCloseTo(1.6, 5);
  });

  it('uses only the most recent 28 days of a longer history', () => {
    const loads = [...Array.from({ length: 10 }, () => 999), ...steady];
    expect(TrainingLoad.acwr(loads)).toBeCloseTo(1.0, 5);
  });

  it('requires at least 28 days of load', () => {
    expect(() => TrainingLoad.acwr(Array.from({ length: 27 }, () => 100))).toThrow(
      InvalidTrainingLoad,
    );
  });

  it('rejects a zero chronic load', () => {
    expect(() => TrainingLoad.acwr(Array.from({ length: 28 }, () => 0))).toThrow(
      InvalidTrainingLoad,
    );
  });

  it('rejects negative or non-finite daily loads', () => {
    const bad = [...Array.from({ length: 27 }, () => 100), -5];
    expect(() => TrainingLoad.acwr(bad)).toThrow(InvalidTrainingLoad);
  });
});
