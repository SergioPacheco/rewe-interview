/**
 * Java Interview Prep — REWE Senior
 * Topic-based interview preparation with interactive exercises
 */

// ============================================================
// TOPICS REGISTRY
// ============================================================
const topics = [
  // --- PRIORITY 0 — COMPANY CONTEXT ---
  { id: 'rewe', name: 'REWE Digital — TRAB', icon: '🏢', priority: 1, desc: 'Team, domain, NEO, plug-and-play, system design', mode: 'interview',
    subtopics: [
      { id: 'rewe-job', label: '📄 Job Description' },
      { id: 'rewe-trab', label: 'TRAB Team Context' },
      { id: 'rewe-problem', label: 'Business Problem' },
      { id: 'rewe-neo', label: 'NEO Platform' },
      { id: 'rewe-connection', label: 'Your Experience → TRAB' },
      { id: 'rewe-questions', label: 'Questions to Ask' }
    ]
  },
  // --- PRIORITY 1 ---
  { id: 'portfolio', name: 'Portfolio: SinapiPRO', icon: '💼', priority: 1, desc: 'Your project — Java 25, Spring Boot 4, Angular 19, K8s, Observability', mode: 'interview',
    subtopics: [
      { id: 'port-overview', label: 'What is SinapiPRO' },
      { id: 'port-match', label: 'Match → TRAB Vacancy' },
      { id: 'port-arch', label: 'Architecture Decisions' },
      { id: 'port-pitch', label: 'Interview Pitch Scripts' },
      { id: 'port-parallels', label: 'SinapiPRO ↔ TRAB' }
    ]
  },
  { id: 'oop', name: 'OOP & SOLID', icon: '🏗️', priority: 1, desc: 'Polymorphism, Composition, SOLID — interview depth', mode: 'interview',
    subtopics: [
      { id: 'oop-encapsulation', label: 'Encapsulation' },
      { id: 'oop-abstraction', label: 'Abstraction' },
      { id: 'oop-inheritance', label: 'Inheritance' },
      { id: 'oop-polymorphism', label: 'Polymorphism' },
      { id: 'oop-composition', label: 'Composition' }
    ]
  },
  { id: 'solid', name: 'SOLID Principles', icon: '🧱', priority: 1, desc: 'S.O.L.I.D — in pictures & code', mode: 'interview',
    subtopics: [
      { id: 'solid-srp', label: 'S — Single Responsibility' },
      { id: 'solid-ocp', label: 'O — Open/Closed' },
      { id: 'solid-lsp', label: 'L — Liskov Substitution' },
      { id: 'solid-isp', label: 'I — Interface Segregation' },
      { id: 'solid-dip', label: 'D — Dependency Inversion' }
    ]
  },
  { id: 'collections', name: 'Java Core (OCA)', icon: '☕', priority: 1, desc: 'OCA 1Z0-808 syllabus — rebuild fluency', mode: 'interview',
    subtopics: [
      { id: 'java-basics', label: 'Java Basics' },
      { id: 'java-types', label: 'Data Types' },
      { id: 'java-operators', label: 'Operators & Decisions' },
      { id: 'java-arrays', label: 'Arrays' },
      { id: 'java-loops', label: 'Loops' },
      { id: 'java-methods', label: 'Methods & Encapsulation' },
      { id: 'java-inheritance', label: 'Inheritance' },
      { id: 'java-exceptions', label: 'Exceptions' },
      { id: 'java-api', label: 'String, Date, Lambda' },
      { id: 'java-modern', label: 'Java 17+ (Records, Sealed)' }
    ]
  },
  { id: 'sql', name: 'SQL & Performance', icon: '🗄️', priority: 1, desc: 'Joins, indexes, execution plans, optimization', mode: 'interview',
    subtopics: [
      { id: 'sql-joins', label: 'JOINs' },
      { id: 'sql-indexes', label: 'Indexes & EXPLAIN' },
      { id: 'sql-transactions', label: 'Transactions & Isolation' },
      { id: 'sql-performance', label: 'N+1 & Optimization' }
    ]
  },
  { id: 'system-design', name: 'System Design', icon: '🏭', priority: 1, desc: 'Logistics: delivery tracking, events, scaling', mode: 'interview',
    subtopics: [
      { id: 'sd-events', label: 'Event-Driven Architecture' },
      { id: 'sd-data', label: 'Data & Consistency' },
      { id: 'sd-scaling', label: 'Scaling & Performance' },
      { id: 'sd-ops', label: 'Deployment & Observability' }
    ]
  },
  { id: 'behavioral', name: 'Behavioral', icon: '🎯', priority: 1, desc: 'STAR stories: conflict, leadership, performance', mode: 'interview',
    subtopics: [
      { id: 'beh-adaptability', label: 'Adaptability & Learning' },
      { id: 'beh-conflict', label: 'Conflict & Communication' },
      { id: 'beh-leadership', label: 'Leadership & Initiative' },
      { id: 'beh-pressure', label: 'Pressure & Deadlines' },
      { id: 'beh-culture', label: 'Culture Fit & Motivation' }
    ]
  },
  // --- PRIORITY 2 ---
  { id: 'spring', name: 'Spring Boot', icon: '🌱', priority: 2, desc: 'Java EE → Spring Boot transition', mode: 'interview',
    subtopics: [
      { id: 'spring-di', label: 'DI & Beans' },
      { id: 'spring-data', label: 'Spring Data JPA' },
      { id: 'spring-rest', label: 'REST Controllers' },
      { id: 'spring-config', label: 'Config & Profiles' },
      { id: 'spring-testing', label: 'Testing' },
      { id: 'spring-actuator', label: 'Actuator & Health' }
    ]
  },
  { id: 'rest', name: 'REST APIs', icon: '🔌', priority: 2, desc: 'Verbs, status codes, idempotency, versioning', mode: 'interview',
    subtopics: [
      { id: 'rest-verbs', label: 'Verbs & Status Codes' },
      { id: 'rest-design', label: 'Pagination & Errors' },
      { id: 'rest-versioning', label: 'Versioning & Idempotency' }
    ]
  },
  { id: 'kafka', name: 'Kafka', icon: '📨', priority: 2, desc: 'JMS → Kafka transition, events, consumers', mode: 'interview',
    subtopics: [
      { id: 'kafka-overview', label: 'JMS vs Kafka' },
      { id: 'kafka-architecture', label: 'Topics & Partitions' },
      { id: 'kafka-consumers', label: 'Consumer Groups' },
      { id: 'kafka-delivery', label: 'Delivery Semantics' },
      { id: 'kafka-producer', label: 'Producer Patterns' }
    ]
  },
  { id: 'jpa', name: 'Hibernate/JPA', icon: '💾', priority: 2, desc: 'Lazy vs Eager, N+1, transactions, locking', mode: 'interview',
    subtopics: [
      { id: 'jpa-basics', label: 'Entity Mapping' },
      { id: 'jpa-relations', label: 'Relations & Fetch' },
      { id: 'jpa-queries', label: 'JPQL & Criteria' }
    ]
  },
  { id: 'concurrency', name: 'Concurrency', icon: '⚡', priority: 2, desc: 'ExecutorService, CompletableFuture, Thread Pools', mode: 'interview',
    subtopics: [
      { id: 'conc-threads', label: 'Threads & Pools' },
      { id: 'conc-completable', label: 'CompletableFuture' },
      { id: 'conc-safety', label: 'Thread Safety' }
    ]
  },
  { id: 'patterns', name: 'Design Patterns', icon: '🧩', priority: 2, desc: 'Strategy, Factory, Observer, Builder — logistics examples', mode: 'interview',
    subtopics: [
      { id: 'pat-strategy', label: 'Strategy' },
      { id: 'pat-factory', label: 'Factory' },
      { id: 'pat-observer', label: 'Observer' },
      { id: 'pat-builder', label: 'Builder' }
    ]
  },
  { id: 'testing', name: 'Testing', icon: '🧪', priority: 2, desc: 'JUnit 5, Mockito, Testcontainers, TDD', mode: 'interview',
    subtopics: [
      { id: 'test-pyramid', label: 'Strategy & TDD' },
      { id: 'test-junit', label: 'JUnit 5 + Mockito' },
      { id: 'test-integration', label: 'Testcontainers' }
    ]
  },
  // --- PRIORITY 3 ---
  { id: 'docker', name: 'Docker', icon: '🐳', priority: 3, desc: 'Dockerfile, images, volumes, containers', mode: 'interview',
    subtopics: [
      { id: 'docker-basics', label: 'Images & Containers' },
      { id: 'docker-compose', label: 'Compose & Volumes' }
    ]
  },
  { id: 'k8s', name: 'Kubernetes', icon: '☸️', priority: 3, desc: 'Pods, Deployments, Services, Rolling Updates', mode: 'interview',
    subtopics: [
      { id: 'k8s-pods', label: 'Pods & Deployments' },
      { id: 'k8s-services', label: 'Services & Probes' }
    ]
  },
  { id: 'kotlin', name: 'Kotlin', icon: '🟣', priority: 3, desc: 'Null safety, data classes, extensions, Spring Boot', mode: 'interview',
    subtopics: [
      { id: 'kotlin-basics', label: 'Kotlin vs Java' },
      { id: 'kotlin-null', label: 'Null Safety' },
      { id: 'kotlin-classes', label: 'Classes & Extensions' }
    ]
  },
  { id: 'angular', name: 'Angular', icon: '🅰️', priority: 3, desc: 'Components, Services, Signals, PrimeNG — basics for backend devs', mode: 'interview',
    subtopics: [
      { id: 'ng-basics', label: 'Core Concepts' },
      { id: 'ng-services', label: 'Services, HTTP & State' },
      { id: 'ng-routing', label: 'Routing & PrimeNG' }
    ]
  },
];

