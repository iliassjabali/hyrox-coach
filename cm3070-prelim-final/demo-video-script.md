# Feature-Prototype Demo Video — Script & Shot List

**Target: 3–5 minutes. Format MUST be MP4.** Record screen + voice (QuickTime →
File → New Screen Recording on macOS, or Loom/OBS exported to MP4).

**Before recording:**

- Start the web app (true Opus/Sonnet tiers via your Anthropic key):
  ```bash
  set -a && . ./.env && set +a && pnpm --filter @hyrox/web dev
  ```

  Open http://localhost:3000. Do one warm-up run so the first on-camera run is snappy.
- Have a terminal and your editor open. Keep your API key off-screen.
- Open `main.pdf` to the architecture diagram (Fig 1) for the design section.

---

## 0:00–0:20 — Intro

> "Hi, I'm Iliass Jabali. This is the feature-prototype demo for my CM3070 project,
> *Hyrox Personal Coach* — it turns an athlete's training history into a
> safety-validated weekly plan using three Claude models in three distinct agent
> roles. The technical feature is the orchestration: a Classifier, a Coach, and a
> Critic, with schema-validated hand-offs and an orchestrator that retries and
> resolves conflicts."

**On screen:** title slide, or the architecture diagram (Fig 1 in `main.pdf`).

## 0:20–0:55 — Architecture

> "The pipeline is ingest → feature engineering → Classifier on Haiku → Coach on
> Opus → Critic on Sonnet. Each model is matched to its task on a cost–capability
> spectrum: Haiku is cheap for shallow labelling, Opus does the hard plan reasoning,
> Sonnet does careful rule-based review. Every agent returns a Zod-validated object;
> if validation fails the orchestrator retries, and if the Critic rejects a plan its
> feedback goes back to the Coach for another attempt."

**On screen:** Fig 1, then a quick glance at
`packages/contexts/training/src/application/use-cases/coach-athlete.use-case.ts`
(the classify → coach → critic loop) and `.../llm/models.ts` (the three model IDs).

## 0:55–2:30 — Live web demo (the centrepiece)

Browser at http://localhost:3000. Point out the header pills: **Classifier · Haiku
→ Coach · Opus → Critic · Sonnet**. Click **Generate weekly plan from sample data**
and narrate the live timeline as it streams in:

> "Everything you're about to see is live — these are real Claude calls, streamed
> stage by stage.
> First the **Classifier on Haiku** labels the recent sessions.
> Then the **Coach on Opus** drafts a weekly plan.
> Now the **Critic on Sonnet** reviews it — and here it *rejects* the first draft.
> Look at the reasoning: it cites the ~10% weekly-volume rule, flags no dedicated
> rest day, and back-to-back high-intensity sessions. That's the safety layer doing
> real work.
> The orchestrator feeds that feedback back to the Coach, which **redrafts** —
> and this time the Critic **approves** it."

Then point at the result card:

> "The accepted plan: notice it now has explicit rest and recovery days that the
> first draft was missing — the critique measurably improved the output. It shows
> the number of attempts and the token cost, because cost and latency are tracked as
> first-class product concerns."

**What to emphasise:** the three coloured agent steps, the Critic's bulleted
reasons, the reject → revise → approve loop, and the rest days appearing in the
revised plan.

## 2:30–3:10 — Engineering rigour (terminal)

> "Under the UI this is a hexagonal TypeScript codebase, built test-first."

```bash
pnpm --filter @hyrox/training test
```

> "Sixty-plus unit tests — domain, orchestrator, adapters, evaluation metrics — all
> green."

```bash
pnpm --filter @hyrox/training eval:accuracy
```

> "And the evaluation harness: this classifies a labelled set through the live Haiku
> Classifier and prints accuracy and a confusion matrix."

Optional one-liner on resilience (nice depth point):

> "The orchestrator is also resilient — when Opus occasionally returns malformed
> structured output, the system recovers and retries instead of failing the run."

## 3:10–3:55 — Evaluation & honest limitations

> "The graded core is objective evaluation, following the agent-evaluation
> literature: classifier accuracy with a confusion matrix, output consistency across
> repeated runs, a Critic ablation, and a prompt-variant comparison — all runnable
> with `pnpm eval`. Two honest points. The reported figures use a small *synthetic*
> labelled set, not private athlete data, so they're feasibility evidence that the
> methodology works, to be re-measured on a real multi-athlete set. And the numbers
> vary run to run — the same input doesn't always give the same plan — which is
> exactly the output-consistency limitation I quantify in the report."

**On screen:** Chapter 4 of `main.pdf` (the confusion-matrix table + results).

> "Planned improvements: a real multi-athlete labelled set, the ACWR and
> pace/heart-rate features that are currently designed but not yet built, OAuth
> ingestion to replace CSV import, and a cross-model comparison. But the prototype
> establishes what it needed to: the three-model orchestration is feasible end-to-end
> on real architecture, and the evaluation methodology is operationalisable."

**Close:** "Thanks for watching."

---

## Narration notes (accuracy)

- The web demo runs the **true tiers** (Haiku/Opus/Sonnet) on your Anthropic key —
  the pills and subtitle are accurate; no substitution caveat needed.
- If you have NOT re-run the eval harness on the true tiers, the report's Chapter-4
  numbers are still from the reproducible Haiku feasibility run — say "feasibility
  figures" as above and don't quote a specific number that contradicts a live run.
- Don't show the `.env` file or the API key on screen.

## After recording

1. Export as **.mp4** (H.264).
2. Coursera assignment → **Question 2 → Add File** (the 6-point item) → upload.
3. Tick the Honor Code box and Submit (only you can do this).
