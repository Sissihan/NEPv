/**
 * Self-consistent field (SCF) fixed-point iteration for NEPv teaching:
 * x_{k+1} = normalized eigenvector of A(x_k) for a selected eigenvalue μ.
 */
import { eigenvalues2x2 } from './eigen';
import { residual } from './nepv';
import { absoluteResidual } from './nepv';
import { matVec, normalize, norm2, type Vec } from './vector';

export const MAX_ITER_STEPS = 200;
export const NONCONVERGE_RESIDUAL = 1e-3;

/** Initial x far from typical converged points (teaching demo). */
export const ITERATION_START_X_2D: Vec = normalize([0.92, 0.38]);

export type EigenPickMode = 'max' | 'min' | 'closest';

export interface IterationStepResult {
  k: number;
  x: Vec;
  lambda: number;
  residual: number;
  residualAbs: number;
}

/** Unit eigenvector for real eigenvalue λ of 2×2 A. */
function eigenvector2x2(A: number[][], lambda: number): Vec {
  const a = A[0][0] - lambda;
  const b = A[0][1];
  const c = A[1][0];
  const d = A[1][1] - lambda;
  if (Math.abs(b) + Math.abs(c) < 1e-12) {
    return Math.abs(a) < Math.abs(d) ? normalize([1, 0]) : normalize([0, 1]);
  }
  if (Math.abs(b) > Math.abs(c)) {
    return normalize([b, -a]);
  }
  return normalize([d, -c]);
}

function pickEigenpair2x2(
  A: number[][],
  mode: EigenPickMode,
  lambdaHint?: number,
): { x: Vec; lambda: number } {
  const spec = eigenvalues2x2(A).eigenvalues;
  const real = spec.filter((e) => Math.abs(e.imaginary) < 1e-10);
  if (real.length === 0) {
    const e0 = spec[0];
    return { x: normalize([1, 0]), lambda: e0.value };
  }
  let chosen = real[0];
  if (mode === 'max') {
    chosen = real.reduce((a, b) => (a.value >= b.value ? a : b));
  } else if (mode === 'min') {
    chosen = real.reduce((a, b) => (a.value <= b.value ? a : b));
  } else if (lambdaHint !== undefined) {
    chosen = real.reduce((a, b) =>
      Math.abs(a.value - lambdaHint) <= Math.abs(b.value - lambdaHint) ? a : b,
    );
  }
  const v = eigenvector2x2(A, chosen.value);
  return { x: v, lambda: chosen.value };
}

/** Dominant eigenvector via power iteration (fallback for n>2). */
function dominantEigenvectorPower(A: number[][]): { x: Vec; lambda: number } {
  const n = A.length;
  let v: Vec = normalize(Array(n).fill(1 / Math.sqrt(n)));
  let lambda = 0;
  for (let i = 0; i < 40; i++) {
    const w = matVec(A, v);
    lambda =
      (v.reduce((s, vi, j) => s + vi * (w[j] ?? 0), 0)) /
      (norm2(v) ** 2 + 1e-15);
    const nv = norm2(w);
    if (nv < 1e-15) break;
    v = w.map((x) => x / nv);
  }
  return { x: v, lambda };
}

export function pickEigenpair(
  A: number[][],
  mode: EigenPickMode,
  lambdaHint?: number,
): { x: Vec; lambda: number } {
  if (A.length === 2) return pickEigenpair2x2(A, mode, lambdaHint);
  return dominantEigenvectorPower(A);
}

/** One SCF step: x_{k+1} from A(x_k). */
export function iterationStep(
  xk: Vec,
  buildA: (x: Vec) => number[][],
  mode: EigenPickMode = 'max',
  lambdaHint?: number,
): { xNext: Vec; lambda: number; r: number; rAbs: number } {
  const A = buildA(xk);
  const { x: v, lambda } = pickEigenpair(A, mode, lambdaHint);
  const xNext = normalize(v.slice(0, xk.length));
  const Anext = buildA(xNext);
  const r = residual(xNext, lambda, Anext);
  const rAbs = absoluteResidual(xNext, lambda, Anext);
  return { xNext, lambda, r, rAbs };
}

export function runIterationUntil(
  x0: Vec,
  buildA: (x: Vec) => number[][],
  maxSteps: number,
  mode: EigenPickMode = 'max',
  lambdaHint?: number,
): { steps: IterationStepResult[]; converged: boolean; stoppedEarly: boolean } {
  const steps: IterationStepResult[] = [];
  let x = normalize([...x0]);
  let lambda = lambdaHint ?? 0;
  const A0 = buildA(x);
  let r = residual(x, lambda, A0);
  let rAbs = absoluteResidual(x, lambda, A0);

  for (let k = 0; k < maxSteps; k++) {
    steps.push({ k, x: [...x], lambda, residual: r, residualAbs: rAbs });
    const { xNext, lambda: lNext, r: rNext, rAbs: rNextAbs } = iterationStep(
      x,
      buildA,
      mode,
      lambdaHint,
    );
    if (rNext < NONCONVERGE_RESIDUAL || norm2(xNext.map((v, i) => v - x[i])) < 1e-8) {
      steps.push({
        k: k + 1,
        x: xNext,
        lambda: lNext,
        residual: rNext,
        residualAbs: rNextAbs,
      });
      return { steps, converged: true, stoppedEarly: false };
    }
    x = xNext;
    lambda = lNext;
    r = rNext;
    rAbs = rNextAbs;
  }
  const notConverged = r > NONCONVERGE_RESIDUAL;
  return { steps, converged: !notConverged, stoppedEarly: notConverged };
}

/** Rough spectral gap and Lipschitz-style estimate for teaching warnings. */
export function convergenceDiagnostics(
  A: number[][],
  alpha: number,
): { gap: number; lipschitzEstimate: number; warn: boolean } {
  if (A.length !== 2) return { gap: 1, lipschitzEstimate: 0.5, warn: false };
  const spec = eigenvalues2x2(A).eigenvalues;
  const mags = spec.map((e) => Math.hypot(e.value, e.imaginary)).sort((a, b) => b - a);
  const gap = mags.length >= 2 ? Math.abs(mags[0] - mags[1]) : 1;
  const lipschitzEstimate = Math.min(0.99, Math.abs(alpha) * 1.2);
  const warn = gap < 0.05 || lipschitzEstimate > 0.85 || Math.abs(alpha) > 1.2;
  return { gap, lipschitzEstimate, warn };
}
