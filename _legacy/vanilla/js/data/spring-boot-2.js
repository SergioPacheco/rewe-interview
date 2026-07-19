/**
 * Spring Boot Module — Part 2 (20 exercises)
 * REST controllers, testing, security, actuator, error handling
 */
const springBootExercises2 = [
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'REST Controller',
    question: 'In Java EE you use @Path and @GET (JAX-RS). How does Spring MVC handle the same? Show a GET endpoint that returns a delivery by ID with proper error handling.',
    modelAnswer: `Spring MVC uses @RestController + @GetMapping:

\`\`\`java
@RestController
@RequestMapping("/api/v1/deliveries")
public class DeliveryController {

    private final DeliveryService service;

    // Constructor injection (no @Autowired needed with single constructor)
    public DeliveryController(DeliveryService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }
}
\`\`\`

Key differences from JAX-RS:
• @RestController = @Controller + @ResponseBody (auto-serialize to JSON)
• @GetMapping = @RequestMapping(method = GET) shortcut
• @PathVariable (not @PathParam)
• ResponseEntity gives full control over status + headers
• Jackson handles serialization (not JSONB)`,
    tags: ['spring-mvc', 'rest', 'controller']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Error Handling',
    question: 'How do you handle exceptions globally in a Spring Boot REST API?',
    options: [
      { label: 'A) try/catch in every controller method', description: 'Each endpoint catches its own exceptions and returns appropriate status.' },
      { label: 'B) @RestControllerAdvice with @ExceptionHandler methods', description: 'Centralized exception-to-response mapping in one class.' },
      { label: 'C) Custom Filter that catches all exceptions', description: 'Servlet filter wraps all requests in try/catch.' }
    ],
    bestOption: 1,
    explanation: `@RestControllerAdvice is Spring's recommended pattern:

\`\`\`java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DeliveryNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(DeliveryNotFoundException e) {
        return new ErrorResponse("NOT_FOUND", e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException e) {
        var errors = e.getBindingResult().getFieldErrors().stream()
            .map(f -> f.getField() + ": " + f.getDefaultMessage())
            .toList();
        return new ErrorResponse("VALIDATION_FAILED", errors);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleUnexpected(Exception e) {
        log.error("Unexpected error", e);
        return new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred");
    }
}
\`\`\`

Same concept as JAX-RS ExceptionMapper<T>, different API.`,
    tags: ['error-handling', 'controller-advice', 'spring']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Bean Validation',
    question: 'How do you validate incoming DTOs in Spring Boot? Compare with Java EE.',
    modelAnswer: `Same Bean Validation (Hibernate Validator) in both — just different triggering:

**Java EE**: @Valid on JAX-RS parameter, ExceptionMapper for ConstraintViolationException
**Spring**: @Valid on @RequestBody, @RestControllerAdvice for MethodArgumentNotValidException

\`\`\`java
// DTO with validation
public record CreateDeliveryRequest(
    @NotBlank String driverId,
    @NotNull @Future LocalDateTime scheduledAt,
    @Size(min = 1, max = 50) @Valid List<StopRequest> stops
) {}

// Controller uses @Valid
@PostMapping
public ResponseEntity<DeliveryDTO> create(@Valid @RequestBody CreateDeliveryRequest req) {
    Delivery d = service.create(req);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}").buildAndExpand(d.getId()).toUri();
    return ResponseEntity.created(location).body(toDTO(d));
}
\`\`\`

The annotations (@NotBlank, @Size, @Future) are IDENTICAL — same javax.validation / jakarta.validation package.`,
    tags: ['validation', 'bean-validation', 'dto']
  },
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'BASIC',
    subtopic: 'Dependency Injection',
    mission: 'What happens when Spring Boot starts this application?',
    code: `@SpringBootApplication
public class DeliveryApp {
    public static void main(String[] args) {
        SpringApplication.run(DeliveryApp.class, args);
    }
}

@Service
public class DeliveryService {
    public DeliveryService() {
        System.out.println("Service created");
    }
}

@RestController
public class DeliveryController {
    private final DeliveryService service;

    public DeliveryController(DeliveryService service) {
        System.out.println("Controller created");
        this.service = service;
    }
}`,
    choices: ['Service created\\nController created', 'Controller created\\nService created', 'Nothing prints (lazy initialization)', 'Exception: circular dependency'],
    answer: 'Service created\\nController created',
    explain: 'Spring creates beans in dependency order. Controller depends on Service, so Service is created first. Both are singletons by default — created at startup (eager initialization).'
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Testing Strategy',
    question: 'Explain the testing pyramid in Spring Boot. What types of tests do you write and when?',
    modelAnswer: `**Testing pyramid (bottom to top):**

**1. Unit tests (80% — fastest, most numerous):**
\`\`\`java
@ExtendWith(MockitoExtension.class)
class DeliveryServiceTest {
    @Mock DeliveryRepository repo;
    @InjectMocks DeliveryService service;

    @Test
    void shouldRejectPastSchedule() {
        var req = new CreateDeliveryRequest("d1", LocalDateTime.now().minusDays(1), stops);
        assertThrows(InvalidScheduleException.class, () -> service.create(req));
    }
}
\`\`\`
No Spring context. Milliseconds to run. Tests business logic in isolation.

**2. Slice tests (15% — targeted context):**
\`\`\`java
@WebMvcTest(DeliveryController.class) // only web layer
@DataJpaTest // only JPA layer + embedded DB
\`\`\`
Partial Spring context. Tests serialization, queries, config.

**3. Integration tests (5% — full flow):**
\`\`\`java
@SpringBootTest
@Testcontainers
class DeliveryIntegrationTest { ... }
\`\`\`
Full app + real DB (Testcontainers). Slow. Only critical paths.

**Same pyramid as Java EE** — only the tools differ (Arquillian → @SpringBootTest).`,
    tags: ['testing', 'unit-test', 'integration-test']
  },
  {
    type: 'CODE_REFACTOR',
    difficulty: 'INTER',
    subtopic: 'Controller Design',
    question: 'What problems do you see in this controller?',
    code: `@RestController
public class DeliveryController {

    @Autowired
    private DeliveryRepository repo;

    @Autowired
    private EntityManager em;

    @GetMapping("/deliveries")
    public List<Delivery> getAll() {
        return repo.findAll();
    }

    @PostMapping("/deliveries")
    public Delivery create(@RequestBody Map<String, Object> body) {
        Delivery d = new Delivery();
        d.setDriverId((String) body.get("driverId"));
        d.setScheduledAt(LocalDateTime.parse((String) body.get("scheduledAt")));
        em.persist(d);
        return d;
    }
}`,
    problems: [
      'Controller depends directly on Repository and EntityManager — bypasses service layer',
      'No validation on input (Map<String, Object> loses type safety)',
      'Returns JPA Entity directly — exposes internal structure to API consumers',
      'No proper status codes (POST should return 201, not 200)',
      'Field injection (@Autowired) — harder to test than constructor injection',
      'findAll() without pagination — can return millions of rows'
    ],
    refactored: `@RestController
@RequestMapping("/api/v1/deliveries")
public class DeliveryController {

    private final DeliveryService service;

    public DeliveryController(DeliveryService service) {
        this.service = service;
    }

    @GetMapping
    public Page<DeliveryDTO> findAll(Pageable pageable) {
        return service.findAll(pageable);
    }

    @PostMapping
    public ResponseEntity<DeliveryDTO> create(@Valid @RequestBody CreateDeliveryRequest req) {
        DeliveryDTO dto = service.create(req);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(dto.id()).toUri();
        return ResponseEntity.created(location).body(dto);
    }
}`,
    tags: ['refactoring', 'clean-code', 'layering']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Profiles & Configuration',
    question: 'How do you manage different configurations for dev, staging, and production in Spring Boot?',
    modelAnswer: `**Spring Profiles + application-{profile}.yml:**

\`\`\`yaml
# application.yml (base — always loaded)
spring.application.name: delivery-service
delivery.max-retries: 3

# application-dev.yml
spring.datasource.url: jdbc:postgresql://localhost:5432/delivery
spring.kafka.bootstrap-servers: localhost:9092
logging.level.root: DEBUG

# application-prod.yml
spring.datasource.url: jdbc:postgresql://prod-rds:5432/delivery
spring.kafka.bootstrap-servers: kafka-prod-1:9092,kafka-prod-2:9092
logging.level.root: WARN
\`\`\`

**Activation:**
\`\`\`bash
# In Kubernetes (environment variable)
SPRING_PROFILES_ACTIVE=prod

# JVM argument
java -jar app.jar --spring.profiles.active=prod
\`\`\`

**Type-safe config (preferred over @Value):**
\`\`\`java
@ConfigurationProperties(prefix = "delivery")
public record DeliveryProperties(int maxRetries, Duration timeout) {}
\`\`\`

**Java EE equivalent**: MicroProfile Config with ConfigSources. Same idea, less structured.`,
    tags: ['profiles', 'configuration', 'yml']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Security',
    question: 'How do you secure a Spring Boot REST API? Authentication + Authorization.',
    modelAnswer: `**Spring Security + JWT (common pattern):**

\`\`\`java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())  // stateless API
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/deliveries/**").hasRole("READER")
                .requestMatchers(HttpMethod.POST, "/api/v1/deliveries/**").hasRole("WRITER")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
            .build();
    }
}
\`\`\`

**Layers:**
1. **Authentication**: JWT token validated by Spring Security (from OAuth2 provider or API gateway)
2. **Authorization** (coarse): @PreAuthorize or SecurityFilterChain rules for endpoint access
3. **Authorization** (fine): Business layer checks resource ownership ("is this MY delivery?")

**Java EE equivalent**: Apache Shiro / container-managed security. Same concepts, different API.`,
    tags: ['security', 'jwt', 'oauth2']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Actuator',
    question: 'Your delivery-service runs in Kubernetes. How do you configure health checks?',
    options: [
      { label: 'A) Custom /health endpoint in a controller', description: 'Write a @GetMapping("/health") that returns 200 if app is running.' },
      { label: 'B) Spring Boot Actuator with liveness and readiness probes', description: 'Enable actuator health groups and configure K8s probes to use them.' },
      { label: 'C) Kubernetes exec probe that calls a shell script inside the container', description: 'K8s runs a command inside the pod to check app status.' }
    ],
    bestOption: 1,
    explanation: `Spring Boot Actuator provides ready-made, production-grade health:

\`\`\`yaml
# application.yml
management:
  endpoints.web.exposure.include: health,info,prometheus
  endpoint.health:
    show-details: when-authorized
    probes.enabled: true  # enables /health/liveness and /health/readiness
  health:
    db.enabled: true
    kafka.enabled: true
\`\`\`

\`\`\`yaml
# Kubernetes deployment
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 30
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 10
\`\`\`

**Liveness**: Is the app alive? (restart if dead)
**Readiness**: Can it accept traffic? (remove from load balancer if not ready)

Custom health indicators for critical dependencies (Kafka, external APIs).`,
    tags: ['actuator', 'kubernetes', 'health-checks']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Spring Data Queries',
    question: 'How do you write custom queries in Spring Data JPA? Compare method naming, @Query, and native SQL.',
    modelAnswer: `**Three approaches (use simplest that works):**

**1. Method name derivation (simple queries):**
\`\`\`java
List<Delivery> findByStatusAndDriverId(DeliveryStatus status, Long driverId);
List<Delivery> findByScheduledAtAfterOrderByScheduledAtAsc(LocalDateTime after);
Optional<Delivery> findFirstByDriverIdAndStatus(Long driverId, DeliveryStatus status);
\`\`\`
Spring generates the query from the method name. Great for simple filters.

**2. @Query with JPQL (medium complexity):**
\`\`\`java
@Query("SELECT d FROM Delivery d JOIN FETCH d.stops WHERE d.route.id = :routeId AND d.status = 'PLANNED'")
List<Delivery> findPlannedForRoute(@Param("routeId") Long routeId);
\`\`\`
When method names become too long or you need JOINs/aggregations.

**3. Native SQL (complex/PostgreSQL-specific):**
\`\`\`java
@Query(value = "SELECT d.* FROM delivery d WHERE d.status = 'ACTIVE' AND ST_DWithin(d.location, ST_MakePoint(:lng, :lat), :radius)", nativeQuery = true)
List<Delivery> findNearby(@Param("lat") double lat, @Param("lng") double lng, @Param("radius") double radius);
\`\`\`
When you need DB-specific features (PostGIS, window functions, CTEs).

**Rule**: Start with method names. Use @Query when names get unwieldy. Use native only for DB-specific features.`,
    tags: ['spring-data', 'jpql', 'queries']
  },
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'INTER',
    subtopic: 'Transaction Propagation',
    mission: 'What happens when <code>outer()</code> is called?',
    code: `@Service
public class DeliveryService {

    @Transactional
    public void outer() {
        repo.save(new Delivery("D-1"));
        try {
            inner();
        } catch (RuntimeException e) {
            System.out.println("Caught: " + e.getMessage());
        }
        repo.save(new Delivery("D-2"));
    }

    @Transactional
    public void inner() {
        repo.save(new Delivery("D-INNER"));
        throw new RuntimeException("Fail!");
    }
}`,
    choices: ['D-1 and D-2 saved, D-INNER rolled back', 'ALL rolled back (D-1, D-2, D-INNER)', 'D-1, D-2, D-INNER all saved', 'Only D-2 and D-INNER saved'],
    answer: 'ALL rolled back (D-1, D-2, D-INNER)',
    explain: 'Self-invocation: inner() is called from the same class, so the @Transactional proxy is NOT applied. Both methods run in the SAME transaction. When inner() throws, the TX is marked for rollback. Even though outer() catches the exception, the TX is already doomed — commit attempt will throw UnexpectedRollbackException. Fix: inject a separate bean or use TransactionTemplate.'
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Reactive vs Servlet',
    question: 'Spring offers both Spring MVC (servlet, blocking) and Spring WebFlux (reactive, non-blocking). When would you choose each?',
    modelAnswer: `**Spring MVC (servlet stack) — choose when:**
- Traditional request/response APIs (90% of use cases)
- Team knows blocking/imperative programming
- Using JPA/Hibernate (blocking by nature)
- Simple mental model, easier debugging
- REWE transport service: this is the right choice

**Spring WebFlux (reactive) — choose when:**
- High concurrency with many waiting connections (chat, streaming)
- Non-blocking I/O end-to-end (reactive DB drivers like R2DBC)
- Streaming responses (SSE, WebSocket heavy)
- Gateways/proxies that mostly wait for backends

**Why NOT WebFlux for REWE transport:**
- JPA is blocking → mixing reactive HTTP with blocking DB negates benefits
- Team learning curve (Mono/Flux are hard to debug)
- Most endpoints are CRUD → servlet model is simpler
- 1000 req/s is easily handled by servlet + thread pool

**Honest answer**: "For REWE's delivery-service, Spring MVC is the pragmatic choice. The service uses JPA (blocking), team productivity matters, and the load doesn't justify reactive complexity. I'd use WebFlux only for specific use cases like the real-time tracking endpoint (WebSocket/SSE)."`,
    tags: ['webflux', 'reactive', 'architecture-decision']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Logging & Observability',
    question: 'How do you structure logging in a Spring Boot microservice?',
    modelAnswer: `**Structured logging with correlation:**

\`\`\`java
// MDC for correlation ID (propagated across services)
@Component
public class CorrelationFilter implements Filter {
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
        String correlationId = ((HttpServletRequest) req).getHeader("X-Correlation-Id");
        if (correlationId == null) correlationId = UUID.randomUUID().toString();
        MDC.put("correlationId", correlationId);
        try { chain.doFilter(req, res); }
        finally { MDC.clear(); }
    }
}

// Usage in service (SLF4J)
log.info("Delivery dispatched. deliveryId={}, driverId={}", delivery.getId(), driverId);
log.warn("External service timeout. service=routeOptimizer, durationMs={}", duration);
log.error("Failed to create invoice. deliveryId={}", deliveryId, exception);
\`\`\`

\`\`\`yaml
# application.yml — JSON format for Kibana/ELK
logging:
  pattern.console: '{"time":"%d","level":"%p","correlationId":"%X{correlationId}","msg":"%m"}%n'
\`\`\`

**Rules:**
- Always include business context (deliveryId, driverId)
- Never log sensitive data (tokens, passwords, PII)
- INFO for business events, WARN for retries/degradation, ERROR for failures
- Use structured format (JSON) in production for parsing`,
    tags: ['logging', 'mdc', 'observability']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    subtopic: 'Async Processing',
    question: 'A delivery creation needs to: (1) validate, (2) persist, (3) optimize route, (4) notify driver. Route optimization takes 3-5 seconds. What do you do?',
    options: [
      { label: 'A) All synchronous — user waits 5 seconds for full response', description: 'Complete everything before responding to the client.' },
      { label: 'B) Sync for 1+2, then publish event for 3+4 (respond immediately after persist)', description: 'Return 201 after validation + persist. Route + notification happen async via Kafka.' },
      { label: 'C) All async — accept request, return 202, process everything in background', description: 'Immediately return 202 Accepted. Client polls for status.' }
    ],
    bestOption: 1,
    explanation: `Option B is the right balance:

**Sync (must complete before response):**
- Validation: client needs immediate feedback if invalid
- Persist: client needs the delivery ID in the response
- These take <50ms total

**Async (happen after response):**
- Route optimization: 3-5s, client doesn't need it immediately
- Driver notification: non-critical, can retry if fails

**Implementation:**
\`\`\`java
@PostMapping
public ResponseEntity<DeliveryDTO> create(@Valid @RequestBody CreateDeliveryRequest req) {
    Delivery d = service.validateAndPersist(req);  // sync: fast
    eventPublisher.publish(new DeliveryCreated(d));  // triggers async route + notification
    return ResponseEntity.created(uri).body(toDTO(d));  // respond immediately
}
\`\`\`

Client gets 201 in <100ms. Route appears when consumer processes it. Client can poll GET /deliveries/{id}/route to check.`,
    tags: ['async', 'event-driven', 'user-experience']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'BASIC',
    subtopic: 'Spring Boot Auto-configuration',
    question: 'What does @SpringBootApplication do? How does auto-configuration work?',
    modelAnswer: `@SpringBootApplication is a shortcut for three annotations:

\`\`\`java
@SpringBootConfiguration  // marks as config class (like @Configuration)
@EnableAutoConfiguration  // the magic — configures based on classpath
@ComponentScan            // scans current package + sub-packages for @Component, @Service, etc.
\`\`\`

**Auto-configuration process:**
1. Spring Boot scans META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
2. Each auto-config class has @Conditional annotations:
   - @ConditionalOnClass(DataSource.class) → "if JDBC driver is on classpath"
   - @ConditionalOnMissingBean(DataSource.class) → "if user didn't define their own"
3. If conditions met → configure with sensible defaults

**Example:**
- You add spring-boot-starter-data-jpa to pom.xml
- Hibernate is on classpath → @ConditionalOnClass passes
- No custom EntityManagerFactory defined → auto-creates one
- Reads spring.datasource.url from application.yml → configures connection

**Override**: define your own @Bean of the same type → auto-config backs off.

**Java EE equivalent**: Application server provides everything (datasource via JNDI, JPA via server config). Spring Boot does the same but in code/yml.`,
    tags: ['auto-configuration', 'spring-boot', 'basics']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Testing with MockMvc',
    question: 'Show how you test a REST controller without starting the full application.',
    modelAnswer: `**@WebMvcTest — loads only the web layer:**

\`\`\`java
@WebMvcTest(DeliveryController.class)
class DeliveryControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private DeliveryService service;  // mock the dependency

    @Test
    void shouldReturnDelivery() throws Exception {
        var dto = new DeliveryDTO(1L, "D-42", DeliveryStatus.PLANNED);
        when(service.findById(1L)).thenReturn(dto);

        mvc.perform(get("/api/v1/deliveries/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.driverId").value("D-42"))
            .andExpect(jsonPath("$.status").value("PLANNED"));
    }

    @Test
    void shouldReturn404WhenNotFound() throws Exception {
        when(service.findById(99L)).thenThrow(new DeliveryNotFoundException(99L));

        mvc.perform(get("/api/v1/deliveries/99"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void shouldValidateInput() throws Exception {
        mvc.perform(post("/api/v1/deliveries")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\\"driverId\\": \\"\\"}"))  // blank driver
            .andExpect(status().isBadRequest());
    }
}
\`\`\`

**What this tests:** serialization, status codes, validation, error handling — WITHOUT starting the full app or DB.`,
    tags: ['testing', 'mockmvc', 'web-layer']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Testcontainers',
    question: 'How do you test repository queries against a real PostgreSQL database in CI?',
    modelAnswer: `**Testcontainers — real DB in Docker, spun up per test class:**

\`\`\`java
@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = NONE)  // don't use H2!
class DeliveryRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("testdb");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private DeliveryRepository repo;

    @Test
    void shouldFindActiveDeliveriesForDriver() {
        // Arrange
        repo.save(new Delivery("D-42", ACTIVE, LocalDateTime.now()));
        repo.save(new Delivery("D-42", COMPLETED, LocalDateTime.now().minusDays(1)));
        repo.save(new Delivery("D-99", ACTIVE, LocalDateTime.now()));

        // Act
        var result = repo.findByDriverIdAndStatus("D-42", ACTIVE);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDriverId()).isEqualTo("D-42");
    }
}
\`\`\`

**Why not H2:**
- Doesn't support PostgreSQL-specific features (JSONB, DISTINCT ON, schemas)
- Query behavior may differ (collation, date handling)
- False sense of security — "works on H2" doesn't mean "works on Postgres"

**In CI**: Docker-in-Docker or Testcontainers Cloud. Adds ~5s startup per test class.`,
    tags: ['testcontainers', 'repository-test', 'postgresql']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Flyway Migrations',
    question: 'How do you manage database schema changes in Spring Boot?',
    modelAnswer: `**Flyway (integrated with Spring Boot):**

\`\`\`
src/main/resources/db/migration/
├── V1__create_delivery_table.sql
├── V2__add_driver_id_column.sql
├── V3__create_delivery_event_table.sql
└── V4__add_index_on_status.sql
\`\`\`

\`\`\`sql
-- V1__create_delivery_table.sql
CREATE TABLE delivery (
    id BIGSERIAL PRIMARY KEY,
    driver_id VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    scheduled_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
\`\`\`

**Rules:**
- Never modify a migration after it's been applied (append-only)
- Migrations must be backward-compatible with running code (for rolling deploys)
- Breaking changes: two-step (V4: add new column, V5 next sprint: drop old)
- Naming: V{number}__{description}.sql

**Spring Boot auto-runs** migrations on startup (before app serves traffic). Flyway tracks which have been applied in a flyway_schema_history table.

**Java EE equivalent**: Manual SQL scripts run by DBA, or Liquibase with JBoss module. Same concept, less automation.`,
    tags: ['flyway', 'migrations', 'database']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Docker & Deployment',
    question: 'How do you containerize a Spring Boot application?',
    modelAnswer: `**Multi-stage Dockerfile (production-ready):**

\`\`\`dockerfile
# Stage 1: Build
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw package -DskipTests

# Stage 2: Run (smaller image)
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/delivery-service-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
\`\`\`

**Or use Spring Boot's built-in buildpacks:**
\`\`\`bash
./mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=delivery-service:latest
\`\`\`
No Dockerfile needed — Cloud Native Buildpacks create an optimized layered image.

**Java EE comparison:**
- Java EE: WAR deployed to WildFly (app server is separate infrastructure)
- Spring Boot: FAT JAR with embedded Tomcat (single artifact, self-contained)
- Advantage: simpler deployment, predictable behavior, no app server config drift`,
    tags: ['docker', 'deployment', 'containerization']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Performance & Caching',
    question: 'How do you implement caching in Spring Boot? Compare with Java EE approach.',
    modelAnswer: `**Spring Cache abstraction:**

\`\`\`java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("routes", "drivers");
        // Or RedisCacheManager for distributed cache
    }
}

@Service
public class RouteService {

    @Cacheable(value = "routes", key = "#routeId")
    public RouteDTO findById(Long routeId) {
        // Called only on cache miss
        return repo.findById(routeId).map(this::toDTO).orElseThrow();
    }

    @CacheEvict(value = "routes", key = "#routeId")
    public void update(Long routeId, UpdateRouteRequest req) {
        // Cache entry removed after update
    }

    @CacheEvict(value = "routes", allEntries = true)
    @Scheduled(fixedRate = 3600000) // every hour
    public void evictAll() {} // safety net TTL
}
\`\`\`

**Java EE equivalent**: Manual ConcurrentHashMap with TTL, or Infinispan @Cacheable. Same concept.

**When to cache:**
- Read frequently, changes rarely (route templates, driver profiles)
- Expensive to compute (price calculations, ETA with traffic)
- External service results (to reduce calls)

**When NOT to cache:**
- Rapidly changing data (current delivery status)
- User-specific data with many variations
- Data that MUST be real-time consistent`,
    tags: ['caching', 'spring-cache', 'redis']
  }
];
