/**
 * Unit 1 — Encapsulation (10 exercises)
 */
const encapsulationExercises = [

  // 1. ORAL_ANSWER — What is encapsulation beyond private fields?
  {
    id: 'encap-oral-01',
    type: 'ORAL_ANSWER',
    subtopic: 'Encapsulation',
    difficulty: 'SENIOR',
    question: 'What is encapsulation beyond private fields?',
    interviewerIntent: 'Assess whether the candidate understands encapsulation as protecting business invariants, not just hiding data.',
    shortAnswer: 'Encapsulation means protecting the valid state of an object by exposing domain operations instead of unrestricted setters. The object controls which state transitions are allowed and prevents invalid combinations from existing.',
    modelAnswer: `Context: In our education management system, an enrollment entity could move through statuses like PENDING, CONFIRMED, CANCELLED and COMPLETED.

Problem: Originally, the entity had a public setStatus() method. Any service could set any status at any time, leading to invalid transitions — for example, cancelling an already-completed enrollment.

Decision: I removed the setter and introduced domain methods like confirm(), cancel(reason) and complete(). Each method validated whether the transition was allowed from the current state before changing it.

Result: Invalid state transitions became impossible. Validation was centralized inside the entity rather than scattered across multiple services. Bugs related to inconsistent enrollment states dropped significantly.

Trade-off: The entity became slightly more complex, and some batch operations required additional consideration. But the consistency guarantee was worth it for a domain with strict business rules.`,
    senaiExample: 'In the SGN3 enrollment system, Matricula entities controlled their own status transitions. Instead of allowing any Business class to call setStatus(), the entity exposed confirm() and cancel(reason) methods that validated the transition rules internally.',
    reweExample: 'A delivery order in a logistics system — an Order entity with methods like dispatch(), markInTransit(), deliver() and returnToWarehouse(), each validating that the current state allows the transition.',
    keyPoints: ['Encapsulation protects invariants, not just hides fields', 'Domain methods express business operations', 'Invalid states should be impossible', 'Validation lives close to the state it protects'],
    mistakesToAvoid: ['Saying encapsulation is just making fields private', 'Not giving a real example', 'Confusing it with data hiding only'],
    followUps: [
      { question: 'Would you always put validation inside the entity?', answerHint: 'When validation depends only on the entity own state, yes. When it requires external data (DB query, other services), use a domain service or validator.' },
      { question: 'Is this compatible with JPA?', answerHint: 'Yes. JPA uses field access or property access. You can have private fields with no setter and JPA still persists via reflection.' },
      { question: 'How do you test these transitions?', answerHint: 'Unit tests for each valid and invalid transition. No mocks needed — just instantiate, set initial state, call method, assert result or exception.' }
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

  // 2. CODE_REFACTOR — Anemic entity with setters
  {
    id: 'encap-refactor-01',
    type: 'CODE_REFACTOR',
    subtopic: 'Encapsulation',
    difficulty: 'INTERMEDIATE',
    mission: 'This <strong>Delivery</strong> entity allows any caller to set any status. Refactor it to protect its invariants.',
    code: `public class Delivery {
    private DeliveryStatus status;
    private LocalDateTime dispatchedAt;
    private LocalDateTime deliveredAt;

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }
    public void setDispatchedAt(LocalDateTime dt) {
        this.dispatchedAt = dt;
    }
    public void setDeliveredAt(LocalDateTime dt) {
        this.deliveredAt = dt;
    }
}

// Anyone can do:
delivery.setStatus(DELIVERED);
delivery.setDeliveredAt(null); // Delivered without a date?!`,
    problemsToIdentify: [
      'Status can be set to any value without validation',
      'Timestamps can be inconsistent with status (delivered without date)',
      'No enforcement of valid transition order',
      'Business rules scattered in callers'
    ],
    refactoredCode: `public class Delivery {
    private DeliveryStatus status = DeliveryStatus.CREATED;
    private LocalDateTime dispatchedAt;
    private LocalDateTime deliveredAt;

    public void dispatch() {
        if (status != DeliveryStatus.CREATED) {
            throw new IllegalStateException("Can only dispatch a CREATED delivery");
        }
        this.status = DeliveryStatus.DISPATCHED;
        this.dispatchedAt = LocalDateTime.now();
    }

    public void deliver() {
        if (status != DeliveryStatus.IN_TRANSIT) {
            throw new IllegalStateException("Can only deliver an IN_TRANSIT delivery");
        }
        this.status = DeliveryStatus.DELIVERED;
        this.deliveredAt = LocalDateTime.now();
    }

    public DeliveryStatus getStatus() { return status; }
    public Optional<LocalDateTime> getDeliveredAt() { return Optional.ofNullable(deliveredAt); }
}`,
    explain: 'Each domain method validates the precondition, sets the status AND the associated timestamp atomically. You cannot have DELIVERED without a deliveredAt. The state is always consistent.'
  },

  // 3. DESIGN_DECISION — How to model state changes
  {
    id: 'encap-design-01',
    type: 'DESIGN_DECISION',
    subtopic: 'Encapsulation',
    difficulty: 'SENIOR',
    mission: 'A <strong>Shipment</strong> has 6 possible statuses with conditional transitions. How do you model it?',
    options: [
      { id: 'a', label: 'Setter + external validator', desc: 'ShipmentValidator.validate(from, to) called before setStatus().' },
      { id: 'b', label: 'Domain methods on entity', desc: 'dispatch(), loadOnTruck(), deliver() — each validates internally.' },
      { id: 'c', label: 'State Machine with event handlers', desc: 'StateMachine<ShipmentState, ShipmentEvent> with explicit transitions and side-effects.' }
    ],
    bestChoice: 'b',
    explanation: {
      a: { pros: ['Simple entity', 'Validator reusable'], cons: ['Bypass risk — setter callable without validator', 'Rules far from state'], verdict: 'Weak encapsulation. Cannot guarantee consistency.' },
      b: { pros: ['Entity self-protecting', 'Clear domain language', 'Easy to test', 'Impossible to bypass'], cons: ['Entity grows with many states', 'Hard if transitions need external data'], verdict: 'Best for 4-8 states with clear business operations.' },
      c: { pros: ['Handles 10+ states cleanly', 'Event-driven side effects', 'Visual diagram maps to code'], cons: ['Heavy infrastructure', 'State split across objects', 'Overkill for simple flows'], verdict: 'Justified for complex workflows (order fulfillment with 12+ states, conditional paths, retries).' }
    },
    nuance: 'Start with Option B. Move to C only when the entity methods become a tangled mess of conditionals — usually around 10+ states with conditional paths.'
  },

  // 4. COMPARE_CONCEPTS — Encapsulation vs Data Hiding
  {
    id: 'encap-compare-01',
    type: 'COMPARE_CONCEPTS',
    subtopic: 'Encapsulation',
    difficulty: 'INTERMEDIATE',
    mission: 'Compare: <strong>Encapsulation</strong> vs <strong>Data Hiding</strong>',
    conceptA: { name: 'Encapsulation', definition: 'Protecting object integrity by controlling access to state AND behavior. Exposing meaningful operations instead of raw data manipulation.' },
    conceptB: { name: 'Data Hiding', definition: 'Making fields private. A necessary technique but not sufficient for true encapsulation.' },
    keyDifference: 'Data hiding is a mechanism (private fields). Encapsulation is a design principle (protecting invariants through domain operations).',
    javaExample: 'A class with private fields but public getters AND setters for everything is using data hiding but NOT encapsulation. True encapsulation exposes operations like confirm() instead of setStatus().',
    interviewAnswer: 'Data hiding is making fields private — necessary but not sufficient. Real encapsulation means the object controls which operations are valid and prevents invalid states from existing.'
  },

  // 5. FOLLOW_UP — Deep dive on encapsulation
  {
    id: 'encap-followup-01',
    type: 'FOLLOW_UP',
    subtopic: 'Encapsulation',
    difficulty: 'SENIOR',
    scenario: 'The interviewer asks about encapsulation and keeps digging deeper.',
    questions: [
      { q: 'What is encapsulation?', hint: 'Start with protecting invariants, not just private fields.' },
      { q: 'Can you give a real example?', hint: 'Use enrollment/delivery status transitions.' },
      { q: 'What if the validation needs data from the database?', hint: 'Domain service or validator as collaborator. Entity handles what it owns; external checks go outside.' },
      { q: 'Are getters and setters an example of encapsulation?', hint: 'No — they expose raw state. True encapsulation exposes behavior (confirm, cancel) not data (getStatus, setStatus).' },
      { q: 'How do you handle this with JPA entities?', hint: 'JPA accesses fields via reflection. No setter needed. Domain methods work alongside JPA lifecycle.' },
      { q: 'What about DTOs — should they be encapsulated too?', hint: 'DTOs are data carriers, not domain objects. Getters/setters are fine for DTOs. Encapsulation applies to objects with behavior and invariants.' }
    ]
  },

  // 6. REAL_EXPERIENCE — Associate encapsulation to SENAI work
  {
    id: 'encap-experience-01',
    type: 'REAL_EXPERIENCE',
    subtopic: 'Encapsulation',
    difficulty: 'SENIOR',
    prompt: 'Think about a business entity from your experience that had status transitions. How did encapsulation (or lack of it) affect the system?',
    guidingQuestions: [
      'What entity had multiple statuses?',
      'Who was allowed to change the status?',
      'What happened when invalid transitions occurred?',
      'How was it fixed (or how would you fix it)?'
    ],
    exampleStory: `At SENAI, the Matricula (enrollment) entity moved through PENDING → CONFIRMED → ACTIVE → COMPLETED or CANCELLED. Originally any service could call setStatus() directly. A bug allowed cancelling already-completed enrollments, which invalidated issued certificates. The fix was domain methods with precondition checks: cancel() threw an exception if status was COMPLETED. This centralized the rule and made the bug impossible to reproduce.`,
    buildingBlocks: ['Entity name and domain', 'Status values', 'Who changed it incorrectly', 'What went wrong', 'How encapsulation fixed it', 'Measurable result']
  },

  // 7. PREDICT_OUTPUT — Understanding method behavior
  {
    id: 'encap-predict-01',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Encapsulation',
    difficulty: 'BASIC',
    mission: 'What happens when this code runs?',
    code: `Delivery d = new Delivery(); // status = CREATED
d.deliver(); // Calling deliver on a CREATED delivery`,
    choices: ['Status becomes DELIVERED', 'IllegalStateException', 'NullPointerException', 'Compiles but does nothing'],
    answer: 'IllegalStateException',
    explain: 'The deliver() method checks that status is IN_TRANSIT. Since it is CREATED, the precondition fails and an exception is thrown. This IS encapsulation — the object protects itself from invalid transitions.'
  },

  // 8. FILL_BLANK — Recognize the encapsulation pattern
  {
    id: 'encap-fill-01',
    type: 'FILL_BLANK',
    subtopic: 'Encapsulation',
    difficulty: 'BASIC',
    mission: 'Complete the method that <strong>protects the invariant</strong>: an order total cannot be negative.',
    code: 'public void applyDiscount(BigDecimal discount) {\n    BigDecimal newTotal = this.total.subtract(discount);\n    if (newTotal.compareTo(BigDecimal.ZERO) _____ 0) {\n        throw new IllegalArgumentException("Discount exceeds total");\n    }\n    this.total = newTotal;\n}',
    blank: '_____',
    choices: ['<', '>', '==', '<='],
    answer: '<',
    explain: 'If newTotal is less than zero, the invariant is violated. The method PROTECTS the object by rejecting the operation. This is encapsulation — not just hiding the field, but ensuring it always holds a valid value.'
  },

  // 9. PICK_INVALID — Identify weak encapsulation
  {
    id: 'encap-pick-01',
    type: 'PICK_INVALID',
    subtopic: 'Encapsulation',
    difficulty: 'INTERMEDIATE',
    mission: 'Which class has the <strong>weakest encapsulation</strong>?',
    snippets: [
      { id: 'a', code: 'class Account {\n  private BigDecimal balance;\n  public void deposit(BigDecimal amt) {\n    if (amt.signum() <= 0) throw ...;\n    balance = balance.add(amt);\n  }\n}', valid: true },
      { id: 'b', code: 'class Account {\n  private BigDecimal balance;\n  public BigDecimal getBalance() { return balance; }\n  public void setBalance(BigDecimal b) { this.balance = b; }\n}', valid: false },
      { id: 'c', code: 'class Account {\n  private BigDecimal balance = BigDecimal.ZERO;\n  public void withdraw(BigDecimal amt) {\n    if (amt.compareTo(balance) > 0) throw ...;\n    balance = balance.subtract(amt);\n  }\n}', valid: true }
    ],
    answer: 'b',
    explain: 'Option B has a public setBalance() — any caller can set any value, including negative. The field is private but the encapsulation is meaningless. Options A and C protect their invariants through domain operations.'
  },

  // 10. ORAL_ANSWER — Are getters/setters encapsulation?
  {
    id: 'encap-oral-02',
    type: 'ORAL_ANSWER',
    subtopic: 'Encapsulation',
    difficulty: 'INTERMEDIATE',
    question: 'Are getters and setters an example of encapsulation?',
    interviewerIntent: 'Test if the candidate can distinguish mechanical data hiding from meaningful encapsulation.',
    shortAnswer: 'Getters and setters alone are not encapsulation — they just add a method layer over a public field. True encapsulation means the object exposes domain operations that enforce business rules, not raw access to its state.',
    modelAnswer: `Context: Many Java codebases use getters and setters on every field by default, often generated by IDE or Lombok.

Problem: A class with private fields and public get/set for every property offers no more protection than public fields. Any caller can put the object in an invalid state.

Decision: I distinguish between DTOs (data carriers where get/set is fine) and domain entities (where behavior and invariants matter). For domain objects, I expose operations like enroll(), cancel(), applyDiscount() instead of setStatus(), setTotal().

Result: Domain objects become self-validating. Invalid states are prevented at the source rather than checked scattered across calling code.

Trade-off: Some frameworks (serialization, form binding) expect getters/setters. For those integration points, we use DTOs as a translation layer between the framework world and the domain world.`,
    senaiExample: 'JPA entities in SGN3 often have getters for read access but domain methods for writes. The WebBean uses DTOs with getters/setters for form binding, then calls entity domain methods.',
    reweExample: 'A Parcel entity with getParcelId() (read) but no setStatus() — instead markScanned(), markLoaded(), markDelivered() methods.',
    keyPoints: ['Getters/setters = data hiding, not encapsulation', 'Domain objects need domain operations', 'DTOs with get/set are fine for data transfer', 'Separate domain model from integration layer'],
    mistakesToAvoid: ['Saying yes without nuance', 'Saying all getters are always bad', 'Not distinguishing DTOs from domain objects'],
    followUps: [
      { question: 'When are setters acceptable?', answerHint: 'DTOs, form-binding objects, builders, configuration objects. Not on entities with business invariants.' },
      { question: 'How does Lombok @Data fit into this?', answerHint: '@Data generates everything including setters. Fine for DTOs, dangerous for domain entities. Use @Getter only on entities if needed.' },
      { question: 'What about immutable objects?', answerHint: 'Immutable objects are the strongest form of encapsulation — state cannot change at all after construction. Good for value objects (Money, Address).' }
    ],
    vocabulary: [
      { term: 'anemic domain model', meaning: 'modelo onde entidades são apenas containers de dados sem comportamento', example: 'An entity with only getters and setters is an anemic domain model — all logic lives in services.' },
      { term: 'value object', meaning: 'objeto imutável definido por seus atributos, sem identidade', example: 'Money and Address are value objects — immutable, compared by value, not by identity.' }
    ],
    selfEvaluation: [
      { criterion: 'I distinguished getters/setters from true encapsulation', weight: 3 },
      { criterion: 'I separated DTOs from domain entities', weight: 3 },
      { criterion: 'I gave a concrete example', weight: 2 },
      { criterion: 'I acknowledged when setters are acceptable', weight: 2 }
    ]
  }
];
