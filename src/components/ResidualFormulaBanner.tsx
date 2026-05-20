import { RESIDUAL_FORMULA_PLAIN, RESIDUAL_FORMULA_TEX } from '../math/nepv';
import { MathBlock } from './MathBlock';

/** Permanent residual formula (PRD §5.1) — top of Playground. */
export function ResidualFormulaBanner() {
  return (
    <aside className="residual-formula-banner" aria-label="Residual definition">
      <MathBlock tex={RESIDUAL_FORMULA_TEX} block={false} />
      <code className="residual-formula-plain">{RESIDUAL_FORMULA_PLAIN}</code>
    </aside>
  );
}
