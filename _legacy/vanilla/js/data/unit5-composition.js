/**
 * Unit 5 — Composition over Inheritance (12 exercises)
 * Contextualized for REWE Digital Spain — Transport Logistics (TRAB team)
 */
const compositionExercises = [

  // 1. ORAL_ANSWER — Why composition over inheritance?
  {
    id: 'comp-oral-01',
    type: 'ORAL_ANSWER',
    subtopic: 'Composition',
    difficulty: 'SENIOR',
    question: 'Why would you prefer composition over inheritance?',
    interviewerIntent: 'Assess whether the candidate understands coupling trade-offs and can justify design choices in a service-oriented architecture.',
    shortAnswer: 'Composition assembles behavior from independent components injected as dependencies. It avoids tight coupling of inheritance, allows replacing implementations independently, and makes each component testable in isolation. In Spring Boot, constructor injection makes this natural.',
    modelAnswer: `Context: In enterprise systems, business services typically need validation, persistence, event publishing and notification capabilities.

Problem: An earlier design used a BaseBusinessService with protected fields for EntityManager, NotificationService and AuditService. Every service extended this base class. Changes to the base affected all 40+ subclasses. Testing required complex setup because of inherited dependencies.

Decision: I refactored services to receive dependencies through injection instead of inheriting them. Each service declared only what it actually needed. In Spring Boot, this maps naturally to constructor injection — each @Service receives only its real collaborators.

Result: Services became focused. Unit testing became straightforward — mock only what you need. New capabilities could be added without modifying a base class.

Trade-off: More classes and constructor parameters. The flow passes through more objects. But explicitness is a feature in team codebases — any developer can see exactly what a service depends on by reading its constructor.`,
    senaiExample: 'SGN3 Business layer injects Repository, Validator and JMS dependencies via CDI rather than inheriting from a base class. Each Business is composed of exactly the components it needs.',
    reweExample: 'A DeliveryPlanningService composes DeliveryRepository, RouteValidator, LogisticsEventPublisher and DriverNotificationService — each independently injectable, testable and replaceable.',
    keyPoints: ['Inheritance creates tight coupling between base and subclasses', 'Composition allows independent replacement of components', 'Constructor injection makes dependencies explicit', 'Each component is testable in isolation', 'Inheritance is not always wrong — valid for stable is-a relationships'],
    mistakesToAvoid: ['Saying inheritance is always bad', 'Confusing composition with simply having fields', 'Not mentioning valid use cases for inheritance', 'Not connecting to Spring Boot constructor injection'],
    followUps: [
      { question: 'Is dependency injection the same as composition?', answerHint: 'DI is a mechanism to PROVIDE dependencies. Composition is a design principle — assembling behavior from parts. DI enables composition but they are different concepts.' },
      { question: 'How would you avoid a service with too many dependencies?', answerHint: 'If constructor has 7+ params, the service probably has too many responsibilities. Extract a sub-orchestrator or split into focused services.' },
      { question: 'Why constructor injection over field injection?', answerHint: 'Immutable (final fields), clear dependencies visible in constructor, works without reflection, and fails fast at startup if dependency missing.' }
    ],
    vocabulary: [
      { term: 'delegation', meaning: 'delegar trabalho para outro objeto em vez de herdar capacidade', example: 'The service delegates validation to a composed RouteValidator rather than inheriting validation logic.' },
      { term: 'constructor injection', meaning: 'dependências fornecidas via construtor, tornando-as explícitas e imutáveis', example: 'Spring Boot favors constructor injection — dependencies declared as final fields, provided at instantiation.' },
      { term: 'independently replaceable', meaning: 'componente que pode ser trocado sem afetar outros', example: 'Swapping KafkaEventPublisher for an InMemoryPublisher in tests requires zero changes to the business service.' }
    ],
    selfEvaluation: [
      { criterion: 'I explained the problem inheritance caused', weight: 3 },
      { criterion: 'I showed how composition solved it', weight: 3 },
      { criterion: 'I connected to Spring Boot constructor injection', weight: 2 },
      { criterion: 'I acknowledged valid uses of inheritance', weight: 2 }
    ]
  },

  // 2. ORAL_ANSWER — How does DI support composition?
  {
    id: 'comp-oral-02',
    type: 'ORAL_ANSWER',
    subtopic: 'Composition',
    difficulty: 'INTERMEDIATE',
    question: 'How does dependency injection support composition?',
    interviewerIntent: 'Verify the candidate understands the relationship between DI as mechanism and composition as design principle.',
    shortAnswer: 'Dependency injection provides the collaborators that a composed service needs. Without DI, you would instantiate dependencies manually. With DI (CDI or Spring), the container assembles the object graph — each service receives exactly the components it needs.',
    modelAnswer: `Context: Composition means assembling behavior from independent parts. But those parts need to be provided somehow.

Problem: Without DI, a DeliveryPlanningService would need to instantiate its own DeliveryRepository, RouteValidator, EventPublisher. This couples it to concrete implementations and makes testing impossible without real infrastructure.

Decision: DI (whether CDI in Java EE or Spring in Spring Boot) provides the implementations. The service declares what it needs via constructor parameters. The container resolves and provides them at runtime.

Result: The service is composed of abstractions. In tests, you provide mocks. In production, Spring provides real implementations. The service itself never changes.

Connection to REWE stack: In Spring Boot, constructor injection is the standard. Kotlin makes it even more concise with primary constructors. CDI @Inject in my current environment serves the same purpose — the principle transfers directly.`,
    senaiExample: 'CDI @Inject in SGN3 provides Repository and Business dependencies. The service never creates its own collaborators — the container assembles them.',
    reweExample: 'Spring Boot auto-wires DeliveryRepository (Spring Data), KafkaLogisticsEventPublisher (@Component), DriverNotificationService (@Service) into the planning service via constructor.',
    keyPoints: ['DI is the mechanism, composition is the design', 'Constructor declares what the service needs', 'Container provides implementations', 'Tests provide mocks', 'Same principle in CDI and Spring'],
    mistakesToAvoid: ['Confusing DI with composition', 'Not mentioning testability', 'Not connecting CDI experience to Spring'],
    followUps: [
      { question: 'What is the difference between DI and DIP?', answerHint: 'DI = technique (how dependencies are provided). DIP = principle (high-level depends on abstraction, not concrete). DI enables DIP.' },
      { question: 'Can you have composition without DI?', answerHint: 'Yes — manual instantiation in main() or factory. But DI makes it declarative and container-managed. Without DI, you wire everything by hand.' }
    ],
    vocabulary: [
      { term: 'object graph', meaning: 'rede de objetos conectados por dependências', example: 'The DI container builds the entire object graph at startup — connecting services to repositories to publishers.' },
      { term: 'wiring', meaning: 'conectar dependências a quem precisa delas', example: 'Spring handles wiring — it finds the right implementation for each interface and injects it.' }
    ],
    selfEvaluation: [
      { criterion: 'I distinguished DI (mechanism) from composition (design)', weight: 3 },
      { criterion: 'I explained how testing benefits', weight: 3 },
      { criterion: 'I connected CDI experience to Spring', weight: 2 },
      { criterion: 'I mentioned constructor injection specifically', weight: 2 }
    ]
  },

  // 3. CODE_REFACTOR — Base service to composed service
  {
    id: 'comp-refactor-01',
    type: 'CODE_REFACTOR',
    subtopic: 'Composition',
    difficulty: 'INTERMEDIATE',
    mission: 'Refactor this <strong>inherited base service</strong> pattern to Spring Boot composition.',
    code: `public abstract class BaseLogisticsService {
    @Autowired protected DeliveryRepository deliveryRepo;
    @Autowired protected KafkaTemplate<String, Object> kafka;
    @Autowired protected NotificationService notifier;
    @Autowired protected MetricsService metrics;
    @Autowired protected AuditLogger audit;

    protected void publishEvent(String topic, Object event) {
        kafka.send(topic, event);
        metrics.increment("events.published");
    }
    protected void logAudit(String action) { audit.log(action); }
}

@Service
public class DeliveryService extends BaseLogisticsService {
    public void planDelivery(DeliveryRequest req) {
        Delivery d = Delivery.from(req);
        deliveryRepo.save(d);
        publishEvent("delivery-planned", d);
        notifier.notifyDriver(d);
    }
}`,
    problemsToIdentify: [
      'Field injection (@Autowired on fields) — harder to test, no immutability',
      'All services inherit 5 dependencies even if they use only 2',
      'Protected state exposes internals to all subclasses',
      'Base class becomes a God object attracting utilities',
      'Cannot easily test DeliveryService without all 5 dependencies'
    ],
    refactoredCode: `@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepo;
    private final LogisticsEventPublisher eventPublisher;
    private final DriverNotificationService notifier;

    public DeliveryService(
            DeliveryRepository deliveryRepo,
            LogisticsEventPublisher eventPublisher,
            DriverNotificationService notifier) {
        this.deliveryRepo = deliveryRepo;
        this.eventPublisher = eventPublisher;
        this.notifier = notifier;
    }

    public void planDelivery(DeliveryRequest req) {
        Delivery d = Delivery.from(req);
        deliveryRepo.save(d);
        eventPublisher.publishDeliveryPlanned(d);
        notifier.notifyDriver(d);
    }
}`,
    explain: 'Constructor injection makes dependencies explicit and final. The service declares ONLY what it needs. No base class. Testing requires mocking only 3 things. The LogisticsEventPublisher hides Kafka details behind an abstraction.'
  },

  // 4. CODE_REFACTOR — Monolithic handler to composed pipeline
  {
    id: 'comp-refactor-02',
    type: 'CODE_REFACTOR',
    subtopic: 'Composition',
    difficulty: 'SENIOR',
    mission: 'This <strong>monolithic delivery handler</strong> does everything. Decompose into composed components.',
    code: `@Service
public class DeliveryHandler {
    public DeliveryResult process(DeliveryRequest req) {
        // Validate route
        if (req.getStops().isEmpty()) throw new ValidationException("No stops");
        if (req.getDistance() > 500) throw new ValidationException("Too far");

        // Calculate pricing
        BigDecimal price = req.getWeight().multiply(RATE_PER_KG);
        if (req.isExpress()) price = price.multiply(EXPRESS_MULTIPLIER);

        // Persist
        Delivery d = new Delivery(req, price);
        entityManager.persist(d);

        // Publish event to Kafka
        kafkaTemplate.send("deliveries", d.getId().toString(), new DeliveryEvent(d));

        // Notify driver
        pushService.send(req.getDriverId(), "New delivery assigned");

        // Update analytics
        analyticsClient.track("delivery_created", Map.of("type", req.getType()));

        return new DeliveryResult(d.getId(), price);
    }
}`,
    problemsToIdentify: [
      'Six responsibilities in one method (validation, pricing, persistence, events, notification, analytics)',
      'Each responsibility changes for different reasons',
      'Cannot test pricing without persistence and Kafka',
      'Adding new notification channels requires modifying this class',
      'Kafka details leaked into business logic'
    ],
    refactoredCode: `// Each responsibility in its own focused component:
@Component public class RouteValidator { void validate(DeliveryRequest req) {...} }
@Component public class DeliveryPricingCalculator { BigDecimal calculate(DeliveryRequest req) {...} }
@Repository public class DeliveryRepository { Delivery save(Delivery d) {...} }
@Component public class LogisticsEventPublisher { void publishDeliveryCreated(Delivery d) {...} }
@Component public class DriverNotifier { void notifyNewDelivery(Delivery d) {...} }
@Component public class DeliveryAnalytics { void trackCreated(Delivery d) {...} }

// Orchestrator — thin, delegates everything:
@Service
public class DeliveryHandler {
    private final RouteValidator validator;
    private final DeliveryPricingCalculator pricing;
    private final DeliveryRepository repository;
    private final LogisticsEventPublisher events;
    private final DriverNotifier notifier;
    private final DeliveryAnalytics analytics;

    // constructor injection...

    public DeliveryResult process(DeliveryRequest req) {
        validator.validate(req);
        BigDecimal price = pricing.calculate(req);
        Delivery d = repository.save(Delivery.create(req, price));
        events.publishDeliveryCreated(d);
        notifier.notifyNewDelivery(d);
        analytics.trackCreated(d);
        return new DeliveryResult(d.getId(), price);
    }
}`,
    explain: 'The orchestrator is now 6 lines of delegation. Each component is independently testable, replaceable and maintainable. Pricing rules change? Only DeliveryPricingCalculator changes. New notification channel? Only DriverNotifier changes.'
  },

  // 5. DESIGN_DECISION — Service with too many dependencies
  {
    id: 'comp-design-01',
    type: 'DESIGN_DECISION',
    subtopic: 'Composition',
    difficulty: 'SENIOR',
    mission: 'Your service has <strong>8 constructor parameters</strong>. What do you do?',
    options: [
      { id: 'a', label: 'Keep all 8 — each is needed', desc: 'The service genuinely needs all these collaborators for its flow.' },
      { id: 'b', label: 'Extract a sub-orchestrator', desc: 'Group related dependencies into a focused sub-service (e.g., DeliveryNotificationOrchestrator wraps notifier + analytics + event publisher).' },
      { id: 'c', label: 'Use a parameter object / facade', desc: 'Create DeliveryDependencies class holding all 8 and inject that single object.' }
    ],
    bestChoice: 'b',
    explanation: {
      a: { pros: ['Honest — dependencies are real', 'Explicit'], cons: ['8 params = signal the class does too much', 'Hard to read constructor', 'Testing requires 8 mocks'], verdict: 'If genuinely needed and the service is still cohesive, acceptable temporarily. But usually signals SRP violation.' },
      b: { pros: ['Reduces visible complexity', 'Groups related concerns', 'Sub-orchestrator independently testable', 'Main service reads cleaner'], cons: ['One more class', 'Must group correctly (related, not arbitrary)'], verdict: 'Best approach — extract a cohesive sub-group. E.g., event+notification+analytics = "post-action side effects" orchestrator.' },
      c: { pros: ['Fewer constructor params visually'], cons: ['Hides the problem — still 8 real dependencies', 'Bag of unrelated objects', 'Does not reduce complexity, just relocates it'], verdict: 'Anti-pattern. A "dependencies bag" class is just hiding complexity without solving it.' }
    },
    nuance: '8 dependencies usually means the service has multiple responsibilities. Before grouping, ask: can this service be split into two services with distinct purposes? If not, group related dependencies into a focused collaborator.'
  },

  // 6. DESIGN_DECISION — Transactional outbox vs direct publish
  {
    id: 'comp-design-02',
    type: 'DESIGN_DECISION',
    subtopic: 'Composition',
    difficulty: 'SENIOR',
    mission: 'DeliveryService saves to DB then publishes to Kafka. <strong>What if save succeeds but publish fails?</strong>',
    options: [
      { id: 'a', label: 'Accept inconsistency — log and retry later', desc: 'Save to DB, try to publish. If publish fails, log error and rely on a reconciliation job.' },
      { id: 'b', label: 'Transactional outbox pattern', desc: 'Save delivery + outbox event in same DB transaction. Separate publisher reads outbox and sends to Kafka.' },
      { id: 'c', label: 'Kafka transaction spanning DB', desc: 'Use distributed transaction (XA) to commit DB and Kafka atomically.' }
    ],
    bestChoice: 'b',
    explanation: {
      a: { pros: ['Simple implementation', 'Works most of the time'], cons: ['Window of inconsistency', 'Reconciliation job adds complexity', 'Events can be lost if pod crashes between save and publish'], verdict: 'Acceptable for non-critical events (analytics). Risky for business-critical flows (driver assignment).' },
      b: { pros: ['Atomic local transaction (DB only)', 'Event guaranteed to be published eventually', 'No distributed transaction needed', 'Idempotent publisher handles duplicates'], cons: ['Extra table and publisher component', 'Slight delay in event delivery', 'Must handle idempotency on consumer side'], verdict: 'Industry standard for reliable event publishing. Used extensively in logistics and financial systems.' },
      c: { pros: ['True atomicity'], cons: ['XA transactions are slow and brittle', 'Kafka XA support has limitations', 'Operational complexity is very high', 'Not recommended by Kafka community'], verdict: 'Almost never the right choice. Distributed transactions create more problems than they solve in microservices.' }
    },
    nuance: 'The transactional outbox is the standard pattern at companies like REWE for reliable event-driven systems. My JMS experience at SENAI included similar patterns — ensuring database state and message publication remain consistent without distributed transactions.'
  },

  // 7. COMPARE_CONCEPTS — Inheritance vs Composition
  {
    id: 'comp-compare-01',
    type: 'COMPARE_CONCEPTS',
    subtopic: 'Composition',
    difficulty: 'INTERMEDIATE',
    mission: 'Compare: <strong>Inheritance</strong> vs <strong>Composition</strong> for code reuse',
    conceptA: { name: 'Inheritance', definition: 'Subclass acquires behavior from parent. Compile-time rigid hierarchy. Strong coupling. Single inheritance in Java.' },
    conceptB: { name: 'Composition', definition: 'Class contains references to collaborators and delegates behavior. Runtime-flexible. Loose coupling. Multiple components possible.' },
    keyDifference: 'Inheritance = "I am a (type of)". Composition = "I have a (capability from)". Inheritance couples to one hierarchy; composition assembles from many independent parts.',
    javaExample: 'Inheritance: DeliveryService extends BaseLogisticsService (gets everything). Composition: DeliveryService injects only RouteValidator and EventPublisher (gets exactly what it needs).',
    interviewAnswer: 'I prefer composition because dependencies are explicit, components are independently replaceable, and testing requires mocking only real collaborators. I use inheritance only for stable is-a relationships — like exception hierarchies or JPA MappedSuperclass for audit fields.'
  },

  // 8. FOLLOW_UP — Deep dive on composition in Spring Boot
  {
    id: 'comp-followup-01',
    type: 'FOLLOW_UP',
    subtopic: 'Composition',
    difficulty: 'SENIOR',
    scenario: 'The interviewer probes how composition works in Spring Boot vs your Java EE experience.',
    questions: [
      { q: 'How does Spring Boot handle composition differently from CDI?', hint: 'Spring: constructor injection by default, auto-configuration, @ConditionalOnMissingBean. CDI: @Inject, @Alternative, @Priority. Same principle, different conventions.' },
      { q: 'What happens if the Kafka publisher fails — does the save roll back?', hint: 'With composition + outbox pattern: no. Save and outbox entry in same TX. Publisher is separate. With direct publish: depends on TX boundary design.' },
      { q: 'How many dependencies is too many?', hint: '5-6 is normal for an orchestrator. 8+ is a smell. Ask: does this class have one clear purpose? If not, split.' },
      { q: 'How do you decide what to extract into its own component?', hint: 'When it has its own reason to change, its own dependencies, can be tested independently, or is reused elsewhere.' },
      { q: 'Can composition lead to over-fragmentation?', hint: 'Yes. 50 tiny classes with 1 method each is worse than a few cohesive services. The goal is cohesive components, not maximum granularity.' }
    ]
  },

  // 9. REAL_EXPERIENCE — Composition in your systems
  {
    id: 'comp-experience-01',
    type: 'REAL_EXPERIENCE',
    subtopic: 'Composition',
    difficulty: 'SENIOR',
    prompt: 'Describe a service from your experience that demonstrates composition. What components does it depend on and why are they separate?',
    guidingQuestions: [
      'What is the service\'s main responsibility?',
      'What components does it delegate to (repository, validator, notifier, publisher)?',
      'Why are they separate classes instead of inline logic?',
      'How does this help testing?',
      'How would this translate to Spring Boot?'
    ],
    exampleStory: `The EnrollmentBusiness in SGN3 composes: EnrollmentValidator (checks business rules), EnrollmentRepository (persistence), NotificationService (email/JMS), and AuditService (logging). Each is injected via CDI. Testing the enrollment flow mocks only the repository and notifier — no real database or email server needed. In Spring Boot + REWE context, this maps to: RouteValidator, DeliveryRepository (Spring Data), LogisticsEventPublisher (Kafka), DriverNotificationService. Same architecture, different frameworks.`,
    buildingBlocks: ['Service name and purpose', 'List of composed dependencies', 'Why each is separate', 'How testing benefits', 'Spring Boot equivalent']
  },

  // 10. PREDICT_OUTPUT — Constructor injection behavior
  {
    id: 'comp-predict-01',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Composition',
    difficulty: 'BASIC',
    mission: 'Spring Boot starts. What happens if <strong>RouteValidator bean is missing</strong>?',
    code: `@Service
public class DeliveryService {
    private final RouteValidator validator; // No bean found!

    public DeliveryService(RouteValidator validator) {
        this.validator = validator;
    }
}
// No @Component class implements or provides RouteValidator`,
    choices: ['Application starts normally', 'UnsatisfiedDependencyException at startup', 'NullPointerException at first use', 'Silently injects null'],
    answer: 'UnsatisfiedDependencyException at startup',
    explain: 'Spring Boot fails FAST at startup if a required dependency cannot be resolved. This is a feature of constructor injection — problems are detected immediately, not at runtime when the method is first called. Field injection with @Autowired(required=false) would inject null and fail later.'
  },

  // 11. FILL_BLANK — Spring Boot composition pattern
  {
    id: 'comp-fill-01',
    type: 'FILL_BLANK',
    subtopic: 'Composition',
    difficulty: 'BASIC',
    mission: 'Complete the Spring Boot service using <strong>constructor injection</strong> for composition.',
    code: '@Service\npublic class DeliveryService {\n    private final DeliveryRepository repo;\n    private final EventPublisher events;\n\n    public DeliveryService(DeliveryRepository repo, _____ events) {\n        this.repo = repo;\n        this.events = events;\n    }\n}',
    blank: '_____',
    choices: ['EventPublisher', '@Autowired', 'new EventPublisher()', 'final'],
    answer: 'EventPublisher',
    explain: 'In Spring Boot, if a class has one constructor, Spring auto-injects all parameters. No @Autowired needed. The parameter type (EventPublisher) tells Spring what to inject. This is composition — the service is composed from its declared dependencies.'
  },

  // 12. PICK_INVALID — Identify anti-composition pattern
  {
    id: 'comp-pick-01',
    type: 'PICK_INVALID',
    subtopic: 'Composition',
    difficulty: 'INTERMEDIATE',
    mission: 'Which example shows a <strong>composition anti-pattern</strong>?',
    snippets: [
      { id: 'a', code: '@Service\nclass DeliveryService {\n  private final RouteValidator validator;\n  private final DeliveryRepo repo;\n  DeliveryService(RouteValidator v, DeliveryRepo r)\n  { this.validator=v; this.repo=r; }\n}', valid: true },
      { id: 'b', code: '@Service\nclass DeliveryService {\n  @Autowired RouteValidator validator;\n  @Autowired DeliveryRepo repo;\n  @Autowired EventPublisher events;\n  @Autowired NotifService notif;\n  @Autowired Analytics analytics;\n  @Autowired Cache cache;\n  @Autowired Metrics metrics;\n  @Autowired AuditLog audit;\n}', valid: false },
      { id: 'c', code: '@Service\nclass DeliveryOrchestrator {\n  private final DeliveryService delivery;\n  private final PostActionHandler postActions;\n  DeliveryOrchestrator(DeliveryService d, PostActionHandler p)\n  { ... }\n}', valid: true }
    ],
    answer: 'b',
    explain: 'Option B has 8 field-injected dependencies — a God class smell. Field injection hides dependencies (not visible without reading all fields), prevents immutability, and the class clearly has too many responsibilities. Option C shows proper decomposition — grouping related concerns into a sub-orchestrator.'
  }
];
