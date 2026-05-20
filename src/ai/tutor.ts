/**
 * State-aware teaching assistant (rule-based). Replace askAI() with LLM API in production.
 * AI-assisted, human-verified.
 */

import type { Locale } from '../i18n/types';

export interface AIState {
  modelId: string;
  params: Record<string, number>;
  residual: number | null;
  residualAbs?: number;
  lambdaGuess: number;
  freezeA: boolean;
  x: number[];
  iterationStep: number;
  notConverged: boolean;
  spectralGap?: number;
}

function residualAssessment(r: number, isZh: boolean): string {
  if (r < 0.001) return isZh ? '非常接近精确解 (r_rel < 0.001)' : 'Very close to an exact solution (r_rel < 0.001)';
  if (r < 0.05) return isZh ? '残差较小，接近解' : 'Residual is small — near a solution';
  if (r < 0.2) return isZh ? '残差中等，可继续调整 x 或 λ' : 'Moderate residual — tune x or λ';
  return isZh ? '残差较大，远离自洽解' : 'Large residual — far from a consistent pair';
}

export function askAI(question: string, state: AIState, locale: Locale = 'en'): string {
  const q = question.toLowerCase().trim();
  const { modelId, params, residual, freezeA, notConverged, iterationStep, lambdaGuess, x } = state;
  const alpha = params.alpha ?? params.beta ?? params.beta1 ?? 0;
  const r = residual ?? 1;
  const isZh = locale.startsWith('zh');

  const header = isZh
    ? `【状态】模型 ${modelId}，α/β≈${alpha.toFixed(2)}，λ_guess=${lambdaGuess.toFixed(4)}，r_rel=${r.toFixed(4)}`
    : `[State] model=${modelId}, coupling≈${alpha.toFixed(2)}, λ_guess=${lambdaGuess.toFixed(4)}, r_rel=${r.toFixed(4)}`;

  const assess = residualAssessment(r, isZh);

  if (/frozen|freeze|冻结|误区/.test(q) || freezeA) {
    const body = isZh
      ? '冻结 A(x₀) 只求解线性 EVP。取消勾选后观察 A(x) 随 x 变化的真实 NEPv 残差。'
      : 'Frozen A(x₀) solves a linear EVP only. Uncheck pitfall mode to see true NEPv coupling.';
    return `${header}\n${assess}\n\n${body}`;
  }

  if (/converg|收敛|not converg/.test(q) || notConverged || (iterationStep > 80 && r > 0.01)) {
    const body = isZh
      ? `迭代 ${iterationStep} 步后 r_rel=${r.toFixed(4)}。建议：降低 α 到 0.3–0.5；尝试最小特征值迭代；换初值（重置到远离解）。`
      : `After ${iterationStep} steps, r_rel=${r.toFixed(4)}. Try lowering α to 0.3–0.5; smallest-|μ| mode; reset far from solution.`;
    return `${header}\n${assess}\n\n${body}`;
  }

  if (/how many|多少|solution|解/.test(q)) {
    const body = isZh
      ? 'NEPv 可有多个解。查看 r(θ) 极坐标图的多个极小值 — 每个极小值对应一个候选方向。'
      : 'NEPv may have multiple solutions. Inspect local minima on the r(θ) polar plot — each is a candidate direction.';
    return `${header}\n\n${body}`;
  }

  if (alpha > 1.0 && r > 0.05) {
    const body = isZh
      ? `耦合 α=${alpha.toFixed(2)} 偏大，Lipschitz 估计高，SCF 可能不收敛。建议 α∈[0.3,0.6]。`
      : `Coupling α=${alpha.toFixed(2)} is high — SCF may diverge. Try α in [0.3, 0.6].`;
    return `${header}\n${assess}\n\n${body}`;
  }

  const generic = isZh
    ? `x≈[${x.map((v) => v.toFixed(3)).join(',')}]。可拖动罗盘、点击 r(θ) 极小值、或切换模型 B/C 对比。`
    : `x≈[${x.map((v) => v.toFixed(3)).join(',')}]. Drag compass, click r(θ) minima, or switch models B/C.`;

  return `${header}\n${assess}\n\n${generic}`;
}
