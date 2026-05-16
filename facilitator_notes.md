# Facilitator notes

## Workshop schedules

Three tasks (0–2). Two credible shapes depending on how long you
have:

### Schedule A — 2 hours (recommended)

| Time | Block |
|------|-------|
| 0:00–0:05 | Intro |
| 0:05–0:30 | Task 0: setup |
| 0:30–1:00 | Task 1: data analysis + regression |
| 1:00–1:50 | Task 2: build the 3D FEM solver |
| 1:50–2:00 | Debrief |

Task 2 needs ~50 min minimum to get from blank-folder to validated
output. Don't try to compress below that — partial 3D FEM is more
demoralising than a complete simpler task.

### Schedule B — 90 minutes, sampler (no deep task 2)

If you only have 90 minutes, *don't* try to fit a full task 2.
Instead, demo it yourself for ~10 minutes at the end.

| Time | Block |
|------|-------|
| 0:00–0:05 | Intro |
| 0:05–0:25 | Task 0: setup |
| 0:25–1:10 | Task 1: full main exercise |
| 1:10–1:25 | Task 2 *facilitator demo* (run reference solver, narrate) |
| 1:25–1:30 | Debrief |

This is the honest 90-minute path. Task 2 lands as "watch what this
can do" rather than a hands-on.

## Notes on the schedules

- If task 0 setup runs long, hold the line — setup is what makes
  the rest possible. Eat into task 1 stretch first, then task 2
  validation.
- Task 2 is the workshop's headline demo. If you have to choose
  between depth on task 1 and depth on task 2, keep task 2 deep.

## Task 0 facilitation tips

- Have a "buddy system": pair anyone whose terminal is unfamiliar
  with someone who's comfortable. Most stumbles are PATH / shell-rc
  issues, not OpenCode bugs.
- The OpenAI API key is the step that takes longest — phone
  verification on a new account can take 5+ minutes. Suggest people
  start that step *first* and do the uv/OpenCode install in parallel
  while it ticks.
- The smoke test #3 (run python -c, capture stdout) is the *real*
  pass/fail. If that doesn't work, the rest of the workshop doesn't.
  Don't push past it.

## Task 1 facilitation

### Before task 1 (3 min)

> 200 design points across two CSVs. Too big to paste into a chat.
> Three planted data quality issues — I'm not telling you what. The
> agent has to notice. And you'll fit a small predictive model and
> check it on held-out data, the kind of step that would be a
> copy-paste nightmare in a chat session.

### What to watch for and call out

- **First time it joins the two tables** — "this is where a chat
  session starts hurting; the agent doesn't notice."
- **First anomaly catch** — pause the room. "Notice — nobody told it
  to look for that. It noticed."
- **A bad first plot followed by a refined one** — iteration on plot
  quality is one of the strongest agent-vs-chatbot demos.
- **Train/test split and R² report** — call out that this is the
  kind of step where the chat workflow falls over.

### Expected behaviours on `gpt-5.4-mini`

Strong points:
- Handles the multi-file join cleanly
- Catches NaN and the missing design (156) consistently
- Writes correct sklearn code on the first try
- Pareto algorithm: usually correct first attempt

Watch for:
- May miss the negative wire length on design 23 — the value's status
  is "ok" so it sneaks past a status filter. See `task1_hints.md`.
- Sometimes fits the regression on dirty data without filtering →
  weak R². Coach toward "clean first, then fit".
- Occasionally leaks `status` or `total_wire_length_mm` into features
  → R² > 0.99 (suspicious). Coach toward checking the feature list.

## Task 2 facilitation

### Before task 2 (3 min)

> Task 1 was using the loop on data. Task 2 is using the loop on
> *3D scientific code* — you're going to ask the agent to build a
> 3D finite-element solver from scratch in `scikit-fem`. No starter
> code. No skeleton. Just the physics, the materials, and the
> library.
>
> This is where chat sessions completely fall apart. The agent will
> write 150–300 lines, hit a NaN or a singular matrix or a wrong
> sign, diagnose, fix, validate against the analytical 1-D limit,
> compute stresses, write a brief — sustained over 40+ tool calls.
> Every one of those rounds would be a copy-paste in a chat window.
>
> The reference answers are: peak T ≈ 344 K on centerline at z = 0,
> peak von Mises ≈ 22 MPa in copper near the interface, σ_xx jump
> across the interface ≈ 24 MPa on centerline (silicon in tension,
> copper in compression), 95 % steady state at interface ≈ 0.86 s.
> If your agent's numbers are wildly off, push back — don't accept
> a smooth-looking plot with the wrong physics.

