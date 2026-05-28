# Task 2 solution walkthrough (facilitator only)

The agent has to derive, code, debug, and validate a 3D transient
thermal + steady-state thermomechanical FEM solver in `scikit-fem`,
then produce a small statistical brief. This is the deepest task —
the demo is *the long-horizon dev loop*, not any individual step.

A working reference solver is in `../task2_reference_solver.py`
(workshop folder, alongside this doc — *not* in any participant kit).
Run it yourself before the workshop.

## Reference solution (verified, scikit-fem)

Discretisation that matches:
- Mesh: `MeshTet.init_tensor` with (nx, ny, nz) = (6, 6, 14) — 735
  nodes, ~3000 tets.
- Heat: P1 Lagrange, implicit Euler, Δt = 0.02 s, t_end = 5 s.
- Mechanical: vector P1 Lagrange, steady-state, top face fully
  clamped, thermal load as RHS.

### Steady-state temperature on the centerline

| z (mm) | T (K) | ΔT vs T_ref (K) |
|--------|-------|-----------------|
| 0.0  | 344.25 | +46.25 |
| 2.5  | 329.77 | +31.77 |
| 5.0  | 310.47 | +12.47 |
| 7.5  | 305.13 | +7.13  |
| 10.0 | 298.00 | +0.00  |

Profile is piecewise linear along the centerline (within ~0.1 K of
the 1-D analytical limit), with slope kink at the interface. Slope
ratio across the interface = k_Cu / k_Si = 401 / 148 ≈ 2.71. Lateral
T variation is negligible (everything is essentially 1-D in z because
the lateral faces are adiabatic).

### Transient timing

95 % of steady-state ΔT at the interface centerline is reached at
**t ≈ 0.86 s**.

### Steady-state stress (top face clamped)

| Quantity | Value |
|---|---|
| Peak von Mises (anywhere) | **22.28 MPa** (in copper) |
| Mean von Mises (Si side) | ~3.5 MPa |
| Mean von Mises (Cu side) | ~5.3 MPa |
| σ_xx on centerline, Si side near interface | ≈ **+12 MPa (tensile)** |
| σ_xx on centerline, Cu side near interface | ≈ **−12 MPa (compressive)** |
| σ_xx interface jump on centerline | ≈ **24 MPa** |
| Peak displacement magnitude | ~1 μm |

**Sign sanity check:** copper has α ≈ 6.4× larger than silicon. When
heated and bonded, copper *wants* to expand laterally but the silicon
underneath resists — so copper ends up in lateral compression and
silicon in lateral tension. The signs of σ_xx on the centerline near
the interface match this picture.

**Stress jump:** because E and α both change across the interface
and the in-plane strain (lateral) is continuous, σ_xx must be
discontinuous. The agent should note this.

## How to judge a participant's run

### Excellent

- Correct steady-state centerline T within ±0.5 K of the table.
- Peak von Mises within ±10 % of 22 MPa.
- Identifies and explains the stress jump at the interface (sign
  + magnitude).
- Validates the centerline T profile against the analytical 1-D
  limit (slope ratio k_Cu/k_Si).
- Uses harmonic-mean (or subdomain-split) assembly for the heat
  equation — energy is conserved across the interface.
- Plots are labelled, axes have units, slice plots clearly show the
  interface.

### Adequate

- Gets the centerline T right but skips analytical validation.
- Stress field present but no explicit interface jump discussion.
- Δt was picked by trial-and-error rather than from a stability
  argument (implicit Euler is unconditionally stable, but Δt should
  still be small enough to resolve the ~1 s diffusion timescale —
  Δt ≤ 0.05 s).

### Weak

- Off-by-sign on the BC (temperature *drops* at z = 0) — see common
  failure mode below.
- Treats k as a single constant over the whole mesh — small but
  visible error and no slope kink in the T profile.
- Stress field is smooth across the interface (the discontinuity is
  averaged away by a plotting artefact or by using a single material
  in the elasticity solve).
