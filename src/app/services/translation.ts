import { Injectable, signal, computed, inject, effect, PLATFORM_ID, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { REQUEST } from '@angular/core';

export type Lang = 'es' | 'en';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private http = inject(HttpClient);
  private _lang = signal<Lang>('es');
  private _translations = signal<Record<string, string>>({});

  lang = computed(() => this._lang());
  t = computed(() => this._translations());

  constructor() {
    // Load translations whenever language changes
    effect(() => {
      this.loadTranslations(this._lang());
    });
  }

  private platformId = inject(PLATFORM_ID);

  private async loadTranslations(lang: Lang) {
    try {
      const url = `/assets/i18n/${lang}.json`;
      const data = await this.http.get<Record<string, string>>(url).toPromise();

      if (data) {
        this._translations.set(data);
      }
    } catch (error) {
      console.error(`Could not load translations for ${lang}`, error);
    }
  }

  setLang(lang: Lang) {
    this._lang.set(lang);
  }

  toggleLang() {
    this._lang.update(l => l === 'es' ? 'en' : 'es');
  }

  translate(key: string): string {
    return this.t()[key] || key;
  }
}
