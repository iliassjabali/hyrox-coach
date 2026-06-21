---
name: journal
description: Use when the user wants to add or update a weekly CM3070 project journal entry. Appends a structured entry to docs/journal.md (the exam Q3 source).
---

# Project Journal Entry

Append a weekly entry to `docs/journal.md`. The journal is the evidence base for
the **exam question on lessons learned** — entries must be the student's own words.

## Steps

1. Read `docs/journal.md` to find the latest week number.
2. Ask the user (or use what they provided) for this week's:
   - **What I did** — concrete progress, tied to `docs/plan.md` task numbers where possible.
   - **Blockers / surprises** — what went wrong or was unexpected.
   - **Lessons / decisions** — design choices, trade-offs, what you'd do differently.
   - **Next week** — the plan.
3. Append a new `## Week N (<phase>)` section using the existing template format.
   Do **not** invent content — if the user hasn't given details, insert the blank
   template for them to fill, don't fabricate progress.
4. Keep it to roughly one paragraph per field (the rubric expects one paragraph/week).

Capture the user's actual experience in their voice; never embellish results.
