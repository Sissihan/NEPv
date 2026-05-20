/** PRD §5.3 reference baselines (unit tests ≤ 1e-6). */
import type { Vec } from './vector';

export const BASELINE_MODEL_A = {
  params: { alpha: 0.6 },
  x: [0.8485586743408395, 0.5291012910595824] as Vec,
  A: [
    [1.4320310942794499, 0.5693840940801276],
    [0.5693840940801276, 1.36796890572055],
  ],
  eigenvalues: [1.9702843480161336, 0.8297156519838663],
  lambda: 1.5,
  residual: 0.13953566693393946,
};

export const BASELINE_MODEL_B = {
  params: { beta1: 1, beta2: 0.8, beta3: 1.2 },
  x: [0.502518907629606, 0.7035264706814484, 0.502518907629606] as Vec,
  diag: [1.2525252525252526, 2.395959595959596, 0.803030303030303],
  lambda: 1.5,
  residual: 0.21882357101269917,
};
