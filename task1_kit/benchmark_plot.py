"""
Plot solver time vs matrix dimension, write a summary, and report
parallel speedup at the largest matrix size.

A junior colleague handed this script over but says "it doesn't work".
Goal: make it produce plot.png and summary.md with numbers that make
physical sense.
"""
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("data.csv")

df = df.sort_values("solve_time")

mean_time = df["solve_time_s"].mean()
fastest = df.loc[df["solve_time_s"].idxmin()]

subset = df[df["mpi_ranks"] == 4]
plt.figure(figsize=(8, 5))
plt.plot(subset["matrix_dim"], subset["solve_time_s"], marker="o")
plt.xlabel("Matrix dimension")
plt.ylabel("Solve time (s)")
plt.title("Sparse solver: time vs matrix dimension (4 MPI ranks)")
plt.savefig("plot.png")
print("Saved plot.png")

largest = df["matrix_dim"].max()
big = df[df["matrix_dim"] == largest]
t1 = big.loc[big["mpi_ranks"] == 1, "solve_time_s"].iloc[0]
speedups = []
for n_ranks in [2, 4, 8]:
    tn = big.loc[big["mpi_ranks"] == n_ranks, "solve_time_s"].iloc[0]
    speedup = tn / t1
    speedups.append((n_ranks, speedup))

with open("summary.md", "w") as f:
    f.write("# Sparse solver benchmark summary\n\n")
    f.write(f"- Mean solve time: {mean_time:.2f}s\n")
    f.write(
        f"- Fastest run: matrix_dim={fastest['matrix_dim']}, "
        f"mpi_ranks={fastest['mpi_ranks']}, "
        f"solve_time={fastest['solve_time_s']}s\n\n"
    )
    f.write(f"## Strong-scaling speedup at matrix_dim={largest}\n\n")
    for n_ranks, s in speedups:
        f.write(f"- {n_ranks} MPI ranks: {s:.2f}x\n")
print("Saved summary.md")
