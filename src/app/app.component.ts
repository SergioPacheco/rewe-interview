import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { TopicService } from './core/services/topic.service';
import { ProgressService } from './core/services/progress.service';
import { I18nService, Locale } from './core/services/i18n.service';
import { TranslatePipe } from './shared/pipes/translate.pipe';
import { Subtopic, Topic, TopicGroup } from './models';

interface Breadcrumb {
  label: string;
  url: string | null;
}

interface SidebarGroup {
  group: TopicGroup;
  label: string;
}

interface SidebarSubtopicGroup {
  label: string;
  items: Subtopic[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private topicService = inject(TopicService);
  private router = inject(Router);
  protected progressService = inject(ProgressService);
  protected i18n = inject(I18nService);

  sidebarOpen = signal(false);
  expandedTopic = signal<string | null>(null);
  searchQuery = signal('');
  breadcrumbs = signal<Breadcrumb[]>([]);

  readonly domainGroups: SidebarGroup[] = [
    { group: 'interview', label: 'INTERVIEW' },
    { group: 'backend', label: 'BACKEND' },
    { group: 'distributed', label: 'ARCHITECTURE' },
    { group: 'frontend', label: 'FRONTEND' },
    { group: 'quality', label: 'DEVOPS & QUALITY' },
    { group: 'ai', label: 'AI' },
  ];

  async ngOnInit(): Promise<void> {
    await this.topicService.loadAll();

    // Build breadcrumbs on navigation + scroll to top + auto-expand sidebar
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateBreadcrumbs();
      // Scroll main-content to top on navigation
      const main = document.querySelector('.main-content');
      if (main) main.scrollTop = 0;
      // Auto-expand sidebar for current topic
      const url = this.router.url;
      const parts = url.split('#')[0].split('?')[0].split('/').filter(Boolean);
      if (parts[0] === 'topic' && parts[1]) {
        this.expandedTopic.set(parts[1]);
      }
    });
    this.updateBreadcrumbs();
  }

  private updateBreadcrumbs(): void {
    const url = this.router.url;
    const crumbs: Breadcrumb[] = [{ label: this.i18n.t('breadcrumb.home'), url: '/' }];

    if (url === '/' || url === '') {
      this.breadcrumbs.set([]);
      return;
    }

    const parts = url.split('#')[0].split('?')[0].split('/').filter(Boolean);

    if (parts[0] === 'topic' && parts[1]) {
      const topic = this.topicService.getTopic(parts[1]);
      crumbs.push({ label: topic?.name ?? parts[1], url: null });
    } else if (parts[0] === 'quiz' && parts[1]) {
      const topic = this.topicService.getTopic(parts[1]);
      crumbs.push({ label: topic?.name ?? parts[1], url: `/topic/${parts[1]}` });
      crumbs.push({ label: this.i18n.t('breadcrumb.quiz'), url: null });
    } else if (parts[0] === 'resume') {
      crumbs.push({ label: this.i18n.t('nav.resume'), url: null });
    }

    this.breadcrumbs.set(crumbs);
  }

  getTopicsByGroup(group: TopicGroup): Topic[] {
    const query = this.searchQuery().toLowerCase();
    const topics = this.topicService.getByGroup(group)
      .filter(t => t.id !== 'stories' && t.id !== 'portfolio');
    if (!query) return topics;
    return topics.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.subtopics?.some(s => s.label.toLowerCase().includes(query))
    );
  }

  /**
   * Menu phases make a topic read as a learning sequence rather than a flat
   * list of terms. Labels are topic-specific; items retain stable IDs/routes.
   */
  getSubtopicGroups(topic: Topic): SidebarSubtopicGroup[] {
    const labels = TOPIC_PHASES[topic.id] ?? [''];
    const items = topic.subtopics ?? [];
    const sizes = TOPIC_PHASE_SIZES[topic.id];

    if (sizes) {
      // Explicit sizes per phase
      let offset = 0;
      return labels
        .map((label, index) => {
          const count = sizes[index] ?? 0;
          const group = { label, items: items.slice(offset, offset + count) };
          offset += count;
          return group;
        })
        .filter(group => group.items.length > 0);
    }

    // Default: equal division
    const size = Math.ceil(items.length / labels.length);
    return labels
      .map((label, index) => ({ label, items: items.slice(index * size, (index + 1) * size) }))
      .filter(group => group.items.length > 0);
  }

  hasExercises(topicId: string, subtopicId?: string): boolean {
    if (!subtopicId) {
      return this.topicService.getQuestions(topicId).length > 0;
    }
    // Exercises use subtopic labels (e.g., "Encapsulation"), not IDs (e.g., "oop-encapsulation")
    // Try matching by ID first, then by label
    const byId = this.topicService.getQuestions(topicId, subtopicId).length > 0;
    if (byId) return true;

    // Find the label for this subtopic ID
    const topic = this.topicService.getTopic(topicId);
    const sub = topic?.subtopics?.find(s => s.id === subtopicId);
    if (sub) {
      return this.topicService.getQuestions(topicId, sub.label).length > 0;
    }
    return false;
  }

  /** Get the subtopic identifier that matches exercises (could be ID or label) */
  getExerciseSubtopicKey(topicId: string, subtopicId: string): string {
    // If exercises use the ID directly
    if (this.topicService.getQuestions(topicId, subtopicId).length > 0) {
      return subtopicId;
    }
    // Otherwise use the label
    const topic = this.topicService.getTopic(topicId);
    const sub = topic?.subtopics?.find(s => s.id === subtopicId);
    return sub?.label ?? subtopicId;
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    // Auto-expand topics that match
    if (query.length >= 2) {
      const allTopics = this.topicService.topics();
      const match = allTopics.find(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.subtopics?.some(s => s.label.toLowerCase().includes(query.toLowerCase()))
      );
      if (match) {
        this.expandedTopic.set(match.id);
      }
    } else {
      this.expandedTopic.set(null);
    }
  }

  navigateToTopic(topicId: string): void {
    this.expandedTopic.set(topicId);
    this.closeSidebarOnMobile();
  }

  toggleTopic(topicId: string): void {
    this.expandedTopic.set(
      this.expandedTopic() === topicId ? null : topicId
    );
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth < 768) {
      this.sidebarOpen.set(false);
    }
  }

  toggleLocale(): void {
    const next: Locale = this.i18n.locale() === 'en' ? 'es' : 'en';
    this.i18n.setLocale(next);
    // Reload content for new locale
    this.topicService.loadAll();
  }
}

