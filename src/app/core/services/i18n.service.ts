import { Injectable, signal, computed, effect } from '@angular/core';

export type Locale = 'en' | 'es';

@Injectable({ providedIn: 'root' })
export class I18nService {
  /** Current locale signal — reactive, components auto-update */
  readonly locale = signal<Locale>(this.loadSavedLocale());

  /** All translations for current locale */
  private readonly translations = signal<Record<string, unknown>>({});

  /** Reactive version counter — forces pipe re-evaluation on language change */
  readonly version = computed(() => `${this.locale()}-${Object.keys(this.translations()).length}`);

  constructor() {
    // Load translations whenever locale changes
    effect(() => {
      const lang = this.locale();
      this.fetchTranslations(lang);
    });
  }

  /** Switch language and persist preference */
  setLocale(lang: Locale): void {
    this.locale.set(lang);
    localStorage.setItem('app-locale', lang);
    document.documentElement.lang = lang;
  }

  /** Translate a dot-notated key (e.g. 'nav.home') */
  t(key: string): string {
    const value = this.getNestedValue(this.translations(), key);
    return typeof value === 'string' ? value : key;
  }

  /** Load saved locale from localStorage, default to 'en' */
  private loadSavedLocale(): Locale {
    const saved = localStorage.getItem('app-locale');
    if (saved === 'en' || saved === 'es') return saved;
    // Auto-detect from browser
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'es' ? 'es' : 'en';
  }

  /** Fetch JSON translation file */
  private async fetchTranslations(lang: Locale): Promise<void> {
    try {
      const response = await fetch(`data/i18n/${lang}.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      this.translations.set(data);
    } catch (e) {
      console.error(`[i18n] Failed to load ${lang}.json`, e);
      // Fallback: if not English, try loading English
      if (lang !== 'en') {
        this.fetchTranslations('en');
      }
    }
  }

  /** Navigate nested object by dot path: 'nav.home' → obj.nav.home */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, part) => {
      if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  }
}
