# NEPv Lens — Detailed Implementation Roadmap

Based on [NEPv-Visualization-PRD.md](../NEPv-Visualization-PRD.md). Assumes **~12 working days** (2 weeks part-time); scale linearly if full-time.

---

## 1. Roadmap Overview

| Phase | Duration | Theme | Primary outcomes |
|-------|----------|--------|------------------|
| **Phase 0** | Days 1–2 | Research & foundations | Toy models chosen, notation locked, repo scaffolded |
| **Phase 1** | Days 3–4 | Numerical core | `nepv.ts`, models, tests green |
| **Phase 2** | Days 5–7 | P0 UI (“Coupling Compass”) | Playground, pitfall, compare — US-1, US-2 |
| **Phase 3** | Days 8–9 | Content & pedagogy | Pitfalls, methods, references — F-05, F-06 |
| **Phase 4** | Days 10–11 | Docs, report, polish | README, REPORT, AI_USAGE, optional P1 |
| **Phase 5** | Day 12 | Release | GitHub Pages, DoD checklist |

**Critical path:** Research → Model A math → Core solver → Playground → Pitfall → README/REPORT → Deploy.

---

## 2. Pre-Implementation Decisions (Day 0)

Resolve PRD §15 open questions before coding:

| Decision | Recommended default | Impact |
|----------|---------------------|--------|
| Q1 Complex vs real UI | Real 2D/3D for \(x\); \(\lambda\) as magnitude + phase if complex | Viz components |
| Q2 Routing | Single-page with anchor nav | Routing, GH Pages `base` |
| Q3 WebGL | No for P0; heatmap + bar charts only | Scope control |
| Q4 Languages | English UI; REPORT in Chinese or English (pick one) | Copy workload |

**Stack lock (PRD §8.1):** Vite + React, Vitest, Tailwind (or CSS Modules), D3/Canvas for heatmaps, dense eig for \(n \le 4\), GitHub Pages.

---

## Phase 0 — Research & Project Setup (Days 1–2)

**Goal:** Mathematical and repo foundation so later work does not rework notation or architecture.

### 0.1 Research & literature (Day 1)

| Task | Details | Done when |
|------|---------|-----------|
| Literature pass | NEPv vs NEP vs linear EVP; 3+ citable sources | Bibliography draft for F-06 |
| Whiteboard Model A | Derive \(A(x)=A_0+\alpha xx^\top/\|x\|^2\), singularities at \(x=0\) | Can explain on whiteboard (M0) |
| Whiteboard Model B | Diagonal scaling \(a_i(x)=a_i^{(0)}+\beta_i|x_i|^2\) | Parameter ranges documented |
| Reference solutions | Closed-form or high-precision numeric refs for Evaluation | Table for REPORT §Evaluation |
| Pitfall narrative | “Freeze \(A(x_0)\)” vs true NEPv — concrete numeric example | One worked example in notes |

**Deliverables:** `docs/research-notes.md` (optional), `docs/AI_USAGE.md` draft, toy parameter tables.

### 0.2 Repository & tooling (Day 2)

| Task | Details | Done when |
|------|---------|-----------|
| Init repo | `nepv-viz/` structure per PRD §8.3 | `npm install` works |
| CI basics | `npm test`, `npm run build` scripts | Build succeeds (empty app OK) |
| Math conventions doc | Residual \(r(x,\lambda)=\|A(x)x-\lambda x\|_2\), normalization \(\|x\|=1\) | Matches PRD §5.1 |
| KaTeX setup | Hero + definition equations render | F-01 prep |
| GH Pages prep | `vite.config` `base` for project pages | Documented in README stub |

**Milestone M0 complete:** Model A derivable; 2 toys selected; repo runs `dev` with placeholder UI.

---

## Phase 1 — Numerical Core (Days 3–4)

**Goal:** Correct, testable math layer independent of UI (PRD §7.5, §8.4).

### 1.1 Core library (`src/math/`)

| Task | Priority | Acceptance |
|------|----------|------------|
| Vector ops | P0 | Normalize, 2D/3D projections, \(\|·\|_2\) |
| Dense eigensolver | P0 | \(n \le 4\); handles near-degenerate clusters with “numerically sensitive” flag |
| `residual(x, λ, A)` | P0 | Matches §5.1; unit test vs hand calculation |
| `spectrum(A)` | P0 | Eigenvalues for current \(A(x)\); consistent ordering |
| Iteration engine (skeleton) | P1 | Power/Jacobi-style step; max 200 steps; stop on \(r<\varepsilon\) or \(\|x_{k+1}-x_k\|<\delta\) |

