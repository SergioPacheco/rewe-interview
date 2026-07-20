import { Injectable, signal, computed } from '@angular/core';
import { Topic, Question, TheoryChapter, TopicPriority, TopicGroup } from '../../models';

/**
 * Central data service — loads topics, questions, and theory.
 * In a real enterprise app, this would call HTTP endpoints.
 * Here we load from JSON files (pre-built data).
 */
@Injectable({ providedIn: 'root' })
export class TopicService {

  // === State ===
  readonly topics = signal<Topic[]>([]);
  readonly questions = signal<Question[]>([]);
  readonly theory = signal<TheoryChapter[]>([]);
  readonly loading = signal(true);

  // === Computed ===
  readonly criticalTopics = computed(() =>
    this.topics().filter(t => t.priority === 1)
  );

  readonly importantTopics = computed(() =>
    this.topics().filter(t => t.priority === 2)
  );

  readonly niceToHaveTopics = computed(() =>
    this.topics().filter(t => t.priority === 3)
  );

  readonly totalQuestions = computed(() => this.questions().length);
  readonly totalTheoryChapters = computed(() => this.theory().length);

  /** Load all data (called on app init) */
  async loadAll(): Promise<void> {
    this.loading.set(true);
    try {
      const [topicsData, questionsData, theoryData] = await Promise.all([
        this.loadJson<Topic[]>('data/topics/index.json'),
        this.loadAllQuestions(),
        this.loadAllTheory()
      ]);

      this.topics.set(topicsData);
      this.questions.set(questionsData);
      this.theory.set(theoryData);
    } catch (e) {
      console.error('[TopicService] Failed to load data:', e);
    } finally {
      this.loading.set(false);
    }
  }

  /** Get questions for a specific topic/subtopic */
  getQuestions(topicId: string, subtopicId?: string): Question[] {
    return this.questions().filter(q =>
      q.topic === topicId && (!subtopicId || q.subtopic === subtopicId)
    );
  }

  /** Get theory chapters for a specific topic */
  getTheory(topicId: string, subtopicId?: string): TheoryChapter[] {
    return this.theory().filter(t =>
      t.topic === topicId && (!subtopicId || t.subtopic === subtopicId)
    );
  }

  /** Get a single topic by ID */
  getTopic(topicId: string): Topic | undefined {
    return this.topics().find(t => t.id === topicId);
  }

  /** Get topics grouped by priority */
  getGrouped(): Record<TopicPriority, Topic[]> {
    return {
      0: this.topics().filter(t => t.priority === 0),
      1: this.criticalTopics(),
      2: this.importantTopics(),
      3: this.niceToHaveTopics()
    };
  }

  /** Get topics grouped by domain */
  getByGroup(group: TopicGroup): Topic[] {
    return this.topics().filter(t => t.group === group);
  }

  // === Private helpers ===

  private async loadJson<T>(path: string): Promise<T> {
    const url = new URL(path, document.baseURI).href;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
    return response.json();
  }

