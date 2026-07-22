import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="about-me">
      <h1>About Me</h1>

      <section class="about-me__intro">
        <p>
          I'm <strong>Antonio Sergio Ferreira Pacheco</strong> — a Senior Java & Full-Stack Engineer
          with production experience developing, maintaining and modernizing business-critical enterprise systems.
        </p>
        <p>
          I live in Granada, Spain with EU work authorization. I've spent over a decade working in London
          before relocating, which gives me full professional fluency in English.
        </p>
      </section>

      <section class="about-me__focus">
        <h2>Current Focus</h2>
        <ul>
          <li>Preparing for product-team roles with modern JVM stacks (Spring Boot, Angular, Kotlin)</li>
          <li>Deep experience in Jakarta EE, Hibernate/JPA, PostgreSQL, REST/SOAP, JMS/ActiveMQ</li>
          <li>Passionate about performance optimization, clean architecture, and production reliability</li>
        </ul>
      </section>

      <section class="about-me__values">
        <h2>Engineering Values</h2>
        <ul>
          <li><strong>Evidence over claims</strong> — I measure before I optimize, and I track what I've done</li>
          <li><strong>Simplicity</strong> — the best solution is the one easy to understand and maintain</li>
          <li><strong>Ownership</strong> — I care about what happens after the code is merged</li>
          <li><strong>Continuous learning</strong> — this entire interview-prep site is how I study</li>
        </ul>
      </section>

      <section class="about-me__links">
        <h2>Explore More</h2>
        <ul>
          <li><a routerLink="../resume">📄 Resume</a> — full professional background</li>
          <li><a routerLink="../case-studies">📊 Case Studies</a> — real production problems I solved</li>
          <li><a routerLink="../engineering-journey">🛤️ Engineering Journey</a> — timeline from 1990 to now</li>
        </ul>
      </section>
    </article>
  `,
  styles: [`
    .about-me {
      max-width: 700px;

      h1 { margin-bottom: 1.5rem; color: #1b1b1b; }
      h2 { margin-top: 2rem; margin-bottom: 0.75rem; color: #333; font-size: 1.125rem; }
      p { margin-bottom: 1rem; line-height: 1.6; color: #444; }
      ul { padding-left: 1.25rem; margin-bottom: 1rem; }
      li { margin-bottom: 0.5rem; line-height: 1.5; color: #444; }
      a { color: #cc071e; text-decoration: none; &:hover { text-decoration: underline; } }
    }
  `]
})
export class AboutMeComponent {}