### 1.2 Toy models (`src/models/`)

| Module | Priority | Tests |
|--------|----------|-------|
| **Model A** (rank-one, 2×2) | P0 | Residual at reference \((x,\lambda)\); \(A(x)\) vs formula |
| **Model B** (diagonal 3×3) | P1 | Same; parameter bounds enforced |
| **Model C** (implicit, optional) | P2 | Only if Phase 4 slack |

Each model exports: `A(x)`, param schema, singularity notes, default params.

### 1.3 Testing (`tests/`)

| Test suite | Cases |
|------------|-------|
| Residual | Known \((x,\lambda)\) for Model A |
| Symmetry / real case | Real \(\lambda\) when applicable |
| Pitfall helper | `frozenA = A(x0)` vs `A(x)` — different spectra |
| Iteration | Converges for 1–2 seeds; fails gracefully for bad seeds |

**Milestone M1 complete:** `npm test` all green; no UI required.

---

## Phase 2 — P0 UI: “Coupling Compass” (Days 5–7)

**Goal:** Core teaching loop — **US-2** end-to-end; supports **US-1** compare section.

### 2.1 Information architecture & layout (Day 5)

| Section | Route/anchor | Features |
|---------|--------------|----------|
| Hero | `#` | One-line NEPv definition (F-01) |
| Compare | `#compare` | Linear EVP vs NEPv, same toy (US-1) |
| Playground | `#playground` | F-02–F-04 |
| Pitfalls | `#pitfalls` | F-05 (can stub, fill Phase 3) |
| Methods | `#methods` | Stub |
| References | `#references` | Stub |

**UX:** ~72ch max width; KaTeX; one primary question per viewport (PRD §10).

### 2.2 Playground components (Days 5–7)

| Component | Spec (PRD §6.3) | NFR |
|-----------|-----------------|-----|
| **2D vector compass** | Drag handle → \(x\), auto \(\|x\|=1\) | Touch-friendly; <100ms update |
| **Matrix heatmap** | Live \(A(x)\), numeric + color | Matches `models` output |
| **Eigenvalue bar chart** | Eig of **current** \(A(x)\); label “instantaneous linearized spectrum” | Not-only-color (a11y) |
| **λ slider** | User guess → scalar residual | Unified formula |
| **Metrics panel** | \(r(x,\lambda)\), optional eigenvalue list | §5.1 consistent |
| **Model selector** | Model A default; B if ready | Switch without crash (F-09) |
| **Parameter controls** | \(\alpha\), \(\beta_i\), etc. | Bounded per model docs |

**Linkage pipeline:** Input change → recompute \(A(x)\) → eig + residual → viz update with **150–300ms** transition.

### 2.3 Compare section (Day 6–7)

| Element | Content |
|---------|---------|
| Side-by-side or toggle | Fixed \(A\) vs \(A(x)\) |
| Same toy instance | Model A default |
| Copy | Footnote: general NEP ≠ NEPv (§5.2) |

### 2.4 Performance pass (Day 7)

- Profile \(n \le 3\): target **<50ms** per interaction.
- Cap matrix size at **\(n \le 4\)** in UI.
- Check gzipped bundle **<500KB** (no heavy 3D).

**Milestone M2 complete:** Reviewer can drag \(x\), see \(A(x)\), spectrum, residual in <3 min (success metric).

---

## Phase 3 — Content, Pitfalls & Pedagogy (Days 8–9)

**Goal:** Mathematical honesty and rubric alignment — **F-05**, **F-06**, **US-4**.

### 3.1 Pitfall mode (Day 8)

| Feature | Behavior |
|---------|----------|
| Toggle “Freeze \(A\)” | Spectrum of \(A(x_0)\) vs \(A(x)\) |
| Visual distinction | Warning border + labels (not color-only) |
| Copy | Explicit: fixing \(A\) is **not** NEPv solving (§5.4) |

### 3.2 Supporting sections (Day 8–9)

