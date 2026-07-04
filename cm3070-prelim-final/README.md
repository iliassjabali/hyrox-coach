# CM3070 Preliminary Report — LaTeX source

**Project:** Hyrox Personal Coach
**Student:** Iliass Jabali (230586639)
**Template:** CM3020 Project Idea 1 — Governing Multiple Models Around a Goal

This is a **fully-written** preliminary report, ready to compile. All four chapters are drafted with real prose grounded in your project, your tutor's feedback, and the rubric.

## Structure

```
cm3070-prelim-final/
├── main.tex                      # Master file — compile this
├── references.bib                # IEEE bibliography
├── README.md
├── chapters/
│   ├── 01-introduction.tex       # ~950 words (max 1000)
│   ├── 02-literature-review.tex  # ~2460 words (max 2500)
│   ├── 03-design.tex             # ~1950 words (max 2000)
│   └── 04-feature-prototype.tex  # ~1470 words (max 1500)
└── figures/                      # add architecture diagram here
```

Total: ~6830 words. Strict overall limit is 6000. **Trim before submitting** — me kept headroom intentionally so you can choose what to cut.

## Quick start: Overleaf (recommended)

1. New Project → Upload Project
2. Zip this folder, upload the zip
3. Menu → Settings → Compiler: **pdfLaTeX**
4. Recompile

You'll get a working PDF on first try. The architecture diagram will show a placeholder box until you add `figures/architecture.pdf`.

## Local compile

```bash
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

Three passes needed for TOC and citations to resolve.

## BEFORE SUBMISSION — must-do checklist

### Critical (rubric-failing if skipped)

- [x] **All `XX` in Chapter 4 replaced** with real measured numbers (zero `XX` remain). These come from a $0 feasibility run: synthetic 16-session labelled set, Haiku substituted for the Opus Coach / Sonnet Critic (gateway tier did not grant paid models). Honest caveats are stated in-chapter. **Optional upgrade:** once the gateway has Opus/Sonnet credit, re-run for true-tier numbers:
      ```bash
      pnpm --filter @hyrox/training eval:all     # true tiers (Haiku/Opus/Sonnet)
      ```
      To reproduce the Haiku feasibility run:
      ```bash
      EVAL_COACH_MODEL=claude-haiku-4-5 EVAL_CRITIC_MODEL=claude-haiku-4-5 \
        pnpm --filter @hyrox/training eval:all
      ```
- [ ] _(superseded — kept for reference)_ Replace every `XX` in Chapter 4. Run the eval harness (needs `AI_GATEWAY_API_KEY` or `ANTHROPIC_API_KEY` in repo-root `.env`):
      ```bash
      pnpm install
      pnpm --filter @hyrox/training eval:all       # accuracy, consistency, ablation, prompt-variants
      # or individually: eval:accuracy | eval:consistency | eval:ablation | eval:prompts
      # results print to stdout and write JSON to data/eval-results/
      ```
      By default the runners use the committed synthetic fixture
      (`packages/contexts/training/src/evaluation/fixtures/labelled-sessions.example.csv`).
      For real numbers, point them at your own gitignored labelled CSV:
      `pnpm --filter @hyrox/training eval:accuracy data/my-labelled.csv`
      (columns: `id,date,durationSeconds[,distanceMeters][,averageHeartRate],label`).
      Then `grep XX chapters/04-feature-prototype.tex` — must be zero hits before submission.
- [ ] **Verify every citation in `references.bib`** against the actual published paper via Zotero. Notes are added to flag what to check.
- [x] **Architecture diagram** — now a TikZ figure inline in `03-design.tex` (compiles on Overleaf, no external file needed).
- [ ] **Trim total word count to under 6000.** Run `texcount` or paste each chapter into a counter. Current ~6830 → need to cut ~830 words.

### Important

- [ ] Update the Hyrox participation figure with the most recent source
- [ ] Verify hyperlinks in references resolve
- [ ] Add a figure for the confusion matrix once real numbers are in
- [ ] Self-edit pass: read every chapter out loud once

### Process (per Coursera)

- [ ] Export final as PDF (not Word, not zip — PDF only)
- [ ] Record the companion 3-5 min MP4 prototype demo video
- [ ] Submit both to Coursera

## Where the content came from

- **Introduction** — built from your proposal, the CM3020 template brief, and your Hyrox motivation
- **Literature review** — two branches per Reza's instruction: LLM orchestration (ReAct, Reflexion, Multi-Agent Debate, AutoGen) + AI fitness (Strava, Garmin Coach, Humango/Athletica, generic LLM apps). Each work has a stated weakness and a bridge to the project.
- **Design** — five-component architecture, Haiku/Sonnet/Opus role assignment with cost-tier rationale, Zod schemas as control-flow primitive, orchestrator design, work plan, evaluation strategy (objective-primary per Reza), ethics/DEI
- **Feature prototype** — black-box approach per Matt's webinar, four evaluation activities, methodology explicitly tied back to lit review, honest limitations

## Editing tips

- Each chapter is independent — comment out lines in `main.tex` to compile partial drafts faster
- Word count: use `texcount main.tex -inc` to count across all chapters
- Citations use `\cite{key}` — keys match exactly between `.tex` and `.bib`
- Code listings have TypeScript syntax preconfigured

## After submission

This same project is the spine of your **draft report** (week 18) and **final report** (week 21+). You extend, you don't rewrite. That's the main reason me built it in LaTeX.
