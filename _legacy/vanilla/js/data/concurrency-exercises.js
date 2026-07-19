/**
 * Concurrency Module — Practice (15 exercises)
 * Threads, ExecutorService, CompletableFuture, Thread Safety
 */
const concurrencyExercises = [
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'INTER',
    subtopic: 'Thread Safety',
    mission: 'Two threads call <code>increment()</code> 1000 times each simultaneously. What is the final value of count?',
    code: `public class DeliveryCounter {
    private int count = 0;

    public void increment() {
        count++;  // read → add → write (3 operations, NOT atomic)
    }

    public int getCount() {
        return count;
    }
}

// Thread A: for(i=0; i<1000; i++) counter.increment();
// Thread B: for(i=0; i<1000; i++) counter.increment();`,
    choices: ['Always 2000', 'Between 1000 and 2000 (unpredictable)', 'Always 1000', 'Throws ConcurrentModificationException'],
    answer: 'Between 1000 and 2000 (unpredictable)',
    explain: 'count++ is NOT atomic. It\'s read-increment-write (3 steps). Two threads can read the same value, both increment to the same result, and one update is lost. This is called a "lost update" race condition. Fix: use AtomicInteger.incrementAndGet() or synchronized.'
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Thread Safety',
    question: 'A Spring @Service (singleton) needs a counter that tracks total deliveries processed today. Multiple request threads call it simultaneously. How do you implement it?',
    options: [
      { label: 'A) private int count field with synchronized increment()', description: 'Lock-based thread safety on a mutable field.' },
      { label: 'B) private AtomicInteger count = new AtomicInteger(0)', description: 'Lock-free atomic operations via CAS (Compare-And-Swap).' },
      { label: 'C) private int count field (no synchronization needed — Spring handles it)', description: 'Rely on Spring to make singletons thread-safe.' }
    ],
    bestOption: 1,
    explanation: `AtomicInteger is the correct choice:

\`\`\`java
@Service
public class DeliveryMetrics {
    private final AtomicInteger todayCount = new AtomicInteger(0);

    public void recordDelivery() {
        todayCount.incrementAndGet(); // atomic, lock-free, thread-safe
    }

    public int getTodayCount() {
        return todayCount.get();
    }
}
\`\`\`

Why NOT C: Spring does NOT make singletons thread-safe. It creates ONE instance shared across ALL request threads. YOU are responsible for thread safety of mutable state.

Why B over A: AtomicInteger uses CPU-level CAS (no lock, no context switch). synchronized blocks threads. For a simple counter, atomic is simpler and faster.

Use synchronized when: you need to protect a compound operation (read + decide + write) that AtomicInteger can't express in one call.`,
    tags: ['atomic', 'singleton', 'thread-safety']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'CompletableFuture',
    question: 'You need to call 3 independent services (route, driver, weather) to dispatch a delivery. Each takes 100-300ms. How do you parallelize?',
    modelAnswer: `\`\`\`java
@Service
public class DispatchService {

    private final Executor executor; // injected ManagedExecutorService

    public DispatchResult dispatch(Long deliveryId) {
        // Launch 3 calls in PARALLEL
        var routeFuture = CompletableFuture
            .supplyAsync(() -> routeService.optimize(deliveryId), executor);
        var driverFuture = CompletableFuture
            .supplyAsync(() -> driverService.findAvailable(region), executor);
        var weatherFuture = CompletableFuture
            .supplyAsync(() -> weatherService.forecast(region), executor);

        // Wait for ALL with timeout
        CompletableFuture.allOf(routeFuture, driverFuture, weatherFuture)
            .orTimeout(5, TimeUnit.SECONDS)
            .join();

        // Combine results
        return new DispatchResult(
            routeFuture.join(),
            driverFuture.join(),
            weatherFuture.join()
        );
    }
}
\`\`\`

**Sequential:** 100 + 200 + 300 = 600ms
**Parallel:** max(100, 200, 300) = 300ms — 2x faster!

Key rules:
• ALWAYS pass an executor (never ForkJoinPool in a server)
• ALWAYS set timeout (orTimeout or completeOnTimeout)
• Handle exceptions per future (exceptionally) or globally
• Don't create unbounded parallelism (limit concurrent calls)`,
    followUp: 'What happens if the weather service is down? How do you handle partial failures?',
    tags: ['completable-future', 'parallel', 'performance']
  },
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'INTER',
    subtopic: 'CompletableFuture',
    mission: 'What does this print?',
    code: `CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> {
        System.out.println("1-computing");
        return "REWE";
    })
    .thenApply(s -> {
        System.out.println("2-transforming");
        return s + " Digital";
    })
    .thenApply(s -> {
        System.out.println("3-finalizing");
        return s + " Spain";
    });

System.out.println("4-before-join");
String result = future.join();
System.out.println("5-result: " + result);`,
    choices: ['1→2→3→4→5: REWE Digital Spain', '4→1→2→3→5: REWE Digital Spain', 'Either order for 1-2-3 vs 4, then 5', '4→5: REWE Digital Spain (1-2-3 skip)'],
    answer: 'Either order for 1-2-3 vs 4, then 5',
    explain: 'supplyAsync runs on another thread. The main thread continues to print "4-before-join". Whether 1-2-3 complete before or after 4 depends on thread scheduling. But join() blocks until all stages complete, so 5 always prints last with the correct result "REWE Digital Spain". The thenApply chain is sequential within the async thread.'
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Thread Pools',
    question: 'How do you size a thread pool? What are the risks of getting it wrong?',
    modelAnswer: `**Formula (rule of thumb):**
\`\`\`
CPU-bound tasks: threads = CPU cores
I/O-bound tasks: threads = cores × (1 + waitTime / computeTime)
\`\`\`

**Example:** 8 cores, tasks spend 80% waiting (REST calls, DB queries):
threads = 8 × (1 + 0.8/0.2) = 8 × 5 = 40 threads

**Too FEW threads:**
• Requests queue up waiting for a thread
• Latency increases under load
• Throughput limited artificially

**Too MANY threads:**
• Context switching overhead (OS spends time switching, not working)
• Memory wasted (each thread ~1MB stack)
• Database connections exhausted (each thread may hold one)
• Can overwhelm downstream services

**In Spring Boot:**
\`\`\`yaml
server.tomcat.threads.max: 200  # max request threads
server.tomcat.threads.min-spare: 10
\`\`\`

**For async task executor:**
\`\`\`java
@Bean
public Executor taskExecutor() {
    var executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(10);
    executor.setMaxPoolSize(20);
    executor.setQueueCapacity(100);
    executor.setRejectedExecutionHandler(new CallerRunsPolicy());
    return executor;
}
\`\`\`

CallerRunsPolicy = if pool is full, the calling thread executes the task (back-pressure).`,
    followUp: 'What happens when both the thread pool AND the queue are full?',
    tags: ['thread-pool', 'sizing', 'performance']
  },
  {
    type: 'CODE_REFACTOR',
    difficulty: 'SENIOR',
    subtopic: 'Thread Safety',
    question: 'What problems do you see in this singleton cache?',
    code: `@Service
public class RouteCache {
    private Map<String, Route> cache = new HashMap<>();
    private LocalDateTime lastRefresh = LocalDateTime.now();

    public Route getRoute(String routeId) {
        if (!cache.containsKey(routeId)) {
            Route route = routeService.fetch(routeId);
            cache.put(routeId, route);
        }
        return cache.get(routeId);
    }

    public void refresh() {
        cache = new HashMap<>();
        lastRefresh = LocalDateTime.now();
    }
}`,
    problems: [
      'HashMap is NOT thread-safe — concurrent reads/writes cause ConcurrentModificationException or corruption',
      'containsKey + put is not atomic — two threads may both fetch and put (race condition)',
      'Field reassignment in refresh() is not atomic with lastRefresh update',
      'No TTL or max size — cache grows unbounded',
      'Route objects may be mutable — shared across threads without protection'
    ],
    refactored: `@Service
public class RouteCache {
    private final ConcurrentHashMap<String, Route> cache = new ConcurrentHashMap<>();
    private volatile LocalDateTime lastRefresh = LocalDateTime.now();

    public Route getRoute(String routeId) {
        // computeIfAbsent is ATOMIC — no race condition
        return cache.computeIfAbsent(routeId, id -> routeService.fetch(id));
    }

    public void refresh() {
        cache.clear();
        lastRefresh = LocalDateTime.now();
    }

    // Add TTL check
    public Route getRouteWithTTL(String routeId, Duration ttl) {
        // Check age, evict if stale, then compute
        return cache.compute(routeId, (id, existing) -> {
            if (existing != null && !isExpired(existing, ttl)) return existing;
            return routeService.fetch(id);
        });
    }
}`,
    tags: ['concurrent-hashmap', 'race-condition', 'cache']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Deadlocks',
    question: 'What is a deadlock? How do you prevent them?',
    modelAnswer: `**Deadlock:** Two threads each hold a lock the other needs. Both wait forever.

\`\`\`java
// Thread A: lock(delivery) → tries to lock(driver) → WAITS
// Thread B: lock(driver) → tries to lock(delivery) → WAITS
// Neither can proceed → DEADLOCK
\`\`\`

**Prevention strategies:**

**1. Consistent lock ordering (most common fix):**
\`\`\`java
// Always lock in ID order — prevents circular wait
void assign(Delivery d, Driver dr) {
    Object first = d.getId() < dr.getId() ? d : dr;
    Object second = d.getId() < dr.getId() ? dr : d;
    synchronized(first) {
        synchronized(second) {
            // safe — both threads use same order
        }
    }
}
\`\`\`

**2. Timeout on lock acquisition:**
\`\`\`java
if (lock.tryLock(5, TimeUnit.SECONDS)) {
    try { /* work */ } finally { lock.unlock(); }
} else {
    // couldn't acquire — retry or fail fast
}
\`\`\`

**3. Avoid nested locks entirely:**
Use atomic operations, ConcurrentHashMap, or redesign to eliminate shared mutable state.

**4. In database:** use optimistic locking (@Version) instead of SELECT FOR UPDATE when possible.

**Detection:** Thread dump shows threads in BLOCKED state waiting for each other's monitors.`,
    followUp: 'What\'s the difference between a deadlock and a livelock?',
    tags: ['deadlock', 'prevention', 'locking']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    subtopic: 'Async Patterns',
    question: 'A delivery completion triggers: (1) invoice creation, (2) driver notification, (3) analytics update. All are non-critical for the main flow. How do you handle them?',
    options: [
      { label: 'A) Sequential in same transaction', description: 'Call all three services synchronously within the @Transactional method.' },
      { label: 'B) CompletableFuture.allOf() — fire all async, wait for completion', description: 'Async but still wait before responding to the user.' },
      { label: 'C) Publish Kafka event — each consumer handles independently', description: 'Fire-and-forget event. Each downstream service consumes at its own pace.' }
    ],
    bestOption: 2,
    explanation: `Kafka event (C) is correct for non-critical downstream reactions:

\`\`\`java
@Transactional
public void complete(Long deliveryId) {
    Delivery d = repo.findById(deliveryId).orElseThrow();
    d.complete(); // domain logic
    repo.save(d); // persist
    // Event published via outbox or after commit
}

// After TX commits:
eventPublisher.publish(new DeliveryCompleted(deliveryId));
\`\`\`

**Why NOT A (synchronous):**
• If invoice service is slow (2s) → user waits 2s
• If analytics is down → delivery completion fails (unacceptable!)
• Locks DB connection during all three calls

**Why NOT B (async but wait):**
• Still blocks the response until all complete
• If one fails, what do you do? Retry? Ignore? Complex error handling in the request path

**Why C (Kafka) is best:**
• Response returns immediately after persist (~50ms)
• Each consumer processes independently (invoice doesn't block notification)
• If one consumer is down, others continue
• Retry via Kafka redelivery
• Add new consumers later without touching delivery-service`,
    tags: ['event-driven', 'kafka', 'async']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Volatile & Visibility',
    question: 'What does the volatile keyword do? When do you need it?',
    modelAnswer: `**Problem:** Without volatile, one thread's write may NOT be visible to another thread (CPU cache, compiler optimization).

\`\`\`java
// ❌ Thread B may never see the update!
private boolean shutdown = false;

// Thread A: shutdown = true;
// Thread B: while (!shutdown) { work(); } // may loop forever!

// ✅ volatile guarantees visibility across threads
private volatile boolean shutdown = false;
\`\`\`

**What volatile guarantees:**
• Every read sees the latest write (no CPU cache stale value)
• Prevents instruction reordering around the volatile access

**What volatile does NOT guarantee:**
• Atomicity of compound operations (i++ is still not atomic even if volatile)

**When to use:**
• Boolean flags (shutdown, initialized, cancelled)
• Single-writer, multiple-readers patterns
• Double-checked locking (singleton)

**When NOT enough (need AtomicInteger or synchronized):**
• Increment/decrement (read + modify + write)
• Check-then-act (if empty → add)
• Multiple fields that must be updated together

**In Spring Boot:** rarely needed directly. Most shared state is in beans (singleton, no mutable fields) or in the database (ACID). Volatile matters for low-level infrastructure code, caches, and flags.`,
    followUp: 'What\'s the difference between volatile and AtomicReference?',
    tags: ['volatile', 'visibility', 'memory-model']
  },
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'SENIOR',
    subtopic: 'ConcurrentHashMap',
    mission: 'Is this code thread-safe?',
    code: `ConcurrentHashMap<String, Integer> deliveryCounts = new ConcurrentHashMap<>();

// Multiple threads call this simultaneously for the same driverId:
public void recordDelivery(String driverId) {
    Integer current = deliveryCounts.get(driverId);
    if (current == null) {
        deliveryCounts.put(driverId, 1);
    } else {
        deliveryCounts.put(driverId, current + 1);
    }
}`,
    choices: ['Yes — ConcurrentHashMap handles everything', 'No — get() + put() is not atomic (race condition)', 'Yes — put() is synchronized internally', 'No — Integer is immutable so cannot be updated'],
    answer: 'No — get() + put() is not atomic (race condition)',
    explain: 'ConcurrentHashMap makes individual operations (get, put) thread-safe, but the COMPOUND operation (get → check → put) is NOT atomic. Two threads can both get(null), both put(1) → lost update. Fix: deliveryCounts.merge(driverId, 1, Integer::sum) — atomic compound operation.'
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Virtual Threads',
    question: 'Java 21 introduces Virtual Threads (Project Loom). How do they change concurrency in Spring Boot?',
    modelAnswer: `**Traditional threads (Platform threads):**
• OS-managed, ~1MB stack each
• Limited to thousands (memory + context switching)
• Blocking a platform thread = expensive resource wasted

**Virtual threads (Java 21+):**
• JVM-managed, very lightweight (~few KB)
• Can have MILLIONS simultaneously
• Blocking a virtual thread = cheap (JVM suspends it, reuses carrier thread)

**Impact on Spring Boot:**
\`\`\`yaml
# Enable virtual threads in Spring Boot 3.2+
spring.threads.virtual.enabled=true
# Now each HTTP request runs on a virtual thread
\`\`\`

**What this means:**
• Blocking I/O (JDBC, REST calls, file I/O) becomes "free" — no thread pool exhaustion
• Can handle 100K+ concurrent requests (each on its own virtual thread)
• Thread-per-request model becomes viable again (no need for reactive/WebFlux)

**What DOESN'T change:**
• You still need proper synchronization for shared mutable state
• Database connections are still limited (pool is the bottleneck now, not threads)
• CPU-bound work doesn't benefit (still limited by cores)

**For REWE:** Virtual threads make blocking Spring MVC + JDBC perfectly scalable. No need for reactive (WebFlux) just for concurrency. The team's choice of Spring Boot + blocking stack is future-proof with Java 21.`,
    followUp: 'If virtual threads make blocking cheap, do we still need async programming?',
    tags: ['virtual-threads', 'java-21', 'loom']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Executor Types',
    question: 'Explain the different ExecutorService types and when to use each.',
    modelAnswer: `\`\`\`java
// Fixed pool — known number of threads, predictable resource usage
ExecutorService fixed = Executors.newFixedThreadPool(10);
// Use: server-side processing with bounded concurrency

// Cached pool — creates threads as needed, reuses idle ones
ExecutorService cached = Executors.newCachedThreadPool();
// Use: short-lived tasks with unpredictable volume (DANGEROUS in servers — unbounded!)

// Single thread — sequential execution, guaranteed order
ExecutorService single = Executors.newSingleThreadExecutor();
// Use: tasks that must execute in order (audit log writer)

// Scheduled — delayed or periodic execution
ScheduledExecutorService scheduled = Executors.newScheduledThreadPool(5);
scheduled.scheduleAtFixedRate(() -> cleanup(), 0, 1, TimeUnit.HOURS);
// Use: periodic jobs (cache refresh, health checks)

// Virtual thread per task (Java 21+)
ExecutorService virtual = Executors.newVirtualThreadPerTaskExecutor();
// Use: massive I/O-bound concurrency
\`\`\`

**In Spring Boot (prefer injected beans):**
\`\`\`java
@Bean
public TaskExecutor taskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(10);
    executor.setMaxPoolSize(20);
    executor.setQueueCapacity(500);
    executor.setThreadNamePrefix("delivery-async-");
    return executor;
}
\`\`\`

**Rule:** NEVER use Executors.newCachedThreadPool() in a server — under load it creates unlimited threads → OOM.`,
    followUp: 'What happens when you submit a task but the pool AND queue are full?',
    tags: ['executor', 'thread-pool', 'types']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Immutability',
    question: 'Why is immutability the best strategy for thread safety? Show examples.',
    modelAnswer: `**Immutable objects are ALWAYS thread-safe** — no synchronization needed, no race conditions possible.

\`\`\`java
// ✅ Immutable — share freely between threads
public record DeliveryEvent(
    String deliveryId,
    DeliveryStatus status,
    Instant timestamp,
    List<String> stops  // must be unmodifiable!
) {
    public DeliveryEvent {
        stops = List.copyOf(stops); // defensive copy — truly immutable
    }
}

// ✅ Immutable value object
public record RouteSegment(String from, String to, double distanceKm) {}

// ❌ Mutable — NOT thread-safe without synchronization
public class MutableDelivery {
    private String status;        // can be changed
    private List<String> stops;   // can be modified
    public void setStatus(String s) { this.status = s; }
}
\`\`\`

**Immutability strategy for Spring services:**
\`\`\`java
@Service
public class DeliveryService {
    private final DeliveryRepository repo;    // final = safe
    private final EventPublisher events;      // final = safe
    // NO mutable fields! All state is method-local or in DB.

    public DeliveryDTO process(CreateRequest req) {
        // All variables are local to this method = thread-safe by definition
        var delivery = Delivery.from(req);
        repo.save(delivery);
        events.publish(DeliveryEvent.created(delivery));
        return DeliveryDTO.from(delivery);
    }
}
\`\`\`

**Hierarchy of thread-safety (prefer top):**
1. Immutable (no sync needed)
2. Thread-local (each thread has its own copy)
3. Atomic operations (CAS-based, lock-free)
4. Synchronized/Lock (last resort)`,
    followUp: 'How do Java Records help with immutability?',
    tags: ['immutability', 'records', 'best-practice']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    subtopic: 'Concurrent Access',
    question: 'Two API requests try to dispatch the same delivery simultaneously. How do you prevent double-dispatch?',
    options: [
      { label: 'A) Optimistic locking (@Version) — detect conflict at commit time', description: 'Both read version=1, first commits version=2, second gets OptimisticLockException.' },
      { label: 'B) Pessimistic locking (SELECT FOR UPDATE) — prevent concurrent read', description: 'First request locks the row, second waits until first completes.' },
      { label: 'C) Application-level distributed lock (Redis) — lock before loading', description: 'Acquire Redis lock on deliveryId, process, release.' }
    ],
    bestOption: 0,
    explanation: `Optimistic locking (A) is correct for this scenario:

\`\`\`java
@Entity
public class Delivery {
    @Version private Integer version;
    // ...
}

@Transactional
public void dispatch(Long deliveryId, Long driverId) {
    Delivery d = repo.findById(deliveryId).orElseThrow();
    d.dispatch(driverId); // validates status transition
    repo.save(d);
    // If another TX committed first → OptimisticLockException → retry or 409 Conflict
}
\`\`\`

**Why A over B:** Double-dispatch is a RARE edge case (seconds apart). Optimistic locking has no performance cost for the 99.9% of cases with no conflict. Pessimistic locking blocks ALL concurrent reads (even when no conflict).

**Why A over C:** Redis distributed lock adds infrastructure dependency, network latency, and complexity (lock expiry, dead locks if client crashes). Overkill for single-DB operations.

**Use pessimistic (B) when:** conflicts are FREQUENT (many threads competing for same row constantly).
**Use distributed lock (C) when:** operation spans multiple services/databases.`,
    tags: ['optimistic-locking', 'concurrent-dispatch', 'conflict']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Spring @Async',
    question: 'How does @Async work in Spring Boot? What are the pitfalls?',
    modelAnswer: `\`\`\`java
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean
    public Executor asyncExecutor() {
        var executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        return executor;
    }
}

@Service
public class NotificationService {

    @Async  // runs on separate thread from asyncExecutor
    public void notifyDriver(Delivery delivery) {
        // slow operation — doesn't block the caller
        pushService.send(delivery.getDriverId(), "New delivery assigned");
    }

    @Async
    public CompletableFuture<Route> optimizeRouteAsync(List<Stop> stops) {
        Route route = routeService.calculate(stops);
        return CompletableFuture.completedFuture(route);
    }
}
\`\`\`

**Pitfalls:**

1. **Self-invocation doesn't work:**
\`\`\`java
public void process() {
    this.notifyDriver(delivery); // ❌ @Async is IGNORED (no proxy)
}
// Fix: inject the bean and call through the proxy
\`\`\`

2. **Exception handling:** Exceptions in @Async void methods are LOST (no caller to catch). Use AsyncUncaughtExceptionHandler.

3. **No transaction propagation:** @Async runs in a NEW thread — the caller's @Transactional does NOT propagate. The async method needs its own @Transactional if it accesses DB.

4. **Unbounded queue:** Default SimpleAsyncTaskExecutor creates unlimited threads. Always configure a bounded pool.

5. **Testing:** @Async makes tests non-deterministic. In tests, use synchronous executor or CompletableFuture.join().`,
    followUp: 'When would you use @Async vs publishing to Kafka?',
    tags: ['async', 'spring', 'pitfalls']
  }
];