// ============================================================
// LEVELS DATA (by topic)
// ============================================================
const levelsByTopic = {};

// --- P1: OOP & SOLID ---
levelsByTopic['oop'] = [
  {
    type: 'FILL_BLANK',
    mission: 'Interview Q: "Why would you prefer <strong>composition over inheritance</strong>?"<br>Complete the code showing the preferred approach.',
    code: 'class OrderService {\n  private final _____ validator;\n  // Delegates validation instead of inheriting\n}',
    blank: '_____',
    choices: ['OrderValidator', 'extends Validator', 'implements Order', 'abstract'],
    answer: 'OrderValidator',
    explain: 'Composition: inject a dependency rather than inherit. This gives flexibility to swap implementations, follows "program to an interface", and avoids fragile base class problem. Real example: "In our education system, we composed ValidationService into MatriculaBusiness rather than creating a deep hierarchy."'
  },
  {
    type: 'PICK_INVALID',
    mission: 'Interview Q: "Which SOLID principle is being <strong>violated</strong>?"',
    snippets: [
      { id: 'a', code: 'class ReportService {\n  void generate() {...}\n  void sendEmail() {...}\n  void saveToDb() {...}\n}', valid: false },
      { id: 'b', code: 'class ReportGenerator {\n  void generate() {...}\n}', valid: true },
      { id: 'c', code: 'class ReportSender {\n  void send(Report r) {...}\n}', valid: true }
    ],
    answer: 'a',
    explain: 'Single Responsibility Principle (SRP): ReportService does THREE things — generate, email, persist. Each reason to change should be in its own class. "At SENAI, we separated Business (logic), JMS (messaging) and Repository (persistence) layers precisely for this reason."'
  },
  {
    type: 'PREDICT_OUTPUT',
    mission: 'Interview Q: "Explain <strong>runtime polymorphism</strong> with this code."',
    code: 'abstract class Delivery {\n  abstract String status();\n}\nclass Express extends Delivery {\n  String status() { return "FAST"; }\n}\nclass Standard extends Delivery {\n  String status() { return "NORMAL"; }\n}\nDelivery d = new Express();\nSystem.out.println(d.status());',
    choices: ['FAST', 'NORMAL', 'Compile Error', 'null'],
    answer: 'FAST',
    explain: 'Runtime polymorphism: the JVM calls Express.status() because the ACTUAL object is Express, not the reference type. "We used this pattern extensively — a generic Document interface with CertificateDocument and DiplomaDocument implementations, selected at runtime based on student completion type."'
  },
  {
    type: 'FILL_BLANK',
    mission: 'Interview Q: "Tell me one SOLID principle you use <strong>every day</strong>."<br>Which principle does this demonstrate?',
    code: '// Adding new delivery type without modifying existing code\ninterface DeliveryCalculator {\n  BigDecimal calculate(Order o);\n}\n// New class, no changes to existing:\nclass DroneDelivery _____ DeliveryCalculator { }',
    blank: '_____',
    choices: ['implements', 'extends', 'overrides', 'abstract'],
    answer: 'implements',
    explain: 'Open/Closed Principle: open for extension, closed for modification. New behavior via new implementations, not editing existing classes. "Every time we added a new enrollment type (regular, corporate, online), we created a new strategy class without touching the orchestrator."'
  },
  {
    type: 'ORDER_EXECUTION',
    mission: 'Interview Q: "Explain the <strong>Template Method</strong> pattern execution order."',
    items: [
      { id: 'call', label: 'Client calls process()' },
      { id: 'template', label: 'Abstract class runs template method' },
      { id: 'hook', label: 'Calls abstract step (hook)' },
      { id: 'concrete', label: 'Concrete subclass executes the step' },
      { id: 'return', label: 'Control returns to template' }
    ],
    answer: ['call', 'template', 'hook', 'concrete', 'return'],
    explain: 'Template Method defines the skeleton in a base class, deferring specific steps to subclasses. "We used this for report generation: the base class handled header/footer/pagination, while each report type only implemented the data-fetching step."'
  },
  {
    type: 'PICK_INVALID',
    mission: 'Interview Q: "Which demonstrates <strong>Liskov Substitution</strong> violation?"',
    snippets: [
      { id: 'a', code: 'class Square extends Rectangle {\n  void setWidth(int w) {\n    super.setWidth(w);\n    super.setHeight(w); // Breaks!\n  }\n}', valid: false },
      { id: 'b', code: 'interface Shape {\n  double area();\n}\nclass Square implements Shape {...}', valid: true },
      { id: 'c', code: 'class Circle extends Shape {\n  double area() { return PI*r*r; }\n}', valid: true }
    ],
    answer: 'a',
    explain: 'Liskov Substitution: a subclass must be substitutable for its parent without breaking behavior. Square extending Rectangle violates this because setWidth() has a hidden side-effect. "This is why we prefer interfaces over deep hierarchies — no behavior assumptions to break."'
  },
];

// --- P1: Collections — now in interview mode (java-core-1.js) ---

// --- P1: SQL & Performance ---
levelsByTopic['sql'] = [
  {
    type: 'FILL_BLANK',
    mission: 'Interview Q: "Tell me about a query you <strong>optimized dramatically</strong>."<br>What does this index strategy fix?',
    code: '-- Query scanning 2M rows → full table scan\n-- Fix: composite index on the WHERE clause columns\nCREATE INDEX idx_order_status_date\n  ON orders(status, _____);',
    blank: '_____',
    choices: ['created_at', 'id', '*', 'HASH'],
    answer: 'created_at',
    explain: '"We reduced a query from 10 seconds to 300ms by adding a composite index matching the WHERE clause order. The leftmost prefix rule means (status, created_at) covers WHERE status=X AND created_at > Y but NOT WHERE created_at > Y alone."'
  },
  {
    type: 'ORDER_EXECUTION',
    mission: 'Interview Q: "Walk me through how you <strong>analyze a slow query</strong>."',
    items: [
      { id: 'explain', label: 'Run EXPLAIN ANALYZE' },
      { id: 'scan', label: 'Identify Seq Scan on large table' },
      { id: 'where', label: 'Check WHERE clause columns' },
      { id: 'index', label: 'Create targeted index' },
      { id: 'verify', label: 'Verify Index Scan in new plan' }
    ],
    answer: ['explain', 'scan', 'where', 'index', 'verify'],
    explain: '"My systematic approach: EXPLAIN ANALYZE first, look for Seq Scans on large tables, check if WHERE/JOIN columns are indexed, create a composite index matching the query pattern, then verify the plan shows Index Scan. We saved 97% execution time on a student enrollment report this way."'
  },
  {
    type: 'PICK_INVALID',
    mission: 'Interview Q: "Which JOIN pattern <strong>kills performance</strong> at scale?"',
    snippets: [
      { id: 'a', code: 'SELECT * FROM orders o\nJOIN items i ON o.id = i.order_id\nWHERE o.status = \'PENDING\'', valid: true },
      { id: 'b', code: 'SELECT * FROM orders o\nWHERE EXISTS (\n  SELECT 1 FROM items i\n  WHERE i.order_id = o.id\n)', valid: true },
      { id: 'c', code: 'SELECT * FROM orders o\nWHERE o.id IN (\n  SELECT order_id FROM items\n  WHERE category IN (\n    SELECT id FROM categories\n    WHERE active = true\n  )\n)', valid: false }
    ],
    answer: 'c',
    explain: 'Deeply nested subqueries can force the optimizer into nested loop execution. Prefer JOINs or flat EXISTS. "At SENAI we refactored nested IN-subqueries into JOINs with proper indexes — one case went from 45s to 200ms because the planner could use hash joins instead of nested loops."'
  },
  {
    type: 'FILL_BLANK',
    mission: 'Interview Q: "How do you handle <strong>batch operations</strong> efficiently?"',
    code: '-- Insert 10,000 orders without killing the DB\nINSERT INTO orders (id, status, created_at)\nVALUES _____ ;',
    blank: '_____',
    choices: ['(1,..),(2,..),(3,..)', 'SELECT * FROM temp', 'LOOP 10000', 'ONE BY ONE'],
    answer: '(1,..),(2,..),(3,..)',
    explain: 'Batch INSERT with multiple VALUES is dramatically faster than individual inserts. "We process enrollment batches of 5,000+ records — multi-row INSERT with JDBC batch (rewriteBatchedStatements) reduced time from 3 minutes to 8 seconds. Plus we commit in chunks of 500 to avoid long lock holds."'
  },
  {
    type: 'PREDICT_OUTPUT',
    mission: 'Interview Q: "What is the difference between <strong>LEFT JOIN and INNER JOIN</strong>?"',
    code: '-- orders: [{id:1, customer:A}, {id:2, customer:B}]\n-- payments: [{order_id:1, amount:100}]\n-- (order 2 has NO payment)\nSELECT COUNT(*)\nFROM orders o\nLEFT JOIN payments p ON o.id = p.order_id;',
    choices: ['1', '2', '0', 'Error'],
    answer: '2',
    explain: 'LEFT JOIN keeps ALL rows from left table even without match (NULL for missing). INNER JOIN would return only 1 (matched rows). "This distinction is critical in reporting — we LEFT JOIN enrollment with payment to find students who enrolled but haven\'t paid yet."'
  },
];

