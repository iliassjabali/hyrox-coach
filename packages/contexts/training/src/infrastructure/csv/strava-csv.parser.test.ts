import { describe, expect, it } from 'vitest';
import { parseStravaCsv } from './strava-csv.parser';

const csv = `id,date,durationSeconds,distanceMeters,averageHeartRate
a1,2026-06-01T07:00:00Z,1800,5000,150
a2,2026-06-02T07:00:00Z,1200,,`;

describe('parseStravaCsv', () => {
  it('parses rows into RawSessionInput', () => {
    const rows = parseStravaCsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      id: 'a1',
      date: new Date('2026-06-01T07:00:00Z'),
      durationSeconds: 1800,
      distanceMeters: 5000,
      averageHeartRate: 150,
    });
  });

  it('treats empty optional fields as absent', () => {
    const rows = parseStravaCsv(csv);
    expect(rows[1]!.distanceMeters).toBeUndefined();
    expect(rows[1]!.averageHeartRate).toBeUndefined();
    expect(rows[1]!.durationSeconds).toBe(1200);
  });

  it('ignores blank lines', () => {
    expect(parseStravaCsv(`${csv}\n\n`)).toHaveLength(2);
  });

  it('throws when a required column is missing', () => {
    expect(() => parseStravaCsv('id,date\na1,2026-06-01T07:00:00Z')).toThrow();
  });
});
