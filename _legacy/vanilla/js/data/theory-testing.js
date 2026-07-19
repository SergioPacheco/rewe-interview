/**
 * Theory — Testing (JUnit 5, Mockito, Testcontainers, TDD)
 */
const theoryTesting = [
  {
    id: 'theory-testing-pyramid',
    title: 'Testing Pyramid & Strategy',
    sections: [
      {
        heading: 'The testing pyramid',
        content: `<pre><code>        /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
       /   E2E Tests (few)  \        ← slow, expensive, fragile
      /  Integration (some)  \       ← real DB, real Kafka
     /   Unit Tests (many)    \      ← fast, isolated, focused
    /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\</code></pre>

<strong>Distribution:</strong>
• Unit tests: 70-80% — test business logic in isolation (milliseconds)
• Integration: 15-20% — test DB queries, serialization, config (seconds)
• E2E: 5-10% — test critical user journeys (minutes)

<strong>What to test at each level:</strong>
| Level | Test what | Don't test |
|-------|-----------|------------|
| Unit | Business rules, validation, calculations | Framework behavior, DB queries |
| Integration | Queries, serialization, wiring | Business logic (covered by unit) |
| E2E | Critical paths end-to-end | Every edge case (covered by unit) |`
      },
      {
        heading: 'Test Driven Development (TDD)',
        content: `<strong>Red → Green → Refactor cycle:</strong>

<pre><code>// 1. RED — write a failing test first
@Test
void shouldRejectDispatchWhenDeliveryAlreadyCompleted() {
    Delivery d = DeliveryFixture.completed();
    assertThrows(IllegalStateException.class, () -> d.dispatch());
}
// Compile → FAIL (dispatch doesn't check status yet)

// 2. GREEN — write minimum code to pass
public void dispatch() {
    if (status == COMPLETED) throw new IllegalStateException("Already completed");
    this.status = DISPATCHED;
}
// Test → PASS ✅

// 3. REFACTOR — improve without changing behavior
public void dispatch() {
    if (!status.canTransitionTo(DISPATCHED))
        throw new InvalidTransitionException(status, DISPATCHED);
    this.status = DISPATCHED;
}
// Test → still PASS ✅ (behavior unchanged)</code></pre>

<strong>When TDD helps most:</strong>
• Complex business rules (many edge cases)
• Bug fixes (write test that reproduces → fix → test passes)
• Domain logic that must be correct (financial, state machines)

<strong>When TDD is overkill:</strong>
• Simple CRUD with no logic
• UI layout testing
• Exploration/prototyping (test after)`
      }
    ]
  },
  {
    id: 'theory-testing-junit',
    title: 'JUnit 5 + Mockito — Unit Testing',
    sections: [
      {
        heading: 'JUnit 5 structure',
        content: `<pre><code>@ExtendWith(MockitoExtension.class)
class DeliveryServiceTest {

    @Mock private DeliveryRepository repo;
    @Mock private EventPublisher events;
    @InjectMocks private DeliveryService service;

    @Nested
    @DisplayName("dispatch()")
    class Dispatch {

        @Test
        @DisplayName("should dispatch when delivery is PLANNED")
        void shouldDispatchWhenPlanned() {
            // Arrange
            var delivery = DeliveryFixture.planned();
            when(repo.findById(1L)).thenReturn(Optional.of(delivery));

            // Act
            service.dispatch(1L, "driver-42");

            // Assert
            assertEquals(DISPATCHED, delivery.getStatus());
            verify(events).publish(any(DeliveryDispatched.class));
        }

        @Test
        @DisplayName("should throw when delivery is already COMPLETED")
        void shouldThrowWhenCompleted() {
            var delivery = DeliveryFixture.completed();
            when(repo.findById(1L)).thenReturn(Optional.of(delivery));

            assertThrows(InvalidStateException.class,
                () -> service.dispatch(1L, "driver-42"));

            verify(events, never()).publish(any());
        }
    }
}</code></pre>

<strong>Conventions:</strong>
• \`@Nested\` groups tests by method under test
• \`@DisplayName\` for readable test reports
• AAA pattern: Arrange → Act → Assert (visually separated)
• One behavior per test (not one method per test)`
      },
      {
        heading: 'Mockito essentials',
        content: `<pre><code>// Stubbing (define return values)
when(repo.findById(1L)).thenReturn(Optional.of(delivery));
when(repo.findById(99L)).thenReturn(Optional.empty());
when(repo.save(any(Delivery.class))).thenAnswer(inv -> inv.getArgument(0));

// Verification (check interactions)
verify(events).publish(any(DeliveryDispatched.class));
verify(events, never()).publish(any(DeliveryFailed.class));
verify(repo, times(1)).save(any());

// Argument capture (inspect what was passed)
@Captor ArgumentCaptor&lt;DeliveryEvent&gt; eventCaptor;

verify(events).publish(eventCaptor.capture());
DeliveryEvent published = eventCaptor.getValue();
assertEquals("D-42", published.driverId());

// Exception stubbing
when(repo.findById(1L)).thenThrow(new DatabaseException("Connection refused"));</code></pre>

<strong>Rules:</strong>
• Mock interfaces/abstractions, not concrete classes
• Don't mock entities — use builders/fixtures
• verify() for side effects (events, saves), assertEquals() for return values
• If you need >3 mocks → class probably has too many dependencies (SRP signal)`
      }
    ]
  },
  {
    id: 'theory-testing-integration',
    title: 'Integration Testing — Testcontainers',
    sections: [
      {
        heading: 'Why Testcontainers over H2?',
        content: `<strong>H2 problems:</strong>
• Different SQL dialect (PostgreSQL-specific syntax fails)
• No schemas support
• No JSONB, DISTINCT ON, window functions
• Different date handling, collation
• "Works on H2, breaks on Postgres" → false confidence

<strong>Testcontainers:</strong> real PostgreSQL in Docker, spun up per test class.

<pre><code>@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = NONE)
class DeliveryRepositoryTest {

    @Container
    static PostgreSQLContainer&lt;?&gt; postgres =
        new PostgreSQLContainer&lt;&gt;("postgres:15");

    @DynamicPropertySource
    static void dbProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired private DeliveryRepository repo;

    @Test
    void shouldFindActiveByDriver() {
        repo.save(new Delivery("D-42", ACTIVE, LocalDateTime.now()));
        repo.save(new Delivery("D-42", COMPLETED, LocalDateTime.now()));

        var result = repo.findByDriverIdAndStatus("D-42", ACTIVE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(ACTIVE);
    }
}</code></pre>

<strong>CI:</strong> Works in GitHub Actions, GitLab CI — Docker available in CI runners.`
      },
      {
        heading: 'Testing Kafka with EmbeddedKafka',
        content: `<pre><code>@SpringBootTest
@EmbeddedKafka(topics = "delivery-events")
class DeliveryEventIntegrationTest {

    @Autowired private KafkaTemplate&lt;String, DeliveryEvent&gt; producer;
    @Autowired private DeliveryEventConsumer consumer;

    @Test
    void shouldProcessDeliveryCompletedEvent() {
        var event = new DeliveryCompletedEvent("4567", Instant.now(), 12);

        producer.send("delivery-events", "4567", event);

        // Wait for async processing
        await().atMost(5, SECONDS).untilAsserted(() ->
            assertTrue(invoiceRepo.existsByDeliveryId("4567"))
        );
    }
}</code></pre>

<strong>Test levels for Kafka:</strong>
• Unit: mock KafkaTemplate, verify send() called with correct args
• Integration: EmbeddedKafka or Testcontainers Kafka
• Don't test: Kafka itself (it works — test YOUR logic)`
      }
    ]
  }
];
