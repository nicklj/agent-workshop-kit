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

- A laptop (macOS or Linux preferred; Windows works via WSL but is
  rougher — flag in advance if that's you).
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
   you trust (we'll move it into a shell env var on workshop day).

> If you'd prefer not to charge $5 to a personal card, reply to this
> email — I have a small number of pre-funded keys we can hand out at
> the door.

> Free-tier credits don't work for API calls. You need the $5 top-up
> on a real card. The first prompt with an empty wallet returns a
> confusing 429-like error.

## Step 2 — install `uv` and create the workshop Python env (~5 min)

We standardise on `~/.venv` so everyone has identical pandas /
matplotlib / scikit-learn / scikit-fem versions.

macOS / Linux:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv venv ~/.venv --python 3.12
source ~/.venv/bin/activate
```

Then install the pinned dependencies (download
[`requirements.txt`](./requirements.txt) from the workshop kit and
run from the folder containing it):

```bash
uv pip install -r requirements.txt
```

Verify everything imports:

```bash
~/.venv/bin/python -c "import pandas, matplotlib, sklearn, skfem; print('ok')"
```

You should see `ok`. If you see an `ImportError`, reply with the
full error message.

## Step 3 — put `~/.venv/bin` on your PATH (~2 min)

So that any Python the agent runs uses the workshop environment, add
this to your shell rc file (`~/.zshrc` on macOS, `~/.bashrc` on
Linux):

```bash
echo 'export PATH="$HOME/.venv/bin:$PATH"' >> ~/.zshrc
echo 'export OPENAI_API_KEY="sk-..."' >> ~/.zshrc
source ~/.zshrc
```

Replace `sk-...` with the key from step 1. Verify:

```bash
which python
# should print /Users/<you>/.venv/bin/python
echo $OPENAI_API_KEY | head -c 7
# should print "sk-" followed by 4 chars (don't paste the whole key)
```

## What we'll do in the room

- ~10 min: install OpenCode + smoke-test that the agent can read,
  write, and run Python.
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