- No statistical numbers, no validation, just a plot.
- This is the chatbot-equivalent answer.

## Common failure modes and how to coach

1. **Wrong heat-flux sign at z = 0.** Most common. Symptom: T at
   z = 0 *decreases* over time. Coach: "Heat is entering at z = 0.
   Trace the sign of the Neumann BC through your weak form."

2. **Single-conductivity assembly.** Symptom: missing slope kink at
   interface, energy not conserved. Coach: "Split the mesh into two
   subdomains by element centroid in z, assemble K and M on each
   separately, then sum. The materials are piecewise constant — your
   assembly should reflect that."

3. **Explicit time stepping with too-small Δt.** Workable but slow.
   Coach toward implicit Euler: "M + Δt·K is unconditionally stable
   and you can pre-factorise it once." If the agent picks explicit
   anyway, that's fine — just budget extra wall-clock for the run.

4. **Forgetting Dirichlet on top face.** Symptom: T keeps rising
   forever, never reaches steady state. Coach: "Did you actually
   constrain T at z = L_z?"

5. **scikit-fem API confusion** (most likely sink-hole on
   `gpt-5.4-mini`):
   - `condense` returns 4 values not 3 — agent may unpack wrong.
   - `basis.get_dofs(...).nodal` gives a dict by component name —
     `u^1`, `u^2`, `u^3` — agent may try `[:, 0]` indexing.
   - Interpolating a scalar field into a vector form: must use the
     scalar basis (`basis_T.interpolate(T)`) and pass as a form
     parameter, not interpolate on the vector basis.
   - Element subdomain masks: use `elements=...` kwarg on `Basis(...)`,
     not boolean masking after the fact.

6. **No interface jump in plot.** Agent plotted σ at element
   centroids but used a smoothing renderer. Coach: "Plot per-element
   stress with no smoothing — `pcolormesh` or `tripcolor` with
   shading='flat'. The jump is real."

7. **Mechanical BCs missing.** Without clamping at z = L_z, the
   stiffness matrix is singular. Symptom: solver returns garbage or
   raises a singular-matrix error. Coach: "Clamp the top face — all
   three displacement components on z = L_z."

## Why this beats a chatbot

1. **Code length and iteration.** 150–300 lines of solver. The agent
   writes, runs, sees a NaN or wrong shape, fixes, re-runs. Every
   one of those rounds is a copy-paste in a chat window.
2. **API exploration requires running.** `scikit-fem` has a specific
   API the model may not know perfectly from training. The agent can
   import, read shape errors, re-read docs, try again. Chat can't.
3. **Mesh / BC bugs surface only on run.** Energy conservation,
   slope kinks, sign errors aren't visible from code review — they
   surface from numbers. Only an agent can close that loop.
4. **Validation against an analytical limit.** Comparing centerline
   T to a 1-D Fourier calculation is one tool call here; in chat
   it's a full copy-paste cycle.
5. **Visual sanity checks.** The agent re-reads its own slice plots
   ("does the stress jump at z = 5 mm?"). Chat can't.

## Approximate time budget

On `gpt-5.4-mini`, expect:
- Mesh + heat-form assembly: 10–15 min
- First runnable transient version with bugs: 10–15 min
- Heat debugging (BC sign, subdomain assembly, time loop): 10–20 min
- Mechanical assembly + BCs: 10–15 min
- Stress post-processing + plots: 10–15 min
- Validation + report: 5–10 min

**Total: 60–90 min.** This is the longest task in the workshop.

## Pre-flight you must do

Run `task2_reference_solver.py` yourself with the workshop venv Python
(`"$WORKSHOP/.venv/bin/python" "$WORKSHOP/task2_reference_solver.py"`).
Confirm it finishes
in under 2 seconds and prints the reference numbers in this doc. If
it doesn't run on your machine, **the workshop won't either** —
debug scikit-fem install / Python version mismatches before the day.
