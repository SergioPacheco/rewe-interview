# Threat model — Create delivery request

| Threat | Example | Control | Evidence |
|---|---|---|---|
| Broken object authorization | Customer reads another customer's delivery. | Authorize by customer ownership at the use case boundary. | Audit event and integration test. |
| Duplicate action | Retried HTTP request creates two deliveries. | Idempotency key plus unique constraint. | Duplicate-request test and metric. |
| Credential leakage | API token appears in logs or source. | Secret manager, log redaction, rotation. | CI scan and access audit. |
| Event data exposure | Event includes unnecessary personal data. | Data classification and minimal event payload. | Contract review. |
| Denial of service | Client floods create endpoint. | Authentication, rate limit, capacity alert. | Load test and WAF/gateway policy. |

## Trust boundaries

- Browser/mobile client → API gateway.
- API → PostgreSQL.
- Outbox relay → event broker.
- Broker → billing and notification consumers.
- Service → third-party notification provider.

Review this model whenever a new client, data class, integration, or privileged operation is added.