### What to watch for and call out

- **First subdomain-split assembly.** When the agent decides to
  split elements by z centroid and assemble K, M on each material
  separately — pause and call it out. "This is where the two
  materials become two materials in the math, not just in the
  notes."
- **First NaN, wrong-sign, or singular matrix.** "Watch — the agent
  saw it, didn't ask you, and went back to fix it." This is the loop
  in its purest form.
- **First validation against the 1-D analytical limit.** Centerline
  T should be piecewise linear with slope ratio k_Cu/k_Si ≈ 2.71.
  When the agent compares numerical to analytical and they agree —
  that's the moment that distinguishes a real solver from a
  confident-looking fake one.
- **Recognising the σ_xx interface jump.** The agent should comment
  on the sign pattern (Si in tension, Cu in compression) and why
  it's physical (copper wants to expand 6× more than silicon but
  is bonded to it). This is real physics reasoning.

### Expected behaviours on `gpt-5.4-mini`

Strong points:
- Picks `scikit-fem` if pointed at the venv install.
- Derives the weak forms correctly on first try.
- Uses subdomain-split assembly for the two materials after at most
  one wrong attempt.
- Validates steady-state by hand calculation.

Watch for (in approximate order of likelihood):
- **scikit-fem API confusion** — `condense` returns 4 values, dof
  indexing on vector fields uses component names like `u^1`, etc.
  See `task2_hints.md` for the specific patterns.
- **Wrong heat-flux sign at z = 0** — T decreases at hot end.
  Common bug across all FEM frameworks.
- **Single-conductivity assembly** — slope kink missing in plot.
  Push toward subdomain-split.
- **Missing top-face clamp** — singular stiffness matrix on
  mechanical solve.
- **Smooth stress plot hiding interface jump** — push toward
  per-element rendering with `shading='flat'` or two separate
  segments.

## Debrief prompts (5 min)

1. **"In task 1, how many tool calls did the agent make? In task 2?"**
   Task 1 is usually 20–40; task 2 is 40–80. That's how many
   copy-pastes you'd have done in a chat session.
2. **"Which anomalies (task 1) or bugs (task 2) did the agent
   diagnose unprompted, and which did you have to point at?"**
   Calibrates trust honestly.
3. **"In task 2, did your agent validate against the analytical
   steady state? Or did it just plot the curves and call it done?"**
   This is the discipline question — separates a solver from a
   confident-looking fake.
4. **"What would you not trust this setup for yet?"** Let participants
   name their own limits. Good answers: anything irreversible, shared
   infra, anything you can't verify cheaply.
5. **"What's a task in your own work shaped like task 2 — derive,
   code, debug, validate, report?"** That's the take-home for the
   computational scientists in the room.

## Whole-room fallback: facilitator demo mode

If most of the room is stuck on task 1 or task 2, run it on the
projector and narrate.

For task 1, show: the merge, `df.describe()` exposing the negative
value and NaN, one iteration on a plot, the regression with held-out
R², the report.

For task 2, show: the agent writing the discretisation, hitting a
NaN, fixing the BC sign bug, plotting, validating against steady
state, computing the stress jump. Even watching, participants get
the loop intuition.

## Closing (~2 min)

> The agent pattern doesn't change with the model — prompt → tool
> call → observe → next step. What changes with a stronger model is
> *how often you have to step in*. On `gpt-5.4-mini` you stepped in
> maybe 2–4 times in task 1 and 5–10 times in task 2. With a frontier
> model, fewer. With a small local model, every couple of minutes.
> Pick the model that matches the cost of being wrong on your task —
> and pick "verify the output" and "compare to an analytical limit"
> as permanent habits regardless of model.
