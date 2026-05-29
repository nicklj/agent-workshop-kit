# Task 0: setup (~25 minutes)

Everything you need to install and configure before the hands-on tasks
begin. Work through this in order. Ask if anything fails — don't push
past a broken step.

---

## Step 1 — get an OpenAI API key (optional, ~5 min)

**This step is optional.** OpenCode ships with several **free** models
you can use out of the box — no account, no key, no spend. If you're
happy using a free model, skip to step 2 and you'll pick one in step 4.

Do this step only if you want to run the workshop on OpenAI's
`gpt-5.4-mini` (the model these notes are tuned for). It needs an
account and **US$5** of credit (gpt-5.4-mini is cheap — $5 covers the
whole workshop with room to spare).

1. Go to https://platform.openai.com/signup and create an account (or
   sign in if you already have one).
2. Once logged in, open the **billing** page:
   https://platform.openai.com/settings/organization/billing
3. Click **Add to credit balance** and top up **US$5**.
4. Open the **API keys** page:
   https://platform.openai.com/api-keys
5. Click **Create new secret key**, name it `workshop`, and **copy the
   key now** — you won't be able to see it again. Paste it somewhere
   you trust temporarily (we'll hand it to OpenCode in step 4).

> Tip: OpenAI's free-tier credits will not work for API calls — top up
> with $5 of real credit. The first prompt with an empty wallet returns
> a 429-like error that looks confusing.

---

## Step 2 — install `uv` and create the Python environment (~3 min)

We create a **project-local** `.venv` *inside the workshop folder* —
not in your home directory. This keeps everyone's
pandas/matplotlib/scikit-learn versions identical for the workshop
**without touching any Python environment you already have.** When the
workshop is over, deleting the workshop folder removes the env
completely.

### Point `$WORKSHOP` at the kit

Unpack the workshop kit wherever you like, then set `WORKSHOP` to that
folder. Every command below — and in tasks 1 and 2 — uses it, so
they're identical for everyone regardless of where you put the kit.
Persist it so new terminals see it.

(`WORKSHOP` is just a path string. We'll use it to build the venv and
to tell OpenCode where the venv's Python is — see step 4.)

**macOS / Linux** — referenced as `$WORKSHOP`:

```bash
echo 'export WORKSHOP="/path/to/workshop"' >> ~/.zshrc   # edit the path
source ~/.zshrc
ls "$WORKSHOP/requirements.txt"   # should exist
```

**Windows (PowerShell)** — referenced as `$env:WORKSHOP`. `setx`
persists to *future* terminals, so also set it for the current one:

```powershell
setx WORKSHOP "C:\path\to\workshop"     # edit the path; persists to new terminals
$env:WORKSHOP = "C:\path\to\workshop"   # also set it for this terminal
Test-Path "$env:WORKSHOP\requirements.txt"   # should print True
```

### Install uv

**macOS / Linux:**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows (PowerShell):**

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Verify (either platform), opening a new terminal if `uv` isn't found:

```bash
uv --version
```

### Create the environment

`uv pip install` targets the `.venv` in the current folder
automatically — no activation needed.

**macOS / Linux:**

```bash
cd "$WORKSHOP"               # the folder containing requirements.txt
uv venv .venv --python 3.12
uv pip install -r requirements.txt
```

**Windows (PowerShell):**

```powershell
cd $env:WORKSHOP             # the folder containing requirements.txt
uv venv .venv --python 3.12
uv pip install -r requirements.txt
```

The pinned versions in `requirements.txt` are verified against the
Task 2 reference solver — don't install the packages loose, or a
future scikit-fem release can break the solver API mid-workshop.
(`scikit-fem` is for task 2; pandas / matplotlib / scikit-learn are
for task 1.)

Verify everything imports by calling the venv's Python directly (this
is exactly how the agent will run Python — see step 4):

**macOS / Linux:**

```bash
"$WORKSHOP/.venv/bin/python" -c "import pandas, matplotlib, sklearn, skfem; print('ok')"
```

**Windows (PowerShell):**

```powershell
& "$env:WORKSHOP\.venv\Scripts\python.exe" -c "import pandas, matplotlib, sklearn, skfem; print('ok')"
```

You should see `ok` printed. If not, stop and ask.

---

## Step 3 — install OpenCode (~3 min)

Pick whichever install method works on your machine:

| Platform | Method | Command |
|----------|--------|---------|
| macOS / Linux | Install script | `curl -fsSL https://opencode.ai/install \| bash` |
| macOS / Linux | Homebrew | `brew install sst/tap/opencode` |
| any (needs Node.js) | npm | `npm install -g opencode-ai` |

**Windows — two choices:**

- **npm:** `npm install -g opencode-ai`. Needs Node.js first — install
  from <https://nodejs.org> (LTS) if you don't have it (`node --version`
  to check). This gives you the same `opencode` CLI used below.
- **OpenCode Desktop:** download the desktop app from
  <https://opencode.ai> and install it. This is a GUI alternative — no
  Node.js needed. If you go this route, the CLI command examples below
  map to the app's UI (log in, pick a model, open a folder, chat).

Verify (CLI install):

```bash
opencode --version
```

If `opencode` isn't on your PATH: on macOS / Linux the install script
may have put the binary in `~/.opencode/bin` or `~/.local/bin` — add
that to your shell's `PATH` and re-open the terminal. On Windows, open
a new terminal so the npm global bin directory is picked up.

---

## Step 4 — pick your model (~3 min)

