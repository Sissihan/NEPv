export interface EigenPair {
  value: number;
  imaginary: number;
}

export interface SpectrumResult {
  eigenvalues: EigenPair[];
  sensitive: boolean;
}

function sortEigenvalues(evals: EigenPair[]): EigenPair[] {
  return [...evals].sort((a, b) => {
    const ma = Math.hypot(a.value, a.imaginary);
    const mb = Math.hypot(b.value, b.imaginary);
    return mb - ma;
  });
}

/** Analytic eigenvalues for 2×2 real matrices. */
export function eigenvalues2x2(A: number[][]): SpectrumResult {
  const a = A[0][0];
  const b = A[0][1];
  const c = A[1][0];
  const d = A[1][1];
  const tr = a + d;
  const det = a * d - b * c;
  const disc = tr * tr - 4 * det;
  if (disc >= 0) {
    const s = Math.sqrt(disc);
    const l1 = (tr + s) / 2;
    const l2 = (tr - s) / 2;
    const sensitive = Math.abs(l1 - l2) < 1e-8;
    return {
      eigenvalues: sortEigenvalues([
        { value: l1, imaginary: 0 },
        { value: l2, imaginary: 0 },
      ]),
      sensitive,
    };
  }
  const re = tr / 2;
  const im = Math.sqrt(-disc) / 2;
  return {
    eigenvalues: sortEigenvalues([
      { value: re, imaginary: im },
      { value: re, imaginary: -im },
    ]),
    sensitive: false,
  };
}

/** Diagonal matrix: eigenvalues are diagonal entries. */
export function eigenvaluesDiagonal(A: number[][]): SpectrumResult {
  const vals = A.map((row, i) => ({ value: row[i], imaginary: 0 }));
  const sorted = sortEigenvalues(vals);
  const magnitudes = sorted.map((e) => Math.abs(e.value));
  const sensitive =
    magnitudes.length > 1 &&
    magnitudes.some((m, i) =>
      magnitudes.some((n, j) => i !== j && Math.abs(m - n) < 1e-8),
    );
  return { eigenvalues: sorted, sensitive };
}

/** Dense eigenvalues for n ≤ 4 (QR iteration, real matrices). */
export function eigenvaluesDense(A: number[][]): SpectrumResult {
  const n = A.length;
  if (n === 0) return { eigenvalues: [], sensitive: false };
  if (n === 1) return { eigenvalues: [{ value: A[0][0], imaginary: 0 }], sensitive: false };
  if (n === 2) return eigenvalues2x2(A);

  const H = hessenberg(clone(A));
  const T = qrIteration(H, 80);
  const eigenvalues: EigenPair[] = [];
  let i = 0;
  while (i < n) {
    if (i < n - 1 && Math.abs(T[i + 1][i]) > 1e-8) {
      const block = [
        [T[i][i], T[i][i + 1]],
        [T[i + 1][i], T[i + 1][i + 1]],
      ];
      const pair = eigenvalues2x2(block);
      eigenvalues.push(...pair.eigenvalues);
      i += 2;
    } else {
      eigenvalues.push({ value: T[i][i], imaginary: 0 });
      i += 1;
    }
  }
  const sorted = sortEigenvalues(eigenvalues);
  const mags = sorted.map((e) => Math.hypot(e.value, e.imaginary));
  const sensitive = mags.some((m, i) =>
    mags.some((n, j) => i !== j && Math.abs(m - n) < 1e-8),
  );
  return { eigenvalues: sorted, sensitive };
}

export function spectrum(A: number[][]): SpectrumResult {
  if (isDiagonalQuick(A)) return eigenvaluesDiagonal(A);
  return eigenvaluesDense(A);
}

function isDiagonalQuick(A: number[][]): boolean {
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A.length; j++) {
      if (i !== j && Math.abs(A[i][j]) > 1e-10) return false;
    }
  }
  return true;
}

function clone(A: number[][]): number[][] {
  return A.map((r) => [...r]);
}

function hessenberg(A: number[][]): number[][] {
  const n = A.length;
  const H = clone(A);
  for (let k = 0; k < n - 2; k++) {
    let s = 0;
    for (let i = k + 1; i < n; i++) s += H[i][k] * H[i][k];
    s = Math.sqrt(s);
    if (s < 1e-15) continue;
    const sign = H[k + 1][k] >= 0 ? 1 : -1;
    const u1 = H[k + 1][k] + sign * s;
    const u: number[] = Array(n).fill(0);
    u[k + 1] = 1;
    for (let i = k + 2; i < n; i++) u[i] = H[i][k] / u1;
    const beta = 2 / dot(u, u);
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let i = k + 1; i < n; i++) sum += u[i] * H[i][j];
      for (let i = k + 1; i < n; i++) H[i][j] -= beta * u[i] * sum;
    }
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = k + 1; j < n; j++) sum += H[i][j] * u[j];
      for (let j = k + 1; j < n; j++) H[i][j] -= beta * sum * u[j];
    }
  }
  return H;
}

