import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TopicService } from './core/services/topic.service';
import { ProgressService } from './core/services/progress.service';
import { Topic } from './models';

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

  readonly priorityGroups = [
    { priority: 0 as const, label: '' },
    { priority: 1 as const, label: '⚡ Critical' },
    { priority: 2 as const, label: '📘 Important' },
    { priority: 3 as const, label: '📎 Nice to Have' }
  ];

  async ngOnInit(): Promise<void> {
    await this.topicService.loadAll();
  }

  getTopicsByPriority(priority: 0 | 1 | 2 | 3): Topic[] {
    const query = this.searchQuery().toLowerCase();
    const topics = this.topicService.getGrouped()[priority] || [];
    if (!query) return topics;
    return topics.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.subtopics?.some(s => s.label.toLowerCase().includes(query))
    );
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
