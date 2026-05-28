# Task 0: setup (~25 minutes)

Everything you need to install and configure before the hands-on tasks
begin. Work through this in order. Ask if anything fails — don't push
past a broken step.

---

## Step 1 — get an OpenAI API key (~5 min)

1. Go to https://platform.openai.com/signup and create an account (or
   sign in if you already have one).
2. Once logged in, open the **billing** page:
   https://platform.openai.com/settings/organization/billing
3. Click **Add to credit balance** and top up **US$5**. Five dollars
   is enough for this whole workshop with room to spare —
   `gpt-5.4-mini` is cheap.
4. Open the **API keys** page:
   https://platform.openai.com/api-keys
5. Click **Create new secret key**, name it `workshop`, and **copy the
   key now** — you won't be able to see it again. Paste it somewhere
   you trust temporarily (we'll hand it to OpenCode in step 4).

> Tip: OpenAI's free tier credits will not work here — top up with $5
> of real credit. The first prompt with an empty wallet returns a
> 429-like error that looks confusing.

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

(`WORKSHOP` is just a path string — it does *not* change which Python
you get; only activating the venv does that.)

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

**macOS / Linux:**

```bash
cd "$WORKSHOP"               # the folder containing requirements.txt
uv venv .venv --python 3.12
source .venv/bin/activate
uv pip install -r requirements.txt
```

**Windows (PowerShell):**

```powershell
cd $env:WORKSHOP             # the folder containing requirements.txt
uv venv .venv --python 3.12
.venv\Scripts\Activate.ps1
uv pip install -r requirements.txt
```

> Windows: if PowerShell refuses to run `Activate.ps1` with an
> execution-policy error, run this once and retry:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. Or use
> `cmd.exe` and activate with `.venv\Scripts\activate.bat`.

The pinned versions in `requirements.txt` are verified against the
Task 2 reference solver — don't install the packages loose, or a
future scikit-fem release can break the solver API mid-workshop.
(`scikit-fem` is for task 2; pandas / matplotlib / scikit-learn are
for task 1.)

Verify everything imports — with the env active, plain `python` is
now the workshop env:

```bash
python -c "import pandas, matplotlib, sklearn, skfem; print('ok')"
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

**Windows:** use the npm method (`npm install -g opencode-ai`). It
needs Node.js first — install from <https://nodejs.org> (LTS) if you
don't have it (`node --version` to check).

Verify:

```bash
opencode --version
```

If `opencode` isn't on your PATH: on macOS / Linux the install script
may have put the binary in `~/.opencode/bin` or `~/.local/bin` — add
that to your shell's `PATH` and re-open the terminal. On Windows, open
a new terminal so the npm global bin directory is picked up.

---

## Step 4 — give OpenCode your API key and model (~3 min)

Do this through OpenCode's own interface — no config files, no
environment variables to edit.

### Add your API key (`opencode auth login`)

Run this and follow the prompts (same command on macOS, Linux, and
Windows PowerShell):

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

### Select the model (`gpt-5.4-mini`)

OpenCode remembers the last model you picked, so set it once via the
TUI. Launch OpenCode in any folder:

```bash
opencode
```

In the TUI, open the model picker — type `/models` and press Enter (or
use the model-switch keybind shown in the footer; `/help` lists the
commands) — then choose **OpenAI → `gpt-5.4-mini`**. Your choice
persists for next time.

> One-shot alternative: launch directly on the model with
> `opencode --model openai/gpt-5.4-mini`. The single requirement is
> that the active model resolves to `gpt-5.4-mini` via the OpenAI
> provider — the model name shows in the TUI footer.

> Fallback: if `opencode auth login` gives you trouble, OpenCode also
> reads an `OPENAI_API_KEY` environment variable if one is set.

### Activate the workshop env before launching OpenCode

So that any Python the agent runs uses the workshop environment,
**activate the env in each terminal right before you launch
OpenCode.** Activation puts the venv first on `PATH` for that
terminal only — OpenCode (and the `python` it shells out to) inherits
it, and nothing permanent is changed.

**macOS / Linux:**

```bash
source "$WORKSHOP/.venv/bin/activate"
which python
# should print $WORKSHOP/.venv/bin/python
```

**Windows (PowerShell):**

```powershell
& "$env:WORKSHOP\.venv\Scripts\Activate.ps1"
Get-Command python | Select-Object -ExpandProperty Source
# should print ...\.venv\Scripts\python.exe
```

> Remember this line — you'll run it in **every new terminal** before
> `opencode`, including for tasks 1 and 2. If you forget, the agent
> will use your system Python and the imports will fail.

> **Fallback (only if needed):** if smoke test #3 below shows the
> wrong Python *even after activating*, OpenCode may be spawning a
> fresh shell that drops the activation. Put the venv on PATH instead:
> - macOS / Linux: `echo 'export PATH="$WORKSHOP/.venv/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc`
> - Windows (PowerShell): `setx PATH "$env:WORKSHOP\.venv\Scripts;$env:PATH"` then open a new terminal
>
> Undo it after the workshop.

---

## Step 5 — smoke test (~3 min)

In a fresh terminal (so the new env vars are loaded), activate the
workshop env first, then launch OpenCode in any empty folder:

**macOS / Linux:**

```bash
source "$WORKSHOP/.venv/bin/activate"
mkdir ~/opencode_smoke && cd ~/opencode_smoke
opencode
```

**Windows (PowerShell):**

```powershell
& "$env:WORKSHOP\.venv\Scripts\Activate.ps1"
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
3. **"Run `python -c 'import pandas; print(pandas.__version__)'` and
   tell me the version."**
   It should execute, capture stdout, and report a version number.

If any of these fail — *especially #3* — flag it now. The hands-on
tasks rely on the agent being able to run Python and see its output.

---

## Step 6 — confirm you're ready

Tick off:

- [ ] `opencode --version` works
- [ ] `opencode auth list` shows `openai` (key registered via the TUI)
- [ ] OpenCode's active model is `gpt-5.4-mini` (shown in the TUI footer)
- [ ] `WORKSHOP` is set — macOS/Linux `echo "$WORKSHOP"`, Windows
      `echo $env:WORKSHOP` — prints the kit folder
- [ ] After activating, `python` resolves to the venv — macOS/Linux
      `which python` → `$WORKSHOP/.venv/bin/python`; Windows
      `Get-Command python` → `...\.venv\Scripts\python.exe`
- [ ] `python -c "import pandas, matplotlib, sklearn, skfem"` succeeds
      (with the env active)
- [ ] Smoke test #3 above returned a real version number
- [ ] You can read your OpenAI billing page and see your $5 balance
- [ ] You know to activate the env in every new terminal before
      launching `opencode` (`source "$WORKSHOP/.venv/bin/activate"` /
      `& "$env:WORKSHOP\.venv\Scripts\Activate.ps1"`)

If all of these are checked, you're good for tasks 1 and 2.
