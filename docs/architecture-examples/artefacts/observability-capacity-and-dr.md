# Observability, capacity, scalability, and disaster recovery

## Observability strategy

| Signal | What it answers | Examples |
|---|---|---|
| Logs | What happened in a component? | Structured JSON, correlation ID, no secrets/PII |
| Metrics | Is behaviour within an expected range? | Request rate, p95/p99, error rate, consumer lag, DB pool |
| Traces | Where did this request spend time or fail? | Gateway → Order → DB → broker → Billing |

## SLI, SLO, and SLA

| Term | ParcelFlow example |
|---|---|
| SLI | Percentage of create-delivery requests that complete successfully. |
| SLO | 99.9% success over 28 days; p95 below 400 ms. |
| SLA | External commitment only if a commercial agreement defines remedy. |

## Capacity baseline

| Dimension | Initial assumption | Review trigger |
|---|---:|---|
| Peak API rate | 120 requests/s | Forecast exceeds 70% sustained capacity |
| Events | 570,000/day | Lag or throughput exceeds 60% partition headroom |
| Database | 5 years retained | Storage or restore test misses RTO/RPO |
| Consumers | Scale by partitions | Consumer lag breaches SLO |

## Recovery targets

- **RTO:** 30 minutes for delivery creation.
- **RPO:** five minutes of confirmed data at most.
- Backup restoration and event replay are tested quarterly.
- A regional outage requires documented failover ownership, DNS/routing action, data validation, and customer communication.
