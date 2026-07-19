/**
 * Behavioral Interview — Part 1 (15 exercises)
 * STAR format: Situation, Task, Action, Result
 * Contextualized for REWE Digital Spain (team TRAB) culture
 */
const behavioralExercises1 = [
  {
    type: 'ORAL_ANSWER',
    question: 'Tell me about a time you had to learn a new technology quickly to deliver a project.',
    context: 'REWE uses Spring Boot + Kafka. You come from Java EE. How do you demonstrate adaptability?',
    modelAnswer: `SITUATION: Our team was tasked with integrating a real-time notification system, and the architect chose ActiveMQ Artemis — a technology nobody on the team had used before. I was responsible for the messaging layer.

TASK: Deliver a working JMS integration within 2 sprints (4 weeks), including MDB consumers, retry logic, and dead-letter handling.

ACTION: I dedicated the first 3 days to structured learning — reading the Artemis documentation, building a proof-of-concept with a simple producer/consumer, and testing failure scenarios. I documented patterns for the team (idempotency, redelivery config). By day 4, I was writing production code.

RESULT: We delivered on time. The messaging layer handled 80+ queues reliably. More importantly, the patterns I documented became team standards used across all subsequent JMS implementations.

BRIDGE TO REWE: "For Spring Boot and Kafka, I'm following the same approach — structured learning of the API surface while leveraging my deep understanding of messaging patterns (idempotency, ordering, error handling) that transfer directly."`,
    followUp: 'What specific resources do you use when learning a new technology?',
    tags: ['adaptability', 'learning', 'self-starter']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Describe a situation where you disagreed with a technical decision made by a colleague or lead.',
    context: 'REWE values collaboration and open communication. Show you can disagree respectfully.',
    modelAnswer: `SITUATION: A colleague proposed using inheritance (BaseService) to share 5 common dependencies across 40+ service classes. I believed this was the wrong pattern.

TASK: Convince the team that composition via DI would be better, without creating conflict or dismissing the colleague's intent.

ACTION: Instead of saying "that's wrong," I prepared a comparison. I showed: (1) how the base class would grow over time as new common needs emerged, (2) a concrete example where one service needed only 2 of the 5 dependencies, (3) how testing required mocking all 5 even when testing one method. I presented it as "let me show an alternative" rather than "your approach is bad."

RESULT: The colleague agreed after seeing the testing argument. We adopted constructor injection with explicit dependencies. The codebase became easier to test and maintain. No relationship damaged — we continued collaborating well.

KEY POINT: "I focus on showing trade-offs with evidence, not on being right. If the team still chooses differently after seeing the data, I commit to that decision fully."`,
    followUp: 'What if the team had chosen the inheritance approach despite your concerns?',
    tags: ['conflict', 'collaboration', 'communication']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Tell me about a production incident you resolved. Walk me through your process.',
    context: 'REWE transport logistics runs 24/7. They need people who stay calm under pressure.',
    modelAnswer: `SITUATION: On a Monday morning, the student enrollment system became unresponsive. 500+ users were blocked. The monitoring showed database connection pool exhausted — all connections in use.

TASK: Restore service immediately, then find and fix the root cause.

ACTION:
1. IMMEDIATE: Identified the symptom (pool exhaustion) via monitoring tools
2. DIAGNOSIS: Found a REST call to an external LDAP service was timing out inside an active database transaction — holding JDBC connections for 30+ seconds
3. ROOT CAUSE: No timeout configured on the LDAP client, AND the call was inside a transactional method (connection retained)
4. FIX: Separated the transaction from the external call (orchestrator pattern: TX → external I/O → TX), added explicit timeouts (5s connect, 10s read)
5. PREVENTION: Added connection pool monitoring alerts, documented the pattern as a team standard

RESULT: Service restored within 20 minutes. The fix prevented recurrence. The pattern "never do external I/O inside a transaction" became a hard rule in our code reviews.`,
    followUp: 'How do you monitor for these issues proactively?',
    tags: ['incident', 'problem-solving', 'pressure']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'How do you handle working on a legacy codebase that you didn\'t write?',
    context: 'REWE team TRAB has existing services. You\'ll inherit code from others.',
    modelAnswer: `SITUATION: I joined a project with a 2000-table monolithic system (SGN3) — 6+ years of development, multiple teams had contributed. No single person understood all modules.

TASK: Be productive in unfamiliar modules without breaking existing functionality.

ACTION: My approach:
1. READ before writing — trace the full flow from UI to database before making any change
2. Map the area — identify entry points, dependencies, callers, and database tables involved
3. Respect existing patterns — even if I'd design differently, consistency matters more than personal preference
4. Small, focused changes — one concern per commit, easy to review and revert
5. Add tests for the behavior I'm changing — document what exists before modifying it
6. Ask questions early — "why was this done this way?" before assuming it's wrong

RESULT: I became productive in new modules within 1-2 weeks. My changes rarely caused regressions because I invested time understanding before acting.

BRIDGE TO REWE: "I expect to inherit existing Spring Boot services. My approach would be the same: understand the existing patterns, respect conventions, contribute improvements incrementally."`,
    followUp: 'What do you do when the legacy code has no tests?',
    tags: ['legacy', 'patience', 'discipline']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Give an example of how you improved a process or developer experience for your team.',
    context: 'REWE values initiative and continuous improvement.',
    modelAnswer: `SITUATION: Our code review process was inconsistent — some PRs got rubber-stamped, others blocked for style preferences. No clear criteria for what constituted a valid concern.

TASK: Improve review quality without slowing down delivery or creating bureaucracy.

ACTION: I created a lightweight review checklist with objective criteria:
- Security: parameterized queries? Input validated?
- Performance: N+1 queries? Missing indexes?
- Resilience: timeouts on external calls? Error handling?
- Clarity: would a new team member understand this in 6 months?

I also introduced the rule: "style suggestions are optional, security/performance findings are blockers." This eliminated subjective debates.

RESULT: Review time decreased (less back-and-forth on style), but quality improved (real issues caught more consistently). Two production bugs that would have shipped were caught in the first month.`,
    followUp: 'How do you handle reviewers who are too strict or too lenient?',
    tags: ['initiative', 'process-improvement', 'teamwork']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Tell me about a time you had to deliver under tight deadlines. How did you prioritize?',
    context: 'Transport logistics has real deadlines — deliveries must happen.',
    modelAnswer: `SITUATION: We had 3 weeks to deliver an education census integration that normally would take 6 weeks. External deadline from the government — non-negotiable.

TASK: Deliver a functional integration on time without accumulating dangerous technical debt.

ACTION: I prioritized ruthlessly:
1. MUST: Core data export (the legal requirement) — no shortcuts on data correctness
2. SHOULD: Error handling and retry for failed records — essential for reliability
3. COULD: Admin UI for monitoring — deferred (used database queries initially)
4. WON'T: Fancy progress bar, email notifications — cut entirely

I communicated scope cuts to stakeholders EARLY (day 2, not day 15). I focused on the critical path and accepted simple solutions where they were safe (manual monitoring instead of automated dashboard).

RESULT: Delivered the core integration on time. The government deadline was met. We added the monitoring UI in the next sprint when pressure was off.

KEY PRINCIPLE: "Under pressure, I cut scope — never quality. A working system with fewer features beats a broken system with everything."`,
    followUp: 'How do you decide what to cut vs what is essential?',
    tags: ['deadline', 'prioritization', 'communication']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'How do you ensure knowledge sharing in a team? Have you mentored anyone?',
    context: 'REWE team TRAB is distributed. Knowledge silos are dangerous.',
    modelAnswer: `SITUATION: In our team of 6, knowledge was concentrated — each person "owned" certain modules. When someone was on vacation, nobody could fix issues in their area.

TASK: Reduce bus factor without formal pair programming (team resisted full-time pairing).

ACTION:
1. Documented architectural decisions and gotchas in a shared wiki per module
2. Introduced "rotating reviewer" — you review code in areas you DON'T own (forces learning)
3. When fixing a bug, I'd walk a junior through my debugging process (teaching the method, not just the fix)
4. Created "investigation maps" — before fixing, document the flow so the next person understands

For mentoring specifically: I worked with 2 junior developers, focusing on HOW to think about problems rather than giving solutions. "What would you try first? What could go wrong?"

RESULT: Within 4 months, any team member could handle basic issues in any module. Vacation coverage stopped being a crisis.`,
    followUp: 'How would you onboard a new team member to an unfamiliar codebase?',
    tags: ['mentoring', 'knowledge-sharing', 'teamwork']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Describe a situation where requirements were unclear or changed mid-project.',
    context: 'Logistics requirements evolve as business discovers edge cases.',
    modelAnswer: `SITUATION: We were building a grade calculation module. Halfway through, the business analyst revealed that different course types used different formulas — information that wasn't in the original requirements.

TASK: Adapt without restarting, keep the deadline realistic, and prevent this from happening again.

ACTION:
1. STOP: Paused coding to map ALL formula variations (found 4 types, not just 2)
2. DESIGN: Created a Strategy pattern — each formula type was an independent implementation. Adding new types wouldn't require modifying existing ones.
3. COMMUNICATE: Sent the business analyst a clear summary: "Here are the 4 cases I found. Confirm which are in scope for this delivery."
4. DELIVER: Implemented 2 types for the deadline, 2 more in the next sprint

RESULT: Delivered on time with the correct architecture. When the 3rd and 4th formula types were needed, each took 1 day instead of a week because the extension point was already in place.

LESSON: "When requirements are unclear, I invest time to discover the full picture before coding. It seems slower but prevents rework."`,
    followUp: 'How do you handle stakeholders who keep adding "just one more thing"?',
    tags: ['ambiguity', 'adaptability', 'communication']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Tell me about a technical mistake you made and what you learned from it.',
    context: 'REWE values honesty and growth mindset. Show vulnerability + learning.',
    modelAnswer: `SITUATION: Early in a project, I wrote a batch process that loaded ALL records into memory before processing them. It worked fine in dev (1000 records) but caused OutOfMemoryError in production (200,000 records).

TASK: Fix the immediate production issue and ensure I didn't repeat the pattern.

ACTION:
1. IMMEDIATE: Increased JVM heap as a temporary fix (bought time)
2. ROOT FIX: Rewrote to use pagination — process 500 records at a time, flush, continue
3. PREVENTION: Created a personal checklist: "Before any batch/list operation, ask: what's the maximum volume in production?"
4. SHARED: Presented the incident to the team as a "lessons learned" — no blame, just the pattern to avoid

RESULT: The batch process ran reliably with constant memory regardless of volume. The "always ask about production volume" mindset became part of my development practice.

WHY I SHARE THIS: "I believe in transparency about mistakes. The value isn't in never failing — it's in learning fast and preventing recurrence. I now always validate assumptions about data volume before writing any collection-based logic."`,
    followUp: 'How do you validate assumptions about production data volumes?',
    tags: ['honesty', 'growth-mindset', 'learning-from-failure']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'How do you approach working in a distributed/remote team?',
    context: 'REWE Digital Spain team TRAB works with colleagues across Spain and Germany.',
    modelAnswer: `SITUATION: My current team works hybrid — some in office, some remote, across different schedules. Communication gaps were causing duplicate work and misunderstandings.

TASK: Be an effective contributor in an async-first environment.

ACTION: My practices:
1. OVER-COMMUNICATE in writing — PR descriptions explain WHY, not just what
2. Make work VISIBLE — update tickets daily, share blockers early (don't wait for standup)
3. Document decisions — if we discuss something in a call, I write a summary in the ticket
4. Respect time zones — async by default, sync calls only when discussion is needed
5. Be responsive — acknowledge messages even if I can't answer immediately ("looking into this, will reply by EOD")

For REWE specifically: I'm comfortable communicating in English professionally. I write clear technical documentation. I proactively share context rather than waiting to be asked.

RESULT: Colleagues consistently noted that my tickets and PRs required fewer clarification questions. Async communication improved overall team velocity.`,
    followUp: 'How do you handle a situation where you\'re blocked waiting for someone in another time zone?',
    tags: ['remote-work', 'communication', 'async']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Why REWE Digital? Why this team specifically?',
    context: 'Show genuine interest in the domain, not just "I want a job in Europe."',
    modelAnswer: `I'm specifically interested in REWE Digital Spain for three reasons:

1. THE DOMAIN — Transport logistics is a fascinating optimization problem. Real-time constraints (deliveries must happen NOW), complex state machines (planned → dispatched → delayed → completed), event-driven architecture (Kafka for tracking, notifications, analytics). This is the kind of system where good engineering directly impacts real-world outcomes.

2. THE STACK — Spring Boot + Kafka + Kubernetes is the evolution of what I've been doing with Java EE + JMS + containers. My 5 years of enterprise Java give me strong foundations; REWE gives me the modern stack to apply them.

3. THE TEAM — Team TRAB works on Transportabwicklung — the core logistics execution. Not a support tool, not a back-office system. The service that actually moves products. I want to work where engineering decisions matter at scale.

I'm not looking for "any job in Spain." I'm looking for a team where my enterprise Java experience is valued AND I can grow into the cloud-native ecosystem with Kafka and Kubernetes.`,
    followUp: 'What do you know about our tech stack and architecture?',
    tags: ['motivation', 'culture-fit', 'company-research']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'How do you stay current with technology trends?',
    context: 'Show continuous learning without being a hype-chaser.',
    modelAnswer: `My approach is DEPTH over breadth:

1. DAILY (~30min): Technical blogs/newsletters (Baeldung for Java/Spring, Confluent blog for Kafka, InfoQ for architecture). I read to understand patterns, not to chase every new framework.

2. WEEKLY: Hands-on practice. Currently building an interview prep app to sharpen my Java fundamentals and explore concepts I use less frequently. Code is how I truly learn.

3. MONTHLY: Deep dive into one topic. Last month: Kafka internals (partitioning, consumer groups, exactly-once semantics). This month: Spring Boot testing strategies.

4. SELECTIVELY: I don't learn everything. I evaluate: "Will this help me solve real problems in the next 1-2 years?" Kafka and Kubernetes — yes. The latest JavaScript framework — no.

WHAT I AVOID: Tutorial hell (watching without building), hype-driven learning (learning tech just because it's trending), and breadth without depth (knowing 20 frameworks superficially).

The goal isn't knowing every new thing — it's having deep understanding of the tools I use professionally.`,
    followUp: 'What technology are you most excited about learning right now?',
    tags: ['learning', 'growth-mindset', 'self-awareness']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Tell me about a time you had to work with a difficult stakeholder or colleague.',
    context: 'REWE wants emotional intelligence and professionalism.',
    modelAnswer: `SITUATION: A business analyst consistently provided incomplete requirements, then blamed development when features didn't match expectations. The team was frustrated.

TASK: Deliver correct features without damaging the working relationship.

ACTION: Instead of escalating or complaining, I changed my approach:
1. BEFORE starting: I wrote my understanding of the requirement as acceptance criteria and sent it for confirmation. "Just to confirm — here's what I'll build. Correct?"
2. DURING development: Quick check-ins at decision points. "I found two possible interpretations. Which one is correct?"
3. AFTER delivery: Demo BEFORE marking as complete. "Here's what I built based on our agreement."

I also had a 1-on-1 conversation: "I want to deliver what you need. The more context you give me upfront, the less rework for both of us. Can we try a template for requirements?"

RESULT: Misunderstandings dropped by ~80%. The analyst started providing better requirements because they saw the template worked. No conflict, no blame — just a better process.

KEY PRINCIPLE: "I assume positive intent. They're not trying to be difficult — they're busy and think the requirement is clear. My job is to surface ambiguity early."`,
    followUp: 'What if the person refuses to provide clearer requirements?',
    tags: ['difficult-people', 'emotional-intelligence', 'professionalism']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'How do you balance code quality with delivery speed?',
    context: 'REWE transport runs on deadlines. Perfect code that ships late is useless.',
    modelAnswer: `My rule: "Never sacrifice correctness. Sacrifice sophistication."

In practice:
• ALWAYS: Tests for critical paths, proper error handling, secure code, clear naming
• SOMETIMES: Elegant abstractions, perfect performance optimization, comprehensive docs
• NEVER: Shortcuts that create data integrity risks or security vulnerabilities

EXAMPLE: Under deadline pressure for a delivery tracking feature:
- Used a simple switch statement (3 cases) instead of a Strategy pattern — FINE for now
- Skipped building a custom admin dashboard — used existing database queries — FINE
- Did NOT skip input validation or error handling — NON-NEGOTIABLE
- Did NOT skip the idempotency check on the event consumer — data integrity is sacred

The test: "If this shortcut causes a production issue at 3am, would I be embarrassed?" If yes, don't take it. If it's just "not the most elegant solution" — ship it and improve later.

I also communicate: "I'm delivering this with a known simplification. I'll create a ticket to revisit if the case count grows beyond 5."`,
    followUp: 'Give me an example of technical debt you intentionally took on and how you managed it.',
    tags: ['pragmatism', 'quality', 'trade-offs']
  },
  {
    type: 'ORAL_ANSWER',
    question: 'Where do you see yourself in 2-3 years?',
    context: 'Show ambition within the team, not ambition to leave.',
    modelAnswer: `In 2-3 years, I want to be a technical reference within the team — the person who:

1. OWNS a critical part of the system end-to-end (design → implement → operate → improve)
2. MENTORS newer team members on architecture and best practices
3. CONTRIBUTES to technical decisions at the team/squad level
4. Has DEEP knowledge of the logistics domain — understanding business context, not just code

Concretely at REWE:
- Year 1: Become productive, understand the existing services, deliver features autonomously
- Year 2: Propose architectural improvements, lead design discussions, mentor juniors
- Year 3: Be a go-to person for complex problems in the transport domain

I'm NOT looking to become a manager. I want to grow as a senior engineer who makes the team better technically. The title matters less than the impact.

I chose REWE specifically because it's a place where I can grow technically for years — the domain is complex enough, the scale is real, and the stack is modern.`,
    followUp: 'What would make you leave a job?',
    tags: ['career-goals', 'ambition', 'retention']
  }
];
