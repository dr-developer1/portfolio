import { useSyncExternalStore } from 'react';
import { resolveSitePath } from '../utils/sitePaths';

export type Locale = 'en' | 'fr';
export const LOCALE_STORAGE_KEY = 'portfolio-language';
const listeners = new Set<() => void>();

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'fr';
}

export function detectLocale(): Locale {
  const requested = new URLSearchParams(window.location.search).get('lang');
  if (isLocale(requested)) return requested;
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // The portfolio remains usable when browser storage is unavailable.
  }
  return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

let locale = detectLocale();
export const getLocale = (): Locale => locale;

function updateDocument() {
  document.documentElement.lang = locale;
  document.title =
    locale === 'fr'
      ? 'Ahmad Ibrahim — Ingénieur full-stack'
      : 'Ahmad Ibrahim — Full Stack Engineer';
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute(
      'content',
      locale === 'fr'
        ? 'Portfolio interactif d’Ahmad Ibrahim, ingénieur full-stack à Lyon. 6+ ans d’expérience en applications web, architecture et modernisation.'
        : 'Interactive portfolio of Ahmad Ibrahim, full-stack engineer in Lyon. 6+ years of web development, architecture, and modernization.'
    );
}

export function setLocale(next: Locale) {
  locale = next;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // Keep the in-memory preference for this visit.
  }
  const url = new URL(window.location.href);
  url.searchParams.set('lang', next);
  window.history.replaceState({}, '', url);
  updateDocument();
  listeners.forEach((listener) => listener());
}

updateDocument();

export function useLocale() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getLocale,
    getLocale
  );
}

export function text(en: string, fr: string, language: Locale = getLocale()): string {
  return language === 'fr' ? fr : en;
}

export function getResumePath(language: Locale = getLocale()): string {
  return resolveSitePath(language === 'fr' ? 'CV_Ahmad_IBRAHIM.pdf' : 'CV_Ahmad_IBRAHIM_En.pdf');
}
