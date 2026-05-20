import { describe, expect, it } from 'vitest';
import { eigenvalues2x2, groupEigenvaluesForDisplay, spectrum } from '../src/math/eigen';
import { residual, RESIDUAL_FORMULA_TEX } from '../src/math/nepv';
import { modelA } from '../src/models/modelA';
import { normalize } from '../src/math/vector';

describe('eigensolver', () => {
  it('solves 2x2 symmetric matrix', () => {
    const A = [
      [2, 1],
      [1, 2],
    ];
    const { eigenvalues } = eigenvalues2x2(A);
    expect(eigenvalues[0].value).toBeCloseTo(3, 6);
    expect(eigenvalues[1].value).toBeCloseTo(1, 6);
  });

  it('groups conjugate pairs', () => {
    const A = [
      [0, 1],
      [-1, 0],
    ];
    const { eigenvalues } = eigenvalues2x2(A);
    const groups = groupEigenvaluesForDisplay(eigenvalues);
    const conjugate = groups.filter((g) => g.kind === 'conjugate');
    expect(conjugate.length).toBeGreaterThan(0);
    expect(groups.every((g) => g.kind !== 'real' || Math.abs(g.eigen.imaginary) < 1e-10)).toBe(
      true,
    );
  });
});

describe('residual', () => {
  it('is zero for exact linear eigenpair', () => {
    const A = [
      [2, 0],
      [0, 3],
    ];
    const x = normalize([1, 0]);
    const r = residual(x, 2, A);
    expect(r).toBeLessThan(1e-10);
  });

  it('frozen A differs from moving A spectrum', () => {
    const x0 = normalize([1, 0]);
    const x1 = normalize([0.5, 0.8660254]);
    const params = { alpha: 0.7 };
    const A0 = modelA.buildA(x0, params);
    const A1 = modelA.buildA(x1, params);
    const spec0 = spectrum(A0).eigenvalues.map((e) => e.value);
    const spec1 = spectrum(A1).eigenvalues.map((e) => e.value);
    expect(spec0[0]).not.toBeCloseTo(spec1[0], 1);
  });

  it('formula tex matches PRD', () => {
    expect(RESIDUAL_FORMULA_TEX).toContain('frac');
    expect(RESIDUAL_FORMULA_TEX).toContain('A(x)x');
  });
});
