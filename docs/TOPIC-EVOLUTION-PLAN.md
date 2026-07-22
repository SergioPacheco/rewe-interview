# Topic Evolution Plan — Software Architecture & System Design

> Status: PLANNED (not yet implemented — waiting for content to fill each section)

## Princípio

| Tópico | Foco | Pergunta que responde |
|--------|------|----------------------|
| **Software Architecture** | Como o código é organizado | "How would you structure this codebase?" |
| **System Design** | Como o sistema funciona em produção | "How would you design this system at scale?" |

---

## Software Architecture (target structure)

Focado em organização de código e módulos.

```
Software Architecture
│
├── FOUNDATIONS
│     ├── Foundations & ADR
│     ├── Quality Attributes
│     └── Documentation
│
├── DOMAIN-DRIVEN DESIGN
│     │
│     ├── Strategic Design
│     │     ├── Why DDD Exists
│     │     ├── Ubiquitous Language
│     │     ├── Subdomains
│     │     ├── Bounded Context
│     │     └── Context Map
│     │
│     ├── Tactical Design
│     │     ├── Entity
│     │     ├── Value Object
│     │     ├── Aggregate
│     │     ├── Repository
│     │     ├── Domain Services
│     │     └── Domain Events
│     │
│     └── Complete Example
│
├── ARCHITECTURAL STYLES
│     ├── Layered
│     ├── Modular Monolith
│     ├── Hexagonal
│     ├── Clean
│     └── Microservices
│
├── API & INTEGRATION
│     ├── REST
│     ├── GraphQL
│     ├── gRPC
│     └── API Design
│
└── DATA ARCHITECTURE
      ├── Database Design
      └── Evolution & Legacy
```

---

## System Design (target structure)

Focado em como o sistema funciona em produção.

```
System Design
│
├── FOUNDATIONS
│     ├── Requirements
│     ├── Functional vs Non-Functional
│     ├── Capacity Estimation
│     └── Trade-offs
│
├── SHAPE THE FLOW
│     ├── Event-Driven Architecture
│     ├── Data Consistency
│     ├── CQRS
│     ├── Sagas
│     └── Event Sourcing
│
├── PROTECT DATA
│     ├── Transactions
│     ├── Replication
│     ├── Sharding
│     ├── Caching
│     └── Idempotency
│
├── SCALE
│     ├── Scaling
│     ├── Load Balancing
│     ├── CDN
│     └── Rate Limiting
│
├── OPERATIONS
│     ├── Deployment
│     ├── Observability
│     ├── Monitoring
│     ├── Logging
│     └── Tracing
│
└── CASE STUDIES
      ├── URL Shortener
      ├── Uber
      ├── WhatsApp
      ├── Netflix
      └── Amazon Cart
```

---

## Migration Strategy

When content is ready to fill each section:

1. Split current `software-architecture` topic into two: `software-architecture` + `system-design`
2. Move subtopics to their new homes based on the mapping below
3. Create new subtopics for sections that don't exist yet
4. Update theory files, exercises, and interview questions accordingly

### Current → Future mapping

| Current subtopic | Future home |
|-----------------|-------------|
| arch-foundations | SA → Foundations |
| arch-quality-attributes | SA → Foundations |
| arch-documentation | SA → Foundations |
| sdm-use-cases | SA → Foundations (or remove) |
| sdm-class-diagrams | SA → Foundations (or remove) |
| sdm-sequence-diagrams | SA → Foundations (or remove) |
| sdm-communication | SA → Foundations |
| ddd-* (all 12) | SA → DDD |
| arch-styles | SA → Architectural Styles |
| arch-modularity | SA → Architectural Styles |
| arch-application | SA → Architectural Styles |
| arch-distributed | SD → Shape the Flow |
| sd-events | SD → Shape the Flow |
| sd-data | SD → Protect Data |
| sd-scaling | SD → Scale |
| arch-data | SA → Data Architecture |
| sdm-data-modeling | SA → Data Architecture |
| sdm-architecture | SA → Foundations |
| arch-integration | SA → API & Integration |
| arch-evolution | SA → Data Architecture |
| sd-ops | SD → Operations |

### New content needed (not yet written)

**Software Architecture:**
- Layered, Hexagonal, Clean, Microservices (individual chapters)
- GraphQL, gRPC chapters
- API Design principles

**System Design:**
- Requirements & Capacity Estimation
- CQRS, Sagas, Event Sourcing (dedicated chapters)
- Replication, Sharding, Caching (dedicated chapters)
- Load Balancing, CDN, Rate Limiting
- Monitoring, Logging, Tracing (dedicated chapters)
- Case Studies (URL Shortener, Uber, WhatsApp, Netflix, Amazon Cart)

---

## When to Execute

Execute this migration when:
- [ ] At least 3 System Design case studies are written
- [ ] Capacity Estimation and Trade-offs chapters exist
- [ ] CQRS, Sagas, Event Sourcing have individual chapters
- [ ] Scale section has at least 3 chapters (Load Balancing, CDN, Rate Limiting)

Until then, the current merged `software-architecture` topic works fine for interview prep.
