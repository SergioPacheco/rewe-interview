/**
 * Behavioral Interview — Part 2 (15 exercises)
 * STAR format: culture fit, leadership, resilience, REWE-specific
 */
const behavioralExercises2 = [
  {
    type: 'ORAL_ANSWER',
    question: 'Tell me about a feature you\'re particularly proud of building.',
    context: 'Show ownership, end-to-end thinking, and impact.',
    modelAnswer: `SITUATION: Our education system needed real-time certificate generation for 50,000+ students across 300 units, each with different layouts, signatures, and regulations.

TASK: Design and implement a certificate generation system that handled multiple templates, digital signatures, and high-volume batch processing.

ACTION: I designed the system with:
1. Template engine (Jasper Reports) with per-unit customization
2. Asynchronous batch processing via JMS (queue-based, fault-tolerant)
3. Digital signature integration with an external provider (BRy)
4. Idempotent generation (same request → same certificate, no duplicates)
5. Progress tracking so administrators could monitor batch jobs

I owned it end-to-end: database schema, business logic, integration with the signature provider, the background job infrastructure, and the admin UI.

RESULT: System generated 50,000+ certificates per semester reliably. Batch processing handled failures gracefully (retry per certificate, not per batch). Zero duplicate certificates in 2 years of operation.

WHY PROUD: It combined multiple hard problems (async processing, external integration, template rendering, data correctness) into a clean, reliable system.`,
    followUp: 'What would you change if you could redesign it today?',
    tags: ['ownership', 'pride', 'end-to-end']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'How do you handle a situation where you realize you won\'t meet a deadline?',
    context: 'REWE values transparency and early communication.',
    modelAnswer: `My rule: communicate EARLY, not at the deadline.

SITUATION: Mid-sprint, I realized a Kafka consumer integration would take 5 days instead of the estimated 3, because the event schema was more complex than expected (nested objects, optional fields, backward compatibility needed).

ACTION:
1. DAY 2 (when I realized): Immediately told my lead: "I've discovered additional complexity. Here's what I found, here's the revised estimate, here's what I suggest."
2. PROPOSED OPTIONS:
   - Option A: Deliver full solution in 5 days (2 days over)
   - Option B: Deliver core consumer in 3 days, add schema evolution handling next sprint
   - Option C: Simplify by consuming only required fields now, full mapping later
3. RECOMMENDED Option B with clear reasoning

RESULT: Lead chose Option B. No surprise at sprint end. Stakeholders adjusted expectations on day 2, not day 10. Trust maintained.

PRINCIPLE: "Bad news early is a plan. Bad news late is a crisis. I never hide risk — I surface it with options."`,
    followUp: 'How do you estimate effort for tasks with unknowns?',
    tags: ['transparency', 'communication', 'deadline-management']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Describe a time you had to say no to a request.',
    context: 'Engineers who say yes to everything burn out and deliver poorly.',
    modelAnswer: `SITUATION: A project manager asked me to add a "quick" export feature to a report that was already in QA. "Just add an Excel button, should be 2 hours."

TASK: Evaluate whether this was truly quick, and communicate honestly.

ACTION: I investigated for 30 minutes:
- The report had 15 columns, some with complex aggregations
- Excel export needed different formatting than the screen display
- The data volume could be 50,000+ rows (memory implications)
- No pagination existed for the export path

I replied: "This isn't 2 hours. Here's why: [list]. It's approximately 2-3 days including testing. I can do it, but it means pushing back the next feature by 3 days. Which priority wins?"

RESULT: PM decided the export could wait for the next sprint. No scope creep, no weekend work, no quality compromise. The PM appreciated the honest assessment.

KEY: I don't say "no" — I say "yes, and here's what it really costs." Let the stakeholder make the trade-off with full information.`,
    followUp: 'What if the PM insists it must be done this sprint?',
    tags: ['boundaries', 'honesty', 'negotiation']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'How do you approach debugging a complex issue with no obvious cause?',
    context: 'Transport systems have complex failure modes. Show systematic thinking.',
    modelAnswer: `My debugging methodology:

1. REPRODUCE — Can I make it happen consistently? What's the minimal reproduction case?
2. ISOLATE — What changed? (recent deploy? data? load?) Narrow the surface area.
3. HYPOTHESIZE — Based on evidence, what are the 2-3 most likely causes?
4. INSTRUMENT — Add targeted logging/metrics to confirm or eliminate hypotheses.
5. FIX — Address root cause, not symptoms. Verify with the reproduction case.
6. PREVENT — Why wasn't this caught? Add test/monitor/alert.

EXAMPLE: A delivery status update was intermittently failing (~5% of the time). No error in logs.

Investigation:
- REPRODUCE: Happened only with concurrent updates to the same delivery
- ISOLATE: Recent feature added parallel notification sending
- HYPOTHESIZE: Optimistic locking conflict? Race condition on status field?
- INSTRUMENT: Added version logging → confirmed stale read + overwrite
- FIX: Added optimistic locking (@Version) + retry on conflict
- PREVENT: Added integration test with concurrent requests

Total time: 4 hours. Without methodology, could have been days of random guessing.`,
    followUp: 'What tools do you use for debugging in production?',
    tags: ['debugging', 'systematic-thinking', 'problem-solving']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Tell me about a time you received critical feedback. How did you handle it?',
    context: 'Growth mindset. REWE wants people who improve, not people who are defensive.',
    modelAnswer: `SITUATION: During a code review, a senior colleague pointed out that my exception handling pattern was inconsistent — in some places I logged and rethrew, in others I swallowed exceptions silently, and my approach to checked vs unchecked was ad-hoc.

TASK: Accept the feedback and actually improve, not just fix the PR.

ACTION:
1. FIRST REACTION: My instinct was defensive ("it works fine"). I paused before responding.
2. REFLECTED: I read through my recent code and realized they were right — I had no consistent strategy.
3. ACTED: Asked the colleague for a 30-minute session to understand their preferred pattern. Took notes.
4. SYSTEMATIZED: Created a personal checklist:
   - Business validation → custom unchecked exception
   - Infrastructure failure → wrap and propagate with context
   - Never swallow exceptions silently (always log OR rethrow)
5. APPLIED: Refactored the PR, then proactively fixed other places in my recent code.

RESULT: Exception handling became a strength. The colleague later told others to look at my code as an example. Feedback transformed a weak point into a standard.

KEY: "Feedback is a gift. The worst thing is NOT receiving it — it means people stopped investing in your growth."`,
    followUp: 'How do you give feedback to a junior who is making the same mistake repeatedly?',
    tags: ['feedback', 'growth-mindset', 'humility']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'How do you handle multiple tasks with competing priorities?',
    context: 'In a logistics team, there are always urgent issues alongside planned work.',
    modelAnswer: `My framework: URGENT vs IMPORTANT matrix + time-boxing.

DAILY PRACTICE:
1. Start of day: review priorities. What's the ONE thing that must move forward today?
2. Time-box interruptions: if someone asks for help, "I can look at this in 30 minutes" (finish current thought)
3. Production issues: drop everything (but document where I stopped for easy resume)
4. Planned work: deep focus blocks (2h minimum, notifications off)

EXAMPLE: Tuesday morning — 3 competing demands:
- Sprint feature (important, deadline Friday)
- Production bug (urgent, affecting 50 users)
- Colleague needs help with a complex query (important for them, not urgent)

My decision:
1. Production bug → immediate (30 min fix, restore service)
2. Message colleague: "Fixed prod issue, free at 11:00 for your query"
3. Sprint feature → afternoon deep focus (3h block)

PRINCIPLE: "I protect focus time for planned work, but production issues always win. The key is RESUMING planned work quickly — which requires leaving clear breadcrumbs (TODO comments, branch with WIP commit)."`,
    followUp: 'How do you prevent yourself from being the person everyone asks for help?',
    tags: ['prioritization', 'time-management', 'focus']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'What\'s your approach to code reviews? Both giving and receiving.',
    context: 'REWE teams do PRs. Show you value the process.',
    modelAnswer: `GIVING reviews — my philosophy:
• Focus on LOGIC and CORRECTNESS first, style last
• Ask questions instead of dictating: "What happens if this list is empty?" (lets author discover the issue)
• Classify clearly: 🔴 Blocker (must fix), 🟡 Suggestion (consider), 💬 Question (curious)
• Praise good patterns: "Nice use of Optional here — clean"
• Review within 4 hours (unblock teammates fast)
• Never approve something I don't understand

RECEIVING reviews:
• Don't take it personally — they're reviewing my CODE, not me
• If I disagree: explain my reasoning ONCE clearly. If reviewer insists → I yield (unless it's a correctness issue)
• "I'll fix this" is better than a 10-comment debate about style
• Say "good catch" when they find a real issue — positive reinforcement

ANTI-PATTERNS I AVOID:
• Nitpicking style when the logic is dangerous
• "LGTM" without actually reading
• Blocking a PR for 3 days because I'm busy
• Requesting changes on things unrelated to the PR's scope`,
    followUp: 'How do you handle a reviewer who always blocks your PRs with minor style comments?',
    tags: ['code-review', 'collaboration', 'communication']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Tell me about a time you had to make a technical decision with incomplete information.',
    context: 'In logistics, you can\'t always wait for perfect data.',
    modelAnswer: `SITUATION: We needed to choose between synchronous REST calls and asynchronous messaging for an integration with an external delivery tracking provider. The provider's API documentation was incomplete, and their uptime SLA was unclear.

TASK: Make an architectural decision that wouldn't require expensive rework if assumptions proved wrong.

ACTION: I applied the "reversibility" principle:
1. LISTED unknowns: Provider latency? Uptime? Rate limits? Payload size?
2. CHOSE the safer default: Async with outbox pattern (tolerates provider downtime)
3. DESIGNED for change: Interface + adapter pattern. If we later learned the provider was always fast and reliable, switching to sync would be one class change.
4. DOCUMENTED the decision + assumptions: "Chose async because [unknowns]. Revisit after 1 month of production data."

RESULT: Good decision — the provider had intermittent 30-second latencies that would have blocked our users in a sync approach. The async pattern handled it transparently.

PRINCIPLE: "When uncertain, choose the option that's easier to change from. Async → sync is easy. Sync → async (after building on that assumption) is expensive."`,
    followUp: 'How do you document architectural decisions for the team?',
    tags: ['decision-making', 'architecture', 'uncertainty']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'How do you ensure the reliability of a system you own?',
    context: 'REWE transport can\'t have downtime during delivery hours.',
    modelAnswer: `My reliability checklist for any service I own:

1. OBSERVABILITY:
   - Structured logging with correlation IDs
   - Key metrics: latency p95, error rate, throughput
   - Alerts on anomalies (not just thresholds — trend-based)

2. FAILURE HANDLING:
   - Timeouts on ALL external calls (never infinite wait)
   - Circuit breaker or fallback for non-critical dependencies
   - Graceful degradation: if notifications fail, deliveries still work

3. DATA INTEGRITY:
   - Idempotent operations (safe to retry)
   - Transactional boundaries clearly defined
   - No external I/O inside transactions (connection pool protection)

4. DEPLOYMENT SAFETY:
   - Feature flags for risky changes (enable gradually)
   - Health checks (liveness + readiness)
   - Easy rollback path

5. DOCUMENTATION:
   - Runbook: "If X happens, do Y"
   - Architecture diagram: dependencies and failure modes
   - On-call guide: how to diagnose common issues

EXAMPLE: For a delivery event consumer, I ensure:
- Consumer lag metric with alert (>1000 events behind → alert)
- Dead-letter topic for poison messages (don't block the queue)
- Idempotent processing (replay-safe)
- Health check that verifies Kafka connectivity`,
    followUp: 'How do you approach on-call rotations?',
    tags: ['reliability', 'ownership', 'production-readiness']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Describe your experience with agile/scrum. What works and what doesn\'t?',
    context: 'REWE likely uses agile. Show maturity, not dogma.',
    modelAnswer: `My experience: 4+ years in Scrum teams (2-week sprints, daily standups, retros).

WHAT WORKS:
• Short iterations → frequent feedback → less wasted work
• Sprint reviews → stakeholders see progress, correct course early
• Retrospectives → team improves continuously (when taken seriously)
• Definition of Done → shared quality standard

WHAT I'VE SEEN FAIL:
• Standups becoming status reports TO the manager (should be team sync)
• Estimating to the hour (story points for relative sizing work better)
• Skipping retros when "there's nothing to discuss" (there always is)
• Treating velocity as a productivity metric (it's a planning tool)

MY APPROACH: Use the ceremonies that add value. Skip the ones that don't. The goal is DELIVERING VALUE, not performing agile theater.

Concretely: I prefer kanban-style for ops/maintenance work (continuous flow) and sprint-based for feature development (time-boxed commitments). Different work patterns benefit from different cadences.`,
    followUp: 'How do you handle sprint commitments when unplanned work appears?',
    tags: ['agile', 'process', 'pragmatism']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'How do you approach testing? What\'s your testing philosophy?',
    context: 'REWE needs reliable services. Show you care about quality.',
    modelAnswer: `Testing pyramid + pragmatism:

UNIT TESTS (majority):
• Fast, isolated, test business logic
• Mock external dependencies
• One behavior per test
• Name describes the scenario: "shouldRejectDeliveryWhenDriverNotAvailable"

INTEGRATION TESTS (targeted):
• Real database (Testcontainers with PostgreSQL, not H2)
• Real Kafka (embedded or Testcontainers)
• Verify queries, serialization, configuration

E2E TESTS (minimal):
• Happy path through the full system
• Critical user journeys only
• Slow → keep the count small

MY RULES:
1. New feature → write test FIRST for the core logic (TDD for complex business rules)
2. Bug fix → write failing test FIRST that reproduces the bug, THEN fix
3. Refactoring → existing tests must pass without modification (if they break, it's not a refactor)
4. Don't test private methods — test observable behavior
5. Don't test the framework (Spring Data query methods work — test YOUR business logic)

FROM JAVA EE: I tested with JUnit 5 + Mockito (same as Spring). The business logic testing is identical — only the integration test infrastructure differs (Arquillian → @SpringBootTest + Testcontainers).`,
    followUp: 'How do you decide what NOT to test?',
    tags: ['testing', 'quality', 'tdd']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'What questions do you have for us? (the interviewers)',
    context: 'ALWAYS have questions prepared. Shows genuine interest.',
    modelAnswer: `Questions I would ask REWE team TRAB:

ABOUT THE TEAM:
• "How is the team structured? How many developers, what seniority mix?"
• "What does a typical sprint look like? How much is feature work vs maintenance vs tech debt?"
• "How do you handle on-call? What's the incident response process?"

ABOUT THE TECHNOLOGY:
• "What's the current architecture of the transport services? Monolith, microservices, or something in between?"
• "How do you handle schema evolution in Kafka events? Avro with Schema Registry?"
• "What's the deployment frequency? CI/CD pipeline maturity?"

ABOUT GROWTH:
• "What does success look like for this role in the first 6 months?"
• "How do you support engineers in growing technically? Conferences, learning time, internal tech talks?"
• "What's the biggest technical challenge the team is facing right now?"

ABOUT CULTURE:
• "How are architectural decisions made? Individual ownership or team RFC process?"
• "How does the team handle disagreements on technical approaches?"

TIP: Don't ask ALL of these. Pick 3-4 that feel natural based on the conversation. Ask follow-up questions to their answers — show genuine curiosity.`,
    followUp: 'Is there anything specific about your background that you want to clarify or emphasize?',
    tags: ['interview-prep', 'questions', 'engagement']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'How do you handle imposter syndrome when joining a team with a different tech stack?',
    context: 'Honest self-awareness. REWE wants authentic people.',
    modelAnswer: `I acknowledge it openly and counter it with evidence:

THE FEELING: "Everyone here knows Spring Boot/Kafka/K8s. I only know Java EE. I'm going to be the slowest person."

THE REALITY CHECK:
• I have 5+ years building production systems. The PATTERNS are the same — DI, transactions, messaging, persistence.
• I've learned new technologies before (JMS, Hibernate, JSF). My track record shows I ramp up within weeks.
• Syntax is the smallest part of engineering. Design thinking, debugging methodology, domain understanding — these transfer 100%.
• Even experts Google "Spring Boot @Transactional propagation" — nobody memorizes everything.

MY STRATEGY:
1. First 2 weeks: absorb. Read code, ask questions, take notes. Don't pretend to know.
2. Week 3-4: contribute small PRs. Build confidence through delivery.
3. Month 2: take on a real feature. Apply patterns with the new syntax.
4. Month 3: share back — my Java EE perspective often reveals assumptions others miss.

WHAT I TELL MYSELF: "They hired me for my engineering mindset and 5 years of enterprise Java, not for knowing Spring annotations. The annotations I'll learn in a week."`,
    followUp: 'What specific areas are you most concerned about ramping up on?',
    tags: ['self-awareness', 'honesty', 'confidence']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Describe your ideal working environment.',
    context: 'Culture fit assessment. Align with what REWE Digital offers.',
    modelAnswer: `My ideal environment has:

1. TRUST-BASED AUTONOMY: Give me the problem and the constraints, let me find the solution. I don't need someone reviewing every line — I need clear expectations and the freedom to meet them.

2. TECHNICAL EXCELLENCE AS A VALUE: A team that cares about doing things well. Code reviews that teach, not just approve. Tech debt addressed, not just accumulated.

3. PSYCHOLOGICAL SAFETY: I can say "I don't know" without judgment. I can challenge an approach without politics. Mistakes are learning opportunities, not blame targets.

4. MEANINGFUL WORK: Software that impacts real operations. Transport logistics at REWE is exactly this — every optimization matters, every bug has real-world consequences.

5. GROWTH OPPORTUNITIES: Both technical depth (become an expert in a domain) and breadth (exposure to new patterns, tools, architectures).

WHAT I DON'T NEED:
• Micromanagement or time-tracking to the minute
• "Move fast and break things" culture (I prefer "move deliberately and build reliability")
• Purely political environments where perception matters more than output

From what I've researched, REWE Digital's engineering culture emphasizes autonomy, quality, and domain ownership — which aligns with what I'm looking for.`,
    followUp: 'What would be a red flag for you about a team or company?',
    tags: ['culture-fit', 'values', 'self-awareness']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Tell me about yourself (the opening question).',
    context: 'The most important 2 minutes. Set the frame for everything that follows.',
    modelAnswer: `STRUCTURE: Present → Past → Future (2 minutes max)

"I'm a Java backend developer with 5 years of experience building enterprise systems — specifically an education management platform serving 300+ units and 50,000+ students in Brazil.

My core stack is Java EE: CDI for dependency injection, JPA/Hibernate for persistence, JMS with ActiveMQ Artemis for async messaging, and JSF for the web layer. The system has 2,000+ database tables and 80+ message queues — so I'm comfortable with complexity and scale.

What I bring beyond the tech stack: I design for reliability. My experience includes production incident response, performance optimization (diagnosing N+1 queries, connection pool issues, timeout tuning), and building resilient messaging patterns (idempotency, retry, dead-letter handling).

I'm interviewing at REWE Digital because I want to apply these skills in a modern stack — Spring Boot, Kafka, Kubernetes — in a domain I find fascinating: transport logistics. The patterns I've mastered (DI, messaging, transactions, event-driven architecture) map directly to what team TRAB is building. I'm looking to grow technically while contributing immediately with my enterprise Java foundations."

TOTAL: ~90 seconds. Covers: experience, domain, technical depth, transferable skills, motivation.`,
    followUp: 'Can you elaborate on the scale of the systems you\'ve built?',
    tags: ['introduction', 'pitch', 'first-impression']
  }
];
