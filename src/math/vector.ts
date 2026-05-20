export type Vec = number[];

export function norm2(v: Vec): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

export function normalize(v: Vec, eps = 1e-12): Vec {
  const n = norm2(v);
  if (n < eps) return v.map((_, i) => (i === 0 ? 1 : 0));
  return v.map((x) => x / n);
}

export function dot(a: Vec, b: Vec): number {
  return a.reduce((s, x, i) => s + x * (b[i] ?? 0), 0);
}

export function matVec(A: number[][], x: Vec): Vec {
  return A.map((row) => row.reduce((s, aij, j) => s + aij * (x[j] ?? 0), 0));
}