function dot(a: number[], b: number[]): number {
  return a.reduce((s, x, i) => s + x * (b[i] ?? 0), 0);
}

function qrIteration(H: number[][], maxIter: number): number[][] {
  let T = clone(H);
  for (let iter = 0; iter < maxIter; iter++) {
    const { Q, R } = qrDecomp(T);
    T = matMul(R, Q);
    let sub = 0;
    for (let i = 1; i < T.length; i++) {
      if (Math.abs(T[i][i - 1]) < 1e-10) T[i][i - 1] = 0;
      else sub = 1;
    }
    if (!sub && iter > 10) break;
  }
  return T;
}

function qrDecomp(A: number[][]): { Q: number[][]; R: number[][] } {
  const n = A.length;
  const Q = identity(n);
  let R = clone(A);
  for (let k = 0; k < n - 1; k++) {
    const x: number[] = [];
    for (let i = k; i < n; i++) x.push(R[i][k]);
    const { v, beta } = householderVector(x);
    for (let j = k; j < n; j++) {
      let sum = 0;
      for (let i = 0; i < v.length; i++) sum += v[i] * R[k + i][j];
      for (let i = 0; i < v.length; i++) R[k + i][j] -= beta * v[i] * sum;
    }
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let i = 0; i < v.length; i++) sum += v[i] * Q[j][k + i];
      for (let i = 0; i < v.length; i++) Q[j][k + i] -= beta * sum * v[i];
    }
  }
  return { Q, R };
}

function householderVector(x: number[]): { v: number[]; beta: number } {
  const s = Math.sqrt(x.reduce((a, b) => a + b * b, 0));
  if (s < 1e-15) return { v: x.map((_, i) => (i === 0 ? 1 : 0)), beta: 0 };
  const sign = x[0] >= 0 ? 1 : -1;
  const v = [...x];
  v[0] += sign * s;
  const beta = 2 / dot(v, v);
  return { v, beta };
}

function identity(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
}

function matMul(A: number[][], B: number[][]): number[][] {
  const n = A.length;
  const C = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) C[i][j] += A[i][k] * B[k][j];
    }
  }
  return C;
}

export function formatEigenvalue(e: EigenPair): string {
  if (Math.abs(e.imaginary) < 1e-10) return e.value.toFixed(4);
  const sign = e.imaginary >= 0 ? '+' : '-';
  return `${e.value.toFixed(3)} ${sign} ${Math.abs(e.imaginary).toFixed(3)}i`;
}

export function eigenMagnitude(e: EigenPair): number {
  return Math.hypot(e.value, e.imaginary);
}

export type DisplayEigenItem =
  | { kind: 'real'; eigen: EigenPair; index: number }
  | { kind: 'conjugate'; plus: EigenPair; minus: EigenPair; index: number };

const CONJ_TOL = 1e-8;

/** Group eigenvalues for UI: conjugate pairs never shown as isolated complex entries (PRD §5.2). */
export function groupEigenvaluesForDisplay(
  eigenvalues: EigenPair[],
): DisplayEigenItem[] {
  const used = new Set<number>();
  const items: DisplayEigenItem[] = [];
  let pairIndex = 0;

  for (let i = 0; i < eigenvalues.length; i++) {
    if (used.has(i)) continue;
    const e = eigenvalues[i];
    if (Math.abs(e.imaginary) < CONJ_TOL) {
      items.push({ kind: 'real', eigen: e, index: ++pairIndex });
      used.add(i);
      continue;
    }
    let j = -1;
    for (let k = i + 1; k < eigenvalues.length; k++) {
      if (used.has(k)) continue;
      const o = eigenvalues[k];
      if (
        Math.abs(e.value - o.value) < CONJ_TOL &&
        Math.abs(e.imaginary + o.imaginary) < CONJ_TOL &&
        Math.abs(e.imaginary) > CONJ_TOL
      ) {
        j = k;
        break;
      }
    }
    if (j >= 0) {
      const plus = e.imaginary >= 0 ? e : eigenvalues[j];
      const minus = e.imaginary < 0 ? e : eigenvalues[j];
      items.push({ kind: 'conjugate', plus, minus, index: ++pairIndex });
      used.add(i);
      used.add(j);
    } else {
      const re = e.value;
      const im = Math.abs(e.imaginary);
      items.push({
        kind: 'conjugate',
        plus: { value: re, imaginary: im },
        minus: { value: re, imaginary: -im },
        index: ++pairIndex,
      });
      used.add(i);
    }
  }
  return items;
}
