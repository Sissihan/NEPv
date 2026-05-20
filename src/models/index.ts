import { modelA } from './modelA';
import { modelB } from './modelB';
import { modelB2x2 } from './modelB2x2';
import { modelC } from './modelC';
import type { ToyModel } from './types';

export const models: ToyModel[] = [modelA, modelB2x2, modelC, modelB];
export const modelsById = Object.fromEntries(models.map((m) => [m.id, m]));
export type { ToyModel, ModelParams } from './types';