// --- P1: System Design ---
levelsByTopic['system-design'] = [
  {
    type: 'ORDER_EXECUTION',
    mission: 'Design: "<strong>Delivery Tracking System</strong>" — arrange the components.',
    items: [
      { id: 'event', label: 'Driver app sends GPS event' },
      { id: 'queue', label: 'Event enters message queue (Kafka)' },
      { id: 'process', label: 'Tracking service consumes event' },
      { id: 'store', label: 'Update delivery status in DB' },
      { id: 'notify', label: 'Push notification to customer' }
    ],
    answer: ['event', 'queue', 'process', 'store', 'notify'],
    explain: '"For delivery tracking at scale: decouple with a message queue (Kafka) to handle burst GPS events, process asynchronously, persist state, then notify. This handles 10k+ drivers sending events every 30 seconds without overwhelming the database. At SENAI we used JMS/Artemis for similar async patterns."'
  },
  {
    type: 'PICK_INVALID',
    mission: 'Design: "Which is a <strong>bad approach</strong> for Inventory Management?"',
    snippets: [
      { id: 'a', code: 'Synchronous HTTP call\nfor every stock update\nfrom 500 warehouses\n(sequential, blocking)', valid: false },
      { id: 'b', code: 'Event-driven:\nWarehouse publishes StockChanged\nInventory service consumes async', valid: true },
      { id: 'c', code: 'CQRS: separate read model\n(fast queries) from write\nmodel (transactional updates)', valid: true }
    ],
    answer: 'a',
    explain: '"Synchronous HTTP to 500 warehouses is a disaster: one slow warehouse blocks everything, no retry, no backpressure. Event-driven architecture handles this — each warehouse publishes events, the inventory service processes at its own pace. At SENAI we learned this the hard way with LDAP calls inside transactions blocking the entire system."'
  },
  {
    type: 'FILL_BLANK',
    mission: 'Design: "How do you ensure <strong>order status consistency</strong> across services?"',
    code: '// Pattern: _____ ensures local DB write and event publish are atomic\n// 1. Write order + event to local DB (single transaction)\n// 2. Separate process reads and publishes events',
    blank: '_____',
    choices: ['Outbox Pattern', '2-Phase Commit', 'Saga Pattern', 'Direct REST'],
    answer: 'Outbox Pattern',
    explain: '"The Outbox Pattern: write your business data AND an outbox event in the same local transaction. A separate dispatcher reads unpublished events and sends them to the message broker. This avoids distributed transactions while guaranteeing at-least-once delivery. We use this pattern at SENAI for enrollment-to-LMS integration."'
  },
  {
    type: 'ORDER_EXECUTION',
    mission: 'Design: "<strong>Warehouse Management</strong>" — order the flow for receiving goods.',
    items: [
      { id: 'scan', label: 'Scan barcode at receiving dock' },
      { id: 'validate', label: 'Validate against purchase order' },
      { id: 'assign', label: 'Assign storage location (bin)' },
      { id: 'update', label: 'Update inventory count' },
      { id: 'index', label: 'Index for order fulfillment' }
    ],
    answer: ['scan', 'validate', 'assign', 'update', 'index'],
    explain: '"A well-designed WMS flow: identify (scan) → validate (is this expected?) → locate (where to store) → record (update counts) → enable (make available for picking). Each step can fail independently, so we need idempotent operations and clear error states."'
  },
  {
    type: 'FILL_BLANK',
    mission: 'Design: "How would you handle <strong>10,000 concurrent delivery status checks</strong>?"',
    code: '// High-read, low-write scenario\n// Strategy: _____ layer between DB and clients\n// TTL: 30 seconds (acceptable staleness for tracking)',
    blank: '_____',
    choices: ['Cache (Redis)', 'More DB replicas', 'Bigger server', 'Load balancer'],
    answer: 'Cache (Redis)',
    explain: '"For read-heavy workloads like delivery status: cache aggressively. Redis with 30s TTL gives you sub-ms reads for 99% of requests. Only cache misses hit the DB. At SENAI we use Infinispan cache for similar patterns — configuration data, unit lookups. The key insight: 30s staleness is acceptable for \'where is my package?\' but not for payment status."'
  },
];

// --- P1: Behavioral ---
levelsByTopic['behavioral'] = [
  {
    type: 'ORDER_EXECUTION',
    mission: 'Structure your answer using the <strong>STAR method</strong>.',
    items: [
      { id: 's', label: 'Situation — Set the context' },
      { id: 't', label: 'Task — What was your responsibility' },
      { id: 'a', label: 'Action — What YOU specifically did' },
      { id: 'r', label: 'Result — Measurable outcome' }
    ],
    answer: ['s', 't', 'a', 'r'],
    explain: '"Every behavioral answer MUST have a measurable result. Not \'it went well\' but \'reduced query time from 10s to 300ms\' or \'eliminated 95% of enrollment errors\'. The interviewer is evaluating your IMPACT, not your intentions."'
  },
  {
    type: 'PICK_INVALID',
    mission: '"Tell me about your <strong>biggest technical challenge</strong>."<br>Which answer is <strong>weak</strong>?',
    snippets: [
      { id: 'a', code: '"It was a team effort,\neveryone contributed equally.\nWe fixed it together."', valid: false },
      { id: 'b', code: '"I identified the bottleneck\nwas N+1 queries in the report.\nI redesigned using batch fetch,\nreducing time from 45s to 2s."', valid: true },
      { id: 'c', code: '"I proposed separating the\nsync LDAP call from the\ntransaction, which eliminated\npool exhaustion during peak."', valid: true }
    ],
    answer: 'a',
    explain: '"Team effort" answers are vague — the interviewer wants to know what YOU did. Be specific: "I analyzed...", "I proposed...", "I implemented...". You can acknowledge the team while owning your contribution.'
  },
  {
    type: 'FILL_BLANK',
    mission: '"Tell me about a <strong>conflict</strong> with a colleague."<br>What is the critical element?',
    code: 'STAR for conflict:\n- Situation: disagreed on approach\n- Task: needed to reach consensus\n- Action: _____ to understand their concern\n- Result: found a hybrid solution',
    blank: '_____',
    choices: ['Listened first', 'Escalated to manager', 'Proved I was right', 'Ignored them'],
    answer: 'Listened first',
    explain: '"In conflict stories, ALWAYS show emotional intelligence: you listened, you understood their perspective, THEN you proposed a solution. Never: \'I escalated\' or \'I proved them wrong.\' Show collaboration. My real example: disagreed with DBA about index strategy — I ran EXPLAIN ANALYZE on both approaches and data settled the debate."'
  },
  {
    type: 'PICK_INVALID',
    mission: '"Describe a <strong>mistake you made</strong>."<br>Which response is <strong>worst</strong>?',
    snippets: [
      { id: 'a', code: '"I deployed without checking\nthe execution plan. Query caused\ntimeout cascade. I learned to\nalways EXPLAIN ANALYZE first."', valid: true },
      { id: 'b', code: '"I\'ve never made a significant\nmistake in my career.\nI\'m very careful."', valid: false },
      { id: 'c', code: '"I underestimated migration\ncomplexity. Took 3x longer.\nNow I add 50% buffer and\nprototype risky parts first."', valid: true }
    ],
    answer: 'b',
    explain: '"Never made a mistake" is the WORST answer — it shows lack of self-awareness. They want: real mistake + ownership + what you learned + how you prevent it now. Vulnerability + growth = credibility.'
  },
  {
    type: 'ORDER_EXECUTION',
    mission: '"How do you approach <strong>performance optimization</strong>?"<br>Order your methodology.',
    items: [
      { id: 'measure', label: 'Measure: identify the actual bottleneck' },
      { id: 'hypothesis', label: 'Hypothesis: propose root cause' },
      { id: 'test', label: 'Test: validate with EXPLAIN/profiler' },
      { id: 'fix', label: 'Fix: apply targeted optimization' },
      { id: 'verify', label: 'Verify: confirm improvement with metrics' }
    ],
    answer: ['measure', 'hypothesis', 'test', 'fix', 'verify'],
    explain: '"I never optimize blindly. Real example: Glowroot showed p95 latency spike on enrollment page. Traced to N+1 in student listing. Hypothesis: eager fetch would fix. Tested with EXPLAIN ANALYZE — confirmed. Applied batch fetch. Result: 45s → 2s. ALWAYS measure before and after."'
  },
];

// --- P2: Spring Boot ---
levelsByTopic['spring'] = [
  {
    type: 'FILL_BLANK',
    mission: 'Interview Q: "How does <strong>dependency injection</strong> work in Spring?"',
    code: '@Service\npublic class OrderService {\n  private final OrderRepository repo;\n  \n  _____ // Spring injects the dependency\n  public OrderService(OrderRepository repo) {\n    this.repo = repo;\n  }\n}',
    blank: '_____',
    choices: ['@Autowired', '@Inject', '@Resource', '// nothing needed'],
    answer: '// nothing needed',
    explain: 'Since Spring 4.3, if a class has only ONE constructor, @Autowired is optional — Spring auto-detects it. "My Jakarta EE background uses @Inject/@EJB which is conceptually identical. Spring just adds auto-configuration on top. Constructor injection is preferred for immutability and testability."'
  },
  {
    type: 'PICK_INVALID',
    mission: 'Interview Q: "What is <strong>Spring Boot auto-configuration</strong>?"',
    snippets: [
      { id: 'a', code: 'Spring scans classpath.\nFinds H2 jar + no DataSource bean\n→ auto-creates embedded DB.', valid: true },
      { id: 'b', code: '@ConditionalOnMissingBean\nmeans: only create this bean\nif user hasn\'t defined one.', valid: true },
      { id: 'c', code: 'Auto-configuration generates\ncode at compile time,\nlike Lombok or annotation\nprocessors.', valid: false }
    ],
    answer: 'c',
    explain: 'Auto-configuration is RUNTIME, not compile-time. It uses @Conditional annotations to decide at startup what beans to create based on classpath, existing beans, and properties. "This is similar to WildFly subsystem auto-detection, but more granular and configurable via application.properties."'
  },
  {
    type: 'FILL_BLANK',
    mission: 'Interview Q: "How do you handle <strong>different environments</strong>?"',
    code: '# application-_____.yml\nspring:\n  datasource:\n    url: jdbc:postgresql://prod-db:5432/orders',
    blank: '_____',
    choices: ['prod', 'default', 'main', 'release'],
    answer: 'prod',
    explain: 'Spring Profiles: application-{profile}.yml overrides defaults. Activate with --spring.profiles.active=prod. "In Jakarta EE, we achieve this with MicroProfile Config + environment variables. Same concept: externalize configuration per environment. Spring just makes it more declarative."'
  },
];

