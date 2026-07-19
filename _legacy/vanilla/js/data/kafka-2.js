/**
 * Kafka Module — Part 2 (15 exercises)
 * Schema evolution, exactly-once, monitoring, DLT, operational concerns
 */
const kafkaExercises2 = [
  {
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    subtopic: 'Schema Evolution',
    question: 'Your delivery-events topic has been producing events with schema V1 for 6 months. Now you need to add a "priority" field. 3 consumer services are subscribed. How do you evolve the schema safely?',
    options: [
      { label: 'A) Add the field as optional with default value (backward-compatible)', description: 'New events have priority; old events are deserialized with default. No consumer changes needed immediately.' },
      { label: 'B) Create a new topic delivery-events-v2 with the new schema', description: 'Producers publish to v2, consumers migrate one by one, decommission v1.' },
      { label: 'C) Update the schema and redeploy all consumers simultaneously', description: 'Big-bang deployment: new schema + all consumers updated at once.' }
    ],
    bestOption: 0,
    explanation: `Option A (backward-compatible evolution) is the standard approach:

**Rules of backward compatibility:**
- ✅ Add optional field with default → old consumers ignore it, new consumers use it
- ✅ Add new event type to same topic → consumers skip unknown types
- ❌ Remove field → breaks consumers expecting it
- ❌ Rename field → breaks deserialization
- ❌ Change field type → breaks deserialization

**With Avro + Schema Registry:**
\`\`\`json
// V1
{ "deliveryId": "long", "status": "string", "timestamp": "long" }

// V2 (backward-compatible)
{ "deliveryId": "long", "status": "string", "timestamp": "long",
  "priority": { "type": "int", "default": 0 } }
\`\`\`

Schema Registry validates compatibility BEFORE allowing the new schema to be registered. If it breaks compatibility → rejected.

**Option B** is needed only for truly breaking changes (rare). Adds operational complexity.
**Option C** is dangerous — requires coordinated deployment of 4+ services simultaneously.`,
    tags: ['schema-evolution', 'avro', 'compatibility']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Exactly-Once Semantics',
    question: 'Explain the difference between at-most-once, at-least-once, and exactly-once in Kafka. When would you use each?',
    modelAnswer: `**At-most-once** (may lose, never duplicate):
- Commit offset BEFORE processing
- If crash after commit but before processing → message lost
- Use for: metrics, logs, non-critical analytics

**At-least-once** (never lose, may duplicate):
- Commit offset AFTER processing
- If crash after processing but before commit → reprocessed on restart
- Use for: 95% of business events (with idempotent consumers)
- REWE default: delivery events, notifications, billing

**Exactly-once** (no loss, no duplicates):
- Kafka transactions: producer + consumer in atomic unit
- enable.idempotence=true + transactional.id + read_committed isolation
- Use for: financial operations, cross-topic transformations

**Practical reality:**
- Exactly-once in Kafka only works Kafka-to-Kafka (consume → transform → produce)
- When you consume from Kafka and write to an external system (DB, API), exactly-once is NOT possible — use at-least-once + idempotency

\`\`\`java
// At-least-once + idempotent consumer (REWE standard)
@KafkaListener(topics = "delivery-completed")
public void handle(DeliveryCompletedEvent event) {
    int inserted = billingRepo.createInvoiceIfAbsent(event.deliveryId(), event);
    if (inserted == 0) return; // already processed — idempotent
    // ... process
}
\`\`\``,
    tags: ['exactly-once', 'delivery-semantics', 'idempotency']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Consumer Lag Monitoring',
    question: 'How do you monitor Kafka consumers in production? What metrics indicate problems?',
    modelAnswer: `**Key metrics:**

| Metric | Healthy | Alert threshold | Meaning |
|--------|---------|-----------------|---------|
| Consumer lag | <100 | >10,000 for 5min | Consumer falling behind producer |
| Rebalance frequency | Rare | >3/hour | Consumers crashing/restarting |
| Processing time/msg | <100ms | p99 >5s | Consumer logic is slow |
| Error rate | 0% | >1% | Deserialization or processing failures |
| DLT messages | 0 | >0 | Poison messages accumulating |

**Consumer lag** is the most critical:
\`\`\`
Lag = Latest offset (what producer wrote) - Committed offset (what consumer processed)
\`\`\`

**Monitoring tools:**
- Kafka CLI: \`kafka-consumer-groups.sh --describe --group trab-delivery-service\`
- Prometheus + kafka_consumer_lag_records gauge
- Grafana dashboard with lag per partition

**Alert response:**
- Lag growing slowly → consumer is slower than producer (optimize processing)
- Lag spike after deploy → new version has a bug or is slower
- Lag growing + consumer crashed → check logs, restart consumer group
- Lag stable at high number → consumer stuck on poison message → check DLT`,
    tags: ['monitoring', 'consumer-lag', 'alerts']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    subtopic: 'Dead Letter Topic',
    question: 'A delivery-event consumer fails to process a message because the payload has an unexpected field format. After 3 retries, what should happen?',
    options: [
      { label: 'A) Skip the message and commit offset (log and move on)', description: 'Consumer logs the error, skips the bad message, continues processing.' },
      { label: 'B) Send to Dead Letter Topic (DLT) for manual inspection', description: 'After max retries, publish to delivery-events.DLT with error metadata.' },
      { label: 'C) Stop the consumer until a developer fixes the issue', description: 'Consumer pauses/crashes, lag accumulates until fix is deployed.' }
    ],
    bestOption: 1,
    explanation: `Option B (Dead Letter Topic) is the standard production pattern:

\`\`\`java
@Bean
public DefaultErrorHandler errorHandler(KafkaTemplate<String, Object> kafka) {
    var recoverer = new DeadLetterPublishingRecoverer(kafka,
        (record, ex) -> new TopicPartition(record.topic() + ".DLT", -1));
    var backoff = new FixedBackOff(1000L, 3); // 3 retries, 1s apart
    return new DefaultErrorHandler(recoverer, backoff);
}
\`\`\`

**What goes to DLT:**
- Deserialization errors (bad payload format)
- Unrecoverable business errors (referenced entity doesn't exist)
- Validation failures

**What should NOT go to DLT (should retry):**
- Temporary DB connection failure
- External service timeout
- Transient network error

**DLT message includes:**
- Original message (key, value, headers)
- Error reason (exception class + message)
- Retry count
- Original topic + partition + offset

**Monitoring:** Alert when DLT has any messages → ops investigates.`,
    tags: ['dlt', 'error-handling', 'retry']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Partitioning Strategy',
    question: 'You have a topic "delivery-events" with 12 partitions. 500,000 deliveries/day. How do you choose partition keys? What are the trade-offs?',
    modelAnswer: `**Partition key = delivery ID (recommended for REWE transport):**

\`\`\`java
kafka.send("delivery-events", delivery.getId().toString(), event);
// Same deliveryId → always same partition → ordered per delivery
\`\`\`

**Why deliveryId:**
- All events for one delivery go to same partition → consumers see them IN ORDER
- PLANNED → DISPATCHED → IN_TRANSIT → DELIVERED (order preserved)
- Parallel processing across deliveries (different partitions)

**Trade-offs of different keys:**

| Key | Ordering guarantee | Risk |
|-----|-------------------|------|
| deliveryId | Per delivery | Balanced (500K unique IDs distribute well) |
| driverId | Per driver | Hot partitions (popular drivers get more events) |
| warehouseId | Per warehouse | Very unbalanced (3 warehouses = 3 hot partitions) |
| Random (null key) | None | Maximum throughput but no ordering |

**Sizing: 12 partitions for 500K/day:**
- ~6 events/second average, ~60/s peak
- 12 partitions can handle 12 parallel consumers
- Each partition: ~5 events/s peak → trivial for Kafka
- For REWE scale: 12 is fine. Would increase to 24-48 for 10M/day.`,
    tags: ['partitioning', 'ordering', 'scaling']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Kafka Connect',
    question: 'Instead of writing a custom consumer to sync delivery data to an analytics database, a colleague suggests Kafka Connect. When is Connect appropriate vs a custom consumer?',
    modelAnswer: `**Kafka Connect — use when:**
- Standard data flow: topic → database (or DB → topic)
- No complex business transformation needed
- Connector already exists (JDBC Sink, Elasticsearch Sink, S3 Sink)
- Want operational simplicity (config-only, no code)

**Custom consumer — use when:**
- Complex business logic during processing
- Need to call external APIs during consumption
- Custom error handling / retry strategies
- Multi-step transformations with state
- Need fine-grained control over commits/offsets

**REWE examples:**

Use Connect:
\`\`\`
delivery-events → JDBC Sink Connector → analytics_db.delivery_events
driver-location → S3 Sink Connector → data lake (hourly batches)
\`\`\`

Use custom consumer:
\`\`\`
delivery-completed → BillingConsumer → validate + calculate price + create invoice + publish invoice-created
delivery-dispatched → NotificationConsumer → resolve template + call SMS API + handle retry
\`\`\`

**Rule of thumb:** If the consumer does more than "take message, write to target" → custom consumer. If it's just data movement → Connect.`,
    tags: ['kafka-connect', 'architecture', 'decision']
  },
  {
    type: 'CODE_REFACTOR',
    difficulty: 'SENIOR',
    subtopic: 'Consumer Implementation',
    question: 'What problems do you see in this Kafka consumer?',
    code: `@KafkaListener(topics = "delivery-events", groupId = "billing")
public void handle(String message) {
    DeliveryEvent event = objectMapper.readValue(message, DeliveryEvent.class);

    if (event.getType().equals("COMPLETED")) {
        Invoice invoice = new Invoice();
        invoice.setDeliveryId(event.getDeliveryId());
        invoice.setAmount(calculatePrice(event));
        invoiceRepository.save(invoice);

        emailService.sendInvoice(invoice);
        analyticsService.recordRevenue(invoice);
    }
}`,
    problems: [
      'No idempotency — reprocessing creates duplicate invoices',
      'No error handling — any exception kills the consumer (offset not committed)',
      'Deserialization inline — failure on bad message blocks the partition',
      'Too many responsibilities — invoice creation + email + analytics in one consumer',
      'Synchronous email/analytics — slows consumption, couples to their availability',
      'String payload — loses Avro/Schema Registry benefits, no schema validation'
    ],
    refactored: `@KafkaListener(topics = "delivery-events", groupId = "billing")
public void handle(@Payload DeliveryEvent event,
                   @Header(KafkaHeaders.RECEIVED_KEY) String key) {

    if (!"COMPLETED".equals(event.getType())) return;

    // Idempotent: INSERT ... ON CONFLICT DO NOTHING
    int created = invoiceRepo.createIfAbsent(event.getDeliveryId(), calculatePrice(event));
    if (created == 0) {
        log.info("Invoice already exists for delivery {}, skipping", event.getDeliveryId());
        return;
    }

    // Publish event for downstream (email + analytics consume independently)
    eventPublisher.publish(new InvoiceCreated(event.getDeliveryId()));
    log.info("Invoice created for delivery {}", event.getDeliveryId());
}`,
    tags: ['consumer', 'idempotency', 'refactoring']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Consumer Group Rebalancing',
    question: 'What is a consumer group rebalance? When does it happen? Why should you minimize it?',
    modelAnswer: `**Rebalance** = Kafka redistributes partitions among consumers in a group.

**When it happens:**
- Consumer joins the group (new pod scaled up)
- Consumer leaves (pod scaled down, crash, timeout)
- New partitions added to topic
- Consumer takes too long to poll (max.poll.interval.ms exceeded)

**During rebalance:**
- ALL consumers in the group STOP processing (stop-the-world)
- Partitions are reassigned
- Consumers resume from last committed offset

**Why minimize:**
- Processing stops during rebalance (seconds to minutes depending on group size)
- For REWE transport: no delivery events processed during this window
- Frequent rebalances = unstable system

**How to minimize:**
\`\`\`properties
# Increase poll interval (if processing is slow)
max.poll.interval.ms=300000

# Reduce records per poll (process faster)
max.poll.records=100

# Session timeout (before broker considers consumer dead)
session.timeout.ms=30000

# Static group membership (Kafka 2.3+) — no rebalance on transient restart
group.instance.id=billing-consumer-pod-1
\`\`\`

**Static membership**: Each consumer has a stable ID. If it restarts within session.timeout, its partitions are NOT reassigned — avoids unnecessary rebalance.`,
    tags: ['rebalancing', 'consumer-groups', 'stability']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Event Granularity',
    question: 'Should you publish one fine-grained event per field change (delivery-status-changed, delivery-driver-assigned, delivery-route-updated) or one coarse event (delivery-updated) with all fields?',
    options: [
      { label: 'A) Fine-grained: one event type per business action', description: 'DeliveryPlanned, DeliveryDispatched, DriverAssigned, RouteOptimized — each a separate event.' },
      { label: 'B) Coarse: one DeliveryUpdated event with before/after state', description: 'Single event type with full delivery state, consumers filter what they care about.' },
      { label: 'C) Hybrid: domain events for state transitions, data events for CRUD', description: 'Business actions → specific events. Administrative changes → generic updated event.' }
    ],
    bestOption: 0,
    explanation: `Option A (fine-grained domain events) is preferred for logistics:

**Why:**
- Each event has clear business meaning (DeliveryDispatched = something happened)
- Consumers subscribe only to events they care about (filter by type)
- Event names document the domain language
- Consumers don't need to diff before/after to understand what changed
- Easier to build metrics: "count of DeliveryDispatched per hour"

**Event naming pattern:** \`<Entity><PastTenseVerb>\`
\`\`\`
DeliveryPlanned
DeliveryDispatched
DeliveryCompleted
DeliveryFailed
DriverAssigned
RouteOptimized
\`\`\`

**Why NOT B:** "DeliveryUpdated" says nothing about WHAT happened. Consumers must inspect the payload and compare fields to react. It's a disguised database change notification, not a domain event.

**When B is acceptable:** Low-importance CRUD operations, admin data, where no consumer needs specific behavior per change type.`,
    tags: ['event-design', 'domain-events', 'granularity']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Kafka Transactions',
    question: 'Explain how Kafka transactions work and when you would use them at REWE.',
    modelAnswer: `**Kafka transactions = atomic produce across multiple topics/partitions:**

\`\`\`java
@Bean
public KafkaTemplate<String, Object> kafkaTemplate(ProducerFactory<String, Object> pf) {
    var template = new KafkaTemplate<>(pf);
    template.setTransactionIdPrefix("delivery-tx-");
    return template;
}

// Atomic: both messages published or neither
kafkaTemplate.executeInTransaction(ops -> {
    ops.send("delivery-events", deliveryEvent);
    ops.send("audit-log", auditEvent);
    return null;
});
\`\`\`

**What Kafka transactions guarantee:**
- All messages in a transaction are visible atomically to consumers (read_committed)
- If producer crashes mid-transaction → messages are discarded (not visible)
- Combined with idempotent producer → no duplicate messages

**REWE use cases:**
- Consume from delivery-events → produce to billing-events + audit-events (atomic)
- Stream processing: read input → transform → write output (exactly-once)

**NOT a replacement for database transactions:**
- Kafka TX only covers Kafka-to-Kafka operations
- If you write to DB + Kafka → NOT atomic (use outbox pattern instead)

**When NOT to use:**
- Simple produce to one topic (idempotent producer is enough)
- Write to external system (Kafka TX can't protect external calls)`,
    tags: ['transactions', 'exactly-once', 'atomicity']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Event Sourcing vs Event-Driven',
    question: 'Your colleague says "we should use event sourcing for deliveries." Is that the same as event-driven? Should you do it?',
    modelAnswer: `**They are DIFFERENT things:**

**Event-Driven Architecture (what REWE does):**
- Services communicate via events (Kafka)
- Events are notifications: "something happened"
- Each service has its OWN state/database
- Events are eventually consumed and processed
- Current state lives in the service's DB

**Event Sourcing (a persistence pattern):**
- Store ALL events as the source of truth (no current-state table)
- Current state is DERIVED by replaying events from the beginning
- Never update/delete — only append new events
- Must replay N events to reconstruct current state

**Should REWE use Event Sourcing for deliveries?**
Probably NOT, because:
- Delivery lifecycle is simple (5-6 states) → a status column + event table (audit) is sufficient
- Event sourcing adds complexity: projections, snapshots, eventual consistency
- Read patterns are simple: "what's the current status?" → single column query
- Team learning curve is steep

**When Event Sourcing makes sense:**
- Financial ledgers (every transaction is immutable, audit is the primary concern)
- Systems where "undo" is a core feature
- Complex state with many branching paths

**Recommendation:** Event-driven architecture + status column + audit trail (event table). Gets 90% of the benefit without the complexity of full event sourcing.`,
    tags: ['event-sourcing', 'architecture', 'trade-offs']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Producer Configuration',
    question: 'What producer settings are important for a reliable delivery-events producer?',
    modelAnswer: `**Critical producer settings:**

\`\`\`properties
# Durability: wait for ALL replicas to acknowledge
acks=all

# Idempotent: no duplicate messages on retry
enable.idempotence=true

# Retries: handle transient broker failures
retries=2147483647  # effectively infinite (with delivery.timeout.ms as cap)
delivery.timeout.ms=120000  # 2 minutes total delivery attempt

# Ordering: one in-flight request ensures order per partition
max.in.flight.requests.per.connection=5  # safe with idempotence enabled

# Batching: efficiency (wait a bit to batch messages)
linger.ms=5  # wait 5ms for more messages to batch
batch.size=16384  # 16KB batch
\`\`\`

**What these mean for REWE:**
- \`acks=all\`: a delivery event is not "sent" until all Kafka replicas have it — no data loss even if a broker dies
- \`enable.idempotence=true\`: if the producer retries (network timeout), Kafka deduplicates — no duplicate events
- Retries with timeout: transient failures auto-recover, eventually fails with clear error

**Error handling in producer:**
\`\`\`java
kafka.send(topic, key, event).whenComplete((result, ex) -> {
    if (ex != null) {
        log.error("Failed to publish event after retries", ex);
        outboxRepo.save(new PendingEvent(event)); // fallback
    }
});
\`\`\``,
    tags: ['producer-config', 'reliability', 'acks']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    subtopic: 'Topic Design',
    question: 'Should you have one topic per event type (delivery-planned, delivery-dispatched, delivery-completed) or one topic for all delivery events (delivery-events with type field)?',
    options: [
      { label: 'A) One topic per event type', description: 'delivery-planned, delivery-dispatched, delivery-completed, etc. Consumers subscribe to specific topics.' },
      { label: 'B) One topic for all delivery events (with type/header filtering)', description: 'delivery-events topic. Events have a "type" field. Consumers filter by type.' },
      { label: 'C) One topic per consumer (fan-out at producer)', description: 'billing-delivery-events, notification-delivery-events. Producer sends to multiple topics.' }
    ],
    bestOption: 1,
    explanation: `Option B (single topic per aggregate/entity) is the recommended pattern:

**Why one topic for all delivery events:**
- **Ordering**: ALL events for a delivery are in the same partition (by deliveryId key)
- **Simplicity**: fewer topics to manage (ops)
- **Consumer flexibility**: billing can consume ALL delivery events, filter to "COMPLETED"
- **Correlation**: consumer sees the full lifecycle in order

**Why NOT A (topic per type):**
- Loses ordering across event types (dispatched might arrive before planned)
- Consumer that needs multiple types must subscribe to N topics
- Operationally: 10 event types × 5 entities = 50 topics to manage

**Why NOT C (topic per consumer):**
- Producer must know all consumers (tight coupling!)
- Adding a new consumer requires changing the producer
- Violates event-driven principle (producer shouldn't know consumers)

**Naming convention:**
\`\`\`
{domain}-events     → delivery-events, driver-events, route-events
{domain}-commands   → delivery-commands (if using CQRS)
{domain}-events.DLT → dead letter for that topic
\`\`\``,
    tags: ['topic-design', 'architecture', 'naming']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Testing Kafka',
    question: 'How do you test Kafka producers and consumers in Spring Boot?',
    modelAnswer: `**Three levels of Kafka testing:**

**1. Unit test (no Kafka — mock the template):**
\`\`\`java
@ExtendWith(MockitoExtension.class)
class DeliveryEventPublisherTest {
    @Mock KafkaTemplate<String, DeliveryEvent> kafka;
    @InjectMocks DeliveryEventPublisher publisher;

    @Test
    void shouldPublishWithDeliveryIdAsKey() {
        publisher.publishCompleted(delivery);
        verify(kafka).send("delivery-events", "4567", expectedEvent);
    }
}
\`\`\`

**2. Integration with EmbeddedKafka:**
\`\`\`java
@SpringBootTest
@EmbeddedKafka(topics = "delivery-events", partitions = 1)
class DeliveryEventIntegrationTest {

    @Autowired KafkaTemplate<String, DeliveryEvent> producer;
    @Autowired KafkaConsumer<String, DeliveryEvent> consumer;

    @Test
    void shouldProduceAndConsumeEvent() {
        producer.send("delivery-events", "key", event).get();
        var records = KafkaTestUtils.getRecords(consumer);
        assertThat(records).hasSize(1);
    }
}
\`\`\`

**3. Integration with Testcontainers (real Kafka):**
\`\`\`java
@Container
static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));
\`\`\`

**Rule**: Unit test business logic (no Kafka needed). EmbeddedKafka for serialization/config validation. Testcontainers for full end-to-end (rarely needed).`,
    tags: ['testing', 'embedded-kafka', 'testcontainers']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Kafka vs Alternatives',
    question: 'When would you NOT use Kafka? What are the alternatives and when do they win?',
    modelAnswer: `**Kafka is NOT always the answer:**

| Scenario | Better choice | Why |
|----------|--------------|-----|
| Request-reply pattern | REST / gRPC | Kafka is fire-and-forget, not request-response |
| Small team, simple app | RabbitMQ | Simpler to operate, built-in routing, good enough for <10K msg/s |
| Strict ordering across ALL messages | Single-partition topic or DB queue | Kafka orders per partition only |
| Exactly-once to external system | Outbox + polling | Kafka can't transact with your DB |
| Temporary task queue | Redis Streams / SQS | Lightweight, no Zookeeper/KRaft overhead |
| Event bus within single JVM | CDI Events / Spring Events | No network hop, no serialization |

**Kafka wins when:**
- Multiple independent consumers need the same stream
- High throughput (>100K events/s)
- Replay/audit trail required
- Consumer speed varies (some fast, some slow)
- Event sourcing or stream processing (KStreams, ksqlDB)

**REWE context:**
- Kafka for inter-service events: ✓ (delivery, billing, analytics)
- Kafka for intra-service commands: ✗ (use direct method call)
- Kafka for simple notifications: maybe (RabbitMQ could also work, but Kafka is already there)

**Honest interview answer:** "I'd use Kafka when I need decoupled event streaming with multiple consumers and replay. For simpler messaging (one producer, one consumer, no replay), RabbitMQ or even a DB-backed queue might be simpler to operate."`,
    tags: ['alternatives', 'rabbitmq', 'trade-offs']
  }
];
