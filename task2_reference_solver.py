"""Reference 3D transient-thermal + steady-state thermomechanical FEM."""
import json
from pathlib import Path
import numpy as np
from scipy.sparse.linalg import spsolve
from skfem import MeshTet, Basis, FacetBasis, ElementTetP1, ElementVector
from skfem import BilinearForm, LinearForm, asm, condense
from skfem.helpers import dot, grad, ddot, sym_grad, trace, div

# Load materials (script-relative path, so any facilitator can run this).
HERE = Path(__file__).resolve().parent
mats = json.loads((HERE / "task2_kit" / "materials.json").read_text())
A_props = mats["material_A"]
B_props = mats["material_B"]
T_ref = mats["T_ref_K"]
q_in = 1.0e6

# Geometry
Lx, Ly, Lz = 5e-3, 5e-3, 10e-3
nx, ny, nz = 6, 6, 14
xs = np.linspace(0, Lx, nx + 1)
ys = np.linspace(0, Ly, ny + 1)
zs = np.linspace(0, Lz, nz + 1)
mesh = MeshTet.init_tensor(xs, ys, zs)
print(f"mesh: {mesh.nvertices} nodes, {mesh.nelements} tets")

# Element-wise subdomain mask
elem_z = mesh.p[2, mesh.t].mean(axis=0)
interface_z = A_props["z_range_m"][1]
elems_A = np.where(elem_z < interface_z)[0]
elems_B = np.where(elem_z >= interface_z)[0]

# Bases
e_T = ElementTetP1()
basis_T = Basis(mesh, e_T)
basis_TA = Basis(mesh, e_T, elements=elems_A)
basis_TB = Basis(mesh, e_T, elements=elems_B)

# Heat forms
@BilinearForm
def diff(u, v, _):
    return dot(grad(u), grad(v))

@BilinearForm
def mass(u, v, _):
    return u * v

k_A = A_props["thermal_conductivity_W_m_K"]
k_B = B_props["thermal_conductivity_W_m_K"]
rhocp_A = A_props["density_kg_m3"] * A_props["specific_heat_J_kg_K"]
rhocp_B = B_props["density_kg_m3"] * B_props["specific_heat_J_kg_K"]

K = k_A * asm(diff, basis_TA) + k_B * asm(diff, basis_TB)
M = rhocp_A * asm(mass, basis_TA) + rhocp_B * asm(mass, basis_TB)

# Neumann flux: facets on z=0
facet_basis_bot = FacetBasis(mesh, e_T, facets=mesh.facets_satisfying(lambda x: np.isclose(x[2], 0)))

@LinearForm
def boundary_flux(v, _):
    return v

f_flux = q_in * asm(boundary_flux, facet_basis_bot)
print(f"total inflow flux: {f_flux.sum():.2e} W (should be {q_in * Lx * Ly:.2e} W)")

# Dirichlet on z=Lz
D_top = basis_T.get_dofs(lambda x: np.isclose(x[2], Lz))

# Transient with implicit Euler
T = np.full(basis_T.N, T_ref)
T[D_top] = T_ref

dt = 0.02
t_end = 5.0
n_steps = int(t_end / dt)
print(f"dt = {dt} s, steps = {n_steps}")

A_lhs = (M + dt * K).tocsc()

# Pre-compute reduced system structure: condense once for solve pattern
# We'll redo condense each step (small mesh, fast enough)

# Probe locations along the centerline (x=Lx/2, y=Ly/2, varying z)
centerline_z = [0.0, 2.5e-3, 5.0e-3, 7.5e-3, 10.0e-3]
probe_dofs = []
for z_t in centerline_z:
    target = np.array([Lx/2, Ly/2, z_t])
    dists = np.linalg.norm(mesh.p.T - target, axis=1)
    probe_dofs.append(int(np.argmin(dists)))

snapshot_times = [0.05, 0.5, 1.0, 2.0, 5.0]
snapshots = {}

probe_history = []
times = []

import time as wall
t0 = wall.time()

