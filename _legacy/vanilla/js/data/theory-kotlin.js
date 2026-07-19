/**
 * Theory — Kotlin for Java Developers
 * Null safety, data classes, coroutines basics, Java interop
 */
const theoryKotlin = [
  {
    id: 'theory-kotlin-basics',
    title: 'Kotlin — What Java Developers Need to Know',
    sections: [
      {
        heading: 'Why Kotlin? (REWE TRAB uses it)',
        content: `The TRAB vacancy lists <strong>Kotlin/Java</strong> (Kotlin first!). This means the team likely prefers Kotlin for new code while maintaining existing Java.

<strong>Kotlin advantages over Java:</strong>
• Null safety built into the type system (no more NullPointerException)
• Concise syntax (50% less boilerplate)
• Data classes (like Records but more powerful)
• Extension functions (add methods to existing classes)
• Coroutines (lightweight async — better than CompletableFuture)
• 100% interoperable with Java (call Java from Kotlin and vice versa)
• Runs on same JVM, same bytecode, same tools

<strong>Your honest position:</strong>
"I don't have production Kotlin experience, but I understand the language well from studying it. The concepts map directly to what I know in Java — null safety is what I do manually with Optional, data classes are like Records, extension functions are like utility methods. I can be productive in Kotlin within weeks."

<pre><code>// Java
public class DeliveryDTO {
    private final Long id;
    private final String driverId;
    private final DeliveryStatus status;
    // + constructor, getters, equals, hashCode, toString (40 lines)
}

// Kotlin equivalent (1 line!)
data class DeliveryDTO(val id: Long, val driverId: String, val status: DeliveryStatus)</code></pre>`
      },
      {
        heading: 'Kotlin vs Java — side by side',
        content: `<pre><code>// Variables
val name: String = "REWE"           // immutable (like final)
var count: Int = 0                   // mutable
val inferred = "type inferred"       // no explicit type needed

// Null safety
val driver: String = "Carlos"        // CANNOT be null
val driver: String? = null           // CAN be null (nullable type)

driver?.length                       // safe call (returns null if driver is null)
driver ?: "Unknown"                  // elvis operator (default if null)
driver!!.length                      // force unwrap (throws NPE if null — avoid!)

// Functions
fun calculatePrice(distance: Int, express: Boolean = false): BigDecimal {
    return if (express) BigDecimal(distance * 1.5) else BigDecimal(distance)
}
// Default parameters! No need for overloaded methods.

// String templates
val msg = "Delivery $id dispatched to ${driver.name}"

// When expression (powerful switch)
val label = when (status) {
    PLANNED -> "Waiting"
    DISPATCHED -> "On the way"
    DELIVERED -> "Done"
    else -> "Unknown"
}

// When with conditions
val priority = when {
    delivery.isLate() && delivery.isExpress() -> CRITICAL
    delivery.isLate() -> HIGH
    else -> NORMAL
}</code></pre>`
      }
    ]
  },
  {
    id: 'theory-kotlin-null',
    title: 'Kotlin Null Safety — Eliminating NullPointerException',
    sections: [
      {
        heading: 'The billion-dollar problem solved',
        content: `In Java, ANY reference can be null. In Kotlin, nullability is part of the TYPE SYSTEM:

<pre><code>// Kotlin — compiler PREVENTS null errors
fun findDriver(id: Long): Driver {          // NEVER null (guaranteed)
    return driverRepo.findById(id)
        ?: throw NotFoundException("Driver $id not found")
}

fun findDriverMaybe(id: Long): Driver? {    // MIGHT be null (explicit)
    return driverRepo.findByIdOrNull(id)
}

// Compiler enforces:
val driver: Driver? = findDriverMaybe(42)
driver.name        // ❌ COMPILE ERROR! driver might be null
driver?.name       // ✅ returns null if driver is null
driver!!.name      // ⚠️ compiles but throws NPE if null (avoid!)

// Smart cast — compiler tracks null checks
if (driver != null) {
    driver.name    // ✅ compiler knows it's not null here
}

// Elvis operator — provide default
val name = driver?.name ?: "Unassigned"</code></pre>

<strong>Java equivalent (verbose):</strong>
<pre><code>// Java — you must remember to check
Optional&lt;Driver&gt; driver = repo.findById(id);
String name = driver.map(Driver::getName).orElse("Unassigned");
// But Optional doesn't prevent NPE on other references!</code></pre>

<strong>Key insight:</strong> Kotlin makes the NULL/NOT-NULL decision explicit in EVERY variable declaration. The compiler catches 90% of NPEs at compile time.`
      }
    ]
  },
  {
    id: 'theory-kotlin-classes',
    title: 'Kotlin Classes, Data Classes & Extensions',
    sections: [
      {
        heading: 'Data classes (like Java Records but better)',
        content: `<pre><code>// Data class — auto-generates everything
data class DeliveryEvent(
    val deliveryId: String,
    val status: DeliveryStatus,
    val timestamp: Instant,
    val driverId: String? = null  // optional with default
) {
    // Can add methods
    fun isLate(): Boolean = status == DELAYED

    // copy() with modifications (Records don't have this!)
    // val updated = event.copy(status = DELIVERED)
}

// Usage:
val event = DeliveryEvent("D-123", PLANNED, Instant.now())
val dispatched = event.copy(status = DISPATCHED, driverId = "driver-42")
// Original unchanged (immutable) + new instance with modifications

// Destructuring:
val (id, status, time) = event
println("$id is $status at $time")</code></pre>

<strong>Data class vs Java Record:</strong>
| Feature | Kotlin data class | Java Record |
|---------|:-:|:-:|
| Immutable by default | ✅ (val) | ✅ |
| copy() with modifications | ✅ | ❌ |
| Default parameter values | ✅ | ❌ |
| Destructuring | ✅ | ❌ |
| componentN() functions | ✅ | ❌ |
| Can have mutable fields | ✅ (var) | ❌ |
| Inheritance | ❌ (final) | ❌ (final) |`
      },
      {
        heading: 'Extension functions',
        content: `Add methods to existing classes WITHOUT modifying them:

<pre><code>// Add method to String
fun String.toDeliveryId(): String = "DEL-${this.padStart(6, '0')}"
"123".toDeliveryId()  // "DEL-000123"

// Add method to LocalDateTime
fun LocalDateTime.isBusinessHours(): Boolean =
    hour in 8..17 && dayOfWeek !in listOf(SATURDAY, SUNDAY)

// Add method to List
fun List&lt;Delivery&gt;.activeOnly(): List&lt;Delivery&gt; =
    filter { it.status == ACTIVE }

// Usage:
val active = deliveries.activeOnly()

// Extension on nullable type
fun String?.orDefault(): String = this ?: "N/A"
null.orDefault()  // "N/A"</code></pre>

<strong>Java equivalent:</strong> utility classes (DeliveryUtils.toDeliveryId(str)). Same logic, but Kotlin syntax reads more naturally.`
      },
      {
        heading: 'Kotlin + Spring Boot',
        content: `<pre><code>@RestController
@RequestMapping("/api/v1/deliveries")
class DeliveryController(
    private val service: DeliveryService  // constructor injection (no @Autowired)
) {

    @GetMapping("/{id}")
    fun findById(@PathVariable id: Long): ResponseEntity&lt;DeliveryDTO&gt; =
        ResponseEntity.ok(service.findById(id))

    @PostMapping
    fun create(@Valid @RequestBody request: CreateDeliveryRequest): ResponseEntity&lt;DeliveryDTO&gt; {
        val delivery = service.create(request)
        val location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(delivery.id).toUri()
        return ResponseEntity.created(location).body(delivery)
    }
}

@Service
class DeliveryService(
    private val repo: DeliveryRepository,
    private val events: EventPublisher
) {
    @Transactional
    fun dispatch(id: Long, driverId: String) {
        val delivery = repo.findById(id)
            ?: throw DeliveryNotFoundException(id)
        delivery.dispatch(driverId)
        repo.save(delivery)
        events.publish(DeliveryDispatched(id, driverId))
    }
}</code></pre>

<strong>Key differences from Java + Spring Boot:</strong>
• Constructor injection by default (parameters in class declaration)
• No semicolons, no \`new\` keyword
• \`val\` = immutable, \`var\` = mutable
• Elvis operator (\`?:\`) instead of .orElseThrow()
• Expression body functions (\`= ResponseEntity.ok(...)\`)
• String templates (\`"Delivery $id"\`) instead of concatenation`
      }
    ]
  }
];
