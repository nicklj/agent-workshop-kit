const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "Agentic AI Workshop";
pres.title = "Agentic AI for Research Workflows";

// ---- palette ----
const DARK = "0E2038", DARK2 = "12304F", PAPER = "F5F8FC", INK = "11243F";
const TEAL = "0FB5BA", AMBER = "FF9F1C", MUTED = "5B6B82", ICE = "AFC4DE";
const WHITE = "FFFFFF", LINEC = "DCE6F2";
// code colors
const CMD = "EAF1F8", COMMENT = "93B8DA", WARN = AMBER, WINLBL = "8FC0EC";

const HEAD = "Trebuchet MS", BODY = "Calibri", MONO = "Courier New";
const QR = path.join(__dirname, "qr_repo.png");
const REPO = "github.com/nicklj/agent-workshop-kit";

const shadow = () => ({ type: "outer", color: "0E2038", blur: 9, offset: 3, angle: 135, opacity: 0.13 });

function chip(slide, text, x, y, w, fill, txtColor) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.36, fill: { color: fill }, rectRadius: 0.07, line: { type: "none" } });
  slide.addText(text, { x, y, w, h: 0.36, fontFace: HEAD, fontSize: 11.5, bold: true, color: txtColor || WHITE, align: "center", valign: "middle", charSpacing: 2, margin: 0 });
}

function footer(slide, n) {
  slide.addText([
    { text: "Agentic AI Workshop", options: { bold: true, color: MUTED } },
    { text: "   ·   " + REPO, options: { color: MUTED } },
  ], { x: 0.6, y: 7.06, w: 10, h: 0.3, fontFace: BODY, fontSize: 9.5, align: "left", valign: "middle", margin: 0 });
  slide.addText(String(n), { x: 12.5, y: 7.06, w: 0.4, h: 0.3, fontFace: BODY, fontSize: 9.5, color: MUTED, align: "right", valign: "middle", margin: 0 });
}

function titleBlock(slide, kicker, kickerW, kickerFill, title, titleSize) {
  chip(slide, kicker, 0.6, 0.5, kickerW, kickerFill, WHITE);
  slide.addText(title, { x: 0.6, y: 0.94, w: 12.1, h: 0.8, fontFace: HEAD, fontSize: titleSize || 29, bold: true, color: INK, align: "left", valign: "middle", margin: 0 });
}

function divider(num, kicker, kickerW, kickerFill, title, sub) {
  const s = pres.addSlide();
  s.background = { color: DARK };
  s.addText(num, { x: 7.7, y: 0.2, w: 5.4, h: 7.1, fontFace: HEAD, fontSize: 360, bold: true, color: DARK2, align: "right", valign: "middle", margin: 0 });
  chip(s, kicker, 0.85, 2.35, kickerW, kickerFill, WHITE);
  s.addText(title, { x: 0.82, y: 2.82, w: 9, h: 1.1, fontFace: HEAD, fontSize: 52, bold: true, color: WHITE, align: "left", valign: "middle", margin: 0 });
  s.addText(sub, { x: 0.85, y: 4.0, w: 8.3, h: 1.2, fontFace: BODY, fontSize: 18, color: ICE, align: "left", valign: "top", margin: 0 });
  return s;
}

// dark monospace command card. lines: [{t, c, gap}]
function cmdCard(slide, x, y, w, h, label, labelColor, lines, fs) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: DARK }, line: { type: "none" }, shadow: shadow() });
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.44, fill: { color: DARK2 }, line: { type: "none" } });
  slide.addText(label, { x: x + 0.24, y, w: w - 0.4, h: 0.44, fontFace: HEAD, fontSize: 11.5, bold: true, color: labelColor, valign: "middle", charSpacing: 1, margin: 0 });
  const runs = lines.map((ln, i) => ({ text: ln.t, options: { color: ln.c || CMD, bold: !!ln.bold, breakLine: i < lines.length - 1, paraSpaceAfter: ln.gap != null ? ln.gap : 4 } }));
  slide.addText(runs, { x: x + 0.3, y: y + 0.58, w: w - 0.55, h: h - 0.75, fontFace: MONO, fontSize: fs || 14, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.25 });
}

