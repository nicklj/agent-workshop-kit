# Task 2: 3D transient thermomechanical FEM of a bimaterial brick

## Background

A silicon die is bonded to a copper heat-spreader. Power is dissipated
into the die's bottom face; heat flows up through the silicon, across
the bonded interface, and out through the copper into a heatsink held
at ambient. You want:

- the **transient temperature field** T(x, y, z, t),
- the **steady-state thermo-elastic stress field** σ(x, y, z), and
- a short statistical brief for a reliability review.

There is no solver in this folder. The agent has to build a 3D
finite-element solver from scratch using `scikit-fem`.

## Geometry

A rectangular brick, two materials bonded along z:

| | Range (m) | Material |
|--|-----------|----------|
| In-plane | x ∈ [0, 0.005], y ∈ [0, 0.005] | (both materials, full cross-section) |
| Material A | z ∈ [0.000, 0.005] | silicon (heated layer) |
| Material B | z ∈ [0.005, 0.010] | copper (spreader) |

Total dimensions: 5 mm × 5 mm × 10 mm.

Material properties — including Poisson's ratio — live in
`materials.json`. Use those values.

## Boundary and initial conditions

**Thermal**
- **z = 0** (silicon bottom): fixed inward heat flux
  `q_in = 1.0e6 W/m²`.
- **z = L_z** (copper top): fixed temperature `T = T_ref = 298 K`.
- **Lateral faces** (x = 0, x = L_x, y = 0, y = L_y): adiabatic
  (zero heat flux — natural BC, nothing to enforce explicitly).
- **Initial:** `T(x, 0) = T_ref` everywhere.
- **Time horizon:** integrate to at least `t_end = 5 s` (well past
  steady state).

**Mechanical** (steady-state at final temperature)
- **z = L_z face:** fully clamped (u_x = u_y = u_z = 0).
- All other faces: traction-free (natural BC).
- Stress-free reference state at `T_ref = 298 K`.

## Constitutive law

Linear isotropic elasticity with thermal strain:

```
σ = λ tr(ε - ε_th) I + 2 μ (ε - ε_th)
ε_th = α (T - T_ref) I
```

where λ, μ are the Lamé parameters derived from E and ν for each
material. Material properties are piecewise constant in z; both σ
and the displacement field will be discontinuous in their gradients
at the bonded interface.

## Required deliverables (in this folder)

- [ ] `solver.py` — your 3D FEM solver
- [ ] `temperature_slice.png` — T contour on the y = L_y/2 mid-plane
      at steady state (or several snapshots)
- [ ] `temperature_timeseries.png` — T(t) at centerline probes
      `z ∈ {0, L_z/4, L_z/2, 3L_z/4, L_z}` at (x, y) = (L_x/2, L_y/2)
- [ ] `stress_slice.png` — von Mises (or σ_xx) on the y = L_y/2
      mid-plane at steady state
- [ ] `report.md` — engineering brief with **at least**:
  - Peak T and its (x, y, z) location
  - Peak von Mises stress and its (x, y, z) location and material
  - Interface jump magnitude in σ_xx along the centerline
  - Time to reach 95 % of the steady-state ΔT at the interface
    centerline

## Suggested approach

- **Library**: `scikit-fem` (`uv pip install scikit-fem` if needed —
  it's in the workshop venv already).
- **Mesh**: `MeshTet.init_tensor` to build a structured tet mesh on
  the brick. A `(6, 6, 14)` segmentation is plenty for accuracy.
- **Heat equation**: scalar Lagrange P1 elements. Assemble M (mass)
  and K (conductivity) by **subdomain** — split elements by z
  centroid so the two materials are integrated separately, then sum.
- **Time integration**: **implicit Euler** is the workshop-friendly
  choice. Pre-factorise `(M + Δt K)` once and reuse. `Δt = 0.02 s`
  is comfortable.
- **Mechanical**: `ElementVector(ElementTetP1())`. Bilinear form for
  isotropic elasticity (use `sym_grad`, `trace`, `ddot` helpers).
  Right-hand side for thermal load: integrate `3·K_bulk·α·(T-T_ref)
  · div(v)` element-by-element with `T` interpolated from the scalar
  basis to quadrature points.

## Statistical analysis required

- Peak T (where, what value)
- Peak |σ_vm| (where, in which material)
- Time to 95 % steady-state ΔT at the interface centerline
- Interface stress jump magnitude (centerline)

## Ground rules

- **Don't write the solver yourself.** The agent does it from
  scratch in `scikit-fem`.
- **Don't paper over bugs.** A NaN, an off-by-sign, or a stress field
  that's smooth across the interface (it shouldn't be) is a real
  failure that must be diagnosed.
- **Validate against the analytical 1-D steady-state limit.** Since
  lateral faces are adiabatic, the centerline T profile should match
  a 1-D conduction calculation: piecewise linear with slope ratio
  k_Cu/k_Si ≈ 2.71 between segments. Confirm.

## Stretch goals

- Use the transient temperature history to compute σ_vm(t) at the
  interface centerline — i.e., make the mechanical solve transient
  too. Plot peak |σ_vm| over time.
- Add convective cooling on the top face: replace the Dirichlet BC
  with `h (T - T_ambient)` and find h such that peak die temperature
  is bounded below 360 K.
- Refine the mesh by 2× in each direction and check that the peak
  stress changes by less than 5 % — a real mesh-convergence study.
