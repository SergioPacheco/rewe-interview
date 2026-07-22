import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="contact">
      <h1>Contact</h1>

      <section class="contact__info">
        <div class="contact__card">
          <h2>Antonio Sergio Ferreira Pacheco</h2>
          <p class="contact__subtitle">Senior Java & Full-Stack Engineer</p>

          <ul class="contact__list">
            <li>
              <span class="contact__icon">📍</span>
              <span>Granada, Spain</span>
            </li>
            <li>
              <span class="contact__icon">📞</span>
              <a href="tel:+34641470235">+34 641 470 235</a>
            </li>
            <li>
              <span class="contact__icon">✉️</span>
              <a href="mailto:asfpacheco@gmail.com">asfpacheco&#64;gmail.com</a>
            </li>
            <li>
              <span class="contact__icon">🔗</span>
              <a href="https://linkedin.com/in/asfpacheco" target="_blank" rel="noopener">
                linkedin.com/in/asfpacheco
              </a>
            </li>
            <li>
              <span class="contact__icon">💻</span>
              <a href="https://github.com/SergioPacheco" target="_blank" rel="noopener">
                github.com/SergioPacheco
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section class="contact__availability">
        <h2>Availability</h2>
        <ul>
          <li>✅ EU work authorization — no sponsorship required</li>
          <li>✅ Open to relocation within Europe</li>
          <li>✅ Hybrid or on-site arrangements</li>
          <li>✅ Available to start within standard notice period</li>
        </ul>
      </section>
    </article>
  `,
  styles: [`
    .contact {
      max-width: 600px;

      h1 { margin-bottom: 1.5rem; color: #1b1b1b; }
      h2 { margin-top: 1.5rem; margin-bottom: 0.75rem; color: #333; font-size: 1.125rem; }

      &__card {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 0.5rem;
        padding: 1.5rem;
      }

      &__subtitle { color: #666; margin-bottom: 1rem; }

      &__list {
        list-style: none;
        padding: 0;

        li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child { border-bottom: none; }
        }

        a { color: #cc071e; text-decoration: none; &:hover { text-decoration: underline; } }
      }

      &__icon { font-size: 1.1rem; }

      &__availability {
        ul { padding-left: 1.25rem; }
        li { margin-bottom: 0.5rem; line-height: 1.5; color: #444; }
      }
    }
  `]
})
export class ContactComponent {}
