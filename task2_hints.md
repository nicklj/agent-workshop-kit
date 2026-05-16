# Task 2 escalating hints (facilitator playbook)

Use these when a participant's agent stalls. Walk down the ladder.

## If the agent doesn't load the data

- **Hint 1:** "Tell it to list the files in the folder."
- **Hint 2:** "Have it read the headers of both CSVs first, then
  load them with pandas."

## If it doesn't join the two tables

- **Hint 1:** "Are you working from one table or two? What identifier
  links them?"
- **Hint 2:** "Tell the agent to merge `designs_parameters.csv` and
  `designs_results.csv` on `design_id`."

## If it ignores anomalies and just runs `.describe()`

- **Hint 1:** "Before computing averages — does the data look clean?
  Any negative values that shouldn't be? Any missing rows?"
- **Hint 2:** "Have it count rows after the merge. Are all 200
  designs represented? What about NaNs?"
- **Hint 3:** "There are at least three data quality issues planted
  in this dataset. Find them before recommending designs."

## If it can't define "Pareto-optimal"

- **Hint 1:** "What does Pareto-optimal mean for two objectives?"
- **Hint 2:** "A design is Pareto-optimal if no other design has both
  lower temperature *and* shorter wire length. Compute the
  non-dominated set."
- **Hint 3:** "Sort by temperature ascending. Walk the list keeping a
  running minimum of wire length. Each row that beats the running
  minimum is Pareto-optimal."

## If recommendations include thermal_violation or sim_failed designs

- **Hint:** "Should you be recommending designs that the simulator
  marked as failed or violating? Filter first."

## If the recommendation list has 50+ "Pareto-optimal" designs

- **Hint:** "How many designs can be Pareto-optimal? It should be a
  small set on the lower-left frontier. If you're getting 50, you're
  not filtering correctly."

## If the agent skips the predictive model entirely

- **Hint 1:** "The brief requires a predictive model. Have it fit a
  linear regression for max_temperature_c."
- **Hint 2:** "Use sklearn LinearRegression. Train/test split 80/20.
  Report R² and MAE on the test set."

## If the regression has R² < 0.5

The agent fit on dirty data.

- **Hint:** "What rows are in your training set? If the model is
  fitting NaNs, thermal_violation designs, or the negative wire row,
  that's why R² is low. Clean first, then fit."

## If R² is suspiciously above 0.99

The agent leaked the target into the features (e.g., used `status`
as an input, or fit on data including the test set).

- **Hint:** "Are you sure your train and test sets are disjoint? What
  features did you include? Did `status` or `total_wire_length_mm`
  end up in the predictors?"

## If the report has no numbers

- **Hint:** "Recommendations need to be defensible. Quote the
  thermal-violation rate by cooling method. Quote the model's R² and
  the cooling coefficient. A reader should be able to argue with the
  conclusions."

## If the plot is a mess (no labels, no Pareto overlay)

- **Hint:** "Re-do the plot with axis labels, a title, and the
  Pareto-optimal points highlighted in a different colour."
- Teaching moment: in a chat session you'd describe the bad plot in
  words and hope. Here you can iterate.

## If the model loops or thrashes

- Restart with a tighter prompt. Paste the *current* CSV head and ask
  for *one specific next step*, not the whole analysis.

## Whole-room stuck

Switch to demo mode. Run the analysis on the projector and narrate.
Even watching, participants get the loop intuition.
