/**
 * OOP & SOLID Module — Interview Questions Data
 * First delivery: 5 complete questions with all exercise types
 */

const oopQuestions = [

  // ============================================================
  // QUESTION 1: Encapsulation beyond private fields
  // ============================================================
  {
    id: 'oop-encapsulation-01',
    topic: 'OOP & SOLID',
    subtopic: 'Encapsulation',
    difficulty: 'SENIOR',
    question: 'What is encapsulation beyond private fields?',
    interviewerIntent: 'Assess whether the candidate understands encapsulation as protecting business invariants, not just hiding data.',
    shortAnswer: 'Encapsulation means protecting the valid state of an object by exposing domain operations instead of unrestricted setters. The object controls which state transitions are allowed and prevents invalid combinations from existing.',
    modelAnswer: `Context: In our education management system, an enrollment entity could move through statuses like PENDING, CONFIRMED, CANCELLED and COMPLETED.

Problem: Originally, the entity had a public setStatus() method. Any service could set any status at any time, leading to invalid transitions — for example, cancelling an already-completed enrollment.

Decision: I removed the setter and introduced domain methods like confirm(), cancel(reason) and complete(). Each method validated whether the transition was allowed from the current state before changing it.

Result: Invalid state transitions became impossible at compile time. Validation was centralized inside the entity rather than scattered across multiple services. Bugs related to inconsistent enrollment states dropped significantly.

Trade-off: The entity became slightly more complex, and some batch operations required additional consideration. But the consistency guarantee was worth it for a domain with strict business rules.`,
    senaiExample: 'In the SGN3 enrollment system, Matricula entities controlled their own status transitions. Instead of allowing any Business class to call setStatus(), the entity exposed confirm() and cancel(reason) methods that validated the transition rules internally.',
    reweExample: 'A delivery order in a logistics system could apply the same pattern — an Order entity with methods like dispatch(), markInTransit(), deliver() and returnToWarehouse(), each validating that the current state allows the transition.',
    keyPoints: [
      'Encapsulation is about protecting invariants, not just hiding fields',
      'Domain methods express business operations',
      'Invalid state transitions should be impossible',
      'Validation lives close to the state it protects',
      'Setters can weaken domain integrity'
    ],
    mistakesToAvoid: [
      'Saying encapsulation is just making fields private',
      'Not giving a real example',
      'Confusing encapsulation with data hiding only',
      'Not mentioning the benefit (preventing invalid states)'
    ],
    followUps: [
      { question: 'Would you always put validation inside the entity?', answerHint: 'When validation depends only on the entity\'s own state, yes. When it requires external data (DB query, other services), use a domain service or validator.' },
      { question: 'Is this compatible with JPA?', answerHint: 'Yes. JPA uses field access or property access. You can have private fields with no setter and JPA still persists via reflection. The entity methods work alongside JPA lifecycle.' },
      { question: 'How do you test these transitions?', answerHint: 'Unit tests for each valid and invalid transition. No mocks needed — just instantiate the entity, set initial state, call the method, assert result or exception.' }
    ],
    vocabulary: [
      { term: 'business invariant', meaning: 'regra que deve ser sempre verdadeira para o objeto ser válido', example: 'An enrollment cannot be confirmed if it is already cancelled — that is a business invariant.' },
      { term: 'state transition', meaning: 'mudança controlada de um estado para outro', example: 'The confirm() method performs a state transition from PENDING to CONFIRMED.' },
      { term: 'domain operation', meaning: 'operação que expressa uma ação de negócio', example: 'Instead of setStatus(), we use domain operations like confirm() and cancel().' }
    ],
    selfEvaluation: [
      { criterion: 'I explained that encapsulation goes beyond private fields', weight: 3 },
      { criterion: 'I gave a real example with state transitions', weight: 3 },
      { criterion: 'I mentioned the benefit (preventing invalid states)', weight: 2 },
      { criterion: 'I mentioned a trade-off or limitation', weight: 2 }
    ]
  },

  // ============================================================
  // QUESTION 2: Where did you use polymorphism?
  // ============================================================
  {
    id: 'oop-polymorphism-01',
    topic: 'OOP & SOLID',
    subtopic: 'Polymorphism',
    difficulty: 'SENIOR',
    question: 'Where did you use polymorphism in a real project?',
    interviewerIntent: 'Evaluate whether the candidate can connect polymorphism to an actual design decision with measurable benefit.',
    shortAnswer: 'I used polymorphism in a document generation flow where certificates, declarations and attendance reports each implemented a common DocumentGenerator interface. The business service selected the correct implementation at runtime without conditional logic.',
    modelAnswer: `Context: Our education system generated several types of documents — certificates, declarations, attendance reports and transcripts. Each had different content, layout and validation rules.

Problem: The original implementation was a single method with a growing if/else chain based on document type. Adding a new document type meant modifying this method, risking regressions in existing types.

Decision: I introduced a DocumentGenerator interface with a supportedType() method and a generate() method. Each document type got its own implementation. The orchestrating service collected all implementations via CDI injection and selected the correct one based on the request type.

Result: New document types could be added by creating a single class implementing the interface — no modification to the main flow. Each implementation was tested independently. The if/else chain disappeared.

Trade-off: The solution introduced more classes and required understanding the service-locator pattern. For a system with only two simple document types, a switch might have been simpler. In our case, with 6+ types and growing, polymorphism was clearly justified.`,
    senaiExample: 'The SGN3 system generates certificates, declarations and various reports. Each document type has specific layout rules, data requirements and validation. Polymorphic generators allowed independent evolution of each type.',
    reweExample: 'In logistics, this pattern applies to notification channels (email, SMS, push), shipment processing strategies (standard, express, same-day), or invoice generation for different delivery types.',
    keyPoints: [
      'Start with the problem (growing conditional)',
      'Explain the common contract (interface)',
      'Show how implementations are selected at runtime',
      'Mention extensibility — adding new types without changing existing code',
      'Acknowledge when the pattern would be overkill'
    ],
    mistakesToAvoid: [
      'Only defining polymorphism theoretically',
      'Using the Animal/Dog/Cat example as the main answer',
      'Claiming if/else is always wrong',
      'Not mentioning a concrete result or benefit'
    ],
    followUps: [
      { question: 'How did the service select the correct implementation?', answerHint: 'CDI injected a List of implementations. The service built a Map<DocumentType, DocumentGenerator> at startup. Lookup was O(1) by type.' },
      { question: 'What if a type had no implementation?', answerHint: 'Throw UnsupportedOperationException with a clear message. Alternatively, a default/fallback implementation.' },
      { question: 'Would a switch expression be simpler?', answerHint: 'For 2-3 stable types, yes. For 6+ types that evolve independently and have complex logic each, separate classes are cleaner.' }
    ],
    vocabulary: [
      { term: 'runtime dispatch', meaning: 'a JVM decide qual implementação chamar em tempo de execução', example: 'The JVM performs runtime dispatch based on the actual object type, not the reference type.' },
      { term: 'extensibility', meaning: 'capacidade de adicionar comportamento com impacto mínimo', example: 'Polymorphism gives us extensibility — new types without touching existing code.' },
      { term: 'decoupling', meaning: 'reduzir dependências diretas entre componentes', example: 'The service is decoupled from specific document implementations.' }
    ],
    selfEvaluation: [
      { criterion: 'I described a real problem that polymorphism solved', weight: 3 },
      { criterion: 'I explained the common interface and its implementations', weight: 3 },
      { criterion: 'I mentioned a concrete benefit (extensibility, testability)', weight: 2 },
      { criterion: 'I acknowledged when simpler solutions would suffice', weight: 2 }
    ]
  },

  // ============================================================
  // QUESTION 3: Why composition over inheritance?
  // ============================================================
  {
    id: 'oop-composition-01',
    topic: 'OOP & SOLID',
    subtopic: 'Composition',
    difficulty: 'SENIOR',
    question: 'Why would you prefer composition over inheritance?',
    interviewerIntent: 'Assess whether the candidate understands coupling trade-offs and can justify design choices with practical experience.',
    shortAnswer: 'Composition assembles behavior from independent components injected as dependencies. It avoids the tight coupling of inheritance, allows replacing implementations independently, and makes each component testable in isolation.',
    modelAnswer: `Context: In our enterprise system, business services needed validation, persistence, notification and audit capabilities.

Problem: An earlier design used a BaseBusinessService with protected fields for EntityManager, NotificationService and AuditService. Every service extended this base class. Changes to the base class affected all 40+ subclasses. Testing required complex setup because of inherited dependencies. Adding a new capability meant modifying the base class.

Decision: I refactored services to receive their dependencies through CDI injection instead of inheriting them. Each service declared only the dependencies it actually needed. Shared behaviors became independent components (validators, notifiers, audit writers) that could be composed freely.

Result: Services became smaller and focused. Unit testing became straightforward — mock only what you need. New capabilities could be added without touching a base class. Team members could work on different services without merge conflicts in a shared superclass.

Trade-off: More classes exist in the system. The flow of a request passes through more objects. Developers need to understand dependency injection. But these costs are minor compared to the fragility of a deep inheritance hierarchy.`,
    senaiExample: 'The SGN3 Business layer injects Repository, Validator and JMS dependencies via CDI rather than inheriting from a base class. Each Business is composed of exactly the components it needs.',
    reweExample: 'An OrderProcessingService in logistics might compose InventoryChecker, RouteCalculator and NotificationSender rather than inheriting from a BaseOrderService with all possible capabilities.',
    keyPoints: [
      'Inheritance creates tight coupling between base and subclasses',
      'Composition allows independent replacement of components',
      'Each component is testable in isolation (mock only what you need)',
      'Composition supports the Single Responsibility Principle',
      'Inheritance is not bad — it is appropriate for stable is-a relationships'
    ],
    mistakesToAvoid: [
      'Saying inheritance is always bad',
      'Not giving a concrete example of the problem inheritance caused',
      'Confusing composition with simply having fields in a class',
      'Not mentioning that inheritance has valid use cases'
    ],
    followUps: [
      { question: 'When would inheritance still be better?', answerHint: 'Stable is-a relationships where the hierarchy rarely changes. Example: Exception classes, or a Document base with shared immutable state.' },
      { question: 'How does CDI support composition?', answerHint: 'CDI injects implementations at runtime. You declare what you need (interface), not what provides it (concrete class). Swapping implementations requires no code change in the consumer.' },
      { question: 'What trade-offs does composition introduce?', answerHint: 'More classes, more constructor parameters, flow distributed across objects. Mitigated by clear naming and single responsibility per component.' }
    ],
    vocabulary: [
      { term: 'delegation', meaning: 'delegar trabalho para outro objeto em vez de herdar', example: 'The service delegates validation to a composed Validator rather than inheriting validation logic.' },
      { term: 'fragile base class', meaning: 'problema onde mudanças na classe-base quebram subclasses', example: 'The fragile base class problem made every change risky because 40 services inherited from it.' },
      { term: 'independently replaceable', meaning: 'componente que pode ser trocado sem afetar outros', example: 'Each composed dependency is independently replaceable — swap the email notifier for an SMS notifier without changing the business service.' }
    ],
    selfEvaluation: [
      { criterion: 'I explained the problem that inheritance caused', weight: 3 },
      { criterion: 'I showed how composition solved it', weight: 3 },
      { criterion: 'I mentioned testability as a benefit', weight: 2 },
      { criterion: 'I acknowledged when inheritance is still appropriate', weight: 2 }
    ]
  },

  // ============================================================
  // QUESTION 4: Tell me one SOLID principle you use every day
  // ============================================================
  {
    id: 'oop-solid-01',
    topic: 'OOP & SOLID',
    subtopic: 'SOLID',
    difficulty: 'INTERMEDIATE',
    question: 'Tell me one SOLID principle you use every day.',
    interviewerIntent: 'Verify the candidate applies SOLID in practice, not just knows the acronym. Expects a specific example, not all five principles listed.',
    shortAnswer: 'Single Responsibility. In enterprise systems, services naturally accumulate validation, persistence, notification and reporting. I continuously separate these concerns into focused components that change for one reason and are testable independently.',
    modelAnswer: `Context: The principle I apply most consciously is Single Responsibility. In large enterprise systems, business services tend to grow into classes that validate, persist, generate documents, send notifications and write audit logs — all in one place.

Problem: One enrollment service had accumulated enrollment logic, PDF generation, email sending and audit logging. Any change in email templates required modifying the same class that handled enrollment business rules. The class was over 800 lines and difficult to test.

Decision: I extracted each concern into its own component: EnrollmentValidator, EnrollmentRepository, DocumentGenerator, NotificationService and AuditWriter. The main service became an orchestrator that delegated to each component.

Result: Each component was under 100 lines, had a single reason to change, and could be unit-tested independently. The team could modify email logic without risking enrollment rules.

Trade-off: More files to navigate. The full flow requires following calls across classes. We mitigate this with clear naming conventions and consistent layering.`,
    senaiExample: 'In SGN3, the separation between Business (rules), Repository (persistence), Validação (validation) and JMS (notifications) follows SRP consistently across all modules.',
    reweExample: 'In a logistics system: OrderValidator, RouteCalculator, InventoryReserver and DispatchNotifier each handle one responsibility within the order fulfillment flow.',
    keyPoints: [
      'Pick ONE principle and go deep — do not list all five',
      'Show a real before/after scenario',
      'Explain what "one reason to change" means in practice',
      'SRP does not mean one method per class',
      'Mention the trade-off (more files, distributed flow)'
    ],
    mistakesToAvoid: [
      'Listing all five SOLID principles without depth',
      'Giving a textbook definition without a real example',
      'Saying SRP means one function per class',
      'Not mentioning any trade-off or nuance'
    ],
    followUps: [
      { question: 'How do you know when a class has too many responsibilities?', answerHint: 'When it changes for multiple unrelated reasons. When the class description requires "and". When tests require mocking unrelated dependencies.' },
      { question: 'Can SOLID lead to overengineering?', answerHint: 'Yes. Applying all principles maximally creates many tiny classes. I apply them when the cost of NOT applying them (rigidity, fragility) exceeds the cost of additional abstraction.' },
      { question: 'Which SOLID principle do you find hardest to apply?', answerHint: 'Open/Closed is hardest — predicting where extension will be needed requires experience. I introduce extension points where variability already exists, not speculatively.' }
    ],
    vocabulary: [
      { term: 'reason to change', meaning: 'motivo pelo qual o código precisaria ser modificado', example: 'Each class should have only one reason to change — one business capability it owns.' },
      { term: 'orchestrator', meaning: 'classe que coordena chamadas entre componentes', example: 'The main service became an orchestrator delegating to focused components.' },
      { term: 'cohesion', meaning: 'grau em que elementos de um módulo pertencem juntos', example: 'High cohesion means all methods in a class serve the same purpose.' }
    ],
    selfEvaluation: [
      { criterion: 'I chose one principle and explained it deeply', weight: 3 },
      { criterion: 'I gave a real before/after example', weight: 3 },
      { criterion: 'I explained what "reason to change" means', weight: 2 },
      { criterion: 'I mentioned a nuance or trade-off', weight: 2 }
    ]
  },

  // ============================================================
  // QUESTION 5: Difference between abstraction and encapsulation
  // ============================================================
  {
    id: 'oop-compare-01',
    topic: 'OOP & SOLID',
    subtopic: 'Abstraction',
    difficulty: 'INTERMEDIATE',
    question: 'What is the difference between abstraction and encapsulation?',
    interviewerIntent: 'Test whether the candidate can distinguish two commonly confused concepts and explain each with a practical example.',
    shortAnswer: 'Abstraction hides complexity by exposing only relevant operations through a contract. Encapsulation protects internal state by restricting direct access and controlling modifications through domain methods. Abstraction is about what you expose; encapsulation is about what you protect.',
    modelAnswer: `Context: These two concepts overlap but serve different purposes.

Abstraction is about defining WHAT an object does without revealing HOW. An interface like EnrollmentRepository exposes findById() and save() — the client does not know if the data comes from JPA, a REST API or an in-memory map.

Encapsulation is about protecting the internal state of an object and ensuring only valid modifications happen. An Enrollment entity with confirm() and cancel() methods prevents direct status manipulation.

Practical distinction: Abstraction helps you design boundaries between components. Encapsulation helps you design the integrity of a single component.

Example combining both: A RepositoryInterface (abstraction) hides the persistence mechanism. Inside the JPA implementation, the entity uses private fields with domain methods (encapsulation) to protect its state.

Trade-off: Over-abstracting creates unnecessary indirection. Over-encapsulating creates rigid objects that are hard to use in legitimate scenarios like testing or data migration.`,
    senaiExample: 'The Repository interface (abstraction) hides whether data comes from JPA or native SQL. The Matricula entity (encapsulation) protects enrollment state with domain methods instead of public setters.',
    reweExample: 'A DeliveryService interface abstracts the delivery mechanism (own fleet vs third-party). A Shipment entity encapsulates its tracking state, allowing only valid transitions like markDispatched() or markDelivered().',
    keyPoints: [
      'Abstraction = what you expose (contract, interface)',
      'Encapsulation = what you protect (state, invariants)',
      'They complement each other but solve different problems',
      'Abstraction operates at component boundaries',
      'Encapsulation operates within a single component'
    ],
    mistakesToAvoid: [
      'Saying they are the same thing',
      'Defining only one and ignoring the other',
      'Giving only theoretical definitions without code',
      'Confusing abstraction with abstract classes specifically'
    ],
    followUps: [
      { question: 'Can you have encapsulation without abstraction?', answerHint: 'Yes. A concrete class with private fields and domain methods is encapsulated without being abstract. Not every class needs an interface.' },
      { question: 'When is an interface not providing real abstraction?', answerHint: 'When there is only one implementation and no realistic possibility of another. A leaky abstraction also fails — when you need to know the implementation to use it correctly.' },
      { question: 'Is using an interface always abstraction?', answerHint: 'No. An interface that mirrors one concrete class exactly provides no meaningful abstraction. True abstraction hides a decision or a variation.' }
    ],
    vocabulary: [
      { term: 'contract', meaning: 'acordo formal sobre o que um componente faz', example: 'The interface defines a contract — clients depend on what it promises, not how it works.' },
      { term: 'boundary', meaning: 'limite entre componentes ou camadas', example: 'Abstraction helps define clear boundaries between business logic and infrastructure.' },
      { term: 'leaky abstraction', meaning: 'abstração que expõe detalhes de implementação', example: 'A leaky abstraction forces clients to understand internal behavior to use it correctly.' }
    ],
    selfEvaluation: [
      { criterion: 'I clearly distinguished the two concepts', weight: 3 },
      { criterion: 'I gave a practical example for each', weight: 3 },
      { criterion: 'I explained how they complement each other', weight: 2 },
      { criterion: 'I mentioned when each can be over-applied', weight: 2 }
    ]
  }
];

