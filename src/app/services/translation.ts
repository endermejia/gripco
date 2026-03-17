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
  private _translations = signal<Record<string, Record<Lang, string>>>({});

  lang = signal<Lang>('es');
  
  constructor() {
    this.loadTranslations();
  }

  private async loadTranslations() {
    try {
      const url = '/assets/i18n.json';
      const data = await this.http.get<Record<string, Record<Lang, string>>>(url).toPromise();

      if (data) {
        this._translations.set(data);
      }
    } catch (error) {
      console.error(`Could not load translations`, error);
    }
  }

  setLang(lang: Lang) {
    this.lang.set(lang);
  }

  toggleLang() {
    this.lang.update(l => l === 'es' ? 'en' : 'es');
  }

  translate(key: string): string {
    const entry = this._translations()[key];
    if (!entry) return key;
    return entry[this.lang()] || entry['es'] || key;
  }
}
