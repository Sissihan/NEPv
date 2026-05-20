/**
 * Model B (2x2): diagonal dependence A(x) = diag(a_i + alpha * x_i^2).
 * On axis directions, NEPv reduces to lambda = a_i + alpha * x_i^2 with x = e_i.
 */
import type { ModelParams, ToyModel } from './types';
import { normalize, type Vec } from '../math/vector';

const a0 = [1.0, 1.2];

export const modelB2x2: ToyModel = {
  id: 'diagonal-2x2',
  dim: 2,
  defaultX: normalize([0.707, 0.707]),
  defaultParams: { alpha: 0.5 },
  paramKeys: ['alpha'],
  paramMeta: {
    alpha: { min: -0.5, max: 1.5, step: 0.05 },
  },
  buildA(x: Vec, params: ModelParams): number[][] {
    const alpha = params.alpha ?? 0.5;
    const x1 = x[0] ?? 0;
    const x2 = x[1] ?? 0;
    return [
      [a0[0] + alpha * x1 * x1, 0],
      [0, a0[1] + alpha * x2 * x2],
    ];
  },
};
