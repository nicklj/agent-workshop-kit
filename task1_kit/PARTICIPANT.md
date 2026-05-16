# Task 1: fix the broken solver benchmark (~15 minutes)

## The story

A junior colleague has handed you two files:

- `benchmark_plot.py` — a Python script that's *supposed* to plot
  solve times from a sparse linear solver benchmark, write a summary,
  and report parallel (strong-scaling) speedup at the largest matrix.
- `benchmark_results.csv` — the raw timings from a sweep of matrix
  dimensions × MPI rank counts.

They said "it doesn't work" and walked away. You don't have time to
debug it yourself today — let the agent do it.

## Your job

Open this folder in OpenCode and prompt it with something like:

> Make `benchmark_plot.py` work. It should produce `plot.png` and
> `summary.md` from the CSV in this folder. Run it, see what goes
> wrong, fix it, re-run. When it finishes without error, **read the
> output and confirm the numbers make physical sense** before
> declaring it done.

That last sentence matters. Don't omit it.

## Ground rules

1. **Don't read the script yourself first.** Delegate. You can peek
   after the agent finishes.
2. **Don't manually fix bugs.** If the agent gets stuck, give it a
   hint in plain English. Don't open the editor yourself.
3. **A clean run is not the same as a correct run.** A script that
   exits 0 can still be wrong. Verifying that the *output* makes
   physical sense is part of the job.

## Success criteria

- [ ] `plot.png` in this folder showing solve time vs matrix dimension
- [ ] `summary.md` with a mean solve time, the fastest run, and
      strong-scaling speedup values that **make physical sense**
      (think: what should speedup look like as you add MPI ranks?)
- [ ] No manual edits made by you

## Stretch goals (if you finish early)

Ask the agent to:

- Add a second plot showing solve time vs MPI rank count at the
  largest matrix dimension (log–log axes)
- Compute parallel efficiency (speedup / n_ranks) and identify where
  it falls below 0.5
- Re-run from a fresh shell and confirm the artifacts regenerate
  cleanly

## Reflection (we'll talk about these at the end)

- How many tool calls did the agent make? Roughly count.
- Did the agent verify its own output, or did you have to ask?
- Which step would have been most painful in a chat-only ChatGPT
  window?
- What would change if the dataset were 200 separate CSVs from
  different solver configurations instead of one?
