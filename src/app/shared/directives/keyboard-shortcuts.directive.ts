import { Directive, HostListener, inject, output } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Keyboard shortcuts directive — enterprise-level accessibility.
 * Attach to host element for scoped keyboard handling.
 *
 * Shortcuts:
 * - Ctrl+Enter / Cmd+Enter: submit answer
 * - N: next question (when result shown)
 * - H: go home
 * - Escape: close current view
 * - 1-4: select option by number
 */
@Directive({
  selector: '[appKeyboardShortcuts]',
  standalone: true
})
export class KeyboardShortcutsDirective {
  private router = inject(Router);

  submitAnswer = output<void>();
  nextQuestion = output<void>();
  selectOption = output<number>();

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    // Don't handle if user is typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    // Ctrl+Enter or Cmd+Enter: submit
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.submitAnswer.emit();
      return;
    }

    switch (event.key) {
      case 'n':
      case 'N':
        this.nextQuestion.emit();
        break;

      case 'h':
      case 'H':
        this.router.navigate(['/']);
        break;

      case 'Escape':
        this.router.navigate(['/']);
        break;

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        this.selectOption.emit(parseInt(event.key) - 1);
        break;
    }
  }
}
