import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TopicService } from '../../core/services/topic.service';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

interface CaseStudy {
  subtopicId: string;
  title: string;
  sections: { heading: string; content: string }[];
}

/**
 * Maps the internal story IDs to professional case-study titles.
 */
const CASE_STUDY_TITLES: Record<string, string> = {
  'story-performance': 'PostgreSQL Performance Optimization',
  'story-logistics': 'Freight Billing Automation',
  'story-n1': 'N+1 Query Detection and Resolution',
  'story-legacy': 'Legacy Code Modernization',
  'story-incident': 'Production Incident Management',
  'story-disagreement': 'Technical Disagreement Resolution',
  'story-learning': 'Rapid Technology Adoption',
  'story-ai': 'AI-Assisted Engineering Platform',
  'story-template': 'Case Study Template',
};

@Component({
  selector: 'app-case-studies',
  standalone: true,
  imports: [MarkdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="case-studies">
      <h1>Case Studies</h1>
      <p class="case-studies__intro">
        Real production problems I solved — with measurable outcomes, tools used,
        and reasoning I can explain in depth during an interview.
      </p>

      @if (loading()) {
        <p class="case-studies__loading">Loading case studies...</p>
      } @else if (studies().length === 0) {
        <p>No case studies available.</p>
      } @else {
        <div class="case-studies__grid">
          @for (study of studies(); track study.subtopicId) {
            <details class="case-study-card" [id]="study.subtopicId">
              <summary class="case-study-card__header">
                <h2 class="case-study-card__title">{{ study.title }}</h2>
              </summary>
              <div class="case-study-card__body">
                @for (section of study.sections; track section.heading) {
                  <div class="case-study-card__section">
                    <h3>{{ section.heading }}</h3>
                    <div [innerHTML]="section.content | markdown"></div>
                  </div>
                }
              </div>
            </details>
          }
        </div>
      }
    </article>
  `,
  styles: [`
    .case-studies {
      max-width: 800px;

      h1 { margin-bottom: 0.75rem; color: #1b1b1b; }
      &__intro { color: #555; margin-bottom: 2rem; line-height: 1.5; }
      &__loading { color: #888; }
    }

    .case-studies__grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .case-study-card {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 0.5rem;
      overflow: hidden;

      &[open] { border-color: #cc071e; }

      &__header {
        padding: 1rem 1.25rem;
        cursor: pointer;
        list-style: none;
        display: flex;
        align-items: center;

        &::-webkit-details-marker { display: none; }
        &::marker { display: none; content: ''; }

        &:hover { background: #fafafa; }
      }

      &__title {
        font-size: 1rem;
        font-weight: 600;
        color: #1b1b1b;
        margin: 0;
      }

      &__body {
        padding: 0 1.25rem 1.25rem;
        border-top: 1px solid #f0f0f0;
      }

      &__section {
        margin-top: 1rem;

        h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 0.5rem;
        }

        :host ::ng-deep {
          p { margin-bottom: 0.5rem; line-height: 1.6; color: #333; }
          pre { background: #f5f5f5; padding: 0.75rem; border-radius: 0.25rem; overflow-x: auto; font-size: 0.8rem; }
          code { font-family: 'JetBrains Mono', monospace; }
          ul, ol { padding-left: 1.25rem; margin-bottom: 0.5rem; }
          li { margin-bottom: 0.25rem; line-height: 1.5; }
          strong { color: #1b1b1b; }
        }
      }
    }
  `]
})
export class CaseStudiesComponent {
  private topicService = inject(TopicService);

  readonly loading = this.topicService.loading;

  readonly studies = computed<CaseStudy[]>(() => {
    const theory = this.topicService.getTheory('stories');
    if (!theory || theory.length === 0) return [];

    return theory
      .filter(chapter => chapter.subtopic !== 'story-template')
      .map(chapter => ({
        subtopicId: chapter.subtopic ?? chapter.id,
        title: CASE_STUDY_TITLES[chapter.subtopic ?? ''] ?? chapter.title,
        sections: chapter.sections
      }));
  });
}
