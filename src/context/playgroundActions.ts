import type { ModelId } from '../models/types';

export interface PlaygroundActions {
  setFreezeA: (on: boolean) => void;
  setModelId: (id: ModelId) => void;
  setModelCParams?: () => void;
  resetAll: () => void;
}

let registered: PlaygroundActions | null = null;

export function registerPlaygroundActions(actions: PlaygroundActions | null) {
  registered = actions;
}

export function getPlaygroundActions(): PlaygroundActions | null {
  return registered;
}

export function scrollToPlayground() {
  document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' });
}
