import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

/**
 * Translate pipe — resolves i18n keys to localized strings.
 *
 * Usage: {{ 'nav.home' | t }}
 *
 * The pipe is impure so it re-evaluates when the locale signal changes.
 * Performance impact is negligible because the underlying lookup is O(1) hash access.
 */
@Pipe({
  name: 't',
  standalone: true,
  pure: false  // Must be impure to react to locale signal changes
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string): string {
    // Reading version() ensures Angular re-runs this pipe when locale changes
    void this.i18n.version();
    return this.i18n.t(key);
  }
}
