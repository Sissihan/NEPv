import type { ModelId } from '../models/types';
import type { Translations } from './types';

export function getModelCopy(t: Translations, id: ModelId) {
  return t.models[id];
}

export function getParamLabel(
  t: Translations,
  modelId: ModelId,
  paramKey: string,
): string {
  const params = t.models[modelId].params as Record<string, string>;
  return params[paramKey] ?? paramKey;
}
