// AI-generated: normalized NEPv residual - verified by implementation 2026-05-19
import { matVec, norm2, type Vec } from './vector';
import { spectrum, type SpectrumResult } from './eigen';

/** KaTeX / UI must match this definition (PRD §5.1). */
export const RESIDUAL_FORMULA_TEX =
  String.raw`r(x,\lambda)=\frac{\|A(x)x-\lambda x\|_2}{\|A(x)x\|_2+\|\lambda x\|_2}`;

export const RESIDUAL_FORMULA_PLAIN =
  'r(x,λ) = ||A(x)x - λx||_2 / (||A(x)x||_2 + ||λx||_2)';

const EPS_DENOM = 1e-12;

/**
 * Normalized residual (PRD §5.1):
 * r(x,λ) = ||A(x)x − λx||₂ / (||A(x)x||₂ + ||λx||₂)
 */
export function residual(x: Vec, lambda: number, A: number[][]): number {
  const Ax = matVec(A, x);
  const diff = Ax.map((v, i) => v - lambda * (x[i] ?? 0));
  const num = norm2(diff);
  const nAx = norm2(Ax);
  const nLx = norm2(x.map((xi) => lambda * xi));
  return num / (nAx + nLx + EPS_DENOM);
}

export interface NepvState {
  A: number[][];
  spectrum: SpectrumResult;
  residual: number;
}

export function evaluateNepv(
  x: Vec,
  lambda: number,
  A: number[][],
): NepvState {
  return {
    A,
    spectrum: spectrum(A),
    residual: residual(x, lambda, A),
  };
}

export const SINGULARITY_TOLERANCE = 1e-12;

export function isSingularX(x: Vec): boolean {
  return norm2(x) < SINGULARITY_TOLERANCE;
}

/** Absolute residual ||A(x)x - λx||_2 (companion to normalized r_rel). */
export function absoluteResidual(x: Vec, lambda: number, A: number[][]): number {
  const diff = matVec(A, x).map((v, i) => v - lambda * (x[i] ?? 0));
  return norm2(diff);
}
