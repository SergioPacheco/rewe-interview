import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cover-letter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="cover-letter">
      <h1>Cover Letter</h1>

      <section class="cover-letter__body">
        <p class="cover-letter__date">July 2026</p>

        <p>Dear Hiring Team at REWE Digital,</p>

        <p>
          I am writing to express my strong interest in the <strong>Fullstack Developer</strong> position
          within Team TRAB. With over a decade of hands-on experience building and maintaining
          business-critical enterprise systems in Java/Jakarta EE, combined with practical Angular
          and TypeScript work, I believe I can contribute meaningfully to your team from day one.
        </p>

        <p>
          At SENAI/SC, I work on an education management system serving 300+ schools and thousands
          of concurrent users. I've solved real production problems: reducing a 16-minute page load to
          2 seconds by eliminating N+1 queries and cartesian products, modernizing legacy monoliths,
          and managing production incidents with structured diagnosis methods.
        </p>

        <p>
          What excites me about REWE Digital is the scale of the logistics challenge — route optimization,
          real-time capacity planning, and the operational complexity of last-mile delivery. I see parallels
          with the scheduling and resource-allocation problems I've solved in education systems, and I'm
          eager to apply that experience to a product where technical decisions directly affect thousands
          of daily deliveries.
        </p>

        <p>
          I am based in Granada, Spain with full EU work authorization (no sponsorship required) and
          am ready to relocate or work in a hybrid arrangement as needed. I look forward to discussing
          how I can contribute to Team TRAB.
        </p>

        <p class="cover-letter__closing">
          Best regards,<br>
          <strong>Antonio Sergio Ferreira Pacheco</strong>
        </p>
      </section>
    </article>
  `,
  styles: [`
    .cover-letter {
      max-width: 700px;

      h1 { margin-bottom: 1.5rem; color: #1b1b1b; }
      &__date { color: #666; font-size: 0.875rem; margin-bottom: 1.5rem; }
      p { margin-bottom: 1rem; line-height: 1.7; color: #333; }
      &__closing { margin-top: 2rem; }
    }
  `]
})
export class CoverLetterComponent {}
