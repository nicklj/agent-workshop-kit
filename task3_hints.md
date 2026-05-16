# Task 3 escalating hints (facilitator playbook)

`scikit-fem` is the assumed library. Walk down the ladder.

## If the agent stalls picking a library

- **Hint 1:** "The workshop venv already has `scikit-fem` installed.
  Use that."
- **Hint 2:** "scikit-fem uses Lagrange P1 elements on tet meshes.
  Heat conduction examples are in its docs under 'ex01' / 'ex03'."

## If the mesh setup is wrong

- **Hint 1:** "Use `MeshTet.init_tensor(xs, ys, zs)` for a
  structured tet mesh on a box."
- **Hint 2:** "Tag elements by z centroid to assign materials.
  `z_centroid = mesh.p[2, mesh.t].mean(axis=0)`."

## If T goes the wrong direction at z = 0

The most common bug.

- **Hint 1:** "Watch T at z = 0 over time. Should it rise or fall?
  Heat is entering."
- **Hint 2:** "Your Neumann BC should add to the RHS, not subtract.
  For the weak form `∫ k ∇T·∇v dx = ∫_∂ q·n v ds`, with q pointing
  out of the domain at z = 0, the inflow gives positive contribution
  to the RHS at that face."
- **Hint 3:** "Assemble the boundary load with
  `FacetBasis(mesh, e_T, facets=mesh.facets_satisfying(lambda x:
  np.isclose(x[2], 0)))` and a linear form `v -> q_in * v`."

## If only one material is used (slope kink missing)

Symptom: T profile is a straight line from z = 0 to z = L_z instead
of two segments with different slopes.

- **Hint 1:** "Your assembly is using one conductivity value. But k
  changes at z = 0.005 m. How are you handling the two materials?"
- **Hint 2:** "Split the elements into two subdomains. Create two
  bases with `Basis(mesh, e_T, elements=elems_A_idx)` and
  `Basis(mesh, e_T, elements=elems_B_idx)`. Assemble K and M on each
  separately, then sum: `K = k_A * asm(diff, basis_A) + k_B * asm(diff,
  basis_B)`."

## If T keeps rising forever (no steady state)

- **Hint:** "Did you constrain T at z = L_z? The Dirichlet BC there
  is what makes the problem well-posed."
- "Use `D_top = basis_T.get_dofs(lambda x: np.isclose(x[2], Lz))`
  and apply with `condense`."

## If the time loop produces NaN immediately

- **Hint 1:** "Implicit Euler is unconditionally stable. If you're
  blowing up, the system matrix is probably wrong — print the
  condition number or check `M + dt*K` is positive definite."
- **Hint 2:** "Did you forget to apply Dirichlet BCs inside the
  time loop? Apply them at every step, not just once."

## If `condense` returns the wrong shape

- **Hint:** "`condense(A, b, x=x, D=D)` returns four values:
  `A_reduced, b_reduced, x_prescribed, free_indices`. Unpack all
  four and reconstruct the full solution: `x[free_indices] =
  spsolve(A_reduced, b_reduced)`."

## If the mechanical solve gives a singular matrix

- **Hint:** "Your stiffness matrix has rigid-body modes — you need
  enough Dirichlet BCs to remove them. Clamp the top face fully
  (all three components of u on z = L_z)."

## If the thermal load form errors on interpolation

- **Hint:** "Pass `T=basis_T_A.interpolate(T)` (the *scalar* basis,
  restricted to the same subdomain as the vector basis you're
  assembling on). They share quadrature points so it works.
  Don't try to interpolate a scalar field through a vector basis."

## If stress is smooth across the interface (jump missing)

- **Hint 1:** "σ should be discontinuous at z = 5 mm because E and
  α both change. If your plot is smooth there, you're either
  averaging stress across the interface, or computing it with the
  wrong material properties on one side."
- **Hint 2:** "Compute stress per element using each element's own
  material properties (`elems_A` vs `elems_B`), then plot per
  element with `shading='flat'` — no smoothing."

## If the agent skips validation

- **Hint:** "The centerline T should match a 1-D conduction
  analytical solution: piecewise-linear with slope ratio
  k_Cu/k_Si ≈ 2.71. Compute the analytical T(0) = T_ref + q·(L_A/k_A
  + L_B/k_B) ≈ 344 K and confirm your numerical answer."

## If the report has no statistics

- **Hint:** "Report at least: peak T (value + location), peak von
  Mises stress (value + location + material), time to 95 %
  steady-state ΔT at the interface centerline, and the σ_xx jump
  magnitude across the interface on the centerline."

## If the agent loops on an API issue

- Restart with a tighter prompt. Paste the *current* solver state
  and the *exact* error message. Ask for a single targeted fix
  rather than a redesign.

## Whole-room stuck

Switch to demo mode. Open `../task3_reference_solver.py` on the
projector and walk through it section by section — mesh, heat
assembly, time loop, mechanical assembly, post-processing. Even
watching is the lesson here.
