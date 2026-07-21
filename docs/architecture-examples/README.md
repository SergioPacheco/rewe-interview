# Architecture Example Pack — ParcelFlow

This directory is a small, fictional reference pack showing the kinds of artefacts an architect may use in day-to-day work. It is deliberately centred on one ordinary system: customers create delivery requests; billing and notifications react later; operations must detect and recover from failures. It is not a production architecture.

## What an architect does day to day

An architect is not primarily the person who picks a framework or draws a final diagram. The practical work is to make constraints, decisions, risks, and ownership visible enough for a team to deliver safely.

Typical activities:

- Clarify business outcomes, constraints, volumes, service expectations, and risk.
- Turn vague quality requirements into measurable scenarios and SLOs.
- Define module boundaries, data ownership, API/event contracts, and integration rules.
- Run or request POCs where a decision has meaningful uncertainty.
- Review changes that affect security, reliability, cost, data, or team autonomy.
- Ensure deployment, observability, incident response, and rollback are designed before release.
- Record significant decisions and revisit them when their assumptions change.

## What an architect needs to know

The goal is decision literacy, not encyclopaedic knowledge of products.

| Area | Questions to answer |
|---|---|
| Domain | Who owns a rule? What business invariant must hold? |
| Quality | What does fast, available, secure, and recoverable mean in measurable terms? |
| Data | What is the source of truth? What can be delayed or duplicated? |
| Integration | Does the caller need an answer now? How does the contract evolve? |
| Reliability | What happens after timeout, partial failure, retry, duplicate event, or overload? |
| Security | Who can do what, from where, with what evidence? |
| Operations | How will the team detect customer harm, diagnose it, mitigate it, and roll back? |
| Economics | What complexity, cloud cost, latency, and team ownership does a choice create? |

## Artefacts in this pack

| Artefact | Why it exists |
|---|---|
| [Quality scenarios](artefacts/quality-scenarios.md) | Converts adjectives into testable behaviour. |
| [ADR](artefacts/adr-014-order-created.md) | Preserves a significant decision and its trade-offs. |
| [OpenAPI excerpt](artefacts/order-api.yaml) | Defines the synchronous consumer contract. |
| [Async event contract](artefacts/order-created-event.yaml) | Defines ownership, compatibility, and recovery expectations. |
| [Outbox POC](artefacts/outbox-poc.md) | Replaces an assumption with evidence. |
| [Threat model](artefacts/threat-model.md) | Makes abuse paths and controls explicit. |
| [Runbook](artefacts/runbook-consumer-lag.md) | Turns an alert into a safe response. |
| [Visualisations](visualizations/) | C4 system context, container, component, dynamic, and deployment views. |

## Full architecture delivery pack

The core files above are intentionally small. For a distributed system with higher risk or scale, use these companion artefacts as well:

| Stage | Artefact example | Primary audience |
|---|---|---|
| Discovery | [Architecture vision](artefacts/architecture-vision.md), [ASRs and NFRs](artefacts/asrs-and-nfrs.md) | Product, engineering, leadership |
| Design | [Domain and data ownership](artefacts/domain-and-data-ownership.md), [integration catalogue](artefacts/integration-catalog.md), C4/sequence/deployment views | Developers, architects, security |
| Decision | ADRs, [trade-offs, risks, and resilience](artefacts/tradeoffs-risks-and-resilience.md) | Engineering, platform, management |
| Operations | [Observability, capacity, and recovery](artefacts/observability-capacity-and-dr.md), SLOs, dashboards, runbooks | SRE, platform, support |
| Evolution | [Delivery governance and evolution](artefacts/delivery-governance-and-evolution.md), migration plan, fitness functions, roadmap | Development, platform, leadership |

Not every project needs every document. Use an artefact when it helps a named audience make or validate a meaningful decision. A small internal product may need a vision, ASRs, two C4 views, ADRs, API contract, SLOs, and runbook; a multi-region regulated platform will need the extended pack.

## How to use this pack

1. Read the quality scenarios before the diagrams; they explain why the design exists.
2. Read the C4 context and container views to understand scope and ownership.
3. Follow the request sequence and event recovery diagrams together.
4. Compare the ADR with the POC plan: a decision should be supported by evidence.
5. Read the runbook and threat model as part of the design, not as post-release documentation.

The editable C4 sources use PlantUML and the vendored C4-PlantUML library. The application renders their SVGs. Render them with PlantUML using `-DRELATIVE_INCLUDE=1`; the generated SVGs are in `public/assets/architecture-examples/c4/`.
