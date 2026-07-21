# Delivery, governance, fitness functions, and evolution

## CI/CD architecture

```text
Commit → Build → Unit tests → Contract/integration tests → SAST/dependency scan
       → Image + SBOM → Deploy to staging → smoke/load checks
       → Approval/policy gate → Canary or blue-green production release → Observe → Roll back if needed
```

## Infrastructure-as-code expectations

- Versioned network, identity, secrets references, compute, database, broker, dashboards, and alert rules.
- Deployment manifests define resources, probes, topology, configuration, and autoscaling boundaries.
- No manual production-only configuration without an approved break-glass record.

## Architecture fitness functions

| Rule | Automated evidence |
|---|---|
| Domain code does not import infrastructure adapters. | ArchUnit test |
| Services do not access another service database. | Repository/connection policy and review |
| Critical services expose health and telemetry. | Deployment and smoke test |
| API/event contracts remain compatible. | Contract tests / schema registry |
| Vulnerable dependencies are blocked. | SCA quality gate |

## Roadmap and migration example

1. Modularise the monolith and establish ownership.
2. Add telemetry, SLOs, runbooks, and recovery drills.
3. Introduce outbox and event contracts for downstream work.
4. Extract a stable logistics capability only when team and scaling evidence justify it.
5. Migrate legacy routes gradually with strangler fig, anti-corruption layer, parallel validation, and rollback.

## Architecture assessment report template

Record current state, strengths, risks, bottlenecks, technical debt, non-conformities, recommendation, priority, owner, target date, and evidence. The report is useful only when it drives an agreed action plan.
