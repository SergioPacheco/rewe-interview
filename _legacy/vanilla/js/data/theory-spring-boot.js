/**
 * Theory Content — Spring Boot (Java EE → Spring Transition)
 * Focus: What a Java EE developer needs to know
 */
const theorySpringBoot = [
  {
    id: 'theory-spring-overview',
    title: 'Spring Boot — Why It Exists & How It Relates to Java EE',
    sections: [
      {
        heading: 'Spring Boot vs Java EE — same concepts, different names',
        content: `If you know Java EE/Jakarta EE, you already understand 80% of Spring Boot. The concepts are the same — the APIs and annotations differ.

<table>
<tr><th>Concept</th><th>Java EE / Jakarta EE</th><th>Spring Boot</th></tr>
<tr><td>DI Container</td><td>CDI (Weld)</td><td>Spring IoC (ApplicationContext)</td></tr>
<tr><td>Inject dependency</td><td><code>@Inject</code></td><td><code>@Autowired</code> (or constructor)</td></tr>
<tr><td>Define bean</td><td><code>@Stateless</code>, <code>@ApplicationScoped</code></td><td><code>@Service</code>, <code>@Component</code></td></tr>
<tr><td>Transaction management</td><td>CMT (Container Managed)</td><td><code>@Transactional</code></td></tr>
<tr><td>REST endpoints</td><td>JAX-RS (<code>@Path</code>, <code>@GET</code>)</td><td>Spring MVC (<code>@RestController</code>, <code>@GetMapping</code>)</td></tr>
<tr><td>Persistence</td><td>JPA + Hibernate (same!)</td><td>Spring Data JPA (wraps same JPA)</td></tr>
<tr><td>Messaging</td><td>JMS + MDB (<code>@MessageDriven</code>)</td><td>Spring Kafka / <code>@JmsListener</code></td></tr>
<tr><td>Configuration</td><td>MicroProfile Config</td><td><code>application.yml</code> + <code>@Value</code></td></tr>
<tr><td>App Server</td><td>WildFly, Payara, TomEE</td><td>Embedded Tomcat (no external server)</td></tr>
<tr><td>Deployment</td><td>WAR → app server</td><td>Fat JAR (self-contained)</td></tr>
</table>

<strong>Key insight for interview:</strong> "I have 5+ years in Java EE with CDI, JPA, JMS. Spring Boot uses the same patterns with different annotations. My DI/transaction/messaging skills transfer directly — I just need to learn the Spring-specific API surface."`
      },
      {
        heading: 'What Spring Boot adds over Spring Framework',
        content: `Spring Boot = Spring Framework + opinions + embedded server + auto-configuration.

<strong>Spring Framework alone:</strong>
• You configure EVERYTHING manually (XML or Java config)
• You choose and configure the web server
• You wire up persistence, security, messaging by hand
• Hundreds of decisions before writing business code

<strong>Spring Boot:</strong>
• <strong>Auto-configuration:</strong> detects libraries on classpath and configures them
• <strong>Starters:</strong> curated dependency sets (spring-boot-starter-web, -data-jpa, -kafka)
• <strong>Embedded server:</strong> Tomcat included, no external deployment
• <strong>Opinionated defaults:</strong> works out of the box, customize when needed
• <strong>Fat JAR:</strong> single artifact to deploy anywhere

<pre><code>// This is ALL you need to start a Spring Boot app:
@SpringBootApplication  // = @Configuration + @EnableAutoConfiguration + @ComponentScan
public class DeliveryApplication {
    public static void main(String[] args) {
        SpringApplication.run(DeliveryApplication.class, args);
    }
}
// Add spring-boot-starter-web → you have a REST API
// Add spring-boot-starter-data-jpa → you have JPA configured
// Add spring-boot-starter-kafka → you have Kafka configured</code></pre>`
      }
    ]
  },
  {
    id: 'theory-spring-di',
    title: 'Dependency Injection — CDI vs Spring',
    sections: [
      {
        heading: 'CDI (@Inject) vs Spring (Constructor Injection)',
        content: `<strong>Java EE (CDI) — field injection standard:</strong>
<pre><code>@Stateless
public class DeliveryBusiness {
    @Inject private DeliveryRepository repository;
    @Inject private EventPublisher events;

    public Delivery plan(DeliveryRequest req) {
        Delivery d = Delivery.from(req);
        repository.persist(d);
        events.publish(new DeliveryPlanned(d));
        return d;
    }
}</code></pre>

<strong>Spring Boot — constructor injection preferred:</strong>
<pre><code>@Service
public class DeliveryService {

    private final DeliveryRepository repository;
    private final LogisticsEventPublisher events;

    // Constructor injection — immutable, testable, no reflection
    public DeliveryService(DeliveryRepository repository,
                           LogisticsEventPublisher events) {
        this.repository = repository;
        this.events = events;
    }

    public Delivery plan(DeliveryRequest req) {
        Delivery d = Delivery.from(req);
        repository.save(d);
        events.publishDeliveryPlanned(d);
        return d;
    }
}</code></pre>

<strong>Why constructor injection wins:</strong>
• Fields are <code>final</code> → immutable after construction → thread-safe
• No reflection magic — plain Java constructor
• Fails FAST at startup if dependency missing (not at runtime NPE)
• Easy to test: <code>new DeliveryService(mockRepo, mockEvents)</code>
• If constructor gets too big → signal to split the class (SRP feedback)`
      },
      {
        heading: 'Bean Scopes — CDI vs Spring',
        content: `<table>
<tr><th>Purpose</th><th>CDI Scope</th><th>Spring Scope</th></tr>
<tr><td>One instance per app</td><td><code>@ApplicationScoped</code></td><td><code>@Scope("singleton")</code> — DEFAULT</td></tr>
<tr><td>New per HTTP request</td><td><code>@RequestScoped</code></td><td><code>@RequestScope</code></td></tr>
<tr><td>Per HTTP session</td><td><code>@SessionScoped</code></td><td><code>@SessionScope</code></td></tr>
<tr><td>New per injection</td><td><code>@Dependent</code></td><td><code>@Scope("prototype")</code></td></tr>
<tr><td>EJB pooled</td><td><code>@Stateless</code></td><td>No equivalent (singleton is enough)</td></tr>
<tr><td>JSF view lifetime</td><td><code>@ViewScoped</code></td><td>No equivalent (use session or cache)</td></tr>
</table>

<strong>Key difference:</strong> Spring default is SINGLETON (one instance shared). CDI default depends on the annotation used. In Spring, 95% of beans are singletons — you rarely need other scopes.

<strong>Interview answer:</strong> "In Java EE, @Stateless gives you pooling and CMT. In Spring, @Service is singleton by default with @Transactional for transaction boundaries. Same result, different mechanism."`
      },
      {
        heading: 'Spring stereotypes',
        content: `<pre><code>@Component    // generic Spring-managed bean
@Service      // business logic (same as @Component semantically)
@Repository   // data access (adds exception translation)
@Controller   // web controller (returns views)
@RestController  // REST endpoints (= @Controller + @ResponseBody)
@Configuration   // defines @Bean factory methods</code></pre>

<strong>All are @Component under the hood.</strong> The distinction is semantic (self-documenting code) and enables targeted AOP.

<pre><code>// Configuration class = replaces XML wiring
@Configuration
public class KafkaConfig {

    @Bean  // explicitly creates and configures a bean
    public KafkaTemplate&lt;String, LogisticsEvent&gt; kafkaTemplate(
            ProducerFactory&lt;String, LogisticsEvent&gt; factory) {
        return new KafkaTemplate<>(factory);
    }
}</code></pre>`
      }
    ]
  },
  {
    id: 'theory-spring-data',
    title: 'Spring Data JPA — Repository Magic',
    sections: [
      {
        heading: 'From EntityManager to Spring Data',
        content: `<strong>Java EE — manual repository:</strong>
<pre><code>@Stateless
public class DeliveryRepository {
    @PersistenceContext
    private EntityManager em;

    public Delivery findById(Long id) {
        return em.find(Delivery.class, id);
    }

    public List&lt;Delivery&gt; findByStatus(DeliveryStatus status) {
        return em.createQuery(
            "SELECT d FROM Delivery d WHERE d.status = :status", Delivery.class)
            .setParameter("status", status)
            .getResultList();
    }

    public void save(Delivery d) { em.persist(d); }
}</code></pre>

<strong>Spring Data JPA — interface only:</strong>
<pre><code>public interface DeliveryRepository extends JpaRepository&lt;Delivery, Long&gt; {

    // Method name → query (auto-generated!)
    List&lt;Delivery&gt; findByStatus(DeliveryStatus status);

    List&lt;Delivery&gt; findByDriverIdAndStatusIn(Long driverId, List&lt;DeliveryStatus&gt; statuses);

    @Query("SELECT d FROM Delivery d WHERE d.route.id = :routeId AND d.status = 'PLANNED'")
    List&lt;Delivery&gt; findPlannedForRoute(@Param("routeId") Long routeId);

    // save(), findById(), deleteById(), findAll() — all inherited!
}</code></pre>

<strong>How it works:</strong> Spring creates the implementation at runtime by parsing method names. <code>findByStatusAndDriverId</code> → <code>WHERE status = ? AND driverId = ?</code>.

<strong>Interview tip:</strong> "Spring Data eliminates boilerplate repositories. For complex queries, I still use @Query with JPQL or native SQL. The same JPA/Hibernate I've used for years runs underneath."`
      },
      {
        heading: 'Transactions — CMT vs @Transactional',
        content: `<strong>Java EE — Container Managed Transactions (CMT):</strong>
<pre><code>@Stateless  // Every public method is transactional by default!
public class DeliveryBusiness {
    // Transaction starts when method is called
    // Commits on success, rolls back on RuntimeException
    public Delivery plan(DeliveryRequest req) { ... }
}</code></pre>

<strong>Spring — explicit @Transactional:</strong>
<pre><code>@Service
public class DeliveryService {

    @Transactional  // must declare explicitly
    public Delivery plan(DeliveryRequest req) {
        Delivery d = Delivery.from(req);
        repository.save(d);
        events.publishDeliveryPlanned(d);
        return d;
    }

    @Transactional(readOnly = true)  // optimization for reads
    public Delivery findById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new DeliveryNotFoundException(id));
    }
}</code></pre>

<strong>Key differences:</strong>
• Java EE: implicit (every EJB method is transactional by default)
• Spring: explicit (must add @Transactional where needed)
• Both: rollback on unchecked exceptions by default
• Spring extra: <code>readOnly = true</code> for Hibernate flush optimization
• Spring extra: <code>propagation</code> controls nested TX behavior

<strong>Same proxy pattern underneath!</strong> Both use AOP proxies — method calls on <code>this</code> bypass the proxy (self-invocation trap exists in both).`
      }
    ]
  },
  {
    id: 'theory-spring-rest',
    title: 'REST Controllers — JAX-RS vs Spring MVC',
    sections: [
      {
        heading: 'Endpoint comparison',
        content: `<strong>JAX-RS (Java EE):</strong>
<pre><code>@Path("/deliveries")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DeliveryEndpoint {

    @Inject private DeliveryService service;

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(service.findById(id)).build();
    }

    @POST
    public Response create(@Valid DeliveryRequest req) {
        Delivery d = service.plan(req);
        URI location = UriBuilder.fromResource(DeliveryEndpoint.class)
            .path(d.getId().toString()).build();
        return Response.created(location).entity(d).build();
    }
}</code></pre>

<strong>Spring MVC:</strong>
<pre><code>@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService service;

    @GetMapping("/{id}")
    public ResponseEntity&lt;DeliveryDTO&gt; findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity&lt;DeliveryDTO&gt; create(@Valid @RequestBody DeliveryRequest req) {
        Delivery d = service.plan(req);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(d.getId()).toUri();
        return ResponseEntity.created(location).body(toDTO(d));
    }

    @ExceptionHandler(DeliveryNotFoundException.class)
    public ResponseEntity&lt;ErrorResponse&gt; handleNotFound(DeliveryNotFoundException e) {
        return ResponseEntity.status(404).body(new ErrorResponse(e.getMessage()));
    }
}</code></pre>

<strong>Mapping:</strong>
<code>@Path</code> → <code>@RequestMapping</code> / <code>@GetMapping</code>
<code>@PathParam</code> → <code>@PathVariable</code>
<code>@QueryParam</code> → <code>@RequestParam</code>
<code>Response.ok()</code> → <code>ResponseEntity.ok()</code>
ExceptionMapper → <code>@ExceptionHandler</code> or <code>@ControllerAdvice</code>`
      },
      {
        heading: 'Validation, Error handling, DTOs',
        content: `Same Bean Validation (Hibernate Validator) in both:
<pre><code>public record DeliveryRequest(
    @NotBlank String driverId,
    @NotNull @Future LocalDateTime scheduledAt,
    @Size(min = 1, max = 50) List&lt;StopRequest&gt; stops
) {}</code></pre>

<strong>Global error handling in Spring:</strong>
<pre><code>@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DeliveryNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(DeliveryNotFoundException e) {
        return new ErrorResponse("DELIVERY_NOT_FOUND", e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException e) {
        List&lt;String&gt; errors = e.getBindingResult().getFieldErrors().stream()
            .map(f -> f.getField() + ": " + f.getDefaultMessage())
            .toList();
        return new ErrorResponse("VALIDATION_FAILED", errors);
    }
}</code></pre>

<strong>Java EE equivalent:</strong> <code>ExceptionMapper&lt;T&gt;</code> registered globally.
<strong>Same pattern:</strong> centralized error translation, consistent API response format.`
      }
    ]
  },
  {
    id: 'theory-spring-config',
    title: 'Configuration & Profiles',
    sections: [
      {
        heading: 'application.yml and @ConfigurationProperties',
        content: `<strong>Java EE — MicroProfile Config:</strong>
<pre><code>// microprofile-config.properties
delivery.max.retries=3
delivery.timeout.ms=5000

@Inject @ConfigProperty(name = "delivery.max.retries")
private int maxRetries;</code></pre>

<strong>Spring Boot — application.yml + type-safe config:</strong>
<pre><code># application.yml
delivery:
  max-retries: 3
  timeout-ms: 5000
  kafka:
    topic: delivery-events
    consumer-group: trab-delivery-service</code></pre>

<pre><code>// Type-safe configuration (preferred over @Value)
@ConfigurationProperties(prefix = "delivery")
public record DeliveryProperties(
    int maxRetries,
    int timeoutMs,
    KafkaProperties kafka
) {
    public record KafkaProperties(String topic, String consumerGroup) {}
}</code></pre>

<strong>Advantages over MicroProfile Config:</strong>
• Type-safe binding (not just strings)
• Nested objects, lists, maps
• Validation with @Validated
• IDE auto-completion
• Clear documentation via metadata`
      },
      {
        heading: 'Profiles — environment-specific config',
        content: `<pre><code># application.yml (base — always loaded)
spring:
  application:
    name: delivery-service

# application-dev.yml (loaded when profile=dev)
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/delivery
  kafka:
    bootstrap-servers: localhost:9092

# application-prod.yml (loaded when profile=prod)
spring:
  datasource:
    url: jdbc:postgresql://prod-cluster:5432/delivery
  kafka:
    bootstrap-servers: kafka-prod:9092</code></pre>

<strong>Activation:</strong>
<pre><code># Environment variable (typical in Kubernetes)
SPRING_PROFILES_ACTIVE=prod

# JVM argument
java -jar app.jar --spring.profiles.active=prod

# Programmatic
@Profile("dev")
@Configuration
public class DevOnlyConfig { ... }</code></pre>

<strong>Java EE equivalent:</strong> System properties + ConfigSource priority (less structured).

<strong>REWE scenario:</strong> Profile per environment (dev, staging, prod) + per region if needed. Kafka topics, DB URLs, feature flags all vary by profile.`
      }
    ]
  },
  {
    id: 'theory-spring-testing',
    title: 'Testing in Spring Boot',
    sections: [
      {
        heading: 'Test slices and @MockBean',
        content: `Spring Boot testing is layered — test only what you need:

<pre><code>// Unit test — no Spring context (fastest, preferred)
@ExtendWith(MockitoExtension.class)
class DeliveryServiceTest {
    @Mock DeliveryRepository repository;
    @Mock LogisticsEventPublisher events;
    @InjectMocks DeliveryService service;

    @Test
    void shouldPlanDelivery() {
        var request = new DeliveryRequest("driver-1", LocalDateTime.now().plusHours(2), stops);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Delivery result = service.plan(request);

        assertThat(result.getStatus()).isEqualTo(PLANNED);
        verify(events).publishDeliveryPlanned(any());
    }
}</code></pre>

<pre><code>// Integration test — Spring context, real DB (Testcontainers)
@SpringBootTest
@Testcontainers
class DeliveryIntegrationTest {

    @Container
    static PostgreSQLContainer&lt;?&gt; postgres = new PostgreSQLContainer<>("postgres:15");

    @Autowired DeliveryService service;

    @Test
    void shouldPersistAndRetrieve() {
        Delivery d = service.plan(request);
        Delivery found = service.findById(d.getId());
        assertThat(found.getRoute()).isEqualTo(d.getRoute());
    }
}</code></pre>

<pre><code>// Web layer test only (no service/repo — just controller)
@WebMvcTest(DeliveryController.class)
class DeliveryControllerTest {

    @Autowired MockMvc mvc;
    @MockBean DeliveryService service;

    @Test
    void shouldReturn404WhenNotFound() throws Exception {
        when(service.findById(99L)).thenThrow(new DeliveryNotFoundException(99L));

        mvc.perform(get("/api/deliveries/99"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("DELIVERY_NOT_FOUND"));
    }
}</code></pre>

<strong>Test slices:</strong>
• <code>@WebMvcTest</code> — only web layer (controllers)
• <code>@DataJpaTest</code> — only JPA layer (repositories + embedded DB)
• <code>@SpringBootTest</code> — full application context
• No annotation — plain unit test (fastest, preferred for business logic)`
      },
      {
        heading: 'Interview answer on testing strategy',
        content: `<strong>"How do you test in Spring Boot?"</strong>

"I follow the testing pyramid. Most tests are unit tests with Mockito — no Spring context, fast feedback. I test business logic in isolation.

For repository queries, I use @DataJpaTest with Testcontainers (real PostgreSQL, not H2) to verify query correctness.

For controllers, I use @WebMvcTest with MockMvc — tests serialization, validation, and error handling without starting the full app.

Integration tests with @SpringBootTest + Testcontainers validate the full flow end-to-end, but I keep these minimal since they're slow.

This is similar to how I tested in Java EE with JUnit + Mockito for business, plus Arquillian for integration — same pyramid, different tools."`
      }
    ]
  },
  {
    id: 'theory-spring-actuator',
    title: 'Actuator, Health Checks, and Production Readiness',
    sections: [
      {
        heading: 'Spring Boot Actuator',
        content: `Actuator provides production-ready endpoints for monitoring:

<pre><code># application.yml
management:
  endpoints:
    web:
      exposure:
        include: health, info, metrics, prometheus
  endpoint:
    health:
      show-details: when-authorized
  health:
    db:
      enabled: true
    kafka:
      enabled: true</code></pre>

<strong>Key endpoints:</strong>
<table>
<tr><th>Endpoint</th><th>Purpose</th><th>Kubernetes probe</th></tr>
<tr><td><code>/actuator/health/liveness</code></td><td>Is app alive?</td><td>livenessProbe</td></tr>
<tr><td><code>/actuator/health/readiness</code></td><td>Can accept traffic?</td><td>readinessProbe</td></tr>
<tr><td><code>/actuator/metrics</code></td><td>Application metrics</td><td>Prometheus scrape</td></tr>
<tr><td><code>/actuator/info</code></td><td>Build info, git commit</td><td>Dashboard</td></tr>
</table>

<strong>Custom health indicator:</strong>
<pre><code>@Component
public class KafkaHealthIndicator implements HealthIndicator {

    private final KafkaTemplate&lt;String, ?&gt; kafka;

    @Override
    public Health health() {
        try {
            kafka.partitionsFor("delivery-events");
            return Health.up().withDetail("topic", "reachable").build();
        } catch (Exception e) {
            return Health.down(e).build();
        }
    }
}</code></pre>

<strong>Java EE equivalent:</strong> MicroProfile Health (<code>/health/live</code>, <code>/health/ready</code>). Same concept, different API.

<strong>REWE context:</strong> Kubernetes uses these probes to decide whether to send traffic to a pod (readiness) or restart it (liveness). Critical for transport logistics where downtime means delayed deliveries.`
      }
    ]
  }
];
