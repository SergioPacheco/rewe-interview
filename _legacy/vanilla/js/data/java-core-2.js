/**
 * Java Core Module — Part 2 (25 exercises)
 * OCA Fundamentals: Data Types, Operators, Arrays, Loops, Exceptions, Strings, Date/Time
 * Rebuilding fluency with interview-relevant syntax
 */
const javaCoreExercises2 = [

  // ===== DATA TYPES & VARIABLES (5) =====

  {
    id: 'core-types-01',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Primitives vs References',
    difficulty: 'BASIC',
    mission: 'What prints? Think about <strong>primitive vs reference</strong> behavior.',
    code: `int a = 10;
int b = a;
b = 20;
System.out.println(a);`,
    choices: ['10', '20', '0', 'Compile Error'],
    answer: '10',
    explain: 'Primitives are copied by VALUE. Changing b does not affect a — they are independent copies. References (objects) share the same heap object, so changes through one reference ARE visible to the other.'
  },
  {
    id: 'core-types-02',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Primitives vs References',
    difficulty: 'BASIC',
    mission: 'What prints? Now with <strong>object references</strong>.',
    code: `int[] arr1 = {1, 2, 3};
int[] arr2 = arr1;
arr2[0] = 99;
System.out.println(arr1[0]);`,
    choices: ['1', '99', '0', 'ArrayIndexOutOfBoundsException'],
    answer: '99',
    explain: 'arr2 = arr1 copies the REFERENCE, not the array. Both point to the same array on the heap. Modifying through arr2 is visible through arr1. To get an independent copy: arr2 = arr1.clone() or Arrays.copyOf(arr1, arr1.length).'
  },
  {
    id: 'core-types-03',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Casting',
    difficulty: 'BASIC',
    mission: 'Does this <strong>compile</strong>? Think about narrowing conversion.',
    code: `int x = 128;
byte b = x;
System.out.println(b);`,
    choices: ['-128', '128', 'Compile Error', '0'],
    answer: 'Compile Error',
    explain: 'int → byte is a NARROWING conversion — possible data loss. Requires explicit cast: byte b = (byte) x; Without the cast, the compiler rejects it. With cast: 128 overflows byte (max 127) → wraps to -128.'
  },
  {
    id: 'core-types-04',
    type: 'FILL_BLANK',
    subtopic: 'Wrapper Classes',
    difficulty: 'BASIC',
    mission: 'Convert a String to an int using the <strong>wrapper class</strong>.',
    code: 'String input = "42";\nint value = _____.parseInt(input);',
    blank: '_____',
    choices: ['Integer', 'Int', 'Number', 'String'],
    answer: 'Integer',
    explain: 'Integer.parseInt(String) converts text to primitive int. Integer.valueOf(String) returns Integer object (autoboxed). Wrapper classes: Integer, Double, Boolean, Long, etc. Used for: parsing, collections (List<Integer>), null representation.'
  },
  {
    id: 'core-types-05',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Variable Scope',
    difficulty: 'INTERMEDIATE',
    mission: 'Does this compile? Think about <strong>variable scope</strong>.',
    code: `public void process() {
    if (true) {
        int count = 5;
    }
    System.out.println(count);
}`,
    choices: ['5', '0', 'Compile Error: count not found', 'null'],
    answer: 'Compile Error: count not found',
    explain: 'count is declared inside the if block — its scope ends with the closing brace. Outside the block, it does not exist. Fix: declare count before the if block. Variable scope = from declaration to the end of the enclosing block {}.'
  },

  // ===== OPERATORS & DECISIONS (4) =====

  {
    id: 'core-ops-01',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Equality',
    difficulty: 'INTERMEDIATE',
    mission: 'What prints? <strong>== vs equals()</strong> for Strings.',
    code: `String a = new String("Java");
String b = new String("Java");
System.out.println(a == b);
System.out.println(a.equals(b));`,
    choices: ['true true', 'false true', 'true false', 'false false'],
    answer: 'false true',
    explain: '== compares REFERENCES (are they the same object?). equals() compares CONTENT. new String() creates distinct objects on the heap, so == is false. But their content is the same, so equals() is true. Rule: always use equals() for String comparison.'
  },
  {
    id: 'core-ops-02',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Switch',
    difficulty: 'BASIC',
    mission: 'What prints? Watch for <strong>fall-through</strong>.',
    code: `String status = "DISPATCHED";
switch (status) {
    case "PLANNED": System.out.print("P"); break;
    case "DISPATCHED": System.out.print("D");
    case "DELIVERED": System.out.print("V"); break;
    case "CANCELLED": System.out.print("C");
}`,
    choices: ['D', 'DV', 'DVC', 'P'],
    answer: 'DV',
    explain: 'Matches "DISPATCHED", prints "D". NO break → falls through to "DELIVERED", prints "V". Then break stops. Fall-through is a common interview trap. Without break, execution continues into the next case regardless of match.'
  },
  {
    id: 'core-ops-03',
    type: 'FILL_BLANK',
    subtopic: 'Ternary',
    difficulty: 'BASIC',
    mission: 'Rewrite this if/else as a <strong>ternary expression</strong>.',
    code: 'String label = distance > 100 _____ "Long haul" : "Short trip";',
    blank: '_____',
    choices: ['?', '??', ':', '&&'],
    answer: '?',
    explain: 'Ternary: condition ? valueIfTrue : valueIfFalse. Compact alternative to if/else for simple value assignment. Avoid nesting ternaries — they become unreadable. Use for simple one-line decisions.'
  },
  {
    id: 'core-ops-04',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Short-circuit',
    difficulty: 'INTERMEDIATE',
    mission: 'Does <strong>checkDb()</strong> execute? Think about short-circuit evaluation.',
    code: `boolean valid = false;
// checkDb() makes a database call
if (valid && checkDb()) {
    System.out.println("OK");
}
// Does checkDb() get called?`,
    choices: ['Yes, checkDb() runs', 'No, short-circuit skips it', 'Compile Error', 'NullPointerException'],
    answer: 'No, short-circuit skips it',
    explain: '&& is short-circuit: if left side is false, right side is NEVER evaluated. Useful for null checks: if (obj != null && obj.isValid()). The & operator (single) evaluates BOTH sides always. Use && for logic, & only for bitwise.'
  },

  // ===== ARRAYS (3) =====

  {
    id: 'core-arrays-01',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Arrays',
    difficulty: 'BASIC',
    mission: 'What prints? Think about <strong>array bounds</strong>.',
    code: `int[] stops = {10, 20, 30, 40, 50};
System.out.println(stops[stops.length]);`,
    choices: ['50', '0', 'ArrayIndexOutOfBoundsException', 'Compile Error'],
    answer: 'ArrayIndexOutOfBoundsException',
    explain: 'Array indices go from 0 to length-1. stops.length = 5, but index 5 does not exist (last valid is 4). This is a RUNTIME exception — compiles fine but crashes. Fix: stops[stops.length - 1] for last element.'
  },
  {
    id: 'core-arrays-02',
    type: 'FILL_BLANK',
    subtopic: 'Arrays',
    difficulty: 'BASIC',
    mission: 'Declare and initialize an array of <strong>delivery distances</strong>.',
    code: '_____ distances = {12, 8, 25, 30, 15};',
    blank: '_____',
    choices: ['int[]', 'int()', 'Array<int>', 'Integer[]'],
    answer: 'int[]',
    explain: 'int[] is the Java array declaration. Array initializer {} assigns values immediately. Arrays are fixed-size, zero-indexed. For dynamic size, use ArrayList. int[] for primitives, Integer[] for nullable/collections.'
  },
  {
    id: 'core-arrays-03',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Enhanced for',
    difficulty: 'BASIC',
    mission: 'What is the <strong>total</strong>?',
    code: `int[] weights = {5, 10, 15, 20};
int total = 0;
for (int w : weights) {
    total += w;
}
System.out.println(total);`,
    choices: ['50', '20', '4', '0'],
    answer: '50',
    explain: 'Enhanced for (for-each) iterates every element. 5+10+15+20 = 50. Use for-each when you need every element and do not need the index. Use traditional for when you need the index or want to skip/modify elements.'
  },

  // ===== LOOPS (3) =====

  {
    id: 'core-loops-01',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Loops — break',
    difficulty: 'BASIC',
    mission: 'What prints? Think about <strong>break</strong>.',
    code: `for (int i = 0; i < 10; i++) {
    if (i == 3) break;
    System.out.print(i + " ");
}`,
    choices: ['0 1 2 ', '0 1 2 3 ', '3 ', '0 1 2 3 4 5 6 7 8 9 '],
    answer: '0 1 2 ',
    explain: 'break exits the loop immediately when i==3. So it prints 0, 1, 2 then stops. continue would skip just that iteration (print 0 1 2 4 5...). break = stop the loop. continue = skip one iteration.'
  },
  {
    id: 'core-loops-02',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Loops — while',
    difficulty: 'BASIC',
    mission: 'How many times does the loop <strong>execute</strong>?',
    code: `int deliveries = 5;
while (deliveries > 0) {
    deliveries--;
}
System.out.println(deliveries);`,
    choices: ['0', '5', '-1', '1'],
    answer: '0',
    explain: 'Starts at 5, decrements each iteration: 5→4→3→2→1→0. When deliveries=0, condition (0>0) is false, loop exits. Prints 0. The loop ran 5 times. while checks BEFORE each iteration; do-while checks AFTER (always runs at least once).'
  },
  {
    id: 'core-loops-03',
    type: 'FILL_BLANK',
    subtopic: 'Loops — for-each',
    difficulty: 'BASIC',
    mission: 'Complete the enhanced for loop to process <strong>each delivery</strong>.',
    code: 'for (Delivery d _____ deliveries) {\n    process(d);\n}',
    blank: '_____',
    choices: [':', 'in', 'of', '->'],
    answer: ':',
    explain: 'Java enhanced for syntax: for (Type var : collection). The colon (:) separates the iteration variable from the iterable. Unlike JavaScript (of) or Python (in), Java uses colon. Available since Java 5 for arrays and Iterable.'
  },

  // ===== EXCEPTIONS (4) =====

  {
    id: 'core-exceptions-01',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Exceptions — try/catch/finally',
    difficulty: 'INTERMEDIATE',
    mission: 'What prints? Think about <strong>finally</strong> execution.',
    code: `try {
    System.out.print("A");
    throw new RuntimeException();
} catch (Exception e) {
    System.out.print("B");
} finally {
    System.out.print("C");
}`,
    choices: ['A', 'AB', 'ABC', 'AC'],
    answer: 'ABC',
    explain: 'finally ALWAYS executes — whether exception occurs or not, whether caught or not. Flow: print A → throw → caught by catch → print B → finally → print C. Even if catch re-throws, finally still runs.'
  },
  {
    id: 'core-exceptions-02',
    type: 'PICK_INVALID',
    subtopic: 'Exceptions — Checked vs Unchecked',
    difficulty: 'INTERMEDIATE',
    mission: 'Which exception is <strong>unchecked</strong> (does NOT require try/catch or throws)?',
    snippets: [
      { id: 'a', code: 'IOException\n// Must be caught or declared\n// Extends Exception (checked)', valid: true },
      { id: 'b', code: 'NullPointerException\n// Does NOT require try/catch\n// Extends RuntimeException', valid: false },
      { id: 'c', code: 'SQLException\n// Must be caught or declared\n// Extends Exception (checked)', valid: true }
    ],
    answer: 'b',
    explain: 'Unchecked = extends RuntimeException. Compiler does NOT force you to catch them. NullPointerException, ArrayIndexOutOfBoundsException, IllegalArgumentException, ClassCastException — all unchecked. IOException, SQLException — checked (must catch or declare throws).'
  },
  {
    id: 'core-exceptions-03',
    type: 'FILL_BLANK',
    subtopic: 'Exceptions — Custom',
    difficulty: 'INTERMEDIATE',
    mission: 'Create a <strong>custom unchecked exception</strong> for delivery not found.',
    code: 'public class DeliveryNotFoundException extends _____ {\n    public DeliveryNotFoundException(String msg) {\n        super(msg);\n    }\n}',
    blank: '_____',
    choices: ['RuntimeException', 'Exception', 'Error', 'Throwable'],
    answer: 'RuntimeException',
    explain: 'Extending RuntimeException makes it unchecked — callers are not forced to catch it. This is the modern Java convention for business exceptions. Extending Exception (checked) forces every caller to handle it — appropriate for recoverable I/O errors, not for "not found" scenarios.'
  },
  {
    id: 'core-exceptions-04',
    type: 'ORDER_EXECUTION',
    subtopic: 'Exceptions — Catch Order',
    difficulty: 'BASIC',
    mission: 'Arrange catch blocks in <strong>valid order</strong> (most specific first).',
    items: [
      { id: 'nfe', label: 'catch (NumberFormatException e)' },
      { id: 'iae', label: 'catch (IllegalArgumentException e)' },
      { id: 'rte', label: 'catch (RuntimeException e)' },
      { id: 'ex', label: 'catch (Exception e)' }
    ],
    answer: ['nfe', 'iae', 'rte', 'ex'],
    explain: 'Most specific → most general. NumberFormatException extends IllegalArgumentException extends RuntimeException extends Exception. Reversing causes "unreachable catch block" compile error. The first matching catch handles it.'
  },

  // ===== STRINGS & STRINGBUILDER (3) =====

  {
    id: 'core-strings-01',
    type: 'PREDICT_OUTPUT',
    subtopic: 'String Immutability',
    difficulty: 'BASIC',
    mission: 'What prints? Strings are <strong>immutable</strong>.',
    code: `String route = "Warehouse";
route.concat(" → Store A");
System.out.println(route);`,
    choices: ['Warehouse → Store A', 'Warehouse', 'null', 'Compile Error'],
    answer: 'Warehouse',
    explain: 'Strings are IMMUTABLE. concat() returns a NEW string — it does not modify the original. The result is discarded because it is not assigned. Fix: route = route.concat(" → Store A"); or use StringBuilder for building strings in loops.'
  },
  {
    id: 'core-strings-02',
    type: 'FILL_BLANK',
    subtopic: 'StringBuilder',
    difficulty: 'BASIC',
    mission: 'Build a route string <strong>efficiently</strong> in a loop.',
    code: '_____ sb = new StringBuilder();\nfor (String stop : stops) {\n    sb.append(stop).append(" → ");\n}\nString route = sb.toString();',
    blank: '_____',
    choices: ['StringBuilder', 'String', 'StringBuffer', 'CharSequence'],
    answer: 'StringBuilder',
    explain: 'StringBuilder is mutable — append() modifies in place without creating new objects. In a loop, String concatenation creates N new String objects (O(n²) total characters copied). StringBuilder is O(n). StringBuffer is the same but synchronized (thread-safe, rarely needed).'
  },
  {
    id: 'core-strings-03',
    type: 'PREDICT_OUTPUT',
    subtopic: 'String Pool',
    difficulty: 'INTERMEDIATE',
    mission: 'What prints? Think about the <strong>String pool</strong>.',
    code: `String a = "REWE";
String b = "REWE";
String c = new String("REWE");
System.out.println(a == b);
System.out.println(a == c);`,
    choices: ['true true', 'true false', 'false false', 'false true'],
    answer: 'true false',
    explain: 'String literals are INTERNED (String pool) — same content = same object. a==b is true (same pool reference). new String() creates a NEW object on the heap, bypassing the pool. a==c is false (different objects). Always use .equals() for content comparison.'
  },

  // ===== DATE/TIME & LAMBDA (3) =====

  {
    id: 'core-datetime-01',
    type: 'FILL_BLANK',
    subtopic: 'LocalDateTime',
    difficulty: 'BASIC',
    mission: 'Get the <strong>current date and time</strong> for a delivery timestamp.',
    code: 'LocalDateTime deliveryTime = LocalDateTime._____();',
    blank: '_____',
    choices: ['now', 'current', 'today', 'new'],
    answer: 'now',
    explain: 'LocalDateTime.now() returns current date+time. LocalDate.now() for date only. LocalTime.now() for time only. These are immutable — operations like plusDays(1) return NEW instances. Part of java.time package (Java 8+), replacing the problematic Date/Calendar.'
  },
  {
    id: 'core-datetime-02',
    type: 'PREDICT_OUTPUT',
    subtopic: 'LocalDate Immutability',
    difficulty: 'INTERMEDIATE',
    mission: 'What is the <strong>delivery date</strong> after this code?',
    code: `LocalDate delivery = LocalDate.of(2026, 7, 19);
delivery.plusDays(3);
System.out.println(delivery);`,
    choices: ['2026-07-22', '2026-07-19', 'null', 'Exception'],
    answer: '2026-07-19',
    explain: 'LocalDate is IMMUTABLE — plusDays() returns a NEW object, it does NOT modify the original. The result is discarded. Fix: delivery = delivery.plusDays(3); Same pattern as String — all java.time classes are immutable.'
  },
  {
    id: 'core-lambda-01',
    type: 'FILL_BLANK',
    subtopic: 'Lambda & Predicate',
    difficulty: 'INTERMEDIATE',
    mission: 'Complete the lambda that filters <strong>late deliveries</strong>.',
    code: 'Predicate<Delivery> isLate = d _____ d.getActualTime().isAfter(d.getExpectedTime());',
    blank: '_____',
    choices: ['->', '=>', '::', '?'],
    answer: '->',
    explain: 'Java lambda syntax: (params) -> expression. Arrow operator (->) separates parameters from body. Single parameter can omit parentheses. :: is method reference (different). => does not exist in Java (that is JavaScript/C#).'
  }
];
