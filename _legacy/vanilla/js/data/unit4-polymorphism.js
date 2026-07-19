/**
 * Unit 4 — Polymorphism (15 exercises)
 */
const polymorphismExercises = [

  // 1. ORAL_ANSWER — Where did you use polymorphism?
  {
    id: 'poly-oral-01',
    type: 'ORAL_ANSWER',
    subtopic: 'Polymorphism',
    difficulty: 'SENIOR',
    question: 'Where did you use polymorphism in a real project?',
    interviewerIntent: 'Evaluate whether the candidate can connect polymorphism to an actual design decision with measurable benefit.',
    shortAnswer: 'I used polymorphism in a document generation flow where certificates, declarations and attendance reports each implemented a common DocumentGenerator interface. The business service selected the correct implementation at runtime without conditional logic.',
    modelAnswer: `Context: Our education system generated several types of documents — certificates, declarations, attendance reports and transcripts. Each had different content, layout and validation rules.

Problem: The original implementation was a single method with a growing if/else chain based on document type. Adding a new document type meant modifying this method, risking regressions in existing types.

Decision: I introduced a DocumentGenerator interface with a supportedType() method and a generate() method. Each document type got its own implementation. The orchestrating service collected all implementations via CDI injection and selected the correct one at runtime.

Result: New document types could be added by creating a single class implementing the interface — no modification to the main flow. Each implementation was tested independently. The if/else chain of 300+ lines disappeared.

Trade-off: More classes and understanding the service-locator pattern. For a system with only two document types, a switch might be simpler. With 6+ types and growing, polymorphism was clearly justified.`,
    senaiExample: 'SGN3 generates certificates, declarations, attendance and grade reports. Each document type implements DocumentGenerator with its own data-fetching, layout and validation. Adding diploma generation required only one new class.',
    reweExample: 'Notification channels (email, SMS, push, webhook), shipment processing strategies (standard, express, same-day), or invoice generation for different delivery types — each strategy behind a common interface.',
    keyPoints: ['Start with the problem (growing conditional)', 'Explain the common contract', 'Show how new types are added without changing existing code', 'Mention extensibility and testability', 'Acknowledge when simpler solutions would suffice'],
    mistakesToAvoid: ['Only defining polymorphism', 'Using Animal/Dog/Cat as main example', 'Claiming if/else is always wrong', 'Not mentioning a concrete result'],
    followUps: [
      { question: 'How did the service select the correct implementation?', answerHint: 'CDI injected a List. Service built a Map<Type, Generator> at startup. O(1) lookup by type.' },
      { question: 'What if a type had no implementation?', answerHint: 'Throw clear UnsupportedOperationException. Or a fallback/default implementation.' },
      { question: 'Would a switch expression be simpler?', answerHint: 'For 2-3 stable types with trivial logic, yes. For 6+ types with complex independent logic, separate classes are cleaner.' }
    ],
    vocabulary: [
      { term: 'runtime dispatch', meaning: 'JVM decide qual implementação chamar em tempo de execução', example: 'The JVM performs runtime dispatch — the actual object type determines which method runs.' },
      { term: 'extensibility', meaning: 'capacidade de adicionar comportamento com impacto limitado', example: 'Polymorphism gives extensibility — add a new type without changing existing code.' },
      { term: 'strategy pattern', meaning: 'encapsular algoritmos intercambiáveis atrás de uma interface', example: 'Each pricing strategy implements the same interface — the context selects one at runtime.' }
    ],
    selfEvaluation: [
      { criterion: 'I described a real problem that polymorphism solved', weight: 3 },
      { criterion: 'I explained the common contract and how implementations are selected', weight: 3 },
      { criterion: 'I mentioned extensibility or testability as benefit', weight: 2 },
      { criterion: 'I acknowledged when simpler solutions suffice', weight: 2 }
    ]
  },

  // 2. ORAL_ANSWER — Overriding vs Overloading
  {
    id: 'poly-oral-02',
    type: 'ORAL_ANSWER',
    subtopic: 'Polymorphism',
    difficulty: 'INTERMEDIATE',
    question: 'What is the difference between overriding and overloading?',
    interviewerIntent: 'Test precise understanding of compile-time vs runtime polymorphism.',
    shortAnswer: 'Overriding is runtime polymorphism — a subclass provides a new implementation for an inherited method with the same signature. Overloading is compile-time — same class has multiple methods with the same name but different parameters.',
    modelAnswer: `Overriding: The subclass redefines a method inherited from the parent. Same name, same parameters, same return type (or covariant). The JVM decides at runtime which version to call based on the actual object type. This is runtime polymorphism.

Overloading: Multiple methods in the same class with the same name but different parameter types or counts. The compiler decides at compile-time which version to call based on the declared parameter types. This is compile-time polymorphism.

Practical distinction: Overriding is the mechanism behind polymorphism in interfaces and abstract classes — different implementations of the same contract. Overloading is convenience — same operation name for different input types (like valueOf(int), valueOf(String)).

Key rule: Overriding happens in the type hierarchy (parent → child). Overloading happens within the same class or between inherited methods with different signatures.`,
    senaiExample: 'DocumentGenerator.generate() is overridden by each implementation. Repository might overload findByStatus(Status) and findByStatus(Status, Pageable) for convenience.',
    reweExample: 'ShipmentHandler.process() overridden per shipment type (runtime). A calculateCost(Weight) and calculateCost(Weight, Distance) overloaded in the same class (compile-time).',
    keyPoints: ['Override = runtime polymorphism (which object)', 'Overload = compile-time (which parameter types)', 'Override requires same signature', 'Overload requires different parameters', '@Override annotation helps catch errors'],
    mistakesToAvoid: ['Confusing the two', 'Not mentioning when each is resolved (compile vs runtime)', 'Giving only definitions without practical context'],
    followUps: [
      { question: 'Can you override a static method?', answerHint: 'No. Static methods belong to the class, not the instance. They can be hidden (same name in subclass) but not overridden — no dynamic dispatch.' },
      { question: 'What is covariant return type?', answerHint: 'An override can return a more specific type. Parent returns Object, child can return String. Added in Java 5.' }
    ],
    vocabulary: [
      { term: 'dynamic dispatch', meaning: 'JVM seleciona método com base no tipo real do objeto em runtime', example: 'Dynamic dispatch means the JVM checks the actual object type, not the reference type, to call the correct override.' },
      { term: 'method signature', meaning: 'nome do método + tipos dos parâmetros (sem return type)', example: 'Two methods with the same signature in parent and child = override. Same name, different params = overload.' }
    ],
    selfEvaluation: [
      { criterion: 'I clearly distinguished compile-time from runtime resolution', weight: 3 },
      { criterion: 'I gave practical examples of each', weight: 3 },
      { criterion: 'I mentioned @Override annotation', weight: 1 },
      { criterion: 'I avoided confusing the two', weight: 3 }
    ]
  },

  // 3. CODE_REFACTOR — Replace conditional with polymorphism
  {
    id: 'poly-refactor-01',
    type: 'CODE_REFACTOR',
    subtopic: 'Polymorphism',
    difficulty: 'INTERMEDIATE',
    mission: 'This <strong>growing conditional</strong> handles different delivery pricing. Refactor using polymorphism.',
    code: `public class PricingService {
    public BigDecimal calculateDeliveryPrice(Order order) {
        if (order.getDeliveryType() == DeliveryType.STANDARD) {
            return order.getWeight().multiply(new BigDecimal("0.50"));
        } else if (order.getDeliveryType() == DeliveryType.EXPRESS) {
            BigDecimal base = order.getWeight().multiply(new BigDecimal("1.20"));
            if (order.getDistance() > 50) base = base.add(new BigDecimal("5.00"));
            return base;
        } else if (order.getDeliveryType() == DeliveryType.SAME_DAY) {
            BigDecimal base = order.getWeight().multiply(new BigDecimal("2.50"));
            base = base.add(order.getDistance().multiply(new BigDecimal("0.30")));
            if (isWeekend()) base = base.multiply(new BigDecimal("1.5"));
            return base;
        }
        throw new IllegalArgumentException("Unknown type");
    }
}`,
    problemsToIdentify: [
      'Each delivery type has different, complex logic — hard to read together',
      'Adding a new type requires modifying this method (OCP violation)',
      'Cannot test one pricing strategy without the others',
      'Pricing rules for same-day are much more complex — buried in else-if'
    ],
    refactoredCode: `public interface DeliveryPricingStrategy {
    DeliveryType supportedType();
    BigDecimal calculate(Order order);
}

@ApplicationScoped
public class StandardPricing implements DeliveryPricingStrategy {
    public DeliveryType supportedType() { return DeliveryType.STANDARD; }
    public BigDecimal calculate(Order order) {
        return order.getWeight().multiply(new BigDecimal("0.50"));
    }
}

@ApplicationScoped
public class SameDayPricing implements DeliveryPricingStrategy {
    public DeliveryType supportedType() { return DeliveryType.SAME_DAY; }
    public BigDecimal calculate(Order order) {
        BigDecimal base = order.getWeight().multiply(new BigDecimal("2.50"));
        base = base.add(order.getDistance().multiply(new BigDecimal("0.30")));
        if (isWeekend()) base = base.multiply(new BigDecimal("1.5"));
        return base;
    }
}

@ApplicationScoped
public class PricingService {
    private final Map<DeliveryType, DeliveryPricingStrategy> strategies;

    @Inject
    public PricingService(List<DeliveryPricingStrategy> all) {
        this.strategies = all.stream()
            .collect(Collectors.toMap(DeliveryPricingStrategy::supportedType, Function.identity()));
    }

    public BigDecimal calculateDeliveryPrice(Order order) {
        return strategies.get(order.getDeliveryType()).calculate(order);
    }
}`,
    explain: 'Each strategy is isolated, testable and can evolve independently. Adding "drone delivery" pricing means creating one new class — zero changes to existing code. The service selects by type and delegates.'
  },

  // 4. CODE_REFACTOR — Notification channels
  {
    id: 'poly-refactor-02',
    type: 'CODE_REFACTOR',
    subtopic: 'Polymorphism',
    difficulty: 'INTERMEDIATE',
    mission: 'Refactor this <strong>notification dispatcher</strong> that keeps growing with each new channel.',
    code: `public void sendNotification(User user, String message, Channel channel) {
    switch (channel) {
        case EMAIL:
            emailClient.send(user.getEmail(), "Subject", message);
            break;
        case SMS:
            smsGateway.sendSms(user.getPhone(), message.substring(0, 160));
            break;
        case PUSH:
            firebaseClient.pushNotification(user.getDeviceToken(), "Alert", message);
            break;
        case SLACK:
            slackWebhook.post(user.getSlackId(), message);
            break;
        // TODO: add WhatsApp, Telegram...
    }
}`,
    problemsToIdentify: [
      'Every new channel requires modifying this switch',
      'Each channel has different dependencies (email client, SMS gateway, Firebase)',
      'Testing requires mocking ALL clients even when testing one channel',
      'Channel-specific logic (substring for SMS) mixed together'
    ],
    refactoredCode: `public interface NotificationChannel {
    Channel type();
    boolean supports(User user);  // user has this channel configured?
    void send(User user, String message);
}

@ApplicationScoped
public class SmsChannel implements NotificationChannel {
    @Inject private SmsGateway gateway;
    public Channel type() { return Channel.SMS; }
    public boolean supports(User user) { return user.getPhone() != null; }
    public void send(User user, String message) {
        gateway.sendSms(user.getPhone(), message.substring(0, Math.min(160, message.length())));
    }
}

@ApplicationScoped
public class NotificationDispatcher {
    @Inject private List<NotificationChannel> channels;

    public void send(User user, String message, Channel preferred) {
        channels.stream()
            .filter(c -> c.type() == preferred)
            .filter(c -> c.supports(user))
            .findFirst()
            .ifPresent(c -> c.send(user, message));
    }
}`,
    explain: 'Each channel owns its dependency and channel-specific logic. Adding WhatsApp means one new class implementing NotificationChannel. The dispatcher is stable — never modified when channels change.'
  },

  // 5. DESIGN_DECISION — When is a switch acceptable over polymorphism?
  {
    id: 'poly-design-01',
    type: 'DESIGN_DECISION',
    subtopic: 'Polymorphism',
    difficulty: 'SENIOR',
    mission: 'You have a <strong>simple status label</strong> that maps status to display text. Polymorphism or switch?',
    options: [
      { id: 'a', label: 'Switch/map expression', desc: 'A simple switch or Map<Status, String> that returns display text for each status.' },
      { id: 'b', label: 'Polymorphic Status with display()', desc: 'Each Status value is an object with its own display() method.' },
      { id: 'c', label: 'Enum with abstract method', desc: 'Status enum where each constant implements abstract String displayText().' }
    ],
    bestChoice: 'a',
    explanation: {
      a: { pros: ['Simple, readable', 'All mappings visible in one place', 'No extra classes for trivial logic', 'Easy to change'], cons: ['Must update when new status added', 'But adding a status is rare and this IS the place to update'], verdict: 'Best for simple mapping/formatting with no complex logic per case.' },
      b: { pros: ['Each status self-contained'], cons: ['Massive overkill for returning a string', 'Many files for trivial behavior', 'Harder to see all statuses at once'], verdict: 'Overengineered. Use polymorphism for complex behavior, not simple data mapping.' },
      c: { pros: ['Self-documenting', 'Compile error if new constant forgets to implement'], cons: ['Slightly verbose for one-liner', 'Good for 2-3 methods, heavy for many'], verdict: 'Good middle ground IF the enum already has behavior. For just a label, Map or switch is clearer.' }
    },
    nuance: 'Polymorphism solves "complex behavior that varies by type." A simple status-to-label mapping is DATA, not behavior. A Map<Status, String> or switch expression is the right tool. Do not use a cannon to kill a mosquito.'
  },

  // 6. DESIGN_DECISION — Multiple implementations with CDI
  {
    id: 'poly-design-02',
    type: 'DESIGN_DECISION',
    subtopic: 'Polymorphism',
    difficulty: 'SENIOR',
    mission: 'You need to <strong>select the correct payment processor</strong> at runtime (Stripe, PayPal, or BankTransfer). How?',
    options: [
      { id: 'a', label: 'If/else on payment method', desc: 'Check paymentMethod field and call the appropriate service directly.' },
      { id: 'b', label: 'CDI @Inject Instance<PaymentProcessor>', desc: 'Inject all implementations via CDI Instance, iterate to find the matching one.' },
      { id: 'c', label: 'Map<PaymentMethod, PaymentProcessor> at startup', desc: 'Build a lookup map from all implementations during initialization.' }
    ],
    bestChoice: 'c',
    explanation: {
      a: { pros: ['Explicit and simple'], cons: ['Must modify for every new processor', 'Calling service has knowledge of all processors', 'Violates OCP'], verdict: 'Acceptable for 2 stable options. Problematic as processors grow.' },
      b: { pros: ['CDI handles discovery', 'No explicit registration', 'New processors auto-discovered'], cons: ['Linear search each call (O(n))', 'Less explicit — harder to debug', 'Instance iteration pattern less readable'], verdict: 'Works but the iteration pattern is less clean than a pre-built map.' },
      c: { pros: ['O(1) lookup', 'Clear initialization', 'New processors auto-registered via CDI list', 'Easy to detect duplicates', 'Single point to debug'], cons: ['Slightly more setup code', 'Must handle missing processor'], verdict: 'Best balance: CDI injects the list, you build the map once, lookup is instant and clear. Used extensively in production.' }
    },
    nuance: 'Option C is the pattern we used in production at SENAI for document generators, notification channels and validation strategies. CDI provides all implementations; we organize them into a map for O(1) dispatch.'
  },

  // 7. COMPARE_CONCEPTS — Overriding vs Overloading
  {
    id: 'poly-compare-01',
    type: 'COMPARE_CONCEPTS',
    subtopic: 'Polymorphism',
    difficulty: 'BASIC',
    mission: 'Compare: <strong>Overriding</strong> vs <strong>Overloading</strong>',
    conceptA: { name: 'Overriding', definition: 'Subclass redefines an inherited method with SAME signature. Resolved at RUNTIME based on actual object type. @Override annotation.' },
    conceptB: { name: 'Overloading', definition: 'Same class has methods with SAME name but DIFFERENT parameters. Resolved at COMPILE-TIME based on declared parameter types.' },
    keyDifference: 'Override = runtime, same signature, in subclass. Overload = compile-time, different parameters, same class. Override enables polymorphism; overload is syntactic convenience.',
    javaExample: 'Override: CertificateGenerator.generate() redefines DocumentGenerator.generate(). Overload: logger.log(String), logger.log(String, Throwable) — same name, different params.',
    interviewAnswer: 'Overriding is runtime polymorphism — the JVM picks the method based on actual object type. Overloading is compile-time convenience — the compiler picks based on parameter types. They serve different purposes: overriding for polymorphic behavior, overloading for method signature variations.'
  },

  // 8. FOLLOW_UP — Deep dive on polymorphism
  {
    id: 'poly-followup-01',
    type: 'FOLLOW_UP',
    subtopic: 'Polymorphism',
    difficulty: 'SENIOR',
    scenario: 'The interviewer probes deeper after you mention using polymorphism.',
    questions: [
      { q: 'How did CDI inject multiple implementations?', hint: '@Inject Instance<T> or @Inject List<T>. CDI discovers all beans implementing the interface. You iterate or build a map.' },
      { q: 'How did you detect duplicate implementations for the same type?', hint: 'At map-building time: if toMap() throws on duplicate key, or check size of list vs map. Fail fast at startup.' },
      { q: 'What about testing — how did you test the dispatcher?', hint: 'Unit test: mock individual generators. Integration test: inject real implementations, verify correct one is called per type.' },
      { q: 'What would you do if there were only 2 types?', hint: 'A switch or if/else is fine for 2 simple stable types. Polymorphism pays off at 3+ types with complex independent logic.' },
      { q: 'Can polymorphism make code harder to understand?', hint: 'Yes — you cannot see the full flow in one place. Debugging requires knowing which implementation runs. Mitigate with clear naming and logging.' },
      { q: 'Is this the Strategy pattern?', hint: 'Yes, essentially. Strategy = encapsulate a family of algorithms behind a common interface, select one at runtime.' }
    ]
  },

  // 9. FOLLOW_UP — When switch is better
  {
    id: 'poly-followup-02',
    type: 'FOLLOW_UP',
    subtopic: 'Polymorphism',
    difficulty: 'SENIOR',
    scenario: 'The interviewer challenges: "When is a switch statement acceptable?"',
    questions: [
      { q: 'Is a switch statement always a code smell?', hint: 'No. It is appropriate for simple mappings, formatting, and stable enums with trivial logic.' },
      { q: 'When would you NOT refactor to polymorphism?', hint: 'When logic per case is 1-2 lines, when the set of cases is stable and small, when the mapping is data (not behavior).' },
      { q: 'What about Java 17+ switch expressions with pattern matching?', hint: 'They make switch more powerful and type-safe. sealed classes + switch = compiler guarantees exhaustiveness. Can reduce need for polymorphism in some cases.' },
      { q: 'What is the cost of premature polymorphism?', hint: 'More classes, harder navigation, abstraction that does not carry its weight. 5 classes for 2 simple cases = overengineering.' }
    ]
  },

  // 10. REAL_EXPERIENCE — Polymorphism in production
  {
    id: 'poly-experience-01',
    type: 'REAL_EXPERIENCE',
    subtopic: 'Polymorphism',
    difficulty: 'SENIOR',
    prompt: 'Describe a time you replaced a conditional structure with polymorphism. What was the before, the after, and the trade-off?',
    guidingQuestions: [
      'What was the business domain?',
      'What was the conditional checking (document type, status, role)?',
      'How many cases existed and were growing?',
      'What interface/contract did you introduce?',
      'How were implementations selected at runtime?',
      'What was the measurable improvement?',
      'Was there any downside?'
    ],
    exampleStory: `In the document generation module at SENAI, a 300-line if/else chain handled 6 document types (certificate, declaration, attendance, grade report, transcript, diploma). Each type had 40-50 lines of specific logic. Adding diploma generation required understanding all 300 lines to find the right insertion point. After refactoring to DocumentGenerator interface with CDI injection, each type was an isolated 50-line class. Adding a new type took 30 minutes instead of a full day. Testing went from "test everything together" to "test one generator in isolation." The main service method went from 300 lines to 5 lines of delegation.`,
    buildingBlocks: ['Domain and entity types', 'Original conditional structure', 'Interface introduced', 'How runtime selection works', 'Before vs after metrics', 'Trade-off acknowledged']
  },

  // 11. PREDICT_OUTPUT — Runtime polymorphism
  {
    id: 'poly-predict-01',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Polymorphism',
    difficulty: 'BASIC',
    mission: 'What does this print? Think about <strong>runtime dispatch</strong>.',
    code: `interface Processor { String process(); }
class Fast implements Processor { public String process() { return "FAST"; } }
class Slow implements Processor { public String process() { return "SLOW"; } }

Processor p = new Fast();
System.out.println(p.process());`,
    choices: ['FAST', 'SLOW', 'Compile Error', 'null'],
    answer: 'FAST',
    explain: 'The reference type is Processor but the actual object is Fast. The JVM calls Fast.process(). This is runtime polymorphism — the interface hides which implementation runs, but the actual object determines behavior.'
  },

  // 12. PREDICT_OUTPUT — Overloading resolution
  {
    id: 'poly-predict-02',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Polymorphism',
    difficulty: 'INTERMEDIATE',
    mission: 'Which overload is called? Think about <strong>compile-time resolution</strong>.',
    code: `class Logger {
    void log(Object o)  { System.out.println("Object: " + o); }
    void log(String s)  { System.out.println("String: " + s); }
}

Object message = "Hello";
new Logger().log(message);`,
    choices: ['String: Hello', 'Object: Hello', 'Compile Error', 'Both'],
    answer: 'Object: Hello',
    explain: 'Overloading is resolved at COMPILE-TIME based on the DECLARED type of the argument. The variable is declared as Object, so log(Object) is selected — even though the actual runtime value is a String. This is the key difference from overriding (which uses runtime type).'
  },

  // 13. FILL_BLANK — Interface implementation
  {
    id: 'poly-fill-01',
    type: 'FILL_BLANK',
    subtopic: 'Polymorphism',
    difficulty: 'BASIC',
    mission: 'Complete the class so it can be used <strong>polymorphically</strong> as a ShipmentHandler.',
    code: 'public class ExpressShipmentHandler _____ ShipmentHandler {\n    @Override\n    public void handle(Shipment s) { /* express logic */ }\n}',
    blank: '_____',
    choices: ['implements', 'extends', 'overrides', 'uses'],
    answer: 'implements',
    explain: 'implements connects a class to an interface contract. The class promises to provide the behavior defined by ShipmentHandler. Now ExpressShipmentHandler can be used wherever ShipmentHandler is expected — that is polymorphism.'
  },

  // 14. PICK_INVALID — Identify non-polymorphic design
  {
    id: 'poly-pick-01',
    type: 'PICK_INVALID',
    subtopic: 'Polymorphism',
    difficulty: 'INTERMEDIATE',
    mission: 'Which design does <strong>NOT</strong> use polymorphism effectively?',
    snippets: [
      { id: 'a', code: 'interface Validator { void validate(Order o); }\nclass SizeValidator implements Validator {...}\nclass WeightValidator implements Validator {...}\n// All validators called via List<Validator>', valid: true },
      { id: 'b', code: 'interface Exporter { void export(Data d); }\nclass CsvExporter implements Exporter {...}\nclass PdfExporter implements Exporter {...}\n// Selected by user preference', valid: true },
      { id: 'c', code: 'interface Processor { void process(); }\nclass TheProcessor implements Processor {\n  void process() {\n    if (type == A) handleA();\n    else if (type == B) handleB();\n  }\n}', valid: false }
    ],
    answer: 'c',
    explain: 'Option C has an interface with ONE implementation that still uses if/else internally — the polymorphism is fake. The conditional should be REPLACED by multiple implementations, not hidden behind a single class. Options A and B use genuine polymorphism with multiple independent implementations.'
  },

  // 15. ORAL_ANSWER — Can polymorphism make design more complex?
  {
    id: 'poly-oral-03',
    type: 'ORAL_ANSWER',
    subtopic: 'Polymorphism',
    difficulty: 'SENIOR',
    question: 'Can polymorphism make a design more complex? When is it not worth it?',
    interviewerIntent: 'Test maturity — can the candidate recognize overengineering, not just advocate for patterns blindly.',
    shortAnswer: 'Yes. Polymorphism adds indirection — you cannot see the full flow in one place. For 2-3 simple stable cases, a switch is clearer. Polymorphism pays off when types have complex independent logic, grow over time, or need independent testing.',
    modelAnswer: `Context: Polymorphism is powerful but has real costs that must be weighed against benefits.

Problem: I have seen codebases where a simple two-case formatting logic was split into an interface, a factory, two implementation classes and a configuration class — 5 files for what could be a 3-line switch.

Decision: I apply polymorphism when: (1) each case has complex independent logic (>10 lines), (2) the set of cases is growing, (3) cases need different dependencies, or (4) cases need independent testing. I use switch/map when: logic per case is trivial, the set is small and stable, and a new developer can understand it in 30 seconds.

Result: This selective approach keeps simple things simple while allowing complex areas to scale cleanly.

Trade-off: Sometimes you misjudge — you use a switch and later need to refactor to polymorphism when complexity grows. That is acceptable. Starting simple and evolving is better than overengineering from day one.`,
    senaiExample: 'Simple status-to-label mappings use enums or Maps. Complex document generation with 6+ types and different dependencies uses polymorphic generators. The boundary is: "does each case need its own class to be readable?"',
    reweExample: 'Delivery status display text = switch (trivial). Delivery pricing with zone calculations, weekend surcharges and weight tiers = polymorphic strategies (complex, independent, growing).',
    keyPoints: ['Polymorphism adds indirection (cost)', 'Simple cases: switch is clearer', 'Complex/growing cases: polymorphism scales', 'Judge by complexity per case and growth rate', 'Starting simple and refactoring later is valid'],
    mistakesToAvoid: ['Saying polymorphism is always better', 'Not acknowledging the navigation/debugging cost', 'Giving no criteria for the decision'],
    followUps: [
      { question: 'How do you decide the threshold?', answerHint: 'When each case exceeds 10-15 lines, has its own dependencies, or when the set of cases grew twice in the last quarter — time to extract.' },
      { question: 'What about debugging polymorphic code?', answerHint: 'Harder to trace. Mitigate with clear logging at dispatch point, good class names, and IDE "find implementations" support.' }
    ],
    vocabulary: [
      { term: 'indirection', meaning: 'camada adicional entre chamador e implementação', example: 'Polymorphism adds indirection — you must know which implementation is active to understand the flow.' },
      { term: 'overengineering', meaning: 'solução mais complexa do que o problema justifica', example: 'Five classes for a two-case formatting is overengineering — a switch would be clearer.' }
    ],
    selfEvaluation: [
      { criterion: 'I acknowledged that polymorphism has costs', weight: 3 },
      { criterion: 'I gave criteria for when to use vs not use it', weight: 3 },
      { criterion: 'I showed a mature balance (not always for/against)', weight: 2 },
      { criterion: 'I mentioned navigation/debugging difficulty', weight: 2 }
    ]
  }
];
