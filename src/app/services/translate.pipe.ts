import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Translation can change without input change (lang toggle)
})
export class TranslatePipe implements PipeTransform {
  private i18n = inject(TranslationService);

  transform(key: string): string {
    return this.i18n.translate(key);
  }
}
