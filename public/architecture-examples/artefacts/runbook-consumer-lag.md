# Runbook — `OrderCreated` consumer lag

## Alert

Consumer lag is above 10,000 messages for ten consecutive minutes.

## Customer impact

Delivery requests are still accepted. Billing and notifications may be delayed.

## First checks

1. Open the consumer dashboard and trace samples.
2. Check consumer health, error rate, recent deployments, and DLQ growth.
3. Check broker throughput, partition assignment, and database saturation.

## Safe mitigation

- Scale consumers only when partition count permits.
- Pause a faulty consumer; do not reset offsets without approval.
- Do not replay events until idempotency is confirmed.
- Roll back a recent deploy if evidence points to it.

## Escalation and follow-up

Escalate from Commerce on-call to Platform on-call when broker or database capacity is involved. Record incident ID, lag peak, customer impact, root cause, and a follow-up ADR or backlog item.
