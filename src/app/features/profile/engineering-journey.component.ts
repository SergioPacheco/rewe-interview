import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface TimelineEntry {
  year: string;
  title: string;
  description: string;
  tags: string[];
  caseStudyLink?: string;
  caseStudyLabel?: string;
}

@Component({
  selector: 'app-engineering-journey',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="journey">
      <h1>Engineering Journey</h1>
      <p class="journey__intro">
        Over three decades, my career has crossed enterprise software, leadership,
        entrepreneurship and international relocation. Each stage changed the way
        I think about engineering, software and solving real business problems.
      </p>

      <div class="journey__timeline">
        @for (entry of timeline; track entry.year) {
          <div class="timeline-entry">
            <span class="timeline-entry__year">{{ entry.year }}</span>
            <div class="timeline-entry__dot"></div>
            <div class="timeline-entry__content">
              <h2 class="timeline-entry__title">{{ entry.title }}</h2>
              <p class="timeline-entry__desc">{{ entry.description }}</p>
              @if (entry.caseStudyLink) {
                <a class="timeline-entry__case-link"
                   routerLink="/profile/case-studies"
                   [fragment]="entry.caseStudyLink">
                  📊 {{ entry.caseStudyLabel }}
                </a>
              }
              <div class="timeline-entry__tags">
                @for (tag of entry.tags; track tag) {
                  <span class="timeline-entry__tag">{{ tag }}</span>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <section class="journey__principles">
        <h2>Engineering Principles</h2>
        <p>
          Throughout my career I have learned that good software is not only about writing code.
          It is about understanding the business, communicating clearly, solving production problems,
          continuously learning, and taking ownership of outcomes.
        </p>
      </section>
    </article>
  `,
  styles: [`
    .journey {
      max-width: 750px;

      h1 { margin-bottom: 0.5rem; color: #1b1b1b; }
      &__intro { color: #444; margin-bottom: 2rem; line-height: 1.6; font-size: 0.95rem; }

      &__principles {
        margin-top: 2.5rem;
        padding: 1.25rem 1.5rem;
        background: #fff;
        border: 1px solid #e8e8e8;
        border-radius: 0.5rem;

        h2 {
          font-size: 1rem;
          font-weight: 600;
          color: #1b1b1b;
          margin-bottom: 0.5rem;
        }

        p {
          font-size: 0.875rem;
          color: #444;
          line-height: 1.6;
          margin: 0;
        }
      }
    }

    .journey__timeline {
      position: relative;
      padding-left: 0;
    }

    .timeline-entry {
      display: grid;
      grid-template-columns: 5.5rem 1rem 1fr;
      gap: 0;
      align-items: start;
      padding-bottom: 2rem;
      position: relative;

      &:last-child { padding-bottom: 0; }

      /* Vertical line between dots */
      &:not(:last-child)::before {
        content: '';
        position: absolute;
        left: calc(5.5rem + 0.5rem - 1px);
        top: 1.7rem;
        bottom: -1rem;
        width: 2px;
        background: #e0e0e0;
        z-index: 0;
      }

      &__year {
        text-align: right;
        font-size: 0.75rem;
        font-weight: 700;
        color: #cc071e;
        white-space: nowrap;
        padding-top: 1rem;
        padding-right: 0.5rem;
      }

      &__dot {
        width: 0.625rem;
        height: 0.625rem;
        background: #cc071e;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 0 0 2px #cc071e;
        margin-top: 1.1rem;
        justify-self: center;
        z-index: 1;
      }

      &__content {
        background: #fff;
        border: 1px solid #e8e8e8;
        border-radius: 0.5rem;
        padding: 1rem 1.25rem;
        margin-left: 0.75rem;
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
        line-height: 1.6;
        margin-bottom: 0.5rem;
      }

      &__case-link {
        display: inline-block;
        font-size: 0.8rem;
        color: #cc071e;
        text-decoration: none;
        margin-bottom: 0.5rem;

        &:hover { text-decoration: underline; }
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
      year: '1987–1988',
      title: 'First Professional Experience',
      description:
        'Started working at Rádio TV Amazonas as a Video Tape operator. ' +
        'Not yet a software role, but the first exposure to technology, equipment maintenance ' +
        'and operational responsibility in a professional environment.',
      tags: ['Television', 'Operations', 'Amazonas']
    },
    {
      year: '1989',
      title: 'First Contact with Software',
      description:
        'Worked as a mini-computer operator at Premotor using BLISS/COBOL systems for business applications. ' +
        'This was my first experience maintaining production software and understanding ' +
        'how business processes were translated into code.',
      tags: ['COBOL', 'Premotor', 'Business Systems']
    },
    {
      year: '1990–1992',
      title: 'Teaching & Software Development',
      description:
        'Worked simultaneously as an IT instructor (dBASE III, Lotus 1-2-3, MS-DOS) ' +
        'and as a developer at Dinâmica S/A building mainframe business applications for freight and billing systems. ' +
        'Teaching forced me to understand concepts deeply enough to explain them clearly — ' +
        'a habit that has benefited me throughout my engineering career.',
      tags: ['Teaching', 'Mainframe', 'Dinâmica S/A']
    },
    {
      year: '1993–1996',
      title: 'Enterprise Government Systems',
      description:
        'Developed software for the São Paulo State Legislative Assembly (ALESP), ' +
        'building and maintaining document management systems used by public administration. ' +
        'First experience with long-lived enterprise systems and complex business rules ' +
        'that needed to survive changes in legislation and organizational structure.',
      tags: ['ALESP', 'Enterprise Systems', 'Public Sector']
    },
    {
      year: '1997–1999',
      title: 'IT Director',
      description:
        'Transitioned from ALESP to become IT Director ' +
        'for the municipal government of Presidente Prudente (PMPP). ' +
        'Responsible for software development, infrastructure and technology decisions for the entire organization. ' +
        'Also managed Y2K risk mitigation for legacy Unisys/COBOL systems.',
      tags: ['Leadership', 'Infrastructure', 'Y2K']
    },
    {
      year: '2000–2007',
      title: 'London & Career Reinvention',
      description:
        'Moved to London and rebuilt my life from the ground up — ' +
        'starting with delivery work before finding my footing in a new country. ' +
        'Although I spent several years outside software engineering, I became fluent in English ' +
        'and learned to adapt to a completely different professional and cultural environment. ' +
        'This experience strengthened resilience and gave me the confidence to restart my technical career.',
      tags: ['London', 'English', 'Resilience']
    },
    {
      year: '2008–2012',
      title: 'PHP Software Engineer',
      description:
        'Returned to professional software development at Tax Returns Accountants in London, ' +
        'building a tax-refund management system from scratch in PHP/MySQL. ' +
        'Designed the architecture, automated business workflows and worked directly with stakeholders in English. ' +
        'Successfully re-established my software engineering career in a different country.',
      tags: ['PHP', 'London', 'Tax Returns Accountants']
    },
    {
      year: '2013–2020',
      title: 'Entrepreneurship & Returning to Study',
      description:
        'Founded and ran Selma Imóveis, a residential construction business in Brazil. ' +
        'Running my own company taught me what it means to own a project end-to-end, ' +
        'make decisions with real financial consequences and deliver on commitments to customers. ' +
        'From 2016, simultaneously completed a degree in Internet Systems Technology (IFRN) to prepare my return to software.',
      tags: ['Selma Imóveis', 'Business Owner', 'IFRN Degree']
    },
    {
      year: '2021',
      title: 'Return to Enterprise Software',
      description:
        'Returned to enterprise software by joining SENAI, where I work on SGN — ' +
        'a large education management system used across hundreds of schools in southern Brazil. ' +
        'My initial focus involved production support, incident analysis ' +
        'and understanding a complex long-lived enterprise platform from the inside.',
      tags: ['SENAI', 'SGN', 'Production Support']
    },
    {
      year: '2022–2023',
      title: 'Production Performance Engineering',
      description:
        'Within the same role at SENAI, my focus shifted to solving real production bottlenecks: ' +
        'reduced a 16-minute page load to 2 seconds ' +
        'by eliminating cartesian products and N+1 queries (48,000 queries → 10). ' +
        'Built monitoring practices using Glowroot and Kibana. ' +
        'These experiences fundamentally changed how I think about production systems.',
      tags: ['PostgreSQL', 'N+1', '16 min → 2 s'],
      caseStudyLink: 'story-performance',
      caseStudyLabel: 'Case Study: PostgreSQL Performance Optimization'
    },
    {
      year: '2024',
      title: 'Distributed Software Architecture',
      description:
        'Completed a postgraduate specialization in Distributed Software Architecture at PUC Minas ' +
        'while continuing full-time at SENAI. Led modernization planning: Java 11→21, Hibernate 5→6, PrimeFaces 10→15. ' +
        'Formalized the architectural thinking I had been applying intuitively for years.',
      tags: ['PUC Minas', 'Architecture', 'Modernization']
    },
    {
      year: '2025–now',
      title: 'Spain & Modern Product Engineering',
      description:
        'Relocated to Granada, Spain with full EU work authorization while continuing to evolve technically. ' +
        'Building hands-on experience with Spring Boot, Angular and AI-assisted development ' +
        'through personal projects, while preparing the transition to modern product-engineering teams in Europe.',
      tags: ['Spain', 'EU Authorization', 'Spring Boot']
    }
  ];
}
