import type { Vec } from '../math/vector';

export type ModelId =
  | 'rank-one-2x2'
  | 'diagonal-2x2'
  | 'diagonal-3x3'
  | 'nonsymmetric-2x2';

export interface ModelParams {
  [key: string]: number;
}

export interface ParamMeta {
  min: number;
  max: number;
  step: number;
}

export interface ToyModel {
  id: ModelId;
  dim: number;
  defaultX: Vec;
  defaultParams: ModelParams;
  paramKeys: string[];
  paramMeta: Record<string, ParamMeta>;
  buildA(x: Vec, params: ModelParams): number[][];
}