// --- P2: REST ---
levelsByTopic['rest'] = [
  {
    type: 'FILL_BLANK',
    mission: 'Interview Q: "Is PUT <strong>idempotent</strong>? What about POST?"',
    code: '// Calling this 5 times should produce the SAME result as calling it once\n// This is the definition of: _____',
    blank: '_____',
    choices: ['Idempotent', 'Stateless', 'Cacheable', 'Safe'],
    answer: 'Idempotent',
    explain: 'Idempotent: multiple identical requests have same effect as one. PUT (replace entire resource) and DELETE are idempotent. POST (create new) is NOT — calling it 5 times may create 5 resources. "This matters for retry logic: safe to retry PUT on timeout, but POST needs an idempotency key."'
  },
  {
    type: 'PICK_INVALID',
    mission: 'Interview Q: "Which HTTP status is <strong>wrong</strong> for this situation?"',
    snippets: [
      { id: 'a', code: 'Resource not found → 404\nValidation failed → 400\nCreated successfully → 201', valid: true },
      { id: 'b', code: 'Server error → 500\nUnauthorized → 401\nForbidden → 403', valid: true },
      { id: 'c', code: 'Resource created → 200\nResource deleted → 201\nNothing changed → 404', valid: false }
    ],
    answer: 'c',
    explain: 'Created → 201 (not 200). Deleted → 204 No Content (not 201). Nothing changed != Not Found. "Correct status codes are crucial for API consumers. At SENAI, we standardized: 201+Location for creation, 204 for deletion, 409 for business conflict, never 200 for everything."'
  },
  {
    type: 'FILL_BLANK',
    mission: 'Interview Q: "When would you use <strong>PATCH vs PUT</strong>?"',
    code: '// Update ONLY the delivery status, not the entire order\n// HTTP verb: _____\n// Body: { "status": "DELIVERED" }',
    blank: '_____',
    choices: ['PATCH', 'PUT', 'POST', 'GET'],
    answer: 'PATCH',
    explain: 'PATCH = partial update (only changed fields). PUT = full replacement (send entire resource). "In logistics, you PATCH delivery status dozens of times (picked up, in transit, delivered) but PUT the full order only on initial creation or major update."'
  },
  {
    type: 'ORDER_EXECUTION',
    mission: 'Interview Q: "How do you <strong>version</strong> a REST API?"',
    items: [
      { id: 'detect', label: 'Detect breaking change needed' },
      { id: 'version', label: 'Create /v2/ endpoint path' },
      { id: 'both', label: 'Keep v1 and v2 running' },
      { id: 'migrate', label: 'Migrate consumers to v2' },
      { id: 'deprecate', label: 'Deprecate v1 with sunset header' }
    ],
    answer: ['detect', 'version', 'both', 'migrate', 'deprecate'],
    explain: '"We version via URL path (/v2/) because it\'s explicit and easy to route. Both versions share the same Business layer — only the endpoint adapts request/response format. Key rule: NEVER break existing consumers. Give them time to migrate."'
  },
];

// --- P2: Hibernate/JPA ---
levelsByTopic['jpa'] = [
  {
    type: 'FILL_BLANK',
    mission: 'Interview Q: "Explain the <strong>N+1 problem</strong>."',
    code: '// Loading 100 orders, each with items\n// BAD: 1 query for orders + 100 queries for items\n// FIX: JOIN _____ to load in 1 query',
    blank: '_____',
    choices: ['FETCH', 'LAZY', 'EAGER', 'SELECT'],
    answer: 'FETCH',
    explain: '"N+1: load parent (1 query) then access each child collection (N queries). Fix with JOIN FETCH in JPQL or @BatchSize. At SENAI, we caught an N+1 on student listing — 1000 students × 3 lazy collections = 3001 queries. JOIN FETCH reduced to 1 query, response from 45s to 2s."'
  },
  {
    type: 'PICK_INVALID',
    mission: 'Interview Q: "When should you use <strong>LAZY vs EAGER</strong> loading?"',
    snippets: [
      { id: 'a', code: '@OneToMany(fetch = LAZY)\n// Default for collections\n// Load only when accessed', valid: true },
      { id: 'b', code: '@ManyToOne(fetch = EAGER)\n// Always load parent with child\n// Good for always-needed refs', valid: true },
      { id: 'c', code: '@OneToMany(fetch = EAGER)\n// Load ALL related collections\n// on every entity load — "safe"', valid: false }
    ],
    answer: 'c',
    explain: 'EAGER on @OneToMany is almost NEVER correct — it loads the entire collection every time the parent is fetched, even when not needed. "Rule: ALWAYS LAZY by default. Use JOIN FETCH in specific queries that need the data. EAGER on collections is the #1 cause of performance problems we see."'
  },
  {
    type: 'FILL_BLANK',
    mission: 'Interview Q: "How does <strong>optimistic locking</strong> work?"',
    code: '@Entity\npublic class Order {\n  @_____\n  private Long version;\n}',
    blank: '_____',
    choices: ['Version', 'Lock', 'Optimistic', 'Transactional'],
    answer: 'Version',
    explain: '@Version: JPA automatically checks that the version hasn\'t changed between read and write. If it has → OptimisticLockException. No DB lock needed. "Perfect for logistics: two dispatchers editing the same order — first one wins, second gets a conflict error and must refresh. Much better than pessimistic locking which blocks concurrent reads."'
  },
  {
    type: 'PREDICT_OUTPUT',
    mission: 'Interview Q: "What happens with <strong>detached entities</strong>?"',
    code: '// Transaction 1: load order\nOrder o = em.find(Order.class, 1L);\nem.detach(o);\n// Later: modify and try to access lazy field\no.getItems().size(); // What happens?',
    choices: ['LazyInitializationException', 'Returns 0', 'Loads from DB', 'NullPointerException'],
    answer: 'LazyInitializationException',
    explain: 'Once detached, the entity has no persistence context — lazy collections cannot be loaded. "This is why we use DTOs for API responses and view layer, never passing managed entities outside the transaction boundary. Alternatively: initialize what you need BEFORE detaching."'
  },
];

// --- P2: Concurrency ---
levelsByTopic['concurrency'] = [
  {
    type: 'FILL_BLANK',
    mission: 'Interview Q: "How do you run <strong>parallel tasks</strong> in Java?"',
    code: 'ExecutorService executor = Executors.newFixedThreadPool(4);\nFuture<Result> future = executor._____(task);',
    blank: '_____',
    choices: ['submit', 'run', 'start', 'execute'],
    answer: 'submit',
    explain: 'submit() returns a Future with the result. execute() returns void (fire-and-forget). "For logistics with parallel warehouse queries: submit tasks to a thread pool, collect Futures, combine results. Never create raw threads — always use a managed pool for controlled concurrency and resource limits."'
  },
  {
    type: 'ORDER_EXECUTION',
    mission: 'Interview Q: "How does <strong>CompletableFuture</strong> compose async operations?"',
    items: [
      { id: 'supply', label: 'supplyAsync(() → fetchOrder())' },
      { id: 'then', label: 'thenApply(order → enrich(order))' },
      { id: 'compose', label: 'thenCompose(o → checkInventory(o))' },
      { id: 'handle', label: 'exceptionally(ex → fallback())' },
      { id: 'join', label: 'join() or get() to retrieve result' }
    ],
    answer: ['supply', 'then', 'compose', 'handle', 'join'],
    explain: '"CompletableFuture chains async steps without callback hell. supplyAsync starts it, thenApply transforms, thenCompose chains another async op, exceptionally handles errors. At SENAI we use this for parallel external calls (Moodle + LDAP) — both run concurrently, combine results when both finish."'
  },
  {
    type: 'PICK_INVALID',
    mission: 'Interview Q: "Which is a <strong>concurrency anti-pattern</strong>?"',
    snippets: [
      { id: 'a', code: 'private int counter = 0;\n// Multiple threads do:\ncounter++; // Not atomic!\n// Race condition!', valid: false },
      { id: 'b', code: 'AtomicInteger counter =\n  new AtomicInteger(0);\ncounter.incrementAndGet();\n// Thread-safe', valid: true },
      { id: 'c', code: 'ConcurrentHashMap<K,V> map;\nmap.computeIfAbsent(key,\n  k -> expensiveCompute(k));\n// Atomic operation', valid: true }
    ],
    answer: 'a',
    explain: 'counter++ is NOT atomic — it\'s read + increment + write. Two threads can read the same value and both write the same result. Use AtomicInteger or synchronized. "In our education system, we had a bug with concurrent enrollment counts — race condition when two students enrolled simultaneously. Fixed with AtomicInteger."'
  },
];