t = 0.0
record_idx = 0
for step in range(n_steps):
    rhs = M @ T + dt * f_flux
    # Apply Dirichlet: enforce T = T_ref on D_top
    # condense returns reduced A, b, plus the prescribed x
    A_red, b_red, x_red, I = condense(A_lhs, rhs, x=T, D=D_top)
    T_new_red = spsolve(A_red, b_red)
    T_new = T.copy()
    T_new[I] = T_new_red
    T_new[D_top] = T_ref
    T = T_new
    t += dt
    probe_history.append([T[d] for d in probe_dofs])
    times.append(t)
    if record_idx < len(snapshot_times) and t >= snapshot_times[record_idx]:
        snapshots[snapshot_times[record_idx]] = T.copy()
        record_idx += 1

print(f"thermal time-loop took {wall.time()-t0:.1f}s wall")

probe_history = np.array(probe_history)
times = np.array(times)

# Print final-time temperatures at probes
print("\n--- Final-time temperature at centerline probes ---")
for j, z_t in enumerate(centerline_z):
    Tf = T[probe_dofs[j]]
    print(f"  z = {z_t*1000:5.2f} mm:  T = {Tf:7.2f} K  (DT = {Tf - T_ref:+.2f} K)")

print(f"\nPeak T anywhere: {T.max():.2f} K at node {T.argmax()} (coord {mesh.p[:, T.argmax()].round(4)})")
ss_T = T.copy()

# Time to 95% steady-state at interface probe (index 2: z=5mm)
i_iface = 2
ss = probe_history[-1, i_iface]
target_DT = 0.95 * (ss - T_ref)
hit_idx = np.argmax(probe_history[:, i_iface] - T_ref >= target_DT)
print(f"\n95% steady-state DT at interface (z=5mm): t = {times[hit_idx]:.3f} s")

# ============== mechanical: steady-state linear elasticity with thermal load ==============
print("\n--- mechanical solve ---")

e_u = ElementVector(ElementTetP1())
basis_u = Basis(mesh, e_u)
basis_uA = Basis(mesh, e_u, elements=elems_A)
basis_uB = Basis(mesh, e_u, elements=elems_B)

def lame(E_mod, nu):
    lam = E_mod * nu / ((1 + nu) * (1 - 2 * nu))
    mu = E_mod / (2 * (1 + nu))
    return lam, mu

E_A = A_props["youngs_modulus_Pa"]
nu_A = A_props["poisson_ratio"]
E_B = B_props["youngs_modulus_Pa"]
nu_B = B_props["poisson_ratio"]
lam_A, mu_A = lame(E_A, nu_A)
lam_B, mu_B = lame(E_B, nu_B)
alpha_A = A_props["thermal_expansion_per_K"]
alpha_B = B_props["thermal_expansion_per_K"]

@BilinearForm
def elastic(u, v, w):
    lam, mu = w.lam, w.mu
    eps_u = sym_grad(u)
    eps_v = sym_grad(v)
    return 2 * mu * ddot(eps_u, eps_v) + lam * trace(eps_u) * trace(eps_v)

@LinearForm
def thermal_load_form(v, w):
    # Thermal load: integral over each elem of (3 K_bulk alpha (T - T_ref)) div(v).
    # For isotropic linear elasticity, sigma_th = -3 K_bulk alpha dT I,
    # with K_bulk = E / (3(1-2nu)) = lam + (2/3) mu.
    K_bulk = w["lam"] + (2.0 / 3.0) * w["mu"]
    return 3 * K_bulk * w["alpha"] * (w["T"] - T_ref) * div(v)

K_mech = (asm(elastic, basis_uA, lam=lam_A, mu=mu_A)
          + asm(elastic, basis_uB, lam=lam_B, mu=mu_B))

f_th = (asm(thermal_load_form, basis_uA, lam=lam_A, mu=mu_A, alpha=alpha_A, T=basis_TA.interpolate(T))
        + asm(thermal_load_form, basis_uB, lam=lam_B, mu=mu_B, alpha=alpha_B, T=basis_TB.interpolate(T)))

print("K_mech shape:", K_mech.shape, "f_th shape:", f_th.shape)

