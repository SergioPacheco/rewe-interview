# Integration catalogue

| Integration | Protocol / direction | Criticality | Auth | Timeout / retry | Contingency | Owner |
|---|---|---|---|---|---|---|
| Web/mobile client | HTTPS inbound | High | OIDC access token | Client retry with idempotency key | Status query | Product team |
| Billing | Kafka outbound | High | Broker ACL/mTLS | Consumer retry + DLQ | Replay and reconciliation | Finance team |
| Notification provider | HTTPS outbound | Medium | Rotated API secret | 2 s timeout; bounded retry | Queue for later delivery | Customer comms |
| Carrier API | REST bidirectional | High | OAuth client credentials | 3 s timeout; circuit breaker | Manual operational queue | Logistics team |
| Legacy ERP | Batch inbound | Medium | Network allow-list | Scheduled retry | Reprocess batch | Integration team |

## Contract rules

- Every HTTP API has OpenAPI, error shape, auth, versioning, and idempotency guidance.
- Every event has an owner, schema, key, ordering decision, retention, compatibility policy, and DLQ/replay rule.
- A new integration requires an owner, SLO dependency classification, threat-model update, and runbook impact review.
