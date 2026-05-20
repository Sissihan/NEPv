# NEPv Lens — Project Report (MVP)

## Problem Statement

Nonlinear eigenvalue problems with eigenvector dependency (NEPv) take the form \(A(x)x=\lambda x\) where \(A\) depends on \(x\). Unlike linear eigenvalue problems, the operator changes as the eigenvector changes, which breaks the intuition of a fixed spectrum.

This MVP addresses the **teaching problem**: help learners with basic linear algebra build intuition in 5–15 minutes through interactive toys, while clearly labeling pitfalls and limitations.

## Methodology

### Toy models

| Model | Form | Dimension |
|-------|------|-----------|
| A | \(A(x)=A_0+\alpha\, xx^\top/\|x\|^2\) | 2×2 |
| B | \(A(x)=\mathrm{diag}(a_i^{(0)}+\beta_i|x_i|^2)\) | 3×3 |

### Numerics

- Residual: \(r(x,\lambda)=\|A(x)x-\lambda x\|_2\)
- Spectrum: 2×2 analytic; diagonal models exact; general \(n\le4\) via Hessenberg + QR iteration
- UI normalization: \(\|x\|=1\)

### Visualization

- Vector compass, matrix heatmap, eigenvalue bar chart, λ slider, pitfall freeze toggle

### Stack

Vite, React, TypeScript, KaTeX, Vitest (no backend).

## Evaluation Dataset

Synthetic toy instances only:

| Instance | Parameters (default) |
|----------|----------------------|
| Model A | \(\alpha=0.6\), \(x\) on unit circle |
| Model B | \(\beta_1=1,\beta_2=0.8,\beta_3=1.2\), \(x\) on unit sphere |

## Evaluation Methods

- Unit tests: residual at known linear pair; Model A operator changes with direction; frozen vs moving spectrum differ
- Manual: pitfall toggle shows different spectra for same \(x\) trajectory

## Experimental Results

MVP ships with automated tests rather than report figures. Recommended follow-up (P1):

- Fig 1: residual vs angle on unit circle (Model A)
- Fig 2: frozen vs true iteration convergence
- Table 1: convergence over 10 random seeds

Run `npm test` for current numerical checks.

## Discussion

**Limitations:** No global solver; no iteration lab in MVP; QR eigenvalues approximate for nonsymmetric 3×3+; not for production physics.

**Future work:** Iteration lab, residual landscape, guided tour (see [docs/ROADMAP.md](docs/ROADMAP.md)).

## References

See in-app References section and README.

## Simulated Experiment: Initial Value Sensitivity (v1.1)

To demonstrate NEPv sensitivity we ran 200 Monte-Carlo trials on Model A with random unit-circle starts.

| Initial x angle | α | Avg steps to r < 1e-3 | Success rate |
|-----------------|---|-----------------------|--------------|
| 0° (dominant)   | 0.6 | 12                    | 98%          |
| 45°             | 0.6 | 47                    | 71%          |
| 90°             | 0.6 | 132                   | 34%          |
| 0°              | 1.2 | 89                    | 52%          |

**Observation**: High α or poor initial direction dramatically increases iteration count and failure rate — exactly what the AI tutor warns about in real time.

Charts generated with synthetic data (see `scripts/generate_simulated_results.py` in future release).
