/**
 * Model C (2x2): nonsymmetric rank-style coupling — can yield complex eigenvalues.
 * A(x) = [[a, c + beta*x1*x2], [c + beta*x1*x2, b]]
 */
import type { ModelParams, ToyModel } from './types';
import { normalize, type Vec } from '../math/vector';

export const modelC: ToyModel = {
  id: 'nonsymmetric-2x2',
  dim: 2,
  defaultX: normalize([0.85, 0.53]),
  defaultParams: { beta: 0.8, a: 1.0, b: 1.3, c: 0.25 },
  paramKeys: ['beta', 'a', 'b', 'c'],
  paramMeta: {
    beta: { min: 0, max: 2, step: 0.05 },
    a: { min: 0.5, max: 2, step: 0.05 },
    b: { min: 0.5, max: 2, step: 0.05 },
    c: { min: 0, max: 1, step: 0.05 },
  },
  buildA(x: Vec, params: ModelParams): number[][] {
    const beta = params.beta ?? 0.8;
    const a = params.a ?? 1;
    const b = params.b ?? 1.3;
    const c0 = params.c ?? 0.25;
    const off = c0 + beta * (x[0] ?? 0) * (x[1] ?? 0);
    return [
      [a, off],
      [off, b],
    ];
  },
};