// --- P3: Kafka ---
levelsByTopic['kafka'] = [
  {
    type: 'ORDER_EXECUTION',
    mission: 'Interview Q: "Explain <strong>Kafka basics</strong>."',
    items: [
      { id: 'produce', label: 'Producer publishes event to Topic' },
      { id: 'partition', label: 'Event assigned to Partition (by key)' },
      { id: 'store', label: 'Broker stores event (append-only log)' },
      { id: 'consume', label: 'Consumer Group reads from partition' },
      { id: 'offset', label: 'Consumer commits offset (progress)' }
    ],
    answer: ['produce', 'partition', 'store', 'consume', 'offset'],
    explain: '"Kafka is a distributed log. Producers append, consumers read at their own pace. Partitions enable parallel consumption. Consumer Groups ensure each message is processed once per group. Offset = bookmark of where you stopped reading."'
  },
  {
    type: 'FILL_BLANK',
    mission: 'Interview Q: "When would you use <strong>Kafka over a traditional queue</strong>?"',
    code: '// Scenario: multiple services need the SAME order event\n// Kafka advantage: _____ (multiple consumers, same messages)',
    blank: '_____',
    choices: ['Fan-out / Pub-Sub', 'Point-to-point', 'Request-Reply', 'Polling'],
    answer: 'Fan-out / Pub-Sub',
    explain: '"Kafka excels at fan-out: one event, consumed by inventory service, notification service, and analytics independently. Traditional JMS queues are point-to-point (one consumer). Kafka topics allow multiple consumer groups each reading ALL messages."'
  },
  {
    type: 'PICK_INVALID',
    mission: 'Interview Q: "Which is <strong>NOT</strong> a good Kafka use case?"',
    snippets: [
      { id: 'a', code: 'Real-time order tracking events\nfrom 10,000 delivery trucks\n(high-throughput streaming)', valid: true },
      { id: 'b', code: 'Synchronous request-response\nfor payment authorization\n(needs immediate answer)', valid: false },
      { id: 'c', code: 'Event sourcing: store all\nstate changes as events\n(audit trail + replay)', valid: true }
    ],
    answer: 'b',
    explain: '"Kafka is NOT for request-response patterns. It\'s for async event streaming. Payment authorization needs synchronous HTTP. Kafka shines for: high-throughput events, event sourcing, decoupling services, and replayability."'
  },
];

// --- P3: Docker ---
levelsByTopic['docker'] = [
  {
    type: 'ORDER_EXECUTION',
    mission: 'Interview Q: "What happens when you run <strong>docker build</strong>?"',
    items: [
      { id: 'read', label: 'Read Dockerfile instructions' },
      { id: 'layers', label: 'Execute each instruction as a layer' },
      { id: 'cache', label: 'Use cache for unchanged layers' },
      { id: 'image', label: 'Tag the final image' },
      { id: 'push', label: 'Push to registry (optional)' }
    ],
    answer: ['read', 'layers', 'cache', 'image', 'push'],
    explain: '"Docker builds in layers — each instruction creates an immutable layer. Unchanged layers are cached, making rebuilds fast. Order matters: put rarely-changing steps (apt-get, COPY pom.xml) first for better cache hits."'
  },
  {
    type: 'FILL_BLANK',
    mission: 'Interview Q: "How do you <strong>persist data</strong> when a container is destroyed?"',
    code: 'docker run -v _____ postgres:15',
    blank: '_____',
    choices: ['pgdata:/var/lib/postgresql/data', '--rm', '--network host', '-p 5432:5432'],
    answer: 'pgdata:/var/lib/postgresql/data',
    explain: '"Volumes (-v) persist data outside the container lifecycle. Named volumes (pgdata:...) are managed by Docker. Bind mounts (./local:/container) map host directories. Without a volume, all data is lost when the container stops."'
  },
];

// --- P3: Kubernetes ---
levelsByTopic['k8s'] = [
  {
    type: 'ORDER_EXECUTION',
    mission: 'Interview Q: "How does a <strong>Rolling Update</strong> work in K8s?"',
    items: [
      { id: 'new', label: 'Create new Pod with updated image' },
      { id: 'ready', label: 'Wait for readiness probe to pass' },
      { id: 'route', label: 'Route traffic to new Pod' },
      { id: 'old', label: 'Terminate old Pod' },
      { id: 'repeat', label: 'Repeat until all replicas updated' }
    ],
    answer: ['new', 'ready', 'route', 'old', 'repeat'],
    explain: '"Rolling Update ensures zero downtime: new pods start, become ready, receive traffic — only THEN old pods terminate. If the new pod fails readiness, rollout stops. At SENAI, we deploy on OKD (OpenShift/K8s) with this exact strategy."'
  },
  {
    type: 'FILL_BLANK',
    mission: 'Interview Q: "What is a <strong>Pod</strong>?"',
    code: '// A Pod is the smallest deployable unit in K8s\n// It contains: one or more _____ sharing network/storage',
    blank: '_____',
    choices: ['containers', 'services', 'nodes', 'clusters'],
    answer: 'containers',
    explain: '"A Pod = one or more containers sharing the same network namespace (localhost) and storage volumes. Usually 1 container per Pod, but sidecar patterns (logging, proxy) add more. Think of it as \'one instance of your application.\'"'
  },
];


// ============================================================
// ENGINE — STATE & NAVIGATION
// ============================================================
const STORAGE_KEY = 'javaInterviewPrep_v1';
let state = { currentTopic: null, currentLevel: 0, completed: {}, combo: 0, attempts: 0, correct: 0 };
let selectedAnswer = null;
let orderState = [];

function loadState() {
  try { const d = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (d) state = { ...state, ...d }; } catch {}
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

// ============================================================
// SIDEBAR NAVIGATION
// ============================================================
function buildSidebar() {
  [1, 2, 3].forEach(p => {
    const group = document.getElementById(`group-p${p}`);
    const items = topics.filter(t => t.priority === p).map(t => {
      const total = getTopicTotal(t.id);
      const done = (state.completed[t.id] || []).length;
      const pct = total ? Math.round(done / total * 100) : 0;
      let subtopicHtml = '';
      if (t.subtopics) {
        subtopicHtml = `<div class="sidebar__subtopics" data-parent="${t.id}">` +
          t.subtopics.map(s => `<div class="sidebar__subtopic" data-subtopic="${s.id}" data-topic="${t.id}">${s.label}</div>`).join('') +
          '</div>';
      }
      return `<div class="sidebar__item${t.subtopics ? ' sidebar__item--expandable' : ''}" data-topic="${t.id}">
        <span class="sidebar__item-icon">${t.icon}</span>
        <div class="sidebar__item-info">
          <span class="sidebar__item-name">${t.name}</span>
          <span class="sidebar__item-count">${done}/${total}</span>
          <div class="sidebar__item-bar"><div class="sidebar__item-bar-fill" style="width:${pct}%"></div></div>
        </div>
      </div>${subtopicHtml}`;
    }).join('');
    group.insertAdjacentHTML('beforeend', items);
  });

  document.querySelectorAll('.sidebar__item').forEach(el => {
    el.addEventListener('click', () => {
      const topicId = el.dataset.topic;
      // Toggle subtopics visibility
      const subtopics = document.querySelector(`.sidebar__subtopics[data-parent="${topicId}"]`);
      if (subtopics) {
        const isOpen = subtopics.classList.contains('sidebar__subtopics--open');
        // Close all other subtopic panels
        document.querySelectorAll('.sidebar__subtopics--open').forEach(s => s.classList.remove('sidebar__subtopics--open'));
        if (!isOpen) subtopics.classList.add('sidebar__subtopics--open');
      }
      // Clear active subtopic highlight
      document.querySelectorAll('.sidebar__subtopic').forEach(s => s.classList.remove('sidebar__subtopic--active'));
      startTopic(topicId, null);
    });
  });

  document.querySelectorAll('.sidebar__subtopic').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const topicId = el.dataset.topic;
      const subtopicId = el.dataset.subtopic;
      // Highlight active subtopic
      document.querySelectorAll('.sidebar__subtopic').forEach(s => s.classList.remove('sidebar__subtopic--active'));
      el.classList.add('sidebar__subtopic--active');
      state.activeSubtopic = subtopicId;
      startTopic(topicId, subtopicId);
    });
  });
}

function updateSidebarActive(topicId) {
  document.querySelectorAll('.sidebar__item').forEach(el => {
    el.classList.toggle('sidebar__item--active', el.dataset.topic === topicId);
  });
}

function getTopicTotal(topicId) {
  const topic = topics.find(t => t.id === topicId);
  if (topic && topic.mode === 'interview') {
    return getAllInterviewItems(topicId).length;
  }
  return (levelsByTopic[topicId] || []).length;
}

function getAllInterviewItems(topicId) {
  const map = {
    'rewe': [
      typeof reweExercises !== 'undefined' ? reweExercises : [],
    ],
    'oop': [
      typeof oopQuestions !== 'undefined' ? oopQuestions : [],
      typeof oopExercises !== 'undefined' ? oopExercises : [],
      typeof encapsulationExercises !== 'undefined' ? encapsulationExercises : [],
      typeof abstractionExercises !== 'undefined' ? abstractionExercises : [],
      typeof inheritanceExercises !== 'undefined' ? inheritanceExercises : [],
      typeof polymorphismExercises !== 'undefined' ? polymorphismExercises : [],
      typeof compositionExercises !== 'undefined' ? compositionExercises : [],
      typeof solidExercises !== 'undefined' ? solidExercises : [],
    ],
    'collections': [
      typeof javaCoreExercises1 !== 'undefined' ? javaCoreExercises1 : [],
      typeof javaCoreExercises2 !== 'undefined' ? javaCoreExercises2 : [],
      typeof javaCoreExercises3 !== 'undefined' ? javaCoreExercises3 : [],
    ],
    'spring': [
      typeof springBootExercises1 !== 'undefined' ? springBootExercises1 : [],
      typeof springBootExercises2 !== 'undefined' ? springBootExercises2 : [],
    ],
    'kafka': [
      typeof kafkaExercises1 !== 'undefined' ? kafkaExercises1 : [],
      typeof kafkaExercises2 !== 'undefined' ? kafkaExercises2 : [],
    ],
    'behavioral': [
      typeof behavioralExercises1 !== 'undefined' ? behavioralExercises1 : [],
      typeof behavioralExercises2 !== 'undefined' ? behavioralExercises2 : [],
    ],
    'solid': [
      typeof solidExercises !== 'undefined' ? solidExercises : [],
    ],
    'sql': [
      typeof sqlExercises1 !== 'undefined' ? sqlExercises1 : [],
    ],
    'concurrency': [
      typeof concurrencyExercises !== 'undefined' ? concurrencyExercises : [],
    ],
    'rest': [
      typeof restExercises !== 'undefined' ? restExercises : [],
    ],
    'jpa': [
      typeof jpaExercises !== 'undefined' ? jpaExercises : [],
    ],
    'system-design': [
      typeof systemDesignExercises1 !== 'undefined' ? systemDesignExercises1 : [],
    ],
    'patterns': [
      typeof designPatternsExercises !== 'undefined' ? designPatternsExercises : [],
    ],
  };

  const arrays = map[topicId] || [];
  const items = [];
  arrays.forEach(arr => arr.forEach(item => items.push(item)));
  return items;
}

