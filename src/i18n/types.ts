import type { ModelId } from '../models/types';

export const LOCALES = ['en', 'zh-CN', 'zh-TW'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
};

export interface ModelCopy {
  name: string;
  description: string;
  singularityNote: string;
  physical?: string;
  refs?: string;
  analyticNote?: string;
  params: Record<string, string>;
}

export interface Translations {
  meta: { title: string; lang: string };
  nav: {
    brand: string;
    home: string;
    compare: string;
    playground: string;
    pitfalls: string;
    references: string;
    language: string;
    aiTutor: string;
  };
  hero: { tag: string; title: string; lead: string; footnote: string };
  compare: {
    title: string;
    nepDefinitionTitle: string;
    nepDefinition: string;
    linearTitle: string;
    linearBody: string;
    nepTitle: string;
    nepBody: string;
    note: string;
  };
  playground: {
    title: string;
    lead: string;
    stage0: string;
    stage1: string;
    stage2: string;
    toyModel: string;
    lambdaGuessLabel: string;
    lambdaGuessHint: string;
    residualRelLabel: string;
    residualAbsLabel: string;
    residualZeroHint: string;
    spectrumHint: string;
    freezePitfall: string;
    pitfallCompareTitle: string;
    pitfallFrozenResidual: string;
    pitfallTrueResidual: string;
    pitfallLinearNote: string;
    pitfallHighlight: string;
    residualFormula: string;
    pitfallBadge: string;
    pitfallTooltip: string;
    singularWarning: string;
    loadExampleParams: string;
    resetAll: string;
    heatmapMoving: string;
    heatmapFrozen: string;
    spectrumCurrent: string;
    spectrumFrozen: string;
    spectrumInstantLabel: string;
    x3Label: string;
    polarTitle: string;
    polarCaption: string;
    polarGlobalMin: string;
    polarLocalMin: string;
    polarCurrent: string;
    polarClickHint: string;
    labFlow: string;
    sectionSetup: string;
    sectionObserve: string;
    exploreHint: string;
  };
  compass: {
    label: string;
    ariaLabel: string;
    x1: string;
    x2: string;
    zHint: string;
    normalizedToast: string;
    numericX1: string;
    numericX2: string;
  };
  spectrum: {
    defaultLabel: string;
    pitfallNote: string;
    sensitive: string;
    eigenPrefix: string;
    muPrefix: string;
    conjugatePair: string;
  };
  iteration: {
    title: string;
    scfNote: string;
    modeLabel: string;
    modeMax: string;
    modeMin: string;
    modeClosest: string;
    play: string;
    step: string;
    reset: string;
    resetRef: string;
    resetFar: string;
    notConverged: string;
    stepLabel: string;
    convergedSummary: string;
    notConvergedSummary: string;
    inProgressSummary: string;
    diagGap: string;
    diagLipschitz: string;
    diagWarn: string;
  };
  pitfalls: {
    title: string;
    freezeTitle: string;
    freezeP1: string;
    freezeP2: string;
    tryIt: string;
    scaleTitle: string;
    scaleBody: string;
    nepTitle: string;
    nepBody: string;
    complexTitle: string;
    complexBody: string;
  };
  references: {
    title: string;
    intro: string;
    items: string[];
  };
  ai: {
    title: string;
    hint: string;
    statusLabel: string;
    presetsLabel: string;
    composeHint: string;
    modeDynamic: string;
    modeFrozen: string;
    responseLabel: string;
    footnote: string;
    q1: string;
    q2: string;
    q3: string;
    ask: string;
    thinking: string;
  };
  footer: string;
  models: Record<ModelId, ModelCopy>;
}
