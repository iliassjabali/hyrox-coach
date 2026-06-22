'use client';

import { useState } from 'react';
import { trpc } from '../lib/trpc';

const SAMPLE_SESSIONS = [
  { id: 'a1', date: new Date('2026-06-01T07:00:00Z'), durationSeconds: 1800, distanceMeters: 5000, averageHeartRate: 150 },
  { id: 'a2', date: new Date('2026-06-03T07:00:00Z'), durationSeconds: 2400, averageHeartRate: 162 },
  { id: 'a3', date: new Date('2026-06-05T18:00:00Z'), durationSeconds: 1200 },
];

type CoachResult = Awaited<ReturnType<typeof trpc.training.coachAthlete.mutate>>;

export default function Home() {
  const [result, setResult] = useState<CoachResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await trpc.training.coachAthlete.mutate({
        sessions: SAMPLE_SESSIONS,
        weekStartingOn: new Date('2026-06-08T00:00:00Z'),
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ marginBottom: 4 }}>Hyrox Personal Coach</h1>
      <p style={{ color: '#9aa3b2', marginTop: 0 }}>
        Classifier (Haiku) → Coach (Opus) → Critic (Sonnet), orchestrated with validation and retry.
      </p>

      <div style={{ background: '#3a2a12', border: '1px solid #6b4f1f', borderRadius: 8, padding: '10px 14px', margin: '16px 0' }}>
        ⚠️ Training aid only — not medical advice.
      </div>

      <button
        onClick={generate}
        disabled={loading}
        style={{ padding: '10px 18px', borderRadius: 8, border: 0, background: '#4f7cff', color: 'white', cursor: 'pointer', fontSize: 16 }}
      >
        {loading ? 'Coaching…' : 'Generate weekly plan from sample data'}
      </button>

      {error && <p style={{ color: '#ff7b7b' }}>Error: {error}</p>}

      {result && (
        <section style={{ marginTop: 24 }}>
          <p>
            {result.accepted ? '✅ Accepted' : '⚠️ Not accepted'} after {result.attempts} attempt(s) · cost{' '}
            {result.cost.inputTokens + result.cost.outputTokens} tokens
          </p>
          <ol>
            {result.plan.sessions.map((session, index) => (
              <li key={index}>
                <strong>Day {session.day}</strong> — {session.type}: {session.focus}
              </li>
            ))}
          </ol>
          {!result.accepted && result.verdict.reasons.length > 0 && (
            <p style={{ color: '#ffb86b' }}>Critic: {result.verdict.reasons.join('; ')}</p>
          )}
        </section>
      )}
    </main>
  );
}
