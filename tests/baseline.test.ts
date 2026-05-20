import { describe, expect, it } from 'vitest';
import { eigenvalues2x2, eigenvaluesDiagonal } from '../src/math/eigen';
import { residual, RESIDUAL_FORMULA_PLAIN } from '../src/math/nepv';
import { BASELINE_MODEL_A, BASELINE_MODEL_B } from '../src/math/baseline';
import { modelA } from '../src/models/modelA';
import { modelB } from '../src/models/modelB';

describe('PRD §5.3 baselines', () => {
  it('Model A A(x), eigenvalues, residual', () => {
    const A = modelA.buildA(BASELINE_MODEL_A.x, BASELINE_MODEL_A.params);
    expect(A[0][0]).toBeCloseTo(BASELINE_MODEL_A.A[0][0], 6);
    expect(A[0][1]).toBeCloseTo(BASELINE_MODEL_A.A[0][1], 6);
    expect(A[1][1]).toBeCloseTo(BASELINE_MODEL_A.A[1][1], 6);
    const spec = eigenvalues2x2(A).eigenvalues.map((e) => e.value);
    expect(spec[0]).toBeCloseTo(BASELINE_MODEL_A.eigenvalues[0], 6);
    expect(spec[1]).toBeCloseTo(BASELINE_MODEL_A.eigenvalues[1], 6);
    const r = residual(BASELINE_MODEL_A.x, BASELINE_MODEL_A.lambda, A);
    expect(r).toBeCloseTo(BASELINE_MODEL_A.residual, 6);
  });

  it('Model B diagonal spectrum and residual', () => {
    const A = modelB.buildA(BASELINE_MODEL_B.x, BASELINE_MODEL_B.params);
    expect(A[0][0]).toBeCloseTo(BASELINE_MODEL_B.diag[0], 6);
    expect(A[1][1]).toBeCloseTo(BASELINE_MODEL_B.diag[1], 6);
    expect(A[2][2]).toBeCloseTo(BASELINE_MODEL_B.diag[2], 6);
    const spec = eigenvaluesDiagonal(A).eigenvalues.map((e) => e.value);
    expect(spec[0]).toBeCloseTo(2.395959595959596, 6);
    expect(spec[1]).toBeCloseTo(1.2525252525252526, 6);
    expect(spec[2]).toBeCloseTo(0.803030303030303, 6);
    const r = residual(BASELINE_MODEL_B.x, BASELINE_MODEL_B.lambda, A);
    expect(r).toBeCloseTo(BASELINE_MODEL_B.residual, 6);
  });
});

describe('formula consistency', () => {
  it('UI plain formula matches code export', () => {
    expect(RESIDUAL_FORMULA_PLAIN).toContain('||A(x)x');
    expect(RESIDUAL_FORMULA_PLAIN).toContain('||λx||');
  });
});
