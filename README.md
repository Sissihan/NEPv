# NEPv Lens

Interactive teaching demo for **nonlinear eigenvalue problems with eigenvector dependency** (NEPv):

\[
A(x)\,x = \lambda x
\]

where the operator \(A\) depends on the unknown vector \(x\).

## Operation manual (Word, with screenshots)

- **Recommended:** `docs/NEPv-Lens-Manual-With-Screenshots.docx` (English UI, 45+ control screenshots)
- **Alternate:** `docs/NEPv-Lens-Installation-Deployment-and-Operation-Manual.docx`
- Screenshot assets: `docs/manual-screenshots/` (Playwright)
- Regenerate (build first):

```bash
npm run build
python scripts/capture_manual_screenshots.py
python scripts/generate_manual_docx.py
```

Requires: `pip install python-docx playwright` and `python -m playwright install chromium`

## Quick start

**Requirements:** Node.js 18.17+

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

```bash
npm test          # unit tests for math core
npm run build     # production build → dist/
npm run preview   # preview production build
```

## What you can do

1. **Intro** — Read the NEPv definition and the linear EVP vs NEPv comparison (side-by-side intro band).
2. **Lab** — Drag the vector compass, tune **guess λ** and **relative residual** \(r_{\mathrm{rel}}\), view heatmap and spectrum, explore the **polar plot** \(r(\theta)\).
3. **Iteration** — Run **SCF-style iteration** (max / min / closest-to-λ eigenvector pick), trajectory overlay, convergence diagnostics.
4. **Models** — Switch **Model A** (rank-one 2×2), **Model B** (diagonal 2×2 / 3×3), **Model C** (nonsymmetric 2×2, complex \(\mu_i\)).
5. **Pitfalls** — FAQ and “Try it” links (freeze \(A\), scale invariance, complex pairs).
6. **AI Math Tutor** — Full-width section under the lab (rule-based, API-ready).
7. **References** — Collapsible bibliography at the bottom.

## Docker (optional)

Requires [Docker](https://www.docker.com/):

```bash
docker-compose up --build
```

Open http://localhost:5173 — no local Node.js required.

## Helper scripts

```bash
bash scripts/setup-env.sh     # install + test (Node >= 18.17.0)
bash scripts/verify-build.sh  # build + test + gzip budget check
```

Copy `.env.example` to `.env` if you need `VITE_MATRIX_MAX_DIM=4`.

## Languages

The UI supports **English**, **Simplified Chinese**, and **Traditional Chinese** via the locale selector in the top navigation. The choice is stored in `localStorage` (`nepv-lens-locale`). On first visit, the browser language is detected automatically.

## Teaching flow

| Step | Section | Focus |
|------|---------|--------|
| 0 | Definition & Compare | Intuition vs formal NEPv statement |
| 1 | Lab + polar \(r(\theta)\) | Residual landscape, freeze-\(A\) pitfall |
| 2 | Iteration lab | Transparent SCF, trajectory, diagnostics |
| 3 | Model switcher | Models A / B / C and physics notes |
| 4 | Pitfalls + References | Interactive FAQ, citations |

**Terminology (enforced in UI):** guess **λ** ≠ instantaneous spectrum **μᵢ** ≠ **relative residual** \(r_{\mathrm{rel}}\).

**Primary residual (UI):**

\[
r_{\mathrm{rel}}=\frac{\|A(x)x-\lambda x\|_2}{\|A(x)x\|_2+\|\lambda x\|_2}
\]

Absolute \(\|A(x)x-\lambda x\|_2\) is shown as a secondary readout. See `src/math/nepv.ts`.

## Models

| ID | Formula (2D unless noted) | Motif |
|----|---------------------------|--------|
| **A** `rank-one-2x2` | \(A(x)=A_0+\alpha\,xx^\top/\|x\|^2\) | Photonic / scattering toy |
| **B** `diagonal-2x2` | \(A(x)=\mathrm{diag}(a_i+\beta_i x_i^2)\) | Two-level / Kohn–Sham-like |
| **C** `nonsymmetric-2x2` | State-dependent off-diagonal | Non-Hermitian / complex \(\mu_i\) |
| **B3** `diagonal-3x3` | Diagonal scaling in \(\mathbb{R}^3\) | 3D diagonal play (no polar sweep) |

Implementations: `src/models/`.

## Stack

- **React 18** + **TypeScript** + **Vite 8**
- **KaTeX** for formulas (`MathBlock.tsx`)
- **Vitest** for unit tests
- Polar plot and compass: custom SVG (no D3/Plotly)

## Design notes

- **Coupling compass:** \(x\) is the needle; \(A(x)\) is the terrain; bars show **instantaneous** \(\mu_i\) of the current \(A(x)\).
- \(\|x\|=1\) fixes scale; pitfalls explain scale invariance.
- **Freeze \(A\):** locks \(A(x_0)\); dual spectra show linear EVP vs true NEPv.

See [docs/ROADMAP.md](docs/ROADMAP.md) and [NEPv-Visualization-PRD.md](NEPv-Visualization-PRD.md).

## Limitations

- **2D focus** for polar plot and compass; the 3×3 model has no \(r(\theta)\) sweep.
- **SCF only** — no Newton / continuation solvers; convergence depends on the initial direction.
- **AI tutor** is rule-based (`src/ai/tutor.ts`); replace `askAI()` with an LLM API when ready.
- **Not yet:** α–branch bifurcation scan; hero bowl→multipeak animation (roadmap).
- Does **not** certify global convergence or enumerate all solutions.

## Project report

See [REPORT.md](REPORT.md) for problem statement, methodology, evaluation, and results.

## AI Math Tutor

The tutor reads model id, \(\alpha/\beta\), \(x\), guess \(\lambda\), \(r_{\mathrm{rel}}\), freeze mode, iteration step/history, and spectral-gap / Lipschitz hints. Preset questions (e.g. “Why not converging?”) call `askAI()` in `src/ai/tutor.ts`. For production, swap in `fetch()` to OpenAI/Claude behind a proxy (e.g. `VITE_OPENAI_KEY`).

See [docs/AI_USAGE.md](docs/AI_USAGE.md) for AI-assisted development notes.

## Deploy (GitHub Pages)

```bash
npm run build
# Deploy dist/ to gh-pages; set Vite `base` to your repo name if needed.
```