function showWelcome() {
  document.getElementById('welcome').hidden = false;
  document.getElementById('stage').hidden = true;
  document.getElementById('content-footer').hidden = true;
  document.getElementById('tabs').hidden = true;
  document.getElementById('theory-area').hidden = true;
  document.getElementById('topic-label').textContent = '';
  updateSidebarActive('');

  const total = topics.reduce((sum, t) => sum + getTopicTotal(t.id), 0);
  const done = Object.values(state.completed).reduce((sum, arr) => sum + arr.length, 0);
  document.getElementById('welcome-stats').innerHTML = `
    <div class="welcome__stat"><div class="welcome__stat-num">${total}</div><div class="welcome__stat-label">Exercises</div></div>
    <div class="welcome__stat"><div class="welcome__stat-num">${done}</div><div class="welcome__stat-label">Completed</div></div>
    <div class="welcome__stat"><div class="welcome__stat-num">${topics.length}</div><div class="welcome__stat-label">Topics</div></div>
  `;
}

function startTopic(topicId, subtopicId) {
  const topic = topics.find(t => t.id === topicId);
  updateSidebarActive(topicId);
  state.activeSubtopic = subtopicId || null;

  // Interview mode — OOP module
  if (topic && topic.mode === 'interview') {
    startInterviewModule(topicId, subtopicId);
    return;
  }

  const levels = levelsByTopic[topicId];
  if (!levels || !levels.length) return;
  state.currentTopic = topicId;
  state.currentLevel = 0;
  saveState();

  document.getElementById('welcome').hidden = true;
  document.getElementById('stage').hidden = false;
  document.getElementById('content-footer').hidden = false;
  document.getElementById('btn-serve').hidden = false;

  document.getElementById('topic-label').textContent = topic ? topic.name : '';
  loadLevel(0);
}

// ============================================================
// INTERVIEW MODULE (OOP & SOLID)
// ============================================================
let interviewItems = [];
let interviewIndex = 0;

function startInterviewModule(topicId, subtopicId) {
  interviewItems = getAllInterviewItems(topicId);

  state.currentTopic = topicId;
  interviewIndex = 0;
  saveState();

  document.getElementById('welcome').hidden = true;
  document.getElementById('stage').hidden = true;
  document.getElementById('content-footer').hidden = true;
  document.getElementById('btn-serve').hidden = true;

  const topic = topics.find(t => t.id === topicId);
  let label = topic ? topic.name : '';
  if (subtopicId && topic && topic.subtopics) {
    const sub = topic.subtopics.find(s => s.id === subtopicId);
    if (sub) label = sub.label;
  }
  document.getElementById('topic-label').textContent = label;

  // Show tabs and render theory (filtered by subtopic)
  showTabs(topicId);
  renderTheory(topicId, subtopicId);
}

function renderInterviewItem(index) {
  if (index < 0 || index >= interviewItems.length) { showWelcome(); return; }
  interviewIndex = index;

  const item = interviewItems[index];
  document.getElementById('progress-label').textContent = `${index + 1}/${interviewItems.length}`;
  document.getElementById('foot-progress').textContent = `${index + 1} / ${interviewItems.length}`;
  document.getElementById('btn-next').hidden = false;
  document.getElementById('btn-prev').hidden = index === 0;
  document.getElementById('btn-serve').hidden = true;
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';
  document.getElementById('mission').innerHTML = '';
  document.getElementById('code-area').innerHTML = '';
  document.getElementById('code-area').className = 'code-area';

  const container = document.getElementById('choices');
  container.innerHTML = '';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'stretch';
  container.style.maxWidth = '750px';

  // Route by exercise type
  const type = item.type || (item.question && item.modelAnswer ? 'ORAL_ANSWER' : null);
  if (type === 'ORAL_ANSWER') { OopUI.renderOralAnswer(item, container); }
  else if (type === 'CODE_REFACTOR') { OopUI.renderCodeRefactor(item, container); }
  else if (type === 'DESIGN_DECISION') { OopUI.renderDesignDecision(item, container); }
  else if (type === 'COMPARE_CONCEPTS') { OopUI.renderCompareConcepts(item, container); }
  else if (type === 'FOLLOW_UP') { renderFollowUp(item, container); }
  else if (type === 'REAL_EXPERIENCE') { renderRealExperience(item, container); }
  else if (type === 'FILL_BLANK' || type === 'PREDICT_OUTPUT' || type === 'PICK_INVALID' || type === 'ORDER_EXECUTION' || type === 'REMOVE_TOKEN') {
    // Legacy quiz types
    document.getElementById('btn-serve').hidden = false;
    document.getElementById('mission').innerHTML = item.mission || '';
    loadLegacyExercise(item);
  }
  else {
    // Unknown type — show as oral if it has question field
    if (item.question) { OopUI.renderOralAnswer(item, container); }
    else { container.innerHTML = `<p class="mission">Exercise type not recognized: ${esc(type || 'none')}</p>`; }
  }
}

function renderFollowUp(item, container) {
  container.innerHTML = `
    <div class="oral-question">
      <div class="oral-question__badge">${OopUI.diffBadge(item.difficulty)}</div>
      <h2 class="oral-question__text">Follow-up Drill: ${esc(item.subtopic)}</h2>
      <p class="oral-question__intent"><em>Scenario:</em> ${esc(item.scenario)}</p>
      <div class="oral-question__prompt"><p>🎙️ The interviewer keeps digging. Answer each question before revealing the hint.</p></div>
      ${item.questions.map((fq, i) => `
        <div class="followup-item">
          <p class="followup-item__q">${i + 1}. "${esc(fq.q)}"</p>
          <details><summary>Show hint</summary><p class="followup-item__hint">${esc(fq.hint)}</p></details>
        </div>
      `).join('')}
    </div>
  `;
}

function renderRealExperience(item, container) {
  container.innerHTML = `
    <div class="oral-question">
      <div class="oral-question__badge">${OopUI.diffBadge(item.difficulty)}</div>
      <h2 class="oral-question__text">Build Your Story: ${esc(item.subtopic)}</h2>
      <p class="mission">${esc(item.prompt)}</p>
      <div class="oral-question__prompt"><p>🎙️ Think of a real situation. Use the guiding questions below to structure your answer.</p></div>
      <div class="reveal-panel">
        <h3>Guiding Questions</h3>
        <ul style="padding-left:20px;font-size:0.85rem;line-height:1.8;color:var(--dim)">
          ${item.guidingQuestions.map(q => `<li>${esc(q)}</li>`).join('')}
        </ul>
      </div>
      <button class="reveal-btn" data-reveal="story">Show example story</button>
      <div id="reveal-story" hidden>
        <div class="reveal-panel" style="border-left:3px solid var(--green)">
          <p style="font-size:0.85rem;line-height:1.7;color:var(--cream)">${esc(item.exampleStory)}</p>
        </div>
        ${item.buildingBlocks ? `<p style="font-size:0.78rem;color:var(--dim);margin-top:8px"><strong>Building blocks:</strong> ${item.buildingBlocks.join(' → ')}</p>` : ''}
      </div>
    </div>
  `;
  OopUI.wireReveals(container);
}

function loadLegacyExercise(level) {
  const codeArea = document.getElementById('code-area');
  codeArea.className = 'code-area';
  const choices = document.getElementById('choices');
  choices.style.flexDirection = '';
  choices.style.alignItems = '';
  choices.style.maxWidth = '600px';

  switch (level.type) {
    case 'FILL_BLANK': renderFillBlank(level); break;
    case 'REMOVE_TOKEN': renderRemoveToken(level); break;
    case 'PICK_INVALID': renderPickInvalid(level); break;
    case 'PREDICT_OUTPUT': renderPredictOutput(level); break;
    case 'ORDER_EXECUTION': renderOrderExecution(level); break;
  }
}

// ============================================================
// QUIZ ENGINE
// ============================================================
function loadLevel(index) {
  const levels = levelsByTopic[state.currentTopic];
  if (!levels || index < 0 || index >= levels.length) return;
  state.currentLevel = index;
  selectedAnswer = null;
  orderState = [];
  saveState();

  const level = levels[index];
  document.getElementById('welcome').hidden = true;
  document.getElementById('stage').hidden = false;
  document.getElementById('content-footer').hidden = false;
  document.getElementById('btn-serve').hidden = false;
  document.getElementById('progress-label').textContent = `${index + 1}/${levels.length}`;
  document.getElementById('foot-progress').textContent = `${index + 1} / ${levels.length}`;
  document.getElementById('btn-next').hidden = true;
  document.getElementById('btn-prev').hidden = index === 0;
  document.getElementById('btn-serve').disabled = false;
  document.getElementById('foot-progress').textContent = `${index + 1} / ${levels.length}`;
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';
  document.getElementById('btn-next').hidden = true;
  document.getElementById('btn-serve').disabled = false;
  document.getElementById('mission').innerHTML = level.mission;

  const codeArea = document.getElementById('code-area');
  codeArea.className = 'code-area';
  codeArea.innerHTML = '';
  const choices = document.getElementById('choices');
  choices.innerHTML = '';
  choices.style.flexDirection = '';
  choices.style.alignItems = '';

  updateCombo();

  switch (level.type) {
    case 'FILL_BLANK': renderFillBlank(level); break;
    case 'REMOVE_TOKEN': renderRemoveToken(level); break;
    case 'PICK_INVALID': renderPickInvalid(level); break;
    case 'PREDICT_OUTPUT': renderPredictOutput(level); break;
    case 'ORDER_EXECUTION': renderOrderExecution(level); break;
  }
}

