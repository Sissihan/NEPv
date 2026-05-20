# AI Usage — NEPv Lens

AI-assisted, human-verified

## Used for

- PRD and roadmap structure
- Scaffolding Vite + React project layout
- Initial UI copy and component breakdown
- LaTeX formula wording in documentation

## Not used for

- Final numerical results in tests (computed by implementation)
- Unverified theorem claims
- Production deployment configuration without manual check

## Verification checklist

| AI 产出类型 | 核验步骤 | 核验人 | 日期 |
|-------------|----------|--------|------|
| 数值公式 / `nepv.ts` | 与 PRD §5.1 手算；单测 ≤1e-6 | | |
| Toy 模型参考表 | 对照 PRD §5.3 基线表 `src/math/baseline.ts` | | |
| UI 文案 / i18n | 符号与 §5 一致；无「解决所有 NEPv」 | | |
| 组件代码 | `npm test` + `scripts/verify-build.sh` | | |
| REPORT 图表 | 来自真实运行导出 | | |

- [x] NEPv definition matches standard form A(x)x=λx
- [x] Normalized residual consistent in code and UI
- [x] `npm test` passes including baseline tests
- [x] Pitfall mode labeled as linearization mistake
- [ ] External reviewer runs README / Docker path (pending)

## Human review

All mathematical claims in the UI should be read against [NEPv-Visualization-PRD.md](../NEPv-Visualization-PRD.md) §5 before submission.
