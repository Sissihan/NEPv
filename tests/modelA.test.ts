import { describe, expect, it } from 'vitest';
import { modelA } from '../src/models/modelA';
import { residual } from '../src/math/nepv';
import { normalize } from '../src/math/vector';

describe('Model A', () => {
  it('builds rank-one update', () => {
    const x = normalize([1, 0]);
    const A = modelA.buildA(x, { alpha: 1 });
    expect(A[0][0]).toBeCloseTo(2, 6);
    expect(A[0][1]).toBeCloseTo(0.3, 6);
  });

  it('residual is small at a numerically found pair', () => {
    const x = normalize([0.6, 0.8]);
    const A = modelA.buildA(x, { alpha: 0.5 });
    const lambda = 1.45;
    const r = residual(x, lambda, A);
    expect(r).toBeLessThan(0.5);
  });

  it('operator changes when x direction changes', () => {
    const p = { alpha: 0.8 };
    const A1 = modelA.buildA(normalize([1, 0]), p);
    const A2 = modelA.buildA(normalize([0, 1]), p);
    expect(A1[0][0]).not.toBeCloseTo(A2[1][1], 2);
  });
});
