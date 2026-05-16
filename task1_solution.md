# Task 1 solution walkthrough (facilitator only)

Three surface bugs that throw errors, plus one subtle correctness bug
that doesn't. The pedagogical point of bugs 1–3 is the *loop*. The
point of bug 4 is *verification*: a clean exit is not the same as a
correct answer.

## Domain framing

The CSV is a strong-scaling sweep of a sparse linear solver:

| Column | Meaning |
|--------|---------|
| `run_id` | sequential id |
| `matrix_dim` | linear-system dimension (square sparse matrix) |
| `mpi_ranks` | MPI rank count (1, 2, 4, 8) |
| `solve_time_s` | wall-clock solve time |
| `peak_memory_mb` | peak resident memory across all ranks |
| `status` | `ok` or `diverged` |

Row 16 has `solve_time_s = diverged`, `status = diverged` — at 8
ranks the iterative solver lost numerical stability on the 50k matrix.
Realistic and common in real HPC sweeps.

## Bug 1 — wrong filename

**Line:** `df = pd.read_csv("data.csv")`

**Error:**
```
FileNotFoundError: [Errno 2] No such file or directory: 'data.csv'
```

**Fix:** rename to `benchmark_results.csv`.

**Teaches:** the agent reads error output, locates the wrong line,
edits one string. Trivial — but in a chat-only setup the participant
would copy the error back manually.

## Bug 2 — wrong column name

**Line:** `df = df.sort_values("solve_time")`

**Error:**
```
KeyError: 'solve_time'
```

**Fix:** change to `"solve_time_s"`.

**Teaches:** the agent has to *look at the data* — read the CSV
header — to find the real column name. Good moment to pause:
"watch — it's looking up the schema, not guessing."

## Bug 3 — dirty data

**Line:** `mean_time = df["solve_time_s"].mean()` (also breaks
`idxmin()`).

**Error (modern pandas, 2.x with PyArrow strings):**
```
TypeError: Cannot perform reduction 'mean' with string dtype
```
Older variants:
```
TypeError: unsupported operand type(s) for +: 'float' and 'str'
ValueError: could not convert string to float: 'diverged'
```

**Root cause:** row 16 has `solve_time_s = diverged`. The whole column
becomes object dtype, numeric ops crash.

**Acceptable fixes:**
- `df = df[df["solve_time_s"] != "diverged"]` then `.astype(float)`
- `df["solve_time_s"] = pd.to_numeric(df["solve_time_s"], errors="coerce")` then `.dropna(...)`
- `pd.read_csv("benchmark_results.csv", na_values=["diverged"])`

## Bug 4 — inverted speedup formula (subtle, NO ERROR)

**Line:**
```python
speedup = tn / t1
```

**What happens:** the script runs to completion and writes
`summary.md` containing:

```
## Strong-scaling speedup at matrix_dim=100000

- 2 MPI ranks: 0.60x
- 4 MPI ranks: 0.35x
- 8 MPI ranks: 0.24x
```

These numbers are physically impossible — strong-scaling speedup
should *increase* with rank count, not decrease, and a value below
1.0 means the parallel run is *slower* than serial. The raw data
clearly contradicts this: T_1 = 47.1 s, T_8 = 11.2 s; the 8-rank run
is ~4× faster, not 0.24× slower.

**Fix:** invert the formula — `speedup = t1 / tn`. Expected output:

```
- 2 MPI ranks: 1.66x
- 4 MPI ranks: 2.82x
- 8 MPI ranks: 4.21x
```

**What it teaches — and why it matters most:**

A chatbot will happily write a script with this exact bug. ChatGPT-
in-a-window can't *run* the script, so it can't notice that the
output makes no sense. The agent can — *if it's told to verify, or
if it's disciplined enough to do so on its own.*

On `gpt-5.4-mini` this bug splits the room into two groups:

1. Participants whose prompt included "verify the output is
   reasonable" — agent catches it, fixes it. **This is the demo.**
2. Participants who just said "make it work" — agent declares success
   on the broken output. Participant has to read `summary.md` and
   prompt again. **This is also the demo — the model's blind spot.**

Both outcomes are good teaching moments. Surface both in debrief.

## Why this task at this level

- **Three surface bugs (1–3):** structural (file), schema (column),
  data quality (`diverged` string). Maps to the bulk of real HPC
  data wrangling. Quick on a strong model — that's the warmup.
- **One subtle bug (4):** correctness without errors. The agent can
  verify; the question is whether you remember to ask for it.
- **Domain match:** the data tells a strong-scaling story that any
  HPC researcher will recognise. The bug 4 output (sub-unity speedup)
  is *obviously* wrong to this audience — the catch lands harder
  than it would with generic "runtime" numbers.
