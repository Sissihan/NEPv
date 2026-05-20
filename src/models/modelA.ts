import { addMatrices, cloneMatrix, outer, scaleMatrix } from '../math/matrix';
import { normalize, norm2, type Vec } from '../math/vector';
import type { ModelParams, ToyModel } from './types';

const A0: number[][] = [
  [1, 0.3],
  [0.3, 1.2],
];

export const modelA: ToyModel = {
  id: 'rank-one-2x2',
  dim: 2,
  defaultX: normalize([0.85, 0.53]),
  defaultParams: { alpha: 0.6 },
  paramKeys: ['alpha'],
  paramMeta: {
    alpha: { min: -1.5, max: 1.5, step: 0.05 },
  },
  buildA(x: Vec, params: ModelParams): number[][] {
    const alpha = params.alpha ?? 0.6;
    const n2 = norm2(x);
    if (n2 < 1e-12) return cloneMatrix(A0);
    const rankOne = scaleMatrix(outer(x), alpha / (n2 * n2));
    return addMatrices(A0, rankOne);
  },
};
