import type { Vec } from '../math/vector';
import type { ModelParams, ToyModel } from './types';

const a0 = [1, 2, 0.5];

export const modelB: ToyModel = {
  id: 'diagonal-3x3',
  dim: 3,
  defaultX: normalize3([0.5, 0.7, 0.5]),
  defaultParams: { beta1: 1, beta2: 0.8, beta3: 1.2 },
  paramKeys: ['beta1', 'beta2', 'beta3'],
  paramMeta: {
    beta1: { min: 0, max: 2, step: 0.05 },
    beta2: { min: 0, max: 2, step: 0.05 },
    beta3: { min: 0, max: 2, step: 0.05 },
  },
  buildA(x: Vec, params: ModelParams): number[][] {
    const betas = [params.beta1 ?? 1, params.beta2 ?? 0.8, params.beta3 ?? 1.2];
    const diag = a0.map((a, i) => a + betas[i] * (x[i] ?? 0) ** 2);
    return diag.map((d, i) => {
      const row = [0, 0, 0];
      row[i] = d;
      return row;
    });
  },
};

function normalize3(v: Vec): Vec {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  return v.map((x) => x / n);
}
