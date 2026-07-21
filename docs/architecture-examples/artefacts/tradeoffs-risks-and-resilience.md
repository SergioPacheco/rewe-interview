# Trade-offs, risks, resilience, and distributed consistency

## Decision trade-offs

| Decision | Benefit | Cost / risk | Evidence required |
|---|---|---|---|
| Modular monolith first | Simple deployment and local transactions | Requires strict internal boundaries | Boundary tests and ownership map |
| Event broker for downstream effects | Independent consumers and replay | Eventual consistency and operations | Outbox POC and lag monitoring |
| Distributed cache | Lower read latency | Stale data and invalidation complexity | Cache-age SLI and load test |
| Database per context | Independent evolution | Distributed queries become harder | Projection/API design |

## Architectural risk register

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---:|---:|---|---|
| Duplicate event delivery | High | Medium | Idempotent consumer and unique constraint | Consumer owner |
| Broker outage | Medium | High | Durable outbox, redundant broker, replay drill | Platform |
| Database pool saturation | Medium | High | Query budget, pool metrics, load test | Order team |
| Slow carrier API | High | High | Timeout, circuit breaker, fallback queue | Logistics |
| Sensitive data in telemetry | Medium | High | Redaction, schema review, access controls | Security |

## Resilience and consistency policy

| Failure | Required behaviour |
|---|---|
| Database unavailable | Reject new critical writes clearly; do not pretend success. |
| External dependency slow | Timeout, bounded retry with jitter, circuit breaker, user-visible pending state. |
| Duplicate event | Safe no-op using `eventId` or business key. |
| Out-of-order event | Version/state guard or ordered partition by aggregate ID. |
| Multi-step business flow fails | Saga compensation or explicit manual recovery queue. |
| Poison message | Preserve in DLQ with reason, trace ID, and replay procedure. |
