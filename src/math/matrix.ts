import type { Vec } from './vector';

export function outer(x: Vec): number[][] {
  const n = x.length;
  const M: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      M[i][j] = x[i] * x[j];
    }
  }
  return M;
}

export function addMatrices(A: number[][], B: number[][]): number[][] {
  return A.map((row, i) => row.map((v, j) => v + (B[i]?.[j] ?? 0)));
}

export function scaleMatrix(A: number[][], s: number): number[][] {
  return A.map((row) => row.map((v) => v * s));
}

export function cloneMatrix(A: number[][]): number[][] {
  return A.map((row) => [...row]);
}

export function isDiagonal(A: number[][], tol = 1e-10): boolean {
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A.length; j++) {
      if (i !== j && Math.abs(A[i][j]) > tol) return false;
    }
  }
  return true;
}

export function diagonalEntries(A: number[][]): number[] {
  return A.map((row, i) => row[i] ?? 0);
}
