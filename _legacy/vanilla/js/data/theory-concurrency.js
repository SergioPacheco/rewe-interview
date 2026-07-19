/**
 * Theory Content — Concurrency
 * Threads, ExecutorService, CompletableFuture, Thread Safety
 */
const theoryConcurrency = [
  {
    id: 'theory-conc-threads',
    title: 'Threads & Thread Pools',
    sections: [
      {
        heading: 'Why concurrency matters',
        content: `In logistics: a delivery-service handling 1000 req/s needs to execute many operations simultaneously. Without concurrency, each request waits for the previous one to finish.

<strong>Java concurrency model:</strong>
• Each request in a web server (Tomcat, WildFly) gets its own thread
• Threads share the same heap memory (objects accessible across threads)
• The JVM + OS schedules threads across CPU cores

<strong>The danger:</strong> Shared mutable state + concurrent access = data corruption, race conditions, deadlocks.`
      },
      {
        heading: 'Thread pools — never create raw threads',
        content: `<pre><code>// ❌ Never in production — uncontrolled thread creation
new Thread(() -> processDelivery(id)).start();
// 1000 requests = 1000 threads = OOM or context-switching hell

// ✅ ExecutorService — bounded, reusable thread pool
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> processDelivery(id));
// 1000 requests share 10 threads — controlled resource usage

// ✅ Spring Boot — inject the managed executor
@Async
public CompletableFuture&lt;Route&gt; calculateRouteAsync(Delivery d) {
    return CompletableFuture.completedFuture(routeService.calculate(d));
}

// ✅ Java EE — ManagedExecutorService (container-managed)
@Resource
ManagedExecutorService executor;
executor.submit(() -> processDelivery(id));</code></pre>

<strong>Thread pool sizing rule of thumb:</strong>
• CPU-bound tasks: threads = number of CPU cores
• I/O-bound tasks (REST calls, DB): threads = cores × (1 + wait_time/compute_time)
• Example: 8 cores, tasks spend 80% waiting on I/O → 8 × (1 + 0.8/0.2) = 40 threads`
      }
    ]
  },
  {
    id: 'theory-conc-completable',
    title: 'CompletableFuture — Async Composition',
    sections: [
      {
        heading: 'CompletableFuture basics',
        content: `CompletableFuture = a promise of a future result that you can chain operations on.

<pre><code>// Run async task
CompletableFuture&lt;Route&gt; routeFuture = CompletableFuture
    .supplyAsync(() -> routeService.optimize(delivery), executor);

// Chain transformations
CompletableFuture&lt;ETA&gt; etaFuture = routeFuture
    .thenApply(route -> etaCalculator.calculate(route));

// Handle errors
CompletableFuture&lt;ETA&gt; safeFuture = etaFuture
    .exceptionally(ex -> ETA.unknown());

// Combine two independent futures
CompletableFuture&lt;Route&gt; route = getRouteAsync(deliveryId);
CompletableFuture&lt;Driver&gt; driver = getDriverAsync(driverId);

CompletableFuture&lt;DispatchPlan&gt; plan = route.thenCombine(driver,
    (r, d) -> new DispatchPlan(r, d));
// Both execute in PARALLEL, combined when both complete</code></pre>`
      },
      {
        heading: 'Parallel calls pattern (REWE transport)',
        content: `<pre><code>// Scenario: dispatch requires data from 3 services
// Sequential: 100ms + 150ms + 200ms = 450ms
// Parallel:   max(100, 150, 200) = 200ms!

public DispatchResponse dispatch(Long deliveryId) {
    var driverFuture = CompletableFuture
        .supplyAsync(() -> driverService.findAvailable(region), executor);
    var routeFuture = CompletableFuture
        .supplyAsync(() -> routeService.optimize(stops), executor);
    var weatherFuture = CompletableFuture
        .supplyAsync(() -> weatherService.getForecast(region), executor);

    // Wait for all three (with timeout!)
    CompletableFuture.allOf(driverFuture, routeFuture, weatherFuture)
        .orTimeout(5, TimeUnit.SECONDS)
        .join();

    return new DispatchResponse(
        driverFuture.join(),
        routeFuture.join(),
        weatherFuture.join()
    );
}</code></pre>

<strong>Key rules:</strong>
• ALWAYS pass an executor (never use default ForkJoinPool in a server)
• ALWAYS set a timeout (orTimeout or completeOnTimeout)
• Handle exceptions with exceptionally() or handle()
• Don't block the calling thread unnecessarily (use thenApply/thenCompose for chaining)`
      }
    ]
  },
  {
    id: 'theory-conc-safety',
    title: 'Thread Safety — Protecting Shared State',
    sections: [
      {
        heading: 'Race conditions and how to prevent them',
        content: `<pre><code>// ❌ Race condition — two threads read-then-write simultaneously
class DeliveryCounter {
    private int count = 0;
    public void increment() { count++; } // NOT atomic! read → add → write
}
// Thread A reads 5, Thread B reads 5, both write 6 → lost update!

// ✅ Fix 1: AtomicInteger (lock-free)
private AtomicInteger count = new AtomicInteger(0);
public void increment() { count.incrementAndGet(); }

// ✅ Fix 2: synchronized (simple but coarse)
public synchronized void increment() { count++; }

// ✅ Fix 3: Immutable objects (no shared mutable state)
record DeliveryEvent(String id, String status, Instant time) {}
// Records are immutable — safe to share across threads without locks</code></pre>

<strong>Best strategies (in order of preference):</strong>
1. <strong>Avoid sharing:</strong> each thread works on its own data (request-scoped)
2. <strong>Immutability:</strong> objects that can't change are always thread-safe
3. <strong>Atomic operations:</strong> AtomicInteger, AtomicReference, ConcurrentHashMap
4. <strong>Synchronized/Lock:</strong> last resort (risk of deadlocks, contention)`
      },
      {
        heading: 'Common thread-safety patterns',
        content: `<pre><code>// ConcurrentHashMap — thread-safe map (BUT not for compound operations)
ConcurrentHashMap&lt;String, Integer&gt; cache = new ConcurrentHashMap&lt;&gt;();

// ❌ NOT atomic (check-then-act race condition)
if (!cache.containsKey(key)) {
    cache.put(key, computeValue()); // another thread might insert between check and put
}

// ✅ Atomic compound operation
cache.computeIfAbsent(key, k -> computeValue());

// ✅ Spring: singleton beans are thread-safe IF they have no mutable fields
@Service
public class DeliveryService {
    private final DeliveryRepository repo; // final = safe
    // NO mutable instance fields!
}

// ❌ Dangerous: mutable field in singleton
@Service
public class BadService {
    private List&lt;String&gt; buffer = new ArrayList&lt;&gt;(); // shared across ALL requests!
}</code></pre>

<strong>Interview answer:</strong> "In Spring Boot, services are singletons shared across threads. I ensure thread safety by: (1) using only final immutable fields, (2) keeping mutable state in method-local variables, (3) using atomic operations for shared counters/caches."`
      }
    ]
  }
];
