import { RESIDUAL_FORMULA_TEX } from '../math/nepv';
import { MathBlock } from './MathBlock';

/** Permanent relative residual definition (PRD §5.1) — top of Playground. */
export function ResidualFormulaBanner() {
  return (
    <aside className="residual-formula-banner" aria-label="Relative residual definition">
      <p className="residual-formula-label">r_rel</p>
      <MathBlock tex={RESIDUAL_FORMULA_TEX} block />
    </aside>
  );
}