| Section | Content |
|---------|---------|
| **Pitfalls & FAQ** | Linearization mistake; equivalence class of \(x\) (scale/phase); complex \(\lambda\) note |
| **Methods & limitations** | Toy-only; no global convergence claim; iteration sensitivity |
| **References** | ≥3 credible links (F-06) |
| **About / AI** | Link to `docs/AI_USAGE.md` (US-6) |

### 3.3 Equivalence-class UX (Day 9)

- Document normalization (\(\|x\|=1\) or \(x_1=1\)) in UI + README.
- Degenerate eigenvalue UI hint when solver flags sensitivity.

**Milestone M3 complete:** F-05 demonstrable; FAQ addresses NEP vs NEPv (risk mitigation).

---

## Phase 4 — Documentation, Report & Polish (Days 10–11)

**Goal:** Reproducibility (**O4**), AI transparency (**O5**), submission artifacts.

### 4.1 README (Day 10) — F-07

1. One-liner + screenshot/GIF
2. Minimal NEPv explanation
3. Clone / install / run (Node version)
4. Design decisions (why Coupling Compass, why Model A/B)
5. Limitations
6. References
7. AI usage → `docs/AI_USAGE.md`
8. Live demo URL (after Phase 5)

**Acceptance:** Fresh machine, reviewer runs in **<10 min** (excluding `npm install`).

### 4.2 REPORT.md (Day 10–11) — F-08

| Section | Minimum content (PRD §9.2, §16.2) |
|---------|-------------------------------------|
| Problem Statement | NEPv definition; teaching goal |
| Methodology | Toys, residual, iteration, viz encoding, stack |
| Evaluation Dataset | Synthetic toys + parameter table |
| Evaluation Methods | vs closed-form; residual thresholds; convergence stats |
| Results | **Fig 1:** residual vs direction (Model A); **Fig 2:** frozen vs true iteration; **Table 1:** 10 seeds convergence |
| Discussion | Limits, future work |
| References | Superset of README |

All figures from **actual runs**, not AI-generated numbers (§11).

### 4.3 AI_USAGE.md (Day 10)

- Used / not used / verification checklist (PRD §9.3 template).

### 4.4 P1 stretch (Day 11, if time)

| Feature | Order if slipping |
|---------|-------------------|
| F-10 Iteration Lab | After F-09 second model |
| F-11 Residual landscape | After iteration |
| F-12 Guided tour (4 steps) | Before GIF |
| F-13 Demo GIF (15–30s) | Last P1 item |

**Defer to post-release:** P2 (URL state, export, dark mode, i18n).

### 4.5 Quality gates (Day 11)

| Gate | Check |
|------|-------|
| Build | `npm run build` |
| Tests | Core math tests pass |
| A11y spot-check | Tab + sliders; optional Lighthouse ≥85 |
| Mobile | 375px readable; core drag works |
| Copy audit | No “solves all NEPv”; pitfall language correct |

**Milestone M4 complete:** README + REPORT + AI_USAGE; optional GIF in README.

---

## Phase 5 — Release (Day 12)

| Task | Details |
|------|---------|
| Deploy | GitHub Pages (or Vercel); fix SPA/base 404 |
| Public repo | Clean history, license if required |
| Smoke test | Clone → install → run on second machine |
| DoD checklist | PRD §14.1–14.3 all boxes |
| Tag release | `v1.0.0` optional |

**Milestone M5 complete:** Public URL; US-5, US-6 satisfied.

---

## 3. Feature × Phase Matrix

| ID | Feature | Phase | Priority |
|----|---------|-------|----------|
| F-01 | Definition / Hero | 2 | P0 |
| F-02 | Toy Playground | 2 | P0 |
| F-03 | Operator heatmap | 2 | P0 |
| F-04 | Spectrum + residual | 1–2 | P0 |
| F-05 | Pitfall mode | 3 | P0 |
| F-06 | References | 3 | P0 |
| F-07 | README | 4 | P0 |
| F-08 | REPORT.md | 4 | P0 |
| F-09 | Second toy model | 1–2 | P1 |
| F-10 | Iteration Lab | 4 (stretch) | P1 |
| F-11 | Residual landscape | 4 (stretch) | P1 |
| F-12 | Guided tour | 4 (stretch) | P1 |
| F-13 | Demo GIF | 4–5 | P1 |
| F-14–F-17 | URL share, export, dark, i18n | Post-M5 | P2 |

---

## 4. User Story Traceability

