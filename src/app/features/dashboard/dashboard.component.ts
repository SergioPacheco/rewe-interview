import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressService } from '../../core/services/progress.service';
import { TopicService } from '../../core/services/topic.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  protected progressService = inject(ProgressService);
  protected topicService = inject(TopicService);

  allTopics = computed(() => this.topicService.topics());

  /** Technology logo URLs (CDN-hosted SVGs/PNGs) */
  private readonly logos: Record<string, string> = {
    'rewe': '/assets/rewe-logo.svg',
    'portfolio': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    'oop': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original-wordmark.svg',
    'solid': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-plain.svg',
    'collections': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    'sql': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    'system-design': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg',
    'behavioral': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg',
    'spring': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg',
    'rest': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/openapi/openapi-original.svg',
    'kafka': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg',
    'jpa': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/hibernate/hibernate-original.svg',
    'concurrency': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    'patterns': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unifiedmodelinglanguage/unifiedmodelinglanguage-original.svg',
    'testing': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/junit/junit-original.svg',
    'docker': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    'k8s': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-original.svg',
    'kotlin': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
    'angular': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
  };

  getImageUrl(topicId: string): string {
    return this.logos[topicId] ?? 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg';
  }

  getMastery(topicId: string): number {
    return this.progressService.getTopicProgress(topicId)?.mastery ?? 0;
  }

  getExerciseCount(topicId: string): number {
    return this.topicService.getQuestions(topicId).length;
  }

  getTheoryCount(topicId: string): number {
    return this.topicService.getTheory(topicId).length;
  }
}