You have two options:

- **Option A — free model:** use one of OpenCode's built-in free
  models. No key needed — skip straight to "Select the model" below.
- **Option B — OpenAI key:** set up the API key you created in step 1
  to run `gpt-5.4-mini` (the model these notes are tuned for).

Everything is done through OpenCode's own interface — no config files,
no environment variables to edit.

### Option B only — add your API key (`opencode auth login`)

*Skip this if you're using a free model.* Run this and follow the
prompts (same command on macOS, Linux, and Windows PowerShell):

```bash
opencode auth login
```

1. Use the arrow keys to select **OpenAI** from the provider list.
2. Choose the **API Key** method.
3. Paste the key from step 1 and press Enter.

OpenCode stores the key in its own credential store, so you don't need
the `OPENAI_API_KEY` environment variable. Confirm it's registered:

```bash
opencode auth list
# should list "openai"
```

> Fallback: if `opencode auth login` gives you trouble, OpenCode also
> reads an `OPENAI_API_KEY` environment variable if one is set.

### Select the model

OpenCode remembers the last model you picked, so set it once via the
TUI. Launch OpenCode in any folder:

```bash
opencode
```

Open the model picker — type `/models` and press Enter (or use the
model-switch keybind shown in the footer; `/help` lists the commands):

- **Free model:** pick one of the free models OpenCode lists (they're
  labelled in the picker). Good enough to do both tasks.
- **OpenAI key:** choose **OpenAI → `gpt-5.4-mini`** (the model these
  notes are tuned for). One-shot alternative: launch directly with
  `opencode --model openai/gpt-5.4-mini`.

Your choice persists for next time — the active model shows in the TUI
footer.

### How OpenCode knows to use the workshop Python

Rather than activating the venv in every terminal, the agent gets a
standing instruction: **always run Python from the workshop venv.**
OpenCode reads a project `AGENTS.md` file from the folder it's launched
in, on every session. **Each task kit already ships with one** (see
`task1_kit/AGENTS.md` and `task2_kit/AGENTS.md`) that points the agent
at `$WORKSHOP/.venv/bin/python` (Windows: `…\.venv\Scripts\python.exe`).

So there's **nothing to create here** — when you `cd` into a copied
kit and run `opencode` (tasks 1 and 2), the agent reads that kit's
`AGENTS.md` and uses the workshop Python automatically. The only
requirement is that `$WORKSHOP` is set in the terminal you launch
OpenCode from (step 2) — the shell expands it when the agent runs a
command.

> **Fallback (only if needed):** if the agent ever runs bare `python`
> and an import fails, remind it in chat ("use the workshop venv Python
> from AGENTS.md"), or activate the venv as a hard guarantee:
> `source "$WORKSHOP/.venv/bin/activate"` (macOS / Linux) /
> `& "$env:WORKSHOP\.venv\Scripts\Activate.ps1"` (Windows).

---

## Step 5 — smoke test (~3 min)

In a fresh terminal (so `$WORKSHOP` is loaded), launch OpenCode in any
empty folder. This folder isn't a task kit, so it has no `AGENTS.md` —
we'll name the workshop Python explicitly in prompt #3 instead:

**macOS / Linux:**

```bash
mkdir ~/opencode_smoke && cd ~/opencode_smoke
opencode
```

**Windows (PowerShell):**

```powershell
mkdir $HOME\opencode_smoke; cd $HOME\opencode_smoke
opencode
```

When the agent prompts you, ask it three things in sequence — make
sure each one actually executes:

1. **"List the files in this folder."**
   It should call a shell/list tool and report that the folder is
   empty.
2. **"Create a file called `hello.txt` with the text 'hello workshop'."**
   It should write the file. Then in another terminal confirm it:
   `cat ~/opencode_smoke/hello.txt` (macOS / Linux) or
   `type $HOME\opencode_smoke\hello.txt` (Windows PowerShell).
3. **"Run `$WORKSHOP/.venv/bin/python -c 'import pandas;
   print(pandas.__version__)'` and tell me the version."** (Windows:
   `& "$env:WORKSHOP\.venv\Scripts\python.exe" -c "..."`.) It should
   execute, capture stdout, and report a version number.

If any of these fail — *especially #3* — flag it now. The hands-on
tasks rely on the agent being able to run the workshop Python and see
its output.

---

## Step 6 — confirm you're ready

Tick off:

- [ ] `opencode --version` works (CLI install), or the OpenCode
      Desktop app opens
- [ ] A model is active and shown in the TUI footer — a free model, or
      `gpt-5.4-mini` if you set up an OpenAI key
- [ ] *(OpenAI-key route only)* `opencode auth list` shows `openai`,
      and you can see your $5 balance on the OpenAI billing page
- [ ] `WORKSHOP` is set — macOS/Linux `echo "$WORKSHOP"`, Windows
      `echo $env:WORKSHOP` — prints the kit folder
- [ ] The venv's Python imports the packages — macOS/Linux
      `"$WORKSHOP/.venv/bin/python" -c "import pandas, matplotlib, sklearn, skfem"`;
      Windows `& "$env:WORKSHOP\.venv\Scripts\python.exe" -c "..."`
- [ ] Smoke test #3 returned a real version number (the agent ran the
      workshop venv Python)
- [ ] You understand the task kits carry an `AGENTS.md` that points
      the agent at `$WORKSHOP/.venv` — so tasks 1 and 2 need no setup

If all of these are checked, you're good for tasks 1 and 2.
