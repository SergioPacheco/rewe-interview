# ADR-014 — Publish `OrderCreated` asynchronously

- **Status:** Accepted
- **Date:** 2026-07-21
- **Owner:** Commerce team
- **Review trigger:** Notification delivery becomes a synchronous business requirement.

## Context

Creating a delivery request must remain available when billing or notification is unavailable. New consumers are expected. The system must not lose a business event after the order has committed.

## Decision

Persist the delivery request and an outbox record in one database transaction. A relay publishes `OrderCreated` to the event broker. Consumers process the event at least once and deduplicate by `eventId`.

## Alternatives considered

1. **Synchronous REST notification** — rejected because it makes delivery creation depend on the availability and latency of notification.
2. **Direct broker publish after database commit** — rejected because process failure between commit and publish loses the event.
3. **Two-phase commit** — rejected because it couples availability and operations across systems.

## Consequences

- Delivery creation is isolated from downstream outages.
- Consumers can replay events and scale independently.
- Billing and notification become eventually consistent.
- The team must operate an outbox relay, consumer lag, retry policy, DLQ, and reconciliation.