function renderFillBlank(level) {
  const codeArea = document.getElementById('code-area');
  codeArea.innerHTML = esc(level.code).replace(esc(level.blank), `<span class="blank" id="the-blank">${esc(level.blank)}</span>`);
  const choices = document.getElementById('choices');
  choices.innerHTML = level.choices.map(c => `<button class="choice" data-value="${esc(c)}">${esc(c)}</button>`).join('');
  choices.querySelectorAll('.choice').forEach(btn => {
    btn.addEventListener('click', () => {
      choices.querySelectorAll('.choice').forEach(b => b.classList.remove('choice--selected'));
      btn.classList.add('choice--selected');
      selectedAnswer = btn.dataset.value;
      const blank = document.getElementById('the-blank');
      if (blank) { blank.textContent = selectedAnswer; blank.classList.add('blank--filled'); }
    });
  });
}

function renderRemoveToken(level) {
  const codeArea = document.getElementById('code-area');
  codeArea.innerHTML = level.tokens.map((t, i) =>
    `<span class="${t.trim() ? 'token token--clickable' : 'token'}" data-index="${i}">${esc(t)}</span>`
  ).join('');
  codeArea.querySelectorAll('.token--clickable').forEach(el => {
    el.addEventListener('click', () => {
      codeArea.querySelectorAll('.token').forEach(t => t.classList.remove('token--selected'));
      el.classList.add('token--selected');
      selectedAnswer = parseInt(el.dataset.index);
    });
  });
}

function renderPickInvalid(level) {
  const choices = document.getElementById('choices');
  choices.innerHTML = level.snippets.map(s =>
    `<button class="choice" data-id="${s.id}" style="font-size:0.82rem;text-align:left;white-space:pre;padding:12px 18px">${esc(s.code)}</button>`
  ).join('');
  choices.querySelectorAll('.choice').forEach(btn => {
    btn.addEventListener('click', () => {
      choices.querySelectorAll('.choice').forEach(b => b.classList.remove('choice--selected'));
      btn.classList.add('choice--selected');
      selectedAnswer = btn.dataset.id;
    });
  });
}

function renderPredictOutput(level) {
  const codeArea = document.getElementById('code-area');
  codeArea.innerHTML = esc(level.code);
  const choices = document.getElementById('choices');
  choices.innerHTML = level.choices.map(c => `<button class="choice" data-value="${esc(c)}">${esc(c)}</button>`).join('');
  choices.querySelectorAll('.choice').forEach(btn => {
    btn.addEventListener('click', () => {
      choices.querySelectorAll('.choice').forEach(b => b.classList.remove('choice--selected'));
      btn.classList.add('choice--selected');
      selectedAnswer = btn.dataset.value;
    });
  });
}

function renderOrderExecution(level) {
  orderState = [...level.items];
  renderOrderItems();
}

function renderOrderItems() {
  const choices = document.getElementById('choices');
  choices.style.flexDirection = 'column';
  choices.style.alignItems = 'center';
  choices.innerHTML = orderState.map((item, i) =>
    `<div class="order-item" data-id="${item.id}">
      <span class="order-item__num">${i + 1}.</span>
      <span>${esc(item.label)}</span>
      <span class="order-item__arrows">
        <button data-dir="up" data-idx="${i}" ${i === 0 ? 'disabled' : ''}>▲</button>
        <button data-dir="down" data-idx="${i}" ${i === orderState.length - 1 ? 'disabled' : ''}>▼</button>
      </span>
    </div>`
  ).join('');
  choices.querySelectorAll('.order-item__arrows button').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const dir = btn.dataset.dir;
      if (dir === 'up' && idx > 0) [orderState[idx - 1], orderState[idx]] = [orderState[idx], orderState[idx - 1]];
      if (dir === 'down' && idx < orderState.length - 1) [orderState[idx], orderState[idx + 1]] = [orderState[idx + 1], orderState[idx]];
      renderOrderItems();
    });
  });
  selectedAnswer = orderState.map(i => i.id);
}

// ============================================================
// SUBMIT & FEEDBACK
// ============================================================
function submit() {
  const levels = levelsByTopic[state.currentTopic];
  if (!levels) return;
  const level = levels[state.currentLevel];
  if (selectedAnswer === null || selectedAnswer === undefined) return;

  state.attempts++;
  let correct = false;

  if (level.type === 'ORDER_EXECUTION') {
    correct = JSON.stringify(selectedAnswer) === JSON.stringify(level.answer);
  } else {
    correct = selectedAnswer === level.answer;
  }

  if (correct) handleCorrect(level);
  else handleWrong(level);
}

function handleCorrect(level) {
  state.correct++;
  state.combo++;
  if (!state.completed[state.currentTopic]) state.completed[state.currentTopic] = [];
  if (!state.completed[state.currentTopic].includes(state.currentLevel)) {
    state.completed[state.currentTopic].push(state.currentLevel);
  }
  saveState();
  updateCombo();

  const codeArea = document.getElementById('code-area');
  codeArea.classList.add('code-area--correct');
  showStamp('CORRECT ✓');

  document.querySelectorAll('.choice--selected').forEach(el => { el.classList.remove('choice--selected'); el.classList.add('choice--correct'); });
  document.querySelectorAll('.token--selected').forEach(el => { el.classList.remove('token--selected'); el.classList.add('token--correct-pick'); });

  const fb = document.getElementById('feedback');
  fb.className = 'feedback feedback--explain';
  fb.innerHTML = level.explain;

  document.getElementById('btn-serve').disabled = true;
  document.getElementById('btn-next').hidden = false;
  document.querySelectorAll('.choice:not(.choice--correct)').forEach(el => el.classList.add('choice--disabled'));
}

function handleWrong(level) {
  state.combo = 0;
  updateCombo();

  const codeArea = document.getElementById('code-area');
  codeArea.classList.add('code-area--wrong');
  setTimeout(() => codeArea.classList.remove('code-area--wrong'), 400);

  document.querySelectorAll('.choice--selected').forEach(el => {
    el.classList.add('choice--wrong');
    setTimeout(() => el.classList.remove('choice--wrong', 'choice--selected'), 500);
  });

  const fb = document.getElementById('feedback');
  fb.className = 'feedback feedback--error';
  fb.textContent = 'Not quite — try again!';
  setTimeout(() => { fb.textContent = ''; fb.className = 'feedback'; }, 2000);
  selectedAnswer = null;
}

function showStamp(text) {
  const codeArea = document.getElementById('code-area');
  let stamp = codeArea.querySelector('.stamp');
  if (!stamp) { stamp = document.createElement('div'); stamp.className = 'stamp'; codeArea.appendChild(stamp); }
  stamp.textContent = text;
  stamp.className = 'stamp stamp--compiles';
  setTimeout(() => stamp.classList.add('stamp--visible'), 50);
}

function updateCombo() {
  const el = document.getElementById('combo-label');
  if (state.combo > 1) { el.textContent = `Combo x${state.combo}`; el.classList.add('bar__combo--visible'); }
  else { el.classList.remove('bar__combo--visible'); }
}

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// ============================================================
// TABS — LEARN / PRACTICE
// ============================================================
let currentTab = 'learn';

function showTabs(topicId) {
  const tabs = document.getElementById('tabs');
  tabs.hidden = false;
  // Always default to learn tab (theory) — practice available via tab click
  switchTab('learn');
}

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-learn').classList.toggle('tab--active', tab === 'learn');
  document.getElementById('tab-practice').classList.toggle('tab--active', tab === 'practice');
  document.getElementById('theory-area').hidden = tab !== 'learn';

  const stage = document.getElementById('stage');
  const footer = document.getElementById('content-footer');
  if (tab === 'practice') {
    stage.hidden = false;
    footer.hidden = false;
  } else {
    stage.hidden = true;
    footer.hidden = true;
  }
}

