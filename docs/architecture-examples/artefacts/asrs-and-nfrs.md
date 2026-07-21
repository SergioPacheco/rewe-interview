# Architecturally significant requirements and NFRs

## ASRs — requirements that change the design

| ID | Requirement | Why it is architecturally significant |
|---|---|---|
| ASR-01 | Process 120 create-delivery requests/second at peak. | Shapes request path, pool sizing, and load test. |
| ASR-02 | A retried request must not create a duplicate delivery. | Requires idempotency and durable operation state. |
| ASR-03 | Billing and notification must recover from a 30-minute outage. | Requires durable asynchronous handoff and replay. |
| ASR-04 | Personal data is retained for five years and access is auditable. | Shapes data classification, retention, and authorization. |
| ASR-05 | Recover the service within 30 minutes with no more than five minutes of confirmed data loss. | Defines RTO/RPO, backups, and recovery tests. |

## NFR baseline

| Attribute | Target | Verification |
|---|---|---|
| Availability | 99.9% successful delivery creation over 28 days | SLI/SLO dashboard |
| Performance | p95 < 400 ms; p99 < 900 ms at peak | Load test and production metrics |
| Resilience | Notification outage does not block creation | Dependency-failure game day |
| Consistency | Eventual consistency is accepted only for downstream effects | Reconciliation report |
| Security | OIDC, TLS, encrypted storage, least privilege | Threat-model review and automated checks |
| Observability | Trace, correlation ID, request/error/lag metrics | Incident drill |
| Maintainability | Module boundaries and contracts are enforced | Fitness functions and PR review |
