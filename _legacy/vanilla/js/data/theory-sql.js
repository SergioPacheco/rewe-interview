/**
 * Theory Content — SQL & Performance
 * JOINs, indexes, execution plans, transactions, optimization
 */
const theorySql = [
  {
    id: 'theory-sql-joins',
    title: 'SQL JOINs — How Tables Connect',
    sections: [
      {
        heading: 'JOIN types visualized',
        content: `<pre><code>-- INNER JOIN: only matching rows from BOTH tables
SELECT d.id, r.name
FROM delivery d
INNER JOIN route r ON d.route_id = r.id;
-- Only deliveries that HAVE a route

-- LEFT JOIN: all from left + matches from right (NULL if no match)
SELECT d.id, dr.name
FROM delivery d
LEFT JOIN driver dr ON d.driver_id = dr.id;
-- ALL deliveries, even those without a driver (driver columns = NULL)

-- RIGHT JOIN: all from right + matches from left (rarely used)
-- FULL OUTER JOIN: all from both sides (NULLs where no match)</code></pre>

<strong>When to use each:</strong>
• INNER JOIN: "I only want rows that exist in BOTH tables"
• LEFT JOIN: "I want ALL deliveries, even those without a driver"
• EXISTS: "I want deliveries that have at least one stop" (better than JOIN when you don't need the joined data)

<pre><code>-- EXISTS (often faster than JOIN for checking existence)
SELECT d.*
FROM delivery d
WHERE EXISTS (
    SELECT 1 FROM delivery_stop ds
    WHERE ds.delivery_id = d.id AND ds.status = 'FAILED'
);
-- "Find deliveries that have at least one failed stop"</code></pre>`
      },
      {
        heading: 'Common JOIN pitfalls',
        content: `<strong>1. Cartesian product (missing ON clause):</strong>
<pre><code>-- ❌ 1000 deliveries × 500 drivers = 500,000 rows!
SELECT * FROM delivery, driver;

-- ✓ Always specify the join condition
SELECT * FROM delivery d JOIN driver dr ON d.driver_id = dr.id;</code></pre>

<strong>2. Duplicate rows from 1:N joins:</strong>
<pre><code>-- If delivery has 5 stops, you get 5 rows per delivery
SELECT d.id, d.status, ds.stop_name
FROM delivery d
JOIN delivery_stop ds ON ds.delivery_id = d.id;

-- Solution: aggregate or use DISTINCT/GROUP BY depending on need
SELECT d.id, d.status, COUNT(ds.id) as stop_count
FROM delivery d
JOIN delivery_stop ds ON ds.delivery_id = d.id
GROUP BY d.id, d.status;</code></pre>

<strong>3. NULL in JOIN conditions:</strong>
NULL never equals anything (not even NULL). LEFT JOIN handles this correctly (returns NULL columns). INNER JOIN silently drops rows where the join column is NULL.`
      }
    ]
  },
  {
    id: 'theory-sql-indexes',
    title: 'Indexes — How Databases Find Data Fast',
    sections: [
      {
        heading: 'What is an index?',
        content: `An index is a sorted data structure (B-tree) that allows the database to find rows without scanning the entire table.

<pre><code>-- Without index: Sequential Scan (reads ALL rows)
-- 1 million deliveries → reads 1 million rows to find one
SELECT * FROM delivery WHERE tracking_code = 'TRK-4567';

-- With index: Index Scan (reads ~3-4 pages in B-tree)
CREATE INDEX idx_delivery_tracking ON delivery(tracking_code);
-- Now the same query reads ~4 rows instead of 1,000,000</code></pre>

<strong>Types of indexes:</strong>
• <strong>B-tree</strong> (default): equality and range queries (=, <, >, BETWEEN)
• <strong>Hash</strong>: equality only (=), slightly faster for exact matches
• <strong>GIN</strong>: arrays, JSONB, full-text search
• <strong>GiST</strong>: geometric, range types

<strong>Composite index:</strong>
<pre><code>-- Leftmost prefix rule: index on (A, B, C) can be used for:
-- WHERE A = ?          ✓
-- WHERE A = ? AND B = ? ✓
-- WHERE A = ? AND B = ? AND C = ? ✓
-- WHERE B = ?          ✗ (skipped A)
-- WHERE C = ?          ✗ (skipped A and B)
CREATE INDEX idx_delivery_status_date ON delivery(status, scheduled_at);</code></pre>`
      },
      {
        heading: 'When indexes hurt',
        content: `Indexes are NOT free:
• Each INSERT/UPDATE/DELETE must update the index
• Indexes consume disk space
• Too many indexes slow down writes

<strong>Don't index:</strong>
• Columns with very few distinct values (boolean, status with 3 values on small tables)
• Tables with <1000 rows (seq scan is faster)
• Columns rarely used in WHERE/JOIN/ORDER BY

<strong>Always index:</strong>
• Primary keys (automatic)
• Foreign keys (JOIN performance)
• Columns in WHERE clauses of frequent queries
• Columns in ORDER BY of paginated queries

<strong>EXPLAIN ANALYZE — see the execution plan:</strong>
<pre><code>EXPLAIN ANALYZE
SELECT * FROM delivery WHERE status = 'PLANNED' AND route_id = 42;

-- Look for:
-- "Seq Scan" → no index used (bad for large tables)
-- "Index Scan" → good, using an index
-- "Bitmap Heap Scan" → good for multiple conditions
-- "Nested Loop" → check if inner side has index
-- "Sort" → expensive without index on ORDER BY column</code></pre>`
      }
    ]
  },
  {
    id: 'theory-sql-transactions',
    title: 'Transactions & Isolation Levels',
    sections: [
      {
        heading: 'ACID properties',
        content: `<strong>A</strong>tomicity — All or nothing. If any statement fails, ALL are rolled back.
<strong>C</strong>onsistency — DB moves from one valid state to another.
<strong>I</strong>solation — Concurrent transactions don't interfere with each other.
<strong>D</strong>urability — Once committed, data survives crashes.

<pre><code>BEGIN;
  UPDATE delivery SET status = 'DISPATCHED' WHERE id = 4567;
  INSERT INTO delivery_event (delivery_id, event_type) VALUES (4567, 'DISPATCHED');
  UPDATE driver SET active_delivery_id = 4567 WHERE id = 42;
COMMIT;
-- Either ALL three succeed, or NONE are applied</code></pre>

<strong>In Spring Boot:</strong>
<pre><code>@Transactional
public void dispatch(Long deliveryId, Long driverId) {
    deliveryRepo.updateStatus(deliveryId, DISPATCHED);
    eventRepo.save(new DeliveryEvent(deliveryId, DISPATCHED));
    driverRepo.assignDelivery(driverId, deliveryId);
    // If any throws → ALL rolled back automatically
}</code></pre>`
      },
      {
        heading: 'Isolation levels',
        content: `<pre><code>READ UNCOMMITTED → Can see uncommitted data from other TX (dirty reads)
READ COMMITTED   → Only sees committed data (PostgreSQL default)
REPEATABLE READ  → Same query returns same results within TX
SERIALIZABLE     → Full isolation (as if sequential execution)</code></pre>

<strong>Common problems:</strong>
• <strong>Dirty read:</strong> TX1 updates, TX2 reads it, TX1 rolls back → TX2 has phantom data
• <strong>Non-repeatable read:</strong> TX1 reads, TX2 commits update, TX1 re-reads → different value
• <strong>Phantom read:</strong> TX1 counts rows, TX2 inserts, TX1 counts again → different count

<strong>PostgreSQL default:</strong> READ COMMITTED — safe from dirty reads but allows non-repeatable reads. For most web applications this is correct.

<strong>When to use higher isolation:</strong>
• Financial calculations that must be consistent → SERIALIZABLE
• Reports that need snapshot consistency → REPEATABLE READ
• Normal CRUD operations → READ COMMITTED (default, best performance)`
      }
    ]
  },
  {
    id: 'theory-sql-performance',
    title: 'SQL Performance — The N+1 Problem & Optimization',
    sections: [
      {
        heading: 'The N+1 query problem',
        content: `The most common performance issue in web applications using ORM:

<pre><code>// ❌ N+1 problem: 1 query for deliveries + 1 query PER delivery for stops
List&lt;Delivery&gt; deliveries = repo.findAll(); // 1 query: SELECT * FROM delivery
for (Delivery d : deliveries) {
    d.getStops().size(); // N queries: SELECT * FROM stop WHERE delivery_id = ?
}
// 100 deliveries = 101 queries!</code></pre>

<strong>Solutions:</strong>
<pre><code>// 1. JOIN FETCH (JPQL) — single query with JOIN
@Query("SELECT d FROM Delivery d JOIN FETCH d.stops WHERE d.status = :status")
List&lt;Delivery&gt; findWithStops(@Param("status") DeliveryStatus status);

// 2. @EntityGraph — declarative eager fetching
@EntityGraph(attributePaths = {"stops", "driver"})
List&lt;Delivery&gt; findByStatus(DeliveryStatus status);

// 3. Batch fetching (Hibernate) — reduces N+1 to N/batch+1
@BatchSize(size = 25)  // loads stops in batches of 25
private List&lt;Stop&gt; stops;</code></pre>

<strong>Detection:</strong> Enable SQL logging in dev, count queries per request. If you see the same query repeated with different IDs → N+1.`
      },
      {
        heading: 'Query optimization checklist',
        content: `<strong>1. SELECT only what you need:</strong>
<pre><code>-- ❌ SELECT * (loads all columns, including BLOBs)
SELECT * FROM delivery;

-- ✓ SELECT specific columns
SELECT id, status, driver_id, scheduled_at FROM delivery;

-- ✓ DTO projection (JPA)
@Query("SELECT new DeliveryDTO(d.id, d.status, d.scheduledAt) FROM Delivery d")</code></pre>

<strong>2. LIMIT always on user-facing queries:</strong>
<pre><code>-- ❌ No limit — could return 1 million rows
SELECT * FROM delivery WHERE status = 'PLANNED';

-- ✓ Always paginate
SELECT * FROM delivery WHERE status = 'PLANNED'
ORDER BY scheduled_at, id  -- deterministic ordering!
LIMIT 50 OFFSET 0;</code></pre>

<strong>3. Avoid functions on indexed columns:</strong>
<pre><code>-- ❌ Index on scheduled_at is NOT used (function wraps the column)
WHERE EXTRACT(YEAR FROM scheduled_at) = 2026

-- ✓ Range comparison uses index
WHERE scheduled_at >= '2026-01-01' AND scheduled_at < '2027-01-01'</code></pre>

<strong>4. Prefer EXISTS over IN for large subqueries:</strong>
<pre><code>-- ❌ IN materializes entire subquery result
WHERE id IN (SELECT delivery_id FROM stop WHERE status = 'FAILED')

-- ✓ EXISTS stops at first match
WHERE EXISTS (SELECT 1 FROM stop s WHERE s.delivery_id = d.id AND s.status = 'FAILED')</code></pre>`
      }
    ]
  }
];