// =================================================================== //
// 1 — Title
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: DARK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0.85, y: 1.35, w: 0.55, h: 0.55, fill: { color: TEAL } });
  s.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 1.35, w: 0.55, h: 0.55, fill: { color: AMBER } });
  s.addText("Agentic AI for\nResearch Workflows", { x: 0.8, y: 2.25, w: 8.2, h: 2.3, fontFace: HEAD, fontSize: 46, bold: true, color: WHITE, align: "left", valign: "middle", lineSpacingMultiple: 1.0, margin: 0 });
  s.addText("A hands-on workshop · drive an AI agent with OpenCode", { x: 0.82, y: 4.7, w: 8.0, h: 0.5, fontFace: BODY, fontSize: 18, color: ICE, align: "left", margin: 0 });
  s.addText([
    { text: "1 setup", options: { bold: true, color: TEAL } },
    { text: "  +  ", options: { color: ICE } },
    { text: "2 hands-on tasks", options: { bold: true, color: AMBER } },
    { text: "   ·   ~2 hours · follow along on screen", options: { color: ICE } },
  ], { x: 0.82, y: 5.25, w: 8.2, h: 0.5, fontFace: BODY, fontSize: 16, align: "left", margin: 0 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.7, y: 2.1, w: 2.95, h: 3.35, fill: { color: WHITE }, rectRadius: 0.12, shadow: shadow() });
  s.addImage({ path: QR, x: 9.97, y: 2.32, w: 2.4, h: 2.4 });
  s.addText("Scan for the kit", { x: 9.7, y: 4.78, w: 2.95, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: INK, align: "center", margin: 0 });
  s.addText(REPO, { x: 9.6, y: 5.06, w: 3.15, h: 0.3, fontFace: MONO, fontSize: 9.5, color: MUTED, align: "center", margin: 0 });
}

// =================================================================== //
// 2 — What we'll do today
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  titleBlock(s, "TODAY", 1.35, TEAL, "One setup, two hands-on tasks");
  s.addText([
    { text: "The agent loop: ", options: { bold: true, color: INK } },
    { text: "prompt → tool call → observe → repeat. ", options: { color: INK } },
    { text: "You'll watch it run dozens of steps a chat window couldn't sustain.", options: { color: MUTED } },
  ], { x: 0.6, y: 1.85, w: 12.1, h: 0.5, fontFace: BODY, fontSize: 15, align: "left", margin: 0 });
  const cards = [
    { tag: "TASK 0", t: "Setup", d: "Get everyone on the same agent, model, and Python environment.", c: "6B7C93" },
    { tag: "TASK 1", t: "Loop on data", d: "Multi-file analysis, data cleaning, a cross-validated model, and a memo.", c: TEAL },
    { tag: "TASK 2", t: "Loop on code", d: "Build a 3D FEM solver from scratch — write, run, debug, validate.", c: AMBER },
  ];
  const cw = 3.83, gap = 0.31, x0 = 0.6, cy = 2.7, ch = 3.6;
  cards.forEach((c, i) => {
    const x = x0 + i * (cw + gap);
    s.addShape(pres.shapes.RECTANGLE, { x, y: cy, w: cw, h: ch, fill: { color: WHITE }, line: { color: LINEC, width: 1 }, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y: cy, w: cw, h: 0.14, fill: { color: c.c }, line: { type: "none" } });
    chip(s, c.tag, x + 0.4, cy + 0.45, 1.3, c.c, WHITE);
    s.addText(c.t, { x: x + 0.4, y: cy + 1.0, w: cw - 0.8, h: 0.6, fontFace: HEAD, fontSize: 24, bold: true, color: INK, align: "left", margin: 0 });
    s.addText(c.d, { x: x + 0.4, y: cy + 1.72, w: cw - 0.75, h: 1.5, fontFace: BODY, fontSize: 14.5, color: MUTED, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.05 });
  });
  footer(s, 2);
}

// =================================================================== //
// 3 — Task 0 divider
// =================================================================== //
divider("0", "TASK 0", 1.35, "6B7C93", "Setup", "Same agent, same model, same Python env. We'll do all five steps together.");