  private async loadAllQuestions(): Promise<Question[]> {
    const files = [
      'data/exercises/java-core.json',
      'data/exercises/java-modern.json',
      'data/exercises/oop.json',
      'data/exercises/solid.json',
      'data/exercises/spring-boot.json',
      'data/exercises/kafka.json',
      'data/exercises/sql.json',
      'data/exercises/rest.json',
      'data/exercises/concurrency.json',
      'data/exercises/design-patterns.json',
      'data/exercises/jpa.json',
      'data/exercises/behavioral.json',
      'data/exercises/system-design.json',
      'data/exercises/rewe.json',
      'data/exercises/security.json',
      'data/exercises/testing.json',
      'data/exercises/docker.json',
      'data/exercises/k8s.json',
      'data/exercises/kotlin.json',
      'data/exercises/angular.json',
      'data/exercises/stories.json',
      'data/exercises/mindset.json'
    ];

    const results = await Promise.allSettled(
      files.map(f => this.loadJson<Question[]>(f))
    );

    this.logRejected(results, files);

    const questions = results
      .filter((r): r is PromiseFulfilledResult<Question[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Normalize subtopic names to match index.json IDs
    return questions.map(q => ({
      ...q,
      subtopic: this.normalizeSubtopic(q.topic ?? '', q.subtopic ?? '')
    }));
  }

  /** Map free-form exercise subtopic names to index.json subtopic IDs */
  private normalizeSubtopic(topic: string, subtopic: string): string {
    const topicMap = SUBTOPIC_MAP[topic];
    if (!topicMap) return subtopic;
    return topicMap[subtopic] ?? subtopic;
  }

  private async loadAllTheory(): Promise<TheoryChapter[]> {
    const files = [
      'data/topics/theory-java-basics.json',
      'data/topics/theory-java-modern.json',
      'data/topics/theory-rewe.json',
      'data/topics/theory-portfolio.json',
      'data/topics/theory-spring-boot.json',
      'data/topics/theory-kafka.json',
      'data/topics/theory-rest.json',
      'data/topics/theory-sql.json',
      'data/topics/theory-solid.json',
      'data/topics/theory-concurrency.json',
      'data/topics/theory-patterns.json',
      'data/topics/theory-jpa.json',
      'data/topics/theory-docker.json',
      'data/topics/theory-kubernetes.json',
      'data/topics/theory-testing.json',
      'data/topics/theory-kotlin.json',
      'data/topics/theory-angular.json',
      'data/topics/theory-collections.json',
      'data/topics/theory-oop.json',
      'data/topics/theory-security.json',
      'data/topics/theory-system-design.json',
      'data/topics/theory-behavioral.json',
      'data/topics/theory-stories.json',
      'data/topics/theory-mindset.json'
    ];

    const results = await Promise.allSettled(
      files.map(f => this.loadJson<TheoryChapter[]>(f))
    );

    this.logRejected(results, files);

    return results
      .filter((r): r is PromiseFulfilledResult<TheoryChapter[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);
  }

  /** Log rejected file loads in development */
  private logRejected(results: PromiseSettledResult<unknown>[], files: string[]): void {
    const rejected = results
      .map((r, i) => r.status === 'rejected' ? files[i] : null)
      .filter(Boolean);

    if (rejected.length > 0) {
      console.error(
        `[TopicService] Failed to load ${rejected.length} content file(s):`,
        rejected
      );
    }
  }
}

/**
 * Maps free-form exercise subtopic names to index.json subtopic IDs.
 * Exercises were authored with descriptive names (e.g. "Thread Safety")
 * but the sidebar/routing uses short IDs (e.g. "conc-safety").
 */
const SUBTOPIC_MAP: Record<string, Record<string, string>> = {
  'angular': {
    'Change Detection': 'ng-basics',
    'Dependency Injection': 'ng-services',
    'RxJS': 'ng-rxjs',
    'Security': 'ng-routing',
    'Signals': 'ng-signals',
    'Signals vs RxJS': 'ng-signals',
    'Standalone Components': 'ng-basics',
  },
  'behavioral': {
    'Delivery': 'beh-pressure',
    'Honesty & Growth': 'beh-culture',
    'Leadership': 'beh-leadership',
    'Problem Solving': 'beh-adaptability',
  },
  'collections': {
    'Abstract classes': 'java-inheritance',
    'Access Modifiers': 'java-methods',
    'ArrayList': 'java-arrays',
    'ArrayList — remove': 'java-arrays',
    'Arrays': 'java-arrays',
    'Casting': 'java-inheritance',
    'Collections — Choosing': 'java-arrays',
    'Collections — HashMap': 'java-arrays',
    'Collections — HashMap Internals': 'java-arrays',
    'Collections — Immutability': 'java-arrays',
    'Collections — List': 'java-arrays',
    'Collections — Map': 'java-arrays',
    'Collections — Set': 'java-arrays',
    'Concurrency': 'java-api',
    'Constructors': 'java-methods',
    'Constructors — Default': 'java-methods',
    'Data Types': 'java-types',
    'Enhanced for': 'java-loops',
    'Equality': 'java-inheritance',
    'Exceptions': 'java-exceptions',
    'Exceptions — Catch Order': 'java-exceptions',
    'Exceptions — Checked vs Unchecked': 'java-exceptions',
    'Exceptions — Custom': 'java-exceptions',
    'Exceptions — try/catch/finally': 'java-exceptions',
    'Functional Interfaces': 'java-api',
    'Generics': 'java-api',
    'Generics — Wildcards': 'java-api',
    'Inheritance': 'java-inheritance',
    'Inheritance — Casting': 'java-inheritance',
    'Inheritance — Override': 'java-inheritance',
    'Inheritance — super': 'java-inheritance',
    'Interface': 'java-inheritance',
    'Interface — multiple': 'java-inheritance',
    'Java Basics': 'java-basics',
    'Lambda & Predicate': 'java-api',
    'Lambda — Functional Interface': 'java-api',
    'Lambda — Predicate': 'java-api',
    'Lambda — forEach': 'java-api',
    'Lambda — sort': 'java-api',
    'LocalDate Immutability': 'java-api',
    'LocalDateTime': 'java-api',
    'Loops': 'java-loops',
    'Loops — break': 'java-loops',
    'Loops — for-each': 'java-loops',
    'Loops — while': 'java-loops',
    'Memory Management': 'java-api',
    'Method Overloading': 'java-methods',
    'Methods & Encapsulation': 'java-methods',
    'Operators & Decisions': 'java-operators',
    'Optional': 'java-api',
    'Pass by Value': 'java-methods',
    'Pass by Value — reassignment': 'java-methods',
    'Primitives vs References': 'java-types',
    'Short-circuit': 'java-operators',
    'Static': 'java-methods',
    'Streams — Anti-patterns': 'java-api',
    'Streams — Collectors': 'java-api',
    'Streams — Pipeline': 'java-api',
    'Streams — filter': 'java-api',
    'Streams — map': 'java-api',
    'Streams — reduce': 'java-api',
    'String Immutability': 'java-types',
    'String Pool': 'java-types',
    'String, Date, Lambda': 'java-api',
    'StringBuilder': 'java-types',
    'Switch': 'java-operators',
    'Ternary': 'java-operators',
    'Variable Scope': 'java-methods',
    'Virtual Threads': 'java-api',
    'Wrapper Classes': 'java-types',
  },
  'concurrency': {
    'Async Patterns': 'conc-completable',
    'CompletableFuture': 'conc-completable',
    'Concurrent Access': 'conc-safety',
    'ConcurrentHashMap': 'conc-safety',
    'Deadlocks': 'conc-sync',
    'Executor Types': 'conc-threads',
    'Immutability': 'conc-safety',
    'Spring @Async': 'conc-completable',
    'Thread Pools': 'conc-threads',
    'Thread Safety': 'conc-safety',
    'Virtual Threads': 'conc-threads',
    'Volatile & Visibility': 'conc-jmm',
  },
  'docker': {
    'CI/CD Pipeline': 'docker-compose',
    'Containers': 'docker-basics',
    'Database Migrations': 'docker-compose',
    'Deployment Strategies': 'docker-compose',
    'Docker Compose': 'docker-compose',
    'Dockerfile': 'docker-basics',
    'Images': 'docker-basics',
    'Networking': 'docker-basics',
  },
  'jpa': {
    'Caching': 'jpa-queries',
    'Cascade & orphanRemoval': 'jpa-relations',
    'Entity Mapping': 'jpa-basics',
    'Fetch Types': 'jpa-basics',
    'Fetching Strategies': 'jpa-relations',
    'Inheritance Mapping': 'jpa-basics',
    'Migration': 'jpa-basics',
    'N+1 Problem': 'jpa-relations',
    'Performance': 'jpa-queries',
    'Persistence Context': 'jpa-basics',
    'Second-Level Cache': 'jpa-queries',
    'Spring Data Methods': 'jpa-queries',
    'Transactions': 'jpa-queries',
  },
  'k8s': {
    'ConfigMaps': 'k8s-pods',
    'Deployments': 'k8s-pods',
    'Health Checks': 'k8s-services',
    'Pods': 'k8s-pods',
    'Services': 'k8s-services',
  },
  'kafka': {
    'Architecture Patterns': 'kafka-architecture',
    'Consumer Group Rebalancing': 'kafka-consumers',
    'Consumer Groups': 'kafka-consumers',
    'Consumer Implementation': 'kafka-consumers',
    'Consumer Lag Monitoring': 'kafka-consumers',
    'Dead Letter Topic': 'kafka-delivery',
    'Error Handling': 'kafka-delivery',
    'Event Design': 'kafka-producer',
    'Event Granularity': 'kafka-producer',
    'Event Sourcing vs Event-Driven': 'kafka-comparison',
    'Exactly-Once': 'kafka-delivery',
    'Exactly-Once Semantics': 'kafka-delivery',
    'Idempotency': 'kafka-delivery',
    'JMS → Kafka': 'kafka-comparison',
    'Kafka Basics': 'kafka-fundamentals',
    'Kafka Concepts': 'kafka-fundamentals',
    'Kafka Connect': 'kafka-architecture',
    'Kafka Fundamentals': 'kafka-fundamentals',
    'Kafka Operations': 'kafka-comparison',
    'Kafka Transactions': 'kafka-delivery',
    'Kafka vs ActiveMQ': 'kafka-comparison',
    'Kafka vs Alternatives': 'kafka-comparison',
    'Messaging Experience': 'kafka-comparison',
    'Ordering': 'kafka-architecture',
    'Partitioning': 'kafka-architecture',
    'Partitioning Strategy': 'kafka-architecture',
    'Producer Configuration': 'kafka-producer',
    'Rebalancing': 'kafka-consumers',
    'Schema Evolution': 'kafka-architecture',
    'Spring Kafka': 'kafka-consumers',
    'Testing Kafka': 'kafka-delivery',
    'Topic Design': 'kafka-architecture',
    'When to use Kafka': 'kafka-fundamentals',
  },
  'oop': {
    'Abstraction': 'oop-abstraction',
    'Composition': 'oop-composition',
    'Encapsulation': 'oop-encapsulation',
    'Inheritance': 'oop-inheritance',
    'OOP Fundamentals': 'oop-encapsulation',
    'Polymorphism': 'oop-polymorphism',
  },
  'patterns': {
    'Adapter Pattern': 'pat-observer',
    'Anti-patterns': 'pat-strategy',
    'Builder': 'pat-builder',
    'Builder Pattern': 'pat-builder',
    'Builder vs Record': 'pat-builder',
    'CQRS light': 'pat-factory',
    'Chain of Responsibility': 'pat-observer',
    'Decorator Pattern': 'pat-observer',
    'Facade Pattern': 'pat-observer',
    'Factory': 'pat-factory',
    'Factory Pattern': 'pat-factory',
    'Observer Pattern': 'pat-observer',
    'Pattern Selection': 'pat-strategy',
    'Patterns Summary': 'pat-strategy',
    'Repository Pattern': 'pat-builder',
    'Singleton': 'pat-factory',
    'State Machine': 'pat-strategy',
    'Strategy': 'pat-strategy',
    'Strategy Pattern': 'pat-strategy',
    'Strategy with Spring DI': 'pat-strategy',
    'Template Method': 'pat-strategy',
  },
  'rest': {
    'API Design': 'rest-design',
    'API Design Anti-patterns': 'rest-design',
    'Async Operations': 'rest-design',
    'Content Negotiation': 'rest-design',
    'Documentation': 'rest-design',
    'Error Handling': 'rest-design',
    'GraphQL vs REST': 'rest-versioning',
    'HATEOAS': 'rest-design',
    'HTTP Verbs': 'rest-verbs',
    'Idempotency': 'rest-verbs',
    'Pagination': 'rest-design',
    'Rate Limiting': 'rest-design',
    'Security': 'rest-design',
    'Status Codes': 'rest-verbs',
    'Versioning': 'rest-versioning',
  },
  'rewe': {
    'Architecture': 'rewe-neo',
    'Business Problem': 'rewe-problem',
    'Domain Knowledge': 'rewe-trab',
    'Interview Strategy': 'rewe-job',
    'Modernization': 'rewe-neo',
    'NEO': 'rewe-neo',
    'Professional Introduction': 'rewe-job',
    'Resilience': 'rewe-connection',
    'System Design': 'rewe-neo',
    'TRAB Context': 'rewe-trab',
    'Users': 'rewe-trab',
  },
  'security': {
    'Access Control': 'security-api',
    'Audit & Compliance': 'security-data',
    'Authentication & Authorization': 'security-auth',
    'Data Protection': 'security-data',
    'Event Security': 'security-api',
    'Injection Prevention': 'security-web',
    'JWT & Tokens': 'security-auth',
    'OAuth2 & OIDC': 'security-auth',
    'OWASP Top 10': 'security-web',
    'Secret Management': 'security-data',
    'Service-to-Service Security': 'security-api',
    'Spring Security': 'security-spring',
    'Web Security': 'security-web',
  },
  'solid': {
    'SOLID': 'solid-srp',
    'SOLID Overview': 'solid-srp',
    'SOLID — DIP': 'solid-dip',
    'SOLID — ISP': 'solid-isp',
    'SOLID — LSP': 'solid-lsp',
    'SOLID — OCP': 'solid-ocp',
    'SOLID — SRP': 'solid-srp',
  },
  'spring': {
    'Actuator': 'spring-actuator',
    'Annotations': 'spring-di',
    'Anti-patterns': 'spring-config',
    'Async Processing': 'spring-testing',
    'Auto-configuration': 'spring-di',
    'Bean Scope': 'spring-di',
    'Bean Validation': 'spring-rest',
    'Best Practices': 'spring-config',
    'Configuration': 'spring-config',
    'Controller Design': 'spring-rest',
    'DI & Beans': 'spring-di',
    'Dependency Injection': 'spring-di',
    'Docker & Deployment': 'spring-config',
    'Error Handling': 'spring-rest',
    'Flyway Migrations': 'spring-data',
    'Java EE → Spring Boot': 'spring-di',
    'Logging & Observability': 'spring-config',
    'Messaging': 'spring-config',
    'Migration': 'spring-di',
    'Migration Risks': 'spring-di',
    'Performance & Caching': 'spring-config',
    'Production Config': 'spring-config',
    'Profiles & Configuration': 'spring-config',
    'REST': 'spring-rest',
    'REST Controller': 'spring-rest',
    'Reactive vs Servlet': 'spring-config',
    'Request Lifecycle': 'spring-di',
    'Security': 'spring-config',
    'Spring Boot': 'spring-di',
    'Spring Boot Auto-configuration': 'spring-di',
    'Spring Data': 'spring-data',
    'Spring Data Queries': 'spring-data',
    'Spring Fundamentals': 'spring-di',
    'Testcontainers': 'spring-testing',
    'Testing': 'spring-testing',
    'Testing Strategy': 'spring-testing',
    'Testing with MockMvc': 'spring-testing',
    'Transaction Propagation': 'spring-transactions',
    'Transaction Proxy': 'spring-transactions',
    'Transactions': 'spring-transactions',
  },
  'sql': {
    'Batch Operations': 'sql-performance',
    'CTEs': 'sql-joins',
    'Concurrency Control': 'sql-transactions',
    'Connection Pool': 'sql-transactions',
    'Database Anti-patterns': 'sql-performance',
    'Deadlocks': 'sql-transactions',
    'EXISTS vs IN': 'sql-joins',
    'EXPLAIN ANALYZE': 'sql-indexes',
    'GROUP BY': 'sql-joins',
    'Index Strategy': 'sql-indexes',
    'Index Types': 'sql-indexes',
    'Indexes': 'sql-indexes',
    'JOIN behavior': 'sql-joins',
    'Locking': 'sql-transactions',
    'N+1 Problem': 'sql-performance',
    'NULL behavior': 'sql-joins',
    'Optimistic Locking': 'sql-transactions',
    'Pagination': 'sql-performance',
    'Partitioning': 'sql-performance',
    'Performance Investigation': 'sql-performance',
    'Query Optimization': 'sql-performance',
    'Query Patterns for JPA': 'sql-performance',
    'Read Replicas': 'sql-performance',
    'Transaction Isolation': 'sql-transactions',
    'Window Functions': 'sql-joins',
  },
  'system-design': {
    'API Design': 'sd-ops',
    'Aggregates': 'sd-data',
    'Anti-Corruption Layer': 'sd-data',
    'Architecture': 'sd-scaling',
    'Bounded Contexts': 'sd-data',
    'Business Monitoring': 'sd-ops',
    'Caching Strategy': 'sd-scaling',
    'Catalogue Design': 'sd-data',
    'Checkout Design': 'sd-scaling',
    'Consistency': 'sd-data',
    'Data Consistency': 'sd-data',
    'Data Modeling': 'sd-data',
    'Database Design': 'sd-data',
    'Deployment & Zero Downtime': 'sd-ops',
    'Design Approach': 'sd-scaling',
    'Event Ordering': 'sd-events',
    'Event Processing': 'sd-events',
    'Event-Driven': 'sd-events',
    'Event-Driven Architecture': 'sd-events',
    'Failure Handling': 'sd-ops',
    'Idempotency': 'sd-events',
    'Idempotency in Event Processing': 'sd-events',
    'Integration': 'sd-scaling',
    'Metrics': 'sd-ops',
    'Observability': 'sd-ops',
    'Offline Operations': 'sd-ops',
    'Overall Architecture': 'sd-scaling',
    'Rate Limiting & Back-pressure': 'sd-scaling',
    'Real-time Delivery Tracking': 'sd-scaling',
    'Resilience': 'sd-ops',
    'SLO & SRE': 'sd-ops',
    'Scalability': 'sd-scaling',
    'Scaling Strategy': 'sd-scaling',
    'Service Communication': 'sd-data',
    'Transaction Boundaries': 'sd-events',
  },
  'testing': {
    'Flaky Tests': 'test-integration',
    'Integration Tests': 'test-integration',
    'JUnit 5': 'test-junit',
    'Kafka Testing': 'test-integration',
    'Mockito': 'test-junit',
    'TDD': 'test-pyramid',
    'Test Strategies': 'test-pyramid',
    'Testcontainers': 'test-integration',
  },
};
