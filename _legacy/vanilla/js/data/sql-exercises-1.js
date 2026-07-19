/**
 * SQL & Performance Module — Practice (20 exercises)
 * Query optimization, indexes, EXPLAIN, transactions, N+1
 */
const sqlExercises1 = [
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'BASIC',
    subtopic: 'JOIN behavior',
    mission: 'A delivery has no driver assigned (driver_id IS NULL). What does this query return for that delivery?',
    code: `SELECT d.id, d.status, dr.name AS driver_name
FROM delivery d
INNER JOIN driver dr ON d.driver_id = dr.id
WHERE d.status = 'PLANNED';

-- delivery table: (id=1, status='PLANNED', driver_id=NULL)
-- delivery table: (id=2, status='PLANNED', driver_id=42)
-- driver table:   (id=42, name='Carlos')`,
    choices: ['Row for id=1 with driver_name=NULL, Row for id=2 with driver_name=Carlos', 'Only row for id=2 with driver_name=Carlos', 'Both rows, id=1 has empty driver_name', 'Error: NULL in JOIN condition'],
    answer: 'Only row for id=2 with driver_name=Carlos',
    explain: 'INNER JOIN excludes rows where the join condition doesn\'t match. NULL never equals anything (not even NULL), so delivery id=1 (driver_id=NULL) has no match in driver table and is excluded. Use LEFT JOIN to include deliveries without drivers.'
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Index Strategy',
    question: 'Your most frequent query is: SELECT * FROM delivery WHERE status = \'ACTIVE\' AND driver_id = ? ORDER BY scheduled_at. Table has 5 million rows, 200K active. What index?',
    options: [
      { label: 'A) CREATE INDEX idx ON delivery(status)', description: 'Single column index on status.' },
      { label: 'B) CREATE INDEX idx ON delivery(driver_id, status, scheduled_at)', description: 'Composite index covering all filter + sort columns.' },
      { label: 'C) CREATE INDEX idx ON delivery(status, driver_id, scheduled_at)', description: 'Composite index with status first (higher selectivity for the constant).' }
    ],
    bestOption: 1,
    explanation: `Option B (driver_id, status, scheduled_at) is optimal:

**Why this order matters (leftmost prefix rule):**
- driver_id first: equality condition, high cardinality (many distinct values)
- status second: equality condition, filters within the driver's deliveries
- scheduled_at third: used for ORDER BY (index already sorted!)

This index satisfies the WHERE AND ORDER BY in a single index scan — no sort needed.

**Why NOT C (status first):**
- status='ACTIVE' matches 200K rows (4% selectivity)
- driver_id=? then filters to ~50 rows
- Starting with the MORE selective column is better when both are equality

**Why NOT A (status only):**
- Returns 200K rows, then must filter by driver_id (table scan on those 200K)
- Then must sort by scheduled_at (expensive)

**Rule:** For composite indexes, put equality conditions first (in order of selectivity), then range/sort columns last.`,
    tags: ['indexes', 'composite', 'performance']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'EXPLAIN ANALYZE',
    question: 'You run EXPLAIN ANALYZE and see "Seq Scan on delivery (cost=0.00..45000.00 rows=5000000)". What does this tell you and what do you do?',
    modelAnswer: `**What it means:**
- Seq Scan = reading the ENTIRE table sequentially (no index used)
- cost=45000 = estimated I/O cost (high)
- rows=5000000 = scanning all 5 million rows

**Why it's happening (likely causes):**
1. No index exists for the WHERE clause columns
2. Index exists but PostgreSQL chose seq scan because it estimates reading >5-10% of the table
3. Statistics are outdated (run ANALYZE)
4. Query uses a function on the indexed column (prevents index use)

**What to do:**
\`\`\`sql
-- 1. Check what indexes exist
\\d delivery

-- 2. Create appropriate index
CREATE INDEX idx_delivery_status_driver ON delivery(status, driver_id);

-- 3. Re-run EXPLAIN ANALYZE — should now show:
-- Index Scan using idx_delivery_status_driver (cost=0.43..8.50 rows=50)

-- 4. If index exists but not used:
ANALYZE delivery;  -- update statistics
-- Or check: is the WHERE filtering >10% of rows? (Seq scan may be correct then)
\`\`\`

**What to look for in EXPLAIN:**
- Seq Scan on large table → probably needs index
- Nested Loop with inner Seq Scan → missing index on join column
- Sort (external merge) → consider index for ORDER BY
- Rows estimate very different from actual → run ANALYZE`,
    tags: ['explain', 'seq-scan', 'diagnosis']
  },
  {
    type: 'CODE_REFACTOR',
    difficulty: 'SENIOR',
    subtopic: 'N+1 Problem',
    question: 'This code causes 101 queries. Identify the N+1 and fix it.',
    code: `@Transactional(readOnly = true)
public List<DeliveryDTO> findActiveDeliveries() {
    List<Delivery> deliveries = deliveryRepo.findByStatus(ACTIVE); // 1 query

    return deliveries.stream().map(d -> {
        Driver driver = driverRepo.findById(d.getDriverId()).orElse(null); // N queries!
        List<Stop> stops = stopRepo.findByDeliveryId(d.getId());          // N queries!
        return new DeliveryDTO(d.getId(), d.getStatus(),
            driver != null ? driver.getName() : "Unassigned",
            stops.size());
    }).toList();
}
// 100 deliveries = 1 + 100 + 100 = 201 queries!`,
    problems: [
      'N+1 on driverRepo.findById — one query per delivery for driver',
      'N+1 on stopRepo.findByDeliveryId — one query per delivery for stops',
      'Total: 1 + N + N = 201 queries for 100 deliveries',
      'Each query has network roundtrip + connection pool overhead'
    ],
    refactored: `// Solution 1: Single JOIN FETCH query
@Query("""
    SELECT d FROM Delivery d
    LEFT JOIN FETCH d.driver
    LEFT JOIN FETCH d.stops
    WHERE d.status = :status
    """)
List<Delivery> findActiveWithDriverAndStops(@Param("status") DeliveryStatus status);

// Solution 2: Batch fetch (if JOIN FETCH causes cartesian product)
@Query("SELECT d FROM Delivery d LEFT JOIN FETCH d.driver WHERE d.status = :status")
List<Delivery> findActiveWithDriver(@Param("status") DeliveryStatus status);
// + @BatchSize(size = 25) on stops collection

// Solution 3: DTO projection (when you only need specific fields)
@Query("""
    SELECT new DeliveryDTO(d.id, d.status, dr.name, SIZE(d.stops))
    FROM Delivery d LEFT JOIN d.driver dr
    WHERE d.status = :status
    """)
List<DeliveryDTO> findActiveDTOs(@Param("status") DeliveryStatus status);
// 1 query total!`,
    tags: ['n-plus-1', 'join-fetch', 'performance']
  },
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'INTER',
    subtopic: 'Transaction Isolation',
    mission: 'PostgreSQL uses READ COMMITTED (default). TX1 reads a delivery status, then TX2 updates it and commits. TX1 reads again. What does TX1 see?',
    code: `-- TX1 starts
BEGIN;
SELECT status FROM delivery WHERE id = 1;  -- returns 'PLANNED'

-- TX2 (separate session): UPDATE delivery SET status = 'DISPATCHED' WHERE id = 1; COMMIT;

-- TX1 reads again (same transaction)
SELECT status FROM delivery WHERE id = 1;  -- returns ???
COMMIT;`,
    choices: ['PLANNED (repeatable read within TX1)', 'DISPATCHED (sees committed data)', 'Error: serialization conflict', 'NULL (row locked by TX2)'],
    answer: 'DISPATCHED (sees committed data)',
    explain: 'READ COMMITTED means each statement sees the latest COMMITTED data at the moment the statement runs. TX2 committed before TX1\'s second read, so TX1 sees DISPATCHED. This is called a "non-repeatable read" — same query returns different results within one transaction. Use REPEATABLE READ isolation if you need consistent reads.'
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Query Optimization',
    question: 'A report query takes 15 seconds. Walk me through your optimization process.',
    modelAnswer: `**Step-by-step process:**

**1. EXPLAIN ANALYZE (understand the plan):**
\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT ... FROM delivery d JOIN stop s ON ... WHERE ...;
\`\`\`

**2. Identify the expensive nodes:**
- Seq Scan on large table? → needs index
- Sort with external disk? → add index for ORDER BY
- Nested Loop with many iterations? → missing index on inner table
- Hash Join building huge hash table? → filter earlier

**3. Check row estimates vs actual:**
- If estimated=100 but actual=500,000 → stale statistics
- Run \`ANALYZE table_name;\`

**4. Common fixes:**
\`\`\`sql
-- Missing index
CREATE INDEX idx_delivery_status_date ON delivery(status, scheduled_at);

-- Function prevents index use
-- ❌ WHERE EXTRACT(YEAR FROM scheduled_at) = 2026
-- ✅ WHERE scheduled_at >= '2026-01-01' AND scheduled_at < '2027-01-01'

-- SELECT * loads unnecessary columns (BLOBs, text)
-- ✅ SELECT only needed columns

-- Subquery executes per row
-- ❌ WHERE id IN (SELECT delivery_id FROM stop WHERE ...)
-- ✅ WHERE EXISTS (SELECT 1 FROM stop s WHERE s.delivery_id = d.id AND ...)

-- Pagination without ORDER BY or OFFSET on huge result
-- ✅ Use keyset pagination: WHERE id > :lastId ORDER BY id LIMIT 50
\`\`\`

**5. Verify:**
- Run EXPLAIN ANALYZE again → confirm improvement
- Test with production-like data volume (not dev with 100 rows)`,
    tags: ['optimization', 'explain', 'process']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Pagination',
    question: 'You need to paginate 2 million deliveries. The UI shows 50 rows per page. Users can jump to page 5000. Which approach?',
    options: [
      { label: 'A) OFFSET/LIMIT: SELECT * FROM delivery ORDER BY id LIMIT 50 OFFSET 249950', description: 'Standard offset pagination. Simple but scans and skips 249,950 rows.' },
      { label: 'B) Keyset/Cursor: SELECT * FROM delivery WHERE id > :lastId ORDER BY id LIMIT 50', description: 'Use the last seen ID as cursor. Always fast but no random page access.' },
      { label: 'C) Offset with covering index + deferred join', description: 'First get IDs with offset (fast if only reading index), then join for full rows.' }
    ],
    bestOption: 2,
    explanation: `Option C (deferred join) balances performance with random access:

\`\`\`sql
-- Step 1: Get IDs fast (index-only scan on PK)
SELECT id FROM delivery ORDER BY id LIMIT 50 OFFSET 249950;
-- Fast because it only reads the index, not the full rows

-- Step 2: Fetch full rows for those 50 IDs
SELECT * FROM delivery WHERE id IN (:ids);
-- Only reads 50 rows from heap

-- Combined:
SELECT d.* FROM delivery d
JOIN (SELECT id FROM delivery ORDER BY id LIMIT 50 OFFSET 249950) sub
ON d.id = sub.id;
\`\`\`

**When each approach is best:**
- Keyset (B): best performance, use for infinite scroll / "load more"
- Deferred join (C): good performance + random page access
- Simple OFFSET (A): only acceptable for small datasets (<100K rows) or first few pages

**Never use OFFSET 1000000 on a large table** — PostgreSQL must scan and discard 1M rows before returning 50.`,
    tags: ['pagination', 'offset', 'keyset']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'CTEs',
    question: 'What are CTEs (Common Table Expressions)? When do you use them vs subqueries?',
    modelAnswer: `**CTE (WITH clause) — named temporary result set:**
\`\`\`sql
WITH active_deliveries AS (
    SELECT d.*, dr.name AS driver_name
    FROM delivery d
    JOIN driver dr ON d.driver_id = dr.id
    WHERE d.status = 'ACTIVE'
),
stops_count AS (
    SELECT delivery_id, COUNT(*) AS num_stops
    FROM stop
    GROUP BY delivery_id
)
SELECT ad.id, ad.driver_name, sc.num_stops
FROM active_deliveries ad
LEFT JOIN stops_count sc ON sc.delivery_id = ad.id
ORDER BY ad.scheduled_at;
\`\`\`

**CTEs vs Subqueries:**
| Aspect | CTE | Subquery |
|--------|-----|----------|
| Readability | ✅ Named, top-down | ❌ Nested, hard to read |
| Reuse | ✅ Reference multiple times | ❌ Must repeat |
| Performance (PG12+) | Same (inlined by optimizer) | Same |
| Recursive | ✅ WITH RECURSIVE | ❌ Not possible |

**When to use CTEs:**
- Complex queries with multiple logical steps (readability!)
- Need to reference the same derived table twice
- Recursive queries (tree traversal, hierarchies)
- Breaking down 100-line queries into understandable chunks

**PostgreSQL 12+ note:** CTEs are inlined (optimized like subqueries) unless you use \`MATERIALIZED\`. Before PG12, CTEs were always materialized (optimization fence).`,
    tags: ['cte', 'readability', 'recursive']
  },
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'INTER',
    subtopic: 'NULL behavior',
    mission: 'What does this query return?',
    code: `SELECT COUNT(*), COUNT(driver_id), COUNT(DISTINCT driver_id)
FROM delivery
WHERE status = 'ACTIVE';

-- Active deliveries:
-- (id=1, driver_id=42)
-- (id=2, driver_id=42)
-- (id=3, driver_id=NULL)
-- (id=4, driver_id=99)
-- (id=5, driver_id=NULL)`,
    choices: ['5, 5, 2', '5, 3, 2', '5, 3, 3', '3, 3, 2'],
    answer: '5, 3, 2',
    explain: 'COUNT(*) counts all rows (5). COUNT(driver_id) counts non-NULL values (3 — excludes 2 NULLs). COUNT(DISTINCT driver_id) counts distinct non-NULL values (2 — 42 and 99). NULL is never counted by COUNT(column) and never considered distinct.'
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Partitioning',
    question: 'The delivery table has 50 million rows (3 years of history). Most queries only access recent data (last 30 days). How would you use table partitioning?',
    modelAnswer: `**Range partitioning by date:**
\`\`\`sql
CREATE TABLE delivery (
    id BIGSERIAL,
    status VARCHAR(20),
    scheduled_at TIMESTAMP NOT NULL,
    driver_id BIGINT,
    ...
) PARTITION BY RANGE (scheduled_at);

-- Create monthly partitions
CREATE TABLE delivery_2026_01 PARTITION OF delivery
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE delivery_2026_02 PARTITION OF delivery
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ... etc
\`\`\`

**Benefits:**
- Queries with \`WHERE scheduled_at >= '2026-07-01'\` only scan July partition (not 50M rows)
- DROP old partitions instantly (vs DELETE millions of rows — no bloat, no vacuum)
- Each partition has its own indexes (smaller, faster)
- VACUUM runs per-partition (faster maintenance)

**When to partition:**
- Table >10M rows AND queries mostly access a subset
- Need to efficiently drop/archive old data
- Index maintenance becomes too slow

**When NOT to partition:**
- Table <1M rows (indexes are sufficient)
- Queries regularly span ALL partitions (no benefit)
- Primary access pattern is by ID, not by date`,
    tags: ['partitioning', 'large-tables', 'performance']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Batch Operations',
    question: 'You need to update status to EXPIRED for 500,000 deliveries where scheduled_at < 30 days ago. How?',
    options: [
      { label: 'A) Single UPDATE: UPDATE delivery SET status = \'EXPIRED\' WHERE scheduled_at < NOW() - INTERVAL \'30 days\' AND status = \'PLANNED\'', description: 'One statement, updates all 500K rows at once.' },
      { label: 'B) Batch UPDATE in loop: UPDATE ... LIMIT 1000 in a CTE loop', description: 'Process 1000 rows at a time with small transactions.' },
      { label: 'C) JPA: findAll + forEach + save', description: 'Load all entities, update in Java, flush.' }
    ],
    bestOption: 1,
    explanation: `Option B (batch UPDATE) is safest for production:

\`\`\`sql
-- PostgreSQL batch delete/update pattern
WITH batch AS (
    SELECT id FROM delivery
    WHERE scheduled_at < NOW() - INTERVAL '30 days'
      AND status = 'PLANNED'
    ORDER BY id
    LIMIT 1000
)
UPDATE delivery SET status = 'EXPIRED'
WHERE id IN (SELECT id FROM batch);
\`\`\`

Repeat in Java loop until affected rows = 0.

**Why NOT A (single statement):**
- Locks 500K rows simultaneously → blocks all other queries on those rows
- Transaction log grows huge → risk of running out of disk
- If it fails at row 400K → all 500K rolled back → start over

**Why NOT C (JPA):**
- Loads 500K entities into memory → OutOfMemoryError
- 500K individual UPDATE statements → N+1 writes
- Slowest possible approach

**Option B advantages:**
- Small lock window (1000 rows at a time)
- If one batch fails → only 1000 rows lost, continue from next batch
- Constant memory usage
- Can add \`pg_sleep(0.1)\` between batches to reduce load`,
    tags: ['batch', 'bulk-update', 'production-safe']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Optimistic Locking',
    question: 'Two dispatchers try to assign the same delivery to different drivers simultaneously. How do you prevent the conflict?',
    modelAnswer: `**Optimistic Locking with @Version:**

\`\`\`java
@Entity
public class Delivery {
    @Id private Long id;
    @Version private Integer version; // auto-incremented on each UPDATE
    private Long driverId;
    private DeliveryStatus status;
}
\`\`\`

**What happens:**
\`\`\`
TX1: reads delivery (version=1)
TX2: reads delivery (version=1)
TX1: assigns driver, saves → UPDATE delivery SET driver_id=42, version=2 WHERE id=1 AND version=1 ✅
TX2: assigns driver, saves → UPDATE delivery SET driver_id=99, version=2 WHERE id=1 AND version=1 ❌
     → 0 rows affected → OptimisticLockException thrown → TX2 must retry
\`\`\`

**Handling in code:**
\`\`\`java
@Transactional
public void assignDriver(Long deliveryId, Long driverId) {
    try {
        Delivery d = repo.findById(deliveryId).orElseThrow();
        d.assignDriver(driverId);
        repo.save(d);
    } catch (OptimisticLockException e) {
        throw new ConflictException("Delivery was modified. Please retry.");
    }
}
\`\`\`

**Optimistic vs Pessimistic:**
- Optimistic (above): assumes conflicts are rare. No locks held. Retry on conflict.
- Pessimistic: SELECT FOR UPDATE — locks the row immediately. Use when conflicts are frequent.

For REWE: optimistic locking is correct. Two dispatchers assigning same delivery is rare edge case.`,
    tags: ['optimistic-locking', 'concurrency', 'version']
  },
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'BASIC',
    subtopic: 'GROUP BY',
    mission: 'What does this query return?',
    code: `SELECT status, COUNT(*) AS total, AVG(distance_km) AS avg_distance
FROM delivery
WHERE scheduled_at >= '2026-07-01'
GROUP BY status
HAVING COUNT(*) > 2;

-- July deliveries:
-- (PLANNED, 15km), (PLANNED, 25km), (PLANNED, 20km)
-- (ACTIVE, 30km), (ACTIVE, 10km), (ACTIVE, 50km)
-- (COMPLETED, 40km), (COMPLETED, 60km)`,
    choices: [
      'PLANNED: 3, 20.0 | ACTIVE: 3, 30.0 | COMPLETED: 2, 50.0',
      'PLANNED: 3, 20.0 | ACTIVE: 3, 30.0',
      'PLANNED: 3, 60 | ACTIVE: 3, 90',
      'All three rows (HAVING ignored)'
    ],
    answer: 'PLANNED: 3, 20.0 | ACTIVE: 3, 30.0',
    explain: 'GROUP BY groups rows by status. COUNT(*) counts per group. AVG computes average distance. HAVING COUNT(*) > 2 filters OUT groups with 2 or fewer rows — COMPLETED (only 2 rows) is excluded. PLANNED avg: (15+25+20)/3=20. ACTIVE avg: (30+10+50)/3=30.'
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Connection Pool',
    question: 'Users report the application freezing intermittently. Monitoring shows JDBC connection pool at 100% utilization. What is likely happening and how do you fix it?',
    modelAnswer: `**Diagnosis:**
Connection pool exhausted = all connections in use, new requests wait (and eventually timeout).

**Most likely causes:**
1. **Long-running transaction holds connection** (common in Spring @Transactional)
2. **External call inside transaction** (REST/LDAP blocks while holding JDBC connection)
3. **N+1 queries** (100 queries × 100ms = 10s holding connection)
4. **Missing timeout on external service** (thread blocks forever with connection)
5. **Connection leak** (connection borrowed but never returned — missing try-with-resources)

**Immediate fix:**
- Identify queries holding connections: check pg_stat_activity for long-running queries
- Kill stuck transactions if safe

**Permanent fixes:**
\`\`\`yaml
# 1. Configure pool with timeout
spring.datasource.hikari:
  maximum-pool-size: 20
  connection-timeout: 5000  # fail fast if pool empty (5s)
  leak-detection-threshold: 30000  # log warning if connection held >30s
\`\`\`

\`\`\`java
// 2. Never do external I/O inside @Transactional
@Transactional
public void bad() {
    repo.save(delivery);
    externalService.notify(delivery); // ← blocks with connection held!
}

// Fix: separate transaction from I/O
public void good() {
    deliveryTxService.save(delivery);  // short TX
    externalService.notify(delivery);  // outside TX, no connection held
}
\`\`\`

// 3. Reduce transaction duration — readOnly for reads
\`\`\`java
@Transactional(readOnly = true, timeout = 5)
public List<DeliveryDTO> search(Filter f) { ... }
\`\`\``,
    tags: ['connection-pool', 'hikari', 'production-issue']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'EXISTS vs IN',
    question: 'Find deliveries that have at least one failed stop. Table has 5M deliveries and 50M stops. Which approach?',
    options: [
      { label: 'A) JOIN: SELECT d.* FROM delivery d JOIN stop s ON s.delivery_id = d.id WHERE s.status = \'FAILED\'', description: 'Inner join with stop table, may return duplicate delivery rows.' },
      { label: 'B) IN: SELECT * FROM delivery WHERE id IN (SELECT delivery_id FROM stop WHERE status = \'FAILED\')', description: 'Subquery materializes all delivery IDs with failed stops.' },
      { label: 'C) EXISTS: SELECT * FROM delivery d WHERE EXISTS (SELECT 1 FROM stop s WHERE s.delivery_id = d.id AND s.status = \'FAILED\')', description: 'Correlated subquery, stops at first match.' }
    ],
    bestOption: 2,
    explanation: `EXISTS is best for "has at least one" queries:

**Why EXISTS wins:**
- Stops searching as soon as it finds ONE matching stop (short-circuits)
- Never produces duplicate delivery rows
- PostgreSQL optimizes EXISTS into a semi-join (very efficient with index)
- With index on stop(delivery_id, status) → nearly instant per delivery

**Why NOT JOIN (A):**
- If a delivery has 3 failed stops → returns 3 duplicate rows
- Must add DISTINCT (extra cost) or GROUP BY

**Why NOT IN (B):**
- Materializes the entire subquery result (all delivery_ids with failed stops)
- For 50M stops with 10% failed → builds a set of ~500K IDs in memory
- Then checks each delivery against this set

**Required index:**
\`\`\`sql
CREATE INDEX idx_stop_delivery_status ON stop(delivery_id, status);
-- EXISTS checks: for this delivery_id, does any stop with status='FAILED' exist?
-- Index scan: immediate answer
\`\`\``,
    tags: ['exists', 'semi-join', 'performance']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Index Types',
    question: 'When would you use a partial index or a covering index in PostgreSQL?',
    modelAnswer: `**Partial index — index only a subset of rows:**
\`\`\`sql
-- Only index ACTIVE deliveries (5% of table)
CREATE INDEX idx_active_deliveries ON delivery(driver_id, scheduled_at)
WHERE status = 'ACTIVE';

-- 5M rows total, but index only covers ~250K active ones → tiny, fast
-- Queries MUST include "AND status = 'ACTIVE'" to use this index
\`\`\`
**When:** most queries filter on a specific value, and that subset is small relative to the table.

**Covering index (INCLUDE) — avoid table heap access:**
\`\`\`sql
-- Index contains all columns needed by the query
CREATE INDEX idx_delivery_cover ON delivery(status, driver_id)
INCLUDE (scheduled_at, route_id);

-- Query: SELECT scheduled_at, route_id FROM delivery WHERE status = 'ACTIVE' AND driver_id = 42
-- → Index-Only Scan (never reads the table row! Answers entirely from index)
\`\`\`
**When:** frequent queries need only a few columns. Avoids expensive heap access.

**Other useful types:**
- \`CREATE INDEX ... ON delivery(lower(email))\` — functional index for case-insensitive search
- \`CREATE INDEX ... USING GIN (metadata)\` — for JSONB column queries
- \`CREATE UNIQUE INDEX ... ON delivery(tracking_code) WHERE tracking_code IS NOT NULL\` — unique partial`,
    tags: ['partial-index', 'covering-index', 'postgresql']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Database Anti-patterns',
    question: 'What are the most common database performance anti-patterns you\'ve seen in Java applications?',
    modelAnswer: `**Top 5 anti-patterns:**

**1. N+1 Queries (most common):**
Loop that calls DB per item. Fix: JOIN FETCH, @BatchSize, or IN clause.

**2. SELECT * everywhere:**
Loads all columns including BLOBs and huge text fields. Fix: DTO projections, select only needed columns.

**3. Missing indexes on FK columns:**
JPA creates FK constraints but NOT indexes automatically. Every JOIN/WHERE on FK → sequential scan. Fix: always index FK columns.

**4. Transaction too long (I/O inside TX):**
REST call or LDAP inside @Transactional holds JDBC connection. Fix: separate TX from external calls.

**5. No LIMIT on user-facing queries:**
UI search without limit can return 1M rows. Fix: always paginate with hard max (e.g., 100).

**Bonus anti-patterns:**
- Using OFFSET for deep pagination (slow on page 10000)
- COUNT(*) on every page load (expensive on large tables)
- Storing computed values instead of indexing properly
- Using ORM for everything (complex reports belong in native SQL)
- Not using connection pool timeouts (one stuck query exhausts pool)`,
    tags: ['anti-patterns', 'performance', 'experience']
  },
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'INTER',
    subtopic: 'Window Functions',
    mission: 'What does this return for delivery id=2?',
    code: `SELECT id, driver_id, scheduled_at,
       ROW_NUMBER() OVER (PARTITION BY driver_id ORDER BY scheduled_at) AS delivery_seq
FROM delivery
WHERE status = 'ACTIVE'
ORDER BY driver_id, delivery_seq;

-- Active deliveries:
-- (id=1, driver_id=42, scheduled_at='2026-07-19 08:00')
-- (id=2, driver_id=42, scheduled_at='2026-07-19 10:00')
-- (id=3, driver_id=42, scheduled_at='2026-07-19 14:00')
-- (id=4, driver_id=99, scheduled_at='2026-07-19 09:00')`,
    choices: ['delivery_seq = 1', 'delivery_seq = 2', 'delivery_seq = 3', 'delivery_seq = 4'],
    answer: 'delivery_seq = 2',
    explain: 'ROW_NUMBER() OVER (PARTITION BY driver_id ORDER BY scheduled_at) numbers rows within each driver group, ordered by time. Driver 42 has 3 deliveries: id=1 gets seq=1 (08:00), id=2 gets seq=2 (10:00), id=3 gets seq=3 (14:00). Driver 99: id=4 gets seq=1.'
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Deadlocks',
    question: 'Two transactions deadlock. PostgreSQL kills one. How do you prevent this from recurring?',
    modelAnswer: `**What happened:**
\`\`\`
TX1: UPDATE delivery SET status='X' WHERE id=1;  -- locks row 1
TX2: UPDATE delivery SET status='Y' WHERE id=2;  -- locks row 2
TX1: UPDATE delivery SET status='X' WHERE id=2;  -- waits for TX2 (row 2 locked)
TX2: UPDATE delivery SET status='Y' WHERE id=1;  -- waits for TX1 (row 1 locked)
-- DEADLOCK! PostgreSQL detects and kills one TX
\`\`\`

**Prevention strategies:**

**1. Consistent lock ordering:**
Always update rows in the same order (e.g., by ID ascending):
\`\`\`java
List<Long> ids = List.of(id1, id2);
Collections.sort(ids);  // Always lock in ascending order
for (Long id : ids) { repo.updateStatus(id, newStatus); }
\`\`\`

**2. Reduce transaction duration:**
Shorter transactions = smaller lock window = less chance of overlap.

**3. Use SELECT FOR UPDATE with SKIP LOCKED:**
\`\`\`sql
SELECT * FROM delivery WHERE status = 'PLANNED'
ORDER BY id
LIMIT 1
FOR UPDATE SKIP LOCKED;
-- If row is locked by another TX, skip it and take the next one
\`\`\`

**4. Use optimistic locking (@Version):**
No locks held — detect conflict at commit time, retry.

**5. Reduce scope:** update fewer rows per transaction.`,
    tags: ['deadlock', 'locking', 'prevention']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Query Patterns for JPA',
    question: 'When do you use JPQL vs native SQL vs Criteria API? Give examples for each.',
    modelAnswer: `**JPQL — default choice (90% of queries):**
\`\`\`java
@Query("SELECT d FROM Delivery d WHERE d.status = :status AND d.scheduledAt > :after")
List<Delivery> findPlanned(@Param("status") Status s, @Param("after") LocalDateTime t);
\`\`\`
Use when: standard filters, joins between entities, portable across DBs.

**Native SQL — PostgreSQL-specific features:**
\`\`\`java
@Query(value = """
    WITH ranked AS (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY driver_id ORDER BY scheduled_at) AS rn
        FROM delivery WHERE status = 'ACTIVE'
    )
    SELECT * FROM ranked WHERE rn = 1
    """, nativeQuery = true)
List<Delivery> findNextDeliveryPerDriver();
\`\`\`
Use when: window functions, CTEs, JSONB, DISTINCT ON, array operations, lateral joins.

**Criteria API — dynamic filters (search forms):**
\`\`\`java
public List<Delivery> search(DeliveryFilter filter) {
    CriteriaBuilder cb = em.getCriteriaBuilder();
    var q = cb.createQuery(Delivery.class);
    var root = q.from(Delivery.class);
    var predicates = new ArrayList<Predicate>();

    if (filter.getStatus() != null)
        predicates.add(cb.equal(root.get("status"), filter.getStatus()));
    if (filter.getDriverId() != null)
        predicates.add(cb.equal(root.get("driverId"), filter.getDriverId()));
    if (filter.getAfter() != null)
        predicates.add(cb.greaterThan(root.get("scheduledAt"), filter.getAfter()));

    q.where(predicates.toArray(new Predicate[0]));
    return em.createQuery(q).getResultList();
}
\`\`\`
Use when: optional filters that combine in many ways (search screens with 8 optional fields).`,
    tags: ['jpql', 'native', 'criteria', 'when-to-use']
  }
];