// =================================================================== //
// 4 — Step 1: API key (optional)
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  titleBlock(s, "TASK 0 · STEP 1", 2.65, "6B7C93", "Get an OpenAI API key");
  // optional banner
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.85, w: 12.13, h: 0.72, fill: { color: "FFF3DF" }, line: { color: AMBER, width: 1 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.85, w: 0.13, h: 0.72, fill: { color: AMBER }, line: { type: "none" } });
  s.addText([
    { text: "OPTIONAL — ", options: { bold: true, color: "B5710A" } },
    { text: "OpenCode has free models. Do this step only to run ", options: { color: "7A5410" } },
    { text: "gpt-5.4-mini", options: { bold: true, color: "7A5410" } },
    { text: ". Using a free model? Skip to Step 4.", options: { color: "7A5410" } },
  ], { x: 0.95, y: 1.85, w: 11.6, h: 0.72, fontFace: BODY, fontSize: 14.5, valign: "middle", align: "left", margin: 0 });

  const steps = [
    { t: "Create an account (or sign in)", u: "platform.openai.com/signup" },
    { t: "Open billing → Add to credit balance → top up US$5", u: "platform.openai.com/settings/organization/billing" },
    { t: "Open the API keys page", u: "platform.openai.com/api-keys" },
    { t: "Create new secret key, name it \"workshop\", copy it now", u: "you can't see it again — keep it handy for Step 4" },
  ];
  const y0 = 2.95, pitch = 0.98, x = 0.6, w = 12.13, ch = 0.82;
  steps.forEach((st, i) => {
    const y = y0 + i * pitch;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: ch, fill: { color: WHITE }, line: { color: LINEC, width: 1 }, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { x: x + 0.28, y: y + 0.17, w: 0.48, h: 0.48, fill: { color: "6B7C93" }, line: { type: "none" } });
    s.addText(String(i + 1), { x: x + 0.28, y: y + 0.17, w: 0.48, h: 0.48, fontFace: HEAD, fontSize: 18, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(st.t, { x: x + 1.0, y: y + 0.1, w: w - 1.3, h: 0.38, fontFace: HEAD, fontSize: 16, bold: true, color: INK, align: "left", valign: "middle", margin: 0 });
    s.addText(st.u, { x: x + 1.0, y: y + 0.45, w: w - 1.3, h: 0.32, fontFace: MONO, fontSize: 12, color: TEAL, align: "left", valign: "middle", margin: 0 });
  });
  footer(s, 4);
}

// =================================================================== //
// 5 — Step 2a: $WORKSHOP + install uv
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  titleBlock(s, "TASK 0 · STEP 2", 2.65, "6B7C93", "Point $WORKSHOP at the kit, then install uv");
  s.addText("Unpack the kit anywhere, then set WORKSHOP to that folder — used in every command below. Persist it so new terminals see it.", { x: 0.6, y: 1.8, w: 12.13, h: 0.45, fontFace: BODY, fontSize: 13.5, color: MUTED, align: "left", margin: 0 });
  cmdCard(s, 0.6, 2.35, 5.86, 3.9, "macOS / Linux", TEAL, [
    { t: "# set WORKSHOP, then reload", c: COMMENT },
    { t: "echo 'export WORKSHOP=\\" },
    { t: "  \"/path/to/workshop\"' >> ~/.zshrc" },
    { t: "source ~/.zshrc", gap: 12 },
    { t: "# install uv", c: COMMENT },
    { t: "curl -LsSf \\" },
    { t: "  https://astral.sh/uv/install.sh | sh" },
  ], 13);
  cmdCard(s, 6.87, 2.35, 5.86, 3.9, "Windows (PowerShell)", WINLBL, [
    { t: "# setx persists; also set this session", c: COMMENT },
    { t: "setx WORKSHOP \"C:\\path\\to\\workshop\"" },
    { t: "$env:WORKSHOP = \\" },
    { t: "  \"C:\\path\\to\\workshop\"", gap: 12 },
    { t: "# install uv", c: COMMENT },
    { t: "powershell -ExecutionPolicy ByPass -c `" },
    { t: "  \"irm https://astral.sh/uv/install.ps1 | iex\"" },
  ], 13);
  s.addText([
    { text: "Verify:  ", options: { color: MUTED } },
    { text: "uv --version", options: { fontFace: MONO, bold: true, color: INK } },
    { text: "   (open a new terminal if it isn't found)", options: { color: MUTED } },
  ], { x: 0.6, y: 6.4, w: 12.13, h: 0.4, fontFace: BODY, fontSize: 13, align: "left", margin: 0 });
  footer(s, 5);
}

// =================================================================== //
// 6 — Step 2b: create venv + verify
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  titleBlock(s, "TASK 0 · STEP 2", 2.65, "6B7C93", "Create the environment & verify");
  s.addText([
    { text: "uv pip install", options: { fontFace: MONO, bold: true, color: INK } },
    { text: " targets the .venv in the current folder automatically — no activation needed.", options: { color: MUTED } },
  ], { x: 0.6, y: 1.8, w: 12.13, h: 0.45, fontFace: BODY, fontSize: 13.5, align: "left", margin: 0 });
  cmdCard(s, 0.6, 2.35, 5.86, 1.95, "macOS / Linux", TEAL, [
    { t: "cd \"$WORKSHOP\"" },
    { t: "uv venv .venv --python 3.12" },
    { t: "uv pip install -r requirements.txt" },
  ], 13.5);
  cmdCard(s, 6.87, 2.35, 5.86, 1.95, "Windows (PowerShell)", WINLBL, [
    { t: "cd $env:WORKSHOP" },
    { t: "uv venv .venv --python 3.12" },
    { t: "uv pip install -r requirements.txt" },
  ], 13.5);
  cmdCard(s, 0.6, 4.45, 12.13, 2.2, "verify — should print:  ok", TEAL, [
    { t: "# macOS / Linux", c: COMMENT },
    { t: "\"$WORKSHOP/.venv/bin/python\" -c \"import pandas, matplotlib, sklearn, skfem; print('ok')\"", c: TEAL, gap: 12 },
    { t: "# Windows (PowerShell)", c: COMMENT },
    { t: "& \"$env:WORKSHOP\\.venv\\Scripts\\python.exe\" -c \"import pandas, matplotlib, sklearn, skfem; print('ok')\"", c: TEAL },
  ], 11.5);
  footer(s, 6);
}

