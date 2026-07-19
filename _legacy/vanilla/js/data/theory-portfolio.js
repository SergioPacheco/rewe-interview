/**
 * Theory — Portfolio: SinapiPRO Deep Dive
 * Complete analysis of the project for interview presentation
 */
const theoryPortfolio = [
  {
    id: 'theory-port-overview',
    title: 'SinapiPRO — Project Overview',
    sections: [
      {
        heading: 'What is SinapiPRO?',
        content: `<a href="https://github.com/SergioPacheco/sinapiPRO" target="_blank" style="color:var(--blue);">🔗 github.com/SergioPacheco/sinapiPRO</a>

<strong>SinapiPRO</strong> is an open-source ERP for construction project management. It covers the entire lifecycle: budgeting, work measurements, scheduling, procurement, finance, safety, equipment, and analytics.

<div style="background:var(--surface2); padding:14px 18px; border-radius:8px; margin:12px 0; line-height:1.8;">
<strong>Tech Stack:</strong>
• Backend: <strong>Java 25</strong> + <strong>Spring Boot 4.0.5</strong>
• Frontend: <strong>Angular 19</strong> + <strong>PrimeNG 19</strong> + ECharts
• Database: <strong>PostgreSQL 17</strong> + Flyway migrations
• Search: <strong>Elasticsearch 8</strong> (full-text)
• Security: <strong>JWT + OAuth2 + Keycloak 26</strong>
• Infrastructure: <strong>Docker</strong> + <strong>Kubernetes (Helm)</strong>
• Observability: <strong>Prometheus + Grafana + OpenTelemetry</strong>
• CI/CD: <strong>GitHub Actions</strong>
• Testing: JUnit 5, Mockito, <strong>Testcontainers</strong>, Cypress, ArchUnit
</div>

<strong>Scale:</strong> 239 commits, 30+ backend modules, 30+ frontend pages, 13 Flyway migrations, 46 backend tests, 38 frontend tests, 8 E2E tests.`
      },
      {
        heading: 'Project architecture',
        content: `<pre><code>┌─────────────────────────────────────────────────────────┐
│              Frontend (Angular 19 + PrimeNG 19)          │
│  Signals · Standalone · ECharts · i18n (pt/en/es)       │
└──────────────────────────┬──────────────────────────────┘
                           │ REST + WebSocket (STOMP)
┌──────────────────────────▼──────────────────────────────┐
│            API (Spring Boot 4 + Java 25)                 │
│                                                          │
│  ┌────────┐ ┌───────────┐ ┌────────┐ ┌──────────┐      │
│  │ Budget │ │Measurement│ │Schedule│ │Procurement│ ...   │
│  └───┬────┘ └─────┬─────┘ └───┬────┘ └─────┬────┘      │
│      │            │           │             │            │
│  ┌───▼────────────▼───────────▼─────────────▼─────────┐ │
│  │  Shared (Events · Observability · Security · Audit) │ │
│  └────────────────────────────────────────────────────┘ │
└────┬───────────┬───────────┬──────────────┬─────────────┘
     │           │           │              │
┌────▼────┐ ┌───▼────┐ ┌────▼─────┐ ┌─────▼──────┐
│PostgreSQL│ │Elastic │ │ Keycloak │ │ Prometheus │
│    17    │ │Search 8│ │   26.x   │ │ + Grafana  │
└──────────┘ └────────┘ └──────────┘ └────────────┘</code></pre>`
      }
    ]
  },
  {
    id: 'theory-port-backend',
    title: 'Backend — Java 25 + Spring Boot 4',
    sections: [
      {
        heading: 'Modern Java features used',
        content: `<table>
<tr><th>Feature</th><th>Java Version</th><th>Usage in SinapiPRO</th></tr>
<tr><td><strong>Virtual Threads</strong></td><td>Java 21+</td><td>Enabled globally: <code>spring.threads.virtual.enabled=true</code><br>All HTTP handlers run on virtual threads — high concurrency without reactive complexity</td></tr>
<tr><td><strong>Structured Concurrency</strong></td><td>Java 21+ (JEP 480)</td><td>Parallel report generation — query multiple data sources simultaneously with proper cancellation</td></tr>
<tr><td><strong>Records</strong></td><td>Java 16+</td><td>DTOs: <code>BudgetResponse</code>, <code>CreateBudgetRequest</code>, <code>TokenResponse</code></td></tr>
<tr><td><strong>Sealed Classes</strong></td><td>Java 17+</td><td>Domain events: closed set of operation types</td></tr>
<tr><td><strong>Pattern Matching</strong></td><td>Java 16+</td><td>Switch expressions with type patterns in event handlers</td></tr>
<tr><td><strong>Text Blocks</strong></td><td>Java 15+</td><td>SQL queries, JSON templates, multiline strings</td></tr>
<tr><td><strong>Module imports</strong></td><td>Java 23+</td><td><code>import module java.base;</code> (preview feature)</td></tr>
</table>`
      },
      {
        heading: 'Spring Boot ecosystem',
        content: `<strong>Dependencies (from pom.xml):</strong>
<pre><code>spring-boot-starter-web          ← REST APIs
spring-boot-starter-data-jpa     ← JPA/Hibernate + PostgreSQL
spring-boot-starter-security     ← Security framework
spring-boot-starter-oauth2-resource-server  ← JWT/OAuth2
spring-boot-starter-validation   ← Bean Validation
spring-boot-starter-actuator     ← Health + Metrics
spring-boot-starter-mail         ← Email notifications
spring-boot-starter-webflux      ← WebClient for external APIs
spring-boot-docker-compose       ← Dev Docker integration
spring-boot-testcontainers       ← Integration testing
flyway-core + flyway-database-postgresql  ← DB migrations
springdoc-openapi-starter-webmvc-ui       ← Swagger/OpenAPI 3.1
micrometer-registry-prometheus   ← Prometheus metrics
micrometer-tracing-bridge-otel   ← Distributed tracing
opentelemetry-exporter-otlp      ← OpenTelemetry export
poi-ooxml                        ← Excel generation
aws-sdk s3 + s3-transfer-manager ← Object storage</code></pre>

<strong>Key configuration choices:</strong>
• <code>open-in-view: false</code> — prevents lazy loading outside transactions (best practice!)
• <code>default_batch_fetch_size: 64</code> — mitigates N+1 automatically
• <code>server.shutdown: graceful</code> — K8s-ready graceful shutdown
• <code>problemdetails.enabled: true</code> — RFC 9457 error responses
• HikariCP pool: max 20 connections, min-idle 4
• Caffeine cache: 500 entries max, 10min TTL, stats recorded`
      },
      {
        heading: 'Vertical Slice Architecture (30+ modules)',
        content: `Each module follows the same internal pattern:

<pre><code>budget/
├── api/                    ← REST Controllers + Request/Response DTOs
│   ├── BudgetController.java
│   ├── BudgetDetailController.java
│   ├── BudgetOperationsController.java
│   ├── BudgetFilter.java
│   ├── CreateBudgetRequest.java
│   └── BudgetResponse.java
├── application/            ← Services (business logic + orchestration)
│   ├── BudgetService.java
│   ├── BudgetCalculationService.java
│   ├── AbcCurveService.java
│   └── BulkEntryService.java
└── domain/                 ← Entities + Repositories (persistence)
    ├── Budget.java
    ├── BudgetItem.java
    ├── BudgetStatus.java
    ├── BudgetRepository.java
    └── BdiConfig.java</code></pre>

<strong>30 business modules:</strong> budget, measurement, schedule, procurement, contract, finance, invoice, jobcosting, equipment, safety, dailylog, document, rfi, punchlist, submittal, timetracking, notification, commercial, aftersales, delivery, analytics, sinapi, weather, supplier, project, tenant, security, inventory, registry, team, forecast, report

<strong>This is exactly what TRAB needs:</strong> each transport domain (delivery, routing, driver, warehouse) as a vertical slice with clear boundaries.`
      }
    ]
  },
  {
    id: 'theory-port-infra',
    title: 'Infrastructure — Docker, K8s, CI/CD, Observability',
    sections: [
      {
        heading: 'Kubernetes deployment',
        content: `<strong>K8s manifests (/k8s/):</strong>
<pre><code>k8s/
├── namespace.yaml     ← Dedicated namespace
├── deployment.yaml    ← 2 replicas, resource limits, health probes
├── service.yaml       ← ClusterIP service
├── ingress.yaml       ← External access
├── hpa.yaml           ← HorizontalPodAutoscaler (auto-scaling)
├── configmap.yaml     ← Environment configuration
├── secret.yaml        ← Sensitive data (DB credentials)
└── postgres.yaml      ← StatefulSet for database</code></pre>

<strong>Deployment highlights:</strong>
• 2 replicas by default (high availability)
• Resource requests: 500m CPU, 512Mi memory
• Resource limits: 2 CPU, 1Gi memory
• Separate management port (8081) for Actuator
• ConfigMap for non-sensitive config
• Secrets for DB credentials (referenced via secretKeyRef)
• HPA for auto-scaling based on CPU

<strong>Helm chart (/helm/sinapipro/):</strong>
Templated deployment for multiple environments — values.yaml for customization.`
      },
      {
        heading: 'CI/CD Pipeline (GitHub Actions)',
        content: `<pre><code>name: CI/CD Pipeline
triggers: push to main/develop, PRs to main

jobs:
  build:
    services: postgres:17.5 (integration tests)
    steps:
      1. Checkout code
      2. Setup Java 25 (Temurin)
      3. Cache Maven dependencies
      4. Build + test (mvn verify)
      5. Upload test results
      6. Build Docker image
      7. Push to GitHub Container Registry (ghcr.io)</code></pre>

<strong>What this demonstrates:</strong>
• Automated testing on every push
• Real PostgreSQL in CI (not H2)
• Docker image built and pushed to registry
• Same pipeline concept as GitLab CI (which TRAB uses)`
      },
      {
        heading: 'Observability stack',
        content: `<strong>Three pillars implemented:</strong>

<strong>1. Metrics (Prometheus + Micrometer):</strong>
• JVM metrics (heap, GC, threads, virtual threads)
• HTTP metrics (latency p50/p95/p99, throughput, errors)
• Cache metrics (Caffeine hit ratio, evictions)
• Database metrics (HikariCP pool usage, query time)
• <strong>Custom business metrics:</strong>
  - <code>sinapipro.measurement.status.total{status}</code>
  - <code>sinapipro.budget.created.total</code>
  - <code>sinapipro.email.sent.total{result}</code>

<strong>2. Dashboards (Grafana):</strong>
• Pre-built SLO dashboard (grafana/dashboards/slo-dashboard.json)
• SLO alerts configuration (slo-alerts.json)

<strong>3. Distributed Tracing (OpenTelemetry):</strong>
• <code>micrometer-tracing-bridge-otel</code> + <code>opentelemetry-exporter-otlp</code>
• Trace requests across services
• Identify slow operations

<strong>Connection to TRAB:</strong> REWE needs the same observability — "how many deliveries completed per hour?", "which integration is slow?", "are our SLOs being met?"`
      },
      {
        heading: 'Docker Compose (local development)',
        content: `<pre><code># compose.dev.yaml — full local stack:
services:
  - API (Spring Boot)
  - PostgreSQL 17
  - Angular frontend (nginx)
  - Keycloak 26 (authentication)
  - Elasticsearch 8 (search)
  - Prometheus + Grafana (observability)
  - SonarQube (code quality)
  - MailHog (email testing)

# One command: docker compose -f compose.dev.yaml up
# Everything running locally in minutes</code></pre>`
      }
    ]
  },
  {
    id: 'theory-port-quality',
    title: 'Quality — Testing, Security, Resilience',
    sections: [
      {
        heading: 'Testing strategy (pyramid)',
        content: `<table>
<tr><th>Layer</th><th>Tool</th><th>Count</th><th>What it tests</th></tr>
<tr><td>Unit (backend)</td><td>JUnit 5 + Mockito</td><td>46</td><td>Services, calculations, domain logic</td></tr>
<tr><td>Integration (backend)</td><td>Testcontainers + @SpringBootTest</td><td>12</td><td>Controllers, DB queries, auth flow</td></tr>
<tr><td>Architecture</td><td>ArchUnit</td><td>1 class</td><td>Layer boundaries, naming, dependencies</td></tr>
<tr><td>Unit (frontend)</td><td>Jest</td><td>38</td><td>Components, services, pipes</td></tr>
<tr><td>E2E</td><td>Cypress 14 + cypress-axe</td><td>8</td><td>Critical user flows + accessibility</td></tr>
</table>

<strong>Examples of tests:</strong>
• <code>BudgetServiceTest</code> — business logic for budget calculations
• <code>BudgetControllerIntegrationTest</code> — REST endpoint with real DB
• <code>MeasurementFlowIntegrationTest</code> — full lifecycle (create → submit → approve)
• <code>AuthControllerIntegrationTest</code> — login, token, refresh
• <code>TenantIsolationTest</code> — verify data isolation between tenants
• <code>RbacAuthorizationTest</code> — permission checks per role
• <code>ArchitectureBoundaryTest</code> — ArchUnit rules for module boundaries`
      },
      {
        heading: 'Security implementation',
        content: `<strong>Multi-layered security:</strong>

<pre><code>// SecurityConfiguration.java
@EnableMethodSecurity  ← method-level authorization
SessionCreationPolicy.STATELESS  ← no server sessions (JWT)
OAuth2 Resource Server  ← validates JWT tokens
BearerTokenAuthenticationFilter  ← extracts token from header
UserProvisioningFilter  ← auto-creates user on first login</code></pre>

<strong>Components:</strong>
• <code>JwtTokenService</code> — issue + validate JWT
• <code>PermissionEvaluatorBean</code> — fine-grained permission checks
• <code>ProjectAccessInterceptor</code> — project-level access control
• <code>UserProvisioningFilter</code> — auto-provision from Keycloak
• RBAC with <code>Role</code>, <code>Permissions</code>, <code>DefaultRoles</code>
• Multi-tenant isolation via <code>TenantAwareEntity</code> + <code>TenantAwareRepository</code>

<strong>Connection to TRAB:</strong> Same patterns needed for logistics — role-based access (planner can reassign, driver can only update own status), tenant isolation (per warehouse or region), JWT for stateless API auth.`
      },
      {
        heading: 'Resilience & Error handling',
        content: `<strong>Circuit Breaker (Resilience4j):</strong>
External integrations (weather API, S3) protected — system degrades gracefully when dependencies fail.

<strong>Rate Limiting:</strong>
<pre><code>// RateLimitFilter.java
MAX_REQUESTS_PER_MINUTE = 120
ConcurrentHashMap<String, TokenBucket> per client
Skip: /actuator endpoints
Response: 429 Too Many Requests</code></pre>

<strong>Error handling (RFC 9457 ProblemDetail):</strong>
<pre><code>// shared/error/
ApiExceptionHandler.java       ← Global @RestControllerAdvice
DomainException.java           ← Base business exception
DomainNotFoundException.java   ← 404
DomainConflictException.java   ← 409
DomainValidationException.java ← 400</code></pre>

<strong>Domain Events:</strong>
<pre><code>// shared/events/
DomainEvent.java               ← Base event
OperationEvent.java            ← Operation tracking
OperationEventPublisher.java   ← Publishes to ApplicationEventPublisher
OperationEventType.java        ← CREATED, UPDATED, DELETED, STATUS_CHANGED</code></pre>

Same patterns TRAB uses: event-driven, resilient external integrations, consistent error format.`
      }
    ]
  },
  {
    id: 'theory-port-frontend',
    title: 'Frontend — Angular 19 + PrimeNG',
    sections: [
      {
        heading: 'Angular architecture',
        content: `<pre><code>web/src/app/
├── core/                  ← Singleton services, guards, interceptors
│   ├── guards/            ← Route protection (auth, roles)
│   ├── interceptors/      ← JWT token injection, error handling
│   └── services/          ← API clients, state management
├── layout/                ← App shell (sidebar, topbar, footer)
├── pages/                 ← Feature pages (30+)
│   ├── dashboard/
│   ├── budget-worksheet/
│   ├── measurement/
│   ├── procurement/
│   ├── finance/
│   ├── analytics/
│   └── ... (30+ pages)
├── shared/                ← Reusable components, pipes, directives
└── assets/i18n/           ← pt-BR, en, es translations</code></pre>

<strong>Key features:</strong>
• <strong>Standalone Components</strong> (no NgModules — modern Angular)
• <strong>Angular Signals</strong> for reactive state management
• <strong>PrimeNG 19</strong> — DataTables, Charts, Forms, Dialogs
• <strong>PrimeFlex 4</strong> — responsive grid
• <strong>ECharts 6</strong> — interactive charts (S-Curve, ABC Curve, cash flow)
• <strong>i18n</strong> — 3 languages (ngx-translate)
• <strong>Dark mode</strong> — CSS variables + theme toggle
• <strong>Cypress E2E</strong> with <strong>cypress-axe</strong> (WCAG accessibility testing)

<strong>For the TRAB interview:</strong> "I built the frontend with Angular 19 using signals, standalone components, and PrimeNG. I'm not an expert, but I can build functional interfaces and understand the Angular mental model — components, services, routing, interceptors, reactive patterns."`
      }
    ]
  },
  {
    id: 'theory-port-pitch',
    title: 'Interview Pitch Scripts',
    sections: [
      {
        heading: '30-second elevator pitch',
        content: `<div style="background:var(--green-bg); padding:16px 20px; border-radius:8px; border-left:3px solid var(--green);">
"I built an open-source ERP for construction management called <strong>SinapiPRO</strong>. It uses Java 25, Spring Boot 4, Angular 19, PostgreSQL, Docker, and Kubernetes. It has 30+ business modules each as a vertical slice — budget, measurements, scheduling, procurement, finance. I chose this stack specifically because it matches what REWE TRAB uses, and because the engineering challenges are identical: multi-stakeholder operations, real-time updates, external integrations, and production-grade observability."
</div>`
      },
      {
        heading: 'When asked: "Do you have Spring Boot experience?"',
        content: `<div style="background:var(--surface2); padding:16px 20px; border-radius:8px;">
"My production experience is with Java EE, but I built SinapiPRO entirely with Spring Boot 4 — from scratch. I implemented REST APIs with ProblemDetail error handling, @Transactional services with JPA, Spring Security with JWT and OAuth2, Spring Data JPA with Testcontainers, and Actuator for health and metrics. The project uses virtual threads, Flyway migrations, Caffeine caching with metrics, and Resilience4j circuit breakers. It's all on my GitHub — 239 commits of actual code."
</div>`
      },
      {
        heading: 'When asked: "What about Kubernetes?"',
        content: `<div style="background:var(--surface2); padding:16px 20px; border-radius:8px;">
"In SinapiPRO, I created both raw K8s manifests and Helm charts. The deployment has 2 replicas, health probes for liveness and readiness on separate ports, resource limits, HPA for auto-scaling, ConfigMaps for environment config, and Secrets for credentials. I also configured graceful shutdown so in-flight requests complete during deployments. You can see it in the /k8s and /helm directories."
</div>`
      },
      {
        heading: 'When asked: "What about observability?"',
        content: `<div style="background:var(--surface2); padding:16px 20px; border-radius:8px;">
"SinapiPRO has full observability from day one. Prometheus collects metrics via Micrometer — not just JVM metrics but <em>custom business metrics</em> like 'measurements approved per day' and 'budgets created'. Grafana dashboards with SLO alerts. OpenTelemetry for distributed tracing. This is the same approach I'd use at REWE — 'deliveries completed per hour' would be a business metric, not just technical monitoring."
</div>`
      },
      {
        heading: 'When asked: "Show me an architectural decision"',
        content: `<div style="background:var(--surface2); padding:16px 20px; border-radius:8px;">
"I chose vertical slice architecture over layered architecture. Each module — budget, measurement, schedule — is completely self-contained with its own controllers, services, and domain entities. The shared layer only contains cross-cutting concerns: events, observability, security, and error handling.

Why? Because when I need to modify 'budget', I touch files in one directory. I don't need to navigate 5 different packages. This maps directly to team ownership — at REWE, the delivery module could be owned by one sub-team, routing by another, without stepping on each other."
</div>`
      },
      {
        heading: 'The killer argument',
        content: `<div style="background:var(--green-bg); padding:16px 20px; border-radius:8px; border-left:3px solid var(--green);">
<strong>Key message for the interviewer:</strong>

"I didn't just STUDY the stack — I BUILT a complete system with it. SinapiPRO is not a tutorial project. It has 30+ business modules, multi-tenant isolation, JWT security, Kubernetes deployment, CI/CD, observability, and a full test suite. The domain is different (construction vs logistics), but the engineering challenges are identical:

• Multi-stakeholder operations (warehouse ↔ drivers ↔ planners = engineers ↔ managers ↔ clients)
• State machines (delivery lifecycle = measurement lifecycle)
• Real-time notifications (WebSocket for both)
• External integrations with resilience (carriers = weather API, S3)
• Analytics dashboards (delivery metrics = cost metrics)
• Production-grade quality (monitoring, alerting, graceful degradation)

This is the kind of system TRAB builds. I've built one."
</div>`
      }
    ]
  },
  {
    id: 'theory-port-parallels',
    title: 'SinapiPRO ↔ TRAB Parallels',
    sections: [
      {
        heading: 'Domain parallels',
        content: `<table>
<tr><th>SinapiPRO (Construction)</th><th>TRAB (Transport Logistics)</th></tr>
<tr><td>Construction projects with multiple stakeholders</td><td>Deliveries with warehouses, drivers, planners</td></tr>
<tr><td>Measurement lifecycle (draft → submitted → approved → paid)</td><td>Delivery lifecycle (planned → dispatched → delivered)</td></tr>
<tr><td>Multi-tenant (construction companies)</td><td>Multi-warehouse / multi-region</td></tr>
<tr><td>Real-time notifications (WebSocket/STOMP)</td><td>Real-time tracking (driver positions, status updates)</td></tr>
<tr><td>External integrations (weather API, S3, Elasticsearch)</td><td>External integrations (carriers, driver apps)</td></tr>
<tr><td>Analytics dashboards (costs, progress, S-Curve)</td><td>Analytics dashboards (delivery metrics, delays)</td></tr>
<tr><td>RBAC per module (engineer, manager, admin)</td><td>Permissions per role (planner, driver, admin)</td></tr>
<tr><td>PDF/Excel report generation</td><td>Logistics reports and analytics exports</td></tr>
<tr><td>Vertical slices (budget, measurement, schedule)</td><td>Modular services (delivery, routing, communication)</td></tr>
<tr><td>Circuit breaker on external APIs</td><td>Resilience for carrier integrations</td></tr>
<tr><td>Rate limiting (API protection)</td><td>Rate limiting (carrier API quotas)</td></tr>
<tr><td>Domain events (measurement approved → notify)</td><td>Domain events (delivery completed → billing, notify)</td></tr>
<tr><td>Flyway migrations (schema evolution)</td><td>Database migrations in production</td></tr>
<tr><td>Graceful shutdown (K8s readiness)</td><td>Zero-downtime deployments</td></tr>
</table>`
      },
      {
        heading: 'Technical patterns that transfer directly',
        content: `<strong>Patterns I implemented in SinapiPRO that TRAB needs:</strong>

<strong>1. Event-driven notifications:</strong>
<pre><code>// SinapiPRO: measurement approved → notify stakeholders
OperationEventPublisher.publish(MEASUREMENT_APPROVED, measurement);

// TRAB equivalent: delivery dispatched → notify driver
eventPublisher.publish(DELIVERY_DISPATCHED, delivery);</code></pre>

<strong>2. Multi-tenant data isolation:</strong>
<pre><code>// SinapiPRO: TenantAwareEntity + filter by tenant_id
// TRAB equivalent: filter by warehouse_id or region_id</code></pre>

<strong>3. Fine-grained RBAC:</strong>
<pre><code>// SinapiPRO: @PreAuthorize("hasPermission(#projectId, 'BUDGET_APPROVE')")
// TRAB equivalent: @PreAuthorize("hasPermission(#deliveryId, 'DISPATCH')")</code></pre>

<strong>4. Circuit breaker on external services:</strong>
<pre><code>// SinapiPRO: weather API protected with Resilience4j
// TRAB equivalent: carrier API protected with same pattern</code></pre>

<strong>5. Business metrics (not just technical):</strong>
<pre><code>// SinapiPRO: sinapipro.measurement.status.total{status=APPROVED}
// TRAB equivalent: trab.delivery.status.total{status=DELIVERED}</code></pre>`
      }
    ]
  }
];
