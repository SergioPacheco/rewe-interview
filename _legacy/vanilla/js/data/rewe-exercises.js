/**
 * REWE TRAB Team — Practice (15 mandatory exercises)
 * Each with confidence level, interviewer intent, answers at multiple depths
 */
const reweExercises = [
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'TRAB Context',
    question: 'What do you understand about the TRAB team?',
    context: '🏷️ CONFIRMED — The interviewer wants to see you researched the role.',
    modelAnswer: `30-SECOND ANSWER:
"TRAB is a product team within REWE Digital's Transport Logistics division. The name comes from Transportabwicklung — transport execution. The team of about 10 people develops software to manage distribution of goods to over 5,700 supermarkets in Germany, serving warehouse staff, drivers, and logistics planners."

90-SECOND ANSWER:
"TRAB handles the operational execution of transport — not abstract route planning, but the actual management of deliveries: loading, dispatch, tracking, communication, delay handling, and delivery confirmation. The team builds backend services, APIs, integrations with internal and external systems, interfaces, and analytical tools. They use Java, Kotlin, Spring Boot, Kafka, Kubernetes, and Angular. They also participate in the NEO project — a unified communication platform with modular, plug-and-play architecture.

What excites me is the combination: operationally critical systems (5,700 stores depend on this), modern tech stack, and the challenge of both maintaining existing systems and building new capabilities."

CONNECTION TO EXPERIENCE:
"I've worked on a similarly critical system — an education management platform serving 300+ units. I understand what it means when your software can't go down because real operations depend on it every day."`,
    followUp: 'What specifically about transport logistics interests you as an engineer?',
    tags: ['trab', 'context', 'research']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'BASIC',
    subtopic: 'Domain Knowledge',
    question: 'What does Transportabwicklung mean?',
    context: '🏷️ CONFIRMED — Shows you researched the German term and understand the domain.',
    modelAnswer: `"Transportabwicklung translates to transport execution or transport processing. It refers to the operational management of transport — the execution phase, not the planning phase.

The distinction matters:

TRANSPORT PLANNING: route definition, capacity allocation, scheduling, vehicle selection
TRANSPORT EXECUTION: loading, dispatch, real-time tracking, status updates, delay handling, communication, arrival confirmation, delivery completion

TRAB sits in the execution space — making sure that once a transport is planned, it actually happens correctly, on time, and all stakeholders are informed throughout the process."`,
    followUp: 'Can you give an example of a technical challenge specific to transport execution vs planning?',
    tags: ['domain', 'vocabulary', 'german']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Users',
    question: 'Which users might depend on a transport execution system?',
    context: '🏷️ REASONABLE INFERENCE — based on vacancy + domain knowledge',
    modelAnswer: `"Based on the vacancy, three user groups are confirmed: warehouse staff, drivers, and logistics planners. I'd also expect external carriers as a fourth group.

Each has different needs:

WAREHOUSE STAFF: view what needs to be loaded, confirm preparation, register departures, handle exceptions when loads aren't ready

DRIVERS: receive instructions, know their route, report status (departed, delayed, arrived), confirm delivery, register problems

LOGISTICS PLANNERS: the operational command center — monitor all active transports, see delays in real-time, prioritize exceptions, make decisions like rerouting or reassigning

EXTERNAL CARRIERS: receive transport orders, provide status updates, confirm completion — all through system integration rather than manual communication

The technical challenge is that each group needs different information at different times, often in real-time, and the system must handle the reality that any of these actors might be offline or delayed in reporting."`,
    followUp: 'How would you design an API that serves all these different user types?',
    tags: ['users', 'stakeholders', 'domain']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Business Problem',
    question: 'What problems might the TRAB team be solving?',
    context: '🏷️ REASONABLE INFERENCE',
    modelAnswer: `"The core problem I infer: TRAB needs to guarantee that transport information is distributed reliably, quickly, and traceably between warehouses, drivers, planners, stores, external carriers, and internal systems.

The difficulties are probably:
• Different systems using different formats and protocols
• Communication fragmented across many channels
• Difficulty tracking a delivery end-to-end across all actors
• Legacy integrations that are brittle or tightly coupled
• Growing number of carriers and systems to integrate
• Events that can be duplicated, delayed, or arrive out of order
• External systems that become unavailable
• Need for 24/7 operation (deliveries happen every day)
• Need to modernize without disrupting current operations

This is why they need Kafka (reliable event distribution), Spring Boot (modern services), Kubernetes (availability), and NEO (unified communication). Each technology addresses a specific aspect of this problem."`,
    followUp: 'If you joined the team, how would you learn the domain quickly?',
    tags: ['problem', 'domain', 'analysis']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    subtopic: 'Modernization',
    question: 'Do you expect the work to involve existing systems or new projects?',
    options: [
      { label: 'A) Mostly maintenance of existing systems', description: 'Bug fixes, performance improvements, minor features on established code.' },
      { label: 'B) Mostly greenfield new projects', description: 'Building from scratch with modern stack, no legacy constraints.' },
      { label: 'C) Hybrid: existing systems + modernization + new services', description: 'Maintaining production, modernizing gradually, and building new capabilities.' }
    ],
    bestOption: 2,
    explanation: `The vacancy clearly suggests a HYBRID context:

Evidence for existing systems:
• "Development AND maintenance of applications"
• Transport system for 5,700 stores doesn't start from zero

Evidence for new development:
• NEO is described as a new platform
• Modern stack (Spring Boot, Kafka, K8s) suggests evolution
• Hiring suggests expanding capabilities

The mature answer:
"I expect a mix. The team probably maintains critical production systems while simultaneously modernizing them and building new capabilities like NEO. This is actually what I find most interesting — the challenge of evolving a running system is harder than building from scratch, and requires more engineering judgment."`,
    tags: ['legacy', 'greenfield', 'hybrid']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Modernization',
    question: 'How would you modernize a critical transport platform?',
    context: '🏷️ Direct interview question about approach',
    modelAnswer: `"I would avoid a big-bang replacement. A transport system serving 5,700 stores cannot be taken offline for migration.

My approach:
1. UNDERSTAND first — map the existing system's boundaries, data flows, and integration points
2. IDENTIFY stable business boundaries — areas that can be isolated without breaking the whole
3. STRANGLE gradually — expose controlled APIs or events around legacy components
4. BUILD alongside — new services consume from and produce to both old and new systems
5. MIGRATE incrementally — move one domain/capability at a time
6. OBSERVE continuously — metrics comparing old vs new behavior
7. ROLLBACK readily — ability to fall back to legacy if new service has issues

During transition, critical concerns:
• Data consistency between old and new
• Observability (can I see what's happening in both systems?)
• Reconciliation (are old and new producing same results?)
• Feature flags (gradually shift traffic)

My experience: I've worked on a 2000-table monolith that needed gradual modernization. I know the discipline of changing a running system without breaking it."`,
    followUp: 'What\'s the hardest part of a strangler pattern migration?',
    tags: ['modernization', 'strangler', 'strategy']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'NEO',
    question: 'What do you know about NEO?',
    context: '🏷️ CONFIRMED + UNKNOWN — Show what you know AND what you don\'t assume.',
    modelAnswer: `"From the vacancy, I know that:
✅ NEO is a unified communication platform
✅ It integrates into the REWE Digital ecosystem
✅ It uses modular, plug-and-play architecture
✅ The TRAB team participates in it

What I DON'T know (and would ask):
❓ What NEO stands for
❓ Whether it's in production or under development
❓ Which users interact with it directly
❓ Whether plugins are Java components, independent services, or event consumers
❓ Whether it's specific to logistics or shared across REWE domains
❓ Whether it uses Kafka internally

My interpretation: NEO seems designed to solve the fragmented communication problem in logistics — providing a standard way for systems to send, route, and deliver communications to different actors (drivers, warehouses, planners, external carriers) without each system building its own integration."`,
    followUp: 'What would you need to learn in the first week to contribute to NEO?',
    tags: ['neo', 'honesty', 'research']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'NEO',
    question: 'What information about NEO is still unknown?',
    context: '🏷️ Shows intellectual honesty and senior thinking.',
    modelAnswer: `"Several important things I cannot determine from the vacancy:

ARCHITECTURE:
• Is it a single service or multiple services?
• Does it use Kafka topics internally?
• How do plugins discover and register themselves?
• Is the modular boundary at code level (Maven modules) or deployment level (microservices)?

SCOPE:
• Does NEO handle only logistics communication or is it organization-wide?
• Does it communicate directly with end users (drivers) or only with their applications?
• Is it owned by TRAB alone or shared with other teams?

STATUS:
• Is it in production, MVP, or design phase?
• How mature is the plugin ecosystem?
• What's the adoption level?

These unknowns are precisely why I'd ask targeted questions in the interview — it shows I've thought deeply about the role rather than just accepting surface-level descriptions."`,
    followUp: 'How do you typically handle technical uncertainty when starting a new project?',
    tags: ['neo', 'unknown', 'intellectual-honesty']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Architecture',
    question: 'What does unified communication platform mean?',
    context: '🏷️ INTERVIEW HYPOTHESIS — your interpretation',
    modelAnswer: `"A unified communication platform centralizes how different systems send information to different recipients through different channels — with consistent contracts, routing, security, retry logic, and monitoring.

Instead of each system building its own integration to each recipient:
❌ Delivery-service → custom SMS to driver
❌ Warehouse-service → custom email to planner
❌ Tracking-service → custom webhook to carrier

You have ONE platform:
✅ Any system → Communication Request → NEO → routes to correct channel

NEO would handle: routing (who gets what), transformation (adapt format per channel), delivery (actually send), retry (handle failures), audit (record everything), monitoring (track delivery rates).

The 'unified' part means: one API contract, one security model, one retry policy framework, one monitoring dashboard — regardless of whether the message goes to a driver's app, a warehouse screen, or an external carrier's API."`,
    followUp: 'What are the risks of centralizing all communication through one platform?',
    tags: ['neo', 'architecture', 'unified']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'INTER',
    subtopic: 'Architecture',
    question: 'What does modular architecture mean?',
    context: '🏷️ General architectural concept',
    modelAnswer: `"Modular architecture divides a system into components with clear responsibilities, explicit contracts, and low coupling.

For a communication platform, possible modules:
• Communication Core (receives requests, orchestrates)
• Routing Module (decides which channel/recipient)
• Template Module (formats messages per channel)
• Driver Integration Module
• Warehouse Module
• External Carrier Module
• Audit Module (records everything)
• Retry Module (handles failures)
• Monitoring Module

Each module can be developed, tested, and evolved independently as long as contracts between modules remain stable.

Benefits: maintainability, testability, independent evolution, clear ownership
Risks: over-abstraction, hidden dependencies, unclear contracts, debugging across modules

The key question for NEO is: are these modules within ONE deployment unit (modular monolith) or are they independent services? The vacancy says 'modular' — which is different from 'microservices.' You can be modular inside a single application."`,
    followUp: 'When would you split a module into its own service?',
    tags: ['modular', 'architecture', 'decisions']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Architecture',
    question: 'What does plug-and-play architecture mean?',
    context: '🏷️ Core architectural concept for the TRAB role',
    modelAnswer: `"Plug-and-play means new modules, integrations, or providers can be added with minimal changes to the core system. The core depends on stable contracts, not concrete implementations.

SHORT: 'Adding a new carrier should not require modifying the communication engine.'

LEVELS of implementation:

1. IN-PROCESS (Spring beans):
   Interface + implementations discovered by DI. New plugin = new @Component class.

2. DISTRIBUTED (microservices):
   Independent services that consume events or register via service discovery.

3. CONFIGURATION-DRIVEN:
   Feature flags, declarative routing rules, dynamic plugin enablement.

WHY a Java interface isn't enough:
A production platform also needs: plugin discovery, lifecycle management, configuration, security, version compatibility, failure isolation, monitoring, and deployment strategies.

IMPORTANT: I wouldn't assume which model NEO uses without asking the team. 'Plug-and-play' could mean any of these levels — or a combination."`,
    followUp: 'How would you test a new plugin before enabling it in production?',
    tags: ['plug-and-play', 'extensibility', 'design']
  },
  {
    type: 'DESIGN_DECISION',
    difficulty: 'SENIOR',
    subtopic: 'Architecture',
    question: 'Would you implement plugins as Spring beans or independent services?',
    options: [
      { label: 'A) Always Spring beans (in-process)', description: 'All plugins live in the same deployment. Simple, fast, transactional.' },
      { label: 'B) Always independent services', description: 'Each plugin is its own microservice. Full isolation, independent scaling.' },
      { label: 'C) Depends on requirements — evaluate case by case', description: 'Choose based on scale, ownership, failure isolation, deployment frequency, and latency.' }
    ],
    bestOption: 2,
    explanation: `"I would not decide before understanding scale, ownership, failure isolation, deployment frequency, and latency requirements."

IN-PROCESS (Spring beans) when:
• Plugin is simple and stable
• Same team owns it
• Low latency required
• Shared transaction needed
• Few changes after initial development

INDEPENDENT SERVICE when:
• Different team owns it
• Needs independent scaling
• Failure must NOT affect core
• Different deployment cadence
• Different technology needed

EVENT CONSUMER (Kafka) when:
• Asynchronous processing is acceptable
• Multiple consumers need the same event
• Replay/audit required
• Consumer may be temporarily offline

For REWE NEO: likely a COMBINATION. Critical routing might be in-process for speed. External carrier integrations might be independent services for isolation. Audit might be a Kafka consumer for reliability.`,
    tags: ['plugins', 'microservices', 'trade-offs']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'System Design',
    question: 'How would you design a logistics communication platform?',
    context: '🏷️ INTERVIEW HYPOTHESIS — system design exercise',
    modelAnswer: `ARCHITECTURE:

Communication API (REST) ← systems submit requests
       │
       ▼
Validation Layer (schema, auth, dedup)
       │
       ▼
Routing Engine (determines recipient + channel)
       │
       ├─── Direct Plugins (low-latency, in-process)
       │         │── Driver App Plugin
       │         └── Warehouse Dashboard Plugin
       │
       └─── Kafka Events (async, reliable)
                 │── External Carrier Consumer
                 │── Audit Consumer
                 └── Analytics Consumer

KEY DESIGN DECISIONS:
• Idempotency: every request has unique ID, dedup before processing
• Retry: DLT for failed deliveries, exponential backoff
• Isolation: slow plugin can't block others (timeout + circuit breaker)
• Audit: every communication recorded with full trace
• Security: per-plugin authentication, encrypted payloads
• Monitoring: delivery rate, failure rate, latency per channel
• Scaling: Kafka partitioned by recipient type, consumers scale independently

TRADE-OFFS:
• Centralized routing = single point of failure (mitigate with replicas + Kafka buffering)
• Plugin abstraction = some loss of flexibility (mitigate with escape hatches for edge cases)
• Async delivery = eventual consistency (mitigate with status tracking + reconciliation)`,
    followUp: 'What would you monitor to know this platform is healthy?',
    tags: ['system-design', 'neo', 'architecture']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Resilience',
    question: 'How would you prevent NEO from becoming a single point of failure?',
    context: '🏷️ Critical thinking about platform risk',
    modelAnswer: `"A unified communication platform is by definition a critical dependency. If it goes down, ALL communication stops. Here's how I'd mitigate:

1. HIGH AVAILABILITY:
   • Multiple replicas behind load balancer
   • Health checks (liveness + readiness probes)
   • Rolling deployments with zero downtime
   • Multi-AZ deployment

2. KAFKA AS BUFFER:
   • If NEO core is temporarily down, events accumulate in Kafka
   • When it recovers, it processes the backlog
   • No messages lost during brief outages

3. LOCAL FALLBACK:
   • Critical communications (driver dispatch) could have a direct fallback path
   • If NEO is unreachable for >X seconds, system sends directly

4. GRACEFUL DEGRADATION:
   • If one plugin fails (external carrier), others continue working
   • Circuit breaker per plugin — don't let one slow integration affect all

5. MONITORING & ALERTS:
   • Consumer lag → NEO is falling behind
   • Error rate per channel → specific integration problem
   • End-to-end delivery time → overall health

6. DISASTER RECOVERY:
   • Kafka retention ensures no data loss
   • Stateless services can be restarted on any node
   • Database replication for any persistent state"`,
    followUp: 'What\'s the difference between high availability and disaster recovery?',
    tags: ['resilience', 'availability', 'spof']
  },
  {
    type: 'ORAL_ANSWER',
    difficulty: 'SENIOR',
    subtopic: 'Interview Strategy',
    question: 'Which questions would you ask the TRAB team?',
    context: '🏷️ Shows genuine interest and senior thinking',
    modelAnswer: `"I've prepared questions that help me understand what I'd actually be working on:

ABOUT THE DOMAIN:
• Which part of the transport lifecycle does TRAB own?
• What are the main applications the team maintains today?
• Are current systems mainly modern, legacy, or hybrid?

ABOUT NEO:
• Is NEO already in production or still being developed?
• What does 'plug-and-play' mean technically — Spring beans, services, or event consumers?
• Is Kafka part of the NEO architecture?
• Which teams use NEO besides TRAB?

ABOUT THE WORK:
• What would I work on in the first month?
• What's the biggest technical challenge the team faces today?
• How is work divided between Spain and Germany?
• What does success look like after six months?

ABOUT OPERATIONS:
• Which integrations are most critical?
• Which failures have the greatest operational impact?
• Does the team own production support?

These aren't just politeness questions — each one helps me validate my understanding of the role and demonstrates that I've thought seriously about the context."`,
    followUp: 'Based on what you learn, how would you adjust your onboarding plan?',
    tags: ['questions', 'interview', 'preparation']
  }
];