// =================================================================== //
// 7 — Step 3: install OpenCode
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  titleBlock(s, "TASK 0 · STEP 3", 2.65, "6B7C93", "Install OpenCode");
  cmdCard(s, 0.6, 1.95, 12.13, 1.85, "macOS / Linux  —  pick one", TEAL, [
    { t: "curl -fsSL https://opencode.ai/install | bash    # install script" },
    { t: "brew install sst/tap/opencode                    # Homebrew" },
    { t: "npm install -g opencode-ai                       # npm (needs Node.js)" },
  ], 13.5);
  cmdCard(s, 0.6, 4.0, 12.13, 1.6, "Windows  —  two choices", WINLBL, [
    { t: "npm install -g opencode-ai      # needs Node.js from nodejs.org", },
    { t: "# — or — download OpenCode Desktop (GUI, no Node.js) from opencode.ai", c: COMMENT },
  ], 13.5);
  s.addText([
    { text: "Verify:  ", options: { color: MUTED } },
    { text: "opencode --version", options: { fontFace: MONO, bold: true, color: INK } },
    { text: "   ·   not found? open a new terminal so the install dir is on PATH.", options: { color: MUTED } },
  ], { x: 0.6, y: 5.8, w: 12.13, h: 0.5, fontFace: BODY, fontSize: 13.5, align: "left", margin: 0 });
  footer(s, 7);
}

// =================================================================== //
// 8 — Step 4: pick your model
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  titleBlock(s, "TASK 0 · STEP 4", 2.65, "6B7C93", "Pick your model");
  const cw = 5.86, x1 = 0.6, x2 = 6.87, cy = 1.95, ch = 3.55;
  // Option A
  s.addShape(pres.shapes.RECTANGLE, { x: x1, y: cy, w: cw, h: ch, fill: { color: WHITE }, line: { color: LINEC, width: 1 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: x1, y: cy, w: cw, h: 0.13, fill: { color: TEAL }, line: { type: "none" } });
  chip(s, "OPTION A · FREE MODEL", x1 + 0.4, cy + 0.4, 3.0, TEAL, WHITE);
  s.addText("No account, no key, no spend. Good enough for both tasks.", { x: x1 + 0.4, y: cy + 0.95, w: cw - 0.8, h: 0.6, fontFace: BODY, fontSize: 14, color: INK, align: "left", valign: "top", margin: 0 });
  cmdCard(s, x1 + 0.4, cy + 1.7, cw - 0.8, 1.7, "in OpenCode", TEAL, [
    { t: "opencode", gap: 8 },
    { t: "/models", c: TEAL, bold: true },
    { t: "→ pick a free model", c: COMMENT },
  ], 13);
  // Option B
  s.addShape(pres.shapes.RECTANGLE, { x: x2, y: cy, w: cw, h: ch, fill: { color: WHITE }, line: { color: LINEC, width: 1 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: x2, y: cy, w: cw, h: 0.13, fill: { color: AMBER }, line: { type: "none" } });
  chip(s, "OPTION B · OPENAI KEY", x2 + 0.4, cy + 0.4, 3.0, AMBER, WHITE);
  s.addText("Use the key from Step 1 to run gpt-5.4-mini.", { x: x2 + 0.4, y: cy + 0.95, w: cw - 0.8, h: 0.5, fontFace: BODY, fontSize: 14, color: INK, align: "left", valign: "top", margin: 0 });
  cmdCard(s, x2 + 0.4, cy + 1.5, cw - 0.8, 1.95, "in OpenCode", AMBER, [
    { t: "opencode auth login" },
    { t: "→ OpenAI → API Key → paste", c: COMMENT, gap: 8 },
    { t: "/models", c: TEAL, bold: true },
    { t: "→ openai / gpt-5.4-mini", c: COMMENT },
  ], 13);
  s.addText("Open the model picker with /models (or the keybind in the footer). Your choice persists; the active model shows in the TUI footer.", { x: 0.6, y: 5.75, w: 12.13, h: 0.6, fontFace: BODY, fontSize: 13, italic: true, color: MUTED, align: "left", margin: 0 });
  footer(s, 8);
}

// =================================================================== //
// 9 — Step 5: smoke test
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  titleBlock(s, "TASK 0 · STEP 5", 2.65, "6B7C93", "Smoke test — ask the agent three things");
  s.addText([
    { text: "Launch in an empty folder:  ", options: { color: MUTED } },
    { text: "mkdir ~/opencode_smoke && cd ~/opencode_smoke && opencode", options: { fontFace: MONO, bold: true, color: INK } },
  ], { x: 0.6, y: 1.82, w: 12.13, h: 0.4, fontFace: BODY, fontSize: 13, align: "left", margin: 0 });

  const prompts = [
    { t: "\"List the files in this folder.\"", d: "It calls a tool and reports the folder is empty.", mono: false },
    { t: "\"Create hello.txt with the text 'hello workshop'.\"", d: "It writes the file — check it from another terminal.", mono: false },
    { t: "\"Run $WORKSHOP/.venv/bin/python -c 'import pandas; print(pandas.__version__)'\"", d: "THE REAL TEST: it runs the workshop Python and reports a version.", mono: true },
  ];
  const y0 = 2.45, pitch = 1.42, x = 0.6, w = 12.13, ch = 1.22;
  prompts.forEach((p, i) => {
    const y = y0 + i * pitch;
    const last = i === 2;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: ch, fill: { color: WHITE }, line: { color: last ? AMBER : LINEC, width: last ? 1.5 : 1 }, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.36, w: 0.5, h: 0.5, fill: { color: last ? AMBER : "6B7C93" }, line: { type: "none" } });
    s.addText(String(i + 1), { x: x + 0.3, y: y + 0.36, w: 0.5, h: 0.5, fontFace: HEAD, fontSize: 19, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(p.t, { x: x + 1.05, y: y + 0.2, w: w - 1.4, h: 0.5, fontFace: p.mono ? MONO : HEAD, fontSize: p.mono ? 15 : 18, bold: true, color: INK, align: "left", valign: "middle", margin: 0 });
    s.addText(p.d, { x: x + 1.05, y: y + 0.72, w: w - 1.4, h: 0.34, fontFace: BODY, fontSize: 13, color: last ? "B5710A" : MUTED, bold: last, align: "left", valign: "middle", margin: 0 });
  });
  footer(s, 9);
}

