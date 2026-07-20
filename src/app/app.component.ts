import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { TopicService } from './core/services/topic.service';
import { ProgressService } from './core/services/progress.service';
import { Topic, TopicGroup } from './models';

interface Breadcrumb {
  label: string;
  url: string | null;
}

interface SidebarGroup {
  group: TopicGroup;
  label: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private topicService = inject(TopicService);
  private router = inject(Router);
  protected progressService = inject(ProgressService);

  sidebarOpen = signal(false);
  expandedTopic = signal<string | null>(null);
  searchQuery = signal('');
  breadcrumbs = signal<Breadcrumb[]>([]);

  readonly domainGroups: SidebarGroup[] = [
    { group: 'interview', label: 'INTERVIEW' },
    { group: 'backend', label: 'BACKEND' },
    { group: 'distributed', label: 'DISTRIBUTED SYSTEMS' },
    { group: 'frontend', label: 'FRONTEND' },
    { group: 'quality', label: 'QUALITY & OPS' },
    { group: 'more', label: 'MORE' }
  ];

  async ngOnInit(): Promise<void> {
    await this.topicService.loadAll();

    // Build breadcrumbs on navigation
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.updateBreadcrumbs());
    this.updateBreadcrumbs();
  }

  private updateBreadcrumbs(): void {
    const url = this.router.url;
    const crumbs: Breadcrumb[] = [{ label: '🏠 Home', url: '/' }];

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
      crumbs.push({ label: 'Quiz', url: null });
    } else if (parts[0] === 'resume') {
      crumbs.push({ label: 'Resume', url: null });
    }

    this.breadcrumbs.set(crumbs);
  }

  getTopicsByGroup(group: TopicGroup): Topic[] {
    const query = this.searchQuery().toLowerCase();
    const topics = this.topicService.getByGroup(group);
    if (!query) return topics;
    return topics.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.subtopics?.some(s => s.label.toLowerCase().includes(query))
    );
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
}
