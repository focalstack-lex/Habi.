import { useCallback, useSyncExternalStore } from 'react';
import { STRINGS, type Lang, type StringKey } from './strings';
import { userPrefsService } from '../services/userPrefsService';

export type { Lang, StringKey };

export function translate(_lang: Lang, key: StringKey, vars?: Record<string, string | number>): string {
  const template = STRINGS.en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

const subscribe = (listener: () => void) => userPrefsService.subscribe(listener);
const getLanguage = () => 'en' as const;

/** Current language plus a `t()` that re-renders the caller when language/preferences change. */
export function useI18n() {
  const lang = useSyncExternalStore(subscribe, getLanguage, getLanguage);
  const t = useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  );
  return { t, lang, setLang: (next: Lang) => userPrefsService.setLanguage(next) };
}
