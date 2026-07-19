/**
 * Theory Content — Design Patterns (Logistics examples)
 */
const theoryDesignPatterns = [
  {
    id: 'theory-patterns-strategy',
    title: 'Strategy Pattern — Swappable Algorithms',
    sections: [
      {
        heading: 'What it solves',
        content: `When you have multiple ways to do the same thing and want to select at runtime without if/else chains.

<img src="assets/solid/o.webp" alt="Open/Closed — extend without modifying" style="width:100%; max-width:300px; border-radius:8px; margin: 12px 0; display:block;">

<strong>REWE example:</strong> Route optimization can use different algorithms depending on constraints (fastest, cheapest, eco-friendly). Instead of a giant switch, each algorithm implements a common interface.

<pre><code>// Strategy interface
public interface RouteStrategy {
    Route calculate(List&lt;Stop&gt; stops, Constraints constraints);
}

// Concrete strategies
@Component("fastest")
public class FastestRouteStrategy implements RouteStrategy {
    public Route calculate(List&lt;Stop&gt; stops, Constraints c) {
        // Dijkstra with time weights
    }
}

@Component("cheapest")
public class CheapestRouteStrategy implements RouteStrategy {
    public Route calculate(List&lt;Stop&gt; stops, Constraints c) {
        // Minimize fuel cost + tolls
    }
}

@Component("eco")
public class EcoRouteStrategy implements RouteStrategy {
    public Route calculate(List&lt;Stop&gt; stops, Constraints c) {
        // Minimize CO2 emissions
    }
}

// Context — selects strategy at runtime
@Service
public class RouteService {
    private final Map&lt;String, RouteStrategy&gt; strategies;

    public RouteService(Map&lt;String, RouteStrategy&gt; strategies) {
        this.strategies = strategies; // Spring injects all implementations!
    }

    public Route optimize(List&lt;Stop&gt; stops, String mode) {
        RouteStrategy strategy = strategies.get(mode);
        return strategy.calculate(stops, Constraints.defaults());
    }
}</code></pre>

<strong>Adding a new algorithm = one new class. Zero changes to RouteService.</strong>`
      }
    ]
  },
  {
    id: 'theory-patterns-factory',
    title: 'Factory Pattern — Object Creation Logic',
    sections: [
      {
        heading: 'What it solves',
        content: `When object creation is complex or depends on runtime conditions. Centralizes the "which class to instantiate" decision.

<pre><code>// Problem: scattered creation logic
if (type.equals("STANDARD")) {
    delivery = new StandardDelivery(driver, route);
} else if (type.equals("EXPRESS")) {
    delivery = new ExpressDelivery(driver, route, priorityFee);
} else if (type.equals("SAME_DAY")) {
    delivery = new SameDayDelivery(driver, route, deadline);
}

// Solution: Factory
@Component
public class DeliveryFactory {

    public Delivery create(DeliveryType type, Driver driver, Route route) {
        return switch (type) {
            case STANDARD -> new StandardDelivery(driver, route);
            case EXPRESS -> new ExpressDelivery(driver, route, calculatePriorityFee(route));
            case SAME_DAY -> new SameDayDelivery(driver, route, calculateDeadline());
        };
    }
}

// Usage — clean and centralized
Delivery delivery = deliveryFactory.create(request.getType(), driver, route);</code></pre>

<strong>When to use:</strong>
• Object creation involves conditional logic
• You want to hide implementation classes from the caller
• Creation requires external dependencies or calculations

<strong>When NOT to use:</strong>
• Simple \`new ClassName()\` — don't over-engineer`
      }
    ]
  },
  {
    id: 'theory-patterns-observer',
    title: 'Observer Pattern — Event Notification',
    sections: [
      {
        heading: 'What it solves',
        content: `When one event needs to trigger multiple reactions without the source knowing about the listeners.

<pre><code>// In Spring Boot — ApplicationEvent (built-in observer)
public class DeliveryCompletedEvent extends ApplicationEvent {
    private final Delivery delivery;
    public DeliveryCompletedEvent(Object source, Delivery delivery) {
        super(source);
        this.delivery = delivery;
    }
}

// Publisher (doesn't know who listens)
@Service
public class DeliveryService {
    private final ApplicationEventPublisher events;

    public void complete(Long id) {
        Delivery d = repo.findById(id).orElseThrow();
        d.complete();
        repo.save(d);
        events.publishEvent(new DeliveryCompletedEvent(this, d));
    }
}

// Listener 1 — billing
@Component
public class BillingListener {
    @EventListener
    public void onDeliveryCompleted(DeliveryCompletedEvent e) {
        invoiceService.createInvoice(e.getDelivery());
    }
}

// Listener 2 — notification
@Component
public class NotificationListener {
    @EventListener
    public void onDeliveryCompleted(DeliveryCompletedEvent e) {
        smsService.notifyCustomer(e.getDelivery());
    }
}
// Adding a new listener = one new class. Publisher unchanged.</code></pre>

<strong>Spring vs Kafka for observer:</strong>
• Spring @EventListener: within same JVM, same transaction context
• Kafka: across services, persistent, replayable, independent failure`
      }
    ]
  },
  {
    id: 'theory-patterns-builder',
    title: 'Builder Pattern — Complex Object Construction',
    sections: [
      {
        heading: 'What it solves',
        content: `When an object has many optional parameters and telescoping constructors become unreadable.

<pre><code>// Problem: constructor with 8 parameters
new Delivery(driverId, routeId, scheduledAt, priority, maxStops, vehicleType, notes, customerId);
// Which parameter is which? Easy to swap two strings by mistake.

// Solution: Builder
Delivery delivery = Delivery.builder()
    .driverId("D-42")
    .routeId("R-7")
    .scheduledAt(LocalDateTime.now().plusHours(2))
    .priority(Priority.HIGH)
    .maxStops(15)
    .vehicleType(VehicleType.VAN)
    .notes("Fragile items")
    .build();

// Implementation (or use Lombok @Builder)
public class Delivery {
    private final String driverId;
    private final String routeId;
    // ... all fields final

    private Delivery(Builder builder) {
        this.driverId = builder.driverId;
        this.routeId = builder.routeId;
        // ...
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String driverId;
        private String routeId;
        // ...
        public Builder driverId(String id) { this.driverId = id; return this; }
        public Builder routeId(String id) { this.routeId = id; return this; }
        public Delivery build() { return new Delivery(this); }
    }
}</code></pre>

<strong>In practice:</strong> Use Lombok's \`@Builder\` or Java records (for simple cases). Hand-write only when you need validation in \`build()\`.`
      }
    ]
  }
];
