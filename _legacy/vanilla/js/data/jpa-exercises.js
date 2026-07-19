/**
 * JPA / Hibernate — Practice (15 exercises)
 * Entity mapping, relations, fetch, N+1, queries, performance
 */
const jpaExercises = [
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'INTER',
    subtopic: 'Fetch Types',
    mission: 'Delivery has @OneToMany(fetch = LAZY) stops. What happens here?',
    code: `@Transactional
public DeliveryDTO findById(Long id) {
    Delivery d = repo.findById(id).orElseThrow();  // 1 query
    return new DeliveryDTO(d.getId(), d.getStatus()); // no access to stops
}

// vs

@Transactional
public DeliveryDTO findWithStops(Long id) {
    Delivery d = repo.findById(id).orElseThrow();  // 1 query
    int count = d.getStops().size();               // ??? what happens?
    return new DeliveryDTO(d.getId(), d.getStatus(), count);
}`,
    choices: ['Both: 1 query each', 'First: 1 query. Second: 2 queries (lazy load triggered)', 'Second throws LazyInitializationException', 'Both: 2 queries each'],
    answer: 'First: 1 query. Second: 2 queries (lazy load triggered)',
    explain: 'LAZY means stops are NOT loaded until accessed. In findById, stops are never touched → 1 query. In findWithStops, d.getStops().size() triggers a second query to load stops. This works because the method is @Transactional (EntityManager still open). Without @Transactional → LazyInitializationException.'
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    subtopic: 'N+1 Problem',
    question: 'You need to list 100 deliveries with their drivers and stop counts. How do you avoid N+1?',
    options: [
      { label: 'A) JOIN FETCH both driver and stops in one JPQL query', description: 'SELECT d FROM Delivery d JOIN FETCH d.driver JOIN FETCH d.stops' },
      { label: 'B) JOIN FETCH driver + @BatchSize(25) on stops', description: 'Fetch driver eagerly, load stops in batches of 25.' },
      { label: 'C) DTO projection with subquery for count', description: 'SELECT new DTO(d.id, d.status, dr.name, SIZE(d.stops)) — no entity loading.' }
    ],
    bestOption: 2,
    explanation: `Option C (DTO projection) is best when you only need specific fields:

\`\`\`java
@Query("""
    SELECT new DeliveryListDTO(d.id, d.status, dr.name, SIZE(d.stops))
    FROM Delivery d
    LEFT JOIN d.driver dr
    WHERE d.status = :status
    """)
List<DeliveryListDTO> findListView(@Param("status") DeliveryStatus status);
\`\`\`

**Why C wins:**
• 1 single query (no N+1 possible)
• No entity management overhead (DTO is detached)
• Smaller memory footprint (only needed fields)
• SIZE() is computed by DB, not Java

**Why NOT A:** JOIN FETCH on TWO collections (driver + stops) creates a cartesian product: 100 deliveries × 10 stops = 1000 rows returned from DB. Hibernate deduplicates, but the network transfer is wasteful.

**Why B is acceptable:** Good compromise when you need full entity graphs. @BatchSize reduces 100 queries to 5 (100/25+1). But still loads full entities.

**Rule:** For LIST views (tables, grids) → DTO projection. For EDIT views (forms) → full entity with targeted fetching.`,
    tags: ['n-plus-1', 'dto-projection', 'performance']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Entity Mapping',
    question: 'What are the best practices for JPA entity design?',
    modelAnswer: `**Essential rules:**

\`\`\`java
@Entity
@Table(name = "delivery", schema = "logistics")
public class Delivery {

    @Id
    @GeneratedValue(strategy = SEQUENCE, generator = "delivery_seq")
    @SequenceGenerator(name = "delivery_seq",
        sequenceName = "logistics.delivery_id_seq", allocationSize = 1)
    private Long id;

    @Enumerated(EnumType.STRING)  // NEVER ORDINAL (adding enum value breaks existing data)
    private DeliveryStatus status;

    @ManyToOne(fetch = LAZY)  // ALWAYS lazy on @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @OneToMany(mappedBy = "delivery", cascade = ALL, orphanRemoval = true)
    private List<Stop> stops = new ArrayList<>();  // initialize collection!

    @Version  // optimistic locking
    private Integer version;

    protected Delivery() {}  // JPA requires no-arg (can be protected)
}
\`\`\`

**Rules:**
• \`@ManyToOne(fetch = LAZY)\` — ALWAYS (default is EAGER which is a trap!)
• \`@Enumerated(STRING)\` — NEVER ordinal (inserting enum value shifts all ordinals)
• Initialize collections — prevent NullPointerException
• Use \`@SequenceGenerator(allocationSize = 1)\` — matches PostgreSQL sequences
• \`@Version\` for optimistic locking on entities with concurrent access
• Protected no-arg constructor — JPA needs it, but hide from business code`,
    followUp: 'What\'s the difference between @ManyToOne(fetch=LAZY) and @OneToMany(fetch=LAZY)?',
    tags: ['entity', 'mapping', 'best-practices']
  },
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'SENIOR',
    subtopic: 'Persistence Context',
    mission: 'What happens in this code? How many queries?',
    code: `@Transactional
public void updateStatus(Long id) {
    Delivery d = repo.findById(id).orElseThrow();  // query 1
    d.setStatus(DeliveryStatus.DISPATCHED);
    // no repo.save() call!
}
// After method exits...`,
    choices: ['1 query (SELECT only) — status NOT updated (no save)', '2 queries (SELECT + UPDATE) — dirty checking auto-saves', '1 query — throws exception because save not called', '2 queries but UPDATE fails (no explicit flush)'],
    answer: '2 queries (SELECT + UPDATE) — dirty checking auto-saves',
    explain: 'JPA dirty checking: within a @Transactional method, the EntityManager tracks loaded entities. When the transaction commits (method ends), Hibernate compares current state with original (dirty checking). If any field changed, it auto-generates an UPDATE. You do NOT need to call save() for managed entities. This is a common source of confusion for developers new to JPA.'
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Cascade & orphanRemoval',
    question: 'Explain cascade types and orphanRemoval. When do they cause problems?',
    modelAnswer: `**CascadeType options:**
\`\`\`java
@OneToMany(cascade = CascadeType.ALL)  // persist, merge, remove, refresh, detach
@OneToMany(cascade = {PERSIST, MERGE}) // only save operations, not delete
\`\`\`

**Common cascades:**
• \`ALL\` — parent controls child lifecycle completely (strong ownership)
• \`PERSIST, MERGE\` — save children with parent, but don't delete
• \`REMOVE\` — deleting parent deletes children (careful!)

**orphanRemoval = true:**
\`\`\`java
@OneToMany(mappedBy = "delivery", cascade = ALL, orphanRemoval = true)
private List<Stop> stops;

// Removing from collection → DELETE from database
delivery.getStops().remove(stop);  // generates DELETE stop WHERE id = ?
\`\`\`

**When it causes problems:**
• \`CascadeType.REMOVE\` on @ManyToMany → deleting one side deletes shared entities!
• \`orphanRemoval\` on entities referenced elsewhere → accidental deletion
• \`CascadeType.ALL\` on @ManyToOne → unexpected: persisting a Stop cascades to Delivery

**Safe pattern:**
\`\`\`java
// Strong ownership (Delivery owns Stops — stops don't exist without delivery)
@OneToMany(mappedBy = "delivery", cascade = ALL, orphanRemoval = true)

// Weak reference (Delivery references Driver — driver exists independently)
@ManyToOne(fetch = LAZY)  // NO cascade! Driver has its own lifecycle
\`\`\``,
    followUp: 'What happens if you call delivery.getStops().clear() with orphanRemoval=true?',
    tags: ['cascade', 'orphan-removal', 'lifecycle']
  },
  {
    type: 'CODE_REFACTOR',
    difficulty: 'SENIOR',
    subtopic: 'Performance',
    question: 'What performance problems exist in this repository method?',
    code: `@Query("SELECT d FROM Delivery d WHERE d.status = :status")
List<Delivery> findByStatus(@Param("status") DeliveryStatus status);

// Called as:
List<Delivery> deliveries = repo.findByStatus(ACTIVE);  // may return 50,000!
for (Delivery d : deliveries) {
    System.out.println(d.getDriver().getName());  // N+1!
    System.out.println(d.getStops().size());      // N+1 again!
}`,
    problems: [
      'No LIMIT — could load 50,000 entities into memory (OOM risk)',
      'N+1 on driver: one query per delivery to load the driver',
      'N+1 on stops: one query per delivery to count stops',
      'Full entity loaded — all fields including large ones',
      'No pagination — client gets everything at once'
    ],
    refactored: `// Solution: paginated DTO projection with JOIN FETCH
@Query("""
    SELECT new DeliveryListDTO(d.id, d.status, dr.name, SIZE(d.stops))
    FROM Delivery d
    LEFT JOIN d.driver dr
    WHERE d.status = :status
    ORDER BY d.scheduledAt DESC
    """)
Page<DeliveryListDTO> findByStatus(@Param("status") DeliveryStatus status, Pageable pageable);

// Usage:
Page<DeliveryListDTO> page = repo.findByStatus(ACTIVE, PageRequest.of(0, 50));
// 1 query, 50 results max, no N+1, minimal memory`,
    tags: ['performance', 'pagination', 'projection']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Spring Data Methods',
    question: 'How does Spring Data JPA derive queries from method names? What are the limits?',
    modelAnswer: `**Spring Data parses the method name into a query:**
\`\`\`java
// Method name → generated query
List<Delivery> findByStatus(DeliveryStatus status);
// → WHERE status = ?

List<Delivery> findByStatusAndDriverId(DeliveryStatus s, Long dId);
// → WHERE status = ? AND driver_id = ?

List<Delivery> findByScheduledAtAfterOrderByScheduledAtAsc(LocalDateTime t);
// → WHERE scheduled_at > ? ORDER BY scheduled_at ASC

Optional<Delivery> findFirstByDriverIdAndStatus(Long dId, DeliveryStatus s);
// → WHERE driver_id = ? AND status = ? LIMIT 1

long countByStatus(DeliveryStatus status);
// → SELECT COUNT(*) WHERE status = ?

boolean existsByTrackingCode(String code);
// → SELECT EXISTS(... WHERE tracking_code = ?)
\`\`\`

**Keywords:** findBy, countBy, existsBy, deleteBy + And, Or, Between, LessThan, GreaterThan, Like, In, OrderBy, First, Top, Distinct

**Limits (use @Query instead):**
• Complex joins (need JPQL)
• Subqueries
• GROUP BY / HAVING
• Window functions
• Method name becomes unreadably long (>3 conditions)
• Dynamic optional filters (use Criteria or Specification)`,
    followUp: 'What is the Specification pattern in Spring Data?',
    tags: ['spring-data', 'method-names', 'limits']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Second-Level Cache',
    question: 'When should you use Hibernate second-level cache?',
    modelAnswer: `**L2 cache = shared across sessions/transactions (lives as long as the app):**
\`\`\`java
@Entity
@Cacheable
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Route {
    // Read often, changes rarely → good cache candidate
}
\`\`\`

**Good candidates (cache):**
• Reference data: Route templates, vehicle types, regions
• Configuration: delivery rules, pricing tiers
• Small, stable: <1000 entities, changes weekly

**Bad candidates (don't cache):**
• Delivery (changes every minute — cache immediately stale)
• Events/audit (write-heavy, never re-read)
• Large collections (memory pressure)
• Data changed by external systems (cache doesn't know)

**Cache strategies:**
• \`READ_ONLY\` — immutable data (enums, config)
• \`READ_WRITE\` — read often, write sometimes (routes, templates)
• \`NONSTRICT_READ_WRITE\` — tolerates brief staleness

**When cache HURTS:**
• High write frequency → constant invalidation → worse than no cache
• Large entities → memory pressure
• Multi-pod deployment without distributed cache → inconsistency

**Rule:** Start WITHOUT cache. Add only when you MEASURE that a specific query is called frequently with same params and returns same results.`,
    followUp: 'What\'s the difference between L1 cache (persistence context) and L2 cache?',
    tags: ['cache', 'l2-cache', 'performance']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Inheritance Mapping',
    question: 'You have StandardDelivery, ExpressDelivery, and SameDayDelivery with mostly shared fields. How do you map inheritance?',
    options: [
      { label: 'A) Single Table (SINGLE_TABLE) — one table, discriminator column', description: 'All types in one table with a type column. Unused columns are NULL.' },
      { label: 'B) Table per class (TABLE_PER_CLASS) — separate table per type', description: 'Each type has its own table with ALL columns (including shared ones).' },
      { label: 'C) Joined table (JOINED) — shared fields in parent table, specific in child tables', description: 'Base table + one table per subclass with only additional fields.' }
    ],
    bestOption: 0,
    explanation: `Single Table (A) is usually the best performance choice:

\`\`\`java
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "delivery_type")
public abstract class Delivery {
    @Id private Long id;
    private DeliveryStatus status;
    private LocalDateTime scheduledAt;
}

@Entity @DiscriminatorValue("STANDARD")
public class StandardDelivery extends Delivery { }

@Entity @DiscriminatorValue("EXPRESS")
public class ExpressDelivery extends Delivery {
    private BigDecimal priorityFee;
}

@Entity @DiscriminatorValue("SAME_DAY")
public class SameDayDelivery extends Delivery {
    private LocalTime deadline;
}
\`\`\`

**Why Single Table wins:**
• No JOINs needed for polymorphic queries (fast!)
• Simple schema (one table)
• \`findAll()\` is a single table scan

**Trade-off:** columns specific to subtypes are NULL for other types. Acceptable when subtypes are similar.

**Use JOINED when:** subtypes have MANY different columns (would waste too much space with NULLs).`,
    tags: ['inheritance', 'mapping', 'strategy']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Transactions',
    question: 'Explain the self-invocation problem with @Transactional in Spring.',
    modelAnswer: `**The trap:** Calling a @Transactional method from within the SAME class bypasses the proxy.

\`\`\`java
@Service
public class DeliveryService {

    @Transactional
    public void processAll() {
        List<Delivery> all = repo.findAll();
        for (Delivery d : all) {
            processSingle(d);  // ❌ @Transactional IGNORED! Same class = no proxy
        }
    }

    @Transactional(propagation = REQUIRES_NEW)
    public void processSingle(Delivery d) {
        // Intended: each delivery in its own transaction
        // Reality: runs in processAll()'s transaction (self-invocation)
    }
}
\`\`\`

**Why it happens:** Spring @Transactional works via AOP proxy. When you call \`this.processSingle()\`, you bypass the proxy — calling the raw method directly.

**Fixes:**
\`\`\`java
// Fix 1: Inject self (proxy)
@Autowired private DeliveryService self;
self.processSingle(d);  // goes through proxy → new TX

// Fix 2: Separate class
@Service class DeliveryItemProcessor {
    @Transactional(propagation = REQUIRES_NEW)
    public void process(Delivery d) { ... }
}

// Fix 3: TransactionTemplate (programmatic)
transactionTemplate.execute(status -> { process(d); return null; });
\`\`\`

**Same problem exists in Java EE** with EJB — calling another @TransactionAttribute method on \`this\` within the same bean also bypasses the container interceptor.`,
    followUp: 'What other Spring annotations are affected by the self-invocation problem?',
    tags: ['transactional', 'self-invocation', 'proxy']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Migration',
    question: 'How do you manage database schema changes with Flyway in a team?',
    modelAnswer: `**Flyway basics:**
\`\`\`
src/main/resources/db/migration/
├── V1__create_delivery_table.sql
├── V2__add_driver_fk.sql
├── V3__add_status_index.sql
├── V4__create_stop_table.sql
└── V5__add_tracking_code_column.sql
\`\`\`

**Rules:**
• NEVER modify a migration after it's applied (append-only)
• Naming: V{number}__{description}.sql (double underscore!)
• Migrations run IN ORDER on startup (before app serves traffic)
• Flyway tracks applied migrations in \`flyway_schema_history\` table

**Team workflow:**
\`\`\`
Dev A: creates V5__add_tracking_code.sql on feature branch
Dev B: creates V5__add_priority_field.sql on another branch
→ CONFLICT when both merge! Fix: renumber to V5 and V6
\`\`\`

**Zero-downtime migrations (for rolling deploys):**
\`\`\`
Sprint 1: V5 adds new column (nullable, with default)
         → old code ignores it, new code uses it
Sprint 2: V6 removes old column
         → old code no longer deployed

NEVER: rename column, change type, add NOT NULL without default
       (breaks running old-version pods during rolling deploy)
\`\`\`

**Spring Boot auto-runs Flyway** on startup. No manual intervention needed.`,
    followUp: 'How do you roll back a Flyway migration that already ran in production?',
    tags: ['flyway', 'migrations', 'team-workflow']
  }
];
