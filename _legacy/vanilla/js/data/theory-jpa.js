/**
 * Theory Content — JPA / Hibernate
 * Entity mapping, relations, fetch strategies, queries
 */
const theoryJpa = [
  {
    id: 'theory-jpa-basics',
    title: 'JPA Entity Mapping',
    sections: [
      {
        heading: 'What is JPA?',
        content: `JPA (Java Persistence API) = specification for mapping Java objects to database tables. Hibernate = the most popular implementation.

<pre><code>@Entity
@Table(name = "delivery", schema = "logistics")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE,
        generator = "delivery_seq")
    @SequenceGenerator(name = "delivery_seq",
        sequenceName = "logistics.delivery_id_seq", allocationSize = 1)
    private Long id;

    @Column(name = "driver_id", nullable = false)
    private String driverId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status = DeliveryStatus.PLANNED;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @OneToMany(mappedBy = "delivery", cascade = CascadeType.ALL, orphanRemoval = true)
    private List&lt;Stop&gt; stops = new ArrayList&lt;&gt;();

    // JPA requires no-arg constructor (can be protected)
    protected Delivery() {}

    public Delivery(String driverId, LocalDateTime scheduledAt) {
        this.driverId = driverId;
        this.scheduledAt = scheduledAt;
    }
}</code></pre>

<strong>Key annotations:</strong>
• \`@Entity\` — marks class as JPA entity (must have @Id)
• \`@Table\` — maps to specific table/schema
• \`@Id + @GeneratedValue\` — primary key strategy
• \`@Column\` — column mapping (nullable, length, unique)
• \`@Enumerated(STRING)\` — store enum as text (NEVER ORDINAL in production)`
      }
    ]
  },
  {
    id: 'theory-jpa-relations',
    title: 'Relations & Fetch Strategies',
    sections: [
      {
        heading: 'Relationship types',
        content: `<pre><code>// @OneToMany — delivery has many stops
@OneToMany(mappedBy = "delivery", fetch = FetchType.LAZY)
private List&lt;Stop&gt; stops;

// @ManyToOne — stop belongs to one delivery
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "delivery_id")
private Delivery delivery;

// @ManyToMany — drivers have many skills, skills have many drivers
@ManyToMany
@JoinTable(name = "driver_skill",
    joinColumns = @JoinColumn(name = "driver_id"),
    inverseJoinColumns = @JoinColumn(name = "skill_id"))
private Set&lt;Skill&gt; skills;</code></pre>

<strong>GOLDEN RULE: Always use FetchType.LAZY</strong>

\`FetchType.EAGER\` loads related entities EVERY time you load the parent. With 100 deliveries, each with 10 stops → 1000 stops loaded even if you only needed the delivery status.

\`FetchType.LAZY\` loads related entities only when you ACCESS them. Use JOIN FETCH when you actually need them.`
      },
      {
        heading: 'The N+1 problem and solutions',
        content: `<pre><code>// ❌ N+1: loads 100 deliveries, then 1 query per delivery for stops
List&lt;Delivery&gt; deliveries = repo.findAll(); // 1 query
for (Delivery d : deliveries) {
    d.getStops().size(); // 100 queries! (one per delivery)
}

// ✅ JOIN FETCH — one query loads everything
@Query("SELECT d FROM Delivery d JOIN FETCH d.stops WHERE d.status = :status")
List&lt;Delivery&gt; findWithStops(@Param("status") DeliveryStatus status);
// 1 query with JOIN — all stops included

// ✅ @EntityGraph — declarative
@EntityGraph(attributePaths = {"stops", "driver"})
List&lt;Delivery&gt; findByStatus(DeliveryStatus status);

// ✅ @BatchSize — reduces N+1 to N/batch+1
@BatchSize(size = 25)
@OneToMany(mappedBy = "delivery")
private List&lt;Stop&gt; stops;
// Loads stops in batches of 25 (4 queries for 100 deliveries instead of 100)</code></pre>

<strong>Detection:</strong> Enable \`spring.jpa.show-sql=true\` in dev. If you see the same query repeated with different IDs → N+1.`
      }
    ]
  },
  {
    id: 'theory-jpa-queries',
    title: 'JPQL, Criteria, and Native Queries',
    sections: [
      {
        heading: 'Query approaches compared',
        content: `<pre><code>// 1. JPQL — object-oriented SQL (portable, type-safe-ish)
@Query("SELECT d FROM Delivery d WHERE d.status = :status AND d.scheduledAt > :after")
List&lt;Delivery&gt; findPlanned(@Param("status") DeliveryStatus s, @Param("after") LocalDateTime t);

// 2. Criteria API — programmatic, fully type-safe (verbose)
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery&lt;Delivery&gt; q = cb.createQuery(Delivery.class);
Root&lt;Delivery&gt; d = q.from(Delivery.class);
q.where(cb.equal(d.get("status"), status),
        cb.greaterThan(d.get("scheduledAt"), after));
// Good for dynamic filters (optional parameters)

// 3. Native SQL — when you need DB-specific features
@Query(value = """
    SELECT d.* FROM logistics.delivery d
    WHERE d.status = :status
    AND d.scheduled_at > :after
    ORDER BY d.scheduled_at
    LIMIT :limit
    """, nativeQuery = true)
List&lt;Delivery&gt; findPlannedNative(...);</code></pre>

<strong>When to use each:</strong>
• JPQL: standard queries, portable, works with entity names
• Criteria: dynamic filters (search forms with optional fields)
• Native: PostgreSQL-specific (JSONB, DISTINCT ON, window functions, CTEs)

<strong>Key rule:</strong> NEVER \`SELECT *\` in native queries for performance-critical paths. Project only needed columns into DTOs.`
      }
    ]
  }
];
