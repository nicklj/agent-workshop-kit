# Task 1 escalating hints (facilitator playbook)

When a participant's agent gets stuck, walk down the ladder. Don't
skip to the bottom — the point is to coach the model, not bypass it.

## If the agent is just sitting there / not calling tools

- **Hint 1:** "Tell it to run the script."
- **Hint 2:** "Tell it explicitly: use the shell tool to run
  `python benchmark_plot.py`."
- **Hint 3:** Restart with a tighter prompt:
  *"Run benchmark_plot.py. If it errors, read the error, edit one
  line, re-run. Repeat. When it succeeds without error, read the
  output and verify it makes physical sense."*

## If stuck on bug 1 (FileNotFoundError)

- **Hint 1:** "What files actually exist in this folder?"
- **Hint 2:** "List the directory and compare to the filename in the
  script."

## If stuck on bug 2 (KeyError: 'solve_time')

- **Hint 1:** "What columns does the CSV actually have?"
- **Hint 2:** "Read the first line of the CSV and compare to the
  column the script asks for."

## If stuck on bug 3 (TypeError on mean / 'diverged')

- **Hint 1:** "What does the error say about the data type?"
- **Hint 2:** "One row in the CSV has the value `diverged` in the
  solve-time column. That makes the whole column non-numeric."
- **Hint 3:** "Filter out rows where `solve_time_s == 'diverged'`
  before computing statistics, then convert to float."

## If the agent declares victory after bug 3 but the speedups are wrong

This is the *whole point* of bug 4. Don't reveal it directly — coach
the participant into asking the agent to verify.

- **Hint 1:** "Open `summary.md` yourself and read it. Do the
  speedup numbers make sense for a strong-scaling MPI benchmark?"
- **Hint 2:** "What should a strong-scaling speedup look like as you
  add more MPI ranks? Should it grow or shrink?"
- **Hint 3:** Then to the agent (via the participant):
  "The speedups are all less than 1, which means parallel is slower
  than serial. That contradicts the raw timings — T_1 = 47.1 s,
  T_8 = 11.2 s. Find the bug."
- **Hint 4 (if still stuck):** "Look at the speedup formula in the
  script. T_n / T_1 vs T_1 / T_n — which one is right?"

## If the agent loops (edits same line back and forth)

- Stop. Restart with a fresh context. Paste the *current* file state
  and the *exact* error, ask for a single targeted fix.

## If the model keeps hallucinating column names

- "Ask it to read the CSV header before doing anything else." This
  grounds the model in real data and usually unsticks it.

## When to give up and just demo it yourself

If 20+ minutes pass with no progress, switch to facilitator-driven
mode: run the agent yourself on the projector, narrate. Participants
still see the value — they just watch instead of drive.