// ============================================================
// ASSOCIATED EXERCISES (Code, Design Decision, Comparison)
// ============================================================
const oopExercises = [

  // --- Exercises for Question 1: Encapsulation ---
  {
    id: 'ex-encap-code-01',
    questionRef: 'oop-encapsulation-01',
    type: 'CODE_REFACTOR',
    difficulty: 'INTERMEDIATE',
    mission: 'This entity has a <strong>public setter</strong> that allows invalid state transitions. Identify the problem.',
    code: `public class Enrollment {
    private EnrollmentStatus status;

    public void setStatus(EnrollmentStatus status) {
        this.status = status; // Any status, any time!
    }
}

// Caller can do:
enrollment.setStatus(COMPLETED);
enrollment.setStatus(PENDING); // After completed?!`,
    problemsToIdentify: [
      'No validation of allowed transitions',
      'Any caller can set any status',
      'Business rules scattered in calling code',
      'Invalid states are possible'
    ],
    refactoredCode: `public class Enrollment {
    private EnrollmentStatus status = EnrollmentStatus.PENDING;

    public void confirm() {
        if (status != EnrollmentStatus.PENDING) {
            throw new IllegalStateException("Only pending enrollments can be confirmed");
        }
        this.status = EnrollmentStatus.CONFIRMED;
    }

    public void cancel(String reason) {
        if (status == EnrollmentStatus.COMPLETED) {
            throw new IllegalStateException("Completed enrollments cannot be cancelled");
        }
        this.status = EnrollmentStatus.CANCELLED;
    }
}`,
    explain: 'Domain methods replace the generic setter. Each method names a business operation and validates whether the transition is allowed. Invalid states become impossible.'
  },
  {
    id: 'ex-encap-design-01',
    questionRef: 'oop-encapsulation-01',
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    mission: 'A <strong>Delivery</strong> entity has statuses: CREATED → DISPATCHED → IN_TRANSIT → DELIVERED / RETURNED. How would you model state changes?',
    options: [
      { id: 'a', label: 'Public setStatus() with external validation', desc: 'A separate validator checks if the transition is allowed before calling setStatus().' },
      { id: 'b', label: 'Domain methods on the entity', desc: 'Methods like dispatch(), markInTransit(), deliver() validate internally.' },
      { id: 'c', label: 'State Machine pattern', desc: 'A separate StateMachine object manages transitions and fires events.' }
    ],
    bestChoice: 'b',
    explanation: {
      a: { pros: ['Simple entity', 'Validation reusable'], cons: ['Setter can be called without validator', 'Rules far from state', 'Easy to bypass'], verdict: 'Weak encapsulation — the entity cannot protect itself.' },
      b: { pros: ['Entity controls its own state', 'Clear domain language', 'Impossible to bypass', 'Easy to test'], cons: ['Entity grows with complex rules', 'Not ideal if transitions need external data'], verdict: 'Best for most cases. Keeps invariants close to state.' },
      c: { pros: ['Handles complex workflows', 'Fires events', 'Configurable'], cons: ['Overkill for simple models', 'More infrastructure', 'State split between entity and machine'], verdict: 'Good for complex workflows with many states and side effects. Overkill for 4-5 states.' }
    },
    nuance: 'Option B is usually best for domain entities with clear state transitions. Option C becomes justified when the workflow is complex (10+ states, conditional transitions, event-driven). Option A is rarely the best choice because it cannot prevent misuse.'
  },
  {
    id: 'ex-encap-compare-01',
    questionRef: 'oop-encapsulation-01',
    type: 'COMPARE_CONCEPTS',
    difficulty: 'INTERMEDIATE',
    mission: 'Compare: <strong>Encapsulation</strong> vs <strong>Data Hiding</strong>',
    conceptA: { name: 'Encapsulation', definition: 'Protecting object integrity by controlling access to state AND behavior. Exposing meaningful operations instead of raw data manipulation.' },
    conceptB: { name: 'Data Hiding', definition: 'Making fields private. A necessary technique but not sufficient for true encapsulation.' },
    keyDifference: 'Data hiding is a mechanism (private fields). Encapsulation is a design principle (protecting invariants through domain operations).',
    javaExample: 'A class with private fields but public getters AND setters for everything is using data hiding but NOT encapsulation. True encapsulation exposes operations like confirm() instead of setStatus().',
    interviewAnswer: 'Data hiding is making fields private, which is necessary but not sufficient. Real encapsulation means the object controls which operations are valid and prevents invalid states from existing.'
  },

  // --- Exercises for Question 2: Polymorphism ---
  {
    id: 'ex-poly-code-01',
    questionRef: 'oop-polymorphism-01',
    type: 'CODE_REFACTOR',
    difficulty: 'INTERMEDIATE',
    mission: 'Refactor this <strong>growing conditional</strong> using polymorphism.',
    code: `public class NotificationService {
    public void send(Notification notification) {
        if (notification.getChannel() == Channel.EMAIL) {
            // 30 lines of email logic
            sendEmail(notification);
        } else if (notification.getChannel() == Channel.SMS) {
            // 25 lines of SMS logic
            sendSms(notification);
        } else if (notification.getChannel() == Channel.PUSH) {
            // 20 lines of push logic
            sendPush(notification);
        }
        // What happens when WEBHOOK is added?
    }
}`,
    problemsToIdentify: [
      'Violates Open/Closed Principle — must modify to add channels',
      'Single class knows all channel details',
      'Testing requires testing all branches together',
      'Growing complexity with each new channel'
    ],
    refactoredCode: `public interface NotificationSender {
    Channel supportedChannel();
    void send(Notification notification);
}

@ApplicationScoped
public class EmailNotificationSender implements NotificationSender {
    public Channel supportedChannel() { return Channel.EMAIL; }
    public void send(Notification notification) { /* email logic */ }
}

@ApplicationScoped
public class NotificationService {
    private final Map<Channel, NotificationSender> senders;

    @Inject
    public NotificationService(List<NotificationSender> senders) {
        this.senders = senders.stream()
            .collect(Collectors.toMap(NotificationSender::supportedChannel, Function.identity()));
    }

    public void send(Notification notification) {
        NotificationSender sender = senders.get(notification.getChannel());
        if (sender == null) throw new UnsupportedOperationException("No sender for: " + notification.getChannel());
        sender.send(notification);
    }
}`,
    explain: 'Each channel is an independent implementation. Adding WEBHOOK means creating one new class — zero changes to existing code. Each sender is testable independently.'
  },
  {
    id: 'ex-poly-design-01',
    questionRef: 'oop-polymorphism-01',
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    mission: 'You have <strong>3 delivery pricing strategies</strong>: standard, express, same-day. How would you implement them?',
    options: [
      { id: 'a', label: 'Switch statement in one method', desc: 'A single calculatePrice() method with a switch on delivery type.' },
      { id: 'b', label: 'Strategy pattern with interface', desc: 'Each pricing strategy implements PricingStrategy with its own calculate() method.' },
      { id: 'c', label: 'Enum with abstract method', desc: 'DeliveryType enum where each constant implements an abstract calculatePrice() method.' }
    ],
    bestChoice: 'b',
    explanation: {
      a: { pros: ['Simple for 3 cases', 'All logic in one place', 'Easy to read'], cons: ['Must modify to add types', 'Pricing logic mixed with dispatch logic', 'Hard to test one strategy alone'], verdict: 'Acceptable if strategies are trivial (one-liner calculations) and unlikely to grow.' },
      b: { pros: ['Each strategy testable independently', 'New strategies without modifying existing', 'Can inject dependencies per strategy', 'Follows OCP'], cons: ['More classes', 'Need a way to select strategy'], verdict: 'Best when strategies have complex logic, different dependencies, or the set grows over time.' },
      c: { pros: ['Compact', 'Type-safe', 'No extra classes'], cons: ['Cannot inject dependencies', 'All logic in one file', 'Enum grows large if logic is complex'], verdict: 'Good for simple calculations without dependencies. Breaks down when strategies need database access or external services.' }
    },
    nuance: 'There is no universally correct answer. For 3 simple pricing formulas (multiply by factor), an enum or switch is fine. For strategies with different dependencies, validation rules, and complex calculations, the Strategy pattern pays off.'
  },

  // --- Exercises for Question 3: Composition ---
  {
    id: 'ex-comp-code-01',
    questionRef: 'oop-composition-01',
    type: 'CODE_REFACTOR',
    difficulty: 'INTERMEDIATE',
    mission: 'This code uses <strong>inheritance for code reuse</strong>. Refactor to composition.',
    code: `public abstract class BaseBusinessService {
    @Inject protected EntityManager em;
    @Inject protected NotificationService notifier;
    @Inject protected AuditService audit;

    protected <T> T find(Class<T> type, Long id) {
        return em.find(type, id);
    }
    protected void notify(String msg) {
        notifier.send(msg);
    }
    protected void auditLog(String action) {
        audit.log(action);
    }
}

public class EnrollmentService extends BaseBusinessService {
    public void enroll(Long studentId) {
        Student s = find(Student.class, studentId);
        // enrollment logic...
        notify("Enrolled: " + s.getName());
        auditLog("ENROLLMENT");
    }
}`,
    problemsToIdentify: [
      'Inheritance used solely for code reuse, not is-a relationship',
      'All services get dependencies they may not need',
      'Base class changes affect all 40+ subclasses',
      'Testing requires setting up all inherited dependencies'
    ],
    refactoredCode: `@ApplicationScoped
public class EnrollmentService {
    @Inject private EnrollmentRepository repository;
    @Inject private NotificationService notifier;

    public void enroll(Long studentId) {
        Student s = repository.findById(studentId)
            .orElseThrow(() -> new NotFoundException("Student not found"));
        // enrollment logic...
        notifier.send("Enrolled: " + s.getName());
    }
}`,
    explain: 'The service declares only what it needs. No base class coupling. Each dependency is mockable independently. If EnrollmentService does not need audit, it simply does not inject it.'
  },
  {
    id: 'ex-comp-compare-01',
    questionRef: 'oop-composition-01',
    type: 'COMPARE_CONCEPTS',
    difficulty: 'INTERMEDIATE',
    mission: 'Compare: <strong>Inheritance</strong> vs <strong>Composition</strong>',
    conceptA: { name: 'Inheritance', definition: 'A subclass extends a parent class, acquiring its behavior and state. Represents an is-a relationship.' },
    conceptB: { name: 'Composition', definition: 'A class contains references to other objects and delegates behavior to them. Represents a has-a relationship.' },
    keyDifference: 'Inheritance creates a compile-time rigid hierarchy. Composition creates runtime-flexible assemblies of independent components.',
    javaExample: 'Inheritance: EnrollmentService extends BaseService (gets everything, even what it does not need). Composition: EnrollmentService injects only Repository and Validator (gets exactly what it needs).',
    interviewAnswer: 'I prefer composition because it allows each service to depend only on what it actually needs, components can be replaced independently, and testing is straightforward. I use inheritance only for stable is-a relationships like exception hierarchies or document base types.'
  },

  // --- Exercises for Question 4: SOLID ---
  {
    id: 'ex-solid-code-01',
    questionRef: 'oop-solid-01',
    type: 'CODE_REFACTOR',
    difficulty: 'INTERMEDIATE',
    mission: 'This class has <strong>multiple responsibilities</strong>. Identify them.',
    code: `public class OrderService {
    public void processOrder(Order order) {
        // Validate
        if (order.getItems().isEmpty()) throw new ValidationException("No items");
        if (order.getTotal().compareTo(BigDecimal.ZERO) <= 0) throw new ValidationException("Invalid total");

        // Persist
        entityManager.persist(order);

        // Generate invoice PDF
        byte[] pdf = generateInvoicePdf(order);
        fileService.store("invoices/" + order.getId() + ".pdf", pdf);

        // Send notification
        emailService.send(order.getCustomerEmail(), "Order confirmed", buildEmailBody(order));

        // Update inventory
        for (OrderItem item : order.getItems()) {
            inventoryService.decreaseStock(item.getProductId(), item.getQuantity());
        }
    }
}`,
    problemsToIdentify: [
      'Validation logic mixed with processing',
      'PDF generation — different reason to change',
      'Email sending — different reason to change',
      'Inventory update — different domain concern',
      'Testing requires mocking everything together'
    ],
    refactoredCode: `// Each responsibility in its own component:
@ApplicationScoped public class OrderValidator { void validate(Order order) {...} }
@ApplicationScoped public class OrderRepository { void save(Order order) {...} }
@ApplicationScoped public class InvoiceGenerator { void generate(Order order) {...} }
@ApplicationScoped public class OrderNotifier { void notifyCustomer(Order order) {...} }
@ApplicationScoped public class InventoryReserver { void reserve(Order order) {...} }

// Orchestrator:
@ApplicationScoped
public class OrderService {
    @Inject OrderValidator validator;
    @Inject OrderRepository repository;
    @Inject InvoiceGenerator invoices;
    @Inject OrderNotifier notifier;
    @Inject InventoryReserver inventory;

    public void processOrder(Order order) {
        validator.validate(order);
        repository.save(order);
        invoices.generate(order);
        notifier.notifyCustomer(order);
        inventory.reserve(order);
    }
}`,
    explain: 'The service becomes a thin orchestrator. Each component changes for one reason only. Testing each is trivial. The invoice format can change without touching validation logic.'
  },

  // --- Exercises for Question 5: Abstraction vs Encapsulation ---
  {
    id: 'ex-abstract-design-01',
    questionRef: 'oop-compare-01',
    type: 'DESIGN_DECISION',
    difficulty: 'INTERMEDIATE',
    mission: 'A service needs to send delivery updates. Should you create an <strong>interface</strong> (abstraction) for the sender?',
    options: [
      { id: 'a', label: 'No interface — use concrete class directly', desc: 'The service calls KafkaDeliveryPublisher directly.' },
      { id: 'b', label: 'Interface with one current implementation', desc: 'DeliveryUpdateSender interface, with KafkaDeliveryPublisher as the only current impl.' },
      { id: 'c', label: 'Interface only when a second implementation exists', desc: 'Start concrete, extract interface later when needed.' }
    ],
    bestChoice: 'b',
    explanation: {
      a: { pros: ['Fewer files', 'Direct and obvious'], cons: ['Business service coupled to Kafka', 'Hard to test without Kafka', 'Changing messaging tech requires modifying business code'], verdict: 'Problematic when the infrastructure detail (Kafka) might change or when you need to test without it.' },
      b: { pros: ['Business code decoupled from infrastructure', 'Easy to mock in tests', 'Can swap Kafka for RabbitMQ without touching business', 'Clear boundary'], cons: ['Extra interface file', 'Might never have a second implementation'], verdict: 'Usually correct for infrastructure boundaries. The abstraction exists to separate concerns, not to predict multiple implementations.' },
      c: { pros: ['Pragmatic', 'No speculative design'], cons: ['Requires refactoring later', 'Tests coupled to infrastructure meanwhile'], verdict: 'Acceptable for internal helper classes. Risky for infrastructure boundaries where testing matters from day one.' }
    },
    nuance: 'Interfaces at infrastructure boundaries (DB, messaging, external APIs) are almost always worthwhile — they enable testing and isolate change. For internal business classes that call each other, interfaces are often unnecessary overhead.'
  }
];
