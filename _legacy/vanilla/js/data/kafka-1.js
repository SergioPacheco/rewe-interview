/**
 * Kafka Module — Part 1 (15 exercises)
 * Transferring JMS/ActiveMQ Experience to Kafka
 * REWE Digital Spain — TRAB Team (logistics events)
 */
const kafkaExercises1 = [

  // 1. ORAL — How would your JMS experience help with Kafka?
  {
    id: 'kafka-oral-01',
    type: 'ORAL_ANSWER',
    subtopic: 'JMS → Kafka',
    difficulty: 'SENIOR',
    question: 'You have experience with JMS. How would you compare it with Kafka?',
    interviewerIntent: 'Evaluate messaging fundamentals, honesty and ability to transfer experience without claiming they are identical.',
    shortAnswer: 'My JMS experience gives me strong foundations in async messaging: producers, consumers, retry, DLQ and idempotency. Kafka adds a different model — append-only log, consumer-managed offsets, partition-based parallelism and message replay. The patterns transfer but the operational model is fundamentally different.',
    modelAnswer: `Context: I have production experience with JMS and ActiveMQ Artemis for asynchronous integration between services.

Transferable concepts: Message producers and consumers, asynchronous decoupling, retry on failure, dead-letter handling, idempotent processing, event-driven architecture.

Key differences I recognize:
- JMS: message consumed = removed from queue. Kafka: messages retained in the log (replayable).
- JMS: broker tracks delivery state. Kafka: consumer manages its own offset (position).
- JMS: queue = point-to-point. Kafka: topic + consumer groups = multiple independent readers of the same data.
- JMS: ordering within a queue. Kafka: ordering within a partition (not across partitions).
- JMS: acknowledgment per message. Kafka: offset commit (can batch).

My approach: I would transfer my messaging patterns (idempotent consumers, DLQ, retry backoff) while learning Kafka-specific operations (partition keys, consumer group rebalancing, offset management, schema evolution).

Trade-off: Kafka introduces operational complexity (ZooKeeper/KRaft, partition management, retention policies) that JMS does not have. But it enables event sourcing and replay that JMS cannot.`,
    senaiExample: 'SGN3 uses 80+ JMS queues on Artemis for async processing — enrollment events, notifications, integrations. MDBs consume with retry and DLQ. These patterns transfer to @KafkaListener.',
    reweExample: 'TRAB team publishes logistics events (DeliveryPlanned, TruckDeparted, DeliveryCompleted) to Kafka topics. Multiple services consume independently — tracking, analytics, driver notification.',
    keyPoints: ['Acknowledge transferable patterns (producer/consumer, retry, DLQ, idempotency)', 'Explain key differences (log vs queue, offset vs ack, retention vs removal)', 'Do NOT claim Kafka is just another queue', 'Show willingness to learn operational aspects', 'Connect to real REWE logistics events'],
    mistakesToAvoid: ['Saying JMS and Kafka are the same', 'Claiming Kafka production experience without it', 'Ignoring the fundamental model difference (log vs queue)', 'Not mentioning what you need to learn'],
    followUps: [
      { question: 'What is the biggest mistake when moving from JMS to Kafka?', answerHint: 'Treating Kafka like a queue — expecting messages to disappear after consumption. Also: not thinking about partition keys for ordering.' },
      { question: 'How does idempotency differ?', answerHint: 'Same principle (process once regardless of retries) but implementation differs. Kafka can deliver messages multiple times (at-least-once). Consumer must handle duplicates — usually via unique event ID + dedup table.' },
      { question: 'What Kafka concepts are completely new to you?', answerHint: 'Consumer group rebalancing, partition assignment strategies, offset management (auto vs manual commit), compacted topics, exactly-once semantics.' }
    ],
    vocabulary: [
      { term: 'offset', meaning: 'posição do consumidor no log — equivalente a um bookmark', example: 'The consumer commits offset 42, meaning it has processed all messages up to position 42 in the partition.' },
      { term: 'consumer group', meaning: 'grupo de consumidores que divide partições entre si', example: 'Three instances of tracking-service in the same consumer group each get assigned different partitions — work is distributed.' },
      { term: 'partition', meaning: 'subdivisão de um topic que permite paralelismo e garante ordem', example: 'Messages with the same key always go to the same partition, guaranteeing ordering for that key.' }
    ],
    selfEvaluation: [
      { criterion: 'I identified specific transferable patterns', weight: 3 },
      { criterion: 'I explained key differences without claiming sameness', weight: 3 },
      { criterion: 'I mentioned what I need to learn', weight: 2 },
      { criterion: 'I connected to REWE logistics events', weight: 2 }
    ]
  },

  // 2. ORAL — When would you use Kafka over a simple REST call?
  {
    id: 'kafka-oral-02',
    type: 'ORAL_ANSWER',
    subtopic: 'When to use Kafka',
    difficulty: 'INTERMEDIATE',
    question: 'When would you use Kafka over a direct REST call between services?',
    interviewerIntent: 'Test understanding of async vs sync communication trade-offs.',
    shortAnswer: 'Use Kafka when: the producer should not wait for the consumer, multiple services need the same event, you need retry/resilience, ordering matters, or you want to replay events. Use REST when you need an immediate response or the interaction is request-reply.',
    modelAnswer: `Context: In distributed systems, services communicate either synchronously (REST) or asynchronously (Kafka).

Use Kafka when:
1. Fire-and-forget: producer does not need a response (DeliveryPlanned event)
2. Fan-out: multiple services need the same event (tracking + analytics + notification all consume DeliveryPlanned)
3. Resilience: consumer is temporarily down — messages wait in the log
4. Ordering: events for the same delivery must be processed in sequence
5. Replay: new service needs to process historical events
6. Decoupling: producer and consumer evolve independently

Use REST when:
1. Request-reply: you need an answer now (check stock availability)
2. Simple query: GET current delivery status
3. Low latency required: sub-100ms response
4. Two-party interaction: only one specific service needs to respond

In my JMS experience, I made the same decisions — JMS for async/fire-and-forget, REST for immediate responses. Kafka adds fan-out and replay that JMS does not provide easily.`,
    senaiExample: 'SGN3: REST for real-time lookups (check enrollment status). JMS for async processes (generate certificate, send email, sync with Moodle). Same decision framework applies to Kafka.',
    reweExample: 'REST: driver checks delivery details. Kafka: DeliveryPlanned event consumed by tracking service, route optimizer, driver notifier and analytics — independently and asynchronously.',
    keyPoints: ['Kafka = async, fire-and-forget, fan-out, resilience', 'REST = sync, request-reply, immediate response', 'Fan-out is Kafka\'s killer feature over JMS queues', 'Same decision I made with JMS vs REST in Java EE'],
    mistakesToAvoid: ['Saying always use Kafka', 'Saying always use REST', 'Not mentioning fan-out (multiple consumers)', 'Ignoring the ordering guarantee within partitions'],
    followUps: [
      { question: 'What about eventual consistency?', answerHint: 'Kafka events mean the consumer processes LATER — data is eventually consistent, not immediately. The system must tolerate this (e.g., delivery status takes seconds to update in dashboard).' },
      { question: 'Can you do request-reply with Kafka?', answerHint: 'Technically yes (reply topic + correlation ID) but it is an anti-pattern. Kafka is not designed for request-reply. Use REST for that.' }
    ],
    vocabulary: [
      { term: 'fan-out', meaning: 'um evento consumido por múltiplos serviços independentemente', example: 'DeliveryPlanned fans out to tracking, analytics and notification — each has its own consumer group.' },
      { term: 'eventual consistency', meaning: 'dados ficam consistentes após algum tempo, não imediatamente', example: 'After publishing DeliveryCompleted, the analytics dashboard updates within seconds — eventually consistent.' },
      { term: 'backpressure', meaning: 'consumidor controla a velocidade de consumo sem afetar o produtor', example: 'If the analytics consumer is slow, it just falls behind on offsets — the producer and other consumers are unaffected.' }
    ],
    selfEvaluation: [
      { criterion: 'I gave clear criteria for Kafka vs REST', weight: 3 },
      { criterion: 'I mentioned fan-out as Kafka advantage', weight: 2 },
      { criterion: 'I mentioned eventual consistency as trade-off', weight: 3 },
      { criterion: 'I connected to JMS experience', weight: 2 }
    ]
  },

  // 3. ORDER_EXECUTION — Kafka event flow
  {
    id: 'kafka-order-01',
    type: 'ORDER_EXECUTION',
    subtopic: 'Kafka Basics',
    difficulty: 'BASIC',
    mission: 'Arrange the <strong>Kafka event flow</strong> for a delivery being planned.',
    items: [
      { id: 'produce', label: 'DeliveryService publishes DeliveryPlanned event' },
      { id: 'partition', label: 'Kafka assigns event to partition (by delivery ID)' },
      { id: 'store', label: 'Broker appends to partition log (persisted)' },
      { id: 'consume', label: 'TrackingService reads event at current offset' },
      { id: 'process', label: 'Consumer processes and commits offset' }
    ],
    answer: ['produce', 'partition', 'store', 'consume', 'process'],
    explain: 'Producer → partition (by key) → broker stores (append-only log) → consumer reads at its offset → processes and commits. Key insight: the message stays in the log AFTER consumption (unlike JMS). Other consumers can still read it.'
  },

  // 4. DESIGN_DECISION — Partition key choice
  {
    id: 'kafka-design-01',
    type: 'DESIGN_DECISION',
    subtopic: 'Partitioning',
    difficulty: 'SENIOR',
    mission: 'You publish delivery events to Kafka. What should be the <strong>partition key</strong>?',
    options: [
      { id: 'a', label: 'Delivery ID', desc: 'All events for the same delivery go to the same partition.' },
      { id: 'b', label: 'Driver ID', desc: 'All events for the same driver go to the same partition.' },
      { id: 'c', label: 'No key (round-robin)', desc: 'Events distributed evenly across partitions for maximum throughput.' }
    ],
    bestChoice: 'a',
    explanation: {
      a: { pros: ['Events for same delivery are ORDERED (same partition)', 'Consumer sees planned→dispatched→delivered in sequence', 'Idempotency per delivery is simpler'], cons: ['Hot partition if one delivery has many events', 'Scaling limited by number of deliveries'], verdict: 'Best for logistics events. You need ordering per delivery — planned before dispatched before completed.' },
      b: { pros: ['Driver events ordered', 'Good for driver-centric processing'], cons: ['Delivery events for same delivery may be unordered', 'One busy driver could create hot partition'], verdict: 'Good if the consumer is driver-centric. Bad if you need delivery lifecycle ordering.' },
      c: { pros: ['Maximum throughput', 'Even distribution'], cons: ['NO ordering guarantee for any delivery', 'planned might arrive AFTER delivered', 'Consumer must handle out-of-order'], verdict: 'Only for events where order does not matter (analytics, logging). Never for lifecycle events.' }
    },
    nuance: 'Partition key = ordering guarantee. Same key → same partition → ordered. In logistics, delivery lifecycle events MUST be ordered per delivery. In my JMS experience, we guaranteed ordering with single-consumer queues. In Kafka, we guarantee it with partition keys.'
  },

  // 5. DESIGN_DECISION — Consumer failure handling
  {
    id: 'kafka-design-02',
    type: 'DESIGN_DECISION',
    subtopic: 'Error Handling',
    difficulty: 'SENIOR',
    mission: 'A Kafka consumer fails processing a delivery event. <strong>What should happen?</strong>',
    options: [
      { id: 'a', label: 'Retry immediately, block the partition', desc: 'Keep retrying the same message until it succeeds or manual intervention.' },
      { id: 'b', label: 'Retry with backoff, then Dead Letter Topic', desc: 'Retry 3 times with exponential backoff. If still failing, send to DLT and continue.' },
      { id: 'c', label: 'Skip and log', desc: 'Log the error, commit the offset and move to next message.' }
    ],
    bestChoice: 'b',
    explanation: {
      a: { pros: ['No message loss', 'Order preserved'], cons: ['BLOCKS the entire partition', 'All subsequent messages stuck', 'One bad message stops everything'], verdict: 'Dangerous in production. A poison pill (unparseable message) blocks all deliveries in that partition forever.' },
      b: { pros: ['Handles transient failures (retry)', 'Handles permanent failures (DLT)', 'Does not block partition', 'DLT messages can be investigated and replayed later'], cons: ['Message processing order may break for that delivery', 'DLT needs monitoring'], verdict: 'Industry standard. Same pattern as JMS max-delivery-attempts + DLQ — the concept transfers directly from my Artemis experience.' },
      c: { pros: ['Never blocks'], cons: ['DATA LOSS — the event is never processed', 'No way to recover without replaying from offset'], verdict: 'Unacceptable for business-critical events like delivery status updates.' }
    },
    nuance: 'This is identical to what I configured with JMS/Artemis: max-delivery-attempts with backoff, then dead-letter queue. Kafka equivalent: Spring Kafka DefaultErrorHandler with BackOff + DeadLetterPublishingRecoverer. The pattern is the same, the API differs.'
  },

  // 6. CODE_REFACTOR — JMS MDB to Kafka Listener
  {
    id: 'kafka-refactor-01',
    type: 'CODE_REFACTOR',
    subtopic: 'JMS → Kafka',
    difficulty: 'INTERMEDIATE',
    mission: 'Translate this <strong>JMS MDB</strong> to a Spring Kafka consumer.',
    code: `@MessageDriven(activationConfig = {
    @ActivationConfigProperty(propertyName = "destinationLookup", propertyValue = "queue/DeliveryQueue"),
    @ActivationConfigProperty(propertyName = "destinationType", propertyValue = "javax.jms.Queue")
})
public class DeliveryMDB implements MessageListener {

    @Inject private DeliveryService deliveryService;

    @Override
    public void onMessage(Message message) {
        try {
            DeliveryEvent event = deserialize(message);
            deliveryService.processDelivery(event);
        } catch (Exception e) {
            throw new EJBException(e); // triggers redelivery
        }
    }
}`,
    problemsToIdentify: [
      '@MessageDriven with verbose activation config',
      'Manual deserialization from JMS Message',
      'EJBException for retry (Artemis redelivery)',
      'Single consumer per queue (no built-in parallelism)'
    ],
    refactoredCode: `@Component
public class DeliveryEventConsumer {

    private final DeliveryService deliveryService;

    public DeliveryEventConsumer(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @KafkaListener(
        topics = "delivery-events",
        groupId = "tracking-service",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void onDeliveryEvent(DeliveryEvent event) {
        // Spring Kafka auto-deserializes using configured deserializer
        deliveryService.processDelivery(event);
        // Offset auto-committed after successful processing
        // On exception: Spring Kafka retries per configured ErrorHandler
    }
}`,
    explain: '@MessageDriven → @KafkaListener. JMS Queue → Kafka topic + consumer group. Manual deserialization → auto-deserialization. EJBException for retry → Spring Kafka ErrorHandler. The processing logic (deliveryService.processDelivery) is IDENTICAL.'
  },

  // 7. COMPARE — JMS acknowledgment vs Kafka offset
  {
    id: 'kafka-compare-01',
    type: 'COMPARE_CONCEPTS',
    subtopic: 'JMS → Kafka',
    difficulty: 'INTERMEDIATE',
    mission: 'Compare: <strong>JMS Acknowledgment</strong> vs <strong>Kafka Offset Commit</strong>',
    conceptA: { name: 'JMS Acknowledgment', definition: 'Consumer acknowledges each message. Acknowledged = removed from queue. Not acknowledged = redelivered. Broker tracks state per message.' },
    conceptB: { name: 'Kafka Offset Commit', definition: 'Consumer commits its position (offset) in the partition. Message stays in log regardless. Committing = "I processed up to here." Broker stores offset per consumer group.' },
    keyDifference: 'JMS: per-message acknowledgment, message removed after ack. Kafka: positional bookmark (offset), message stays forever (until retention expires). Kafka allows replay by resetting offset; JMS does not.',
    javaExample: 'JMS: message.acknowledge() removes it. Kafka: consumer.commitSync() says "I\'m at offset 42" — the message at 42 stays in the topic and other consumers can still read it.',
    interviewAnswer: 'In JMS, acknowledging removes the message. In Kafka, committing an offset is a bookmark — the message stays in the log. This enables replay: a new consumer can start from offset 0 and reprocess everything. It also means multiple consumer groups read the same messages independently, which is impossible with JMS queues.'
  },

  // 8. ORAL — Idempotent consumer in Kafka
  {
    id: 'kafka-oral-03',
    type: 'ORAL_ANSWER',
    subtopic: 'Idempotency',
    difficulty: 'SENIOR',
    question: 'How do you ensure a Kafka consumer is idempotent?',
    interviewerIntent: 'Test understanding of at-least-once delivery and how to handle duplicates.',
    shortAnswer: 'Kafka provides at-least-once delivery by default — the same message can be delivered multiple times (consumer crash after processing but before offset commit). My consumer must handle duplicates using a unique event ID stored in a deduplication table, checked atomically before processing.',
    modelAnswer: `Context: Kafka guarantees at-least-once delivery by default. If the consumer processes a message but crashes before committing the offset, the message is redelivered on restart.

Problem: Without idempotency, a DeliveryCompleted event processed twice could trigger duplicate notifications to drivers or double-count in analytics.

Solution: Each event carries a unique eventId. Before processing, check if eventId exists in a processed_events table:

INSERT INTO processed_events (event_id, processed_at) VALUES (:id, NOW()) ON CONFLICT (event_id) DO NOTHING;

If INSERT returns 0 rows affected → already processed, skip. If 1 row → first time, proceed.

Connection to my JMS experience: We used the exact same pattern with Artemis MDBs — INSERT ON CONFLICT DO NOTHING as the idempotency guard. The SQL is identical. The concept transfers perfectly.

Trade-off: Extra DB write per message. For high-throughput topics, consider a TTL-based cache (Redis) for dedup instead of a permanent table.`,
    senaiExample: 'SGN3 MDBs use INSERT ON CONFLICT DO NOTHING with a chave_idempotencia column. Same pattern, different framework.',
    reweExample: 'TRAB consumer for DeliveryCompleted: check event_id in processed_events before updating delivery status and notifying driver. Prevents double-notification on redelivery.',
    keyPoints: ['Kafka = at-least-once by default → duplicates possible', 'Unique event ID in every message', 'Dedup table with ON CONFLICT DO NOTHING (atomic)', 'Same pattern used with JMS at SENAI', 'Consider TTL-based cache for high-throughput'],
    mistakesToAvoid: ['Assuming Kafka is exactly-once by default', 'Using SELECT EXISTS before INSERT (race condition)', 'Not mentioning the JMS parallel'],
    followUps: [
      { question: 'What about Kafka exactly-once semantics?', answerHint: 'Kafka supports exactly-once within Kafka (idempotent producer + transactional consumer). But across Kafka and external DB, you still need application-level idempotency.' },
      { question: 'How did you handle this in JMS?', answerHint: 'Same pattern: unique message ID, INSERT ON CONFLICT in the same transaction as processing. Artemis redelivery would hit the dedup check on retry.' }
    ],
    vocabulary: [
      { term: 'at-least-once', meaning: 'mensagem entregue pelo menos uma vez — pode haver duplicatas', example: 'Kafka at-least-once: if offset commit fails, the consumer reprocesses from last committed offset.' },
      { term: 'deduplication', meaning: 'detectar e ignorar mensagens já processadas', example: 'The dedup table stores processed event IDs — duplicates are detected with ON CONFLICT DO NOTHING.' },
      { term: 'poison pill', meaning: 'mensagem impossível de processar que bloqueia o consumidor', example: 'A malformed event that always fails parsing is a poison pill — send it to DLT and move on.' }
    ],
    selfEvaluation: [
      { criterion: 'I explained why duplicates occur in Kafka', weight: 3 },
      { criterion: 'I gave a concrete idempotency implementation', weight: 3 },
      { criterion: 'I connected to JMS experience (same pattern)', weight: 2 },
      { criterion: 'I mentioned the trade-off (extra DB write)', weight: 2 }
    ]
  },

  // 9. FILL_BLANK — Kafka consumer annotation
  {
    id: 'kafka-fill-01',
    type: 'FILL_BLANK',
    subtopic: 'Spring Kafka',
    difficulty: 'BASIC',
    mission: 'Complete the Spring Kafka consumer that listens to <strong>delivery events</strong>.',
    code: '@Component\npublic class DeliveryEventConsumer {\n\n    @_____(topics = "delivery-events", groupId = "tracking-service")\n    public void handle(DeliveryEvent event) {\n        // process event\n    }\n}',
    blank: '_____',
    choices: ['KafkaListener', 'MessageDriven', 'JmsListener', 'EventListener'],
    answer: 'KafkaListener',
    explain: '@KafkaListener is the Spring Kafka equivalent of @MessageDriven (JMS) or @JmsListener (Spring JMS). It subscribes to a topic with a consumer group ID. Multiple instances with same groupId share partitions; different groupId = independent consumption.'
  },

  // 10. FILL_BLANK — Kafka producer
  {
    id: 'kafka-fill-02',
    type: 'FILL_BLANK',
    subtopic: 'Spring Kafka',
    difficulty: 'BASIC',
    mission: 'Complete the event publisher that sends to a <strong>Kafka topic</strong>.',
    code: '@Component\npublic class LogisticsEventPublisher {\n    private final KafkaTemplate<String, LogisticsEvent> kafka;\n\n    public void publishDeliveryPlanned(Delivery d) {\n        kafka._____(\"delivery-events\", d.getId().toString(), DeliveryPlanned.from(d));\n    }\n}',
    blank: '_____',
    choices: ['send', 'publish', 'emit', 'dispatch'],
    answer: 'send',
    explain: 'KafkaTemplate.send(topic, key, value) publishes a message. The key (delivery ID) determines the partition — all events for the same delivery go to the same partition, preserving order. Equivalent to JMS messageProducer.send() but with an explicit key for partitioning.'
  },

  // 11. PICK_INVALID — Kafka misconceptions
  {
    id: 'kafka-pick-01',
    type: 'PICK_INVALID',
    subtopic: 'Kafka Concepts',
    difficulty: 'INTERMEDIATE',
    mission: 'Which statement about Kafka is <strong>FALSE</strong>?',
    snippets: [
      { id: 'a', code: 'Messages in Kafka are retained\nafter consumption. Consumers\ncan replay by resetting offset.', valid: true },
      { id: 'b', code: 'Kafka guarantees ordering\nacross ALL partitions in a\ntopic. Events are always\nglobally ordered.', valid: false },
      { id: 'c', code: 'Multiple consumer groups can\nread the same topic independently.\nEach group tracks its own offset.', valid: true }
    ],
    answer: 'b',
    explain: 'FALSE: Kafka guarantees ordering only WITHIN a partition, NOT across partitions. If a topic has 4 partitions, events in different partitions may be consumed out of order relative to each other. To guarantee ordering for a delivery, use the delivery ID as partition key → same partition → ordered.'
  },

  // 12. DESIGN_DECISION — Event schema evolution
  {
    id: 'kafka-design-03',
    type: 'DESIGN_DECISION',
    subtopic: 'Schema Evolution',
    difficulty: 'SENIOR',
    mission: 'The DeliveryPlanned event needs a <strong>new field</strong> (estimatedArrival). How do you evolve the schema?',
    options: [
      { id: 'a', label: 'Add field to existing event (backward compatible)', desc: 'New field is optional (nullable). Old consumers ignore unknown fields. New consumers use it if present.' },
      { id: 'b', label: 'Create new event version (DeliveryPlannedV2)', desc: 'Publish both V1 and V2 during migration. Consumers migrate to V2 over time.' },
      { id: 'c', label: 'Break the schema — all consumers must update simultaneously', desc: 'Change the event structure. All consumers must deploy the new version before producers.' }
    ],
    bestChoice: 'a',
    explanation: {
      a: { pros: ['Backward compatible — old consumers unaffected', 'No coordination needed', 'Simple evolution', 'Avro/Protobuf handle optional fields natively'], cons: ['Cannot remove existing fields easily', 'Schema grows over time'], verdict: 'Standard approach for non-breaking changes. Add optional fields, never remove or rename existing ones.' },
      b: { pros: ['Clean separation of versions', 'Old consumers continue working'], cons: ['Two event types to maintain', 'Producer must publish both temporarily', 'Complex migration coordination'], verdict: 'Justified only for breaking changes (field removal, type change, semantic change). Overkill for adding an optional field.' },
      c: { pros: ['Clean schema'], cons: ['Requires coordinated deployment of ALL consumers', 'Downtime or errors during transition', 'Violates independent deployability'], verdict: 'Anti-pattern in microservices. Defeats the purpose of async decoupling.' }
    },
    nuance: 'Same principle as REST API versioning: add optional fields without breaking existing consumers. Schema Registry (Avro/Protobuf) enforces compatibility rules automatically. My REST versioning experience transfers — the same backward-compatibility discipline applies to events.'
  },

  // 13. FOLLOW_UP — Kafka operational knowledge
  {
    id: 'kafka-followup-01',
    type: 'FOLLOW_UP',
    subtopic: 'Kafka Operations',
    difficulty: 'SENIOR',
    scenario: 'The interviewer probes operational knowledge about Kafka in production.',
    questions: [
      { q: 'What happens when a consumer instance dies?', hint: 'Consumer group rebalance — its partitions are redistributed to remaining instances. Messages are reprocessed from last committed offset (hence need for idempotency).' },
      { q: 'How does scaling Kafka consumers work?', hint: 'Add more consumer instances to the group (max = number of partitions). If 4 partitions and 4 instances → each gets 1. If 5 instances → one is idle.' },
      { q: 'What is consumer lag?', hint: 'Difference between latest produced offset and consumer committed offset. Growing lag = consumer is falling behind. Critical metric to monitor.' },
      { q: 'How would you investigate a consumer that is falling behind?', hint: 'Check consumer lag metric. Look at processing time per message. Check if external dependencies (DB, REST) are slow. Consider adding partitions + instances for parallelism.' },
      { q: 'What happens if a topic runs out of disk space?', hint: 'Messages are deleted by retention policy (time or size). If retention is too long and volume high, disk fills. Solution: tune retention, add brokers, monitor disk usage.' }
    ]
  },

  // 14. ORAL — What events would you publish for REWE logistics?
  {
    id: 'kafka-oral-04',
    type: 'ORAL_ANSWER',
    subtopic: 'Event Design',
    difficulty: 'SENIOR',
    question: 'What events would you design for a delivery tracking system?',
    interviewerIntent: 'Assess ability to think in events for the logistics domain.',
    shortAnswer: 'Core delivery lifecycle events: DeliveryPlanned, TruckDeparted, WarehouseArrivalRegistered, DeliveryInTransit, DeliveryCompleted, DeliveryFailed, DeliveryDelayed, RouteChanged. Each carries the delivery ID as key (ordering) and relevant payload.',
    modelAnswer: `Context: A delivery tracking system for 5,700+ supermarkets needs to communicate delivery lifecycle between services.

Events I would design:
- DeliveryPlanned: route, stops, driver, estimated times
- TruckDeparted: warehouse ID, departure time, loaded items
- DeliveryInTransit: current GPS, estimated arrival
- StopCompleted: which stop, delivery time, signature
- DeliveryCompleted: all stops done, total time
- DeliveryDelayed: reason, new estimated time
- DeliveryFailed: stop ID, reason (nobody home, wrong address)
- RouteChanged: new route, reason (road closure, priority change)

Design decisions:
- Key: delivery ID (ordering per delivery)
- Topic: one topic per event type OR one "delivery-events" topic with type field
- Payload: self-contained (consumer does not need to call back producer for context)
- Timestamp: when the event HAPPENED, not when it was published

Consumers: tracking dashboard, driver app, planner alerts, analytics, external carrier integration, NEO platform.`,
    senaiExample: 'SGN3 events: EnrollmentConfirmed, CertificateGenerated, GradeRegistered — same approach of lifecycle events for business entities.',
    reweExample: 'TRAB team: exactly these delivery lifecycle events flowing between warehouse systems, driver apps, route planners and the NEO communication platform.',
    keyPoints: ['Design events around business lifecycle (not technical operations)', 'Use entity ID as partition key', 'Events should be self-contained', 'Multiple consumers independently interested', 'Timestamp = when it happened, not when published'],
    mistakesToAvoid: ['Designing events around CRUD operations (DeliveryCreated, DeliveryUpdated — too generic)', 'Not mentioning the partition key strategy', 'Making events too small (requiring callbacks) or too large (entire entity)'],
    followUps: [
      { question: 'One topic per event type or one topic for all delivery events?', answerHint: 'One topic with event type field is simpler operationally. Multiple topics give finer control (different retention, different consumer groups per type). Start simple, split when needed.' },
      { question: 'How large should an event payload be?', answerHint: 'Self-contained for the consumer to act without callbacks. But not the entire entity — just what changed plus identifying context. Typically 1-10 KB.' }
    ],
    vocabulary: [
      { term: 'event-carried state transfer', meaning: 'evento que carrega dados suficientes para o consumidor agir sem callback', example: 'DeliveryCompleted carries delivery ID, driver, timestamps, stops — consumer does not need to call delivery-service for details.' },
      { term: 'domain event', meaning: 'algo significativo que aconteceu no domínio de negócio', example: 'DeliveryDelayed is a domain event — it represents a business-meaningful occurrence, not a technical one.' }
    ],
    selfEvaluation: [
      { criterion: 'I designed events around business lifecycle', weight: 3 },
      { criterion: 'I mentioned partition key strategy', weight: 2 },
      { criterion: 'I identified multiple consumers for the events', weight: 3 },
      { criterion: 'I explained event payload philosophy (self-contained)', weight: 2 }
    ]
  },

  // 15. COMPARE — Event sourcing vs event-driven
  {
    id: 'kafka-compare-02',
    type: 'COMPARE_CONCEPTS',
    subtopic: 'Architecture Patterns',
    difficulty: 'SENIOR',
    mission: 'Compare: <strong>Event-Driven Architecture</strong> vs <strong>Event Sourcing</strong>',
    conceptA: { name: 'Event-Driven Architecture', definition: 'Services communicate via events. Producer publishes what happened. Consumer reacts. Current state stored in DB. Events are notifications.' },
    conceptB: { name: 'Event Sourcing', definition: 'State IS the sequence of events. No separate DB for current state — rebuild state by replaying events from the beginning. Events are the source of truth.' },
    keyDifference: 'Event-driven: events are communication between services (can be lost, DB is source of truth). Event sourcing: events ARE the data (replay to rebuild state). Most systems use event-driven without event sourcing.',
    javaExample: 'Event-driven: save delivery to DB, then publish DeliveryPlanned event for other services. Event sourcing: store DeliveryPlanned, TruckDeparted, DeliveryCompleted events — derive current delivery state by replaying them.',
    interviewAnswer: 'Most logistics systems use event-driven architecture — services communicate via Kafka events, but each service maintains its own database as source of truth. Event sourcing (state derived from events) is powerful for audit trails but adds complexity. I would start with event-driven and consider event sourcing only for domains where the complete history IS the business value.'
  }
];
