/**
 * Theory — Java 17+ Modern Features
 * Records, Sealed Classes, Pattern Matching, Text Blocks, Switch Expressions
 */
const theoryJavaModern = [
  {
    id: 'theory-java17-records',
    title: 'Java Records — Immutable Data Carriers',
    sections: [
      {
        heading: 'What are Records? (Java 16+)',
        content: `Records are immutable data classes with auto-generated equals, hashCode, toString, and accessors.

<pre><code>// Before Records — verbose DTO:
public class DeliveryDTO {
    private final Long id;
    private final String driverId;
    private final DeliveryStatus status;

    public DeliveryDTO(Long id, String driverId, DeliveryStatus status) {
        this.id = id;
        this.driverId = driverId;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getDriverId() { return driverId; }
    public DeliveryStatus getStatus() { return status; }

    @Override public boolean equals(Object o) { /* 15 lines */ }
    @Override public int hashCode() { /* ... */ }
    @Override public String toString() { /* ... */ }
}

// With Records — ONE LINE:
public record DeliveryDTO(Long id, String driverId, DeliveryStatus status) {}</code></pre>

<strong>What you get for free:</strong>
• Constructor with all fields
• Accessor methods: \`id()\`, \`driverId()\`, \`status()\` (no \`get\` prefix!)
• \`equals()\` comparing all fields
• \`hashCode()\` using all fields
• \`toString()\` showing all fields
• Immutability (fields are final)`
      },
      {
        heading: 'Records — validation and custom constructors',
        content: `<pre><code>public record CreateDeliveryRequest(
    @NotBlank String driverId,
    @NotNull @Future LocalDateTime scheduledAt,
    @Size(min = 1, max = 50) List&lt;StopRequest&gt; stops
) {
    // Compact constructor — validation
    public CreateDeliveryRequest {
        if (stops == null) stops = List.of();
        stops = List.copyOf(stops);  // defensive copy (truly immutable)
    }

    // Custom factory method
    public static CreateDeliveryRequest urgent(String driverId, List&lt;StopRequest&gt; stops) {
        return new CreateDeliveryRequest(driverId, LocalDateTime.now().plusHours(1), stops);
    }
}

// Usage:
var req = new CreateDeliveryRequest("D-42", tomorrow, stops);
String driver = req.driverId();  // no "get" prefix!
</code></pre>

<strong>When to use Records:</strong>
• DTOs (request/response)
• Value objects (Money, Coordinate, DateRange)
• Kafka event payloads
• Multi-value return types
• Map keys (auto equals/hashCode)

<strong>When NOT to use:</strong>
• JPA entities (need mutable state + no-arg constructor)
• Objects with complex lifecycle/behavior
• When you need inheritance (records are final)`
      }
    ]
  },
  {
    id: 'theory-java17-sealed',
    title: 'Sealed Classes — Controlled Hierarchies',
    sections: [
      {
        heading: 'Sealed classes (Java 17)',
        content: `Sealed classes restrict which classes can extend them — the compiler knows ALL subtypes.

<pre><code>// Only these 4 types of delivery events exist:
public sealed interface DeliveryEvent
    permits DeliveryPlanned, DeliveryDispatched, DeliveryCompleted, DeliveryFailed {

    String deliveryId();
    Instant timestamp();
}

public record DeliveryPlanned(String deliveryId, Instant timestamp, String driverId)
    implements DeliveryEvent {}

public record DeliveryDispatched(String deliveryId, Instant timestamp, String route)
    implements DeliveryEvent {}

public record DeliveryCompleted(String deliveryId, Instant timestamp, int stopsDelivered)
    implements DeliveryEvent {}

public record DeliveryFailed(String deliveryId, Instant timestamp, String reason)
    implements DeliveryEvent {}
</code></pre>

<strong>Why sealed?</strong>
• Compiler knows ALL cases → exhaustive switch (no default needed)
• Documents the domain clearly ("these are the ONLY event types")
• Prevents unexpected subtypes
• Enables pattern matching with guaranteed completeness`
      },
      {
        heading: 'Pattern matching with sealed types',
        content: `<pre><code>// Java 21: exhaustive switch with pattern matching
public String describe(DeliveryEvent event) {
    return switch (event) {
        case DeliveryPlanned p -> "Planned for driver " + p.driverId();
        case DeliveryDispatched d -> "Dispatched on route " + d.route();
        case DeliveryCompleted c -> c.stopsDelivered() + " stops delivered";
        case DeliveryFailed f -> "Failed: " + f.reason();
        // No default needed! Compiler knows all cases are covered.
    };
}

// If you add a new event type → compiler ERROR in every switch
// Forces you to handle the new case everywhere (safe evolution)</code></pre>

<strong>REWE transport example:</strong>
Delivery states are a CLOSED set. Using sealed + records ensures that every handler explicitly covers every possible state. Adding a new state becomes a compiler-assisted refactoring (not a runtime surprise).`
      }
    ]
  },
  {
    id: 'theory-java17-pattern',
    title: 'Pattern Matching & Text Blocks',
    sections: [
      {
        heading: 'Pattern matching for instanceof (Java 16+)',
        content: `<pre><code>// Before — cast after check (redundant):
if (event instanceof DeliveryCompleted) {
    DeliveryCompleted completed = (DeliveryCompleted) event;
    log.info("Delivered {} stops", completed.stopsDelivered());
}

// After — bind variable in the check:
if (event instanceof DeliveryCompleted completed) {
    log.info("Delivered {} stops", completed.stopsDelivered());
}

// Combined with switch (Java 21):
String message = switch (notification) {
    case SmsNotification sms -> "SMS to " + sms.phoneNumber();
    case EmailNotification email -> "Email to " + email.address();
    case PushNotification push -> "Push to device " + push.deviceId();
    default -> "Unknown channel";
};</code></pre>

<strong>Guards in patterns (Java 21):</strong>
<pre><code>switch (delivery) {
    case Delivery d when d.status() == DELAYED && d.priority() == HIGH
        -> escalateToManager(d);
    case Delivery d when d.status() == DELAYED
        -> notifyPlanner(d);
    case Delivery d
        -> processNormally(d);
}</code></pre>`
      },
      {
        heading: 'Text blocks (Java 15+)',
        content: `<pre><code>// Before — string concatenation hell:
String query = "SELECT d.id, d.status, dr.name " +
    "FROM delivery d " +
    "JOIN driver dr ON d.driver_id = dr.id " +
    "WHERE d.status = :status " +
    "ORDER BY d.scheduled_at";

// After — text blocks (preserves formatting):
String query = """
    SELECT d.id, d.status, dr.name
    FROM delivery d
    JOIN driver dr ON d.driver_id = dr.id
    WHERE d.status = :status
    ORDER BY d.scheduled_at
    """;

// JSON templates:
String json = """
    {
        "deliveryId": "%s",
        "status": "%s",
        "timestamp": "%s"
    }
    """.formatted(id, status, Instant.now());</code></pre>

<strong>Use for:</strong> SQL queries, JSON templates, HTML fragments, multi-line log messages, test data`
      },
      {
        heading: 'Switch expressions (Java 14+)',
        content: `<pre><code>// Old switch (statement — can forget break):
String label;
switch (status) {
    case PLANNED: label = "Waiting"; break;
    case DISPATCHED: label = "On the way"; break;
    default: label = "Unknown"; break;
}

// New switch (expression — returns value, no break, no fall-through):
String label = switch (status) {
    case PLANNED -> "Waiting";
    case DISPATCHED -> "On the way";
    case IN_TRANSIT -> "Moving";
    case DELIVERED -> "Done";
    default -> "Unknown";
};

// Multi-line blocks:
int priority = switch (delivery.getType()) {
    case EXPRESS -> {
        log.info("Express delivery detected");
        yield 1;  // 'yield' returns value from block
    }
    case SAME_DAY -> { yield 2; }
    default -> { yield 3; }
};</code></pre>`
      }
    ]
  }
];
