/**
 * Theory/Learn Content — Organized by topic
 * Each entry has: id, title, sections with markdown-like content
 */
const theoryContent = {

  'collections': [
    {
      id: 'theory-collections-overview',
      title: 'Collections Framework — Overview',
      sections: [
        {
          heading: 'What is the Collections Framework?',
          content: `The Java Collections Framework provides data structures and algorithms for storing, retrieving and manipulating groups of objects.

It is organized around <strong>interfaces</strong> (what you can do) and <strong>implementations</strong> (how it's done):

<pre><code>Iterable
  └── Collection
        ├── List    → ordered, allows duplicates
        ├── Set     → unique elements
        └── Queue   → FIFO processing

Map (separate hierarchy) → key-value pairs</code></pre>

<strong>Golden rule:</strong> Declare using the interface, instantiate using the implementation:
<pre><code>List&lt;String&gt; stops = new ArrayList&lt;&gt;();  // ✓ program to interface
ArrayList&lt;String&gt; stops = new ArrayList&lt;&gt;();  // ✗ coupled to implementation</code></pre>`
        },
        {
          heading: 'When to use which?',
          content: `<table>
<tr><th>Need</th><th>Use</th><th>Example</th></tr>
<tr><td>Ordered items, may have duplicates</td><td><code>ArrayList</code></td><td>Delivery stops in order</td></tr>
<tr><td>Unique items, no order needed</td><td><code>HashSet</code></td><td>Assigned driver IDs today</td></tr>
<tr><td>Unique items, sorted</td><td><code>TreeSet</code></td><td>Delivery times sorted</td></tr>
<tr><td>Key → Value lookup</td><td><code>HashMap</code></td><td>Cache delivery by ID</td></tr>
<tr><td>Key → Value, sorted keys</td><td><code>TreeMap</code></td><td>Schedule by time window</td></tr>
<tr><td>Insertion-order map</td><td><code>LinkedHashMap</code></td><td>Recently accessed cache</td></tr>
<tr><td>FIFO processing</td><td><code>ArrayDeque</code></td><td>Task queue</td></tr>
</table>`
        }
      ]
    },
    {
      id: 'theory-collections-list',
      title: 'List — ArrayList and LinkedList',
      sections: [
        {
          heading: 'ArrayList',
          content: `Backed by a resizable array. The <strong>default choice</strong> for most use cases.

<strong>Performance:</strong>
• get(index): O(1) — direct array access
• add(element): O(1) amortized (resizes when full, doubles capacity)
• add(index, element): O(n) — shifts elements right
• remove(index): O(n) — shifts elements left
• contains(element): O(n) — linear scan

<pre><code>List&lt;String&gt; stops = new ArrayList&lt;&gt;();
stops.add("Warehouse");       // append at end
stops.add("Store A");
stops.add(1, "Priority");     // insert at index 1, shifts others
stops.get(0);                 // "Warehouse" — O(1)
stops.remove(0);              // removes "Warehouse", shifts left
stops.size();                 // 2</code></pre>

<strong>When to use:</strong> Almost always. CPU cache locality makes it faster than LinkedList even for insertions in practice.`
        },
        {
          heading: 'LinkedList',
          content: `Doubly-linked list. Each element points to previous and next.

<strong>Performance:</strong>
• get(index): O(n) — must traverse from start/end
• add at start/end: O(1)
• add/remove in middle (if you have the node): O(1)
• contains: O(n)

<pre><code>LinkedList&lt;String&gt; queue = new LinkedList&lt;&gt;();
queue.addFirst("urgent");     // O(1) at head
queue.addLast("normal");      // O(1) at tail
queue.removeFirst();          // O(1) poll from head</code></pre>

<strong>When to use:</strong> Rarely. Only when you need frequent add/remove at both ends (use as Deque). For most list operations, ArrayList wins due to cache performance.`
        },
        {
          heading: 'Key interview point',
          content: `<strong>"When would you use LinkedList over ArrayList?"</strong>

The honest answer: Almost never in practice. ArrayList has better cache locality (elements contiguous in memory). LinkedList has pointer overhead per element. Even for frequent insertions, ArrayList usually wins.

Exception: Using it as a Deque (double-ended queue) where you only add/remove from ends. But ArrayDeque is often better there too.

<strong>The real interview insight:</strong> Know the Big-O differences, but also know that in practice, ArrayList dominates because modern CPUs heavily favor sequential memory access.`
        }
      ]
    },
    {
      id: 'theory-collections-map',
      title: 'Map — HashMap, TreeMap, LinkedHashMap',
      sections: [
        {
          heading: 'HashMap — The Workhorse',
          content: `Stores key-value pairs. O(1) average for get/put.

<strong>How it works internally:</strong>
1. Call <code>key.hashCode()</code> → integer
2. Compute bucket index: <code>hash & (capacity - 1)</code>
3. If bucket empty → store entry directly
4. If bucket occupied → collision:
   • Java 7: linked list in bucket
   • Java 8+: linked list → red-black tree when chain > 8 entries

<pre><code>Map&lt;Long, Delivery&gt; cache = new HashMap&lt;&gt;();
cache.put(1001L, delivery);              // store
Delivery d = cache.get(1001L);           // O(1) lookup
cache.containsKey(1001L);                // O(1)
cache.getOrDefault(9999L, fallback);     // default if missing
cache.putIfAbsent(1001L, newDelivery);   // only if key missing

// Iteration:
for (Map.Entry&lt;Long, Delivery&gt; e : cache.entrySet()) {
    Long id = e.getKey();
    Delivery del = e.getValue();
}</code></pre>

<strong>Critical: equals/hashCode contract</strong>
If you use a custom object as key:
• If <code>a.equals(b)</code> → <code>a.hashCode() == b.hashCode()</code> MUST be true
• Without this, HashMap cannot find your entries`
        },
        {
          heading: 'TreeMap — Sorted Keys',
          content: `Red-black tree. Keys maintained in sorted order. O(log n) operations.

<pre><code>TreeMap&lt;LocalTime, Delivery&gt; schedule = new TreeMap&lt;&gt;();
schedule.put(LocalTime.of(8, 0), morning);
schedule.put(LocalTime.of(14, 0), afternoon);

// Range queries:
schedule.subMap(start, end);    // entries between start and end
schedule.firstKey();            // earliest time
schedule.lastKey();             // latest time
schedule.headMap(noon);         // all before noon</code></pre>

<strong>When to use:</strong> When you need sorted keys, range queries, or first/last access. Delivery scheduling by time window is a perfect use case.`
        },
        {
          heading: 'LinkedHashMap — Insertion Order',
          content: `HashMap + doubly-linked list maintaining insertion order.

<pre><code>Map&lt;String, Integer&gt; accessLog = new LinkedHashMap&lt;&gt;();
accessLog.put("route-A", 1);
accessLog.put("route-B", 2);
accessLog.put("route-C", 3);
// Iteration always: route-A → route-B → route-C</code></pre>

<strong>LRU Cache trick:</strong> Override <code>removeEldestEntry()</code> to auto-evict when size exceeds limit:
<pre><code>new LinkedHashMap&lt;&gt;(16, 0.75f, true) {  // accessOrder=true
    protected boolean removeEldestEntry(Map.Entry eldest) {
        return size() > MAX_CACHE_SIZE;
    }
};</code></pre>`
        }
      ]
    },
    {
      id: 'theory-collections-set',
      title: 'Set — HashSet, TreeSet',
      sections: [
        {
          heading: 'HashSet — Unique Elements',
          content: `Backed by HashMap internally (values are a dummy constant). O(1) add/contains/remove.

<pre><code>Set&lt;String&gt; assignedDrivers = new HashSet&lt;&gt;();
assignedDrivers.add("driver-101");   // true (added)
assignedDrivers.add("driver-101");   // false (duplicate ignored)
assignedDrivers.contains("driver-101");  // O(1)
assignedDrivers.size();              // 1</code></pre>

<strong>When to use:</strong> When the business rule IS uniqueness — unique stops, unique IDs, deduplication.

<strong>Requires:</strong> Proper <code>equals()</code> and <code>hashCode()</code> on the element type. Without them, "equal" objects can appear as duplicates.`
        },
        {
          heading: 'Useful operations',
          content: `<pre><code>Set&lt;String&gt; a = new HashSet&lt;&gt;(List.of("A", "B", "C"));
Set&lt;String&gt; b = new HashSet&lt;&gt;(List.of("B", "C", "D"));

// Union
Set&lt;String&gt; union = new HashSet&lt;&gt;(a);
union.addAll(b);  // [A, B, C, D]

// Intersection
Set&lt;String&gt; common = new HashSet&lt;&gt;(a);
common.retainAll(b);  // [B, C]

// Difference
Set&lt;String&gt; onlyA = new HashSet&lt;&gt;(a);
onlyA.removeAll(b);  // [A]</code></pre>

<strong>Interview tip:</strong> "Find common elements between two lists" → convert to Sets and use retainAll(). O(n) instead of O(n²) nested loops.`
        }
      ]
    },
    {
      id: 'theory-collections-streams',
      title: 'Streams API — Transform Collections',
      sections: [
        {
          heading: 'What are Streams?',
          content: `Streams provide a <strong>declarative pipeline</strong> for processing collections. Instead of writing loops, you describe WHAT to do with the data.

<pre><code>// Imperative (loop):
List&lt;String&gt; lateDrivers = new ArrayList&lt;&gt;();
for (Delivery d : deliveries) {
    if (d.isLate()) {
        lateDrivers.add(d.getDriverName());
    }
}

// Declarative (stream):
List&lt;String&gt; lateDrivers = deliveries.stream()
    .filter(d -> d.isLate())
    .map(Delivery::getDriverName)
    .collect(Collectors.toList());</code></pre>

<strong>Key concepts:</strong>
• <strong>Lazy:</strong> nothing happens until a terminal operation is called
• <strong>Single-use:</strong> a stream can only be consumed once
• <strong>Non-mutating:</strong> the original collection is unchanged`
        },
        {
          heading: 'Common operations',
          content: `<strong>Intermediate (return a stream — lazy):</strong>
<pre><code>.filter(predicate)        // keep elements matching condition
.map(function)            // transform each element
.flatMap(function)        // flatten nested collections
.sorted()                 // natural order
.sorted(comparator)       // custom order
.distinct()               // remove duplicates
.limit(n)                 // take first n
.skip(n)                  // skip first n
.peek(consumer)           // debug: look without consuming</code></pre>

<strong>Terminal (trigger processing — produce result):</strong>
<pre><code>.collect(Collectors.toList())    // to List
.collect(Collectors.toSet())     // to Set
.collect(Collectors.groupingBy(fn))  // to Map&lt;K, List&lt;V&gt;&gt;
.count()                         // number of elements
.findFirst()                     // Optional&lt;T&gt;
.anyMatch(predicate)             // boolean: any match?
.allMatch(predicate)             // boolean: all match?
.forEach(consumer)               // side effect (use carefully)
.reduce(identity, accumulator)   // combine all into one value
.toList()                        // Java 16+ shortcut</code></pre>`
        },
        {
          heading: 'Real examples',
          content: `<pre><code>// Group deliveries by status
Map&lt;Status, List&lt;Delivery&gt;&gt; byStatus = deliveries.stream()
    .collect(Collectors.groupingBy(Delivery::getStatus));

// Total weight of all deliveries
double totalWeight = deliveries.stream()
    .mapToDouble(Delivery::getWeight)
    .sum();

// Find the delivery with longest distance
Optional&lt;Delivery&gt; longest = deliveries.stream()
    .max(Comparator.comparing(Delivery::getDistance));

// Unique driver names, sorted
List&lt;String&gt; drivers = deliveries.stream()
    .map(Delivery::getDriverName)
    .distinct()
    .sorted()
    .collect(Collectors.toList());

// Comma-separated IDs
String ids = deliveries.stream()
    .map(d -> d.getId().toString())
    .collect(Collectors.joining(", "));</code></pre>`
        },
        {
          heading: 'Optional — No more NullPointerException',
          content: `Optional&lt;T&gt; represents a value that may or may not be present. Forces you to handle the "missing" case explicitly.

<pre><code>// Creating:
Optional&lt;Delivery&gt; found = Optional.ofNullable(result);  // may be null
Optional&lt;Delivery&gt; sure = Optional.of(delivery);         // never null
Optional&lt;Delivery&gt; empty = Optional.empty();             // explicitly empty

// Using:
found.orElseThrow(() -> new NotFoundException("Not found"));
found.orElse(defaultDelivery);
found.ifPresent(d -> process(d));
found.map(Delivery::getDriverName).orElse("Unknown");

// ❌ NEVER do this:
if (optional.isPresent()) {
    return optional.get();  // defeats the purpose!
}

// ✓ Instead:
return optional.orElseThrow(() -> new NotFoundException(...));</code></pre>

<strong>Rule:</strong> Use Optional as method return type to signal "might not exist". Never use as field type or method parameter.`
        }
      ]
    }
  ],

  'oop': [
    {
      id: 'theory-oop-overview',
      title: 'OOP — The Four Pillars',
      sections: [
        {
          heading: 'Object-Oriented Programming in Java',
          content: `OOP organizes code around <strong>objects</strong> that combine state (fields) and behavior (methods). Java is fundamentally OOP — everything lives inside classes.

The four pillars (interview staple):

<strong>1. Encapsulation</strong> — Protect internal state. Control access through methods.
<strong>2. Abstraction</strong> — Hide complexity. Expose only what matters.
<strong>3. Inheritance</strong> — Share behavior through type hierarchies.
<strong>4. Polymorphism</strong> — Same interface, different implementations.

<strong>Interview tip:</strong> They will NOT ask "define the four pillars." They will ask "where did you USE polymorphism?" Always answer with a real example, not a definition.`
        },
        {
          heading: 'What interviewers REALLY want to hear',
          content: `Don't say: "Encapsulation is making fields private."
<strong>Say:</strong> "Encapsulation protects business invariants — a Delivery entity controls its own state transitions through domain methods like dispatch() and complete(), preventing invalid states."

Don't say: "Polymorphism is calling the same method on different objects."
<strong>Say:</strong> "We had a notification flow where each channel implemented a common interface. Adding a new channel meant one new class, zero changes to existing code."

Don't say: "Inheritance is code reuse."
<strong>Say:</strong> "I use inheritance for stable is-a relationships. For code reuse, I prefer composition — injecting collaborators rather than inheriting a base class."

<strong>The pattern:</strong> Concept → Real example → Benefit → Trade-off`
        }
      ]
    },
    {
      id: 'theory-oop-encapsulation',
      title: 'Encapsulation — Beyond Private Fields',
      sections: [
        {
          heading: 'What it really means',
          content: `Encapsulation is NOT just making fields private. It is about <strong>protecting the valid state</strong> of an object.

<strong>Weak encapsulation</strong> (just data hiding):
<pre><code>class Delivery {
    private DeliveryStatus status;
    public void setStatus(DeliveryStatus s) { this.status = s; }
    // Anyone can set ANY status at ANY time!
}</code></pre>

<strong>Real encapsulation</strong> (protecting invariants):
<pre><code>class Delivery {
    private DeliveryStatus status = DeliveryStatus.PLANNED;

    public void dispatch() {
        if (status != DeliveryStatus.PLANNED)
            throw new IllegalStateException("Only planned deliveries can be dispatched");
        this.status = DeliveryStatus.DISPATCHED;
    }

    public void complete() {
        if (status != DeliveryStatus.DISPATCHED)
            throw new IllegalStateException("Only dispatched deliveries can be completed");
        this.status = DeliveryStatus.COMPLETED;
    }
}</code></pre>

The object <strong>controls which transitions are valid</strong>. Invalid states become impossible.`
        },
        {
          heading: '30-second interview answer',
          content: `<strong>"What is encapsulation?"</strong>

"For me, encapsulation is not only about making fields private. It is about protecting the valid state of an object. Instead of exposing setters, I expose domain operations like <code>dispatch()</code> and <code>complete()</code>. These methods validate whether the transition is allowed and prevent invalid objects from existing.

In our logistics system, a delivery entity controlled its own status transitions — preventing impossible states like completing a delivery that was never dispatched."`
        }
      ]
    },
    {
      id: 'theory-oop-abstraction',
      title: 'Abstraction — Hide Complexity, Expose Contracts',
      sections: [
        {
          heading: 'What it means',
          content: `Abstraction hides <strong>how</strong> something works and exposes only <strong>what</strong> it does through a contract (interface).

<pre><code>// The abstraction (contract):
public interface LogisticsEventPublisher {
    void publishDeliveryPlanned(Delivery delivery);
    void publishDeliveryCompleted(Delivery delivery);
}

// The business service depends on the contract:
@Service
public class DeliveryService {
    private final LogisticsEventPublisher events; // doesn't know about Kafka!

    public void planDelivery(DeliveryRequest req) {
        Delivery d = Delivery.from(req);
        repository.save(d);
        events.publishDeliveryPlanned(d);  // WHAT, not HOW
    }
}

// The implementation (hidden details):
@Component
public class KafkaLogisticsEventPublisher implements LogisticsEventPublisher {
    private final KafkaTemplate&lt;String, LogisticsEvent&gt; kafka;

    public void publishDeliveryPlanned(Delivery d) {
        kafka.send("delivery-planned", d.getId().toString(), toEvent(d));
    }
}</code></pre>

The business service never imports Kafka. If we switch to RabbitMQ, only the implementation changes — zero business code modifications.`
        },
        {
          heading: 'When NOT to abstract',
          content: `Not every class needs an interface. Create abstractions at <strong>meaningful boundaries</strong>:

<strong>✅ Abstract when:</strong>
• Infrastructure boundary (DB, messaging, external APIs)
• Multiple implementations exist or are realistic
• Test isolation requires it (mock the interface)
• Different teams own different sides

<strong>❌ Don't abstract when:</strong>
• Only one implementation will ever exist
• Internal helper classes
• It adds a file without adding a design decision
• YAGNI — You Aren't Gonna Need It

<strong>Interview answer:</strong> "I don't create interfaces for every class. I introduce abstractions where they represent a real boundary — between business logic and infrastructure, where I need test isolation, or where multiple implementations are realistic."`
        }
      ]
    },
    {
      id: 'theory-oop-inheritance',
      title: 'Inheritance — Is-A Relationships',
      sections: [
        {
          heading: 'When inheritance IS appropriate',
          content: `Inheritance represents a genuine <strong>is-a</strong> relationship where the subtype can safely substitute the parent.

<strong>Good examples:</strong>
<pre><code>// Exception hierarchy (stable, genuine is-a)
class DeliveryException extends RuntimeException { }
class DeliveryNotFoundException extends DeliveryException { }

// JPA MappedSuperclass (shared identity/audit)
@MappedSuperclass
abstract class AuditableEntity {
    @Id private Long id;
    private LocalDateTime createdAt;
    private String createdBy;
}

class Delivery extends AuditableEntity { ... }  // IS-A auditable entity</code></pre>

<strong>Criteria for using inheritance:</strong>
1. Genuine is-a relationship in the domain
2. Subtype can FULLY replace parent (Liskov)
3. Hierarchy is STABLE (rarely changes)
4. Shallow (1-2 levels max)
5. Shared behavior is semantically cohesive`
        },
        {
          heading: 'When inheritance goes WRONG',
          content: `<strong>Anti-pattern: BaseService for code reuse</strong>
<pre><code>// ❌ Inheritance for CONVENIENCE, not is-a
abstract class BaseLogisticsService {
    @Inject protected EntityManager em;
    @Inject protected KafkaTemplate kafka;
    @Inject protected NotificationService notifier;
    @Inject protected AuditLogger audit;
    @Inject protected MetricsService metrics;
}

class DeliveryService extends BaseLogisticsService { ... }
class RouteService extends BaseLogisticsService { ... }
// 40+ services inherit 5 dependencies they may not all need</code></pre>

<strong>Problems:</strong>
• All subclasses get ALL dependencies (even unused)
• Changes to base class affect all 40+ subclasses (fragile base class)
• Testing requires setting up all inherited dependencies
• Not a real is-a relationship (DeliveryService is NOT a BaseLogisticsService)

<strong>Fix: Composition</strong>
<pre><code>// ✅ Each service declares ONLY what it needs
@Service
class DeliveryService {
    private final DeliveryRepository repo;
    private final LogisticsEventPublisher events;
    // Only 2 dependencies, not 5
}</code></pre>`
        },
        {
          heading: '30-second interview answer',
          content: `<strong>"When is inheritance appropriate?"</strong>

"I use inheritance when there is a genuine and stable is-a relationship — the subtype can safely replace the parent everywhere. Exception hierarchies and JPA mapped superclasses for shared audit fields are good examples.

I avoid using inheritance just to reuse code. A base service with 5 protected dependencies creates tight coupling. I prefer composition — inject only what you need. The key question is: will this hierarchy be stable for years, or will it become a maintenance burden?"`
        }
      ]
    },
    {
      id: 'theory-oop-polymorphism',
      title: 'Polymorphism — Same Contract, Different Behavior',
      sections: [
        {
          heading: 'Runtime polymorphism',
          content: `Different implementations of the same contract, selected at runtime based on actual object type.

<pre><code>// The contract
public interface LogisticsNotificationHandler {
    NotificationType supportedType();
    void send(DeliveryEvent event);
}

// Implementation 1: Driver notification
@Component
public class DriverNotificationHandler implements LogisticsNotificationHandler {
    public NotificationType supportedType() { return NotificationType.DRIVER; }
    public void send(DeliveryEvent event) {
        pushService.sendToDriver(event.getDriverId(), event.getMessage());
    }
}

// Implementation 2: Warehouse notification
@Component
public class WarehouseNotificationHandler implements LogisticsNotificationHandler {
    public NotificationType supportedType() { return NotificationType.WAREHOUSE; }
    public void send(DeliveryEvent event) {
        dashboardService.updateWarehouse(event.getWarehouseId(), event);
    }
}

// The service selects at runtime:
@Service
public class NotificationService {
    private final Map&lt;NotificationType, LogisticsNotificationHandler&gt; handlers;

    public NotificationService(List&lt;LogisticsNotificationHandler&gt; all) {
        this.handlers = all.stream()
            .collect(Collectors.toMap(h -> h.supportedType(), h -> h));
    }

    public void send(NotificationType type, DeliveryEvent event) {
        handlers.get(type).send(event);  // polymorphic dispatch
    }
}</code></pre>

Adding NEO platform notifications = one new class. Zero changes to existing code.`
        },
        {
          heading: 'When polymorphism is NOT worth it',
          content: `<strong>Don't use polymorphism when:</strong>
• Only 2 simple cases with trivial logic → switch is clearer
• Cases are stable and unlikely to grow
• Each "implementation" is 1-2 lines
• The indirection makes code harder to follow

<strong>Use polymorphism when:</strong>
• 3+ cases with independent, complex logic
• New cases are added regularly
• Each case has different dependencies
• Cases need independent testing
• You want Open/Closed (new behavior without modifying existing code)

<pre><code>// ✅ Switch is FINE for this:
String label = switch (status) {
    case PLANNED -> "Waiting";
    case DISPATCHED -> "On the way";
    case DELIVERED -> "Done";
};

// ✅ Polymorphism is BETTER for this:
// 6+ notification channels, each with complex logic,
// different dependencies, growing every quarter</code></pre>`
        },
        {
          heading: '30-second interview answer',
          content: `<strong>"Where did you use polymorphism?"</strong>

"In our system, we had a notification flow where different channels — email, SMS, push, webhook — each implemented a common NotificationHandler interface. The dispatcher selected the correct handler at runtime based on the channel type.

Adding a new channel meant creating one class implementing the interface. No modification to the dispatcher or existing handlers. Each handler was independently testable.

The trade-off is more classes and indirection. For only 2-3 simple cases, a switch would be simpler. In our case with 6+ channels that evolved independently, polymorphism was clearly justified."`
        }
      ]
    },
    {
      id: 'theory-oop-composition',
      title: 'Composition — Assemble from Parts',
      sections: [
        {
          heading: 'What composition means',
          content: `Composition = building behavior by combining independent components (injected as dependencies) rather than inheriting from a base class.

<pre><code>@Service
public class DeliveryPlanningService {

    private final DeliveryRepository repository;
    private final RouteValidator validator;
    private final LogisticsEventPublisher events;
    private final DriverNotificationService notifier;

    // Constructor injection — explicit, immutable, testable
    public DeliveryPlanningService(
            DeliveryRepository repository,
            RouteValidator validator,
            LogisticsEventPublisher events,
            DriverNotificationService notifier) {
        this.repository = repository;
        this.validator = validator;
        this.events = events;
        this.notifier = notifier;
    }

    public Delivery planDelivery(DeliveryRequest request) {
        validator.validate(request);             // delegate to validator
        Delivery d = Delivery.from(request);
        repository.save(d);                      // delegate to repo
        events.publishDeliveryPlanned(d);        // delegate to publisher
        notifier.notifyDriver(d);                // delegate to notifier
        return d;
    }
}</code></pre>

Each component has ONE responsibility. The service orchestrates. Test by mocking only what you need.`
        },
        {
          heading: 'Why prefer composition over inheritance',
          content: `<table>
<tr><th></th><th>Inheritance</th><th>Composition</th></tr>
<tr><td>Coupling</td><td>Strong — base change breaks all</td><td>Loose — components independent</td></tr>
<tr><td>Dependencies</td><td>Inherits ALL (even unused)</td><td>Declares ONLY what needed</td></tr>
<tr><td>Testing</td><td>Must setup entire hierarchy</td><td>Mock only real dependencies</td></tr>
<tr><td>Flexibility</td><td>Single hierarchy (Java)</td><td>Compose from many sources</td></tr>
<tr><td>Readability</td><td>Hidden inherited behavior</td><td>Explicit constructor dependencies</td></tr>
<tr><td>When to use</td><td>Stable is-a relationships</td><td>Has-a / uses-a relationships</td></tr>
</table>

<strong>Connection to DI:</strong> Dependency Injection is the MECHANISM that enables composition. CDI (@Inject) or Spring (constructor injection) provides the components. The PRINCIPLE is composition; the TECHNIQUE is DI.`
        },
        {
          heading: '30-second interview answer',
          content: `<strong>"Why composition over inheritance?"</strong>

"I prefer composition because dependencies are explicit — visible in the constructor. Each component is independently replaceable and testable. The service declares ONLY what it needs.

In our systems, we moved away from a BaseService pattern that inherited 5 dependencies into every service. Now each service composes exactly what it needs via constructor injection. Testing went from 'mock everything' to 'mock only the 2 things this service actually uses.'

The trade-off is more classes. But explicitness and testability outweigh the file count."`
        }
      ]
    },
    {
      id: 'theory-oop-solid',
      title: 'SOLID Principles — Applied to Logistics',
      sections: [
        {
          heading: 'S — Single Responsibility Principle',
          content: `A class should have <strong>one reason to change</strong>.

<pre><code>// ❌ Multiple responsibilities:
class DeliveryService {
    void planDelivery() { ... }     // planning logic
    void calculatePrice() { ... }   // pricing logic
    void sendNotification() { ... } // notification logic
    void generateInvoice() { ... }  // invoicing logic
    void trackAnalytics() { ... }   // analytics logic
}

// ✅ Single responsibility each:
class DeliveryPlanningService { void plan() { ... } }
class DeliveryPricingCalculator { BigDecimal calculate() { ... } }
class DriverNotifier { void notify() { ... } }
class InvoiceGenerator { void generate() { ... } }
class DeliveryAnalytics { void track() { ... } }</code></pre>

<strong>SRP does NOT mean:</strong>
• One method per class (that's too granular)
• Splitting everything into tiny files
• No class can ever grow

<strong>SRP MEANS:</strong> group things that change for the same reason. Pricing rules change independently from notification channels.`
        },
        {
          heading: 'O — Open/Closed Principle',
          content: `Open for extension, closed for modification. Add new behavior by creating new code, not changing existing code.

<pre><code>// ❌ Must modify to add new channel:
void send(Channel ch) {
    if (ch == EMAIL) sendEmail();
    else if (ch == SMS) sendSms();
    // Must add else-if for PUSH, WEBHOOK, SLACK...
}

// ✅ Open for extension (new class = new channel):
interface NotificationChannel { void send(Event e); }

class EmailChannel implements NotificationChannel { ... }
class SmsChannel implements NotificationChannel { ... }
class PushChannel implements NotificationChannel { ... }  // NEW — no changes elsewhere</code></pre>

<strong>Apply when:</strong> variation is real and growing (new channels, new document types, new strategies).
<strong>Don't force:</strong> if something changed once in 2 years, a switch is fine.`
        },
        {
          heading: 'L — Liskov Substitution Principle',
          content: `A subtype must be <strong>safely substitutable</strong> for its parent type without breaking behavior.

<pre><code>// ❌ Violation — ReadOnlyRepo breaks the parent contract:
interface Repository&lt;T&gt; {
    T findById(Long id);
    void save(T entity);    // contract promises this works
}

class ReadOnlyRepository implements Repository&lt;Delivery&gt; {
    void save(Delivery d) {
        throw new UnsupportedOperationException(); // BREAKS the contract!
    }
}

// ✅ Fix — segregate interfaces:
interface ReadRepository&lt;T&gt; { T findById(Long id); }
interface WriteRepository&lt;T&gt; extends ReadRepository&lt;T&gt; { void save(T entity); }

// ReadOnly implements only ReadRepository — no broken promise</code></pre>

<strong>Rule of thumb:</strong> If a method override throws UnsupportedOperationException, you probably have an LSP violation. The fix is usually interface segregation.`
        },
        {
          heading: 'I — Interface Segregation Principle',
          content: `Clients should not depend on methods they do not use. Split fat interfaces into focused ones.

<pre><code>// ❌ Fat interface — forces implementations to stub methods:
interface LogisticsPlatform {
    void planDelivery();
    void trackDelivery();
    void generateInvoice();
    void notifyDriver();
    void scheduleRoute();
    void archiveDelivery();
}
// A tracking-only service is FORCED to see all methods

// ✅ Segregated — each client depends only on what it needs:
interface DeliveryPlanner { void planDelivery(); }
interface DeliveryTracker { void trackDelivery(); }
interface InvoiceGenerator { void generateInvoice(); }
interface DriverCommunication { void notifyDriver(); }</code></pre>

<strong>For the REWE NEO platform:</strong> CommunicationPlugin base interface is minimal (just <code>send()</code>). Optional capabilities (Schedulable, Archivable) are separate interfaces that plugins opt into.`
        },
        {
          heading: 'D — Dependency Inversion Principle',
          content: `High-level business logic depends on <strong>abstractions</strong>, not on low-level infrastructure details.

<pre><code>// ❌ Business depends on infrastructure:
@Service
class DeliveryService {
    private final KafkaTemplate kafka;   // knows about Kafka!
    private final JdbcTemplate jdbc;     // knows about JDBC!
}

// ✅ Business depends on abstractions:
@Service
class DeliveryService {
    private final DeliveryRepository repo;            // interface
    private final LogisticsEventPublisher events;     // interface
}

// Infrastructure IMPLEMENTS the abstractions:
@Component class JpaDeliveryRepository implements DeliveryRepository { ... }
@Component class KafkaEventPublisher implements LogisticsEventPublisher { ... }</code></pre>

<strong>Key insight:</strong> The interface is defined BY the business layer (what it needs). Infrastructure implements it (how it's done). This INVERTS the dependency direction — infrastructure depends on business abstractions, not the reverse.

<strong>DIP ≠ DI:</strong>
• DIP = principle (depend on abstractions)
• DI = technique (provide dependencies externally)
• CDI/Spring = containers that implement DI`
        }
      ]
    }
  ]
};
