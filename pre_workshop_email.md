# Pre-workshop email — agentic AI hands-on

Send this 3–4 days before the workshop. The goal: get every participant
through OpenAI account + billing + API key **before** they walk in, so
in-room Task 0 is just OpenCode install + smoke test (~10 min instead
of 25). That gives the hands-on tasks the breathing room they need.

---

**Subject:** Action required before our agentic AI workshop — ~20 min of prep

Hi everyone,

Looking forward to the agentic AI hands-on session on **[DATE]**.
To make the most of our 2 hours together, please complete the items
below **before** you arrive. They're independent of each other, but
all three steps need to be done — if any one is blocked we can't get
to the hands-on part.

If you hit a wall on any step, reply to this email and we'll sort it
out before the workshop, not in the room.

## What you need to bring

- A laptop. macOS, Linux, and Windows are all supported — Windows
  steps below use PowerShell (no WSL required).
- The ability to install command-line tools (admin rights or
  equivalent).
- ~20 minutes for the prep below.

## Step 1 — OpenAI account + US$5 credit (~10 min, **start this first**)

This is the slowest step because OpenAI runs a phone verification on
new accounts that can take 5+ minutes to clear.

1. Sign up: <https://platform.openai.com/signup>
2. Open the billing page:
   <https://platform.openai.com/settings/organization/billing>
3. Click **Add to credit balance** and top up **US$5**. The whole
   workshop costs well under $2 per participant — $5 is a generous
   margin.
4. Open the **API keys** page:
   <https://platform.openai.com/api-keys>
5. **Create new secret key**, name it `workshop`, and **copy the key
   immediately** — OpenAI won't show it again. Paste it into a note
   you trust — you'll hand it to OpenCode on workshop day.

> If you'd prefer not to charge $5 to a personal card, reply to this
> email — I have a small number of pre-funded keys we can hand out at
> the door.

> Free-tier credits don't work for API calls. You need the $5 top-up
> on a real card. The first prompt with an empty wallet returns a
> confusing 429-like error.

## Step 2 — install `uv` and create the workshop Python env (~5 min)

We use a **project-local** `.venv` *inside the workshop folder* —
**not** in your home directory — so this can't disturb any Python
environment you already have. Deleting the workshop folder afterwards
removes it cleanly.

First, unpack the workshop kit anywhere and point `WORKSHOP` at it.
Every command below uses it, so they're identical for everyone
regardless of where you put the kit. Persist it so new terminals see
it.

**macOS / Linux** (referenced as `$WORKSHOP`):

```bash
echo 'export WORKSHOP="/path/to/workshop"' >> ~/.zshrc   # edit the path
source ~/.zshrc
ls "$WORKSHOP/requirements.txt"   # should exist

curl -LsSf https://astral.sh/uv/install.sh | sh
cd "$WORKSHOP"               # the folder containing requirements.txt
uv venv .venv --python 3.12
uv pip install -r requirements.txt
```

**Windows (PowerShell)** (referenced as `$env:WORKSHOP`; `setx`
persists to future terminals, so also set it for the current one):

```powershell
setx WORKSHOP "C:\path\to\workshop"     # edit the path
$env:WORKSHOP = "C:\path\to\workshop"
Test-Path "$env:WORKSHOP\requirements.txt"   # should print True

powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
cd $env:WORKSHOP
uv venv .venv --python 3.12
uv pip install -r requirements.txt
```

(`requirements.txt` ships in the workshop kit with pinned versions.
`uv pip install` targets the `.venv` in the current folder — no
activation needed.)

## Step 3 — confirm the workshop Python works (~2 min)

Verify the packages import by calling the venv's Python directly (this
is exactly how the agent will run Python on the day — no activation,
no PATH changes):

**macOS / Linux:**

```bash
"$WORKSHOP/.venv/bin/python" -c "import pandas, matplotlib, sklearn, skfem; print('ok')"
```

**Windows (PowerShell):**

```powershell
& "$env:WORKSHOP\.venv\Scripts\python.exe" -c "import pandas, matplotlib, sklearn, skfem; print('ok')"
```

You should see `ok`. If you see an `ImportError`, reply with the full
error message.

You don't need to do anything else with your API key before the day —
we'll add it to OpenCode interactively in the room (`opencode auth
login`) and point the agent at this venv. Just keep the key from
step 1 handy.

## What we'll do in the room

- ~10 min: install OpenCode, log in with your API key (`opencode auth
  login`), select the `gpt-5.4-mini` model, and smoke-test that the
  agent can read, write, and run Python. (The task kits already include
  a rule that points the agent at the workshop venv.)
- ~30 min: Task 1 — hand the agent a 200-design parametric sweep
  and have it produce an engineering memo with a validated
  predictive model. Real dataset, planted data quality issues.
- ~60 min: Task 2 — hand the agent a brief for a 3D transient
  thermomechanical FEM solver and watch it build one from scratch.
  No starter code. The long-horizon dev loop is the demo.
- ~10 min: debrief.

## If anything in steps 1–3 is unclear

Reply now, not on the day. A 10-minute fix the day before saves us
a 30-minute scramble in the room.

See you on **[DATE]**.

— [your name]