// =================================================================== //
// 10 — Step 6: ready checklist
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  titleBlock(s, "TASK 0 · READY?", 2.65, "6B7C93", "You're set when all of these are true");
  const items = [
    "opencode --version works  (or the OpenCode Desktop app opens)",
    "A model is active — shown in the TUI footer",
    "echo \"$WORKSHOP\" prints your kit folder",
    "The venv's Python imports pandas, matplotlib, sklearn, skfem",
    "Smoke test #3 printed a real version number",
    "(OpenAI-key route) opencode auth list shows openai",
  ];
  const y0 = 2.1, pitch = 0.78, x = 0.6, w = 12.13, ch = 0.62;
  items.forEach((it, i) => {
    const y = y0 + i * pitch;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: ch, fill: { color: WHITE }, line: { color: LINEC, width: 1 }, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.14, w: 0.34, h: 0.34, fill: { color: TEAL }, line: { type: "none" } });
    s.addText("✓", { x: x + 0.3, y: y + 0.14, w: 0.34, h: 0.34, fontFace: HEAD, fontSize: 15, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(it, { x: x + 0.9, y, w: w - 1.2, h: ch, fontFace: BODY, fontSize: 15, color: INK, align: "left", valign: "middle", margin: 0 });
  });
  footer(s, 10);
}

// =================================================================== //
// 11 — Task 1 divider
// =================================================================== //
divider("1", "TASK 1", 1.35, TEAL, "Loop on data", "Hand the agent a messy 200-design sweep. It cleans, analyses, models, and writes the memo.");

