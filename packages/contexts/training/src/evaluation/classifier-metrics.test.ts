// Objective evaluation metrics — the graded "lead with objective metrics" core.
import { describe, expect, it } from 'vitest';
import { accuracy, confusionMatrix, consistency } from './classifier-metrics';
import { SessionType } from '../domain/session-type';

const labels = [
  { id: 'a', type: SessionType.of('run') },
  { id: 'b', type: SessionType.of('run') },
  { id: 'c', type: SessionType.of('sled') },
];
const predictions = [
  { id: 'a', type: SessionType.of('run') }, // correct
  { id: 'b', type: SessionType.of('sled') }, // wrong
  { id: 'c', type: SessionType.of('sled') }, // correct
];

describe('classifier metrics', () => {
  it('computes accuracy over a labelled set', () => {
    expect(accuracy(predictions, labels)).toBeCloseTo(2 / 3, 5);
  });

  it('builds a confusion matrix (actual -> predicted -> count)', () => {
    const cm = confusionMatrix(predictions, labels);
    expect(cm.run.run).toBe(1);
    expect(cm.run.sled).toBe(1);
    expect(cm.sled.sled).toBe(1);
    expect(cm.sled.run).toBe(0);
  });

  it('throws when a prediction is missing for a labelled id', () => {
    expect(() => accuracy([{ id: 'a', type: SessionType.of('run') }], labels)).toThrow();
  });
});

describe('consistency', () => {
  it('is 1 when every run is identical', () => {
    expect(consistency(['x', 'x', 'x'])).toBe(1);
  });

  it('is the modal fraction when runs differ', () => {
    expect(consistency(['x', 'x', 'y', 'z'])).toBeCloseTo(0.5, 5);
  });

  it('is 0 for no runs', () => {
    expect(consistency([])).toBe(0);
  });
});