| Story | Phase | Verification |
|-------|-------|--------------|
| US-1 Linear vs NEPv compare | 2 | Same toy, side-by-side |
| US-2 Drag \(x\), see \(A\), residual, spectrum | 2 | <3 min first-time path |
| US-3 Iteration / fixed point | 4 (F-10) | Step/play trajectory |
| US-4 Pitfall “wrong freeze” | 3 | One-click contrast |
| US-5 README local run | 4–5 | External reviewer |
| US-6 References + AI docs | 3–4 | Links live |

---

## 5. Weekly Cadence (Suggested)

| Day | Focus | Exit criteria |
|-----|--------|---------------|
| 1 | Literature + Model A math | Notes + citations |
| 2 | Repo + conventions | `npm run dev` |
| 3 | `nepv.ts` + Model A | Tests for residual |
| 4 | Model B + iteration skeleton | All core tests green |
| 5 | Layout + compass control | \(x\) updates state |
| 6 | Heatmap + spectrum + λ slider | Full linkage |
| 7 | Compare + performance | US-2 demo-able |
| 8 | Pitfall toggle + FAQ | F-05 |
| 9 | Methods + references + copy audit | No red-line violations |
| 10 | README + AI_USAGE | Install path verified |
| 11 | REPORT + figures + P1 if possible | Report matches code |
| 12 | Deploy + DoD | Public URL |

---

## 6. Risk Checkpoints

| Checkpoint | Day | If failing, action |
|------------|-----|---------------------|
| Notation freeze | 2 | Stop UI until §5.1 aligned in code + README |
| Model A tests | 4 | No Playground until reference residual passes |
| Interaction latency | 7 | Drop animations; memoize eig; reduce \(n\) |
| Scope creep (3D/WebGL) | 5 | Enforce PRD §3.3 non-goals |
| Iteration divergence | 8–11 | Cap steps; show “initial-value sensitive” |
| GH Pages 404 | 12 | Fix `base` before announcing URL |
| AI hallucination | 9, 11 | Run verification checklist §9.3 |

---

## 7. Definition of Done (Release Gate)

Consolidated from PRD §14.

### Product

- [ ] Public GitHub repo
- [ ] README: third party runs clone/install/run
- [ ] Full toy loop: change \(x\) → \(A(x)\) + residual/spectrum
- [ ] Pitfall demo
- [ ] ≥3 references; `docs/AI_USAGE.md`
- [ ] `REPORT.md` with Problem, Methodology, Evaluation, Results
- [ ] No mislabeled “NEPv solve” for frozen \(A\)

### Engineering

- [ ] `npm run build`
- [ ] Unit tests pass
- [ ] Static hosting deploy works

### Objectives O1–O5

- [ ] 8–15 min happy path (PRD §4.3)
- [ ] Claims traceable to code/tests
- [ ] “Coupling Compass” as primary metaphor
- [ ] AI usage documented and verified

---

## 8. Post-v1 Backlog (Optional)

1. F-10 Iteration Lab + convergence curves for REPORT v2
2. F-11 Residual landscape on \(\|x\|=1\)
3. F-12 Onboarding tour
4. F-14 Deep links for sharing demos
5. F-17 i18n if audience expands
6. Model C (implicit NEPv) for advanced learners

---

## 9. Suggested Parallelization (If 2+ People)

| Stream A (Math) | Stream B (UI) | Sync point |
|-----------------|---------------|------------|
| Days 1–2 research | Days 2 scaffold + layout | End Day 2: API contract for `A(x)`, `residual` |
| Days 3–4 core + tests | Days 5–6 components with mocks | Day 4: integrate real math |
| Day 7 pitfall logic | Day 7 pitfall UI | Day 7 EOD |
| Days 10–11 REPORT figures | Days 10–11 polish + GIF | Day 11 |

Solo: follow sequential critical path above.

---

## 10. Document Maintenance

- When the interaction design changes, update PRD §6.3 and §14, and record the reason in README “Design decisions”.
- Keep this roadmap aligned with milestone dates if the schedule slips or scope is cut (P1 → post-v1).

**Related documents**

| Document | Path |
|----------|------|
| PRD | [NEPv-Visualization-PRD.md](../NEPv-Visualization-PRD.md) |
| AI usage (to create) | [docs/AI_USAGE.md](./AI_USAGE.md) |
| Report (to create) | [REPORT.md](../REPORT.md) |
