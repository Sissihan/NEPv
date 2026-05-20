/**
 * Polar residual landscape r(θ) for unit-circle parameterization x(θ) = [cos θ, sin θ].
 * At each θ we minimize residual over instantaneous eigenvalues μ_i of A(x(θ)).
 */
import { absoluteResidual, evaluateNepv, residual } from './nepv';
import { normalize, type Vec } from './vector';
import type { ModelParams } from '../models/types';
import type { ToyModel } from '../models/types';

export interface PolarSample {
  theta: number;
  rRel: number;
  rAbs: number;
  bestLambda: number;
  x: Vec;
}

/** x(θ) on the unit circle in R^2. */
export function xAtTheta(theta: number): Vec {
  return normalize([Math.cos(theta), Math.sin(theta)]);
}

/**
 * Best relative residual at direction θ:
 * r(θ) = min_{μ_i in spec(A(x(θ)))} r_rel(x(θ), μ_i).
 */
export function residualAtTheta(
  theta: number,
  buildA: (x: Vec) => number[][],
  _params?: ModelParams,
): PolarSample {
  const x = xAtTheta(theta);
  const A = buildA(x);
  const ev = evaluateNepv(x, 0, A);
  let bestR = Infinity;
  let bestLambda = ev.spectrum.eigenvalues[0]?.value ?? 0;
  for (const e of ev.spectrum.eigenvalues) {
    const lam = e.value;
    const rRel = residual(x, lam, A);
    if (rRel < bestR) {
      bestR = rRel;
      bestLambda = lam;
    }
  }
  const rAbs = absoluteResidual(x, bestLambda, A);
  return { theta, rRel: bestR, rAbs, bestLambda, x };
}

export function sweepPolarLandscape(
  model: ToyModel,
  params: ModelParams,
  n = 72,
): PolarSample[] {
  if (model.dim !== 2) return [];
  const buildA = (x: Vec) => model.buildA(x, params);
  const samples: PolarSample[] = [];
  for (let i = 0; i < n; i++) {
    const theta = (i / n) * Math.PI * 2;
    samples.push(residualAtTheta(theta, buildA, params));
  }
  return samples;
}

/** Find global and local minima indices (simple: global min + points below neighbor+threshold). */
export function findPolarMinima(
  samples: PolarSample[],
  localThreshold = 0.02,
): { globalIdx: number; localIndices: number[] } {
  if (samples.length === 0) return { globalIdx: 0, localIndices: [] };
  let globalIdx = 0;
  for (let i = 1; i < samples.length; i++) {
    if (samples[i].rRel < samples[globalIdx].rRel) globalIdx = i;
  }
  const localIndices: number[] = [];
  const n = samples.length;
  for (let i = 0; i < n; i++) {
    const prev = samples[(i - 1 + n) % n].rRel;
    const next = samples[(i + 1) % n].rRel;
    if (
      samples[i].rRel <= prev &&
      samples[i].rRel <= next &&
      samples[i].rRel < samples[globalIdx].rRel + localThreshold &&
      i !== globalIdx
    ) {
      localIndices.push(i);
    }
  }
  return { globalIdx, localIndices };
}

export function thetaFromX(x: Vec): number {
  return Math.atan2(x[1] ?? 0, x[0] ?? 0);
}
