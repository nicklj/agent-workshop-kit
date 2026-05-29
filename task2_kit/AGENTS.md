# Workshop environment rule

For everything in this project, always run Python from the **workshop
virtual environment** — never the system Python or pip.

- **macOS / Linux:** run Python as `$WORKSHOP/.venv/bin/python`
  (and `$WORKSHOP/.venv/bin/python -m pip` for installs).
- **Windows (PowerShell):** run Python as
  `$env:WORKSHOP\.venv\Scripts\python.exe` (and the same with `-m pip`
  for installs).

`WORKSHOP` is an environment variable pointing at the workshop kit
folder; the shell expands it when you run the command. Confirm with
`echo "$WORKSHOP"` (macOS / Linux) or `echo $env:WORKSHOP` (Windows)
before running Python if a command ever fails.

