# Final Project Demo Video — Script & Shot List

**Target: 3–5 minutes (this script runs ~4:30). Format MUST be MP4.** Record screen +
voice (QuickTime → File → New Screen Recording on macOS, or Loom/OBS exported to MP4).
Your voice must narrate throughout; you don't need to appear on camera.

**Before recording:**

- Start the web app (true Opus/Sonnet tiers via your Anthropic key in `apps/web/.env.local`):
  ```bash
  pnpm --filter @hyrox/web dev
  ```

  Open http://localhost:3000. Do one warm-up run so the first on-camera run is snappy.
- Have a terminal and your editor open. **Keep your API key off-screen.**
- Have `images/architecture.png` open for the architecture section (or show Fig 1 in `main.pdf`).

---

## 0:00–0:20 — Hook + intro

> "AI fitness apps routinely hand out unsafe training plans — huge volume jumps, no rest
> days — because a single model has nothing checking its work. I'm Iliass Jabali, and my
> CM3070 final project, *Hyrox Personal Coach*, fixes that with three specialised Claude
> models in three distinct roles — a Classifier, a Coach, and a Critic — orchestrated so
> that no plan reaches the athlete until it's been reviewed and approved."

**On screen:** the app landing page (title + the Classifier→Coach→Critic pills), or a title slide.

## 0:20–0:55 — Architecture

> "The pipeline runs left to right: ingestion, feature engineering, then Classifier on
> Haiku, Coach on Opus, Critic on Sonnet, then persistence and the UI. Each model is matched
> to its task on a cost–capability spectrum — Haiku is cheap for shallow labelling, Opus
> does the hard plan reasoning, Sonnet does careful rule-based review. Every hand-off is
> validated against a Zod schema. Underneath the three agents sits the orchestrator — the
> project's core contribution — which owns routing, schema-validation retries, and the
> reject/revise feedback loop that sends the Critic's reasons back to the Coach."

**On screen:** `images/architecture.png` (the pipeline diagram). Trace the flow with the
cursor, then point at the orchestrator band and the dashed feedback loop.

## 0:55–2:45 — Live web demo (the centrepiece)

Browser at http://localhost:3000. Point out the header pills, then the **athlete-input table**.

> "Everything here is live — real Claude calls, streamed stage by stage. First, the raw
> input: three recent sessions — a 30-minute run, a 40-minute session, a 20-minute session.
> That's all the athlete history the system gets."

Click **Generate weekly plan from sample data**. As the stream runs, narrate:

> "First the Classifier on Haiku labels each session — watch the *Classified* column fill in:
> run, mixed, mixed. Notice each call shows its dollar cost — cost is tracked as a
> first-class metric, not an afterthought.
> Then the Coach on Opus drafts a full week.
> Now the Critic on Sonnet reviews it — and it *rejects* the draft. This is the key moment:
> you can see the exact plan it rejected and the specific, cited reasons — an excessive
> volume jump, no rest day, threshold intervals placed too early, a sled session with no
> baseline. That's the safety layer doing real work."

> "The orchestrator feeds those reasons back to the Coach, which redrafts — and if the Critic
> still isn't satisfied, it rejects again. Only when the plan is genuinely safe does the
> Critic approve it."

Point at the accepted result card:

> "The accepted plan now has explicit rest and recovery days and an introductory, scaled-down
> sled session — the critique measurably improved the output. And the summary shows the number
> of attempts, the total tokens, and the total dollar cost of the whole run."

**Emphasise:** the input table + live classification, the per-call dollar cost, and — above
all — the rejected draft plans with the Critic's reasons, then the safe approved plan.

## 2:45–3:20 — Engineering rigour (terminal)

> "Under the UI this is a hexagonal TypeScript codebase, built test-first."

```bash
pnpm --filter @hyrox/training test
```

> "Seventy unit tests — domain, the orchestrator's retry and conflict-resolution logic, each
> adapter, the evaluation metrics, and the training-load feature engineering — all green, all
> network-free. The feature layer computes the Banister TRIMP score and the acute-to-chronic
> workload ratio, both unit-tested."

Optional depth point:

> "The orchestrator is also resilient — when Opus occasionally returns malformed structured
> output, a recovery step at the adapter boundary fixes it and the run continues instead of
> crashing."

## 3:20–4:10 — Evaluation & honest limitations

> "The graded core is objective evaluation, run on the true model tiers: classifier accuracy
> with a confusion matrix, output consistency across repeated runs, a Critic ablation, and a
> prompt-variant comparison — all in Chapter 5 of the report. The strongest result is the
> ablation: the Critic intervened on every single run, so with the true-tier Coach, every
> unreviewed first draft would have reached the athlete unchanged."

> "Two honest limitations. The figures come from a small *synthetic* labelled set, not real
> athlete data, so they're feasibility evidence to be re-measured on a real multi-athlete set.
> And output consistency is only 25% — the same input doesn't always give the same plan — which
> I report as a real architectural limitation rather than hide."

**On screen:** Chapter 5 of `main.pdf` (the confusion-matrix table and results).

## 4:10–4:30 — What I learned + close

> "The main thing I learned is that model choice is a genuine design variable, not just a cost
> dial: moving the Coach from Haiku to Opus changed the system's *failure mode*, not just its
> output quality. The whole project is open and auditable on GitHub. In short: a three-model,
> role-specialised, schema-validated pipeline that catches unsafe coaching advice before it
> ever reaches the user. Thanks for watching."

**On screen:** the approved-plan result card, or the repo.

---

## Narration notes (accuracy)

- The web demo runs the **true tiers** (Haiku / Opus / Sonnet) on your Anthropic key — the
  pills and subtitle are accurate; no substitution caveat needed for the live demo.
- The dollar figures shown per call use Anthropic first-party pricing (Haiku $1/$5, Opus
  $5/$25, Sonnet $3/$15 per million input/output tokens).
- Chapter 5's headline numbers (e.g. classifier accuracy, 25% consistency) are true-tier runs
  on the synthetic fixture — describe them as such; don't quote a number that contradicts what
  a live run happens to show on camera.
- Don't show the `.env` / `.env.local` file or the API key on screen.

## After recording

1. Export as **.mp4** (H.264).
2. Coursera assignment → **Question 2 → Add File** (the video item) → upload.
3. Tick the Honor Code box and Submit (only you can do this).