// =================================================================== //
// 12 — AGENTS.md
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  titleBlock(s, "TASK 1 · FIRST, A RULE", 3.35, TEAL, "AGENTS.md — standing rules for your agent");
  const lx = 0.6, lw = 6.5;
  s.addText("A plain-Markdown file OpenCode reads at the start of every session in a project.", { x: lx, y: 1.95, w: lw, h: 0.7, fontFace: BODY, fontSize: 16, bold: true, color: INK, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.05 });
  s.addText([
    { text: "Persistent instructions the agent always sees", options: { bullet: { code: "2022", indent: 18 }, breakLine: true, color: INK, paraSpaceAfter: 10 } },
    { text: "Lives in the project — travels with the kit when copied", options: { bullet: { code: "2022", indent: 18 }, breakLine: true, color: INK, paraSpaceAfter: 10 } },
    { text: "No need to repeat the same setup in every prompt", options: { bullet: { code: "2022", indent: 18 }, breakLine: true, color: INK, paraSpaceAfter: 10 } },
    { text: "Here: it pins the workshop Python so the agent never grabs the wrong env", options: { bullet: { code: "2022", indent: 18 }, color: INK } },
  ], { x: lx, y: 2.95, w: lw, h: 3.0, fontFace: BODY, fontSize: 15, align: "left", valign: "top", margin: 0 });
  const cx = 7.45, cw = 5.28, cy = 1.95, ch = 3.62;
  cmdCard(s, cx, cy, cw, ch, "task1_kit / AGENTS.md", ICE, [
    { t: "# Workshop environment rule", c: COMMENT, gap: 12 },
    { t: "Always run Python as", c: CMD },
    { t: "$WORKSHOP/.venv/bin/python", c: TEAL, bold: true, gap: 12 },
    { t: "(and the same with -m pip", c: CMD },
    { t: "for installs).", c: CMD, gap: 12 },
    { t: "Never use the system python.", c: AMBER },
  ], 14.5);
  s.addText("Each task kit ships one — copied to a fresh folder, the agent reads it automatically.", { x: cx, y: cy + ch + 0.2, w: cw, h: 0.8, fontFace: BODY, italic: true, fontSize: 13, color: MUTED, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.05 });
  footer(s, 12);
}

// =================================================================== //
// 13 — Launch Task 1
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  titleBlock(s, "TASK 1 · LAUNCH", 2.7, TEAL, "Copy the kit, open OpenCode, hand over the brief");
  cmdCard(s, 0.6, 1.95, 5.86, 2.1, "macOS / Linux", TEAL, [
    { t: "cp -r \"$WORKSHOP/task1_kit\" \\" },
    { t: "      ~/agent_task1" },
    { t: "cd ~/agent_task1" },
    { t: "opencode" },
  ], 14);
  cmdCard(s, 6.87, 1.95, 5.86, 2.1, "Windows (PowerShell)", WINLBL, [
    { t: "Copy-Item -Recurse `" },
    { t: "  \"$env:WORKSHOP\\task1_kit\" `" },
    { t: "  $HOME\\agent_task1" },
    { t: "cd $HOME\\agent_task1 ; opencode" },
  ], 13);
  // prompt callout
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 4.35, w: 12.13, h: 2.1, fill: { color: WHITE }, line: { color: LINEC, width: 1 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 4.35, w: 0.13, h: 2.1, fill: { color: TEAL }, line: { type: "none" } });
  s.addText("THEN SAY TO THE AGENT", { x: 1.0, y: 4.58, w: 11, h: 0.35, fontFace: HEAD, fontSize: 12.5, bold: true, color: TEAL, charSpacing: 1, align: "left", margin: 0 });
  s.addText("\"Read BRIEF.md and produce the engineering memo it asks for. Don't pre-clean the data — flag any quality issues you find yourself.\"", { x: 1.0, y: 4.98, w: 11.4, h: 0.9, fontFace: BODY, fontSize: 17, italic: true, color: INK, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.1 });
  s.addText("Then let it work. Coach only if it stalls — the point is to watch the loop run.", { x: 1.0, y: 5.98, w: 11.4, h: 0.4, fontFace: BODY, fontSize: 13.5, color: MUTED, align: "left", margin: 0 });
  footer(s, 13);
}

