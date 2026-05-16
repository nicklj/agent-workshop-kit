# Task 2 solution walkthrough (facilitator only)

This is what's actually in the dataset and what a competent analysis
should surface. Use it to assess whether each participant's agent did
real work or produced plausible-sounding fluff.

## Dataset shape

- `designs_parameters.csv`: 200 rows, 10 columns
- `designs_results.csv`: 199 rows (design 156 absent), 4 columns
- Merge on `design_id`. After left-join from parameters → results:
  - 1 row with `max_temperature_c = NaN` (design 89, status `sim_failed`)
  - 1 row with no result at all (design 156)

## Planted anomalies (the agent should find these)

| Design | What's wrong | Why |
|--------|--------------|-----|
| 23     | `total_wire_length_mm = -34.2` but `status = ok` | data entry error — physically impossible |
| 89     | `max_temperature_c` is NaN, `status = sim_failed` | simulation didn't converge |
| 156    | absent from results CSV | sweep didn't complete this design |

A good agent flags these in EDA *before* running statistics. A weaker
one will compute means over NaN-poisoned columns and silently drop the
negative wire length without commenting.

## Naturally-occurring features

| Status | Count | Meaning |
|--------|-------|---------|
| ok | 130 | feasible designs |
| thermal_violation | 60 | max_temperature_c > 105 °C |
| geometry_error | 8 | HBM placement overlaps GPU footprint |
| sim_failed | 1 | the planted NaN row |

## Expected design rules

**Thermal violation rate by cooling method:**
- air: 68 %
- cold_plate: 4 %
- immersion: 0 %

**Thermal violation rate by (cooling, stack_layers):**

| | 4-layer | 8-layer | 12-layer |
|--|--|--|--|
| air | 50 % | 69 % | **87 %** |
| cold_plate | 0 % | 5 % | 4 % |
| immersion | 0 % | 0 % | 0 % |

**Headline rule:** 12-layer stacks are essentially infeasible with air
cooling (only 13 % succeed). For 12-layer stacks, cold plate or
immersion is required.

## Pareto-optimal designs (computed reference)

After dropping anomalies (status == ok, wire length > 0), sorting by
temperature and keeping non-dominated points:

| design_id | max_temp (°C) | wire length (mm) |
|-----------|--------------|------------------|
| 44  | 42.5  | 239.8 |
| 107 | 47.6  | 230.2 |
| 190 | 48.5  | 218.3 |
| 105 | 48.6  | 183.1 |
| 196 | 54.8  | 182.6 |
| 65  | 54.8  | 174.6 |
| 29  | 64.3  | 170.5 |
| 71  | 71.3  | 165.4 |
| 92  | 103.8 | 159.4 |

Agent results may differ slightly. Look for ~9 ± 2 designs from the
bottom-left of the temp/wire scatter, with a sensible tradeoff. If you
see 50 or 1, push back.

## Predictive model — expected results

Recipe: clean to `status == ok` + drop NaN + drop negative wire. Add
derived features `total_power_w = gpu_power_w + stack_layers *
hbm_power_w_per_layer` and `hbm_gpu_dist_mm` (Euclidean distance
between centres). One-hot encode `cooling_method`. Linear regression,
80/20 train/test, `random_state=42`.

**Expected metrics:**
- Test R² ≈ **0.93**
- Test MAE ≈ **3 °C**
- Train R² ≈ 0.96

**Expected coefficients (sign matters more than exact value):**

| Feature | Coefficient | Interpretation |
|---------|-------------|----------------|
| cooling_method_air | **+28.6** | air cooling is the dominant heat penalty |
| cooling_method_immersion | **−23.9** | immersion is a dominant cooling benefit |
| cooling_method_cold_plate | −4.7 | mid-tier |
| interposer_size_mm | −0.41 °C/mm | bigger interposer is cooler |
| hbm_gpu_dist_mm | −0.27 °C/mm | further apart is cooler (less thermal coupling) |
| total_power_w | +0.07 °C/W | obvious, but small per-watt |
| stack_layers | ≈ 0 | already accounted for via total_power_w |

If the agent quotes these (within rough tolerance) and points out the
sign sanity-checks, it's done a real analysis. If the agent skips the
model or returns R² < 0.5 without explanation, the cleaning step was
wrong (probably didn't filter to status == ok, or didn't drop NaN).

## What separates a good run from a weak run

- **Excellent:** flags anomalies early, joins on design_id, filters
  to clean rows, computes Pareto front, fits regression, validates on
  hold-out, quotes coefficients with sign check, ties model results
  back to the design rules.
- **Adequate:** gets to a Pareto front and design rules, but the
  predictive model is either missing or fit on dirty data (R² too low
  or too suspiciously high).
- **Weak:** runs `.describe()` on the merged frame including NaN /
  negative values. No anomaly call-out. This is the chatbot answer.

## Why this beats a chatbot

1. **Multi-file join.** Pasting two 200-row CSVs into chat is
   miserable; the agent reads them in two tool calls.
2. **Iterative EDA.** Each round is a tool call, not a copy-paste
   loop.
3. **Producing artifacts.** plot.png, top_designs.csv, report.md
   land on disk ready to attach to a real memo.
4. **Cross-validation.** Train/test split and held-out metrics are
   trivial here; in chat each step is a paste-back round.
5. **Self-verification.** The agent can re-query its Pareto set, can
   re-run the regression on a different split, can check that
   coefficients match the group means. Chat can't.
6. **Cheap follow-ups.** Stretch goals in BRIEF.md are one extra
   prompt each. In chat, every one means re-uploading data and
   re-establishing context.
