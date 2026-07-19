/**
 * Theory Content — SOLID Principles in Pictures & Code
 * Inspired by Ugonna Thelma's visual metaphors
 * (https://medium.com/backticks-tildes/the-s-o-l-i-d-principles-in-pictures-b34ce2f1e898)
 */
const theorySolid = [
  {
    id: 'theory-solid-srp',
    title: 'S — Single Responsibility Principle',
    sections: [
      {
        heading: 'The principle',
        content: `<strong>"A class should have a single responsibility."</strong>

<img src="assets/solid/s.webp" alt="Single Responsibility Principle illustration by Ugonna Thelma" style="width:100%; max-width:500px; border-radius:8px; margin: 16px 0; display:block;">

If a Class has many responsibilities, it increases the possibility of bugs because making changes to one of its responsibilities could affect the other ones without you knowing.`
      },
      {
        heading: 'The visual metaphor',
        content: `<div style="background: var(--surface2); padding: 16px 20px; border-radius: 8px; margin: 12px 0;">
<div style="font-size: 1.5rem; margin-bottom: 8px;">❌ Too many jobs:</div>
<pre><code>class DeliveryManager {
    void planRoute() { ... }        // 🗺️ routing
    void assignDriver() { ... }     // 🚗 driver management
    void calculatePrice() { ... }   // 💰 pricing
    void sendNotification() { ... } // 📧 notifications
    void generateReport() { ... }   // 📊 reporting
}
// One person doing 5 jobs → fragile, hard to test, hard to change</code></pre>
</div>

<div style="background: var(--green-bg); padding: 16px 20px; border-radius: 8px; margin: 12px 0;">
<div style="font-size: 1.5rem; margin-bottom: 8px;">✅ One responsibility each:</div>
<pre><code>class RoutePlanner { void planRoute() { ... } }        // 🗺️
class DriverAssigner { void assign() { ... } }          // 🚗
class PriceCalculator { BigDecimal calculate() { ... }} // 💰
class DeliveryNotifier { void notify() { ... } }        // 📧
class DeliveryReporter { void generate() { ... } }      // 📊
// Each "person" has ONE job → easy to change independently</code></pre>
</div>`
      },
      {
        heading: 'The goal',
        content: `<strong>Goal:</strong> Separate behaviours so that if bugs arise from a change, it won't affect other unrelated behaviours.

<strong>How to identify violations:</strong>
• "This class changed for 3 different reasons this month"
• "I can't test pricing without setting up notifications"
• "Changing the report format broke the route calculation"

<strong>SRP does NOT mean:</strong>
• One method per class (too granular)
• Tiny classes for everything
• Never having a class grow

<strong>SRP MEANS:</strong> group things that change for the <strong>same reason</strong>. Pricing rules change because business changes pricing. Notification templates change because marketing changes messaging. Different reasons → different classes.`
      }
    ]
  },
  {
    id: 'theory-solid-ocp',
    title: 'O — Open/Closed Principle',
    sections: [
      {
        heading: 'The principle',
        content: `<strong>"Classes should be open for extension, but closed for modification."</strong>

<img src="assets/solid/o.webp" alt="Open/Closed Principle illustration by Ugonna Thelma" style="width:100%; max-width:500px; border-radius:8px; margin: 16px 0; display:block;">

Changing the current behaviour of a Class will affect all the systems using that Class. If you want the Class to perform more functions, the ideal approach is to <strong>add</strong> to the functions that already exist — NOT change them.`
      },
      {
        heading: 'The visual metaphor',
        content: `<div style="background: var(--surface2); padding: 16px 20px; border-radius: 8px; margin: 12px 0;">
<div style="font-size: 1.5rem; margin-bottom: 8px;">❌ Must modify existing code to add new channel:</div>
<pre><code>class NotificationSender {
    void send(String channel, DeliveryEvent event) {
        if (channel.equals("EMAIL")) {
            // send email...
        } else if (channel.equals("SMS")) {
            // send sms...
        } else if (channel.equals("PUSH")) {
            // ← MUST modify this class for every new channel!
        }
    }
}</code></pre>
</div>

<div style="background: var(--green-bg); padding: 16px 20px; border-radius: 8px; margin: 12px 0;">
<div style="font-size: 1.5rem; margin-bottom: 8px;">✅ Open for extension — add new class, change nothing:</div>
<pre><code>interface NotificationChannel {
    void send(DeliveryEvent event);
}

class EmailChannel implements NotificationChannel {
    void send(DeliveryEvent event) { /* email logic */ }
}

class SmsChannel implements NotificationChannel {
    void send(DeliveryEvent event) { /* sms logic */ }
}

// NEW! No existing code modified:
class SlackChannel implements NotificationChannel {
    void send(DeliveryEvent event) { /* slack logic */ }
}</code></pre>
</div>`
      },
      {
        heading: 'The goal',
        content: `<strong>Goal:</strong> Extend a class's behaviour without changing its existing behaviour. This avoids bugs wherever the class is already being used.

<strong>REWE Transport example:</strong>
The delivery tracking system needs to support new notification channels as business grows (email → SMS → push → Slack → webhook). Each new channel = one new class. The dispatcher that routes notifications is NEVER modified.

<strong>When to apply:</strong> When you see a growing if/else or switch that adds a new case every sprint.
<strong>When NOT to force:</strong> If the switch has 2-3 stable cases that haven't changed in years.`
      }
    ]
  },
  {
    id: 'theory-solid-lsp',
    title: 'L — Liskov Substitution Principle',
    sections: [
      {
        heading: 'The principle',
        content: `<strong>"If S is a subtype of T, then objects of type T may be replaced with objects of type S without breaking the program."</strong>

<img src="assets/solid/l.webp" alt="Liskov Substitution Principle illustration by Ugonna Thelma" style="width:100%; max-width:500px; border-radius:8px; margin: 16px 0; display:block;">

When a <strong>child</strong> Class cannot perform the same actions as its <strong>parent</strong> Class, this can cause bugs. The child Class should be able to process the same requests and deliver the same result as the parent Class (or a more specific type of that result).`
      },
      {
        heading: 'The visual metaphor',
        content: `<div style="background: var(--surface2); padding: 16px 20px; border-radius: 8px; margin: 12px 0;">
<div style="font-size: 1.5rem; margin-bottom: 8px;">❌ Child breaks parent's contract:</div>
<pre><code>interface DeliveryVehicle {
    void deliver(Package pkg);
    int maxWeight();
}

class Truck implements DeliveryVehicle {
    void deliver(Package pkg) { /* drives to address */ }
    int maxWeight() { return 10000; } // ✓ fulfils contract
}

class Bicycle implements DeliveryVehicle {
    void deliver(Package pkg) {
        if (pkg.weight() > 20)
            throw new UnsupportedOperationException("Too heavy!");
            // ❌ BREAKS the contract! Parent says "I can deliver".
    }
    int maxWeight() { return 20; }
}</code></pre>
</div>

<div style="background: var(--green-bg); padding: 16px 20px; border-radius: 8px; margin: 12px 0;">
<div style="font-size: 1.5rem; margin-bottom: 8px;">✅ Segregate by capability:</div>
<pre><code>interface HeavyDeliveryVehicle {
    void deliver(Package pkg); // contract: can handle any weight
}

interface LightDeliveryVehicle {
    void deliver(Package pkg); // contract: lightweight packages only
    int maxWeight();
}

class Truck implements HeavyDeliveryVehicle { ... }
class Bicycle implements LightDeliveryVehicle { ... }
// Each type HONESTLY represents what it can do</code></pre>
</div>`
      },
      {
        heading: 'The goal',
        content: `<strong>Goal:</strong> Enforce consistency so that the parent Class or its child Class can be used in the same way without errors.

<strong>The test:</strong> If you override a method and throw <code>UnsupportedOperationException</code>, you probably have an LSP violation.

<strong>Real-world sign:</strong>
<pre><code>// If you see this pattern → LSP violation:
if (vehicle instanceof Bicycle) {
    // special handling because Bicycle can't do what Vehicle promises
}</code></pre>

The fix is usually <strong>Interface Segregation</strong> (next principle) — split the interface into what each type can honestly promise.`
      }
    ]
  },
  {
    id: 'theory-solid-isp',
    title: 'I — Interface Segregation Principle',
    sections: [
      {
        heading: 'The principle',
        content: `<strong>"Clients should not be forced to depend on methods they do not use."</strong>

<img src="assets/solid/i.webp" alt="Interface Segregation Principle illustration by Ugonna Thelma" style="width:100%; max-width:500px; border-radius:8px; margin: 16px 0; display:block;">

When a Class is required to perform actions that are not useful, it is wasteful and may produce unexpected bugs if the Class does not have the ability to perform those actions. A Class should perform ONLY actions needed to fulfil its role.`
      },
      {
        heading: 'The visual metaphor',
        content: `<div style="background: var(--surface2); padding: 16px 20px; border-radius: 8px; margin: 12px 0;">
<div style="font-size: 1.5rem; margin-bottom: 8px;">❌ Fat interface forces useless implementations:</div>
<pre><code>interface LogisticsWorker {
    void drive();
    void loadPackages();
    void planRoute();
    void handleCustomerComplaint();
    void repairVehicle();
}

class Driver implements LogisticsWorker {
    void drive() { /* ✓ */ }
    void loadPackages() { /* ✓ */ }
    void planRoute() { /* ✓ */ }
    void handleCustomerComplaint() { /* ✗ not my job! */ }
    void repairVehicle() { /* ✗ not my job! */ }
}</code></pre>
</div>

<div style="background: var(--green-bg); padding: 16px 20px; border-radius: 8px; margin: 12px 0;">
<div style="font-size: 1.5rem; margin-bottom: 8px;">✅ Segregated — each role has only relevant methods:</div>
<pre><code>interface Driveable { void drive(); }
interface Loadable { void loadPackages(); }
interface Routable { void planRoute(); }
interface CustomerFacing { void handleComplaint(); }
interface Repairable { void repair(); }

class Driver implements Driveable, Loadable, Routable {
    // Only implements what a Driver actually does ✓
}

class CustomerService implements CustomerFacing {
    // Only handles complaints ✓
}

class Mechanic implements Repairable {
    // Only repairs ✓
}</code></pre>
</div>`
      },
      {
        heading: 'The goal',
        content: `<strong>Goal:</strong> Split a set of actions into smaller sets so that a class executes ONLY the actions it requires.

<strong>Signs of violation:</strong>
• Classes with methods that throw <code>UnsupportedOperationException</code>
• Methods that are empty or return null/dummy values
• "I implemented this interface but 3 of 7 methods don't apply to me"

<strong>REWE example:</strong> A CommunicationPlugin only needs <code>send()</code>. Don't force it to implement <code>schedule()</code>, <code>archive()</code>, <code>template()</code> if it's a simple webhook.`
      }
    ]
  },
  {
    id: 'theory-solid-dip',
    title: 'D — Dependency Inversion Principle',
    sections: [
      {
        heading: 'The principle',
        content: `<strong>"High-level modules should not depend on low-level modules. Both should depend on abstractions."</strong>

<img src="assets/solid/d.webp" alt="Dependency Inversion Principle illustration by Ugonna Thelma" style="width:100%; max-width:500px; border-radius:8px; margin: 16px 0; display:block;">

<strong>High-level Module</strong>: Class that executes an action with a tool.
<strong>Low-level Module</strong>: The tool that is needed to execute the action.
<strong>Abstraction</strong>: An interface that connects the two — the "plug."

This principle says a Class should not be fused with the tool it uses. Rather, it should be fused to the interface that allows the tool to connect to the Class.`
      },
      {
        heading: 'The visual metaphor',
        content: `<div style="background: var(--surface2); padding: 16px 20px; border-radius: 8px; margin: 12px 0;">
<div style="font-size: 1.5rem; margin-bottom: 8px;">❌ High-level depends directly on low-level:</div>
<pre><code>class DeliveryService {
    private KafkaTemplate kafka;     // knows about Kafka!
    private PostgresRepository db;   // knows about Postgres!

    void complete(Long id) {
        db.updateStatus(id, "COMPLETED");       // coupled to Postgres
        kafka.send("deliveries", event);        // coupled to Kafka
    }
}
// If we switch to RabbitMQ → must rewrite DeliveryService
// If we switch to MongoDB → must rewrite DeliveryService</code></pre>
</div>

<div style="background: var(--green-bg); padding: 16px 20px; border-radius: 8px; margin: 12px 0;">
<div style="font-size: 1.5rem; margin-bottom: 8px;">✅ Both depend on abstraction:</div>
<pre><code>// The "plug" (interface) — defined by business needs:
interface DeliveryRepository { void updateStatus(Long id, String s); }
interface EventPublisher { void publish(DeliveryEvent e); }

// High-level depends on abstraction:
class DeliveryService {
    private DeliveryRepository repo;   // doesn't know it's Postgres
    private EventPublisher events;     // doesn't know it's Kafka

    void complete(Long id) {
        repo.updateStatus(id, "COMPLETED");
        events.publish(new DeliveryCompleted(id));
    }
}

// Low-level IMPLEMENTS the abstraction:
class PostgresDeliveryRepo implements DeliveryRepository { ... }
class KafkaEventPublisher implements EventPublisher { ... }
// Switch to MongoDB? Only change the implementation. Business untouched.</code></pre>
</div>`
      },
      {
        heading: 'The goal',
        content: `<strong>Goal:</strong> Reduce coupling between high-level business logic and low-level infrastructure details by introducing an interface between them.

<strong>Key insight:</strong> The interface is defined BY the business layer (what it needs), NOT by the infrastructure (what it offers). This INVERTS the dependency — infrastructure depends on business abstractions.

<strong>Connection to DI (Dependency Injection):</strong>
• DIP = the PRINCIPLE (depend on abstractions)
• DI = the TECHNIQUE (provide implementations externally)
• Spring/CDI = the CONTAINER that wires them together

<pre><code>// In Spring Boot, DIP + DI work together:
@Service
class DeliveryService {
    private final DeliveryRepository repo;  // DIP: depends on interface

    DeliveryService(DeliveryRepository repo) {  // DI: Spring injects impl
        this.repo = repo;
    }
}</code></pre>

<strong>Credit:</strong> Visual metaphors inspired by <a href="https://medium.com/backticks-tildes/the-s-o-l-i-d-principles-in-pictures-b34ce2f1e898" target="_blank" style="color: var(--blue);">Ugonna Thelma's "SOLID Principles in Pictures"</a>`
      }
    ]
  }
];