// =================================================================== //
// 14 — Task 1 detail (what a good run does)
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  titleBlock(s, "TASK 1 · THE TASK", 3.05, TEAL, "Thermal-aware packaging design exploration");
  s.addText("Two CSVs from a 200-design GPU + HBM thermal sweep. A good run will:", { x: 0.6, y: 1.9, w: 12.1, h: 0.45, fontFace: BODY, fontSize: 15, color: MUTED, align: "left", margin: 0 });
  const items = [
    "Join the two tables on design_id",
    "Catch 3 planted data-quality issues (it isn't told what they are)",
    "Find the Pareto front: max temperature vs. total wire length",
    "Extract design rules — e.g. \"12-layer stacks need cold plate or immersion\"",
    "Fit + cross-validate a regression for max temperature; defend it with numbers",
    "Write report.md + top_designs.csv",
  ];
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: { code: "2022", indent: 18 }, breakLine: i < items.length - 1, color: INK, paraSpaceAfter: 11 } })), { x: 0.65, y: 2.5, w: 7.7, h: 4.1, fontFace: BODY, fontSize: 15.5, align: "left", valign: "top", margin: 0 });
  const cx = 8.7, cw = 4.03, cy = 2.5, ch = 3.95;
  s.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: cw, h: ch, fill: { color: WHITE }, line: { color: LINEC, width: 1 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 0.13, h: ch, fill: { color: TEAL }, line: { type: "none" } });
  s.addText("WHY IT BEATS A CHATBOT", { x: cx + 0.4, y: cy + 0.32, w: cw - 0.6, h: 0.35, fontFace: HEAD, fontSize: 12.5, bold: true, color: TEAL, charSpacing: 1, align: "left", margin: 0 });
  s.addText([
    { text: "Too big to paste", options: { bold: true, color: INK, breakLine: true } },
    { text: "200 rows across two files.", options: { color: MUTED, breakLine: true, paraSpaceAfter: 12 } },
    { text: "Iterative & verifiable", options: { bold: true, color: INK, breakLine: true } },
    { text: "Clean → plot → model → re-check, all on disk.", options: { color: MUTED, breakLine: true, paraSpaceAfter: 12 } },
    { text: "Held-out R²", options: { bold: true, color: INK, breakLine: true } },
    { text: "A copy-paste nightmare in chat.", options: { color: MUTED } },
  ], { x: cx + 0.4, y: cy + 0.85, w: cw - 0.7, h: ch - 1.1, fontFace: BODY, fontSize: 13.5, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.05 });
  footer(s, 14);
}

// =================================================================== //
// 15 — Task 2 divider
// =================================================================== //
divider("2", "TASK 2", 1.35, AMBER, "Loop on code", "No starter code. The agent builds a 3D finite-element solver from scratch and validates it.");

// =================================================================== //
// 16 — Launch Task 2
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  titleBlock(s, "TASK 2 · LAUNCH", 2.7, AMBER, "Same move — copy the kit, open OpenCode");
  cmdCard(s, 0.6, 1.95, 5.86, 2.1, "macOS / Linux", TEAL, [
    { t: "cp -r \"$WORKSHOP/task2_kit\" \\" },
    { t: "      ~/agent_task2" },
    { t: "cd ~/agent_task2" },
    { t: "opencode" },
  ], 14);
  cmdCard(s, 6.87, 1.95, 5.86, 2.1, "Windows (PowerShell)", WINLBL, [
    { t: "Copy-Item -Recurse `" },
    { t: "  \"$env:WORKSHOP\\task2_kit\" `" },
    { t: "  $HOME\\agent_task2" },
    { t: "cd $HOME\\agent_task2 ; opencode" },
  ], 13);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 4.35, w: 12.13, h: 2.1, fill: { color: WHITE }, line: { color: LINEC, width: 1 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 4.35, w: 0.13, h: 2.1, fill: { color: AMBER }, line: { type: "none" } });
  s.addText("THEN SAY TO THE AGENT", { x: 1.0, y: 4.58, w: 11, h: 0.35, fontFace: HEAD, fontSize: 12.5, bold: true, color: AMBER, charSpacing: 1, align: "left", margin: 0 });
  s.addText("\"Read BRIEF.md and build the FEM solver it describes in scikit-fem. Validate the centerline against the 1-D analytical limit before you report.\"", { x: 1.0, y: 4.98, w: 11.4, h: 0.95, fontFace: BODY, fontSize: 17, italic: true, color: INK, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.1 });
  s.addText("Expect bugs — a NaN, a wrong sign, a singular matrix. Watching it diagnose and fix is the whole demo.", { x: 1.0, y: 5.98, w: 11.4, h: 0.4, fontFace: BODY, fontSize: 13.5, color: MUTED, align: "left", margin: 0 });
  footer(s, 16);
}

