# NEPv Lens

Interactive teaching demo for **nonlinear eigenvalue problems with eigenvector dependency** (NEPv):

\[
A(x)\,x = \lambda x
\]

where the operator \(A\) depends on the unknown vector \(x\).

## 手册（Word，含界面截图）

- **推荐（含 37 张控件截图）**：`docs/NEPv-Lens-Manual-With-Screenshots.docx`
- 截图源文件：`docs/manual-screenshots/`（由 Playwright 自动截取）
- 重新生成（需先 `npm run build`）：

```bash
python scripts/capture_manual_screenshots.py   # 截取全部按钮/选择框/滑块
python scripts/generate_manual_docx.py         # 写入 Word
```

依赖：`pip install python-docx playwright` 且 `python -m playwright install chromium`

## Quick start

**Requirements:** Node.js 18+

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

1. **Stage 0** — Read the NEPv **consistent solution** definition and linear vs NEPv comparison.
2. **Stage 1** — Drag the compass, tune **guess λ** separately from **relative residual** \(r_{\mathrm{rel}}\), explore the **polar plot** \(r(\theta)\) (click minima to snap the compass).
3. **Stage 2** — Run **SCF iteration** (max / min / closest-to-λ eigenvector pick), trajectory overlay, convergence diagnostics.
4. **Stage 3** — Switch **Model A** (rank-one), **Model B** (diagonal 2×2 / 3×3), **Model C** (nonsymmetric, complex \(\mu_i\)).
5. **Stage 4** — Interactive pitfalls FAQ (“Try it” links freeze-A, scale slider, Model C).
6. **References** panel at the bottom; **AI Math Tutor** (rule-based, API-ready).

## Docker (fallback)

Requires [Docker](https://www.docker.com/) installed:

```bash
docker-compose up --build
```

Open http://localhost:5173 — no local Node.js required.

## Scripts

```bash
bash scripts/setup-env.sh    # install + test (Node >= 18.17.0)
bash scripts/verify-build.sh   # build + test + gzip < 500KB
```

Copy `.env.example` to `.env` if you need `VITE_MATRIX_MAX_DIM=4`.

## Languages / 语言

The UI supports **English**, **简体中文**, and **繁體中文**. Use the language selector in the top navigation. Your choice is saved in `localStorage` (`nepv-lens-locale`). On first visit, the browser language is detected automatically.

## Teaching narrative (five stages)

| Stage | Section | Goal |
|-------|---------|------|
| 0 | Compare | Wrong intuition → formal NEPv definition |
| 1 | Playground + polar \(r(\theta)\) | Residual landscape, freeze-A contrast |
| 2 | Iteration lab | Transparent SCF, trajectory, diagnostics |
| 3 | Model switcher | A / B / C behaviour and physics blurbs |
| 4 | Pitfalls + References | Interactive FAQ, citations |

**Terminology (enforced in UI):** guess **λ** ≠ instantaneous spectrum **μᵢ** ≠ **relative residual** \(r_{\mathrm{rel}}\).

**Primary residual (UI):**

\[
r_{\mathrm{rel}}=\frac{\|A(x)x-\lambda x\|_2}{\|A(x)x\|_2+\|\lambda x\|_2}
\]

Absolute \(\|A(x)x-\lambda x\|_2\) is shown on hover / secondary label. See `src/math/nepv.ts`.

## Models

| ID | Formula (2D unless noted) | Motif |
|----|---------------------------|--------|
| **A** `rank-one-2x2` | \(A(x)=A_0+\alpha\,xx^\top/\|x\|^2\) | Photonic / scattering toy |
| **B** `diagonal-2x2` | \(A(x)=\mathrm{diag}(a_i+\alpha x_i^2)\) | Two-level / Kohn–Sham-like; axis analytic branches |
| **C** `nonsymmetric-2x2` | State-dependent off-diagonal | Non-Hermitian / complex \(\mu_i\) |
| **B3** `diagonal-3x3` | Diagonal scaling in \(\mathbb{R}^3\) | Richer diagonal play (no polar plot) |

Implementations: `src/models/`.

## Libraries

- **KaTeX** `0.16.11` (npm) + CSS from jsDelivr CDN in `index.html` for formulas (`MathBlock.tsx`).
- **React 18** + **Vite 5**; polar plot and compass are custom SVG (no D3/Plotly).

## Design

- **Coupling Compass**: \(x\) is the needle; \(A(x)\) is the terrain; bars show **instantaneous** \(\mu_i\) of the current \(A(x)\).
- \(\|x\|=1\) fixes scale equivalence; FAQ scale slider demonstrates invariance.
- **Freeze A**: locks \(A(x_0)\); dual residuals show linear EVP vs true NEPv.

See [docs/ROADMAP.md](docs/ROADMAP.md) and [NEPv-Visualization-PRD.md](NEPv-Visualization-PRD.md).

## Limitations

- **2D teaching focus** for polar plot and compass; 3×3 model has no \(r(\theta)\) sweep.
- **SCF only** — no Newton / continuation solvers; iteration is initial-value sensitive.
- **AI tutor** is rule-based (`src/ai/tutor.ts`); swap `askAI()` for an LLM API when ready.
- **Not yet**: α–branch bifurcation / parameter-scan plot (roadmap); hero bowl→multipeak animation.
- Does **not** certify global convergence or enumerate all solutions.

## References

See [REPORT.md](REPORT.md) for methodology, limitations, and bibliography.

## AI Assistance

Client-side **AI Math Tutor** (right sidebar) reads model id, \(\alpha/\beta\), \(x\), guess \(\lambda\), \(r_{\mathrm{rel}}\), freeze mode, iteration step/history, and spectral-gap / Lipschitz hints. Preset questions (e.g. “Why not converging?”) call `askAI()` in `src/ai/tutor.ts`. Replace that function with `fetch()` to OpenAI/Claude when deploying (e.g. `VITE_OPENAI_KEY` via a proxy).

## AI usage

See [docs/AI_USAGE.md](docs/AI_USAGE.md).

## Deploy (GitHub Pages)

```bash
npm run build
# Deploy contents of dist/ to gh-pages; set vite base to your repo name if needed.
```
