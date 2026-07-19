/**
 * REST APIs — Practice (15 exercises)
 * Verbs, status codes, design, idempotency, versioning, error handling
 */
const restExercises = [
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'BASIC',
    subtopic: 'HTTP Verbs',
    mission: 'Which HTTP status code should this endpoint return on success?',
    code: `@PostMapping("/api/v1/deliveries")
public ResponseEntity<DeliveryDTO> create(@Valid @RequestBody CreateDeliveryRequest req) {
    Delivery d = service.create(req);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}").buildAndExpand(d.getId()).toUri();
    return ResponseEntity.???(location).body(toDTO(d));
}`,
    choices: ['200 OK', '201 Created', '204 No Content', '202 Accepted'],
    answer: '201 Created',
    explain: 'POST that creates a resource returns 201 Created with a Location header pointing to the new resource. 200 is for general success (GET, PUT). 204 is for success with no body (DELETE). 202 is for async processing started.'
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'API Design',
    question: 'You need an endpoint to change a delivery\'s status from PLANNED to DISPATCHED. How do you design it?',
    options: [
      { label: 'A) PATCH /deliveries/123 with body {"status": "DISPATCHED"}', description: 'Generic partial update — client can set any status value.' },
      { label: 'B) POST /deliveries/123/dispatch', description: 'Action as sub-resource — server validates the transition.' },
      { label: 'C) PUT /deliveries/123/status with body "DISPATCHED"', description: 'Replace the status field specifically.' }
    ],
    bestOption: 1,
    explanation: `POST to action sub-resource (B) is best for state transitions:

\`\`\`
POST /api/v1/deliveries/123/dispatch   → 200 (or 409 if invalid state)
POST /api/v1/deliveries/123/complete   → 200 (or 409 if not dispatched)
POST /api/v1/deliveries/123/cancel     → 200 (or 409 if already completed)
\`\`\`

**Why B wins:**
• Server ENFORCES valid transitions (PLANNED → DISPATCHED ok, COMPLETED → DISPATCHED rejected)
• Endpoint name documents the business operation
• Can add operation-specific parameters (e.g., dispatch needs driverId)
• Returns 409 Conflict for invalid transitions (clear semantics)

**Why NOT A:** Client can set ANY status — bypasses business rules. "PATCH status=COMPLETED" without going through DISPATCHED first? Server must still validate, but the API suggests it's a simple field update.

**Why NOT C:** PUT implies replacing a resource. Status isn't really a "resource" — it's the result of a business operation.`,
    tags: ['state-transitions', 'api-design', 'resources']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Error Handling',
    question: 'How do you design error responses for a REST API? Show a consistent format.',
    modelAnswer: `**Consistent error response format:**
\`\`\`json
{
  "code": "DELIVERY_NOT_FOUND",
  "message": "Delivery with ID 4567 does not exist",
  "timestamp": "2026-07-19T10:30:00Z",
  "path": "/api/v1/deliveries/4567"
}

// Validation errors (400):
{
  "code": "VALIDATION_FAILED",
  "message": "Request validation failed",
  "details": [
    { "field": "driverId", "error": "must not be blank" },
    { "field": "scheduledAt", "error": "must be a future date" }
  ]
}
\`\`\`

**Rules:**
• Machine-readable \`code\` (for client switch/if statements)
• Human-readable \`message\` (for debugging/logs)
• NEVER expose stack traces or internal class names
• NEVER return 200 with error in body
• Consistent format across ALL endpoints

**Status code mapping:**
• Validation failed → 400 Bad Request
• Not authenticated → 401 Unauthorized
• No permission → 403 Forbidden
• Not found → 404
• Business rule violation → 409 Conflict
• Server bug → 500 (generic message only)`,
    followUp: 'How do you handle errors from downstream services in your API response?',
    tags: ['errors', 'format', 'consistency']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Idempotency',
    question: 'A client calls POST /deliveries but gets a network timeout. It doesn\'t know if the delivery was created. How do you handle this?',
    modelAnswer: `**Problem:** POST is not idempotent. Retrying might create a duplicate delivery.

**Solution: Idempotency Key**
\`\`\`
POST /api/v1/deliveries
Headers:
  Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
  Content-Type: application/json

Body: { "driverId": "D-42", "scheduledAt": "..." }
\`\`\`

**Server implementation:**
\`\`\`java
@PostMapping
public ResponseEntity<DeliveryDTO> create(
        @RequestHeader("Idempotency-Key") String idempotencyKey,
        @Valid @RequestBody CreateDeliveryRequest req) {

    // Check if already processed
    Optional<DeliveryDTO> existing = idempotencyStore.find(idempotencyKey);
    if (existing.isPresent()) {
        return ResponseEntity.ok(existing.get()); // return original response
    }

    // Process
    DeliveryDTO result = service.create(req);

    // Store for dedup (expires after 24h)
    idempotencyStore.save(idempotencyKey, result);

    return ResponseEntity.created(uri).body(result);
}
\`\`\`

**Rules:**
• Same key + same body → return stored response (no duplicate)
• Same key + different body → 409 Conflict (key reuse attempt)
• Key expires after 24h (don't store forever)
• Store in database, not in-memory (survives pod restart)`,
    followUp: 'Which endpoints need idempotency keys and which don\'t?',
    tags: ['idempotency', 'retry', 'reliability']
  },
  {
    type: 'PREDICT_OUTPUT',
    difficulty: 'BASIC',
    subtopic: 'Status Codes',
    mission: 'Match the scenario to the correct HTTP status code:',
    code: `Scenario 1: DELETE /deliveries/123 succeeds (delivery deleted)
Scenario 2: GET /deliveries/999 but ID 999 doesn't exist
Scenario 3: POST /deliveries with {"driverId": ""} (blank required field)
Scenario 4: POST /deliveries/123/dispatch but delivery is already COMPLETED`,
    choices: ['204, 404, 400, 409', '200, 404, 400, 400', '204, 400, 422, 409', '200, 404, 422, 500'],
    answer: '204, 404, 400, 409',
    explain: '204 No Content = successful DELETE (no body to return). 404 Not Found = resource doesn\'t exist. 400 Bad Request = validation failure (blank required field). 409 Conflict = business state conflict (can\'t dispatch a completed delivery).'
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Versioning',
    question: 'When do you create a new API version? How do you manage the transition?',
    modelAnswer: `**Create new version when:**
• Removing a field from response
• Changing type or meaning of existing field
• Making optional parameter required
• Changing response structure

**DON'T need new version:**
• Adding optional field to response (backward-compatible)
• Adding new endpoint
• Adding optional query parameter

**Transition strategy:**
\`\`\`
/api/v1/deliveries  ← old clients (maintained, deprecated)
/api/v2/deliveries  ← new clients (current)
\`\`\`

\`\`\`java
// V1 and V2 share business logic — only adapters differ
@RestController @RequestMapping("/api/v1/deliveries")
class DeliveryControllerV1 {
    DeliveryDTO findById(Long id) {
        return mapperV1.toDTO(service.findById(id));
    }
}

@RestController @RequestMapping("/api/v2/deliveries")
class DeliveryControllerV2 {
    DeliveryResponseV2 findById(Long id) {
        return mapperV2.toResponse(service.findById(id));
    }
}
\`\`\`

**Rules:**
• NEVER duplicate business logic between versions
• Each version is a thin adapter (request mapping + response mapping)
• Announce deprecation with timeline (Sunset header)
• Monitor usage of old version before decommissioning
• Security fixes apply to ALL supported versions`,
    followUp: 'How do you communicate breaking changes to API consumers?',
    tags: ['versioning', 'breaking-changes', 'strategy']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'INTER',
    subtopic: 'Pagination',
    question: 'Your delivery listing endpoint returns 2 million records total. How do you paginate?',
    options: [
      { label: 'A) OFFSET + LIMIT with total count', description: 'GET /deliveries?offset=100&limit=50 — returns items + total count for page buttons.' },
      { label: 'B) Cursor-based (keyset) without total count', description: 'GET /deliveries?after=lastId&limit=50 — returns items + next cursor.' },
      { label: 'C) No pagination — return all and let client filter', description: 'Client downloads full dataset and handles display.' }
    ],
    bestOption: 1,
    explanation: `Cursor/keyset pagination (B) is best for large datasets:

\`\`\`
GET /api/v1/deliveries?afterId=4567&limit=50&sort=scheduledAt,desc

Response:
{
  "items": [...50 deliveries...],
  "cursor": {
    "next": "afterId=4517&sort=scheduledAt,desc",
    "hasMore": true
  }
}
\`\`\`

**Why B over A:**
• OFFSET 249950 LIMIT 50 → DB scans and discards 249,950 rows (SLOW)
• Cursor (WHERE id < 4517) → index seek directly to the right position (FAST)
• No COUNT(*) on 2M rows (expensive query avoided)

**Trade-off:** no random page access ("jump to page 5000"). But for 2M records, nobody clicks page 5000 — they use filters.

**When OFFSET is acceptable:**
• Small datasets (<100K rows)
• Admin dashboards where pages 1-10 are enough
• When "total count" is required by UI design

**Always enforce:**
• Max limit server-side (e.g., 100)
• Deterministic sort (include ID as tiebreaker)
• Never accept limit=0 or limit=99999999`,
    tags: ['pagination', 'cursor', 'performance']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Security',
    question: 'How do you secure a REST API? What layers of protection do you need?',
    modelAnswer: `**Layer 1 — Transport:** HTTPS always (never HTTP in production)

**Layer 2 — Authentication:** "Who are you?"
\`\`\`
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
\`\`\`
• JWT token validated per request (signature + expiration)
• Token issued by identity provider (Keycloak, Auth0)
• Stateless — server doesn't store sessions

**Layer 3 — Authorization:** "Are you allowed?"
• Coarse: endpoint-level (@PreAuthorize, SecurityFilterChain)
• Fine: business-level ("is this YOUR delivery?")
\`\`\`java
public Delivery findById(Long id) {
    Delivery d = repo.findById(id).orElseThrow();
    if (!d.getOwnerId().equals(currentUser.getId()))
        throw new ForbiddenException(); // resource-level authz
    return d;
}
\`\`\`

**Layer 4 — Input validation:**
• Bean Validation (@NotBlank, @Size, @Max)
• Reject oversized payloads (max request size)
• Parameterized queries (NEVER concatenate user input into SQL)

**Layer 5 — Rate limiting:**
• Per-client quotas (API gateway or application-level)
• Prevent abuse and protect backend resources

**Layer 6 — Output:**
• Never expose stack traces
• Never leak internal IDs/paths in error messages
• Don't return more data than the client needs`,
    followUp: 'How do you handle authentication between internal microservices?',
    tags: ['security', 'jwt', 'authorization']
  },
  {
    type: 'CODE_REFACTOR',
    difficulty: 'INTER',
    subtopic: 'API Design Anti-patterns',
    question: 'What problems do you see in these endpoint designs?',
    code: `// Endpoint 1
POST /api/createDelivery

// Endpoint 2
GET /api/deliveries/getByDriver?driverId=42

// Endpoint 3
POST /api/deliveries/123/delete

// Endpoint 4
GET /api/deliveries?data={"status":"ACTIVE","limit":50}

// Endpoint 5
POST /api/deliveries/search
Body: { "driverId": 42 }  // simple filter that fits in URL`,
    problems: [
      'Endpoint 1: verb in URL (createDelivery) — use POST /deliveries',
      'Endpoint 2: verb in URL (getByDriver) — use GET /deliveries?driverId=42',
      'Endpoint 3: using POST for deletion — use DELETE /deliveries/123',
      'Endpoint 4: JSON in query param — use proper query params: ?status=ACTIVE&limit=50',
      'Endpoint 5: POST for simple search — use GET with query params (unless body is truly complex)'
    ],
    refactored: `// ✅ Corrected:
POST   /api/v1/deliveries              // create
GET    /api/v1/deliveries?driverId=42  // filter by driver
DELETE /api/v1/deliveries/123          // delete
GET    /api/v1/deliveries?status=ACTIVE&limit=50  // filter + paginate
GET    /api/v1/deliveries?driverId=42  // simple filter → GET

// POST for search is acceptable ONLY when:
// - Body contains list of IDs (too many for URL)
// - Filters are complex/nested (JSON structure)
// - Sensitive data that shouldn't be in URL/logs
POST /api/v1/deliveries/search  // complex body = acceptable`,
    tags: ['anti-patterns', 'restful', 'clean-urls']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'HATEOAS',
    question: 'What is HATEOAS? Do you use it in practice?',
    modelAnswer: `**HATEOAS** = Hypermedia As The Engine Of Application State

Responses include LINKS to available actions:
\`\`\`json
{
  "id": 4567,
  "status": "PLANNED",
  "driverId": "D-42",
  "_links": {
    "self": { "href": "/api/v1/deliveries/4567" },
    "dispatch": { "href": "/api/v1/deliveries/4567/dispatch", "method": "POST" },
    "cancel": { "href": "/api/v1/deliveries/4567/cancel", "method": "POST" },
    "driver": { "href": "/api/v1/drivers/D-42" }
  }
}
\`\`\`

**Theory:** Client discovers available actions from the response — no hardcoded URLs.

**Practice:** Most teams skip HATEOAS for internal APIs because:
• Clients are known (same team builds frontend + backend)
• API documentation (OpenAPI/Swagger) serves the same purpose
• Adds payload size and implementation effort
• Frontend frameworks prefer typed API clients over link discovery

**Honest answer:**
"I understand HATEOAS as the highest level of REST maturity. In practice, for internal microservice APIs, I prioritize clear documentation (OpenAPI), consistent URL patterns, and proper status codes. HATEOAS adds value for public APIs where clients are unknown and must discover capabilities. For REWE's internal services, I'd follow the team's existing convention."`,
    followUp: 'What is the Richardson Maturity Model?',
    tags: ['hateoas', 'rest-maturity', 'pragmatism']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'GraphQL vs REST',
    question: 'When would you choose GraphQL over REST?',
    modelAnswer: `**Choose REST when:**
• CRUD operations with well-defined resources
• Caching is important (HTTP cache works naturally with REST)
• Simple client needs (mobile apps with predictable data)
• Team is already proficient with REST
• API gateway handles routing/auth
• Most REWE internal services → REST

**Choose GraphQL when:**
• Multiple clients need different views of same data (mobile vs desktop)
• Frontend needs to reduce roundtrips (single request for complex page)
• Over-fetching is a real problem (returning 50 fields when client needs 5)
• Relationships between entities are complex and variable
• API evolution without versioning (clients request only fields they know)

**Trade-offs:**
| Aspect | REST | GraphQL |
|--------|------|---------|
| Caching | ✅ Built-in (HTTP) | ❌ Complex (custom) |
| Simplicity | ✅ Familiar | ❌ Learning curve |
| Flexibility | ❌ Fixed response | ✅ Client chooses fields |
| File upload | ✅ Straightforward | ❌ Requires multipart hack |
| N+1 on server | Standard | ⚠️ DataLoader pattern needed |
| Monitoring | ✅ Per-endpoint metrics | ❌ All queries hit one endpoint |

**For REWE TRAB:**
REST is the pragmatic choice. Well-defined resources (deliveries, drivers, routes), standard CRUD patterns, easy caching, team familiarity. GraphQL adds complexity without clear benefit for logistics APIs.`,
    followUp: 'Can you use GraphQL and REST in the same application?',
    tags: ['graphql', 'rest', 'comparison']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Documentation',
    question: 'How do you document a REST API?',
    modelAnswer: `**OpenAPI/Swagger (standard):**
\`\`\`java
@Operation(summary = "Find delivery by ID",
    responses = {
        @ApiResponse(responseCode = "200", description = "Delivery found"),
        @ApiResponse(responseCode = "404", description = "Delivery not found")
    })
@GetMapping("/{id}")
public ResponseEntity<DeliveryDTO> findById(
        @Parameter(description = "Delivery ID") @PathVariable Long id) {
    return ResponseEntity.ok(service.findById(id));
}
\`\`\`

**Spring Boot auto-generates OpenAPI spec:**
\`\`\`yaml
# pom.xml
springdoc-openapi-starter-webmvc-ui

# application.yml
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
\`\`\`

**Good documentation includes:**
• Request/response examples (not just schemas)
• Error response formats and codes
• Authentication requirements
• Rate limits
• Pagination parameters
• Deprecation notices

**What makes API docs excellent:**
• Generated FROM code (always up-to-date, not stale wiki)
• Runnable examples ("try it" button in Swagger UI)
• Versioned alongside the API
• Reviewed in PRs (API changes = doc changes)`,
    followUp: 'How do you ensure documentation stays in sync with the actual implementation?',
    tags: ['openapi', 'swagger', 'documentation']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    subtopic: 'Async Operations',
    question: 'Route optimization takes 10 seconds. The client calls POST /deliveries/123/optimize-route. How do you handle the long operation?',
    options: [
      { label: 'A) Synchronous — client waits 10 seconds for response', description: 'Simple request-response. Client blocks until route is calculated.' },
      { label: 'B) 202 Accepted + polling — return immediately, client polls for result', description: 'Accept request, process async, client checks GET /deliveries/123/route until ready.' },
      { label: 'C) WebSocket — push result when ready', description: 'Client opens WebSocket, server pushes route when optimization completes.' }
    ],
    bestOption: 1,
    explanation: `202 Accepted + polling (B) is the standard REST pattern for long operations:

\`\`\`
// 1. Client initiates
POST /api/v1/deliveries/123/optimize-route → 202 Accepted
Response: {
  "status": "PROCESSING",
  "statusUrl": "/api/v1/deliveries/123/route",
  "estimatedCompletion": "2026-07-19T10:30:10Z"
}

// 2. Client polls
GET /api/v1/deliveries/123/route → 200
Response: { "status": "PROCESSING" }  // still working

// 3. Eventually
GET /api/v1/deliveries/123/route → 200
Response: { "status": "COMPLETED", "route": { ... } }
\`\`\`

**Why B:**
• Client isn't blocked (can show spinner, do other work)
• Survives client disconnection (result is stored)
• Works with any HTTP client (no WebSocket required)
• Load balancers/proxies handle short-lived connections well
• Retry-friendly (just poll again)

**Why NOT A:** 10s is too long. HTTP timeouts, impatient users, load balancer might cut the connection.

**Why NOT C (usually):** WebSocket adds complexity (connection management, reconnection, load balancing). Use only when you need continuous real-time updates (chat, live tracking).`,
    tags: ['async', 'long-running', '202-accepted']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Content Negotiation',
    question: 'How does content negotiation work in REST? When do you need it?',
    modelAnswer: `**Content negotiation:** Client and server agree on response format via headers.

\`\`\`
GET /api/v1/deliveries/123
Accept: application/json          → returns JSON
Accept: application/xml           → returns XML (if supported)
Accept: text/csv                  → returns CSV (for exports)
\`\`\`

**In Spring Boot:**
\`\`\`java
@GetMapping(value = "/{id}",
    produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE })
public DeliveryDTO findById(@PathVariable Long id) { ... }

// Different format for export
@GetMapping(value = "/export", produces = "text/csv")
public void exportCsv(HttpServletResponse response) { ... }
\`\`\`

**When you need it:**
• API serves multiple client types (web=JSON, legacy=XML)
• Export functionality (CSV, Excel alongside JSON)
• Versioning via Accept header (alternative to URL versioning)
• Language negotiation (Accept-Language for i18n)

**In practice for REWE:**
Most internal APIs only need JSON. Content negotiation is overkill unless there's a real multi-format requirement. Use \`produces = APPLICATION_JSON_VALUE\` explicitly and keep it simple.`,
    followUp: 'How would you implement a CSV export endpoint for delivery reports?',
    tags: ['content-negotiation', 'headers', 'formats']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Rate Limiting',
    question: 'How do you implement rate limiting for a REST API?',
    modelAnswer: `**Levels of rate limiting:**

**1. API Gateway (preferred — Kong, AWS API Gateway, Nginx):**
\`\`\`yaml
# Nginx example
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
limit_req zone=api burst=20 nodelay;
\`\`\`
Best: centralized, no application code, handles all endpoints.

**2. Application-level (Bucket4j, Guava RateLimiter):**
\`\`\`java
@Component
public class RateLimitFilter implements Filter {
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public void doFilter(ServletRequest req, ...) {
        String clientId = extractClientId(req);
        Bucket bucket = buckets.computeIfAbsent(clientId,
            id -> Bucket.builder()
                .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1))))
                .build());

        if (bucket.tryConsume(1)) {
            chain.doFilter(req, res);
        } else {
            ((HttpServletResponse) res).setStatus(429);
            ((HttpServletResponse) res).setHeader("Retry-After", "60");
        }
    }
}
\`\`\`

**Response when rate limited:**
\`\`\`
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1721384400
\`\`\`

**Different limits per tier:**
• Internal services: higher limits (1000/min)
• External partners: medium (100/min)
• Public API: lower (20/min)
• Per-endpoint: expensive operations get stricter limits`,
    followUp: 'How do you rate-limit across multiple pods of the same service?',
    tags: ['rate-limiting', 'throttling', '429']
  }
];
