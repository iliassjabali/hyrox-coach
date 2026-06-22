import type { SessionType, SessionTypeValue } from '../domain/session-type';

export interface Labelled {
  id: string;
  type: SessionType;
}

const TYPES: SessionTypeValue[] = ['run', 'sled', 'burpees', 'mixed'];

type Matrix = Record<SessionTypeValue, Record<SessionTypeValue, number>>;

function index(items: Labelled[]): Map<string, Labelled> {
  return new Map(items.map((item) => [item.id, item]));
}

// Fraction of labelled sessions whose predicted type matches the label.
export function accuracy(predictions: Labelled[], labels: Labelled[]): number {
  if (labels.length === 0) return 0;
  const predById = index(predictions);
  let correct = 0;
  for (const label of labels) {
    const predicted = predById.get(label.id);
    if (!predicted) throw new Error(`missing prediction for labelled id: ${label.id}`);
    if (predicted.type.equals(label.type)) correct += 1;
  }
  return correct / labels.length;
}

// actual type -> predicted type -> count.
export function confusionMatrix(predictions: Labelled[], labels: Labelled[]): Matrix {
  const predById = index(predictions);
  const matrix = emptyMatrix();
  for (const label of labels) {
    const predicted = predById.get(label.id);
    if (!predicted) throw new Error(`missing prediction for labelled id: ${label.id}`);
    matrix[label.type.value][predicted.type.value] += 1;
  }
  return matrix;
}

// Output stability: fraction of runs equal to the most common signature (1 = identical).
export function consistency(runSignatures: string[]): number {
  if (runSignatures.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const signature of runSignatures) {
    counts.set(signature, (counts.get(signature) ?? 0) + 1);
  }
  const modal = Math.max(...counts.values());
  return modal / runSignatures.length;
}

function emptyMatrix(): Matrix {
  const matrix = {} as Matrix;
  for (const actual of TYPES) {
    const row = {} as Record<SessionTypeValue, number>;
    for (const predicted of TYPES) row[predicted] = 0;
    matrix[actual] = row;
  }
  return matrix;
}
