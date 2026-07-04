'use client';

import { useState, type ReactNode } from 'react';
import { trpc } from '../lib/trpc';
import styles from './page.module.css';

const SAMPLE_SESSIONS = [
  { id: 'a1', date: new Date('2026-06-01T07:00:00Z'), durationSeconds: 1800, distanceMeters: 5000, averageHeartRate: 150 },
  { id: 'a2', date: new Date('2026-06-03T07:00:00Z'), durationSeconds: 2400, averageHeartRate: 162 },
  { id: 'a3', date: new Date('2026-06-05T18:00:00Z'), durationSeconds: 1200 },
];

type CoachResult = Awaited<ReturnType<typeof trpc.training.coachAthlete.mutate>>;

type Progress =
  | { stage: 'classified'; byType: Record<string, number> }
  | { stage: 'coaching'; attempt: number }
  | { stage: 'reviewing'; attempt: number }
  | { stage: 'critic'; attempt: number; accepted: boolean; reasons: string[] };

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TAG_COLOURS: Record<string, { bg: string; fg: string }> = {
  run: { bg: 'rgba(91,140,255,0.18)', fg: '#93b4ff' },
  sled: { bg: 'rgba(167,139,250,0.18)', fg: '#c4b5fd' },
  burpees: { bg: 'rgba(251,191,36,0.18)', fg: '#fcd34d' },
  mixed: { bg: 'rgba(45,212,191,0.18)', fg: '#5eead4' },
};

export default function Home() {
  const [result, setResult] = useState<CoachResult | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress([]);
    try {
      const res = await fetch('/api/coach-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: SAMPLE_SESSIONS, weekStartingOn: new Date('2026-06-08T00:00:00Z') }),
      });
      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';
        for (const part of parts) {
          const line = part.replace(/^data: /, '').trim();
          if (!line) continue;
          const msg = JSON.parse(line) as
            | { kind: 'progress'; event: Progress }
            | { kind: 'result'; result: CoachResult }
            | { kind: 'error'; message: string };
          if (msg.kind === 'progress') setProgress((prev) => [...prev, msg.event]);
          else if (msg.kind === 'result') setResult(msg.result);
          else if (msg.kind === 'error') setError(msg.message);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <header>
        <h1 className={styles.title}>Hyrox Personal Coach</h1>
        <p className={styles.subtitle}>
          A weekly training plan from your recent data — produced by three specialised Claude agents.
        </p>
        <div className={styles.pipeline}>
          <span className={styles.pill}>
            <span className={styles.pillRole}>Classifier</span>
            <span className={styles.pillModel}>Haiku</span>
          </span>
          <span className={styles.arrow}>→</span>
          <span className={styles.pill}>
            <span className={styles.pillRole}>Coach</span>
            <span className={styles.pillModel}>Opus</span>
          </span>
          <span className={styles.arrow}>→</span>
          <span className={styles.pill}>
            <span className={styles.pillRole}>Critic</span>
            <span className={styles.pillModel}>Sonnet</span>
          </span>
        </div>
      </header>

      <div className={styles.disclaimer}>⚠️ Training aid only — not medical advice.</div>

      <button className={styles.button} onClick={generate} disabled={loading}>
        {loading && <span className={styles.spinner} aria-hidden />}
        {loading ? 'Coaching…' : 'Generate weekly plan from sample data'}
      </button>

      {progress.length > 0 && (
        <div className={styles.stream}>
          {progress.map((event, index) => {
            const isLast = index === progress.length - 1;
            const active = isLast && loading;
            // While the Critic is reviewing, show a single live row; once its verdict
            // arrives the verdict row supersedes it.
            if (event.stage === 'reviewing' && !active) return null;
            return <Step key={index} event={event} active={active} />;
          })}
        </div>
      )}

      {error && <div className={styles.error}>Error: {error}</div>}

      {result && (
        <section className={styles.result}>
          <div className={styles.summary}>
            <span className={`${styles.badge} ${result.accepted ? styles.badgeOk : styles.badgeWarn}`}>
              {result.accepted ? '✓ Accepted' : '⚠ Not accepted'}
            </span>
            <span className={styles.metric}>
              <b>{result.attempts}</b> attempt{result.attempts === 1 ? '' : 's'}
            </span>
            <span className={styles.metric}>
              <b>{result.cost.inputTokens + result.cost.outputTokens}</b> tokens
            </span>
          </div>

          <div className={styles.plan}>
            {result.plan.sessions.map((session, index) => {
              const colour = TAG_COLOURS[session.type] ?? { bg: '#1b2130', fg: '#cfd6e4' };
              return (
                <div className={styles.planRow} key={index}>
                  <span className={styles.day}>{DOW[session.day] ?? `Day ${session.day}`}</span>
                  <span className={styles.tag} style={{ background: colour.bg, color: colour.fg }}>
                    {session.type}
                  </span>
                  <span className={styles.focus}>{session.focus}</span>
                </div>
              );
            })}
          </div>

          {!result.accepted && result.verdict.reasons.length > 0 && (
            <ul className={styles.reasons} style={{ marginTop: 16 }}>
              {result.verdict.reasons.map((reason, index) => (
                <li className={styles.reason} key={index}>
                  {reason}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

function Step({ event, active }: { event: Progress; active: boolean }) {
  let dotClass = styles.dotDone;
  let icon: ReactNode = '✓';
  let role = '';
  let title = '';
  let reasons: string[] | null = null;

  switch (event.stage) {
    case 'classified': {
      role = 'Classifier · Haiku';
      const counts = Object.entries(event.byType)
        .map(([type, n]) => `${n}× ${type}`)
        .join(', ');
      title = `labelled sessions — ${counts}`;
      break;
    }
    case 'coaching':
      role = 'Coach · Opus';
      title = active ? `drafting weekly plan (attempt ${event.attempt})…` : `drafted weekly plan (attempt ${event.attempt})`;
      if (active) {
        dotClass = styles.dotActive;
        icon = <span className={styles.dotSpinner} aria-hidden />;
      }
      break;
    case 'reviewing':
      role = 'Critic · Sonnet';
      title = `reviewing plan (attempt ${event.attempt})…`;
      dotClass = styles.dotActive;
      icon = <span className={styles.dotSpinner} aria-hidden />;
      break;
    case 'critic':
      role = 'Critic · Sonnet';
      if (event.accepted) {
        title = `approved the plan (attempt ${event.attempt})`;
      } else {
        dotClass = styles.dotWarn;
        icon = '✗';
        title = `requested a revision (attempt ${event.attempt})`;
        reasons = event.reasons;
      }
      break;
  }

  return (
    <div className={styles.step}>
      <span className={`${styles.dot} ${dotClass}`}>{icon}</span>
      <div className={styles.stepBody}>
        <div className={styles.stepTitle}>
          <span className={styles.stepRole}>{role}</span> — {title}
        </div>
        {reasons && (
          <ul className={styles.reasons}>
            {reasons.map((reason, index) => (
              <li className={styles.reason} key={index}>
                {reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
