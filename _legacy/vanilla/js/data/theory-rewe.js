/**
 * Theory — REWE Digital TRAB Team Deep Dive
 * All information classified: CONFIRMED / REASONABLE INFERENCE / INTERVIEW HYPOTHESIS / UNKNOWN
 */
const theoryRewe = [
  {
    id: 'theory-rewe-job',
    title: '📄 Official Job Description — Fullstack Developer TRAB',
    sections: [
      {
        heading: 'Position Details',
        content: `<table>
<tr><td><strong>Title</strong></td><td>LSP - Fullstack Developer TRAB (m/f/d)</td></tr>
<tr><td><strong>Location</strong></td><td>29590 Málaga (Technological Park of Andalusia — PTA)</td></tr>
<tr><td><strong>Type</strong></td><td>Full-time</td></tr>
<tr><td><strong>Level</strong></td><td>Experienced professionals</td></tr>
<tr><td><strong>Job ID</strong></td><td>61505</td></tr>
<tr><td><strong>Team</strong></td><td>TRAB (Transportabwicklung) — Transport Logistics division</td></tr>
<tr><td><strong>Company</strong></td><td>REWE digital Spain (subsidiary of REWE Group)</td></tr>
<tr><td><strong>Office size</strong></td><td>70+ colleagues in Málaga</td></tr>
<tr><td><strong>REWE Group</strong></td><td>~440,000 employees across Germany & Europe</td></tr>
</table>

<a href="https://www.rewe-digital.com/de/jobs/psl-fullstack-developer-trab-m-f-d--61505-dv-en" target="_blank" style="color:var(--blue);">🔗 Original job posting</a>`
      },
      {
        heading: 'About the team',
        content: `<div style="background:var(--surface2); padding:16px; border-radius:8px; border-left:3px solid var(--copper); line-height:1.8;">
"Our team of <strong>10</strong> is responsible for developing software solutions that manage <strong>distribution to more than 5,700 supermarkets</strong> in Germany, supporting <strong>warehouse staff, drivers, and logistics planners</strong>.

In addition, as part of the <strong>NEO project</strong>, the team is developing a <strong>unified communication platform</strong> that integrates seamlessly into the REWE digital ecosystem through a <strong>modular, plug-and-play architecture</strong>."
</div>`
      },
      {
        heading: 'What you will do',
        content: `• Development and maintenance of <strong>web applications, APIs, and backend services</strong> for managing transportation and logistics distribution processes.

• Implementation of <strong>new features and integrations</strong> for logistic platforms, connecting internal and external systems.

• Creation of <strong>interfaces and analytics tools</strong> to support warehouses, drivers, and logistics planners in their daily operations.

• Collaborating on <strong>agile teams</strong> to ensure the quality, performance, and availability of business-critical solutions, working alongside stakeholders and multidisciplinary teams.`
      },
      {
        heading: 'What you will bring',
        content: `<div style="display:flex; flex-direction:column; gap:8px;">
<div style="padding:8px 12px; background:var(--green-bg); border-radius:6px;">✅ <strong>Strong</strong> knowledge and experience in programming with <strong>Kotlin/Java</strong></div>
<div style="padding:8px 12px; background:var(--green-bg); border-radius:6px;">✅ Good knowledge of the current technology stack: <strong>Spring Boot, Kubernetes, GitLab, Kafka</strong></div>
<div style="padding:8px 12px; background:rgba(224,168,77,0.1); border-radius:6px;">🟡 Knowledge of <strong>Angular</strong> is important, but you don't need to be an expert</div>
<div style="padding:8px 12px; background:var(--surface2); border-radius:6px;">💬 Openness and willingness to communicate and work in <strong>English</strong></div>
<div style="padding:8px 12px; background:var(--surface2); border-radius:6px;">🎯 Ability to work <strong>independently</strong> and in a goal-oriented manner</div>
<div style="padding:8px 12px; background:var(--surface2); border-radius:6px;">🤝 <strong>"Team first" mindset</strong> — "we see ourselves as a team, not as individuals working in isolation"</div>
<div style="padding:8px 12px; background:var(--surface2); border-radius:6px;">🧠 <strong>Problem-solving and critical thinking</strong>: analyze complex problems, find alternative solutions, make data-driven decisions</div>
</div>`
      },
      {
        heading: 'What they offer',
        content: `• Startup-like culture + security of REWE Group
• Challenging tasks + tech playground
• Modern office (creativity, collaboration, agility)
• Flexible, autonomous work environment
• Open communication in international environment

<strong>Benefits:</strong>
• Hybrid work + flexible hours
• Private medical insurance (company conditions)
• Ticket Restaurant
• Professional development (Spanish/English/German courses + IT training)
• Day off on birthday
• 25 days paid vacation

<strong>Apply in English with salary expectations.</strong>`
      },
      {
        heading: '🎯 Key signals for interview preparation',
        content: `<strong>What the vacancy tells us about the role:</strong>

<table>
<tr><th>Signal</th><th>What it means for you</th></tr>
<tr><td>"Development AND maintenance"</td><td>Hybrid context — not pure greenfield</td></tr>
<tr><td>"Kotlin/Java" (Kotlin first!)</td><td>Team likely prefers Kotlin for new code</td></tr>
<tr><td>"Angular is important but not expert"</td><td>You'll touch frontend, but backend is primary</td></tr>
<tr><td>"5,700 supermarkets"</td><td>Massive scale, operationally critical</td></tr>
<tr><td>"Team first mindset"</td><td>Collaboration > individual heroics</td></tr>
<tr><td>"Data-driven decisions"</td><td>Expect metrics, monitoring, evidence-based choices</td></tr>
<tr><td>"International environment"</td><td>English daily, colleagues in Germany</td></tr>
<tr><td>"NEO — modular, plug-and-play"</td><td>Architecture questions WILL come up</td></tr>
<tr><td>"Business-critical solutions"</td><td>Reliability, availability, production readiness matter</td></tr>
<tr><td>"Work independently"</td><td>Autonomy expected — not hand-holding</td></tr>
</table>`
      }
    ]
  },
  {
    id: 'theory-rewe-trab',
    title: 'TRAB Team — Confirmed Context',
    sections: [
      {
        heading: 'What we KNOW (from the vacancy)',
        content: `<div style="background:var(--green-bg); padding:12px 16px; border-radius:6px; border-left:3px solid var(--green); margin-bottom:16px;">
<strong style="color:var(--green);">✅ CONFIRMED</strong></div>

• TRAB is a product team within REWE Digital's <strong>Transport Logistics</strong> division
• TRAB relates to the German term <strong>Transportabwicklung</strong>
• The team has approximately <strong>10 people</strong>
• They develop software to manage <strong>distribution of goods to 5,700+ supermarkets</strong> in Germany
• Users: <strong>warehouse staff, drivers, logistics planners</strong>
• They build: backend services, APIs, internal/external integrations, interfaces, analytical tools
• Stack: <strong>Java, Kotlin, Spring Boot, Kafka, Kubernetes, GitLab, Angular</strong>
• The team participates in the <strong>NEO project</strong>
• NEO is described as a <strong>unified communication platform</strong>, modular, plug-and-play
• International context, English communication
• Values: autonomy, communication, critical thinking, data-driven decisions, team-first mindset`
      },
      {
        heading: 'What is Transportabwicklung?',
        content: `<strong>Translation:</strong> Transport Execution / Transport Processing / Operational Transport Management

This concept is about the <strong>operational execution</strong> of transport, not abstract route planning:

<pre><code>Transport PLANNING          │  Transport EXECUTION (Transportabwicklung)
────────────────────────────│──────────────────────────────────────────
• Route definition          │  • Delivery preparation
• Capacity allocation       │  • Loading
• Scheduling                │  • Dispatch
• Vehicle selection         │  • Real-time tracking
• Load planning             │  • Status updates
                            │  • Delay handling
                            │  • Communication
                            │  • Arrival confirmation
                            │  • Delivery completion</code></pre>

<div style="background:var(--surface2); padding:10px 14px; border-radius:6px; margin-top:12px; font-size:0.8rem; color:var(--dim);">
ℹ️ This is general domain knowledge about transport execution, not a confirmed description of TRAB's internal architecture.
</div>`
      },
      {
        heading: 'Users and their probable needs',
        content: `<div style="background:var(--surface2); padding:10px 14px; border-radius:6px; border-left:3px solid var(--yellow); margin-bottom:12px;">
<strong style="color:var(--yellow);">🔶 REASONABLE INFERENCE</strong> — based on transport domain + vacancy</div>

<strong>🏭 Warehouse Staff:</strong> view loads, confirm preparation, organize loading, check schedules, register departures, handle exceptions

<strong>🚛 Drivers:</strong> receive instructions, view route, report departure/arrival/delays, confirm delivery, register problems

<strong>📊 Logistics Planners:</strong> monitor transports, track delays, prioritize exceptions, reorganize deliveries, analyze status, identify bottlenecks

<strong>🏢 External Carriers:</strong> receive orders, update status, confirm transport, integrate external systems, send execution events`
      },
      {
        heading: 'Probable delivery lifecycle states',
        content: `<pre><code>Store demand
    │
    ▼
Distribution planning
    │
    ▼
Warehouse preparation ──────── READY_FOR_LOADING
    │
    ▼
Transport order ────────────── PLANNED
    │
    ▼
Vehicle + driver assignment
    │
    ▼
Loading ────────────────────── LOADING → LOADED
    │
    ▼
Dispatch ───────────────────── DISPATCHED
    │
    ▼
Transport execution ────────── IN_TRANSIT (→ DELAYED if issues)
    │
    ▼
Arrival at store ───────────── ARRIVED
    │
    ▼
Delivery confirmation ──────── DELIVERED
    │
    ▼
Operational analytics ──────── COMPLETED</code></pre>

<div style="background:var(--surface2); padding:10px 14px; border-radius:6px; margin-top:12px; font-size:0.8rem; color:var(--dim);">
⚠️ These states are training examples, not confirmed TRAB system states.
</div>`
      }
    ]
  },
  {
    id: 'theory-rewe-problem',
    title: 'What Problem is TRAB Solving?',
    sections: [
      {
        heading: 'Core hypothesis',
        content: `<div style="background:var(--surface2); padding:10px 14px; border-radius:6px; border-left:3px solid var(--yellow); margin-bottom:12px;">
<strong style="color:var(--yellow);">🔶 REASONABLE INFERENCE</strong></div>

> TRAB probably needs to guarantee that transport information is distributed reliably, quickly, and traceably between warehouses, drivers, planners, stores, external carriers, and internal systems.

<strong>Probable challenges:</strong>
• Different systems using different formats
• Fragmented communication between actors
• Tight coupling between applications
• Difficulty tracking a delivery end-to-end
• No unified operational view
• Legacy integrations
• Growing number of carriers and systems
• Duplicate messages, out-of-order events
• External system unavailability
• Need for audit trail
• Need for 24/7 operation
• Need to modernize without interruption`
      },
      {
        heading: 'Why is REWE hiring?',
        content: `The hiring is probably related to a combination of:

<strong>1. Evolution of existing systems</strong> — new features, corrections, performance, new flows
<strong>2. Technological modernization</strong> — Spring Boot, Kafka, Kubernetes, Angular, CI/CD
<strong>3. New integrations</strong> — internal systems, carriers, driver apps, warehouses, analytics
<strong>4. NEO expansion</strong> — new modules, channels, connectors, communication flows
<strong>5. Operations & maintenance</strong> — incidents, bugs, availability, monitoring

<div style="background:var(--surface2); padding:14px; border-radius:8px; margin-top:16px;">
<strong>Key insight for interview:</strong>

"The team is probably NOT working only on maintenance and NOT working only on a greenfield project. The vacancy suggests a <strong>hybrid context</strong> involving existing production systems, modernization, new services, integrations, and the development of the NEO platform."
</div>`
      },
      {
        heading: 'Legacy, Modernization, and Greenfield',
        content: `<strong>Existing systems:</strong> consolidated rules, high operational impact, legacy integrations, domain dependencies, need for stability

<strong>Modernization strategies:</strong>
• Strangler pattern (wrap legacy, gradually replace)
• APIs around existing systems
• Domain-by-domain migration
• Event publication from legacy
• Coexistence between old and new

<strong>New services:</strong> new Kafka consumers, new APIs, new dashboards, new NEO plugins, new Spring Boot services

<strong>Interview question:</strong>
> "How would you modernize a transport system that cannot be taken offline?"

<strong>Strong answer:</strong>
"I would avoid a big-bang replacement. I would identify stable business boundaries, expose controlled APIs or events around the existing system, and gradually move capabilities to new services. During the transition, observability, data consistency, reconciliation, and rollback strategies would be essential."`
      }
    ]
  },
  {
    id: 'theory-rewe-neo',
    title: 'NEO — Unified Communication Platform',
    sections: [
      {
        heading: 'What we KNOW about NEO',
        content: `<div style="background:var(--green-bg); padding:12px 16px; border-radius:6px; border-left:3px solid var(--green); margin-bottom:16px;">
<strong style="color:var(--green);">✅ CONFIRMED</strong></div>

• NEO is mentioned in the job description
• The TRAB team participates in the project
• NEO is described as a <strong>unified communication platform</strong>
• It should integrate into the REWE Digital ecosystem
• It uses a <strong>modular, plug-and-play architectural approach</strong>

<div style="background:var(--red-bg); padding:12px 16px; border-radius:6px; border-left:3px solid var(--red); margin-top:16px;">
<strong style="color:var(--red);">❓ UNKNOWN — ASK THE TEAM</strong></div>

• What NEO stands for
• Whether NEO is new or already in production
• Which teams use it
• Which users interact with it
• Whether it communicates directly with drivers
• Whether it uses Kafka internally
• Whether plugins are Java components, services, or connectors
• Whether it is specific to logistics or shared across REWE domains
• Whether Málaga owns the platform or only part of it`
      },
      {
        heading: 'What "unified communication platform" might mean',
        content: `<div style="background:var(--surface2); padding:10px 14px; border-radius:6px; border-left:3px solid #b08ada; margin-bottom:12px;">
<strong style="color:#b08ada;">💡 INTERVIEW HYPOTHESIS</strong></div>

A unified communication platform might centralize: contracts, routing, authentication, transformation, retries, audit, monitoring, failure handling, channel integration, versioning.

<pre><code>Logistics systems (TRAB, other teams)
       │
       ▼
Communication request
       │
       ▼
NEO communication core
       │
       ┌───────────────────────┐
       │           │           │
       ▼           ▼           ▼
Driver app    Warehouse UI   External API
       │
       ▼
Audit and monitoring</code></pre>

<strong>This is a conceptual model for interview preparation, NOT confirmed REWE architecture.</strong>`
      },
      {
        heading: 'What "modular architecture" means',
        content: `> A modular architecture divides the system into components with clear responsibilities, explicit contracts, and low coupling.

<strong>Possible modules:</strong>
Communication Core, Routing Module, Template Module, Driver Integration, Warehouse Module, External Carrier Module, Audit Module, Retry Module, Monitoring Module, Security Module

<strong>Benefits:</strong> maintainability, isolation, testability, reuse, independent evolution, clear responsibilities

<strong>Risks:</strong> excess abstraction, hidden dependencies, unclear contracts, debugging difficulty, indirect coupling, configuration complexity`
      },
      {
        heading: 'What "plug-and-play architecture" means',
        content: `> Plug-and-play architecture means that new modules, integrations, or providers can be added with minimal changes to the core system.

The core depends on <strong>stable contracts</strong>, not concrete implementations.

<pre><code>public interface CommunicationPlugin {
    String pluginId();
    boolean supports(CommunicationRequest request);
    CommunicationResult execute(CommunicationRequest request);
}

@Component
public class DriverAppPlugin implements CommunicationPlugin { ... }

@Component
public class WarehouseDashboardPlugin implements CommunicationPlugin { ... }

@Component
public class ExternalCarrierPlugin implements CommunicationPlugin { ... }

// Core router — selects plugin at runtime
@Service
public class CommunicationRouter {
    private final List&lt;CommunicationPlugin&gt; plugins;

    public CommunicationResult route(CommunicationRequest request) {
        return plugins.stream()
            .filter(p -> p.supports(request))
            .findFirst()
            .orElseThrow(UnsupportedCommunicationException::new)
            .execute(request);
    }
}</code></pre>

<strong>Plug-and-play can be implemented at different levels:</strong>
• <strong>In-process:</strong> interfaces, DI, Strategy, Spring beans, Java SPI
• <strong>Distributed:</strong> independent services, Kafka consumers, connectors, service discovery
• <strong>Configuration:</strong> feature flags, environment-based plugins, declarative rules`
      }
    ]
  },
  {
    id: 'theory-rewe-connection',
    title: 'Connecting YOUR Experience to TRAB',
    sections: [
      {
        heading: 'Java EE → Spring Boot',
        content: `<strong>Transferable (Strong):</strong> DI, services, transactions, JPA, REST, validation, testing, business rules

<strong>Your honest position:</strong>
"I have 5+ years building enterprise systems with Java EE. The patterns — DI, transactions, persistence, messaging — are identical. I'm learning the Spring Boot API surface, which is the smallest part of the transition."`
      },
      {
        heading: 'JMS → Kafka',
        content: `<strong>Transferable:</strong> async processing, consumers, retries, failure handling, decoupling, eventual consistency

<strong>New concepts to acknowledge:</strong> log-based model, partitions, offsets, replay, consumer groups, retention, ordering by partition

<strong>Honest position:</strong>
"I've worked with JMS/Artemis (80+ queues, MDBs, idempotency, DLQ). The messaging PATTERNS transfer directly. What's different in Kafka is the architecture — log-based, consumers track position, replay is possible. I've studied this thoroughly and built practice projects."`
      },
      {
        heading: 'WildFly → Kubernetes',
        content: `<strong>Transferable:</strong> JVM, deployment, resources, production troubleshooting, configuration, monitoring

<strong>New concepts:</strong> pods, probes, replicas, rolling deployments, resource limits, graceful shutdown

<strong>Honest:</strong> "I'm learning K8s concepts. I understand containerization and the operational model, but I haven't managed production clusters."`
      },
      {
        heading: 'PrimeFaces → Angular',
        content: `<strong>Transferable:</strong> component-based thinking, forms, state management, backend integration, validation

<strong>Honest:</strong> "I have extensive UI experience with server-side rendering (JSF/PrimeFaces). Angular is new to me — I understand the concepts (components, services, TypeScript) but I'm not proficient yet. This is a growth area."`
      },
      {
        heading: 'PostgreSQL + Performance',
        content: `<strong>Direct match (Strong):</strong> indexes, EXPLAIN ANALYZE, query optimization, CTEs, partitioning, N+1 diagnosis, connection pool management

"This is one of my strongest areas. I've optimized systems with 2000+ tables, diagnosed production issues with connection pools, and built efficient queries for high-volume operations."`
      }
    ]
  },
  {
    id: 'theory-rewe-portfolio',
    title: '💼 Portfolio Project: SinapiPRO',
    sections: [
      {
        heading: 'What is SinapiPRO?',
        content: `<a href="https://github.com/SergioPacheco/sinapiPRO" target="_blank" style="color:var(--blue); font-size:0.9rem;">🔗 github.com/SergioPacheco/sinapiPRO</a>

<strong>SinapiPRO</strong> is an open-source ERP for construction project management — budgeting, measurements, scheduling, procurement, finance, safety, and analytics.

<div style="background:var(--surface2); padding:14px 18px; border-radius:8px; margin:12px 0;">
<strong>Stack:</strong> Java 25 + Spring Boot 4 + Angular 19 + PrimeNG 19 + PostgreSQL 17 + Docker + Kubernetes (Helm)
</div>

<strong>Why it's relevant to REWE TRAB:</strong>
This project demonstrates EVERY technology in the job description — built as a production-grade system, not a tutorial.`
      },
      {
        heading: '🎯 Direct match to TRAB vacancy requirements',
        content: `<table>
<tr><th>TRAB Requirement</th><th>SinapiPRO Implementation</th></tr>
<tr><td><strong>Java/Kotlin</strong></td><td>Java 25 with Virtual Threads, Structured Concurrency, Records, Sealed Classes</td></tr>
<tr><td><strong>Spring Boot</strong></td><td>Spring Boot 4 — REST, Security, WebSocket, Actuator, Profiles</td></tr>
<tr><td><strong>Kubernetes</strong></td><td>Helm charts, K8s manifests, health probes, graceful shutdown</td></tr>
<tr><td><strong>Angular</strong></td><td>Angular 19 — Signals, Standalone Components, PrimeNG, i18n, Cypress E2E</td></tr>
<tr><td><strong>CI/CD (GitLab)</strong></td><td>GitHub Actions (same concepts — pipeline stages, testing, deployment)</td></tr>
<tr><td><strong>Backend services + APIs</strong></td><td>30+ REST modules with OpenAPI 3.1, ProblemDetail (RFC 9457)</td></tr>
<tr><td><strong>Integrations</strong></td><td>Elasticsearch, Keycloak, AWS S3, WebSocket (STOMP), external APIs</td></tr>
<tr><td><strong>Analytics tools</strong></td><td>Dashboards, ECharts, business metrics, Grafana integration</td></tr>
<tr><td><strong>Quality & performance</strong></td><td>Testcontainers, ArchUnit, Resilience4j, Caffeine cache, Virtual Threads</td></tr>
<tr><td><strong>Observability</strong></td><td>Prometheus + Grafana + OpenTelemetry + Micrometer + custom business metrics</td></tr>
<tr><td><strong>Security</strong></td><td>JWT + OAuth2 + Keycloak + RBAC + Multi-tenant (row-level isolation)</td></tr>
<tr><td><strong>Modular architecture</strong></td><td>Vertical slices per domain (budget, measurement, schedule, procurement...)</td></tr>
</table>`
      },
      {
        heading: 'Architecture decisions that demonstrate seniority',
        content: `<strong>1. Vertical Slice Architecture:</strong>
Each module (budget, measurement, schedule) is a self-contained vertical slice with its own api/application/domain layers — exactly like microservices boundaries but inside a modular monolith.

<strong>2. Virtual Threads (Project Loom):</strong>
Enabled for all I/O operations — no need for reactive programming complexity while achieving high concurrency.

<strong>3. Structured Concurrency (JEP 480):</strong>
Used for parallel report generation — multiple data sources queried simultaneously with proper cancellation and error handling.

<strong>4. Circuit Breaker (Resilience4j):</strong>
External integrations (weather API, S3) protected with circuit breakers — system degrades gracefully when dependencies fail.

<strong>5. Multi-tenant with Row-Level Isolation:</strong>
Single deployment serves multiple construction companies — each sees only their data. Same challenge as serving multiple REWE warehouses.

<strong>6. Event-driven notifications:</strong>
WebSocket + STOMP for real-time updates — when a measurement is approved, all stakeholders see it immediately.

<strong>7. Testing strategy:</strong>
• 46 backend unit tests (JUnit 5 + Mockito)
• 12 integration tests (Testcontainers — real PostgreSQL)
• 38 frontend unit tests (Jest)
• 8 E2E tests (Cypress + accessibility checks)
• Architecture tests (ArchUnit)

<strong>8. Observability from day one:</strong>
Business metrics (not just technical) — "measurements approved per day", "budgets created" — same approach REWE would need for "deliveries completed per hour."`
      },
      {
        heading: 'How to present this in the interview',
        content: `<strong>30-second pitch:</strong>
"I built an open-source ERP for construction management — SinapiPRO. It uses Java 25, Spring Boot 4, Angular 19, PostgreSQL, Docker, and Kubernetes. It has 30+ business modules, each as a vertical slice. I chose this stack specifically to demonstrate proficiency with modern Java features like Virtual Threads, plus production concerns like observability with Prometheus/Grafana and security with Keycloak."

<strong>When they ask about Spring Boot experience:</strong>
"While my production experience is with Java EE, I built SinapiPRO from scratch with Spring Boot 4. I implemented REST APIs with ProblemDetail error handling, @Transactional services, Spring Security with JWT and OAuth2, Spring Data JPA with Testcontainers, and Actuator for health checks. You can see the code on my GitHub."

<strong>When they ask about Kubernetes:</strong>
"In SinapiPRO, I created Helm charts for Kubernetes deployment — including health probes, resource limits, secrets management, and horizontal scaling configuration. It's in the /helm directory of the repo."

<strong>When they ask about Angular:</strong>
"I built the frontend with Angular 19 using Signals for state management, standalone components, PrimeNG for the UI, i18n with three languages, and Cypress for E2E testing. I'm not an expert, but I can build functional UIs and understand the Angular mental model."

<strong>When they ask about testing:</strong>
"SinapiPRO follows the testing pyramid: unit tests with Mockito for business logic, integration tests with Testcontainers for real PostgreSQL queries, ArchUnit for architectural boundaries, and Cypress for critical E2E flows including accessibility checks."

<strong>Link:</strong> <a href="https://github.com/SergioPacheco/sinapiPRO" target="_blank" style="color:var(--blue);">github.com/SergioPacheco/sinapiPRO</a>`
      },
      {
        heading: 'Parallels between SinapiPRO and TRAB',
        content: `<table>
<tr><th>SinapiPRO (Construction)</th><th>TRAB (Transport Logistics)</th></tr>
<tr><td>Construction projects with multiple stakeholders</td><td>Deliveries with warehouses, drivers, planners</td></tr>
<tr><td>Measurement lifecycle (draft → submitted → approved)</td><td>Delivery lifecycle (planned → dispatched → delivered)</td></tr>
<tr><td>Multi-tenant (construction companies)</td><td>Multi-warehouse / multi-region</td></tr>
<tr><td>Real-time notifications (WebSocket)</td><td>Real-time tracking (driver positions, status)</td></tr>
<tr><td>External integrations (weather API, S3)</td><td>External integrations (carriers, driver apps)</td></tr>
<tr><td>Analytics dashboards (costs, progress)</td><td>Analytics dashboards (delivery metrics, delays)</td></tr>
<tr><td>RBAC per module (who can approve what)</td><td>Permissions per role (planner vs driver vs admin)</td></tr>
<tr><td>PDF/Excel report generation</td><td>Logistics reports and analytics exports</td></tr>
<tr><td>Vertical slices (budget, measurement, schedule)</td><td>Modular services (delivery, routing, communication)</td></tr>
<tr><td>Circuit breaker on external APIs</td><td>Resilience for carrier integrations</td></tr>
</table>

<div style="background:var(--green-bg); padding:14px 18px; border-radius:8px; margin-top:16px;">
<strong>Key message:</strong> "I built the EXACT type of system TRAB develops — operationally critical, multi-stakeholder, event-driven, with real-time updates, external integrations, and production-grade observability. The domain is different (construction vs logistics), but the engineering challenges are identical."
</div>`
      }
    ]
  },
  {
    id: 'theory-rewe-questions',
    title: 'Questions to Ask the TRAB Team',
    sections: [
      {
        heading: 'Validating our assumptions',
        content: `These questions demonstrate research, genuine interest, and senior thinking:

<strong>About the domain:</strong>
1. Which part of the transport lifecycle is owned by TRAB?
2. What are the main applications maintained by the team?
3. Are the current systems mainly modern, legacy, or hybrid?
4. Is the team currently focused more on new development or modernization?

<strong>About NEO:</strong>
5. What is the relationship between TRAB and NEO?
6. Is NEO already in production?
7. Which teams and users consume NEO?
8. What does "unified communication" mean in this context?
9. What does "plug-and-play" mean technically in NEO?
10. Are the plugins Spring modules, connectors, or independent services?

<strong>About operations:</strong>
11. Which integrations are the most critical?
12. How are external carriers integrated?
13. Which failures have the greatest operational impact?
14. Does the team own production support?

<strong>About the team:</strong>
15. How is work divided between Málaga and Germany?
16. What are the biggest technical challenges today?
17. What would the new developer work on first?
18. What would success look like after six months?`
      }
    ]
  }
];