function renderTheory(topicId, subtopicId) {
  const area = document.getElementById('theory-area');

  // Merge all theory sources for this topic
  let chapters = [];

  // theoryRewe: linked to 'rewe' topic
  if (typeof theoryRewe !== 'undefined' && topicId === 'rewe') {
    chapters = chapters.concat(theoryRewe);
  }

  // theoryRewe portfolio chapter: linked to 'portfolio' topic
  if (typeof theoryPortfolio !== 'undefined' && topicId === 'portfolio') {
    chapters = chapters.concat(theoryPortfolio);
  }

  // theoryContent: collections and oop
  if (typeof theoryContent !== 'undefined' && theoryContent[topicId]) {
    chapters = chapters.concat(theoryContent[topicId]);
  }

  // theoryJavaBasics: linked to 'collections' topic (Java Core)
  if (typeof theoryJavaBasics !== 'undefined' && topicId === 'collections') {
    chapters = chapters.concat(theoryJavaBasics);
  }

  // theoryJavaModern: linked to 'collections' topic (Java 17+ features)
  if (typeof theoryJavaModern !== 'undefined' && topicId === 'collections') {
    chapters = chapters.concat(theoryJavaModern);
  }

  // theorySpringBoot: linked to 'spring' topic
  if (typeof theorySpringBoot !== 'undefined' && topicId === 'spring') {
    chapters = chapters.concat(theorySpringBoot);
  }

  // theoryKafka: linked to 'kafka' topic
  if (typeof theoryKafka !== 'undefined' && topicId === 'kafka') {
    chapters = chapters.concat(theoryKafka);
  }

  // theoryRest: linked to 'rest' topic
  if (typeof theoryRest !== 'undefined' && topicId === 'rest') {
    chapters = chapters.concat(theoryRest);
  }

  // theorySql: linked to 'sql' topic
  if (typeof theorySql !== 'undefined' && topicId === 'sql') {
    chapters = chapters.concat(theorySql);
  }

  // theorySolid: linked to 'solid' topic
  if (typeof theorySolid !== 'undefined' && topicId === 'solid') {
    chapters = chapters.concat(theorySolid);
  }

  // theoryConcurrency: linked to 'concurrency' topic
  if (typeof theoryConcurrency !== 'undefined' && topicId === 'concurrency') {
    chapters = chapters.concat(theoryConcurrency);
  }

  // theoryJpa: linked to 'jpa' topic
  if (typeof theoryJpa !== 'undefined' && topicId === 'jpa') {
    chapters = chapters.concat(theoryJpa);
  }

  // theoryDesignPatterns: linked to 'patterns' topic
  if (typeof theoryDesignPatterns !== 'undefined' && topicId === 'patterns') {
    chapters = chapters.concat(theoryDesignPatterns);
  }

  // theoryDockerK8s: linked to 'docker' and 'k8s' topics
  if (typeof theoryDockerK8s !== 'undefined' && (topicId === 'docker' || topicId === 'k8s')) {
    const dockerChapters = topicId === 'docker'
      ? theoryDockerK8s.filter(ch => ch.id.includes('docker'))
      : theoryDockerK8s.filter(ch => ch.id.includes('k8s'));
    chapters = chapters.concat(dockerChapters);
  }

  // theoryTesting: linked to 'testing' topic
  if (typeof theoryTesting !== 'undefined' && topicId === 'testing') {
    chapters = chapters.concat(theoryTesting);
  }

  // theoryKotlin: linked to 'kotlin' topic
  if (typeof theoryKotlin !== 'undefined' && topicId === 'kotlin') {
    chapters = chapters.concat(theoryKotlin);
  }

  // theoryAngular: linked to 'angular' topic
  if (typeof theoryAngular !== 'undefined' && topicId === 'angular') {
    chapters = chapters.concat(theoryAngular);
  }

  // Filter by subtopic if specified
  if (subtopicId) {
    const subtopicMap = {
      // REWE
      'rewe-job': ['theory-rewe-job'],
      'rewe-trab': ['theory-rewe-trab'],
      'rewe-problem': ['theory-rewe-problem'],
      'rewe-neo': ['theory-rewe-neo'],
      'rewe-connection': ['theory-rewe-connection'],
      'rewe-questions': ['theory-rewe-questions'],
      // Portfolio
      'port-overview': ['theory-port-overview'],
      'port-match': ['theory-port-backend', 'theory-port-infra'],
      'port-arch': ['theory-port-backend', 'theory-port-quality'],
      'port-pitch': ['theory-port-pitch'],
      'port-parallels': ['theory-port-parallels'],
      // Java Core (OCA)
      'java-basics': ['theory-java-basics'],
      'java-types': ['theory-data-types'],
      'java-operators': ['theory-operators'],
      'java-arrays': ['theory-arrays'],
      'java-loops': ['theory-loops'],
      'java-methods': ['theory-methods'],
      'java-inheritance': ['theory-methods'], // inheritance mechanics covered in methods chapter
      'java-exceptions': ['theory-exceptions'],
      'java-api': ['theory-api-classes', 'theory-collections-overview', 'theory-collections-list', 'theory-collections-map', 'theory-collections-set', 'theory-collections-streams'],
      'java-modern': ['theory-java17-records', 'theory-java17-sealed', 'theory-java17-pattern'],
      // OOP
      'oop-encapsulation': ['theory-oop-overview', 'theory-oop-encapsulation'],
      'oop-abstraction': ['theory-oop-abstraction'],
      'oop-inheritance': ['theory-oop-inheritance'],
      'oop-polymorphism': ['theory-oop-polymorphism'],
      'oop-composition': ['theory-oop-composition'],
      // SOLID
      'solid-srp': ['theory-solid-srp'],
      'solid-ocp': ['theory-solid-ocp'],
      'solid-lsp': ['theory-solid-lsp'],
      'solid-isp': ['theory-solid-isp'],
      'solid-dip': ['theory-solid-dip'],
      // SQL
      'sql-joins': ['theory-sql-joins'],
      'sql-indexes': ['theory-sql-indexes'],
      'sql-transactions': ['theory-sql-transactions'],
      'sql-performance': ['theory-sql-performance'],
      // Spring Boot
      'spring-di': ['theory-spring-overview', 'theory-spring-di'],
      'spring-data': ['theory-spring-data'],
      'spring-rest': ['theory-spring-rest'],
      'spring-config': ['theory-spring-config'],
      'spring-testing': ['theory-spring-testing'],
      'spring-actuator': ['theory-spring-actuator'],
      // REST
      'rest-verbs': ['theory-rest-fundamentals'],
      'rest-design': ['theory-rest-design'],
      'rest-versioning': ['theory-rest-interview'],
      // Kafka
      'kafka-overview': ['theory-kafka-overview', 'theory-kafka-comparison'],
      'kafka-architecture': ['theory-kafka-architecture', 'theory-kafka-exclusive'],
      'kafka-consumers': ['theory-kafka-consumers'],
      'kafka-delivery': ['theory-kafka-delivery'],
      'kafka-producer': ['theory-kafka-producer', 'theory-kafka-interview'],
      // Concurrency
      'conc-threads': ['theory-conc-threads'],
      'conc-completable': ['theory-conc-completable'],
      'conc-safety': ['theory-conc-safety'],
      // JPA
      'jpa-basics': ['theory-jpa-basics'],
      'jpa-relations': ['theory-jpa-relations'],
      'jpa-queries': ['theory-jpa-queries'],
      // Design Patterns
      'pat-strategy': ['theory-patterns-strategy'],
      'pat-factory': ['theory-patterns-factory'],
      'pat-observer': ['theory-patterns-observer'],
      'pat-builder': ['theory-patterns-builder'],
      // Docker
      'docker-basics': ['theory-docker-basics'],
      'docker-compose': ['theory-docker-basics'],
      // Kubernetes
      'k8s-pods': ['theory-k8s-pods'],
      'k8s-services': ['theory-k8s-services'],
      // Testing
      'test-pyramid': ['theory-testing-pyramid'],
      'test-junit': ['theory-testing-junit'],
      'test-integration': ['theory-testing-integration'],
      // Kotlin
      'kotlin-basics': ['theory-kotlin-basics'],
      'kotlin-null': ['theory-kotlin-null'],
      'kotlin-classes': ['theory-kotlin-classes'],
      // Angular
      'ng-basics': ['theory-angular-basics'],
      'ng-services': ['theory-angular-services'],
      'ng-routing': ['theory-angular-routing'],
    };
    const allowedIds = subtopicMap[subtopicId] || [];
    if (allowedIds.length) {
      chapters = chapters.filter(ch => allowedIds.includes(ch.id));
    }
  }

  if (!chapters.length) {
    area.innerHTML = '<p class="mission" style="color:var(--dim)">📖 Theory content coming soon for this topic. Switch to Practice to start exercising.</p>';
    return;
  }

  area.innerHTML = chapters.map(ch => `
    <div class="theory-chapter">
      <div class="theory-chapter__title" onclick="this.parentElement.classList.toggle('theory-chapter--collapsed')">
        ${ch.title}
      </div>
      <div class="theory-chapter__body">
        ${ch.sections.map(s => `
          <div class="theory-section">
            <h4>${s.heading}</h4>
            <div>${s.content}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // Apply syntax highlighting to code blocks
  if (typeof highlightTheoryCode === 'function') highlightTheoryCode();
}

// ============================================================
// EVENTS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  buildSidebar();
  showWelcome();

  document.getElementById('btn-serve').addEventListener('click', submit);
  document.getElementById('btn-next').addEventListener('click', () => {
    const topic = topics.find(t => t.id === state.currentTopic);
    if (topic && topic.mode === 'interview') {
      if (interviewIndex < interviewItems.length - 1) renderInterviewItem(interviewIndex + 1);
      else showWelcome();
      return;
    }
    const levels = levelsByTopic[state.currentTopic];
    if (levels && state.currentLevel < levels.length - 1) loadLevel(state.currentLevel + 1);
    else showWelcome();
  });
  document.getElementById('btn-prev').addEventListener('click', () => {
    const topic = topics.find(t => t.id === state.currentTopic);
    if (topic && topic.mode === 'interview' && interviewIndex > 0) {
      renderInterviewItem(interviewIndex - 1);
    } else if (state.currentLevel > 0) {
      loadLevel(state.currentLevel - 1);
    }
  });

  // Tab switching
  document.getElementById('tab-learn').addEventListener('click', () => switchTab('learn'));
  document.getElementById('tab-practice').addEventListener('click', () => {
    switchTab('practice');
    if (interviewItems && interviewItems.length) {
      renderInterviewItem(interviewIndex);
    } else {
      document.getElementById('mission').innerHTML = '';
      document.getElementById('code-area').innerHTML = '';
      document.getElementById('choices').innerHTML = '<p class="mission" style="color:var(--dim)">🎯 Practice exercises coming soon for this topic.</p>';
    }
  });

  document.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.key === 'Enter') submit();
  });
});
