/**
 * Unit 2 — Abstraction (10 exercises)
 */
const abstractionExercises = [

  // 1. ORAL_ANSWER — What is abstraction in a real application?
  {
    id: 'abstract-oral-01',
    type: 'ORAL_ANSWER',
    subtopic: 'Abstraction',
    difficulty: 'SENIOR',
    question: 'What is abstraction in a real application?',
    interviewerIntent: 'Assess whether the candidate sees abstraction as hiding implementation details behind contracts, not just using interfaces everywhere.',
    shortAnswer: 'Abstraction allows business logic to depend on a contract instead of implementation details. A service uses a Repository interface without knowing if data comes from JPA, an external API, or an in-memory map for testing.',
    modelAnswer: `Context: In our enterprise system, business services needed to persist enrollments, send notifications and call external systems.

Problem: If the enrollment service directly instantiated EntityManager, changing the persistence strategy (e.g., moving to a different DB or adding caching) required modifying business code. Testing required a real database.

Decision: I introduced a Repository interface that defined what operations were available (findById, save, findByStatus) without revealing how they were implemented. The business layer depended only on this contract.

Result: Unit tests used an in-memory implementation. The JPA implementation could be optimized (add caching, batch queries) without touching the business service. When we needed to read from a legacy system during migration, we added a new implementation behind the same interface.

Trade-off: Not every class needs an interface. I introduce abstractions only at meaningful boundaries — between business and infrastructure, between modules, or where multiple implementations are realistic.`,
    senaiExample: 'SGN3 Repositories define findById/save contracts. Business classes depend on the interface. Tests can mock them. Changing from native SQL to JPQL required no changes in the Business layer.',
    reweExample: 'A DeliveryTrackingService depending on a LocationProvider interface — could be GPS hardware, mobile app location, or warehouse scanner without changing the tracking logic.',
    keyPoints: ['Abstraction hides HOW, exposes WHAT', 'Creates boundaries between layers', 'Enables independent testing and evolution', 'Not every class needs an interface', 'Premature abstraction adds complexity without value'],
    mistakesToAvoid: ['Confusing abstraction with abstract classes', 'Creating an interface for every class automatically', 'Not explaining when abstraction is unnecessary'],
    followUps: [
      { question: 'When is an interface unnecessary?', answerHint: 'When there will never be another implementation AND testing does not require it. Internal utility classes, simple mappers, stateless converters.' },
      { question: 'What is a leaky abstraction?', answerHint: 'When the client must know implementation details to use the interface correctly. Example: a Repository interface that exposes flush() or session-specific operations.' },
      { question: 'How do you avoid overengineering?', answerHint: 'Create interfaces at infrastructure boundaries (DB, messaging, external APIs). For internal business classes calling each other, often unnecessary.' }
    ],
    vocabulary: [
      { term: 'contract', meaning: 'acordo formal sobre o que um componente faz sem dizer como', example: 'The interface defines a contract — clients depend on what it promises, not how it works internally.' },
      { term: 'boundary', meaning: 'limite entre camadas ou módulos do sistema', example: 'We place abstractions at boundaries — between business logic and database, between our system and external APIs.' },
      { term: 'leaky abstraction', meaning: 'abstração que expõe detalhes de implementação', example: 'A leaky abstraction forces the caller to understand internal details to use it correctly.' }
    ],
    selfEvaluation: [
      { criterion: 'I explained abstraction as hiding implementation, not just using interfaces', weight: 3 },
      { criterion: 'I gave a real example with clear boundary', weight: 3 },
      { criterion: 'I mentioned when NOT to abstract', weight: 2 },
      { criterion: 'I mentioned testability as a benefit', weight: 2 }
    ]
  },

  // 2. ORAL_ANSWER — Should every class have an interface?
  {
    id: 'abstract-oral-02',
    type: 'ORAL_ANSWER',
    subtopic: 'Abstraction',
    difficulty: 'INTERMEDIATE',
    question: 'Should every class have an interface?',
    interviewerIntent: 'Test if the candidate has judgment about when abstraction adds value versus when it is overhead.',
    shortAnswer: 'No. I introduce interfaces at meaningful boundaries: between business and infrastructure, where multiple implementations exist or are realistic, and where testing isolation requires it. For internal classes with one implementation that is unlikely to change, an interface adds noise.',
    modelAnswer: `Context: I have seen codebases where every class had an interface — EnrollmentService, EnrollmentServiceImpl, NotificationService, NotificationServiceImpl.

Problem: Most of these interfaces had exactly one implementation that would never change. The interface added a file to maintain, made navigation harder, and communicated no meaningful design decision.

Decision: I use interfaces when they represent a real boundary: Repository interfaces (can be JPA, in-memory, or cached), NotificationSender (email, SMS, push), ExternalSystemClient (real vs mock). For internal business-to-business calls, I inject the concrete class directly.

Result: Fewer files, clearer navigation, interfaces that actually MEAN something when you see them. When I see an interface, I know it represents a real design decision, not a cargo-cult pattern.

Trade-off: If you later need a second implementation, you must extract the interface then. In practice, this refactoring is trivial with modern IDEs and rarely happens for pure business classes.`,
    senaiExample: 'In SGN3, Repository classes have interfaces because they are mocked in tests and could be swapped. Business classes do NOT have interfaces — there is only one EnrollmentBusiness and no reason for a second.',
    reweExample: 'A RoutingEngine interface makes sense (could be internal algorithm or Google Maps API). An InvoiceCalculator might not need an interface if there is only one way to calculate.',
    keyPoints: ['Interfaces at infrastructure boundaries = yes', 'Interface for every class = overhead', 'Ask: will there ever be another implementation?', 'Ask: do tests need to replace this?'],
    mistakesToAvoid: ['Saying always yes', 'Saying always no', 'Not giving criteria for when to abstract'],
    followUps: [
      { question: 'How do you test without an interface?', answerHint: 'Mockito can mock concrete classes. Or: if the class is stateless business logic, test it directly without mocking.' },
      { question: 'What about CDI — does it require interfaces?', answerHint: 'CDI can inject concrete classes directly. Interfaces help for qualifiers and alternatives, but are not required for basic injection.' },
      { question: 'Is this related to YAGNI?', answerHint: 'Yes. You Aren\'t Gonna Need It. Don\'t create an abstraction until you have a real reason — a second implementation, a test boundary, or a module separation.' }
    ],
    vocabulary: [
      { term: 'cargo cult', meaning: 'imitar uma prática sem entender por que ela existe', example: 'Creating an interface for every class is cargo cult — copying the pattern without understanding its purpose.' },
      { term: 'YAGNI', meaning: 'You Aren\'t Gonna Need It — não criar algo até ter necessidade real', example: 'YAGNI says: don\'t create an interface until you actually need polymorphism or test isolation.' }
    ],
    selfEvaluation: [
      { criterion: 'I gave clear criteria for when to use interfaces', weight: 3 },
      { criterion: 'I distinguished infrastructure from business boundaries', weight: 3 },
      { criterion: 'I acknowledged the trade-off of not having an interface', weight: 2 },
      { criterion: 'I avoided absolute yes/no answers', weight: 2 }
    ]
  },

  // 3. CODE_REFACTOR — Leaky abstraction
  {
    id: 'abstract-refactor-01',
    type: 'CODE_REFACTOR',
    subtopic: 'Abstraction',
    difficulty: 'INTERMEDIATE',
    mission: 'This <strong>Repository interface</strong> leaks implementation details. Identify the problem and fix it.',
    code: `public interface OrderRepository {
    Optional<Order> findById(Long id);
    void save(Order order);
    void flush();                          // JPA-specific!
    void detach(Order order);              // JPA-specific!
    Session getSession();                  // Hibernate-specific!
    void setFlushMode(FlushModeType mode); // JPA-specific!
}`,
    problemsToIdentify: [
      'flush() is a JPA persistence context operation — not a domain concept',
      'detach() exposes JPA lifecycle management',
      'getSession() leaks Hibernate directly into the interface',
      'setFlushMode() is infrastructure configuration, not business',
      'Any non-JPA implementation cannot meaningfully implement these methods'
    ],
    refactoredCode: `public interface OrderRepository {
    Optional<Order> findById(Long id);
    List<Order> findByStatus(OrderStatus status);
    void save(Order order);
    void delete(Order order);
    boolean exists(Long id);
}

// JPA implementation handles flush/session internally:
@ApplicationScoped
public class JpaOrderRepository implements OrderRepository {
    @PersistenceContext private EntityManager em;

    public void save(Order order) {
        em.persist(order);
        em.flush(); // Implementation detail, hidden from callers
    }
}`,
    explain: 'The interface should express WHAT the repository does in business terms (find, save, delete). HOW it persists (flush, session, detach) belongs in the implementation. Callers should not need to know about JPA to use the repository.'
  },

  // 4. DESIGN_DECISION — When to introduce an abstraction
  {
    id: 'abstract-design-01',
    type: 'DESIGN_DECISION',
    subtopic: 'Abstraction',
    difficulty: 'SENIOR',
    mission: 'Your service calls an <strong>external pricing API</strong>. The API might change provider. Should you abstract it?',
    options: [
      { id: 'a', label: 'Call the API directly from business code', desc: 'Use the HTTP client inline where pricing is needed.' },
      { id: 'b', label: 'Interface + current implementation', desc: 'PricingService interface with ExternalPricingClient as implementation.' },
      { id: 'c', label: 'Interface + adapter + anti-corruption layer', desc: 'PricingPort interface, PricingAdapter that translates external DTOs to domain objects.' }
    ],
    bestChoice: 'c',
    explanation: {
      a: { pros: ['Fewer files', 'Direct and obvious'], cons: ['Business logic coupled to HTTP details', 'Cannot test without calling real API', 'Provider change affects business code'], verdict: 'Dangerous for external dependencies. Changes in the API format or provider propagate into business logic.' },
      b: { pros: ['Business decoupled from implementation', 'Testable with mock', 'Can swap provider'], cons: ['If the interface uses external DTOs, it still leaks'], verdict: 'Good, but watch for leaking external data structures into the interface.' },
      c: { pros: ['Complete isolation', 'External format changes contained in adapter', 'Domain uses its own language', 'Clean test boundary'], cons: ['More classes', 'Translation overhead'], verdict: 'Best for external systems that may change. The adapter translates between external and domain models.' }
    },
    nuance: 'For an internal helper utility, Option A is fine. For an external system you do not control, Option C protects you from format changes and provider switches. The anti-corruption layer is particularly valuable when the external model uses different terminology than your domain.'
  },

  // 5. COMPARE_CONCEPTS — Abstraction vs Encapsulation
  {
    id: 'abstract-compare-01',
    type: 'COMPARE_CONCEPTS',
    subtopic: 'Abstraction',
    difficulty: 'INTERMEDIATE',
    mission: 'Compare: <strong>Abstraction</strong> vs <strong>Encapsulation</strong>',
    conceptA: { name: 'Abstraction', definition: 'Hiding complexity by exposing only relevant operations through a contract. Defines WHAT an object does without revealing HOW.' },
    conceptB: { name: 'Encapsulation', definition: 'Protecting internal state by restricting access and controlling modifications through domain methods. Ensures VALID state.' },
    keyDifference: 'Abstraction is about what you expose (contract). Encapsulation is about what you protect (state). Abstraction operates at component boundaries. Encapsulation operates within a single component.',
    javaExample: 'Repository interface = abstraction (hides JPA details). Enrollment entity with confirm()/cancel() = encapsulation (protects state transitions).',
    interviewAnswer: 'Abstraction defines a contract that hides how something is implemented — like a Repository interface. Encapsulation protects an object\'s internal state and ensures only valid modifications happen — like an entity with domain methods instead of setters. They complement each other but solve different problems.'
  },

  // 6. FOLLOW_UP — When abstraction becomes harmful
  {
    id: 'abstract-followup-01',
    type: 'FOLLOW_UP',
    subtopic: 'Abstraction',
    difficulty: 'SENIOR',
    scenario: 'The interviewer probes your judgment about abstractions.',
    questions: [
      { q: 'Can you have too much abstraction?', hint: 'Yes — premature abstraction. If you abstract before understanding the domain, you get wrong boundaries. Refactoring wrong abstractions is harder than refactoring concrete code.' },
      { q: 'What is a leaky abstraction?', hint: 'When the client must understand the implementation to use it correctly. Example: a "generic" repository where you need to call flush() in specific scenarios.' },
      { q: 'How do you decide where to draw the boundary?', hint: 'Where implementation details are likely to change, where different teams own different sides, where you need test isolation, where the external model differs from yours.' },
      { q: 'Have you ever removed an abstraction?', hint: 'Yes — interfaces with only one implementation that added no value. Removed the interface, used the concrete class directly. Code became simpler to navigate.' },
      { q: 'Is abstract class abstraction?', hint: 'Partially. An abstract class provides partial implementation (template method). An interface provides pure contract. Choose based on whether you need shared state/behavior or just a contract.' }
    ]
  },

  // 7. REAL_EXPERIENCE — Repository as abstraction
  {
    id: 'abstract-experience-01',
    type: 'REAL_EXPERIENCE',
    subtopic: 'Abstraction',
    difficulty: 'INTERMEDIATE',
    prompt: 'Think about a repository or data access layer from your experience. How did abstraction (or its absence) help or hurt?',
    guidingQuestions: [
      'Did business code depend directly on EntityManager or on an interface?',
      'How were unit tests written — did they need a real database?',
      'Did you ever need to change the data source (different query, different system)?',
      'Was there a leaky abstraction you had to fix?'
    ],
    exampleStory: `In SGN3, Repository classes implement interfaces that define findById, save, and domain-specific queries. Business classes inject the interface. This allowed us to mock repositories in unit tests and optimize queries (switching from JPQL to native SQL) without modifying business logic. When we needed to read enrollments from both the main database and a legacy system during migration, we created a CompositeEnrollmentRepository behind the same interface.`,
    buildingBlocks: ['What layer depended on what', 'How testing worked', 'A time you changed implementation without affecting callers', 'A leaky abstraction you encountered']
  },

  // 8. FILL_BLANK — Interface as abstraction
  {
    id: 'abstract-fill-01',
    type: 'FILL_BLANK',
    subtopic: 'Abstraction',
    difficulty: 'BASIC',
    mission: 'Complete the interface that <strong>abstracts</strong> the notification mechanism.',
    code: 'public _____ NotificationSender {\n    void send(Notification notification);\n}',
    blank: '_____',
    choices: ['interface', 'abstract class', 'class', 'enum'],
    answer: 'interface',
    explain: 'An interface defines a pure contract — WHAT can be done without HOW. Implementations (EmailSender, SmsSender, PushSender) provide the how. The business service depends only on the interface.'
  },

  // 9. PICK_INVALID — Identify premature abstraction
  {
    id: 'abstract-pick-01',
    type: 'PICK_INVALID',
    subtopic: 'Abstraction',
    difficulty: 'INTERMEDIATE',
    mission: 'Which is an example of <strong>premature or unnecessary abstraction</strong>?',
    snippets: [
      { id: 'a', code: 'interface PaymentGateway {\n  PaymentResult charge(Money amount);\n}\n// Has 3 implementations:\n// StripeGateway, PayPalGateway, MockGateway', valid: true },
      { id: 'b', code: 'interface StringUtils {\n  String trim(String s);\n  String upper(String s);\n}\nclass StringUtilsImpl implements StringUtils {\n  // Only implementation ever\n}', valid: false },
      { id: 'c', code: 'interface MessageBroker {\n  void publish(Event event);\n}\n// Implementations: KafkaBroker, JmsBroker, InMemoryBroker (tests)', valid: true }
    ],
    answer: 'b',
    explain: 'StringUtils with an interface is premature abstraction — there will never be another implementation. It adds a file and indirection with zero benefit. PaymentGateway and MessageBroker have real multiple implementations and test boundaries.'
  },

  // 10. PREDICT_OUTPUT — Interface and runtime type
  {
    id: 'abstract-predict-01',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Abstraction',
    difficulty: 'BASIC',
    mission: 'What does this print? The <strong>interface</strong> hides which implementation runs.',
    code: `interface Greeter { String greet(); }
class Formal implements Greeter {
    public String greet() { return "Good morning"; }
}
class Casual implements Greeter {
    public String greet() { return "Hey"; }
}

Greeter g = new Casual();
System.out.println(g.greet());`,
    choices: ['Good morning', 'Hey', 'Compile Error', 'null'],
    answer: 'Hey',
    explain: 'The reference type is Greeter (abstraction), but the runtime object is Casual. The JVM calls Casual.greet(). This is the power of abstraction — the caller code works with ANY Greeter implementation without knowing which one it got.'
  }
];
