/**
 * Theory Content — REST APIs
 * Verbs, status codes, idempotency, versioning, error handling
 */
const theoryRest = [
  {
    id: 'theory-rest-fundamentals',
    title: 'REST Fundamentals — Verbs, Resources, Status Codes',
    sections: [
      {
        heading: 'What is REST?',
        content: `REST (Representational State Transfer) is an architectural style for APIs built on HTTP.

Core constraints:
• <strong>Stateless</strong> — each request contains all info needed (no server-side session)
• <strong>Resource-oriented</strong> — URLs identify resources (nouns), not actions (verbs)
• <strong>Uniform interface</strong> — HTTP verbs define the operation
• <strong>Cacheable</strong> — responses can be cached by clients/proxies

<pre><code>// Resources are NOUNS (not verbs!)
GET  /deliveries          ← list deliveries
GET  /deliveries/4567     ← get one delivery
POST /deliveries          ← create a delivery
PUT  /deliveries/4567     ← replace a delivery
PATCH /deliveries/4567    ← partial update
DELETE /deliveries/4567   ← delete a delivery

// ❌ Anti-pattern: verbs in URLs
POST /createDelivery
GET  /getDeliveryById?id=4567
POST /deleteDelivery</code></pre>`
      },
      {
        heading: 'HTTP Verbs and their semantics',
        content: `<pre><code>GET     — Read (no side effects, idempotent, cacheable)
POST    — Create (not idempotent — calling twice creates 2 resources)
PUT     — Replace entirely (idempotent — calling twice = same result)
PATCH   — Partial update (may or may not be idempotent)
DELETE  — Remove (idempotent — deleting twice = same state)</code></pre>

<strong>Idempotent</strong> = calling N times produces the same result as calling once.
• GET, PUT, DELETE are idempotent
• POST is NOT idempotent (creates new resource each time)
• PATCH depends on the operation

<strong>Safe</strong> = does not modify server state.
• GET, HEAD, OPTIONS are safe
• POST, PUT, PATCH, DELETE are NOT safe

<strong>Interview question:</strong> "What's the difference between PUT and PATCH?"
PUT replaces the ENTIRE resource. PATCH updates only the fields you send.
<pre><code>// PUT — must send ALL fields (missing = set to null/default)
PUT /deliveries/4567
{ "driverId": "d-42", "route": "R-7", "status": "DISPATCHED", "stops": [...] }

// PATCH — send ONLY what changes
PATCH /deliveries/4567
{ "status": "DISPATCHED" }</code></pre>`
      },
      {
        heading: 'HTTP Status Codes',
        content: `<pre><code>2xx — SUCCESS
  200 OK              — general success (GET, PUT, PATCH)
  201 Created         — resource created (POST) + Location header
  204 No Content      — success with no body (DELETE)

3xx — REDIRECTION
  301 Moved Permanently
  304 Not Modified    — cache still valid (ETag)

4xx — CLIENT ERROR (your fault)
  400 Bad Request     — validation failed, malformed payload
  401 Unauthorized    — not authenticated (missing/bad token)
  403 Forbidden       — authenticated but not authorized
  404 Not Found       — resource doesn't exist
  409 Conflict        — state conflict (duplicate, version mismatch)
  422 Unprocessable   — semantically invalid (valid JSON but bad data)
  429 Too Many Reqs   — rate limited

5xx — SERVER ERROR (our fault)
  500 Internal Error  — unexpected failure (bug, timeout)
  502 Bad Gateway     — upstream service failed
  503 Unavailable     — overloaded or maintenance
  504 Gateway Timeout — upstream timed out</code></pre>

<strong>Interview tip:</strong> "400 vs 422?" — 400 = can't even parse the request. 422 = parsed it, but the content violates business rules.`
      }
    ]
  },
  {
    id: 'theory-rest-design',
    title: 'API Design — Pagination, Error Format, Versioning',
    sections: [
      {
        heading: 'Pagination',
        content: `Never return unbounded lists. Always paginate:

<pre><code>GET /deliveries?offset=0&limit=20&sort=createdAt,desc

// Response includes pagination metadata
{
  "content": [...],
  "page": { "offset": 0, "limit": 20, "total": 1543 },
  "links": {
    "next": "/deliveries?offset=20&limit=20",
    "prev": null
  }
}</code></pre>

<strong>Cursor-based (for high volume):</strong>
<pre><code>GET /deliveries?after=2026-07-19T10:00:00Z&afterId=4567&limit=50
// More efficient than offset for large datasets (no COUNT, no skip)</code></pre>

<strong>Rules:</strong>
• Always set a max limit server-side (e.g., max 100)
• Always use deterministic ordering (include ID as tiebreaker)
• Never paginate without ORDER BY`
      },
      {
        heading: 'Error response format',
        content: `Consistent error responses across all endpoints:

<pre><code>// Validation error (400)
{
  "code": "VALIDATION_FAILED",
  "message": "Request validation failed",
  "details": [
    { "field": "driverId", "error": "must not be blank" },
    { "field": "scheduledAt", "error": "must be in the future" }
  ]
}

// Business error (409)
{
  "code": "DELIVERY_ALREADY_DISPATCHED",
  "message": "Delivery 4567 is already dispatched and cannot be modified"
}

// Not found (404)
{
  "code": "DELIVERY_NOT_FOUND",
  "message": "Delivery with ID 4567 does not exist"
}</code></pre>

<strong>Rules:</strong>
• Machine-readable code (for client switch statements)
• Human-readable message (for logs/debugging)
• NEVER expose stack traces or internal details
• NEVER return 200 with an error in the body`
      },
      {
        heading: 'Versioning strategies',
        content: `<strong>URL path versioning</strong> (most common, clearest):
<pre><code>GET /api/v1/deliveries
GET /api/v2/deliveries</code></pre>

<strong>Header versioning:</strong>
<pre><code>GET /api/deliveries
Accept: application/vnd.rewe.v2+json</code></pre>

<strong>When to create a new version:</strong>
• Removing a field from the response
• Changing the type/meaning of an existing field
• Making an optional parameter required
• Changing the response structure

<strong>When you DON'T need a new version:</strong>
• Adding a new optional field to the response (backward-compatible)
• Adding a new endpoint

<strong>REWE practical approach:</strong> URL versioning (v1, v2). Keep both versions running during migration. Share business logic — each version is a thin adapter. Never duplicate business code between versions.`
      },
      {
        heading: 'Idempotency for safe retries',
        content: `When a client doesn't receive a response (timeout, network error), it may retry. Without idempotency, retry = duplicate.

<pre><code>// Problem: POST is not idempotent
POST /deliveries (timeout... did it create or not?)
POST /deliveries (retry... now you have 2 deliveries!)

// Solution: Idempotency Key
POST /deliveries
Headers: Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

// Server stores: key → response
// Same key again → returns stored response (no duplicate)</code></pre>

<strong>Implementation:</strong>
1. Client sends unique key per logical operation
2. Server checks: "did I already process this key?"
3. If yes → return the original response
4. If no → process, store result, return response

<strong>Natural idempotency:</strong>
• PUT is naturally idempotent (same data → same state)
• DELETE is naturally idempotent (deleting non-existent = 404 or 204)
• Only POST needs explicit idempotency keys for critical operations`
      }
    ]
  },
  {
    id: 'theory-rest-interview',
    title: 'REST Interview — Common Questions',
    sections: [
      {
        heading: 'Top interview questions and answers',
        content: `<strong>"PUT vs POST?"</strong>
POST creates a new resource (server assigns ID). PUT replaces a resource at a known URL.
POST /deliveries → 201 + Location header.
PUT /deliveries/4567 → 200 (replaced) or 201 (created at that URL).

<strong>"How do you handle versioning?"</strong>
URL path versioning (/v1/, /v2/) for clarity. Both versions delegate to the same business logic. Version adapters handle request/response transformation. Never duplicate business code.

<strong>"How do you secure a REST API?"</strong>
• Authentication: JWT/OAuth2 tokens in Authorization header
• Authorization: role/permission checks in the business layer
• Input validation: Bean Validation + max sizes + parameterized queries
• Rate limiting: per-client quotas (API gateway)
• HTTPS: always (never plain HTTP in production)

<strong>"REST vs GraphQL?"</strong>
REST: simpler, cacheable, well-understood. Better for CRUD and standard APIs.
GraphQL: flexible queries, reduces over/under-fetching. Better for complex UIs with varied data needs.
For REWE transport logistics: REST is the standard choice (well-defined resources, predictable patterns).

<strong>"What makes an API 'RESTful'?"</strong>
Stateless, resource-oriented, proper HTTP verbs, proper status codes, HATEOAS (links in responses — often skipped in practice). The pragmatic answer: "We follow REST conventions for verbs and status codes, resource-oriented URLs, and stateless communication. We don't implement full HATEOAS because the ROI is low for internal APIs."`
      }
    ]
  }
];
