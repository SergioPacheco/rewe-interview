/**
 * Theory Content — Kafka (JMS → Kafka Transition)
 * Focus: What a JMS developer needs to know about Kafka
 */
const theoryKafka = [
  {
    id: 'theory-kafka-overview',
    title: 'Kafka — Why It Exists & JMS Comparison',
    sections: [
      {
        heading: 'JMS vs Kafka — fundamental difference',
        content: `<strong>JMS (ActiveMQ, Artemis):</strong> Smart broker, dumb consumers
• Broker tracks who received what, manages acknowledgements
• Messages deleted after consumption (queue) or after TTL (topic)
• Point-to-point (queue) or publish/subscribe (topic)
• Best for: command patterns, request-reply, enterprise integration

<strong>Kafka:</strong> Dumb broker, smart consumers
• Broker is a distributed LOG — appends events, does NOT track per-consumer state
• Consumers track their own position (offset) in the log
• Messages are RETAINED (days/weeks) regardless of consumption
• Best for: event streaming, high throughput, replay, decoupled microservices

<table>
<tr><th>Aspect</th><th>JMS (ActiveMQ/Artemis)</th><th>Kafka</th></tr>
<tr><td>Model</td><td>Queue (1 consumer) / Topic (broadcast)</td><td>Topics with consumer groups (scalable)</td></tr>
<tr><td>Message lifetime</td><td>Until consumed or TTL</td><td>Retention-based (days/weeks/forever)</td></tr>
<tr><td>Ordering</td><td>Per queue (single consumer)</td><td>Per partition (scalable)</td></tr>
<tr><td>Replay</td><td>❌ Once consumed, gone</td><td>✅ Reset offset → replay history</td></tr>
<tr><td>Throughput</td><td>~10K msg/s</td><td>~1M msg/s</td></tr>
<tr><td>Consumer tracking</td><td>Broker manages</td><td>Consumer manages (offset)</td></tr>
<tr><td>Delivery guarantee</td><td>Once/duplicate handled by broker</td><td>At-least-once (you handle idempotency)</td></tr>
</table>`
      },
      {
        heading: 'When to use Kafka vs JMS',
        content: `<strong>Keep JMS when:</strong>
• Request/reply pattern needed
• Complex routing rules (selectors, filters)
• Small volume, transactional commands
• Tight integration within same app server
• Message deletion after processing is desired

<strong>Use Kafka when:</strong>
• High throughput event streaming (millions/day)
• Multiple independent consumers need the same events
• Event replay/audit trail required
• Decoupled microservices (producers don't know consumers)
• Real-time analytics + batch processing on same data
• Ordering matters per entity (partition by key)

<strong>REWE Transport Logistics:</strong>
• <code>delivery-planned</code> → consumed by routing, notification, analytics
• <code>delivery-completed</code> → consumed by billing, performance, customer notification
• <code>driver-location-updated</code> → high-frequency, consumed by tracking dashboard + ETA calculator
• Each consumer processes independently at its own pace — classic Kafka use case`
      }
    ]
  },
  {
    id: 'theory-kafka-architecture',
    title: 'Kafka Architecture — Topics, Partitions, Offsets',
    sections: [
      {
        heading: 'Topics and Partitions',
        content: `A <strong>topic</strong> is a named stream of events (like a JMS queue/topic, but persistent).

A topic is divided into <strong>partitions</strong> — the unit of parallelism and ordering.

<pre><code>Topic: delivery-events (3 partitions)
┌─────────────────────────────────────────┐
│ Partition 0: [msg0, msg3, msg6, msg9 …] │  ← ordered within partition
│ Partition 1: [msg1, msg4, msg7, msg10…] │  ← independent order
│ Partition 2: [msg2, msg5, msg8, msg11…] │  ← independent order
└─────────────────────────────────────────┘</code></pre>

<strong>Ordering guarantee:</strong> Messages in the SAME partition are strictly ordered. No ordering guarantee ACROSS partitions.

<strong>Partition key:</strong> Decides which partition receives the message.
<pre><code>// All events for the same delivery go to the same partition → ordered!
kafka.send("delivery-events", delivery.getId().toString(), event);
//                             ^^^^ partition key

// Same deliveryId always → same partition → ordered per delivery
// Different deliveryIds may → different partitions → parallel processing</code></pre>

<strong>Why this matters:</strong> For REWE transport, all events for delivery #4567 (planned → dispatched → delayed → completed) go to the same partition. A consumer sees them IN ORDER. Events for different deliveries process in parallel across partitions.`
      },
      {
        heading: 'Offsets — how consumers track position',
        content: `Each message in a partition has a sequential <strong>offset</strong> (0, 1, 2, 3…). Consumers track which offset they've processed.

<pre><code>Partition 0:  [0] [1] [2] [3] [4] [5] [6] [7] [8] [9]
                                    ↑ committed offset (processed up to here)
                                       ↑ current position (processing this)
                                          ↑ ↑ ↑ ↑ not yet consumed</code></pre>

<strong>Offset commit strategies:</strong>
<table>
<tr><th>Strategy</th><th>Behavior</th><th>Risk</th></tr>
<tr><td>Auto-commit (default)</td><td>Kafka commits periodically</td><td>May lose messages if crash between commit and processing</td></tr>
<tr><td>Manual commit after processing</td><td>You commit only after successful processing</td><td>May reprocess on crash (at-least-once) — handle with idempotency</td></tr>
<tr><td>Commit per batch</td><td>Process N messages, then commit</td><td>Reprocess entire batch on failure</td></tr>
</table>

<strong>JMS comparison:</strong>
• JMS: broker tracks acknowledgements per consumer. <code>message.acknowledge()</code> or transaction commit.
• Kafka: consumer commits its offset. <code>consumer.commitSync()</code> or auto-commit.

<strong>Replay:</strong> Reset offset to 0 → re-read all messages. Impossible in JMS (messages are gone). Essential for Kafka use cases like rebuilding materialized views.`
      }
    ]
  },
  {
    id: 'theory-kafka-consumers',
    title: 'Consumer Groups — Scalable Processing',
    sections: [
      {
        heading: 'Consumer groups explained',
        content: `A <strong>consumer group</strong> is a set of consumers that cooperate to process a topic. Each partition is consumed by exactly ONE consumer in the group.

<pre><code>Topic: delivery-events (4 partitions)

Consumer Group: "delivery-routing-service"
├── Consumer A → reads Partition 0, Partition 1
└── Consumer B → reads Partition 2, Partition 3

Consumer Group: "delivery-notification-service"  (independent!)
├── Consumer C → reads Partition 0, Partition 1
└── Consumer D → reads Partition 2, Partition 3</code></pre>

<strong>Key rules:</strong>
• Within a group: each partition → 1 consumer (no duplicate processing)
• More consumers than partitions = idle consumers (over-provisioned)
• Different groups: each reads ALL messages independently (like JMS durable topic)

<strong>JMS equivalent:</strong>
• Consumer group = JMS Queue (competing consumers)
• Multiple groups on same topic = JMS Topic with durable subscribers

<strong>Scaling:</strong> Add partitions + add consumers in the group. Kafka rebalances automatically.`
      },
      {
        heading: 'Spring Kafka — consumer implementation',
        content: `<pre><code>// JMS equivalent:
@MessageDriven(activationConfig = {
    @ActivationConfigProperty(propertyName = "destinationType", propertyValue = "Queue"),
    @ActivationConfigProperty(propertyName = "destination", propertyValue = "DeliveryQueue")
})
public class DeliveryMDB implements MessageListener {
    public void onMessage(Message message) { ... }
}

// Spring Kafka equivalent:
@Component
public class DeliveryEventConsumer {

    @KafkaListener(
        topics = "delivery-events",
        groupId = "trab-routing-service",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleDeliveryEvent(
            @Payload DeliveryEvent event,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            @Header(KafkaHeaders.OFFSET) long offset) {

        log.info("Processing delivery event: key={}, offset={}", key, offset);

        // Idempotency check (same pattern as JMS!)
        if (eventStore.alreadyProcessed(event.getEventId())) {
            log.info("Duplicate event, skipping: {}", event.getEventId());
            return;
        }

        routingService.updateRoute(event);
        eventStore.markProcessed(event.getEventId());
    }
}</code></pre>

<strong>Same patterns transfer from JMS:</strong>
• Idempotency (check before processing)
• Error handling (throw exception → Kafka retries from last committed offset)
• Logging with business context
• Deserialization of payload`
      }
    ]
  },
  {
    id: 'theory-kafka-delivery',
    title: 'Delivery Semantics — At Least Once, Exactly Once',
    sections: [
      {
        heading: 'Delivery guarantees',
        content: `<table>
<tr><th>Semantic</th><th>Meaning</th><th>How to achieve</th><th>Use case</th></tr>
<tr><td><strong>At most once</strong></td><td>May lose messages, never duplicate</td><td>Commit offset before processing</td><td>Metrics, logs (loss acceptable)</td></tr>
<tr><td><strong>At least once</strong></td><td>Never lose, may duplicate</td><td>Commit offset after processing</td><td>Most business events (with idempotency)</td></tr>
<tr><td><strong>Exactly once</strong></td><td>No loss, no duplicates</td><td>Kafka transactions + idempotent producer</td><td>Financial, billing</td></tr>
</table>

<strong>At-least-once is the standard for REWE transport:</strong>
<pre><code>// Scenario: Consumer processes delivery-completed, then crashes before commit
// → Kafka redelivers the message (offset not committed)
// → Your code must handle duplicates!

@KafkaListener(topics = "delivery-completed")
public void handle(DeliveryCompletedEvent event) {
    // Idempotent: INSERT ... ON CONFLICT DO NOTHING
    int inserted = billingRepo.createInvoiceIfAbsent(event.getDeliveryId(), event);
    if (inserted == 0) {
        log.info("Invoice already exists for delivery {}", event.getDeliveryId());
        return;  // Idempotent — no duplicate invoice
    }
    // Process...
}</code></pre>

<strong>JMS comparison:</strong>
• JMS with transactions: broker handles redelivery + max-delivery-attempts + DLQ
• Kafka: YOU handle retry logic. Failed messages can be sent to a dead-letter topic manually.`
      },
      {
        heading: 'Error handling patterns',
        content: `<strong>1. Retry + Dead Letter Topic (DLT)</strong>
<pre><code>// Spring Kafka retry configuration
@Bean
public DefaultErrorHandler errorHandler(KafkaTemplate&lt;String, Object&gt; template) {
    // Retry 3 times with backoff
    var backoff = new FixedBackOff(1000L, 3);

    // After exhausting retries → send to DLT
    var recoverer = new DeadLetterPublishingRecoverer(template,
        (record, ex) -> new TopicPartition(record.topic() + ".DLT", -1));

    return new DefaultErrorHandler(recoverer, backoff);
}</code></pre>

<strong>2. Non-blocking retry (separate topics)</strong>
<pre><code>// Main topic: delivery-events
// Retry topic: delivery-events.retry-1 (1s delay)
// Retry topic: delivery-events.retry-2 (30s delay)
// DLT: delivery-events.DLT (manual intervention)</code></pre>

<strong>3. Skip and log (non-critical events)</strong>
<pre><code>@KafkaListener(topics = "driver-location")
public void handleLocation(DriverLocationEvent event) {
    try {
        trackingService.updateLocation(event);
    } catch (Exception e) {
        // Location events: losing one is acceptable
        log.warn("Failed to process location event, skipping: {}", event, e);
        // Do NOT rethrow — message is committed, not retried
    }
}</code></pre>

<strong>JMS equivalent:</strong>
• Artemis: <code>max-delivery-attempts=5</code>, <code>redelivery-delay=60s</code>, automatic DLQ
• Kafka: You configure retry + DLT explicitly (more control, more responsibility)`
      }
    ]
  },
  {
    id: 'theory-kafka-producer',
    title: 'Producing Events — Design & Best Practices',
    sections: [
      {
        heading: 'Event design for logistics',
        content: `<strong>Event naming convention:</strong> <code>&lt;entity&gt;-&lt;past-tense-verb&gt;</code>
<pre><code>delivery-planned
delivery-dispatched
delivery-completed
delivery-failed
driver-assigned
route-optimized
warehouse-stock-updated</code></pre>

<strong>Event structure:</strong>
<pre><code>{
  "eventId": "uuid-unique-per-event",       // for idempotency
  "eventType": "DELIVERY_COMPLETED",
  "timestamp": "2026-07-19T10:30:00Z",
  "aggregateId": "delivery-4567",           // partition key
  "payload": {
    "deliveryId": 4567,
    "driverId": "driver-42",
    "completedAt": "2026-07-19T10:28:15Z",
    "stopsCompleted": 12,
    "totalDistance": 87.5
  }
}</code></pre>

<strong>Key design decisions:</strong>
• <code>eventId</code> — unique identifier for idempotent consumers
• <code>aggregateId</code> — used as Kafka partition key (ordering per entity)
• Include enough data so consumers don't need to call back (event carries the facts)
• Avoid references to internal IDs that consumers can't resolve`
      },
      {
        heading: 'Spring Kafka producer',
        content: `<pre><code>@Service
public class LogisticsEventPublisher {

    private final KafkaTemplate&lt;String, LogisticsEvent&gt; kafka;
    private final ObjectMapper mapper;

    public void publishDeliveryCompleted(Delivery delivery) {
        var event = LogisticsEvent.builder()
            .eventId(UUID.randomUUID().toString())
            .eventType("DELIVERY_COMPLETED")
            .timestamp(Instant.now())
            .aggregateId("delivery-" + delivery.getId())
            .payload(toPayload(delivery))
            .build();

        // Key = aggregateId → same delivery always goes to same partition
        kafka.send("delivery-events", event.getAggregateId(), event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish event: {}", event.getEventId(), ex);
                    // Fallback: persist to outbox table for retry
                    outboxRepository.save(new OutboxEvent(event));
                } else {
                    log.debug("Event published: topic={}, partition={}, offset={}",
                        result.getRecordMetadata().topic(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
                }
            });
    }
}</code></pre>

<strong>Outbox pattern (for guaranteed delivery):</strong>
1. Save business data + event to outbox table in SAME transaction
2. Separate process reads outbox and publishes to Kafka
3. Mark as published after successful send
4. If Kafka is down → outbox accumulates, nothing lost

Same pattern used in JMS with the "persist first, send after commit" approach.`
      }
    ]
  },
  {
    id: 'theory-kafka-interview',
    title: 'Kafka Interview — Your Story',
    sections: [
      {
        heading: 'How to position your JMS experience',
        content: `<strong>"Tell me about your messaging experience"</strong>

"I have 5 years working with JMS — ActiveMQ Artemis as the broker, with Message-Driven Beans consuming from queues. Our system had 80+ queues handling async operations like notifications, external integrations, and background processing.

The patterns are the same as Kafka: idempotent consumers, dead-letter handling, retry with backoff, and monitoring queue depth for back-pressure.

What changes in Kafka is the architecture — the log-based model means consumers are responsible for tracking their position, messages persist for replay, and scaling is partition-based rather than adding competing consumers on a queue. I find the consumer group model more elegant for multiple independent consumers reading the same stream."

<strong>Key talking points:</strong>
• Emphasize patterns (idempotency, error handling) — they transfer 100%
• Show understanding of Kafka's DIFFERENT model (log, offsets, partitions)
• Mention specific REWE use case: "For transport logistics, partition by delivery ID gives ordering per shipment while scaling across partitions."
• Be honest: "I haven't operated Kafka in production, but I've studied the operational aspects — consumer lag monitoring, partition rebalancing, schema evolution with Avro/Schema Registry."`
      }
    ]
  },
  {
    id: 'theory-kafka-comparison',
    title: 'ActiveMQ vs Kafka — Deep Comparison',
    sections: [
      {
        heading: 'Messaging model',
        content: `<strong>ActiveMQ:</strong>
• Uses JMS (Java Message Service) standard
• Supports queues (point-to-point) and topics (publish-subscribe)
• Broker manages delivery, acknowledgement, redelivery
• Protocols: AMQP, STOMP, MQTT, OpenWire

<strong>Kafka:</strong>
• Focused on publish-subscribe with log-based storage
• NOT a JMS provider — different paradigm entirely
• Topics are partitioned append-only logs
• Consumers manage their own position (offset)`
      },
      {
        heading: 'Performance & Scalability',
        content: `<table>
<tr><th>Aspect</th><th>ActiveMQ</th><th>Kafka</th></tr>
<tr><td>Throughput</td><td>~10K-50K msg/s</td><td>~1M+ msg/s</td></tr>
<tr><td>Scaling</td><td>Vertical (bigger machine) + network of brokers</td><td>Horizontal (add brokers + partitions)</td></tr>
<tr><td>Latency</td><td>Lower for small volumes</td><td>Slightly higher per-message, but much better at scale</td></tr>
<tr><td>Storage</td><td>Messages in memory/DB, deleted after consumption</td><td>Sequential disk I/O (very fast), configurable retention</td></tr>
<tr><td>Ordering</td><td>Per queue (single consumer)</td><td>Per partition (scalable ordering)</td></tr>
</table>

<strong>Key insight:</strong> ActiveMQ is good for scenarios with lower volume. Kafka is designed for high-volume data streaming. For REWE transport with 500K+ events/day across multiple services, Kafka is the clear choice.`
      },
      {
        heading: 'Durability & Reliability',
        content: `<strong>ActiveMQ:</strong>
• Guaranteed delivery via persistence + transactions
• Messages stored until acknowledged
• Dead Letter Queue (DLQ) for failed messages
• Master-slave replication for HA

<strong>Kafka:</strong>
• Messages stored on disk and REPLICATED across brokers (configurable replication factor)
• Replication factor 3 = data survives loss of 2 brokers
• Configurable durability: \`acks=all\` waits for all replicas
• Messages retained even AFTER consumption (time-based or size-based retention)
• ISR (In-Sync Replicas) ensures only up-to-date replicas serve reads

<strong>Key difference:</strong> In ActiveMQ, once consumed, the message is gone. In Kafka, messages persist for days/weeks/forever — enabling replay, reprocessing, and new consumers reading history.`
      },
      {
        heading: 'Use cases — when to choose each',
        content: `<strong>Choose ActiveMQ when:</strong>
• Traditional enterprise integration (EAI)
• Request-reply patterns needed
• Complex routing rules (message selectors, content-based routing)
• Small-to-medium volume (<50K msg/s)
• Team needs JMS standard compliance
• Simple setup, lower operational complexity

<strong>Choose Kafka when:</strong>
• Real-time stream processing at scale
• Multiple independent consumers need the same events
• Event replay / audit trail required
• Logging of events at massive scale
• Big data integration (Hadoop, Spark, data lakes)
• Microservices event-driven communication
• Consumer speed varies (fast analytics + slow batch processing on same stream)

<strong>REWE Transport example:</strong>
ActiveMQ would work for: internal command queue (dispatch this delivery).
Kafka is better for: delivery-events consumed by 5+ independent services (billing, tracking, analytics, notifications, ETA).`
      },
      {
        heading: 'Complexity & Maintenance',
        content: `<strong>ActiveMQ:</strong>
• Simpler to configure and maintain for small-medium projects
• Less operational complexity (single broker or simple cluster)
• Familiar JMS API — most Java developers know it
• Built-in web console for management

<strong>Kafka:</strong>
• Requires more configuration (brokers, ZooKeeper/KRaft, topics, partitions)
• Higher operational complexity in large clusters
• Partition rebalancing, ISR management, log compaction
• BUT: compensated by performance and scalability at scale
• Modern Kafka (KRaft mode) eliminates ZooKeeper dependency`
      }
    ]
  },
  {
    id: 'theory-kafka-exclusive',
    title: 'Kafka Exclusive Features — What ActiveMQ Cannot Do',
    sections: [
      {
        heading: 'Log-based data model',
        content: `Kafka stores messages as an immutable, ordered, append-only log. This is fundamentally different from a message queue:

<pre><code>// ActiveMQ: message exists → consumer reads → message deleted
Queue: [msg1, msg2, msg3] → consumer reads msg1 → Queue: [msg2, msg3]

// Kafka: messages persist regardless of consumption
Partition: [0:msg0, 1:msg1, 2:msg2, 3:msg3, 4:msg4, ...]
Consumer A: offset=3 (read up to msg2, processing msg3)
Consumer B: offset=1 (slower, still processing msg1)
// Both read the SAME data at their own pace!</code></pre>

<strong>Benefits:</strong>
• Reconstruct state by replaying from offset 0
• Add new consumers that read all history
• Time-travel debugging: "what happened at 3am yesterday?"
• Decouples producer speed from consumer speed completely`
      },
      {
        heading: 'Horizontal scaling & Partitioning',
        content: `<pre><code>Topic: delivery-events (12 partitions, 3 brokers)

Broker 1: Partition 0, 3, 6, 9   (leader)
Broker 2: Partition 1, 4, 7, 10  (leader)
Broker 3: Partition 2, 5, 8, 11  (leader)
+ replicas on other brokers for fault tolerance

Consumer Group "billing" (4 instances):
  Pod 1 → Partitions 0, 1, 2
  Pod 2 → Partitions 3, 4, 5
  Pod 3 → Partitions 6, 7, 8
  Pod 4 → Partitions 9, 10, 11</code></pre>

• Add brokers → redistribute partitions → more storage + throughput
• Add consumers (up to partition count) → parallel processing
• Partition key ensures ordering per entity (all events for delivery-4567 → same partition)`
      },
      {
        heading: 'Message retention & Replay',
        content: `<pre><code># Retention policies (configurable per topic)
retention.ms=604800000        # 7 days (time-based)
retention.bytes=1073741824    # 1GB per partition (size-based)
cleanup.policy=delete         # delete old segments
cleanup.policy=compact        # keep latest value per key (state snapshot)</code></pre>

<strong>Use cases for retention:</strong>
• New microservice deployed → reads last 7 days of events to build its state
• Bug found → replay events from before the bug to rebuild correct state
• Audit: "show me all status changes for delivery-4567 in the last month"
• A/B testing: replay same events through different processing logic

<strong>Log compaction</strong> (cleanup.policy=compact):
Keeps only the LATEST message per key. Like a changelog table:
<pre><code>Key: driver-42 → {status: "available"}     (kept)
Key: driver-42 → {status: "busy"}          (kept — most recent)
Key: driver-42 → {status: "available"}     (old — compacted away)
// Result: one entry per driver with latest state</code></pre>`
      },
      {
        heading: 'Stream Processing (Kafka Streams & ksqlDB)',
        content: `Kafka has BUILT-IN stream processing — no external framework needed:

<pre><code>// Kafka Streams — Java library for real-time transformations
StreamsBuilder builder = new StreamsBuilder();
KStream&lt;String, DeliveryEvent&gt; events = builder.stream("delivery-events");

// Real-time aggregation: deliveries completed per hour per warehouse
KTable&lt;Windowed&lt;String&gt;, Long&gt; completedPerHour = events
    .filter((key, event) -> "COMPLETED".equals(event.getStatus()))
    .groupBy((key, event) -> event.getWarehouseId())
    .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofHours(1)))
    .count();

completedPerHour.toStream().to("warehouse-metrics");

// ksqlDB — SQL-like syntax for streaming
// CREATE STREAM delivery_stream (deliveryId VARCHAR, status VARCHAR, ...)
//   WITH (KAFKA_TOPIC='delivery-events', VALUE_FORMAT='JSON');
// SELECT warehouseId, COUNT(*) FROM delivery_stream
//   WHERE status = 'COMPLETED'
//   WINDOW TUMBLING (SIZE 1 HOUR)
//   GROUP BY warehouseId EMIT CHANGES;</code></pre>

<strong>REWE use cases:</strong>
• Real-time dashboard: deliveries per hour per warehouse
• ETA recalculation: stream of driver positions → join with route data → updated ETA
• Alert: if delivery not completed within expected window → notify operations`
      },
      {
        heading: 'Delivery guarantees (configurable)',
        content: `Kafka offers THREE levels, configurable per producer/consumer:

<table>
<tr><th>Guarantee</th><th>How</th><th>Trade-off</th><th>Use case</th></tr>
<tr><td><strong>At-most-once</strong></td><td>Commit offset before processing</td><td>May lose messages</td><td>Metrics, non-critical logs</td></tr>
<tr><td><strong>At-least-once</strong></td><td>Commit after processing + idempotent consumer</td><td>May duplicate (you handle)</td><td>95% of business events</td></tr>
<tr><td><strong>Exactly-once</strong></td><td>Kafka transactions + idempotent producer</td><td>Higher latency, Kafka-to-Kafka only</td><td>Financial, cross-topic transforms</td></tr>
</table>

<strong>Important:</strong> "Exactly-once" only works within Kafka (consume → process → produce to another topic). When writing to an external database, you MUST use at-least-once + idempotent writes.

<pre><code>// Producer: idempotent (no duplicates on retry)
enable.idempotence=true
acks=all

// Consumer: manual commit after processing
enable.auto.commit=false
// Process → write to DB (with idempotency key) → commitSync()</code></pre>`
      },
      {
        heading: 'Kafka Connect & Ecosystem',
        content: `<strong>Kafka Connect</strong> — move data in/out of Kafka without writing code:

<pre><code>// Source Connector: PostgreSQL → Kafka (CDC - Change Data Capture)
{
  "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
  "database.hostname": "delivery-db",
  "database.port": "5432",
  "table.include.list": "logistics.delivery",
  "topic.prefix": "cdc.delivery"
}
// Every INSERT/UPDATE/DELETE in delivery table → Kafka event automatically!

// Sink Connector: Kafka → Elasticsearch (for search/analytics)
{
  "connector.class": "io.confluent.connect.elasticsearch.ElasticsearchSinkConnector",
  "topics": "delivery-events",
  "connection.url": "http://elasticsearch:9200"
}</code></pre>

<strong>Ecosystem integration:</strong>
• <strong>Debezium</strong>: Change Data Capture (DB → Kafka)
• <strong>Schema Registry</strong>: Avro/JSON schema management + compatibility checks
• <strong>ksqlDB</strong>: SQL queries on streams
• <strong>Kafka Streams</strong>: Java stream processing library
• <strong>MirrorMaker</strong>: cross-cluster replication
• <strong>Spark/Flink</strong>: batch + stream processing

ActiveMQ has NOTHING equivalent to this ecosystem.`
      },
      {
        heading: 'Solving problems with Kafka',
        content: `<strong>Problem: "Was this message processed?"</strong>
Kafka: check consumer group offset vs message offset. If committed offset ≥ message offset → processed.

<strong>Problem: "Message processed but result is wrong"</strong>
Kafka: reset offset to before the problematic message → reprocess with fixed logic. Impossible in ActiveMQ (message already deleted).

<strong>Problem: "Consumer is slow, messages accumulating"</strong>
Kafka: add partitions + add consumer instances (horizontal scaling). Monitor consumer lag metric.

<strong>Problem: "Need to process events in order"</strong>
Kafka: use partition key = entity ID. All events for same entity go to same partition → guaranteed order within partition.

<strong>Problem: "One bad message blocks the entire queue"</strong>
Kafka: send to Dead Letter Topic (DLT) after N retries. Consumer continues with next message. Ops investigates DLT.

<strong>Problem: "New service needs historical data"</strong>
Kafka: set consumer offset to 0 (or specific timestamp) → replay all retained events. Build state from scratch.

<strong>Conclusion:</strong> Kafka gives fine-grained control over message processing with guarantees of exactly-once processing (when configured), ordering per partition, and the ability to replay and monitor. While ActiveMQ is adequate for traditional messaging, Kafka excels where high performance, scalability, and advanced real-time data processing are required.`
      }
    ]
  }
];
