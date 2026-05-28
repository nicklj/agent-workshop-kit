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
   you trust temporarily (we'll move it into an env var in step 4).

> Tip: OpenAI's free tier credits will not work here — top up with $5
> of real credit. The first prompt with an empty wallet returns a
> 429-like error that looks confusing.

---

## Step 2 — install `uv` and create the Python environment (~3 min)

We standardise on `~/.venv` as the Python environment all participants
will share. This keeps everyone's pandas/matplotlib/scikit-learn
versions identical.

### Install uv

macOS / Linux:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Verify:

```bash
uv --version
```

### Create the environment

```bash
uv venv ~/.venv --python 3.12
source ~/.venv/bin/activate
uv pip install -r requirements.txt
```

Run this from the folder that contains `requirements.txt` (the
workshop kit root). The pinned versions are verified against the
Task 2 reference solver — don't install the packages loose, or a
future scikit-fem release can break the solver API mid-workshop.
(`scikit-fem` is for task 2; pandas / matplotlib / scikit-learn are
for task 1.)

Verify everything imports:

```bash
~/.venv/bin/python -c "import pandas, matplotlib, sklearn, skfem; print('ok')"
```

You should see `ok` printed. If not, stop and ask.

---

## Step 3 — install OpenCode (~3 min)

Pick whichever install method works on your machine:

| Method | Command |
|--------|---------|
| Install script | `curl -fsSL https://opencode.ai/install \| bash` |
| Homebrew | `brew install sst/tap/opencode` |
| npm | `npm install -g opencode-ai` |

Verify:

```bash
opencode --version
```

If `opencode` isn't on your PATH, your install script may have put the
binary in `~/.opencode/bin` or `~/.local/bin` — add that to your
shell's `PATH` and re-open the terminal.

---

## Step 4 — give OpenCode your API key and model (~3 min)

Set the API key as an environment variable in your shell rc file
(`~/.zshrc` on macOS by default, or `~/.bashrc`):

```bash
echo 'export OPENAI_API_KEY="sk-..."' >> ~/.zshrc
source ~/.zshrc
```

Replace `sk-...` with the key from step 1.

### Configure OpenCode to use gpt-5.4-mini

Create or edit `~/.config/opencode/config.json`:

```json
{
  "model": "openai/gpt-5.4-mini",
  "autoshare": false
}
```

(Exact field names may vary slightly between OpenCode versions —
check `opencode --help` or the docs if the JSON above is rejected.
The single requirement is that the active model resolves to
`gpt-5.4-mini` via the OpenAI provider.)

### Make `~/.venv/bin` OpenCode's default Python

So that any Python the agent runs uses the workshop environment, put
`~/.venv/bin` on your `PATH` *before* launching OpenCode. Add this to
your shell rc:

```bash
echo 'export PATH="$HOME/.venv/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Verify:

```bash
which python
# should print /Users/<you>/.venv/bin/python
```

---

## Step 5 — smoke test (~3 min)

In a fresh terminal (so the new env vars are loaded), in any empty
folder:

```bash
mkdir ~/opencode_smoke && cd ~/opencode_smoke
opencode
```

When the agent prompts you, ask it three things in sequence — make
sure each one actually executes:

1. **"List the files in this folder."**
   It should call a shell/list tool and report that the folder is
   empty.
2. **"Create a file called `hello.txt` with the text 'hello workshop'."**
   It should write the file. Then in another terminal: `cat ~/opencode_smoke/hello.txt`
3. **"Run `python -c 'import pandas; print(pandas.__version__)'` and
   tell me the version."**
   It should execute, capture stdout, and report a version number.

If any of these fail — *especially #3* — flag it now. The hands-on
tasks rely on the agent being able to run Python and see its output.

---

## Step 6 — confirm you're ready

Tick off:

- [ ] `opencode --version` works
- [ ] `which python` prints `~/.venv/bin/python`
- [ ] `~/.venv/bin/python -c "import pandas, matplotlib, sklearn, skfem"` succeeds
- [ ] Smoke test #3 above returned a real version number
- [ ] You can read your OpenAI billing page and see your $5 balance

If all six are checked, you're good for tasks 1 and 2.
