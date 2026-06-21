// App-level DTO: a raw imported activity, before Hyrox classification.
// (Produced by an ingestion adapter, e.g. the Strava CSV parser.)
export interface RawSessionInput {
  id: string;
  date: Date;
  durationSeconds: number;
  distanceMeters?: number;
  averageHeartRate?: number;
}
