/**
 * Java Core Module — Part 1 (20 exercises)
 * Rebuilding Fluency: Collections, Streams, Optional, Generics
 * Focus: WRITE code from memory, not just read
 */
const javaCoreExercises1 = [

  // ===== COLLECTIONS (8 exercises) =====

  // 1. PREDICT_OUTPUT — ArrayList behavior
  {
    id: 'core-collections-01',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Collections — List',
    difficulty: 'BASIC',
    mission: 'What does this print? Think about <strong>ArrayList insertion order</strong>.',
    code: `List<String> stops = new ArrayList<>();
stops.add("Warehouse");
stops.add("Store A");
stops.add("Store B");
stops.add(1, "Priority Store");
System.out.println(stops);`,
    choices: ['[Warehouse, Store A, Store B, Priority Store]', '[Warehouse, Priority Store, Store A, Store B]', '[Priority Store, Warehouse, Store A, Store B]', 'IndexOutOfBoundsException'],
    answer: '[Warehouse, Priority Store, Store A, Store B]',
    explain: 'add(index, element) inserts at that position, shifting elements right. "Priority Store" goes at index 1, pushing "Store A" and "Store B" to indices 2 and 3. ArrayList maintains insertion order and allows positional access.'
  },

  // 2. FILL_BLANK — HashMap usage
  {
    id: 'core-collections-02',
    type: 'FILL_BLANK',
    subtopic: 'Collections — Map',
    difficulty: 'BASIC',
    mission: 'Complete the code to <strong>count deliveries per driver</strong>.',
    code: 'Map<String, Integer> counts = new HashMap<>();\nfor (Delivery d : deliveries) {\n    counts._____(d.getDriverName(), counts.getOrDefault(d.getDriverName(), 0) + 1);\n}',
    blank: '_____',
    choices: ['put', 'add', 'set', 'insert'],
    answer: 'put',
    explain: 'HashMap.put(key, value) inserts or replaces. Combined with getOrDefault(), this is the idiomatic way to count occurrences. In Java 8+, you can also use merge(): counts.merge(driver, 1, Integer::sum).'
  },

  // 3. PICK_INVALID — When to use which collection
  {
    id: 'core-collections-03',
    type: 'PICK_INVALID',
    subtopic: 'Collections — Choosing',
    difficulty: 'INTERMEDIATE',
    mission: 'Which collection choice is <strong>wrong</strong> for the use case?',
    snippets: [
      { id: 'a', code: '// Need fast lookup by delivery ID\nMap<Long, Delivery> cache = new HashMap<>();\n// O(1) get by key ✓', valid: true },
      { id: 'b', code: '// Need unique warehouse codes, no duplicates\nSet<String> codes = new HashSet<>();\n// add() ignores duplicates ✓', valid: true },
      { id: 'c', code: '// Need deliveries sorted by time\n// and fast random access by index\nTreeSet<Delivery> timeline = new TreeSet<>();\n// timeline.get(5) — access by index', valid: false }
    ],
    answer: 'c',
    explain: 'TreeSet maintains sorted order but does NOT support index-based access (.get(5) does not exist). For sorted + index access, use a sorted ArrayList or TreeMap with positional queries. TreeSet is for sorted uniqueness with iterator traversal.'
  },

  // 4. PREDICT_OUTPUT — HashMap key behavior
  {
    id: 'core-collections-04',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Collections — HashMap',
    difficulty: 'INTERMEDIATE',
    mission: 'What is the map size? Think about <strong>equals/hashCode</strong>.',
    code: `Map<String, String> routes = new HashMap<>();
routes.put("ROUTE-A", "Warehouse → Store 1");
routes.put("ROUTE-B", "Warehouse → Store 2");
routes.put("ROUTE-A", "Warehouse → Store 3");
System.out.println(routes.size());`,
    choices: ['3', '2', '1', 'Exception'],
    answer: '2',
    explain: 'Same key ("ROUTE-A") = value is REPLACED, not added. Map size stays 2. HashMap uses hashCode() to find the bucket, then equals() to find the exact key. Same key = overwrite. This is why HashMap is O(1) for get/put — it computes an array index directly from the hash.'
  },

  // 5. ORAL_ANSWER — Why is HashMap O(1)?
  {
    id: 'core-collections-05',
    type: 'ORAL_ANSWER',
    subtopic: 'Collections — HashMap Internals',
    difficulty: 'SENIOR',
    question: 'Why is HashMap O(1) for get and put?',
    interviewerIntent: 'Test understanding of hash table internals, not just API usage.',
    shortAnswer: 'HashMap computes hashCode() of the key, uses it as an array index (bucket), and stores the entry there. Lookup is direct array access — no searching. Collisions degrade to O(n) linked list, but Java 8+ converts to O(log n) red-black tree at 8 entries per bucket.',
    modelAnswer: `How it works:
1. Call key.hashCode() → integer hash
2. Compute bucket index: hash & (array.length - 1)
3. If bucket empty → store directly (O(1))
4. If bucket occupied → collision: walk linked list, compare equals()
5. Java 8+: if chain length > 8, convert to red-black tree (O(log n))

Why O(1) on average:
- With a good hash function, entries distribute evenly across buckets
- Most buckets have 0 or 1 entry → direct access
- Load factor 0.75 triggers resize to maintain low collision rate

When it degrades:
- Bad hashCode() (all objects in same bucket) → O(n)
- Many collisions without resize → long chains
- This is why equals/hashCode contract matters so much

Real-world: In our systems, we used HashMap for caching entity lookups by ID. With Long as key (great hash distribution), it is effectively O(1) for millions of entries.`,
    senaiExample: 'SGN3 uses Maps extensively for caching — entity lookups, configuration caches, strategy pattern dispatch maps. All rely on good hashCode distribution.',
    reweExample: 'A delivery route cache: Map<RouteId, RouteDetails> with O(1) lookup when a driver requests their route. Millions of lookups per day.',
    keyPoints: ['hashCode() → array index (direct access)', 'Collisions: linked list → tree (Java 8+)', 'Load factor 0.75 → resize', 'Good hashCode = even distribution = O(1)', 'Bad hashCode = all in one bucket = O(n)'],
    mistakesToAvoid: ['Saying "it just is O(1)" without explaining', 'Not mentioning collision handling', 'Not mentioning the equals/hashCode contract'],
    followUps: [
      { question: 'What happens if you override equals but not hashCode?', answerHint: 'Two equal objects may land in different buckets. contains() and get() fail. Contract: if a.equals(b), then a.hashCode() == b.hashCode().' },
      { question: 'When would you use TreeMap instead?', answerHint: 'When you need sorted keys, range queries (subMap), or first/last. TreeMap is O(log n) but maintains order.' }
    ],
    vocabulary: [
      { term: 'hash collision', meaning: 'duas chaves diferentes caem no mesmo bucket', example: 'When two keys hash to the same bucket, Java stores both in a linked list (or tree) at that bucket.' },
      { term: 'load factor', meaning: 'proporção de ocupação que dispara resize', example: 'At 0.75 load factor, a 16-bucket HashMap resizes when it has 12 entries — doubling to 32 buckets.' }
    ],
    selfEvaluation: [
      { criterion: 'I explained the hash → bucket index mechanism', weight: 3 },
      { criterion: 'I mentioned collision handling (list → tree)', weight: 3 },
      { criterion: 'I explained when it degrades from O(1)', weight: 2 },
      { criterion: 'I mentioned the equals/hashCode contract', weight: 2 }
    ]
  },

  // 6. FILL_BLANK — Set uniqueness
  {
    id: 'core-collections-06',
    type: 'FILL_BLANK',
    subtopic: 'Collections — Set',
    difficulty: 'BASIC',
    mission: 'Ensure <strong>no duplicate warehouse codes</strong> in the collection.',
    code: '_____ <String> uniqueCodes = new HashSet<>(allCodes);\n// Duplicates automatically removed',
    blank: '_____',
    choices: ['Set', 'List', 'Queue', 'Collection'],
    answer: 'Set',
    explain: 'Set guarantees uniqueness — adding a duplicate is silently ignored. Passing a List to HashSet constructor removes all duplicates. Use Set when the business rule IS uniqueness (unique stops, unique drivers assigned).'
  },

  // 7. PREDICT_OUTPUT — List.of() immutability
  {
    id: 'core-collections-07',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Collections — Immutability',
    difficulty: 'INTERMEDIATE',
    mission: 'What happens when you try to <strong>add to an immutable list</strong>?',
    code: `List<String> stops = List.of("A", "B", "C");
stops.add("D");
System.out.println(stops);`,
    choices: ['[A, B, C, D]', 'UnsupportedOperationException', 'Compile Error', '[A, B, C]'],
    answer: 'UnsupportedOperationException',
    explain: 'List.of() (Java 9+) creates an IMMUTABLE list. Any modification throws UnsupportedOperationException at runtime. To modify, wrap it: new ArrayList<>(List.of("A", "B", "C")). Know this for interviews — Java has multiple ways to create unmodifiable collections.'
  },

  // 8. ORDER_EXECUTION — HashMap.put internals
  {
    id: 'core-collections-08',
    type: 'ORDER_EXECUTION',
    subtopic: 'Collections — HashMap',
    difficulty: 'INTERMEDIATE',
    mission: 'Arrange what happens <strong>internally</strong> when you call map.put(key, value).',
    items: [
      { id: 'hash', label: 'Compute key.hashCode()' },
      { id: 'index', label: 'Calculate bucket index (hash & (n-1))' },
      { id: 'empty', label: 'Check if bucket is empty' },
      { id: 'equals', label: 'If occupied: compare keys with equals()' },
      { id: 'store', label: 'Store new entry or replace existing value' }
    ],
    answer: ['hash', 'index', 'empty', 'equals', 'store'],
    explain: 'HashMap.put: hashCode → bucket index → if empty, insert. If occupied, walk chain comparing equals(). If key found, replace value. If not found, add to chain. Resize at load factor 0.75. This is why both hashCode AND equals must be consistent.'
  },

  // ===== STREAMS API (7 exercises) =====

  // 9. FILL_BLANK — Basic stream filter
  {
    id: 'core-streams-01',
    type: 'FILL_BLANK',
    subtopic: 'Streams — filter',
    difficulty: 'BASIC',
    mission: 'Complete the stream to get <strong>only active deliveries</strong>.',
    code: 'List<Delivery> active = deliveries.stream()\n    ._____(d -> d.getStatus() == DeliveryStatus.ACTIVE)\n    .collect(Collectors.toList());',
    blank: '_____',
    choices: ['filter', 'map', 'find', 'select'],
    answer: 'filter',
    explain: 'filter(predicate) keeps elements where the predicate returns true. map() transforms elements. filter() is the equivalent of SQL WHERE — select only rows matching a condition.'
  },

  // 10. FILL_BLANK — Stream map transformation
  {
    id: 'core-streams-02',
    type: 'FILL_BLANK',
    subtopic: 'Streams — map',
    difficulty: 'BASIC',
    mission: 'Extract <strong>only the driver names</strong> from a list of deliveries.',
    code: 'List<String> driverNames = deliveries.stream()\n    ._____(Delivery::getDriverName)\n    .collect(Collectors.toList());',
    blank: '_____',
    choices: ['map', 'filter', 'flatMap', 'forEach'],
    answer: 'map',
    explain: 'map(function) transforms each element. Delivery → String (driver name). It is like SQL SELECT column — extract/transform one field from each row. The result stream has a different type than the input.'
  },

  // 11. PREDICT_OUTPUT — Stream pipeline
  {
    id: 'core-streams-03',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Streams — Pipeline',
    difficulty: 'INTERMEDIATE',
    mission: 'What does this stream pipeline produce?',
    code: `List<Integer> distances = List.of(10, 25, 5, 50, 30, 8);
long count = distances.stream()
    .filter(d -> d > 15)
    .count();
System.out.println(count);`,
    choices: ['3', '4', '6', '0'],
    answer: '3',
    explain: 'filter(d > 15) keeps: 25, 50, 30. count() = 3. Streams are lazy — filter does not create a new list, it just filters during traversal. count() is a terminal operation that triggers processing.'
  },

  // 12. FILL_BLANK — Collectors.groupingBy
  {
    id: 'core-streams-04',
    type: 'FILL_BLANK',
    subtopic: 'Streams — Collectors',
    difficulty: 'INTERMEDIATE',
    mission: 'Group deliveries <strong>by driver</strong> into a Map.',
    code: 'Map<String, List<Delivery>> byDriver = deliveries.stream()\n    .collect(Collectors._____(Delivery::getDriverName));',
    blank: '_____',
    choices: ['groupingBy', 'partitioningBy', 'toMap', 'mapping'],
    answer: 'groupingBy',
    explain: 'groupingBy(classifier) creates a Map<Key, List<Element>>. Like SQL GROUP BY — group deliveries by driver name. partitioningBy splits into true/false only. toMap creates Map<Key, Value> (one entry per key).'
  },

  // 13. PREDICT_OUTPUT — Stream reduce
  {
    id: 'core-streams-05',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Streams — reduce',
    difficulty: 'INTERMEDIATE',
    mission: 'What is the <strong>total distance</strong>?',
    code: `List<Integer> legs = List.of(12, 8, 15, 20);
int total = legs.stream()
    .reduce(0, Integer::sum);
System.out.println(total);`,
    choices: ['55', '20', '12', '0'],
    answer: '55',
    explain: 'reduce(identity, accumulator) combines all elements. Starting from 0, it sums: 0+12=12, 12+8=20, 20+15=35, 35+20=55. This is the functional equivalent of a for loop with an accumulator. You can also use mapToInt().sum() for this case.'
  },

  // 14. PICK_INVALID — Stream anti-patterns
  {
    id: 'core-streams-06',
    type: 'PICK_INVALID',
    subtopic: 'Streams — Anti-patterns',
    difficulty: 'INTERMEDIATE',
    mission: 'Which stream usage is an <strong>anti-pattern</strong>?',
    snippets: [
      { id: 'a', code: 'deliveries.stream()\n  .filter(d -> d.isLate())\n  .map(Delivery::getId)\n  .collect(Collectors.toList());', valid: true },
      { id: 'b', code: 'deliveries.stream()\n  .forEach(d -> {\n    d.setStatus(CANCELLED);\n    repository.save(d);\n  });', valid: false },
      { id: 'c', code: 'deliveries.stream()\n  .filter(d -> d.getWeight() > 100)\n  .count();', valid: true }
    ],
    answer: 'b',
    explain: 'Using forEach with side effects (mutation + DB save) is an anti-pattern. Streams are designed for transformation pipelines, not imperative side effects. Use a for loop for mutations and DB operations. Streams should be used for filter/map/reduce/collect — pure transformations.'
  },

  // 15. FILL_BLANK — Optional usage
  {
    id: 'core-streams-07',
    type: 'FILL_BLANK',
    subtopic: 'Optional',
    difficulty: 'INTERMEDIATE',
    mission: 'Safely get the delivery or throw if <strong>not found</strong>.',
    code: 'Delivery delivery = repository.findById(id)\n    ._____(()-> new NotFoundException("Delivery not found: " + id));',
    blank: '_____',
    choices: ['orElseThrow', 'orElse', 'get', 'ifPresent'],
    answer: 'orElseThrow',
    explain: 'orElseThrow(supplier) unwraps the Optional or throws if empty. NEVER call .get() without checking — it throws NoSuchElementException. orElse(default) returns a default value. orElseThrow is the standard pattern for "find or 404".'
  },

  // ===== GENERICS & TYPE SAFETY (5 exercises) =====

  // 16. FILL_BLANK — Generic method
  {
    id: 'core-generics-01',
    type: 'FILL_BLANK',
    subtopic: 'Generics',
    difficulty: 'INTERMEDIATE',
    mission: 'Complete the generic method that finds an item <strong>by ID in any list</strong>.',
    code: 'public <T extends Identifiable> Optional<T> findById(List<_____> items, Long id) {\n    return items.stream()\n        .filter(item -> item.getId().equals(id))\n        .findFirst();\n}',
    blank: '_____',
    choices: ['T', '?', 'Object', 'Identifiable'],
    answer: 'T',
    explain: 'The type parameter T (declared as <T extends Identifiable>) is used in the parameter list. This means the method works with any List of objects that implement Identifiable — List<Delivery>, List<Driver>, List<Route>. The return type preserves the specific type.'
  },

  // 17. PREDICT_OUTPUT — Wildcard bounds
  {
    id: 'core-generics-02',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Generics',
    difficulty: 'INTERMEDIATE',
    mission: 'Does this <strong>compile</strong>? Think about generic invariance.',
    code: `List<Number> numbers = new ArrayList<Integer>();`,
    choices: ['Compiles fine', 'Compile Error: incompatible types', 'Runtime ClassCastException', 'Compiles with warning'],
    answer: 'Compile Error: incompatible types',
    explain: 'Generics are INVARIANT. List<Number> is NOT a supertype of List<Integer>, even though Number IS a supertype of Integer. Use List<? extends Number> to accept List<Integer>. This prevents you from adding a Double to a List<Integer> through the Number reference.'
  },

  // 18. FILL_BLANK — Bounded wildcard
  {
    id: 'core-generics-03',
    type: 'FILL_BLANK',
    subtopic: 'Generics — Wildcards',
    difficulty: 'INTERMEDIATE',
    mission: 'Complete so this method accepts <strong>any list of Number subtypes</strong> (Integer, Double, Long).',
    code: 'public double sumAll(List<? _____ Number> numbers) {\n    return numbers.stream()\n        .mapToDouble(Number::doubleValue)\n        .sum();\n}',
    blank: '_____',
    choices: ['extends', 'super', 'implements', '=='],
    answer: 'extends',
    explain: '? extends Number means "any type that IS-A Number" (Integer, Double, Long). You can READ from this list (get Number values) but NOT add to it (compiler does not know the actual type). PECS rule: Producer Extends, Consumer Super.'
  },

  // 19. ORAL_ANSWER — When to use generics
  {
    id: 'core-generics-04',
    type: 'ORAL_ANSWER',
    subtopic: 'Generics',
    difficulty: 'INTERMEDIATE',
    question: 'When would you write a generic class or method?',
    interviewerIntent: 'Test practical understanding of generics beyond syntax.',
    shortAnswer: 'When the logic is the same regardless of the type — repositories (GenericRepository<T>), event handlers (EventHandler<E>), response wrappers (ApiResponse<T>), utility methods (findById, filter, transform). Generics provide type safety without code duplication.',
    modelAnswer: `Context: Generics let you write logic once that works with any type, while maintaining compile-time type safety.

Common use cases:
- Repository<T>: findById, save, delete work for any entity type
- EventHandler<E>: process any event type with the same consumer pattern
- ApiResponse<T>: wrap any response payload with metadata (status, pagination)
- Pair<A, B>, Either<L, R>: utility types that hold different types

When NOT to use:
- When there is only one type ever (just use the concrete type)
- When the logic genuinely differs per type (use polymorphism instead)
- When it adds complexity without type safety benefit

My experience: In Java EE, we used generic repositories (GenericRepository<T extends SenaiEntity>) that provided CRUD operations for any entity. Spring Data does this with JpaRepository<T, ID>.`,
    senaiExample: 'GenericRepository<T extends SenaiEntity> provided findById, persist, merge for all entities. Each specific repository extended it with custom queries.',
    reweExample: 'Spring Data JpaRepository<Delivery, Long> is a generic repository. KafkaTemplate<String, LogisticsEvent> is a generic producer. Same pattern.',
    keyPoints: ['Generics = same logic, different types, type safety', 'Common: Repository<T>, Handler<E>, Response<T>', 'PECS: Producer Extends, Consumer Super', 'Do not over-generify simple cases'],
    mistakesToAvoid: ['Not giving a practical example', 'Confusing generics with polymorphism', 'Not mentioning type erasure'],
    followUps: [
      { question: 'What is type erasure?', answerHint: 'At runtime, generic types are erased — List<String> becomes List. The JVM does not know the generic type. This is why you cannot do new T() or instanceof T.' },
      { question: 'What is PECS?', answerHint: 'Producer Extends, Consumer Super. If you READ from a collection (produce items), use ? extends T. If you WRITE to it (consume items), use ? super T.' }
    ],
    vocabulary: [
      { term: 'type erasure', meaning: 'tipos genéricos são removidos em runtime — JVM não sabe o T', example: 'Due to type erasure, you cannot create new T() at runtime — the JVM does not know what T is.' },
      { term: 'PECS', meaning: 'Producer Extends, Consumer Super — regra para wildcards', example: 'A method that reads from a list uses ? extends T. A method that writes to a list uses ? super T.' }
    ],
    selfEvaluation: [
      { criterion: 'I gave practical examples of generic usage', weight: 3 },
      { criterion: 'I mentioned type safety as the main benefit', weight: 2 },
      { criterion: 'I explained when NOT to use generics', weight: 3 },
      { criterion: 'I mentioned type erasure', weight: 2 }
    ]
  },

  // 20. COMPARE_CONCEPTS — List vs Set vs Map
  {
    id: 'core-collections-compare-01',
    type: 'COMPARE_CONCEPTS',
    subtopic: 'Collections — Choosing',
    difficulty: 'BASIC',
    mission: 'Compare: <strong>List</strong> vs <strong>Set</strong> vs <strong>Map</strong> — when to use each',
    conceptA: { name: 'List', definition: 'Ordered, allows duplicates, index-based access. Use when order matters or duplicates are valid. ArrayList (fast random access) or LinkedList (fast insert/remove in middle).' },
    conceptB: { name: 'Set / Map', definition: 'Set: unique elements, no duplicates, no index. Map: key→value pairs, unique keys, O(1) lookup. Use Set for uniqueness. Use Map for associations/lookups.' },
    keyDifference: 'List = "I need ordered items (possibly with duplicates)". Set = "I need unique items". Map = "I need to look up a value by a key". Choose based on what QUESTION you ask the collection.',
    javaExample: 'Delivery stops in order: List<Stop>. Unique driver IDs assigned today: Set<String>. Cache delivery by ID: Map<Long, Delivery>.',
    interviewAnswer: 'I choose based on the access pattern: List when I need order or index access. Set when uniqueness is the constraint. Map when I need key-based lookup. In logistics, route stops are a List (ordered), assigned drivers are a Set (unique), and delivery cache is a Map (fast lookup by ID).'
  }
];
