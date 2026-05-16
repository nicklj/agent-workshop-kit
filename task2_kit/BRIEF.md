# Task 2: thermal-aware packaging design exploration

## Background

You're advising a colleague who is choosing a 2.5D package layout for a
GPU + HBM module. They ran a parametric sweep over 200 candidate designs
varying:

- cooling method (air / cold plate / immersion)
- HBM stack height (4, 8, or 12 layers)
- GPU and HBM positions on the interposer
- interposer size
- per-die power

The simulator wrote two CSVs in this folder:

| File | Rows | What's in it |
|------|------|--------------|
| `designs_parameters.csv` | 200 | one row per design, all input parameters |
| `designs_results.csv`    | 199 | one row per design, simulated outputs |

Outputs include `max_temperature_c`, `total_wire_length_mm`, and a
`status` field set by the simulator.

## Your job

Hand the agent this brief and let it produce a short engineering memo
recommending which designs to take forward. The two figures of merit
are **max junction temperature** (lower is better, reliability) and
**total connection wire length** (lower is better, signal integrity
and cost).

Don't hand-hold the analysis. Let the agent decide what to look at.
A reasonable analysis would:

1. Join the two tables on `design_id`.
2. Sanity-check the merged data — anything missing, impossible, or
   out of bounds?
3. Characterise the design space (distributions, breakdown by
   cooling method and stack layers).
4. Identify Pareto-optimal designs in (temperature, wire length)
   space.
5. Extract design rules — e.g. *which cooling methods are required
   for 12-layer stacks?*
6. **Fit and validate a predictive model** for max_temperature_c
   (see below).
7. Write a short `report.md` with findings + `top_designs.csv`.

## Predictive model — required

After the EDA and Pareto analysis, the agent should:

- Fit a regression model predicting `max_temperature_c` from the
  design parameters. **A linear regression is fine — interpretable
  coefficients are the point.** One-hot encode the cooling method.
- Train on 80 % of the clean (status = ok, no anomalies) data,
  evaluate R² and mean-absolute-error on the held-out 20 %.
- **Quote the coefficients.** Which parameters matter most? Do the
  signs match physical intuition (more power → hotter; bigger
  interposer → cooler; better cooling → cooler)?
- Use the model to *justify the design rules quantitatively*: the
  rule "12-layer stacks need cold plate or immersion" should be
  defensible from the cooling coefficient, not just from group
  statistics.

## Deliverables

When the agent is done you should have, in this folder:

- [ ] `report.md` — engineering memo with findings, recommendations,
      design rules, and a "predictive model" section
- [ ] `top_designs.csv` — Pareto-optimal designs (~10 rows) recommended
      for follow-up
- [ ] At least one plot supporting the Pareto analysis (`.png`)
- [ ] An explicit list of data quality issues the agent found
- [ ] Held-out R² and MAE quoted in the report — *expect R² ≥ 0.85
      if the analysis is honest*

## Ground rules

- **Do not pre-filter the data for the agent.** Hand it raw. The
  point is to see whether it catches data quality problems on its own.
- **Do not look at the CSVs in detail before starting.** You'll
  unconsciously bias your prompts.
- **If the agent's recommendations look fishy, ask it to defend
  them.** "Which designs did you exclude and why?" is fair.
- **The predictive model is required, not stretch.** A memo without
  numerical defense for its rules is the chatbot answer.

## Stretch goals (if you have time)

Pick one after the main analysis is done:

- *"Constrain to air cooling only — what's the new Pareto front?"*
- *"What's the minimum interposer size where 12-layer stacks are
  feasible? Show the failure rate by (interposer_size, stack_layers)."*
- *"Use the predictive model to suggest 5 new design points to add
  to the sweep — pick points where the model is least certain or
  that would best extend the Pareto front."*
- *"Plot a 2D heatmap of mean max-temperature over (gpu_x, gpu_y) at
  5 mm resolution, for cold-plate designs only."*

Each of these would be a frustrating round trip in a chat-only
setup. Here it's one extra prompt.
