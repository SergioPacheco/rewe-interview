# POC plan — Durable order events with an outbox

## Hypothesis

An outbox record written in the same transaction as a delivery request prevents event loss and allows safe event redelivery.

## Experiment

1. Create a delivery request and outbox record in one PostgreSQL transaction.
2. Stop the application after commit and before relay publish.
3. Restart the relay and verify eventual publication.
4. Deliver the same event twice to billing.
5. Stop the consumer during processing and restart it.

## Success criteria

- No committed delivery request lacks an event after recovery.
- Billing creates at most one invoice for one delivery.
- Duplicate processing is visible in telemetry and is a safe no-op.
- p95 relay delay is within the stated SLO under expected load.

## Decision rule

Adopt the pattern only if recovery is reproducible, operational ownership is clear, and the measured delay meets the business need.
