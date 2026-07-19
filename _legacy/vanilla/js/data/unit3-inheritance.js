/**
 * Unit 3 — Inheritance (12 exercises)
 */
const inheritanceExercises = [

  // 1. ORAL_ANSWER — When is inheritance appropriate?
  {
    id: 'inherit-oral-01',
    type: 'ORAL_ANSWER',
    subtopic: 'Inheritance',
    difficulty: 'SENIOR',
    question: 'When is inheritance appropriate?',
    interviewerIntent: 'Test if the candidate has nuanced judgment — inheritance is not always wrong, but requires specific conditions.',
    shortAnswer: 'Inheritance is appropriate when there is a genuine and stable is-a relationship, when the subclass can fully substitute the parent (Liskov), and when shared behavior truly belongs together — not just for code reuse.',
    modelAnswer: `Context: Many enterprise codebases overuse inheritance — creating deep hierarchies for code sharing rather than genuine type relationships.

Problem: I have seen BaseService, BaseRepository, BaseEntity patterns where 40+ classes extend a single base class that accumulates unrelated utilities. Any change to the base ripples through everything.

Decision: I now apply strict criteria: inheritance only when (1) the subtype IS-A parent in the domain, (2) the subtype can fully replace the parent anywhere without surprises, and (3) the shared behavior is semantically cohesive, not just convenient reuse.

Result: Valid examples in our systems: Exception hierarchies (BusinessException extends RuntimeException), Document types (Certificate, Declaration extend Document with shared number/date), JPA mapped superclasses for auditing fields.

Trade-off: Sometimes inheritance is the simplest solution for 2-3 stable types with shared state. Forcing composition in those cases adds unnecessary indirection. The key is stability — if the hierarchy changes frequently, composition is safer.`,
    senaiExample: 'SGN3 uses inheritance correctly for SenaiEntity (base with ID/audit) and exception hierarchy (SenaiException, BusinessException). It was used incorrectly in some BaseBusinessService patterns that were later refactored to composition.',
    reweExample: 'Exception hierarchies (DeliveryException, RoutingException extending LogisticsException), or a Vehicle base class (Truck, Van, Bike) with shared capacity/location — if the hierarchy is stable.',
    keyPoints: ['Must be genuine is-a, not just code reuse', 'Subtype must be safely substitutable (Liskov)', 'Hierarchy should be stable over time', 'Shallow hierarchies (1-2 levels) are usually fine', 'Deep hierarchies become fragile'],
    mistakesToAvoid: ['Saying inheritance is always bad', 'Not giving criteria for when it IS appropriate', 'Using Animal/Dog/Cat as main example'],
    followUps: [
      { question: 'What is the fragile base class problem?', answerHint: 'Changes to a base class can silently break subclasses. Subclass behavior depends on implementation details of the parent that may change.' },
      { question: 'Can you give an example where you removed inheritance?', answerHint: 'BaseBusinessService with protected EntityManager, NotificationService — refactored to inject only needed dependencies.' },
      { question: 'Is JPA entity inheritance appropriate?', answerHint: 'MappedSuperclass for shared audit fields = fine. TABLE_PER_CLASS/JOINED for polymorphic queries = use with care, can hurt performance.' }
    ],
    vocabulary: [
      { term: 'fragile base class', meaning: 'classe-base onde mudanças quebram silenciosamente subclasses', example: 'The fragile base class problem means that modifying the parent can break all 40 subclasses in ways you cannot predict.' },
      { term: 'Liskov substitution', meaning: 'subtipo deve poder substituir o tipo-base sem surpresas', example: 'If Square extends Rectangle but setWidth() changes height too, it violates Liskov — clients of Rectangle get unexpected behavior.' },
      { term: 'shallow hierarchy', meaning: 'hierarquia com apenas 1-2 níveis de profundidade', example: 'A shallow hierarchy like Document → Certificate is manageable. A 5-level hierarchy is a maintenance nightmare.' }
    ],
    selfEvaluation: [
      { criterion: 'I gave specific criteria for when inheritance is appropriate', weight: 3 },
      { criterion: 'I gave a real example of correct AND incorrect inheritance use', weight: 3 },
      { criterion: 'I mentioned Liskov substitution as a test', weight: 2 },
      { criterion: 'I acknowledged inheritance is not always wrong', weight: 2 }
    ]
  },

  // 2. ORAL_ANSWER — Fragile base class problem
  {
    id: 'inherit-oral-02',
    type: 'ORAL_ANSWER',
    subtopic: 'Inheritance',
    difficulty: 'SENIOR',
    question: 'What is the fragile base class problem?',
    interviewerIntent: 'Assess practical understanding of inheritance risks beyond theoretical knowledge.',
    shortAnswer: 'When a base class changes its implementation, subclasses that depend on those internal details can break silently. The more subclasses extend a base, the riskier any modification becomes.',
    modelAnswer: `Context: In a large system, we had a BaseBusinessService with a save() method that called validate(), then persist(), then notifyUser() in sequence.

Problem: A subclass overrode validate() to add custom logic. Later, someone modified the base class to call validate() twice (once before and once after persist for integrity check). The subclass validation now ran twice, sending duplicate notifications. The base class author did not know subclasses relied on validate() being called once.

Decision: We stopped using template method patterns in base classes for critical flows. We moved to composition — each service owns its full flow explicitly. Shared behavior became injected components, not inherited methods.

Result: Each service was self-contained. Changes to shared components required explicit version updates, not silent inheritance propagation.

Trade-off: More explicit code, less "magic" reuse. But explicitness is a feature when maintaining a large codebase with multiple developers.`,
    senaiExample: 'SGN3 had BaseService patterns where changing the audit logging in the base class affected 30+ services unexpectedly. The solution was extracting AuditService as an injected component.',
    reweExample: 'A BaseShipmentProcessor with hooks for preProcess/postProcess — adding a retry mechanism in the base could trigger side effects in all subclass hooks unexpectedly.',
    keyPoints: ['Base class changes can silently break subclasses', 'Subclasses depend on implementation details they cannot control', 'More subclasses = riskier changes to base', 'Solution: prefer composition or keep hierarchies shallow and stable'],
    mistakesToAvoid: ['Only giving the theoretical definition without a real example', 'Not explaining why this makes inheritance risky in practice'],
    followUps: [
      { question: 'How do you prevent this?', answerHint: 'Keep hierarchies shallow (1-2 levels). Document which methods are meant to be overridden. Prefer composition for variable behavior.' },
      { question: 'Are final methods a solution?', answerHint: 'Partially. Making base methods final prevents override, but then you cannot customize. It is a signal that the method should not be changed.' }
    ],
    vocabulary: [
      { term: 'template method', meaning: 'padrão onde a classe-base define o esqueleto e subclasses implementam passos', example: 'Template Method in a base class means subclasses fill in the blanks — but they depend on the skeleton not changing.' },
      { term: 'implicit coupling', meaning: 'acoplamento não óbvio que só aparece quando algo muda', example: 'Inheritance creates implicit coupling — the subclass depends on base class internals without an explicit import or reference.' }
    ],
    selfEvaluation: [
      { criterion: 'I explained the problem with a concrete scenario', weight: 3 },
      { criterion: 'I showed how a base change broke subclasses', weight: 3 },
      { criterion: 'I offered a solution (composition)', weight: 2 },
      { criterion: 'I mentioned it as a reason to prefer composition', weight: 2 }
    ]
  },

  // 3. CODE_REFACTOR — BaseService antipattern
  {
    id: 'inherit-refactor-01',
    type: 'CODE_REFACTOR',
    subtopic: 'Inheritance',
    difficulty: 'INTERMEDIATE',
    mission: 'This <strong>base class</strong> is used for code reuse, not a real is-a relationship. Identify problems.',
    code: `public abstract class BaseBusinessService {
    @Inject protected EntityManager em;
    @Inject protected NotificationService notifier;
    @Inject protected AuditService audit;
    @Inject protected CacheService cache;
    @Inject protected Logger logger;

    protected <T> T find(Class<T> type, Long id) {
        return em.find(type, id);
    }
    protected void notify(String msg) { notifier.send(msg); }
    protected void auditLog(String action) { audit.log(action); }
    protected void invalidateCache(String key) { cache.evict(key); }
}

public class EnrollmentService extends BaseBusinessService {
    // Inherits 5 dependencies it may not all need
    public void enroll(Long studentId) {
        Student s = find(Student.class, studentId);
        notify("Enrolled: " + s.getName());
    }
}`,
    problemsToIdentify: [
      'Inheritance used solely for convenience, not is-a relationship',
      'All subclasses get ALL dependencies even if unused',
      'Protected state means subclasses can access internals',
      'Changes to base affect 40+ subclasses',
      'Testing requires setting up all 5 dependencies',
      'Single-class God-object that attracts utilities'
    ],
    refactoredCode: `@ApplicationScoped
public class EnrollmentService {
    @Inject private StudentRepository students;
    @Inject private NotificationService notifier;
    // Only declares what it ACTUALLY needs

    public void enroll(Long studentId) {
        Student s = students.findById(studentId)
            .orElseThrow(() -> new NotFoundException("Student not found"));
        // enrollment logic
        notifier.send("Enrolled: " + s.getName());
    }
}`,
    explain: 'Each service declares only its real dependencies. No base class. Testing requires mocking only 2 things instead of 5. Adding a new service does not inherit unwanted baggage.'
  },

  // 4. CODE_REFACTOR — Inheritance for sharing fields
  {
    id: 'inherit-refactor-02',
    type: 'CODE_REFACTOR',
    subtopic: 'Inheritance',
    difficulty: 'INTERMEDIATE',
    mission: 'This hierarchy uses inheritance to <strong>share unrelated behaviors</strong>. What is wrong?',
    code: `public abstract class BaseEntity {
    private Long id;
    private LocalDateTime createdAt;
    private String createdBy;
    // Audit fields — OK so far

    // But then...
    public abstract void validate();        // Validation mixed in
    public void sendNotification() { ... }  // Notification in entity?!
    public byte[] toPdf() { ... }           // PDF generation in entity?!
}

public class Invoice extends BaseEntity {
    private BigDecimal total;
    public void validate() { /* invoice rules */ }
    // Gets sendNotification() and toPdf() for free
}`,
    problemsToIdentify: [
      'Entity has validation, notification AND PDF generation — three responsibilities',
      'Invoice gets behaviors it should not own (notification)',
      'Adding a new entity type inherits all methods even if irrelevant',
      'Testing validate() requires the entire BaseEntity setup'
    ],
    refactoredCode: `// Base only for SHARED IDENTITY (legitimate use of @MappedSuperclass)
@MappedSuperclass
public abstract class AuditableEntity {
    @Id private Long id;
    private LocalDateTime createdAt;
    private String createdBy;
}

// Separate responsibilities into their own components:
public class Invoice extends AuditableEntity {
    private BigDecimal total;
}

@ApplicationScoped
public class InvoiceValidator { void validate(Invoice i) {...} }
@ApplicationScoped
public class InvoicePdfGenerator { byte[] generate(Invoice i) {...} }
@ApplicationScoped
public class InvoiceNotifier { void notify(Invoice i) {...} }`,
    explain: 'The base class should only contain what ALL entities genuinely share (ID, audit fields). Behaviors like validation, PDF and notification belong in separate focused components. Inheritance for identity; composition for behavior.'
  },

  // 5. DESIGN_DECISION — When to use inheritance in JPA entities
  {
    id: 'inherit-design-01',
    type: 'DESIGN_DECISION',
    subtopic: 'Inheritance',
    difficulty: 'SENIOR',
    mission: 'You have <strong>5 document types</strong> that share number, date and owner but have different content. How to model in JPA?',
    options: [
      { id: 'a', label: '@MappedSuperclass', desc: 'Base class with shared fields. Each type has its own table. No polymorphic queries.' },
      { id: 'b', label: 'SINGLE_TABLE inheritance', desc: 'All types in one table with discriminator column. NULL columns for type-specific fields.' },
      { id: 'c', label: 'Composition with document_type column', desc: 'One Document entity with type field. Type-specific data in separate tables joined by FK.' }
    ],
    bestChoice: 'a',
    explanation: {
      a: { pros: ['Clean tables', 'No NULL columns', 'No discriminator logic', 'Simple queries per type', 'Best performance for type-specific queries'], cons: ['Cannot query all documents polymorphically', 'Shared behavior needs utility methods or common interface'], verdict: 'Best when you rarely need to query "all documents regardless of type" and each type has very different fields.' },
      b: { pros: ['Polymorphic queries work', 'Single table = fast joins', 'JPA handles discriminator'], cons: ['Many NULL columns', 'Table grows wide', 'All types coupled in one table', 'Index on nullable columns less effective'], verdict: 'Good for 2-3 types with mostly similar fields. Problematic for 5+ types with very different columns.' },
      c: { pros: ['Flexible', 'No inheritance needed', 'Type-specific data isolated', 'Easy to add new types'], cons: ['Joins needed for complete data', 'No JPA polymorphism support', 'Manual mapping'], verdict: 'Good when types share very few fields and you want maximum flexibility. Trades JPA convenience for schema control.' }
    },
    nuance: 'In practice: @MappedSuperclass for shared audit/identity fields is almost always correct. SINGLE_TABLE works for small, stable hierarchies (2-3 types). For 5+ diverse types, consider composition or separate entities with a shared interface at the Java level.'
  },

  // 6. COMPARE_CONCEPTS — Abstract class vs Interface
  {
    id: 'inherit-compare-01',
    type: 'COMPARE_CONCEPTS',
    subtopic: 'Inheritance',
    difficulty: 'INTERMEDIATE',
    mission: 'Compare: <strong>Abstract Class</strong> vs <strong>Interface</strong>',
    conceptA: { name: 'Abstract Class', definition: 'Can have state (fields), constructors, concrete methods AND abstract methods. Single inheritance only. Represents is-a with shared implementation.' },
    conceptB: { name: 'Interface', definition: 'Pure contract (pre-Java 8). Can have default methods since Java 8. Multiple inheritance of type. Represents can-do capability.' },
    keyDifference: 'Abstract class = shared state + partial implementation + single hierarchy. Interface = contract + multiple implementation + no state. Choose abstract class when subtypes SHARE state; interface when they share BEHAVIOR contract.',
    javaExample: 'Abstract class: Document with number and date fields that all subtypes share. Interface: Exportable with export() method that unrelated classes (Invoice, Report, Certificate) can implement.',
    interviewAnswer: 'I use abstract classes when subtypes genuinely share state and partial implementation — like a Document base with number and date. I use interfaces when multiple unrelated classes need to satisfy the same contract — like Exportable or Auditable. Since Java 8+, interfaces can have default methods, which reduced the need for abstract classes as "partial implementation providers."'
  },

  // 7. FOLLOW_UP — Deep dive on inheritance problems
  {
    id: 'inherit-followup-01',
    type: 'FOLLOW_UP',
    subtopic: 'Inheritance',
    difficulty: 'SENIOR',
    scenario: 'The interviewer asks about inheritance decisions in large systems.',
    questions: [
      { q: 'Have you ever removed inheritance from a system?', hint: 'BaseBusinessService pattern — extracted to composed dependencies. Reduced implicit coupling.' },
      { q: 'How many levels deep should a hierarchy go?', hint: '1-2 levels is manageable. 3+ becomes hard to reason about. If you need 4+, the design probably needs rethinking.' },
      { q: 'What about utility methods — should they be in a base class?', hint: 'No. Static utility class or injected helper service. Inheriting utility methods couples all subclasses to them.' },
      { q: 'Is extends always inheritance?', hint: 'In Java, yes (class inheritance). But extending an abstract class that defines only a contract (no state) is closer to implementing an interface in spirit.' },
      { q: 'How does inheritance affect testing?', hint: 'Tests of a subclass implicitly test the base. Changes to base require re-testing all subclasses. Composition allows testing each component in isolation.' }
    ]
  },

  // 8. REAL_EXPERIENCE — Inheritance hierarchy that became problematic
  {
    id: 'inherit-experience-01',
    type: 'REAL_EXPERIENCE',
    subtopic: 'Inheritance',
    difficulty: 'SENIOR',
    prompt: 'Think about a class hierarchy from your experience that became difficult to maintain. What went wrong and how would you redesign it?',
    guidingQuestions: [
      'What was the base class? How many subclasses?',
      'Was it truly is-a or just code reuse?',
      'What happened when the base class needed to change?',
      'Did all subclasses actually need all inherited behavior?',
      'How would composition solve the problem?'
    ],
    exampleStory: `In SGN3, a BaseBusinessService accumulated protected fields (EntityManager, NotificationService, AuditService, CacheService, Logger). Over 40 services extended it. When we needed to add transaction management logic to the base, it affected services that did not need it. Some subclasses only used 1 of the 5 inherited dependencies. The refactoring removed the base class entirely — each service now injects only what it needs. Testing became trivial because you mock only real dependencies.`,
    buildingBlocks: ['Base class name and purpose', 'Number of subclasses', 'What triggered the problem', 'Impact on testing', 'How you fixed or would fix it']
  },

  // 9. PREDICT_OUTPUT — Method resolution in inheritance
  {
    id: 'inherit-predict-01',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Inheritance',
    difficulty: 'BASIC',
    mission: 'What does this print? Focus on <strong>method resolution</strong> in inheritance.',
    code: `class Base {
    String name() { return "Base"; }
    void print() { System.out.println(name()); }
}
class Child extends Base {
    String name() { return "Child"; }
}

Base obj = new Child();
obj.print();`,
    choices: ['Base', 'Child', 'Compile Error', 'null'],
    answer: 'Child',
    explain: 'print() calls name(). Since obj is actually a Child instance, Java uses dynamic dispatch — Child.name() is called, not Base.name(). This is runtime polymorphism through inheritance. The reference type (Base) does not determine which override runs.'
  },

  // 10. FILL_BLANK — Protected access
  {
    id: 'inherit-fill-01',
    type: 'FILL_BLANK',
    subtopic: 'Inheritance',
    difficulty: 'BASIC',
    mission: 'What access modifier allows a <strong>subclass in a different package</strong> to access this field?',
    code: 'public class Document {\n    _____ String documentNumber;\n}',
    blank: '_____',
    choices: ['protected', 'private', '(default)', 'public'],
    answer: 'protected',
    explain: 'protected = accessible by subclasses (even in different packages) and same-package classes. private = only the class itself. default = same package only. In inheritance, protected allows controlled sharing with subtypes.'
  },

  // 11. PICK_INVALID — Identify LSP violation
  {
    id: 'inherit-pick-01',
    type: 'PICK_INVALID',
    subtopic: 'Inheritance',
    difficulty: 'INTERMEDIATE',
    mission: 'Which class <strong>violates Liskov Substitution</strong> Principle?',
    snippets: [
      { id: 'a', code: 'class Bird { void fly() {...} }\nclass Eagle extends Bird {\n  void fly() { /* soars high */ }\n}', valid: true },
      { id: 'b', code: 'class Bird { void fly() {...} }\nclass Penguin extends Bird {\n  void fly() {\n    throw new UnsupportedOperationException();\n  }\n}', valid: false },
      { id: 'c', code: 'class Shape { double area() {...} }\nclass Circle extends Shape {\n  double area() { return PI*r*r; }\n}', valid: true }
    ],
    answer: 'b',
    explain: 'Penguin cannot fly — throwing UnsupportedOperationException violates the parent contract. Code expecting Bird.fly() will break. This is classic LSP violation: the subtype cannot safely replace the parent. Solution: restructure so not all Birds promise fly().'
  },

  // 12. DESIGN_DECISION — Inheritance vs interface for shared behavior
  {
    id: 'inherit-design-02',
    type: 'DESIGN_DECISION',
    subtopic: 'Inheritance',
    difficulty: 'INTERMEDIATE',
    mission: 'Multiple entities need <strong>audit fields</strong> (createdAt, createdBy, updatedAt). Best approach?',
    options: [
      { id: 'a', label: 'Abstract class with @MappedSuperclass', desc: 'AuditableEntity base class with audit fields. All entities extend it.' },
      { id: 'b', label: 'Interface with default methods', desc: 'Auditable interface. Cannot hold state, so fields still in each entity.' },
      { id: 'c', label: 'Embeddable component', desc: '@Embeddable AuditInfo class. Each entity has @Embedded AuditInfo auditInfo.' }
    ],
    bestChoice: 'a',
    explanation: {
      a: { pros: ['JPA handles columns automatically', 'Clean — no repetition', 'Entity listeners for auto-population', 'Well-established JPA pattern'], cons: ['Single inheritance consumed', 'All entities must extend it', 'Cannot add a second base'], verdict: 'The standard JPA approach. Works well because audit IS genuinely shared state that all entities need.' },
      b: { pros: ['Multiple inheritance of type', 'Flexible'], cons: ['Cannot hold state in interface', 'Fields duplicated in each entity', 'No JPA support for interface mapping'], verdict: 'Does not solve the problem — you still need the fields somewhere. Interfaces cannot hold entity state.' },
      c: { pros: ['Composition over inheritance', 'Reusable without hierarchy', 'Entity can have multiple embeddables'], cons: ['Slightly more verbose', 'Nested access (entity.getAuditInfo().getCreatedAt())', 'JPA column naming needs configuration'], verdict: 'Valid alternative. Better when some entities need different audit models or when you want to avoid the hierarchy tax.' }
    },
    nuance: 'For standard audit fields that every entity needs identically, @MappedSuperclass is the pragmatic Java/JPA choice. If different entities need different audit configurations, @Embeddable gives more flexibility without consuming the single inheritance slot.'
  }
];
