import { ChangeDetectionStrategy, Component } from '@angular/core';

interface TimelineEntry {
  year: string;
  title: string;
  description: string;
  tags: string[];
}

@Component({
  selector: 'app-engineering-journey',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="journey">
      <h1>Engineering Journey</h1>
      <p class="journey__intro">
        A chronological path from curiosity to production-grade engineering.
      </p>

      <div class="journey__timeline">
        @for (entry of timeline; track entry.year) {
          <div class="timeline-entry">
            <div class="timeline-entry__marker">
              <span class="timeline-entry__year">{{ entry.year }}</span>
              <div class="timeline-entry__dot"></div>
            </div>
            <div class="timeline-entry__content">
              <h2 class="timeline-entry__title">{{ entry.title }}</h2>
              <p class="timeline-entry__desc">{{ entry.description }}</p>
              <div class="timeline-entry__tags">
                @for (tag of entry.tags; track tag) {
                  <span class="timeline-entry__tag">{{ tag }}</span>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </article>
  `,
  styles: [`
    .journey {
      max-width: 750px;

      h1 { margin-bottom: 0.5rem; color: #1b1b1b; }
      &__intro { color: #555; margin-bottom: 2rem; line-height: 1.5; }
    }

    .journey__timeline {
      position: relative;
      padding-left: 2rem;

      &::before {
        content: '';
        position: absolute;
        left: 0.75rem;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e0e0e0;
      }
    }

    .timeline-entry {
      position: relative;
      padding-bottom: 2rem;

      &:last-child { padding-bottom: 0; }

      &__marker {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }

      &__year {
        position: absolute;
        left: -2rem;
        width: 3.5rem;
        text-align: right;
        font-size: 0.75rem;
        font-weight: 700;
        color: #cc071e;
      }

      &__dot {
        position: absolute;
        left: -1.5rem;
        width: 0.625rem;
        height: 0.625rem;
        background: #cc071e;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 0 0 2px #cc071e;
      }

      &__content {
        background: #fff;
        border: 1px solid #e8e8e8;
        border-radius: 0.5rem;
        padding: 1rem 1.25rem;
      }

      &__title {
        font-size: 0.95rem;
        font-weight: 600;
        color: #1b1b1b;
        margin-bottom: 0.375rem;
      }

      &__desc {
        font-size: 0.875rem;
        color: #444;
        line-height: 1.5;
        margin-bottom: 0.5rem;
      }

      &__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      &__tag {
        font-size: 0.7rem;
        padding: 0.15rem 0.5rem;
        background: #f0f0f0;
        border-radius: 1rem;
        color: #555;
        font-weight: 500;
      }
    }
  `]
})
export class EngineeringJourneyComponent {
  readonly timeline: TimelineEntry[] = [
    {
      year: '1990s',
      title: 'First Contact with Computing',
      description: 'Discovered programming through early personal computers. Built curiosity about how software works.',
      tags: ['Curiosity', 'Self-taught']
    },
    {
      year: '2000s',
      title: 'Formal Education & Early Career',
      description: 'Computer Science studies. First professional experiences with web development and database systems.',
      tags: ['University', 'Web Development', 'SQL']
    },
    {
      year: '2008',
      title: 'Moved to London',
      description: 'Relocated to the UK. Started working in international tech environments, gaining professional English fluency.',
      tags: ['London', 'International', 'English']
    },
    {
      year: '2010s',
      title: 'Enterprise Java & Full-Stack',
      description: 'Deep work with Java EE, Hibernate, PostgreSQL, and JSF. Maintained and modernized large-scale systems. Led debugging and performance optimization efforts.',
      tags: ['Java EE', 'Hibernate', 'PostgreSQL', 'JSF', 'Performance']
    },
    {
      year: '2015',
      title: 'SENAI/SC — Education Management System',
      description: 'Joined SGN team: a monolithic Jakarta EE system serving 300+ schools. Responsible for development, incident resolution, and production troubleshooting.',
      tags: ['SGN', 'Jakarta EE', 'Production', 'JMS/ActiveMQ']
    },
    {
      year: '2020',
      title: 'Production Performance Engineering',
      description: 'Solved critical performance issues: 16-min→2s page loads, N+1 elimination, cartesian product fixes. Built monitoring practices with Glowroot and Kibana.',
      tags: ['APM', 'Query Optimization', 'Monitoring', 'Glowroot']
    },
    {
      year: '2022',
      title: 'Modernization Initiatives',
      description: 'Led Java 11→21 migration planning, PrimeFaces 10→15 upgrade, and Hibernate 5→6 preparation. Designed patterns for incremental modernization.',
      tags: ['Migration', 'Java 21', 'PrimeFaces 15', 'Architecture']
    },
    {
      year: '2024',
      title: 'AI-Assisted Development',
      description: 'Integrated AI tooling into daily workflow: automated code review, MCP servers for database/APM, and structured knowledge management.',
      tags: ['AI', 'Automation', 'MCP', 'Tooling']
    },
    {
      year: '2025',
      title: 'Relocated to Spain',
      description: 'Moved to Granada with full EU work authorization. Preparing for modern JVM product-team roles (Spring Boot, Angular, Kotlin).',
      tags: ['Spain', 'EU', 'Spring Boot', 'Angular', 'Kotlin']
    },
    {
      year: '2026',
      title: 'REWE Digital — Next Chapter',
      description: 'Actively preparing for Fullstack Developer role at REWE Team TRAB. Studying logistics domain, Angular 19, and distributed systems.',
      tags: ['REWE', 'Angular 19', 'Logistics', 'Distributed Systems']
    }
  ];
}