const TOPIC_PHASES: Record<string, string[]> = {
  mindset: ['Frame your answer', 'Reason under constraints', 'Perform and reflect'],
  rewe: ['Understand the role', 'Model the logistics domain', 'Prepare the conversation'],
  oop: ['Protect state and intent', 'Model variation'],
  solid: ['Separate responsibilities', 'Manage extension and substitution', 'Invert dependencies'],
  java: ['Language essentials', 'Flow and structure', 'Objects and standard APIs', 'Express intent safely', 'Modern concurrency'],
  'data-persistence': ['SQL fundamentals', 'JPA & Hibernate', 'Distributed data (DDIA)', 'Performance & production'],
  'software-architecture': ['Foundations & Modeling', 'Domain-Driven Design', 'Architectural Styles', 'Distributed Systems', 'Data Architecture', 'API & Integration', 'Evolution & Operations'],
  behavioral: ['Adapt and collaborate', 'Lead under pressure', 'Show motivation and judgement'],
  stories: ['Business impact', 'Technical decisions', 'Personal narrative'],
  portfolio: ['Product context', 'Architecture and delivery', 'Interview evidence'],
  spring: ['Build the application core', 'Expose and persist behaviour', 'Configure, test, and operate'],
  rest: ['HTTP fundamentals', 'Design for consumers', 'Evolve contracts safely'],
  security: ['Identity and authorization', 'Protect web and APIs', 'Protect data and operate controls'],
  kafka: ['Core messaging model', 'Design producers and consumers', 'Operate and evolve events'],
  concurrency: ['Execution foundations', 'Coordinate shared work', 'Compose and diagnose async flows'],
  patterns: ['Encapsulate variation', 'Compose behaviour', 'Choose by trade-off'],
  testing: ['Testing strategy', 'Unit and integration confidence', 'Production feedback'],
  docker: ['Package predictably', 'Configure and persist safely', 'Deliver and diagnose'],
  k8s: ['Run workloads', 'Expose and protect services', 'Scale and observe'],
  kotlin: ['Language foundations', 'Model data safely', 'Compose asynchronous behaviour'],
  angular: ['Build components and state', 'Connect data and forms', 'Navigate and secure journeys']
};

/** Explicit phase sizes for topics with uneven distribution */
const TOPIC_PHASE_SIZES: Record<string, number[]> = {
  'software-architecture': [7, 12, 3, 4, 3, 1, 2]  // Foundations(7), DDD(12), Styles(3), Distributed(4), Data(3), API(1), Evolution(2)
};
