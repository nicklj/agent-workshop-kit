# IHPC agent workshop kit

Hands-on workshop teaching agentic AI for research workflows, using
**OpenCode** + OpenAI's **gpt-5.4-mini** via API.

US$5 of API credit covers the whole workshop with room to spare.

## File map

```
workshop/
├── README.md                       # this file
├── facilitator_notes.md            # 90-min schedule, talking points, debrief
├── task1_solution.md               # task 1 walkthrough (facilitator only)
├── task1_hints.md                  # task 1 escalating hints
├── task2_solution.md               # task 2 reference findings (facilitator only)
├── task2_hints.md                  # task 2 escalating hints
├── task3_solution.md               # task 3 reference findings (facilitator only)
├── task3_hints.md                  # task 3 escalating hints
├── task3_reference_solver.py       # facilitator-only reference (~200 lines, scikit-fem)
├── task0_kit/                      # task 0 — setup walkthrough
│   └── SETUP.md
├── task1_kit/                      # task 1 — given to each participant
│   ├── PARTICIPANT.md
│   ├── benchmark_plot.py           # broken script (3 surface bugs + 1 subtle)
│   └── benchmark_results.csv       # sparse-solver strong-scaling data (1 row "diverged")
├── task2_kit/                      # task 2 — given to each participant
│   ├── BRIEF.md
│   ├── designs_parameters.csv      # 200 design parameters
│   └── designs_results.csv         # 199 simulated results (1 row missing on purpose)
└── task3_kit/                      # task 3 — given to each participant
    ├── BRIEF.md
    └── materials.json              # silicon + copper properties; agent writes the solver
```

## The four tasks at a glance

### Task 0 — setup (~25 min, human-driven)

Walk every participant through: create an OpenAI account → top up $5
→ generate an API key → install `uv` and create `~/.venv` → install
OpenCode → point OpenCode at the API key and `gpt-5.4-mini` → put
`~/.venv/bin` on `PATH` → smoke-test one tool call.

Full step-by-step in `task0_kit/SETUP.md`.

### Task 1 — warmup: "fix the broken solver benchmark" (~15 min)

A broken Python script + a slightly dirty CSV from a sparse-linear-
solver strong-scaling sweep (matrix dimension × MPI rank count).
Three surface bugs (wrong filename, wrong column name, one row with
`solve_time_s = "diverged"`) followed by one **subtle correctness
bug**: the speedup formula is inverted, so the script runs cleanly
but reports physically-impossible strong-scaling speedups (< 1.0 for
parallel runs).

The point isn't the bugs — it's the *distinction* between "exits 0"
and "is correct". A chatbot can't run the script to notice. An agent
can — if told to verify. On `gpt-5.4-mini` you'll see two groups of
participants split by whether their prompt included "verify the
output." Surface that split in debrief.

### Task 2 — main: "thermal-aware packaging design exploration" (~40 min)

Two CSVs from a 200-design parametric thermal sweep (GPU + HBM on
interposer, varying cooling method, stack height, positions,
interposer size). The agent must:

- join the two tables on `design_id`
- catch three planted data quality issues (negative wire length, NaN
  temperature, missing design)
- find the Pareto-optimal designs on (max temperature, total wire
  length)
- extract design rules ("12-layer stacks need cold plate or immersion")
- **fit and cross-validate a regression model** for max_temperature_c,
  quote coefficients, justify the design rules quantitatively
- write a short engineering memo

The predictive model + train/test split is the new ambition — it's
the kind of task where a chat session falls apart (multi-file data
join, plus iterative cleaning, plus model fitting, plus held-out
evaluation, plus written defense). The agent treats all of it as
routine.

### Task 3 — deep: "build a 3D transient thermomechanical FEM solver" (~60–90 min)

A 5 × 5 × 10 mm bonded silicon-on-copper brick with a fixed heat
flux on the silicon face, fixed cold-side temperature on the copper
face, adiabatic lateral faces, and the top face mechanically
clamped. **No solver is provided.** The agent must build a 3D
finite-element solver in `scikit-fem` from scratch:

- structured tet mesh, two material subdomains in z
- transient heat equation with implicit Euler
- steady-state linear elasticity with thermal load
- validation against the 1-D analytical centerline limit
- output: T slice, T(t) at centerline probes, von Mises slice,
  statistical report (peak T, peak σ_vm, interface σ_xx jump, time
  to 95 % steady state)

This is the deepest demo in the workshop. The point is the
*long-horizon dev loop* — write ~200 lines, hit a NaN or a wrong
sign or a singular matrix, diagnose, fix, validate against an
analytical limit, post-process, write a memo — sustained over
40–80+ tool calls. A chat session falls apart well before the end.

A reference implementation lives at `task3_reference_solver.py` for
facilitators only — run it yourself first to confirm scikit-fem is
working on your machine.

Heads-up: task 3 is genuinely long. With all four tasks at full
depth this is a 3-hour workshop (Schedule C in `facilitator_notes.md`).
For 90 minutes, drop task 1 and clip task 2's stretch (Schedule A).

## Why this set of tasks

- **Task 0** removes the friction. Everyone arrives at the agent
  tasks with the same tool, same model, same Python env.
- **Task 1** showcases the read–run–fix–rerun loop *and* the
  verify-output discipline that distinguishes agent users from chatbot
  users.
- **Task 2** showcases multi-file EDA + predictive modelling +
  cross-validation on a dataset too big to paste into a chat window.
- **Task 3** showcases long-horizon code generation, numerical
  debugging, and validation against analytical limits — the kind of
  workflow a chatbot can't sustain for 30+ steps.
- All three are researcher-relevant and produce verifiable artifacts
  on disk.

## Distributing the kit

Each participant copies the relevant kit folder to a fresh directory
and `cd`s in before launching OpenCode. They should not see the
solution/hints files or the other task's kit.

```bash
# Task 0 — already in front of them
cd workshop/task0_kit && less SETUP.md

# Task 1 warmup
cp -r workshop/task1_kit ~/agent_task1
cd ~/agent_task1
opencode

# Task 2 main
cp -r workshop/task2_kit ~/agent_task2
cd ~/agent_task2
opencode

# Task 3 deep
cp -r workshop/task3_kit ~/agent_task3
cd ~/agent_task3
opencode
```

## Pre-flight check

Run every task you intend to keep yourself with `gpt-5.4-mini` the
day before. Note:

- Wall-clock time per task
- Whether the agent catches bug 4 (task 1 inverted speedup) unprompted
- Whether the agent catches the negative wire length (design 23) in
  task 2 unprompted
- Whether task 2 produces a valid predictive model with R² ≥ 0.85 on
  the held-out split
- Whether task 3 reaches the correct numbers within tolerance:
  peak T ≈ 344 K on centerline, peak σ_vm ≈ 22 MPa in copper near
  interface, σ_xx interface jump ≈ 24 MPa, t_95 ≈ 0.86 s
- Whether scikit-fem installed cleanly in `~/.venv` — run
  `task3_reference_solver.py` yourself first to confirm
- Whether file-edit, CSV-read, and `python -c …` tool calls are clean

Budget check: total token cost for all three tasks per participant on
gpt-5.4-mini is well under $2. The $5 cap is a generous safety margin
even with the longer task 3 trajectory.

## Fallbacks

- **Fast finishers:** stretch goals are in each `BRIEF.md` /
  `PARTICIPANT.md`.
- **Stuck participants:** `task{1,2,3}_hints.md`.
- **Whole-room stuck:** facilitator demo mode — see
  `facilitator_notes.md`.
