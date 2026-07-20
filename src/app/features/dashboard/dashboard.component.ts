import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressService } from '../../core/services/progress.service';
import { TopicService } from '../../core/services/topic.service';
import { Topic } from '../../models';

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

  // Section definitions — which topics go in which section
  private readonly learnIds = [
    'oop', 'solid', 'collections', 'java-modern', 'sql', 'spring',
    'rest', 'security', 'jpa', 'concurrency', 'patterns', 'testing',
    'docker', 'k8s', 'kotlin', 'angular', 'kafka'
  ];

  private readonly interviewIds = ['system-design', 'behavioral', 'mindset'];
  private readonly experienceIds = ['stories', 'portfolio'];
  private readonly reweIds = ['rewe'];

  // Computed signals for each section
  readonly learnTopics = computed(() =>
    this.topicService.topics().filter(t => this.learnIds.includes(t.id))
  );

  readonly practiceTopics = computed(() =>
    this.topicService.topics().filter(t =>
      this.learnIds.includes(t.id) && this.topicService.getQuestions(t.id).length > 0
    )
  );

  readonly interviewTopics = computed(() =>
    this.topicService.topics().filter(t => this.interviewIds.includes(t.id))
  );

  readonly experienceTopics = computed(() =>
    this.topicService.topics().filter(t => this.experienceIds.includes(t.id))
  );

  readonly reweTopics = computed(() =>
    this.topicService.topics().filter(t => this.reweIds.includes(t.id))
  );

  /** Technology logo URLs */
  private readonly logos: Record<string, string> = {
    'rewe': 'assets/rewe-logo.svg',
    'mindset': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/thealgorithms/thealgorithms-original.svg',
    'stories': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg',
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
    'java-modern': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
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
