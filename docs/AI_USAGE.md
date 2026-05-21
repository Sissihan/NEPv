# AI Usage — NEPv Lens

**AI-assisted, human-verified**

## Used for

- PRD and roadmap structure
- Scaffolding Vite + React project layout
- Initial UI copy and component breakdown
- LaTeX formula wording in documentation

## Not used for

- Final numerical results in tests (computed by the implementation)
- Unverified theorem claims
- Production deployment configuration without manual check

## Verification checklist

| AI output type | Verification step | Reviewer | Date |
|----------------|-------------------|----------|------|
| Numerical formulas / `nepv.ts` | Hand-check against PRD §5.1; unit tests ≤ 1e-6 | | |
| Toy model baselines | Compare to PRD §5.3 table in `src/math/baseline.ts` | | |
| UI copy / i18n | Symbols match §5; no “solves all NEPv” claims | | |
| Component code | `npm test` + `scripts/verify-build.sh` | | |
| REPORT figures | Exported from real runs only | | |

- [x] NEPv definition matches standard form \(A(x)x=\lambda x\)
- [x] Normalized relative residual consistent in code and UI
- [x] `npm test` passes including baseline tests
- [x] Pitfall mode labeled as linearization mistake
- [ ] External reviewer runs README / Docker path (pending)

## Human review

All mathematical claims in the UI should be checked against [NEPv-Visualization-PRD.md](../NEPv-Visualization-PRD.md) §5 before submission.
