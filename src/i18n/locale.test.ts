import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detectLocale, getLocale, getResumePath, LOCALE_STORAGE_KEY, setLocale } from './locale';
import { getContent } from '../data/content';
import { getNode } from '../utils/fileSystem';
import { resolveOpenTarget } from '../utils/portfolioInsights';

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
  setLocale('en');
  window.history.replaceState({}, '', '/');
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  setLocale('en');
  localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('locale resolution and persistence', () => {
  it('prioritizes a valid shared language over storage and browser preference', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    window.history.replaceState({}, '', '/?lang=fr&run=experience');
    expect(detectLocale()).toBe('fr');
  });

  it('ignores unsupported query and stored values, then detects French browsers', () => {
    window.history.replaceState({}, '', '/?lang=unknown');
    localStorage.setItem(LOCALE_STORAGE_KEY, 'unsupported');
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-CA');
    expect(detectLocale()).toBe('fr');
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    expect(detectLocale()).toBe('en');
  });

  it('preserves deep links and updates document language and preference', () => {
    window.history.replaceState({}, '', '/?run=experience#work');
    setLocale('fr');
    expect(getLocale()).toBe('fr');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');
    expect(document.title).toContain('Ingénieur');
    expect(window.location.search).toBe('?run=experience&lang=fr');
    expect(window.location.hash).toBe('#work');
  });

  it('keeps language switching usable when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => setLocale('fr')).not.toThrow();
    expect(getLocale()).toBe('fr');
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    window.history.replaceState({}, '', '/');
    expect(detectLocale()).toBe('en');
  });
});

describe('localized career content and CV routes', () => {
  it('uses the matching supplied PDF for both resume opening and download paths', () => {
    expect(getResumePath('en')).toBe('/CV_Ahmad_IBRAHIM_En.pdf');
    setLocale('fr');
    expect(getResumePath()).toBe('/CV_Ahmad_IBRAHIM.pdf');
    expect(resolveOpenTarget('resume')?.url).toBe(getResumePath());
    expect(resolveOpenTarget('cv')?.url).toBe(getResumePath());
  });

  it('keeps PDF links under the deployed GitHub Pages base path', () => {
    vi.stubEnv('BASE_URL', '/portfolio/');
    expect(getResumePath('fr')).toBe('/portfolio/CV_Ahmad_IBRAHIM.pdf');
    expect(getResumePath('en')).toBe('/portfolio/CV_Ahmad_IBRAHIM_En.pdf');
  });

  it('includes current CV evidence in both languages and virtual files', () => {
    for (const locale of ['en', 'fr'] as const) {
      setLocale(locale);
      const content = getContent();
      expect(content.bio.tagline).toContain('6+');
      expect(content.experience[0].description.join(' ')).toContain('Sogecommerce');
      expect(content.experience[0].description.join(' ')).toContain('Puppeteer');
      expect(getNode('/home/visitor/bio.txt')?.content).toContain(content.bio.tagline);
      expect(getNode('/home/visitor/experience/silico-1.txt')?.content).toContain('Sogecommerce');
      expect(getNode('/home/visitor/education/la-rochelle-university-1.txt')).not.toBeNull();
    }
  });
});
