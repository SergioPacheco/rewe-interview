# Quality scenarios — ParcelFlow

| Attribute | Scenario | Measure | Decision impact |
|---|---|---|---|
| Correctness | A customer retries delivery creation after a timeout. | At most one delivery request is created for one idempotency key. | Requires idempotency key and durable operation result. |
| Performance | Morning dispatch peak reaches 120 requests/s. | p95 create-delivery response is below 400 ms. | Keeps non-critical work out of the request path. |
| Availability | Notification provider is unavailable for 30 minutes. | Delivery creation continues; notification is delivered after recovery. | Requires durable async handoff. |
| Observability | Billing falls behind after a deploy. | On-call detects lag above 10,000 events within 10 minutes. | Requires consumer lag SLI and actionable alert. |
| Security | A user attempts to access another customer's delivery. | Request is denied and audit evidence is retained. | Requires resource-level authorization and audit logging. |

## SLOs

- **Delivery creation success rate:** 99.9% over 28 days.
- **Delivery creation latency:** p95 < 400 ms; p99 < 900 ms during peak.
- **Notification delay:** 99% of `OrderCreated` notifications are processed within five minutes, excluding declared provider incidents.

## Explicit trade-off

Billing and notification status may be delayed. Creation of a duplicate delivery request may not be delayed or accepted. The architecture therefore favours a local transaction plus asynchronous processing over a distributed transaction.
