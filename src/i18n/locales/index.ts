import type { Locale } from '../types';
import en from './en';
import zhCN from './zh-CN';
import zhTW from './zh-TW';

export const messages = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
} as const;

export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  const langs = navigator.languages ?? [navigator.language];
  for (const raw of langs) {
    const l = raw.toLowerCase();
    if (l.startsWith('zh-tw') || l.startsWith('zh-hk') || l.startsWith('zh-mo')) return 'zh-TW';
    if (l.startsWith('zh')) return 'zh-CN';
    if (l.startsWith('en')) return 'en';
  }
  return 'en';
}