# Mechanical BCs: clamp z=Lz face (uz=0, ux,uy free OR fully clamped)
# Let's fully clamp z=Lz to anchor displacements
D_mech_top_x = basis_u.get_dofs(lambda x: np.isclose(x[2], Lz)).nodal["u^1"]
D_mech_top_y = basis_u.get_dofs(lambda x: np.isclose(x[2], Lz)).nodal["u^2"]
D_mech_top_z = basis_u.get_dofs(lambda x: np.isclose(x[2], Lz)).nodal["u^3"]
D_mech = np.concatenate([D_mech_top_x, D_mech_top_y, D_mech_top_z])

u = np.zeros(basis_u.N)
A_red, b_red, x_red, I = condense(K_mech, f_th, x=u, D=D_mech)
u_red = spsolve(A_red, b_red)
u[I] = u_red

# Compute stress: sigma = C : eps_elastic = lam tr(eps_total - eps_th) I + 2 mu (eps_total - eps_th)
# We'll evaluate at element centroids
# eps_total = sym_grad(u), eps_th = alpha (T - T_ref) I
# Easier: directly evaluate stress at element centroids using element-local strains.
# Use scikit-fem's quadrature

def compute_stress_centroid(basis_u_sub, u, lam_v, mu_v, alpha_v, basis_T_sub, T_v):
    # interpolate u and T at quadrature; compute eps; subtract thermal; compute sigma; average per elem
    u_grad = basis_u_sub.interpolate(u).grad
    T_q = basis_T_sub.interpolate(T_v)
    eps = 0.5 * (u_grad + u_grad.swapaxes(0, 1))
    eps_th_diag = alpha_v * (T_q - T_ref)
    eps_elastic = eps.copy()
    for i in range(3):
        eps_elastic[i, i] = eps[i, i] - eps_th_diag
    tr = sum(eps_elastic[i, i] for i in range(3))
    sigma = np.zeros_like(eps)
    for i in range(3):
        for j in range(3):
            sigma[i, j] = 2 * mu_v * eps_elastic[i, j]
        sigma[i, i] = sigma[i, i] + lam_v * tr
    # Average over quadrature -> per element
    sigma_elem = sigma.mean(axis=-1)
    return sigma_elem  # shape (3, 3, n_elements)

sigma_A = compute_stress_centroid(basis_uA, u, lam_A, mu_A, alpha_A, basis_TA, T)
sigma_B = compute_stress_centroid(basis_uB, u, lam_B, mu_B, alpha_B, basis_TB, T)

def vm(sig):
    sxx, syy, szz = sig[0,0], sig[1,1], sig[2,2]
    sxy, syz, szx = sig[0,1], sig[1,2], sig[0,2]
    return np.sqrt(0.5*((sxx-syy)**2 + (syy-szz)**2 + (szz-sxx)**2) + 3*(sxy**2 + syz**2 + szx**2))

vm_A = vm(sigma_A)
vm_B = vm(sigma_B)
sxx_A, sxx_B = sigma_A[0,0], sigma_B[0,0]
szz_A, szz_B = sigma_A[2,2], sigma_B[2,2]

print(f"\n  von Mises (Si side): min={vm_A.min()/1e6:.2f}  max={vm_A.max()/1e6:.2f} MPa")
print(f"  von Mises (Cu side): min={vm_B.min()/1e6:.2f}  max={vm_B.max()/1e6:.2f} MPa")
print(f"\n  sigma_xx (Si side): min={sxx_A.min()/1e6:.2f}  max={sxx_A.max()/1e6:.2f} MPa")
print(f"  sigma_xx (Cu side): min={sxx_B.min()/1e6:.2f}  max={sxx_B.max()/1e6:.2f} MPa")
print(f"  sigma_zz (Si side): min={szz_A.min()/1e6:.2f}  max={szz_A.max()/1e6:.2f} MPa")
print(f"  sigma_zz (Cu side): min={szz_B.min()/1e6:.2f}  max={szz_B.max()/1e6:.2f} MPa")

print(f"\nmax displacement magnitude: {np.linalg.norm(u.reshape(-1, 3), axis=1).max()*1e6:.2f} um")