// =================================================================== //
// 17 — Task 2 detail + numbers
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  titleBlock(s, "TASK 2 · THE TASK", 3.05, AMBER, "Build a 3D transient thermomechanical FEM solver");
  s.addText([
    { text: "A 5 × 5 × 10 mm silicon-on-copper brick. ", options: { color: INK, bold: true } },
    { text: "No solver provided — the agent writes it in scikit-fem.", options: { color: MUTED } },
  ], { x: 0.6, y: 1.9, w: 12.1, h: 0.45, fontFace: BODY, fontSize: 15, align: "left", margin: 0 });
  const items = [
    "Structured tet mesh, two material subdomains in z",
    "Transient heat equation, implicit Euler time-stepping",
    "Steady-state linear elasticity with thermal load",
    "Validate against the 1-D analytical centerline limit",
    "Long-horizon loop: write ~200 lines → hit a NaN/sign bug → diagnose → fix",
  ];
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: { code: "2022", indent: 18 }, breakLine: i < items.length - 1, color: INK, paraSpaceAfter: 12 } })), { x: 0.65, y: 2.5, w: 7.6, h: 4.1, fontFace: BODY, fontSize: 15.5, align: "left", valign: "top", margin: 0 });
  const cx = 8.6, cw = 4.13, cy = 2.5, ch = 3.95;
  s.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: cw, h: ch, fill: { color: DARK }, line: { type: "none" }, shadow: shadow() });
  s.addText("THE NUMBERS TO HIT", { x: cx + 0.4, y: cy + 0.3, w: cw - 0.6, h: 0.35, fontFace: HEAD, fontSize: 12.5, bold: true, color: AMBER, charSpacing: 1, align: "left", margin: 0 });
  const stats = [["344 K", "peak centerline temperature"], ["22 MPa", "peak von Mises stress (copper)"], ["0.86 s", "time to 95% steady state"]];
  stats.forEach((st, i) => {
    const yy = cy + 0.85 + i * 1.0;
    s.addText(st[0], { x: cx + 0.4, y: yy, w: cw - 0.7, h: 0.5, fontFace: HEAD, fontSize: 30, bold: true, color: WHITE, align: "left", margin: 0 });
    s.addText(st[1], { x: cx + 0.4, y: yy + 0.5, w: cw - 0.7, h: 0.32, fontFace: BODY, fontSize: 12, color: ICE, align: "left", margin: 0 });
  });
  footer(s, 17);
}

// =================================================================== //
// 18 — Task 2 stretch goals
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: PAPER };
  titleBlock(s, "TASK 2 · IF YOU HAVE TIME", 3.5, AMBER, "Stretch goals to try");
  const cards = [
    { t: "Transient stress", d: "Drive the mechanical solve from the temperature history and plot peak σ_vm(t) at the interface." },
    { t: "Convective cooling", d: "Swap the fixed top-face temperature for h·(T − T_ambient); find h that keeps peak die T below 360 K." },
    { t: "Mesh convergence", d: "Refine 2× in each direction and check the peak stress changes by < 5% — a real convergence study." },
  ];
  const cw = 3.83, gap = 0.31, x0 = 0.6, cy = 2.3, ch = 3.7;
  cards.forEach((c, i) => {
    const x = x0 + i * (cw + gap);
    s.addShape(pres.shapes.RECTANGLE, { x, y: cy, w: cw, h: ch, fill: { color: WHITE }, line: { color: LINEC, width: 1 }, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { x: x + 0.4, y: cy + 0.45, w: 0.6, h: 0.6, fill: { color: AMBER }, line: { type: "none" } });
    s.addText(String(i + 1), { x: x + 0.4, y: cy + 0.45, w: 0.6, h: 0.6, fontFace: HEAD, fontSize: 22, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(c.t, { x: x + 0.4, y: cy + 1.25, w: cw - 0.8, h: 0.5, fontFace: HEAD, fontSize: 19, bold: true, color: INK, align: "left", margin: 0 });
    s.addText(c.d, { x: x + 0.4, y: cy + 1.85, w: cw - 0.75, h: 1.6, fontFace: BODY, fontSize: 14, color: MUTED, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.08 });
  });
  footer(s, 18);
}

// =================================================================== //
// 19 — Q&A
// =================================================================== //
{
  const s = pres.addSlide();
  s.background = { color: DARK };
  s.addShape(pres.shapes.RECTANGLE, { x: 0.85, y: 1.7, w: 0.55, h: 0.55, fill: { color: TEAL } });
  s.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 1.7, w: 0.55, h: 0.55, fill: { color: AMBER } });
  s.addText("Questions?", { x: 0.8, y: 2.5, w: 8.5, h: 1.3, fontFace: HEAD, fontSize: 54, bold: true, color: WHITE, align: "left", valign: "middle", margin: 0 });
  s.addText("Verify the output. Compare to an analytical limit. Pick the model that matches the cost of being wrong.", { x: 0.82, y: 3.95, w: 8.0, h: 1.4, fontFace: BODY, fontSize: 18, color: ICE, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.1 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.7, y: 2.1, w: 2.95, h: 3.35, fill: { color: WHITE }, rectRadius: 0.12, shadow: shadow() });
  s.addImage({ path: QR, x: 9.97, y: 2.32, w: 2.4, h: 2.4 });
  s.addText("The workshop kit", { x: 9.7, y: 4.78, w: 2.95, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: INK, align: "center", margin: 0 });
  s.addText(REPO, { x: 9.6, y: 5.06, w: 3.15, h: 0.3, fontFace: MONO, fontSize: 9.5, color: MUTED, align: "center", margin: 0 });
}

pres.writeFile({ fileName: path.join(__dirname, "Agentic_AI_Workshop.pptx") }).then((f) => console.log("wrote", f));
