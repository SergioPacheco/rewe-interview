/**
 * Design Patterns Module — Practice (20 exercises)
 * Strategy, Factory, Observer, Builder + Decorator, Template Method — logistics context
 */
const designPatternsExercises = [
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Strategy Pattern',
    question: 'You need to calculate delivery pricing. Standard deliveries use flat rate, express uses distance-based, same-day uses time-window surcharges. New pricing models are added every quarter. How do you design this?',
    options: [
      { label: 'A) switch/case in PricingService for each delivery type', description: 'One method with conditions per type, updated when new types arrive.' },
      { label: 'B) Strategy pattern — PricingStrategy interface with implementations per type', description: 'Each pricing model is a class. New model = new class, no modification.' },
      { label: 'C) Database-driven rules engine with configurable formulas', description: 'Store pricing rules in DB, evaluate dynamically at runtime.' }
    ],
    bestOption: 1,
    explanation: `Strategy pattern is ideal here:

\`\`\`java
public interface PricingStrategy {
    BigDecimal calculate(Delivery delivery);
}

@Component("STANDARD") class FlatRatePricing implements PricingStrategy { ... }
@Component("EXPRESS") class DistancePricing implements PricingStrategy { ... }
@Component("SAME_DAY") class TimeSurchargePricing implements PricingStrategy { ... }

@Service
public class PricingService {
    private final Map<String, PricingStrategy> strategies;
    public BigDecimal price(Delivery d) {
        return strategies.get(d.getType().name()).calculate(d);
    }
}
\`\`\`

New pricing model every quarter = one new class. Open/Closed principle satisfied.
Option C is over-engineering for 3-5 pricing types.`,
    tags: ['strategy', 'open-closed', 'pricing']
  },
  {
    type: 'CODE_REFACTOR',
    difficulty: 'INTER',
    subtopic: 'Strategy Pattern',
    question: 'Refactor this notification sender to use Strategy:',
    code: `public class NotificationService {
    public void notify(Delivery delivery, String channel) {
        if (channel.equals("EMAIL")) {
            String body = "Your delivery " + delivery.getId() + " is on the way";
            emailClient.send(delivery.getCustomerEmail(), "Delivery Update", body);
        } else if (channel.equals("SMS")) {
            String msg = "Delivery " + delivery.getId() + " arriving in " + delivery.getEta() + " min";
            smsClient.send(delivery.getCustomerPhone(), msg);
        } else if (channel.equals("PUSH")) {
            pushClient.send(delivery.getCustomerId(), "Delivery arriving!", delivery.getEta());
        } else if (channel.equals("WEBHOOK")) {
            webhookClient.post(delivery.getCallbackUrl(), toJson(delivery));
        }
    }
}`,
    problems: [
      'Every new channel requires modifying this class (violates Open/Closed)',
      'Mixed responsibilities: message formatting + sending in one method',
      'Hard to test individual channels in isolation',
      'No way to add channel-specific retry/error handling'
    ],
    refactored: `public interface NotificationChannel {
    String channelName();
    void send(Delivery delivery);
}

@Component class EmailNotification implements NotificationChannel { ... }
@Component class SmsNotification implements NotificationChannel { ... }
@Component class PushNotification implements NotificationChannel { ... }
@Component class WebhookNotification implements NotificationChannel { ... }

@Service
public class NotificationService {
    private final Map<String, NotificationChannel> channels;

    public NotificationService(List<NotificationChannel> all) {
        this.channels = all.stream()
            .collect(Collectors.toMap(NotificationChannel::channelName, c -> c));
    }

    public void notify(Delivery delivery, String channel) {
        channels.get(channel).send(delivery);
    }
}`,
    tags: ['strategy', 'refactoring', 'open-closed']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Factory Pattern',
    question: 'When would you use Factory Method vs Abstract Factory vs simple static factory?',
    modelAnswer: `**Static factory method** (simplest — most common in practice):
\`\`\`java
// Instead of constructors with unclear intent
Delivery delivery = Delivery.planned(driverId, route);
Delivery delivery = Delivery.fromRequest(createRequest);
\`\`\`
Use when: creation logic is simple, just needs a readable name.

**Factory Method** (one product, subclass decides which):
\`\`\`java
// Abstract creator
abstract class NotificationFactory {
    abstract Notification createNotification(DeliveryEvent event);
}
// Concrete creators
class UrgentNotificationFactory extends NotificationFactory { ... }
class StandardNotificationFactory extends NotificationFactory { ... }
\`\`\`
Use when: framework where subclasses determine which product to create.

**Abstract Factory** (family of related products):
\`\`\`java
interface LogisticsUIFactory {
    Button createButton();
    Table createTable();
    Form createForm();
}
class DesktopLogisticsUI implements LogisticsUIFactory { ... }
class MobileLogisticsUI implements LogisticsUIFactory { ... }
\`\`\`
Use when: creating families of objects that must be used together.

**In practice at REWE:** 90% of the time you need a static factory or a simple @Component factory class. Gang-of-Four Factory Method and Abstract Factory are rare in microservices.`,
    tags: ['factory', 'creation-patterns', 'pragmatism']
  },
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'BASIC',
    subtopic: 'Builder Pattern',
    mission: 'What does this print?',
    code: `Delivery d = Delivery.builder()
    .id(1L)
    .status(DeliveryStatus.PLANNED)
    .driverId("D-42")
    .stops(List.of("Warehouse", "Store A", "Store B"))
    .build();

System.out.println(d.getStops().size());
System.out.println(d.getStatus());`,
    choices: ['3\\nPLANNED', '0\\nPLANNED', '3\\nnull', 'Compilation error'],
    answer: '3\\nPLANNED',
    explain: 'The builder sets all fields. stops has 3 elements from List.of(). status is explicitly set to PLANNED. Builder creates the object with all values provided.'
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Observer Pattern',
    question: 'Compare Spring @EventListener, CDI Events (@Observes), and Kafka events. When do you use each?',
    modelAnswer: `**Spring @EventListener (in-process, synchronous by default):**
\`\`\`java
// Same JVM, same transaction context
@EventListener
public void onDeliveryCompleted(DeliveryCompletedEvent e) { ... }

// Can be async with @Async
@Async @EventListener
public void onDeliveryCompleted(DeliveryCompletedEvent e) { ... }
\`\`\`
Use when: decoupling within same service, same deployment unit.

**CDI @Observes (Java EE equivalent):**
\`\`\`java
public void onDeliveryCompleted(@Observes DeliveryCompletedEvent e) { ... }
// @Observes(during = AFTER_SUCCESS) — after TX commits
\`\`\`
Same concept, different annotation. Both are in-process.

**Kafka (inter-service, persistent, replayable):**
\`\`\`java
@KafkaListener(topics = "delivery-completed")
public void handle(DeliveryCompletedEvent e) { ... }
\`\`\`
Use when: cross-service communication, independent failure domains, replay needed.

**Decision matrix:**
| Need | Spring Event | Kafka |
|------|:---:|:---:|
| Same service | ✅ | ❌ overkill |
| Cross-service | ❌ | ✅ |
| Replay/audit | ❌ | ✅ |
| Must not lose | ❌ (in-memory) | ✅ (persistent) |
| Transactional | ✅ (same TX) | ❌ (separate TX) |`,
    tags: ['observer', 'events', 'spring-vs-kafka']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    subtopic: 'Template Method',
    question: 'Multiple delivery types (Standard, Express, Frozen) share the same flow: validate → assign driver → optimize route → dispatch. But each type has different validation rules and route constraints. How do you design this?',
    options: [
      { label: 'A) Template Method — abstract base class defines flow, subclasses override specific steps', description: 'BaseDeliveryProcessor.process() calls validate(), assignDriver(), optimizeRoute(), dispatch(). Subclasses override validate() and optimizeRoute().' },
      { label: 'B) Strategy — inject different validators and route optimizers', description: 'DeliveryProcessor composed with injected ValidationStrategy and RouteStrategy.' },
      { label: 'C) Chain of Responsibility — each step is a handler in a chain', description: 'ValidateHandler → AssignHandler → RouteHandler → DispatchHandler pipeline.' }
    ],
    bestOption: 1,
    explanation: `Option B (Strategy/Composition) is preferred in Spring Boot:

Template Method (A) uses inheritance — each delivery type is a subclass. This creates a rigid hierarchy and makes testing harder (must subclass to test).

Strategy/Composition (B) uses injection — more flexible:
\`\`\`java
@Service
public class DeliveryProcessor {
    private final Map<DeliveryType, DeliveryValidator> validators;
    private final Map<DeliveryType, RouteOptimizer> optimizers;

    public void process(Delivery delivery) {
        validators.get(delivery.getType()).validate(delivery);
        driverAssigner.assign(delivery); // shared step
        optimizers.get(delivery.getType()).optimize(delivery);
        dispatcher.dispatch(delivery); // shared step
    }
}
\`\`\`

Advantages over Template Method:
- No class hierarchy to maintain
- Each validator/optimizer independently testable
- Can combine strategies at runtime
- Spring DI handles wiring naturally`,
    tags: ['template-method', 'strategy', 'composition-over-inheritance']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Decorator Pattern',
    question: 'How can you add logging, metrics, and retry to a service call without cluttering the business logic?',
    modelAnswer: `Decorator pattern — wrap the same interface with cross-cutting concerns:

\`\`\`java
public interface RouteOptimizer {
    Route optimize(List<Stop> stops);
}

// Core implementation
@Component("core")
class GoogleRouteOptimizer implements RouteOptimizer {
    public Route optimize(List<Stop> stops) {
        return googleMapsClient.directions(stops);
    }
}

// Decorator: adds logging
class LoggingRouteOptimizer implements RouteOptimizer {
    private final RouteOptimizer delegate;
    public Route optimize(List<Stop> stops) {
        log.info("Optimizing route for {} stops", stops.size());
        Route r = delegate.optimize(stops);
        log.info("Route optimized: {} km, {} min", r.distance(), r.duration());
        return r;
    }
}

// Decorator: adds metrics
class MeteredRouteOptimizer implements RouteOptimizer {
    private final RouteOptimizer delegate;
    public Route optimize(List<Stop> stops) {
        var timer = metrics.timer("route.optimize").start();
        try { return delegate.optimize(stops); }
        finally { timer.stop(); }
    }
}
\`\`\`

**In Spring Boot, AOP often replaces manual decorators:**
\`\`\`java
@Around("@annotation(Timed)")
public Object timeExecution(ProceedingJoinPoint pjp) throws Throwable {
    // Same as MeteredRouteOptimizer but declarative
}
\`\`\`

Use explicit decorators when you need fine control. Use AOP for generic cross-cutting.`,
    tags: ['decorator', 'aop', 'cross-cutting']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Singleton',
    question: 'How do you create a singleton in Spring Boot? Is the GoF Singleton pattern still relevant?',
    options: [
      { label: 'A) Classic GoF: private constructor + static getInstance() with double-check locking', description: 'Traditional pattern with synchronized access to single instance.' },
      { label: 'B) Spring @Service/@Component — singleton by default', description: 'Spring manages lifecycle, creates one instance, injects everywhere.' },
      { label: 'C) Enum singleton: enum with single value INSTANCE', description: 'Josh Bloch\'s effective Java approach — serialization-safe, thread-safe.' }
    ],
    bestOption: 1,
    explanation: `In Spring Boot, you NEVER write the GoF Singleton pattern manually:

\`\`\`java
// ✅ Spring singleton (default scope)
@Service
public class DeliveryService {
    // ONE instance created by Spring, shared across all injection points
    // Thread-safe as long as no mutable instance fields
}

// ❌ Never do this in Spring applications
public class DeliveryService {
    private static DeliveryService INSTANCE;
    private DeliveryService() {}
    public static synchronized DeliveryService getInstance() { ... }
}
\`\`\`

**Why Spring's approach wins:**
- Lifecycle managed by container (creation, destruction, proxying)
- Easily replaceable in tests (mock injection)
- No static state (cleaner)
- Supports scopes (change from singleton to prototype if needed)

**When GoF/Enum singleton still applies:**
- Utility classes outside Spring context (rare)
- Library code that can't depend on Spring`,
    tags: ['singleton', 'spring', 'di']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Anti-patterns',
    question: 'What are the most common design pattern anti-patterns you\'ve seen in enterprise Java?',
    modelAnswer: `**1. Pattern Overuse (Patternitis):**
Creating Strategy + Factory + Builder for a simple if/else with 2 cases that will never grow. 3 classes where 5 lines of code suffice.

**2. God Factory:**
One factory that creates EVERYTHING — becomes a dependency magnet. Fix: multiple focused factories or just let Spring DI handle it.

**3. Inheritance for code reuse (not-a-pattern):**
BaseService, BaseRepository, AbstractController — using inheritance as code-sharing mechanism instead of composition.

**4. Observer spaghetti:**
20 event listeners triggered by one event, each triggering sub-events, creating untraceable execution flows. Fix: limit event chains to 2 levels max.

**5. Premature abstraction:**
Interface with single implementation "because maybe someday." YAGNI — create the interface when the second implementation appears.

**My rules:**
- Pattern must solve a CURRENT problem (not future imagined one)
- If the team needs documentation to understand it → too complex
- Prefer simple composition over named patterns
- "I used a pattern" is never the goal — "I solved the problem clearly" is`,
    tags: ['anti-patterns', 'pragmatism', 'over-engineering']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Repository Pattern',
    question: 'Is Spring Data\'s Repository a design pattern? How does it relate to the GoF patterns?',
    modelAnswer: `**Repository pattern (DDD, not GoF):**
An abstraction over data access that presents a collection-like interface to the domain layer. The domain doesn't know about SQL, JPA, or the database.

\`\`\`java
// The pattern: domain-oriented interface
public interface DeliveryRepository {
    Optional<Delivery> findById(Long id);
    List<Delivery> findActiveByDriver(Long driverId);
    void save(Delivery delivery);
}

// Spring Data JPA implements it at runtime!
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    List<Delivery> findByDriverIdAndStatus(Long driverId, DeliveryStatus status);
}
\`\`\`

**How it relates to GoF:**
- It's a specialized **Facade** (hides JPA/SQL complexity)
- Uses **Template Method** internally (Spring implements query generation)
- Combined with **Strategy** when you have multiple data sources

**When to add custom implementation:**
\`\`\`java
public interface DeliveryRepositoryCustom {
    List<DeliveryDTO> searchWithComplexFilters(SearchCriteria criteria);
}

@Repository
public class DeliveryRepositoryImpl implements DeliveryRepositoryCustom {
    @PersistenceContext private EntityManager em;
    // Complex Criteria API or native SQL here
}
\`\`\``,
    tags: ['repository', 'ddd', 'spring-data']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    subtopic: 'Chain of Responsibility',
    question: 'Delivery validation has 8 rules: check driver availability, check vehicle capacity, check route feasibility, check time window, check customer blacklist, check payment, check regulatory compliance, check weather. How do you organize these?',
    options: [
      { label: 'A) One validate() method with 8 if-checks sequentially', description: 'Single method, returns first error found.' },
      { label: 'B) Chain of Responsibility — each rule is a Validator, executed in sequence', description: 'List of validators, each can pass or reject. Collect all errors.' },
      { label: 'C) Specification pattern — compose boolean predicates', description: 'Each rule is a Specification, combined with and/or, evaluated as one.' }
    ],
    bestOption: 1,
    explanation: `Chain of Responsibility (B) scales best for 8+ independent rules:

\`\`\`java
public interface DeliveryValidator {
    ValidationResult validate(Delivery delivery);
    int order(); // execution priority
}

@Component class DriverAvailabilityValidator implements DeliveryValidator { ... }
@Component class VehicleCapacityValidator implements DeliveryValidator { ... }
@Component class RouteValidator implements DeliveryValidator { ... }
// ... one class per rule

@Service
public class DeliveryValidationChain {
    private final List<DeliveryValidator> validators;

    public DeliveryValidationChain(List<DeliveryValidator> validators) {
        this.validators = validators.stream()
            .sorted(Comparator.comparingInt(DeliveryValidator::order))
            .toList();
    }

    public ValidationResult validateAll(Delivery delivery) {
        return validators.stream()
            .map(v -> v.validate(delivery))
            .filter(ValidationResult::hasErrors)
            .findFirst()  // fail-fast
            .orElse(ValidationResult.ok());
    }
}
\`\`\`

Adding rule #9 = one new class. Each rule independently testable. Order configurable.`,
    tags: ['chain-of-responsibility', 'validation', 'scalability']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Adapter Pattern',
    question: 'You need to integrate with a third-party route optimization API that has a completely different interface than what your service expects. How do you handle this?',
    modelAnswer: `Adapter pattern — translate between incompatible interfaces:

\`\`\`java
// Your domain interface (what your service expects)
public interface RouteOptimizer {
    Route optimize(List<Stop> stops, VehicleType vehicle);
}

// Third-party client (what the external API offers)
public class ExternalRoutingClient {
    public ExternalRouteResponse calculateRoute(
        List<ExternalWaypoint> waypoints, String vehicleClass, String apiKey) { ... }
}

// Adapter: translates your interface → their interface
@Component
public class ExternalRouteAdapter implements RouteOptimizer {

    private final ExternalRoutingClient client;
    private final String apiKey;

    public Route optimize(List<Stop> stops, VehicleType vehicle) {
        // Translate input
        List<ExternalWaypoint> waypoints = stops.stream()
            .map(s -> new ExternalWaypoint(s.getLat(), s.getLng(), s.getName()))
            .toList();
        String vehicleClass = mapVehicleType(vehicle);

        // Call external
        ExternalRouteResponse response = client.calculateRoute(waypoints, vehicleClass, apiKey);

        // Translate output
        return new Route(
            response.getPoints().stream().map(this::toStop).toList(),
            response.getTotalDistanceKm(),
            Duration.ofSeconds(response.getDurationSec())
        );
    }
}
\`\`\`

**Benefits:**
- Your business code never touches the external API's types
- Switch providers: write a new adapter, same interface
- Testable: mock the interface, not the HTTP client`,
    tags: ['adapter', 'integration', 'clean-architecture']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'CQRS light',
    question: 'The delivery-service has complex write operations (validation, events, state machine) but simple read queries (list, filter, sort). A colleague suggests CQRS. Is it worth it?',
    modelAnswer: `**CQRS (Command Query Responsibility Segregation):**
Separate the write model (commands) from the read model (queries).

**Full CQRS (separate databases):**
\`\`\`
Commands → Write DB (normalized, consistent)
Events → Read DB (denormalized, optimized for queries)
\`\`\`
Overkill for most services. Complex sync, eventual consistency.

**CQRS Light (same DB, separate code paths) — PRAGMATIC:**
\`\`\`java
// Write side: rich domain model, business rules
@Service class DeliveryCommandService {
    @Transactional
    public void dispatch(DispatchCommand cmd) {
        Delivery d = repo.findById(cmd.id()).orElseThrow();
        d.dispatch(cmd.driverId()); // domain logic, validation
        repo.save(d);
        events.publish(new DeliveryDispatched(d));
    }
}

// Read side: simple DTOs, optimized queries
@Service class DeliveryQueryService {
    @Transactional(readOnly = true)
    public Page<DeliveryListDTO> search(DeliveryFilter filter, Pageable page) {
        return repo.search(filter, page); // direct DTO projection, no domain model
    }
}
\`\`\`

**For REWE delivery-service:** CQRS Light is the sweet spot.
- Writes go through domain model (validation, events, state machine)
- Reads bypass domain model (DTO projections, optimized queries)
- Same database, same deployment, no sync issues
- Clear separation of concerns without infrastructure complexity`,
    tags: ['cqrs', 'architecture', 'pragmatism']
  },
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'INTER',
    subtopic: 'Strategy with Spring DI',
    mission: 'What does this code print when called with <code>type = "EXPRESS"</code>?',
    code: `interface PricingStrategy {
    BigDecimal calculate(int distanceKm);
    String type();
}

@Component class StandardPricing implements PricingStrategy {
    public BigDecimal calculate(int km) { return new BigDecimal("5.00"); }
    public String type() { return "STANDARD"; }
}

@Component class ExpressPricing implements PricingStrategy {
    public BigDecimal calculate(int km) { return new BigDecimal("5.00").add(BigDecimal.valueOf(km * 0.5)); }
    public String type() { return "EXPRESS"; }
}

@Service class PricingService {
    private final Map<String, PricingStrategy> map;
    PricingService(List<PricingStrategy> all) {
        this.map = all.stream().collect(Collectors.toMap(PricingStrategy::type, s -> s));
    }
    public void printPrice(String type, int km) {
        System.out.println(map.get(type).calculate(km));
    }
}

// Called with:
pricingService.printPrice("EXPRESS", 20);`,
    choices: ['5.00', '15.00', '15.0', '10.00'],
    answer: '15.0',
    explain: 'ExpressPricing: 5.00 + (20 × 0.5) = 5.00 + 10.0 = 15.0. BigDecimal.valueOf(km * 0.5) creates BigDecimal("10.0") (one decimal place from double). add() produces 15.0. BigDecimal.toString() preserves scale.'
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'State Machine',
    question: 'A delivery has states: PLANNED → DISPATCHED → IN_TRANSIT → DELIVERED (or FAILED from any active state). How do you implement the state machine to prevent invalid transitions?',
    modelAnswer: `**Simple state machine in the entity (no framework needed):**

\`\`\`java
public enum DeliveryStatus {
    PLANNED, DISPATCHED, IN_TRANSIT, DELIVERED, FAILED;

    private static final Map<DeliveryStatus, Set<DeliveryStatus>> TRANSITIONS = Map.of(
        PLANNED, Set.of(DISPATCHED, FAILED),
        DISPATCHED, Set.of(IN_TRANSIT, FAILED),
        IN_TRANSIT, Set.of(DELIVERED, FAILED),
        DELIVERED, Set.of(),  // terminal
        FAILED, Set.of()     // terminal
    );

    public boolean canTransitionTo(DeliveryStatus target) {
        return TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }
}

@Entity
public class Delivery {
    @Enumerated(EnumType.STRING)
    private DeliveryStatus status = DeliveryStatus.PLANNED;

    public void transitionTo(DeliveryStatus newStatus) {
        if (!status.canTransitionTo(newStatus)) {
            throw new IllegalStateException(
                "Cannot transition from " + status + " to " + newStatus);
        }
        this.status = newStatus;
    }

    public void dispatch() { transitionTo(DeliveryStatus.DISPATCHED); }
    public void complete() { transitionTo(DeliveryStatus.DELIVERED); }
    public void fail(String reason) { transitionTo(DeliveryStatus.FAILED); }
}
\`\`\`

**For more complex state machines** (10+ states, conditions, actions):
Consider Spring State Machine framework. For 5 states like delivery → keep it simple in the entity.`,
    tags: ['state-machine', 'domain-model', 'valid-transitions']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Patterns Summary',
    question: 'If you could only use 5 design patterns for the rest of your career in microservices, which would you choose?',
    modelAnswer: `My top 5 for microservices (daily use):

**1. Strategy** — swappable algorithms, polymorphic dispatch. Used in every service with multiple implementations of an interface (pricing, notifications, validation).

**2. Builder** — complex object construction. Used for DTOs, test data, configuration objects. Lombok @Builder makes it zero-cost.

**3. Repository** — data access abstraction. Spring Data gives it for free. Clean boundary between domain and persistence.

**4. Adapter** — external integration isolation. Every third-party API gets wrapped in an adapter. Internal code never touches external types.

**5. Observer/Event** — decoupled reactions. Spring @EventListener for in-process, Kafka for cross-service. Core pattern of event-driven architecture.

**Honorable mentions:**
- Factory (simple static factories, not Abstract Factory)
- Decorator (cross-cutting concerns, rarely hand-coded with AOP available)
- Chain of Responsibility (validation pipelines)

**What I almost NEVER use in microservices:**
- Singleton (Spring handles this)
- Abstract Factory (too complex for simple services)
- Visitor (almost never appropriate)
- Prototype (rarely needed with DI)`,
    tags: ['summary', 'pragmatism', 'microservices']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Builder vs Record',
    question: 'For a delivery creation request DTO with 6 required fields and 3 optional fields, what approach do you use in modern Java?',
    options: [
      { label: 'A) Java Record with all fields in constructor', description: 'record CreateDeliveryRequest(String driverId, String routeId, ...) {}' },
      { label: 'B) Class with Builder pattern (Lombok @Builder)', description: 'Class with private constructor + builder for clarity on optional vs required.' },
      { label: 'C) Record + @JsonCreator for optional defaults', description: 'Record with Jackson defaults for optional fields.' }
    ],
    bestOption: 2,
    explanation: `Option C — Record with defaults is the modern Java approach for DTOs:

\`\`\`java
public record CreateDeliveryRequest(
    @NotBlank String driverId,
    @NotNull String routeId,
    @NotNull @Future LocalDateTime scheduledAt,
    @NotNull DeliveryType type,
    @Size(min = 1) List<StopRequest> stops,
    @NotBlank String customerId,
    // Optional with defaults
    Priority priority,     // nullable = not required
    String notes,          // nullable
    Integer maxRetries     // nullable
) {
    public CreateDeliveryRequest {
        if (priority == null) priority = Priority.NORMAL;
        if (maxRetries == null) maxRetries = 3;
        if (notes == null) notes = "";
    }
}
\`\`\`

**Why Record over Builder for DTOs:**
- Immutable by default (thread-safe)
- Less code (no getters/setters/equals/hashCode)
- Jackson deserializes directly
- Bean Validation works on constructor params

**Use Builder when:** 15+ fields, complex construction logic, test data factories.`,
    tags: ['builder', 'records', 'modern-java']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Facade Pattern',
    question: 'The delivery dispatch flow involves 5 services: validation, driver assignment, route optimization, notification, and event publishing. How do you simplify this for the controller?',
    modelAnswer: `Facade pattern — one entry point orchestrates multiple subsystems:

\`\`\`java
// The Facade — simple interface for the controller
@Service
public class DeliveryDispatchFacade {

    private final DeliveryValidator validator;
    private final DriverAssignmentService driverService;
    private final RouteOptimizer routeOptimizer;
    private final NotificationService notifier;
    private final EventPublisher events;

    @Transactional
    public DispatchResult dispatch(DispatchRequest request) {
        // Orchestrates 5 services behind one method
        validator.validateForDispatch(request);
        Driver driver = driverService.assignBestAvailable(request);
        Route route = routeOptimizer.optimize(request.getStops(), driver.getVehicle());
        Delivery delivery = createAndPersist(request, driver, route);
        notifier.notifyDriver(driver, delivery);
        events.publish(new DeliveryDispatched(delivery));
        return DispatchResult.success(delivery);
    }
}

// Controller stays thin
@PostMapping("/{id}/dispatch")
public ResponseEntity<DispatchResult> dispatch(@PathVariable Long id) {
    return ResponseEntity.ok(dispatchFacade.dispatch(new DispatchRequest(id)));
}
\`\`\`

**Facade vs Service:**
In practice, most @Service classes in Spring ARE facades — they orchestrate lower-level components. The pattern name just makes the intent explicit.`,
    tags: ['facade', 'orchestration', 'clean-code']
  }
];
