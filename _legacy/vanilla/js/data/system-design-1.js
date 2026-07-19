/**
 * System Design Module — Part 1 (15 exercises)
 * REWE Transport Logistics: delivery tracking, event-driven, scaling
 */
const systemDesignExercises1 = [
  {
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    subtopic: 'Event-Driven Architecture',
    question: 'You need to design the delivery lifecycle event system for REWE transport. When a delivery changes status (planned → dispatched → in-transit → delivered), multiple services need to react: billing, notifications, analytics, and ETA calculations. How do you design this?',
    options: [
      { label: 'A) Synchronous REST calls from delivery-service to each consumer', description: 'Delivery service calls billing, notification, analytics, ETA APIs sequentially.' },
      { label: 'B) Event bus (Kafka) with delivery events, each consumer independently subscribes', description: 'Publish delivery-status-changed event. Each service consumes at its own pace.' },
      { label: 'C) Shared database polling — consumers query delivery table for changes', description: 'Each consumer polls the delivery table every N seconds for status changes.' }
    ],
    bestOption: 1,
    explanation: `Option B (Kafka events) is the correct choice for this scenario:

• **Decoupling**: Delivery service doesn't know about consumers. Add new consumers without modifying the producer.
• **Resilience**: If billing is down, notifications still work. Each consumer has independent failure handling.
• **Scalability**: Kafka handles millions of events/day. Consumers scale by adding partition consumers.
• **Ordering**: Partition by delivery ID → events for same delivery are ordered.
• **Replay**: New services can replay history to build their state.

Why NOT A (sync REST): One slow consumer blocks all. Delivery service becomes a distributed monolith.
Why NOT C (polling): Waste of resources, high latency, doesn't scale, complex "last processed" tracking.`,
    tags: ['kafka', 'event-driven', 'decoupling']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Real-time Delivery Tracking',
    question: 'Design a real-time delivery tracking system where customers can see their delivery position on a map, with ETA updates. Drivers send GPS coordinates every 10 seconds. 500 active drivers simultaneously.',
    modelAnswer: `**Requirements clarification:**
- 500 drivers × 1 update/10s = 50 GPS events/second (manageable)
- Customer-facing: needs sub-second updates on the map
- ETA: recalculates on every position update

**Architecture:**

1. **Ingestion**: Drivers send GPS via lightweight protocol (MQTT or HTTP POST)
   → Kafka topic: driver-location (partitioned by driver_id)

2. **Processing**: 
   - Location consumer: updates driver's current position in Redis (fast read for map)
   - ETA consumer: recalculates ETA based on new position + remaining route

3. **Serving to customers**:
   - WebSocket connection from customer app
   - Customer subscribes to their delivery's driver
   - Backend pushes updates from Redis → WebSocket when position changes

4. **Storage**:
   - Hot data (current positions): Redis hash (driver_id → lat/lng/timestamp)
   - Cold data (history): Kafka retention + batch to PostgreSQL for analytics

**Scaling considerations:**
- 500 drivers is small. This architecture handles 50,000+ easily.
- WebSocket connections: ~concurrent tracking customers (maybe 2000). One pod handles this.
- Redis as cache for current positions: single instance is sufficient.
- ETA calculation: can be async (500ms delay acceptable).`,
    followUp: 'What if we scale to 50,000 drivers across Europe?',
    tags: ['real-time', 'websocket', 'redis', 'kafka']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Database Design',
    question: 'The delivery table has 10 million rows. You need to query "all active deliveries for a specific driver today" frequently. How do you optimize?',
    options: [
      { label: 'A) Composite index on (driver_id, status, scheduled_at)', description: 'B-tree index covering the three filter columns.' },
      { label: 'B) Separate table for active deliveries (materialized view)', description: 'Copy only active deliveries to a separate table, query that instead.' },
      { label: 'C) Partition the table by date + index on (driver_id, status)', description: 'Range partition by scheduled_at month, composite index within each partition.' }
    ],
    bestOption: 0,
    explanation: `Option A (composite index) is the right first step:

• The query is: WHERE driver_id = ? AND status = 'ACTIVE' AND scheduled_at >= today
• Composite index (driver_id, status, scheduled_at) satisfies this perfectly
• With 10M rows, this index reduces scan from 10M to ~5-20 rows (one driver's active deliveries today)
• Simple, maintainable, no additional infrastructure

Option B (materialized view) adds complexity — stale data, refresh logic, extra storage. Only justified if the main table is truly too large for indexes to help.

Option C (partitioning) is good for 100M+ rows or when you need to drop old data quickly. For 10M with good indexes, premature.

**Rule**: Always start with proper indexes. Add partitioning/caching only when indexes aren't enough.`,
    tags: ['database', 'indexes', 'performance']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Idempotency in Event Processing',
    question: 'A Kafka consumer processes "delivery-completed" events and creates invoices in the billing system. How do you ensure that if the same event is processed twice (at-least-once delivery), you don\'t create duplicate invoices?',
    modelAnswer: `**Idempotency strategies (pick based on context):**

**1. Unique constraint + INSERT ON CONFLICT (preferred):**
\`\`\`sql
INSERT INTO invoice (delivery_id, amount, event_id, created_at)
VALUES (:deliveryId, :amount, :eventId, NOW())
ON CONFLICT (delivery_id) DO NOTHING;
\`\`\`
- If delivery_id already has an invoice → no-op
- Atomic, no race condition, no distributed lock needed
- Works because: one delivery = one invoice (business rule)

**2. Idempotency key table (for complex operations):**
\`\`\`sql
INSERT INTO processed_events (event_id, processed_at)
VALUES (:eventId, NOW())
ON CONFLICT DO NOTHING;
-- If inserted (affected = 1) → process
-- If not inserted (affected = 0) → skip (already processed)
\`\`\`

**3. Conditional state update:**
\`\`\`sql
UPDATE delivery SET invoiced = true
WHERE id = :deliveryId AND invoiced = false;
-- affected = 1 → proceed to create invoice
-- affected = 0 → already invoiced, skip
\`\`\`

**Key principle**: The check and the action must be ATOMIC (same transaction). A SELECT exists followed by INSERT has a race condition.`,
    followUp: 'What about exactly-once semantics in Kafka? When would you use it vs at-least-once + idempotency?',
    tags: ['idempotency', 'kafka', 'data-integrity']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Service Communication',
    question: 'REWE has delivery-service, driver-service, route-service, and billing-service. When should they communicate synchronously (REST) vs asynchronously (Kafka events)?',
    modelAnswer: `**Decision matrix:**

**Use synchronous REST when:**
- Caller NEEDS the response to continue (query/validation)
- Low latency required (<100ms)
- Simple request-response pattern
- Strong consistency needed for the operation

**Examples:**
- delivery-service validates driver availability → GET driver-service
- UI requests delivery details → GET delivery-service
- route-service calculates ETA → returns immediately

**Use async Kafka when:**
- Consumer doesn't need to respond to producer
- Multiple independent consumers need the same event
- Operation can tolerate seconds of delay
- Retry/replay is important
- Producer shouldn't fail if consumer is down

**Examples:**
- delivery-completed → billing creates invoice (async, can retry)
- delivery-dispatched → notification-service sends SMS (async, non-critical)
- driver-location-update → analytics aggregation (async, high volume)

**Hybrid pattern (common in REWE logistics):**
- Synchronous: validate + persist delivery
- Async: publish event for downstream reactions
\`\`\`
POST /deliveries → delivery-service persists, returns 201
                 → publishes delivery-planned event to Kafka
                 → billing, routing, notifications consume independently
\`\`\``,
    followUp: 'What happens when the synchronous call to driver-service times out during delivery creation?',
    tags: ['architecture', 'sync-vs-async', 'resilience']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    subtopic: 'Failure Handling',
    question: 'The notification-service is down. delivery-service just completed a delivery and needs to notify the customer. What pattern do you use?',
    options: [
      { label: 'A) Retry 3 times with exponential backoff, then fail the delivery completion', description: 'Synchronous retry. If notification fails after retries, roll back the delivery completion.' },
      { label: 'B) Outbox pattern: persist event in same TX as delivery, process notification async', description: 'Save delivery + notification-event in same DB transaction. Separate process publishes to Kafka.' },
      { label: 'C) Fire-and-forget: publish to Kafka, if notification-service is down it will consume later', description: 'Just publish the event. Kafka retains it. Notification-service will process when it recovers.' }
    ],
    bestOption: 1,
    explanation: `Option B (Outbox pattern) provides the strongest guarantee:

**Why B wins:**
- Delivery completion and notification intent are saved atomically (same TX)
- If notification-service is down for hours, nothing is lost
- Separate dispatcher reads outbox → publishes to Kafka → marks as sent
- Even if Kafka is down temporarily, the outbox retains the intent

**Why NOT A:** Notification is non-critical. Don't fail the core business operation (delivery completion) because a notification can't be sent right now.

**Why NOT C (fire-and-forget to Kafka):** If the app crashes AFTER completing delivery but BEFORE publishing to Kafka, the event is lost. Outbox + same TX eliminates this gap.

**The outbox pattern:**
\`\`\`
TX: { delivery.status = COMPLETED; outbox.insert(notification_event); } COMMIT;
Dispatcher (async): read outbox → publish to Kafka → mark published
\`\`\``,
    tags: ['outbox', 'resilience', 'eventual-consistency']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Scaling Strategy',
    question: 'The delivery-service handles 1000 req/s during peak hours (morning route planning). Response time degrades from 50ms to 2s. How do you diagnose and fix?',
    modelAnswer: `**Diagnosis (in this order):**

1. **Decompose latency**: Where is the time spent?
   - Database queries? (check slow query log, connection pool)
   - External service calls? (timeouts, latency)
   - GC pauses? (heap pressure)
   - CPU? (computation-heavy logic)
   - Thread pool exhausted? (all threads blocked)

2. **Most likely culprits at 1000 req/s:**
   - Connection pool exhaustion (all JDBC connections in use)
   - N+1 queries under load (10ms × 100 queries = 1s per request)
   - External call without timeout holding threads

**Fixes (by likely root cause):**

If DB connection pool: increase pool size cautiously + fix long-running queries
If N+1: add JOIN FETCH or batch loading
If external calls: add timeouts + circuit breaker + async where possible
If CPU: cache expensive calculations, offload to batch

**Scaling options (after fixing root cause):**
- Horizontal: add pods (if stateless — Spring Boot services are)
- Read replicas: separate read traffic if reads dominate
- Cache: Redis for frequently-read, rarely-changed data (route templates, driver profiles)
- Async: move non-critical operations to Kafka (don't do everything in the request path)

**Key insight**: Scale AFTER optimizing. Adding pods to a service with N+1 queries just adds more load to the database.`,
    followUp: 'How would you implement a circuit breaker for the route-optimization external service?',
    tags: ['scalability', 'performance', 'diagnosis']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'API Design',
    question: 'Design the REST API for the delivery resource. What endpoints, verbs, status codes?',
    modelAnswer: `\`\`\`
# Core CRUD
GET    /api/v1/deliveries              → 200 (list, paginated)
GET    /api/v1/deliveries/{id}         → 200 | 404
POST   /api/v1/deliveries              → 201 + Location header
PUT    /api/v1/deliveries/{id}         → 200 | 404
DELETE /api/v1/deliveries/{id}         → 204 | 404

# State transitions (domain operations)
POST   /api/v1/deliveries/{id}/dispatch    → 200 | 409 (if not in PLANNED state)
POST   /api/v1/deliveries/{id}/complete    → 200 | 409 (if not in DISPATCHED state)
POST   /api/v1/deliveries/{id}/cancel      → 200 | 409 (if already COMPLETED)

# Sub-resources
GET    /api/v1/deliveries/{id}/stops       → 200 (list of stops for this delivery)
GET    /api/v1/deliveries/{id}/events      → 200 (audit trail)

# Filtered queries
GET    /api/v1/deliveries?driverId=42&status=ACTIVE&date=2026-07-19
GET    /api/v1/deliveries?routeId=7&sort=scheduledAt,asc&limit=50&offset=0
\`\`\`

**Design decisions:**
- State transitions as POST to sub-resource (not PATCH status field) — enforces valid transitions server-side
- Pagination with offset/limit + deterministic sort
- 409 Conflict for invalid state transitions (not 400 — the request is valid, the state isn't)
- Sub-resources for related collections (stops, events)`,
    followUp: 'How would you handle bulk operations (dispatching 50 deliveries at once)?',
    tags: ['rest', 'api-design', 'resources']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Caching Strategy',
    question: 'Route templates (predefined routes with stops) are queried 500 times/minute but change once per week. How do you cache them?',
    options: [
      { label: 'A) Application-level cache (ConcurrentHashMap) with 1-hour TTL', description: 'In-memory cache per pod instance, expires after 1 hour.' },
      { label: 'B) Redis cache with 24-hour TTL + invalidation on update', description: 'Shared Redis cache. All pods read from same cache. Invalidate on admin update.' },
      { label: 'C) HTTP Cache-Control headers, let the API gateway cache', description: 'Set max-age=3600 header. Gateway caches response, serves without hitting backend.' }
    ],
    bestOption: 1,
    explanation: `Option B (Redis + invalidation) is the best balance:

**Why B:**
- Shared across all pods (consistent data)
- 24h TTL as safety net (even without explicit invalidation)
- Explicit invalidation when admin updates routes (immediate consistency when needed)
- 500 reads/min from Redis: trivial load (Redis handles 100K+/s)

**Why NOT A:** Each pod has its own cache → inconsistency for up to 1 hour after update. If you have 5 pods, some serve stale data while others serve fresh.

**Why NOT C:** Works if you don't need fine-grained invalidation. But when an admin updates a route, waiting up to 1 hour for cache expiry is unacceptable for logistics (drivers get wrong routes).

**Pattern:**
\`\`\`
Read: check Redis → if miss, query DB → write to Redis → return
Update: update DB → delete Redis key → next read repopulates
\`\`\``,
    tags: ['caching', 'redis', 'performance']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Data Consistency',
    question: 'delivery-service and billing-service have separate databases (microservice pattern). How do you ensure a completed delivery always has an invoice — without distributed transactions?',
    modelAnswer: `**Problem**: Two databases, no 2PC (distributed transaction). How to keep them consistent?

**Solution: Eventual Consistency + Saga/Event pattern:**

1. delivery-service: marks delivery as COMPLETED + publishes delivery-completed event (outbox pattern)
2. billing-service: consumes event → creates invoice → publishes invoice-created event
3. delivery-service (optional): consumes invoice-created → marks delivery as INVOICED

**Handling failures:**

If billing-service fails to create invoice:
- Kafka redelivers (at-least-once)
- After max retries → goes to Dead Letter Topic
- Alert on DLT → ops team investigates
- delivery-service can query: "deliveries completed >24h ago without INVOICED status" → reconciliation

**State machine approach:**
\`\`\`
COMPLETED → (event consumed by billing) → INVOICING → (invoice created) → INVOICED
                                                     ↓ (failure)
                                                  INVOICE_FAILED → DLT + alert
\`\`\`

**Key principles:**
- Accept eventual consistency (seconds, not synchronous)
- Idempotent consumers (safe to retry)
- Compensating actions if needed (cancel invoice if delivery is reversed)
- Monitoring: alert on "stuck" states (COMPLETED but never INVOICED after 24h)`,
    followUp: 'What if the business requires synchronous invoice creation before confirming delivery to the customer?',
    tags: ['consistency', 'saga', 'microservices']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Observability',
    question: 'How do you monitor a delivery-service in production? What metrics, logs, and alerts would you set up?',
    modelAnswer: `**Three pillars of observability:**

**1. Metrics (Prometheus/Grafana):**
- Request latency: p50, p95, p99 per endpoint
- Error rate: 4xx/5xx per endpoint
- Throughput: requests/second
- Business metrics: deliveries completed/hour, avg delivery time
- Infrastructure: CPU, memory, GC pauses, connection pool usage

**2. Logs (ELK/Kibana):**
- Structured JSON logs with correlation ID
- Log levels: ERROR for failures, WARN for retries, INFO for business events
- Include: deliveryId, driverId, operation, duration
- Never log: passwords, tokens, personal data

**3. Tracing (Jaeger/Zipkin):**
- Distributed trace across services (delivery → billing → notification)
- Identify slow spans (which service/DB query is the bottleneck?)

**Alerts (PagerDuty/OpsGenie):**
- p95 latency > 500ms for 5 minutes → WARNING
- Error rate > 5% for 2 minutes → CRITICAL
- Kafka consumer lag > 10,000 → WARNING
- Zero deliveries completed in last hour (business hours) → CRITICAL
- Connection pool > 80% utilized → WARNING

**Dashboard**: One screen showing health of all transport services — traffic lights (green/yellow/red) for each metric.`,
    followUp: 'How do you handle alert fatigue? What makes a good alert vs a noisy one?',
    tags: ['observability', 'monitoring', 'production']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Deployment & Zero Downtime',
    question: 'How do you deploy a new version of delivery-service without downtime? Deliveries are happening 24/7.',
    modelAnswer: `**Rolling deployment with Kubernetes:**

\`\`\`yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0    # never reduce below desired count
    maxSurge: 1          # add 1 new pod before removing old
\`\`\`

**Prerequisites for zero-downtime:**

1. **Health probes**:
   - Readiness: only route traffic when app is fully started
   - Liveness: restart if stuck (but don't flap)

2. **Graceful shutdown**:
   - On SIGTERM: stop accepting new requests
   - Finish in-flight requests (grace period: 30s)
   - Close DB connections, flush buffers, commit offsets

3. **Backward-compatible changes**:
   - DB schema: additive only (new column with default, not rename/delete)
   - API: new optional fields, not breaking changes
   - Kafka events: new fields OK, don't remove existing fields

4. **Database migrations**:
   - Run BEFORE deployment (Flyway/Liquibase)
   - Must be compatible with both old AND new code versions
   - Two-step for breaking changes: Sprint 1 adds new column, Sprint 2 removes old

**Deployment sequence**:
\`\`\`
1. Run DB migration (backward-compatible)
2. Deploy new pods (rolling: new pod ready → drain old pod)
3. Old pods finish in-flight work → terminate
4. All traffic on new version
\`\`\``,
    followUp: 'What if a deployment introduces a bug? How do you roll back?',
    tags: ['deployment', 'kubernetes', 'zero-downtime']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Data Modeling',
    question: 'A delivery has a status that changes over time: PLANNED → DISPATCHED → IN_TRANSIT → DELIVERED (or FAILED). How do you model this in the database?',
    options: [
      { label: 'A) Single status column on delivery table (overwritten on each transition)', description: 'delivery.status = VARCHAR, updated to new value on each state change.' },
      { label: 'B) Status column + separate delivery_event table (audit trail)', description: 'Current status on delivery table + full history in events table with timestamps.' },
      { label: 'C) Event sourcing: only store events, derive current state from event stream', description: 'No status column. Replay delivery-planned, delivery-dispatched, etc. to compute current state.' }
    ],
    bestOption: 1,
    explanation: `Option B (status + event trail) is the pragmatic choice for logistics:

**Why B:**
- Fast reads: SELECT delivery.status (single column, indexed)
- Full audit: delivery_event table shows WHO changed WHAT and WHEN
- Simple queries: "all DISPATCHED deliveries" is a simple WHERE
- History: "when was this delivery dispatched?" → query events table
- Compliance: logistics requires audit trail for disputes

**Why NOT A (status only):** Loses history. "When was it dispatched?" — unknown. Disputes unresolvable.

**Why NOT C (event sourcing):** Overkill for this use case. Computing current state from N events is expensive for reads. Makes simple queries complex. Good for financial systems, not needed for delivery tracking.

**Schema:**
\`\`\`sql
delivery (id, status, driver_id, route_id, scheduled_at, ...)
delivery_event (id, delivery_id, event_type, old_status, new_status, timestamp, user_id, metadata)
\`\`\``,
    tags: ['data-modeling', 'audit-trail', 'event-sourcing']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Rate Limiting & Back-pressure',
    question: 'The route-optimization service (external) has a rate limit of 100 requests/minute. During peak morning planning, delivery-service needs to calculate routes for 500 deliveries. How do you handle this?',
    modelAnswer: `**Problem**: 500 requests needed, only 100/min allowed. Synchronous = 5 minutes wait.

**Solution: Queue-based rate-limited processing:**

1. **Batch + Queue**: 
   - Accept all 500 planning requests
   - Persist them as PENDING in database
   - Enqueue to a rate-limited processor

2. **Rate-limited consumer**:
   \`\`\`java
   @Scheduled(fixedRate = 600) // every 600ms = 100/min
   void processNextRoute() {
       PendingRoute next = pendingRouteRepo.findFirstByStatus(PENDING);
       if (next == null) return;
       Route route = routeOptimizationClient.calculate(next.getStops());
       next.setRoute(route);
       next.setStatus(COMPLETED);
       pendingRouteRepo.save(next);
   }
   \`\`\`

3. **User experience**:
   - Return 202 Accepted immediately ("route calculation in progress")
   - Client polls: GET /deliveries/{id}/route → 200 when ready, 202 while pending
   - Or: push notification/WebSocket when route is calculated

4. **Optimization**:
   - Batch API if external service supports it (send 10 routes per call)
   - Cache identical routes (same stops → same result)
   - Pre-calculate common routes overnight

**Key principle**: Don't make 500 users wait because of an external rate limit. Accept the work, process in background, notify when ready.`,
    followUp: 'What if the external route service is completely down for 30 minutes during peak planning?',
    tags: ['rate-limiting', 'async', 'resilience']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Overall Architecture',
    question: 'Draw the high-level architecture for REWE transport logistics. What services, what communication, what data stores?',
    modelAnswer: `**Services:**
\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    API Gateway (Kong/WSO2)               │
└──────────┬──────────┬──────────┬──────────┬────────────┘
           │          │          │          │
     ┌─────▼─────┐ ┌──▼───┐ ┌───▼───┐ ┌───▼────┐
     │ delivery  │ │driver │ │ route │ │billing │
     │ service   │ │service│ │service│ │service │
     └─────┬─────┘ └──┬───┘ └───┬───┘ └───┬────┘
           │          │          │          │
     ┌─────▼──────────▼──────────▼──────────▼────────────┐
     │              Kafka (Event Bus)                      │
     │  Topics: delivery-events, driver-location,         │
     │          route-optimized, billing-events            │
     └──────────┬──────────┬──────────┬──────────────────┘
                │          │          │
          ┌─────▼─────┐ ┌──▼────┐ ┌──▼──────────┐
          │notification│ │  ETA  │ │  analytics  │
          │  service   │ │service│ │  service    │
          └───────────┘ └───────┘ └─────────────┘
\`\`\`

**Data stores:**
- delivery-service → PostgreSQL (deliveries, stops, events)
- driver-service → PostgreSQL (drivers, availability, certifications)
- ETA-service → Redis (current positions, calculated ETAs)
- analytics → ClickHouse/TimescaleDB (time-series data)
- notifications → stateless (just sends, no own DB)

**Communication:**
- Sync (REST): API Gateway → services (user-facing queries)
- Sync (REST): delivery → driver-service (validate availability)
- Async (Kafka): all state changes published as events
- Async (Kafka): driver-location high-frequency updates

**Key patterns:**
- Each service owns its data (no shared DB)
- Events for cross-service communication
- API Gateway for auth, rate limiting, routing
- Redis for hot/real-time data (positions, ETAs)`,
    followUp: 'How would you handle the case where delivery-service needs data from driver-service but driver-service is down?',
    tags: ['architecture', 'microservices', 'system-design']
  }
];
