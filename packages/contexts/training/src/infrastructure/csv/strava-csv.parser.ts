import type { RawSessionInput } from '../../application/dto/raw-session-input';

export class CsvParseError extends Error {}

const REQUIRED = ['id', 'date', 'durationSeconds'] as const;

// Driven adapter: parses a clean activities CSV into raw (pre-classification) sessions.
// Expected header: id,date,durationSeconds,distanceMeters,averageHeartRate
// (Simple comma split — values must not contain commas. Empty optional cells are dropped.)
export function parseStravaCsv(csv: string): RawSessionInput[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return [];

  const header = lines[0]!.split(',').map((column) => column.trim());
  for (const column of REQUIRED) {
    if (!header.includes(column)) {
      throw new CsvParseError(`missing required column: ${column}`);
    }
  }

  const indexOf = (name: string): number => header.indexOf(name);
  const idAt = indexOf('id');
  const dateAt = indexOf('date');
  const durationAt = indexOf('durationSeconds');
  const distanceAt = indexOf('distanceMeters');
  const hrAt = indexOf('averageHeartRate');

  return lines.slice(1).map((line, row) => {
    const cells = line.split(',');
    const id = (cells[idAt] ?? '').trim();
    if (!id) throw new CsvParseError(`row ${row + 1}: empty id`);

    const date = new Date((cells[dateAt] ?? '').trim());
    if (Number.isNaN(date.getTime())) throw new CsvParseError(`row ${row + 1}: invalid date`);

    const durationSeconds = Number((cells[durationAt] ?? '').trim());
    if (!Number.isFinite(durationSeconds)) {
      throw new CsvParseError(`row ${row + 1}: invalid durationSeconds`);
    }

    const distance = distanceAt >= 0 ? (cells[distanceAt] ?? '').trim() : '';
    const heartRate = hrAt >= 0 ? (cells[hrAt] ?? '').trim() : '';

    const session: RawSessionInput = {
      id,
      date,
      durationSeconds,
      ...(distance !== '' ? { distanceMeters: Number(distance) } : {}),
      ...(heartRate !== '' ? { averageHeartRate: Number(heartRate) } : {}),
    };
    return session;
  });
}
