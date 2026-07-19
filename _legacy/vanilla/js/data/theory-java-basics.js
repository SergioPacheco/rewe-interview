/**
 * Theory Content — Java Basics & OCA Foundation
 * Complete coverage of all OCA exam objectives
 */
const theoryJavaBasics = [

  // ===== JAVA BASICS =====
  {
    id: 'theory-java-basics',
    title: 'Java Basics — Structure, Main Method, Packages',
    sections: [
      {
        heading: 'Structure of a Java Class',
        content: `Every Java file follows this structure:

<pre><code>package com.rewe.logistics.delivery;  // 1. Package declaration (optional but recommended)

import java.util.List;                  // 2. Import statements
import java.time.LocalDateTime;

public class DeliveryService {          // 3. Class declaration

    private final DeliveryRepository repo;  // 4. Fields

    public DeliveryService(DeliveryRepository repo) {  // 5. Constructors
        this.repo = repo;
    }

    public Delivery findById(Long id) {  // 6. Methods
        return repo.findById(id).orElseThrow();
    }
}</code></pre>

<strong>Rules:</strong>
• One public class per file, filename must match class name (<code>DeliveryService.java</code>)
• Package declaration must be first line (if present)
• Imports come after package, before class
• A file can have multiple non-public classes (but avoid this)`
      },
      {
        heading: 'The main method — entry point',
        content: `<pre><code>public class Application {
    public static void main(String[] args) {
        System.out.println("Delivery system started");
        // args contains command-line arguments
    }
}</code></pre>

<strong>Signature must be exactly:</strong> <code>public static void main(String[] args)</code>
• <code>public</code> — JVM must access it from outside
• <code>static</code> — called without creating an instance
• <code>void</code> — returns nothing
• <code>String[] args</code> — command-line arguments (can also be <code>String... args</code>)

<strong>Running from command line:</strong>
<pre><code>javac DeliveryApp.java          # Compile
java DeliveryApp                 # Run (no .class extension)
java DeliveryApp --port 8080     # args[0]="--port", args[1]="8080"</code></pre>

<strong>Console output:</strong>
<pre><code>System.out.println("line");   // prints + newline
System.out.print("no newline");  // prints, cursor stays
System.err.println("error");  // error stream (red in IDEs)
System.out.printf("Delivery %d: %s%n", id, status);  // formatted</code></pre>`
      },
      {
        heading: 'Platform Independence',
        content: `<strong>"Write once, run anywhere"</strong>

Java achieves platform independence through:
1. <strong>Compilation to bytecode</strong> — <code>javac</code> compiles <code>.java</code> to <code>.class</code> (bytecode), not native machine code
2. <strong>JVM executes bytecode</strong> — each OS has its own JVM implementation that translates bytecode to native instructions
3. <strong>Standard library</strong> — java.io, java.net etc. abstract OS differences

<pre><code>Source (.java) → Compiler (javac) → Bytecode (.class) → JVM → Native execution
                                                          ↑
                                                   OS-specific JVM</code></pre>

<strong>Key Java features (interview comparison):</strong>
• <strong>Object-oriented</strong> — everything is inside a class (except primitives)
• <strong>Strongly typed</strong> — types checked at compile time
• <strong>Garbage collected</strong> — no manual memory management
• <strong>Platform independent</strong> — bytecode runs on any JVM
• <strong>Multi-threaded</strong> — built-in concurrency support
• <strong>Secure</strong> — no pointer arithmetic, bytecode verification`
      },
      {
        heading: 'Packages and Imports',
        content: `Packages organize classes into namespaces and control access.

<pre><code>package com.rewe.logistics.delivery;  // This class lives here

import java.util.List;                // Import specific class
import java.util.*;                   // Import all classes in package (not sub-packages)
import static java.util.Collections.emptyList;  // Import static method</code></pre>

<strong>Rules:</strong>
• <code>java.lang.*</code> is auto-imported (String, Integer, System, Math, Object)
• Import does NOT import sub-packages (<code>import java.util.*</code> does NOT include <code>java.util.stream.*</code>)
• Two classes with same name from different packages → must use fully-qualified name for one

<pre><code>// Conflict: java.util.Date and java.sql.Date
import java.util.Date;
// Must use full name for the other:
java.sql.Date sqlDate = new java.sql.Date(millis);</code></pre>

<strong>Package naming convention:</strong> reverse domain — <code>com.rewe.logistics.delivery</code>`
      },
      {
        heading: 'Variable Scope',
        content: `Scope = where a variable is accessible.

<pre><code>public class DeliveryService {
    private int totalCount;             // INSTANCE scope: lives as long as object

    private static int globalCount;     // CLASS scope: lives as long as class is loaded

    public void process(int batchSize) { // PARAMETER scope: within method
        int processed = 0;              // LOCAL scope: from declaration to end of block

        for (int i = 0; i < batchSize; i++) {  // LOOP scope: only inside for
            if (i > 10) {
                int overflow = i - 10;  // BLOCK scope: only inside this if
            }
            // overflow NOT accessible here!
        }
        // i NOT accessible here!
    }
    // processed NOT accessible here!
}</code></pre>

<strong>Key rules:</strong>
• Local variables MUST be initialized before use (no default value)
• Instance fields have defaults: 0, 0.0, false, null
• Narrower scope = better (declare variables as close to use as possible)
• Cannot redeclare a variable in the same scope`
      }
    ]
  },

  // ===== DATA TYPES =====
  {
    id: 'theory-data-types',
    title: 'Data Types — Primitives, References, Wrappers',
    sections: [
      {
        heading: 'Primitive Types',
        content: `Java has 8 primitive types (stored directly on the stack):

<table>
<tr><th>Type</th><th>Size</th><th>Range</th><th>Default</th><th>Example</th></tr>
<tr><td><code>byte</code></td><td>8 bits</td><td>-128 to 127</td><td>0</td><td><code>byte b = 100;</code></td></tr>
<tr><td><code>short</code></td><td>16 bits</td><td>-32,768 to 32,767</td><td>0</td><td><code>short s = 30000;</code></td></tr>
<tr><td><code>int</code></td><td>32 bits</td><td>-2.1B to 2.1B</td><td>0</td><td><code>int i = 42;</code></td></tr>
<tr><td><code>long</code></td><td>64 bits</td><td>huge</td><td>0L</td><td><code>long l = 100L;</code></td></tr>
<tr><td><code>float</code></td><td>32 bits</td><td>~7 decimal digits</td><td>0.0f</td><td><code>float f = 3.14f;</code></td></tr>
<tr><td><code>double</code></td><td>64 bits</td><td>~15 decimal digits</td><td>0.0</td><td><code>double d = 3.14;</code></td></tr>
<tr><td><code>char</code></td><td>16 bits</td><td>Unicode character</td><td>'\\u0000'</td><td><code>char c = 'A';</code></td></tr>
<tr><td><code>boolean</code></td><td>1 bit*</td><td>true/false</td><td>false</td><td><code>boolean b = true;</code></td></tr>
</table>

<strong>Widening (automatic, safe):</strong> byte → short → int → long → float → double
<pre><code>int x = 5;
long y = x;    // OK: widening (int → long), no data loss
double z = x;  // OK: widening (int → double)</code></pre>

<strong>Narrowing (requires explicit cast, may lose data):</strong>
<pre><code>long big = 100L;
int small = (int) big;   // explicit cast required
// Risk: if big > Integer.MAX_VALUE, data is truncated!</code></pre>`
      },
      {
        heading: 'Reference Types vs Primitives',
        content: `<strong>Primitives:</strong> hold the VALUE directly. Copied by value.
<pre><code>int a = 10;
int b = a;   // b gets a COPY of 10
b = 20;      // a is still 10 — independent</code></pre>

<strong>References:</strong> hold a POINTER to an object on the heap. Copied by reference value.
<pre><code>Delivery d1 = new Delivery("Route-A");
Delivery d2 = d1;        // d2 points to the SAME object
d2.setRoute("Route-B");  // d1.getRoute() is also "Route-B"!

d2 = new Delivery("Route-C");  // d2 now points to NEW object
// d1 still points to the original (now with "Route-B")</code></pre>

<strong>Key difference:</strong>
• Primitive: independent copies, cannot be null
• Reference: shared object, CAN be null
• <code>==</code> on primitives: compares values
• <code>==</code> on references: compares if same object (not content!)`
      },
      {
        heading: 'Object Lifecycle & Garbage Collection',
        content: `<strong>1. Creation:</strong> <code>new</code> allocates memory on the heap
<pre><code>Delivery d = new Delivery();  // object created on heap, d holds reference</code></pre>

<strong>2. Usage:</strong> object accessible through references
<pre><code>d.dispatch();  // accessed via reference d</code></pre>

<strong>3. Eligible for GC:</strong> when NO references point to it
<pre><code>d = null;                    // reference nulled → object eligible for GC
d = new Delivery();          // reassigned → old object eligible for GC
// Method ends → local refs go out of scope → objects eligible</code></pre>

<strong>4. Garbage Collection:</strong> JVM reclaims memory (you cannot force it)
<pre><code>System.gc();  // SUGGESTS GC, does NOT guarantee it. Never rely on this.</code></pre>

<strong>Key points:</strong>
• You cannot manually free memory in Java (unlike C/C++)
• GC runs automatically when JVM decides
• <code>finalize()</code> is deprecated — do NOT use
• Circular references ARE collected (GC uses reachability from roots, not reference counting)`
      },
      {
        heading: 'Wrapper Classes',
        content: `Each primitive has an object wrapper (needed for collections, null values):

<table>
<tr><th>Primitive</th><th>Wrapper</th><th>Parse method</th><th>Useful methods</th></tr>
<tr><td>int</td><td>Integer</td><td>Integer.parseInt("42")</td><td>Integer.valueOf(), Integer.MAX_VALUE</td></tr>
<tr><td>double</td><td>Double</td><td>Double.parseDouble("3.14")</td><td>Double.isNaN(), Double.compare()</td></tr>
<tr><td>boolean</td><td>Boolean</td><td>Boolean.parseBoolean("true")</td><td>Boolean.TRUE, Boolean.FALSE</td></tr>
<tr><td>long</td><td>Long</td><td>Long.parseLong("100")</td><td>Long.valueOf()</td></tr>
<tr><td>char</td><td>Character</td><td>—</td><td>Character.isDigit(), Character.toUpperCase()</td></tr>
</table>

<strong>Autoboxing/Unboxing (automatic conversion):</strong>
<pre><code>Integer wrapped = 42;         // autoboxing: int → Integer
int unwrapped = wrapped;      // unboxing: Integer → int

List&lt;Integer&gt; numbers = new ArrayList&lt;&gt;();
numbers.add(5);               // autoboxing: int 5 → Integer
int first = numbers.get(0);   // unboxing: Integer → int</code></pre>

<strong>⚠️ Trap: Unboxing null → NullPointerException</strong>
<pre><code>Integer maybeNull = null;
int value = maybeNull;  // NPE! Cannot unbox null.</code></pre>`
      }
    ]
  },

  // ===== OPERATORS & DECISIONS =====
  {
    id: 'theory-operators',
    title: 'Operators and Decision Constructs',
    sections: [
      {
        heading: 'Equality: == vs equals()',
        content: `<strong><code>==</code> compares:</strong>
• Primitives: VALUES (is 5 equal to 5?)
• References: are they the SAME object in memory?

<strong><code>.equals()</code> compares:</strong>
• Object CONTENT (do they have the same data?)

<pre><code>// Primitives: == compares values (correct)
int a = 5, b = 5;
a == b;  // true ✓

// Strings with ==: DANGEROUS
String s1 = new String("REWE");
String s2 = new String("REWE");
s1 == s2;      // FALSE! Different objects
s1.equals(s2); // TRUE — same content

// String pool: literals are interned
String s3 = "REWE";
String s4 = "REWE";
s3 == s4;      // TRUE — same pool object (but don't rely on this!)
s3.equals(s4); // TRUE — always use this for strings</code></pre>

<strong>Rule:</strong> Always use <code>.equals()</code> for String and Object comparison. Use <code>==</code> only for primitives, null checks, and enum comparison.`
      },
      {
        heading: 'if / else / ternary',
        content: `<pre><code>// Standard if/else
if (delivery.isLate()) {
    notifyManager(delivery);
} else if (delivery.isAtRisk()) {
    sendWarning(delivery);
} else {
    // on time — no action
}

// Ternary operator (for simple value selection)
String label = distance > 100 ? "Long haul" : "Local";

// Ternary is an EXPRESSION (returns a value)
// if/else is a STATEMENT (executes code)
// Don't nest ternaries — becomes unreadable</code></pre>

<strong>Common gotcha:</strong>
<pre><code>// This does NOT compile — if requires boolean
int x = 5;
if (x) { ... }  // ✗ Java is not JavaScript!
if (x != 0) { ... }  // ✓ explicit boolean expression required</code></pre>`
      },
      {
        heading: 'Switch Statement',
        content: `<pre><code>switch (delivery.getStatus()) {
    case PLANNED:
        System.out.println("Waiting");
        break;  // WITHOUT break → falls through!
    case DISPATCHED:
        System.out.println("On the way");
        break;
    case DELIVERED:
        System.out.println("Done");
        break;
    default:
        System.out.println("Unknown");
}

// Java 14+ switch expression (returns a value):
String message = switch (status) {
    case PLANNED -> "Waiting";
    case DISPATCHED -> "On the way";
    case DELIVERED -> "Done";
    default -> "Unknown";
};  // note the semicolon — it's an expression</code></pre>

<strong>Switch supports:</strong> int, byte, short, char, String (Java 7+), enum
<strong>Does NOT support:</strong> long, float, double, boolean

<strong>Fall-through trap:</strong> Without <code>break</code>, execution continues into the next case regardless of match. The arrow syntax (<code>-></code>) in Java 14+ does NOT fall through.`
      },
      {
        heading: 'Operator Precedence',
        content: `Operators evaluated in this order (highest to lowest):

<table>
<tr><th>Priority</th><th>Operators</th><th>Example</th></tr>
<tr><td>1 (highest)</td><td>Postfix: <code>x++</code> <code>x--</code></td><td><code>i++</code></td></tr>
<tr><td>2</td><td>Unary: <code>++x</code> <code>--x</code> <code>-x</code> <code>!</code></td><td><code>!valid</code></td></tr>
<tr><td>3</td><td>Multiplicative: <code>*</code> <code>/</code> <code>%</code></td><td><code>a * b</code></td></tr>
<tr><td>4</td><td>Additive: <code>+</code> <code>-</code></td><td><code>a + b</code></td></tr>
<tr><td>5</td><td>Relational: <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code> <code>instanceof</code></td><td><code>x > 5</code></td></tr>
<tr><td>6</td><td>Equality: <code>==</code> <code>!=</code></td><td><code>a == b</code></td></tr>
<tr><td>7</td><td>Logical AND: <code>&&</code></td><td><code>a && b</code></td></tr>
<tr><td>8</td><td>Logical OR: <code>||</code></td><td><code>a || b</code></td></tr>
<tr><td>9</td><td>Ternary: <code>? :</code></td><td><code>x > 0 ? x : -x</code></td></tr>
<tr><td>10 (lowest)</td><td>Assignment: <code>=</code> <code>+=</code> <code>-=</code></td><td><code>x += 5</code></td></tr>
</table>

<strong>Rule:</strong> When in doubt, use parentheses to make intent clear:
<pre><code>// Unclear:
int result = a + b * c;    // is it (a+b)*c or a+(b*c)?
// Clear:
int result = a + (b * c);  // multiplication first, then add</code></pre>`
      }
    ]
  },

  // ===== ARRAYS =====
  {
    id: 'theory-arrays',
    title: 'Arrays — One-dimensional and Multi-dimensional',
    sections: [
      {
        heading: 'One-dimensional Arrays',
        content: `Arrays are fixed-size, indexed containers for elements of the same type.

<pre><code>// Declaration + initialization
int[] distances = new int[5];           // 5 elements, all 0
int[] distances = {12, 8, 25, 30, 15};  // inline initialization
int[] distances = new int[]{12, 8, 25}; // explicit new + values

// Access (0-indexed)
distances[0];        // first element: 12
distances[4];        // last element: 15
distances.length;    // 5 (property, not method!)
distances[5];        // ArrayIndexOutOfBoundsException!

// Iteration
for (int i = 0; i < distances.length; i++) {
    System.out.println(distances[i]);  // by index
}
for (int d : distances) {
    System.out.println(d);  // enhanced for (no index access)
}</code></pre>

<strong>Key facts:</strong>
• Fixed size — cannot grow after creation
• <code>.length</code> is a field (no parentheses), not a method
• Elements have default values: 0, 0.0, false, null
• Arrays are objects (live on the heap, passed by reference)`
      },
      {
        heading: 'Multi-dimensional Arrays',
        content: `<pre><code>// 2D array (array of arrays)
int[][] grid = new int[3][4];  // 3 rows, 4 columns
grid[0][0] = 1;                // first row, first column
grid[2][3] = 9;                // last row, last column

// Inline initialization
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Jagged array (rows of different lengths!)
int[][] jagged = new int[3][];
jagged[0] = new int[]{1, 2};
jagged[1] = new int[]{3, 4, 5, 6};
jagged[2] = new int[]{7};

// Iteration
for (int row = 0; row < matrix.length; row++) {
    for (int col = 0; col < matrix[row].length; col++) {
        System.out.print(matrix[row][col] + " ");
    }
}</code></pre>

<strong>Interview trap:</strong> Java does NOT have true 2D arrays. <code>int[][]</code> is an array of arrays — each "row" is an independent array that can have different lengths.`
      }
    ]
  },

  // ===== LOOPS =====
  {
    id: 'theory-loops',
    title: 'Loop Constructs — for, while, do-while',
    sections: [
      {
        heading: 'Loop types compared',
        content: `<table>
<tr><th>Loop</th><th>When to use</th><th>Checks condition</th></tr>
<tr><td><code>for</code></td><td>Known number of iterations</td><td>Before each iteration</td></tr>
<tr><td><code>for-each</code></td><td>Iterate all elements, no index needed</td><td>Implicit</td></tr>
<tr><td><code>while</code></td><td>Unknown iterations, may never execute</td><td>Before each iteration</td></tr>
<tr><td><code>do-while</code></td><td>Must execute at least once</td><td>After each iteration</td></tr>
</table>

<pre><code>// Traditional for — when you need the index
for (int i = 0; i < deliveries.size(); i++) {
    Delivery d = deliveries.get(i);
}

// Enhanced for — iterate all, no index
for (Delivery d : deliveries) {
    process(d);
}

// while — unknown iterations
while (!queue.isEmpty()) {
    Delivery d = queue.poll();
    process(d);
}

// do-while — always executes at least once
do {
    response = callExternalService();
} while (response.isRetry());</code></pre>`
      },
      {
        heading: 'break and continue',
        content: `<pre><code>// break — EXIT the loop immediately
for (Delivery d : deliveries) {
    if (d.isUrgent()) {
        processUrgent(d);
        break;  // stop searching, exit loop
    }
}

// continue — SKIP this iteration, go to next
for (Delivery d : deliveries) {
    if (d.isCancelled()) {
        continue;  // skip cancelled, process next
    }
    process(d);  // only reached for non-cancelled
}

// Labeled break — exit outer loop from inner
outer:
for (Route r : routes) {
    for (Stop s : r.getStops()) {
        if (s.isBlocked()) {
            break outer;  // exits BOTH loops
        }
    }
}</code></pre>

<strong>Interview tip:</strong> "Infinite loop" pattern for retry:
<pre><code>while (true) {
    try { return callService(); }
    catch (TimeoutException e) {
        if (++retries >= MAX) throw e;
    }
}</code></pre>`
      }
    ]
  },

  // ===== METHODS & ENCAPSULATION =====
  {
    id: 'theory-methods',
    title: 'Methods, Constructors, Access Modifiers',
    sections: [
      {
        heading: 'Methods — signature, overloading, return',
        content: `<pre><code>// Method signature: accessModifier returnType name(parameters)
public Delivery findById(Long id) {
    return repository.findById(id).orElseThrow();
}

// void = returns nothing
public void dispatch(Delivery delivery) {
    delivery.dispatch();
    eventPublisher.publish(delivery);
}

// Overloading = same name, different parameters
public List&lt;Delivery&gt; find(DeliveryStatus status) { ... }
public List&lt;Delivery&gt; find(DeliveryStatus status, int limit) { ... }
public List&lt;Delivery&gt; find(String driverName) { ... }
// Compiler selects based on argument types at call site</code></pre>

<strong>Overloading rules:</strong>
• Same method name, DIFFERENT parameter list (type, count, or order)
• Return type alone does NOT differentiate overloads
• Resolution is at COMPILE-TIME based on declared argument types`
      },
      {
        heading: 'Pass by value — the Java truth',
        content: `Java is ALWAYS pass-by-value. But "value" for references means the reference itself is copied.

<pre><code>// Primitives: copy of the value
void doubleIt(int x) { x = x * 2; }
int n = 5;
doubleIt(n);  // n is STILL 5 — method got a copy

// References: copy of the reference (points to same object)
void rename(Driver d) { d.setName("Carlos"); }
Driver driver = new Driver("Maria");
rename(driver);  // driver.getName() is now "Carlos"!
// WHY? Because d points to the SAME object

// BUT: reassigning the reference has no effect outside
void replace(Driver d) { d = new Driver("Pedro"); }
Driver driver = new Driver("Maria");
replace(driver);  // driver.getName() is STILL "Maria"
// WHY? Only the local copy of the reference was reassigned</code></pre>

<strong>Summary:</strong>
• Primitive passed → original unchanged (independent copy)
• Object passed → modifying THROUGH the reference changes the original
• Object passed → REASSIGNING the reference does NOT change the original`
      },
      {
        heading: 'Constructors',
        content: `<pre><code>class Delivery {
    private final String id;
    private final String route;
    private DeliveryStatus status;

    // No-arg constructor
    public Delivery() {
        this("UNKNOWN", "DEFAULT");  // calls other constructor
    }

    // Parameterized constructor
    public Delivery(String id, String route) {
        this.id = id;
        this.route = route;
        this.status = DeliveryStatus.PLANNED;
    }

    // Copy constructor
    public Delivery(Delivery other) {
        this(other.id, other.route);
    }
}</code></pre>

<strong>Rules:</strong>
• No return type (not even void)
• Same name as the class
• <code>this()</code> calls another constructor — must be FIRST statement
• <code>super()</code> calls parent constructor — must be FIRST statement
• If you write NO constructor → Java provides default no-arg
• If you write ANY constructor → default disappears`
      },
      {
        heading: 'Access Modifiers',
        content: `<table>
<tr><th>Modifier</th><th>Class</th><th>Package</th><th>Subclass (other pkg)</th><th>World</th></tr>
<tr><td><code>private</code></td><td>✓</td><td>✗</td><td>✗</td><td>✗</td></tr>
<tr><td>(default)</td><td>✓</td><td>✓</td><td>✗</td><td>✗</td></tr>
<tr><td><code>protected</code></td><td>✓</td><td>✓</td><td>✓</td><td>✗</td></tr>
<tr><td><code>public</code></td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
</table>

<strong>Best practice (most restrictive that works):</strong>
• Fields: <code>private</code> (always)
• Methods: <code>public</code> for API, <code>private</code> for internal, <code>protected</code> rarely
• Classes: <code>public</code> if used outside package
• Constructors: <code>private</code> for singletons/factories

<strong>static keyword:</strong>
<pre><code>class DeliveryUtils {
    private static int count = 0;       // shared across ALL instances
    public static final int MAX = 100;  // constant

    public static Delivery create() {   // called without instance
        count++;
        return new Delivery();
    }
}
// Usage: DeliveryUtils.create(); — no instance needed</code></pre>`
      }
    ]
  },

  // ===== EXCEPTIONS =====
  {
    id: 'theory-exceptions',
    title: 'Exception Handling — try, catch, throw, custom',
    sections: [
      {
        heading: 'Exception Hierarchy',
        content: `<pre><code>Throwable
├── Error (DO NOT catch — JVM problems)
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── VirtualMachineError
└── Exception
    ├── RuntimeException (UNCHECKED — don't require handling)
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   ├── ClassCastException
    │   ├── IllegalArgumentException
    │   ├── IllegalStateException
    │   └── ArithmeticException
    └── Checked Exceptions (MUST handle with try/catch or throws)
        ├── IOException
        ├── SQLException
        ├── FileNotFoundException
        └── ClassNotFoundException</code></pre>

<strong>Checked:</strong> Compiler forces you to handle (try/catch or declare throws). Represent recoverable situations.
<strong>Unchecked:</strong> RuntimeException subclasses. Represent programming errors. No forced handling.
<strong>Errors:</strong> Serious JVM problems. Never catch these in normal code.`
      },
      {
        heading: 'try / catch / finally',
        content: `<pre><code>try {
    Delivery d = repository.findById(id);
    d.dispatch();
} catch (NotFoundException e) {
    // Handle specific exception first (most specific)
    logger.warn("Delivery not found: " + id);
    throw new BusinessException("Cannot dispatch: not found", e);
} catch (IllegalStateException e) {
    // Handle another specific type
    logger.warn("Invalid state transition", e);
} catch (Exception e) {
    // Catch-all (most general LAST)
    logger.error("Unexpected error", e);
    throw e;  // re-throw if you can't handle
} finally {
    // ALWAYS executes (cleanup)
    // Even if catch re-throws, finally runs
    metrics.recordAttempt();
}</code></pre>

<strong>Rules:</strong>
• Catch blocks: most specific FIRST, most general LAST
• <code>finally</code>: always executes (except System.exit())
• Multi-catch (Java 7+): <code>catch (IOException | SQLException e)</code>
• Try-with-resources (Java 7+): auto-closes AutoCloseable resources`
      },
      {
        heading: 'Throwing and declaring exceptions',
        content: `<pre><code>// Throwing an exception
public Delivery findById(Long id) {
    return repository.findById(id)
        .orElseThrow(() -> new DeliveryNotFoundException("ID: " + id));
}

// Declaring checked exceptions (caller must handle)
public void loadFromFile(String path) throws IOException {
    Files.readAllLines(Path.of(path));  // may throw IOException
}

// Custom exception (unchecked — preferred for business logic)
public class DeliveryNotFoundException extends RuntimeException {
    private final Long deliveryId;

    public DeliveryNotFoundException(Long id) {
        super("Delivery not found: " + id);
        this.deliveryId = id;
    }

    public Long getDeliveryId() { return deliveryId; }
}</code></pre>

<strong>Interview tip:</strong> "When do you use checked vs unchecked?"
• Checked: caller CAN and SHOULD recover (retry, alternative path). Example: IOException.
• Unchecked: programming error or unrecoverable business state. Example: NotFoundException, InvalidStateException.
• Modern Java trend: prefer unchecked for business exceptions.`
      }
    ]
  },

  // ===== STRINGS, DATE/TIME, LAMBDA =====
  {
    id: 'theory-api-classes',
    title: 'String, StringBuilder, Date/Time, Lambda',
    sections: [
      {
        heading: 'Strings — Immutable',
        content: `Strings in Java are <strong>immutable</strong> — every "modification" creates a new String object.

<pre><code>String route = "Warehouse";
route.concat(" → Store");   // returns NEW string, original unchanged!
route = route.concat(" → Store");  // must reassign

// String Pool: literals are interned (shared)
String a = "REWE";   // pool
String b = "REWE";   // same pool object
a == b;  // true (same reference — but don't rely on this!)

// new String() bypasses pool
String c = new String("REWE");
a == c;   // false (different objects!)
a.equals(c);  // true (same content — always use this!)

// Common methods:
"Hello".length();            // 5
"Hello".charAt(0);           // 'H'
"Hello".substring(1, 3);     // "el" (inclusive, exclusive)
"Hello".toLowerCase();       // "hello"
"Hello World".split(" ");    // ["Hello", "World"]
"  spaces  ".trim();         // "spaces"
"Hello".contains("ell");     // true
"Hello".startsWith("He");    // true
"Hello".replace("l", "L");   // "HeLLo"</code></pre>`
      },
      {
        heading: 'StringBuilder — Mutable string building',
        content: `Use StringBuilder when concatenating in a loop (avoids creating N String objects):

<pre><code>StringBuilder sb = new StringBuilder();
for (Stop stop : route.getStops()) {
    sb.append(stop.getName()).append(" → ");
}
String result = sb.toString();

// Methods:
sb.append("text");      // add at end
sb.insert(0, "start");  // insert at position
sb.delete(0, 5);        // delete range
sb.reverse();           // reverse content
sb.length();            // current length
sb.toString();          // convert to String</code></pre>

<strong>When to use:</strong>
• String concatenation in loops → StringBuilder (O(n) vs O(n²))
• Simple one-line concat → <code>"a" + "b"</code> is fine (compiler optimizes)
• Thread-safe needed → StringBuffer (synchronized, slower — rarely needed)`
      },
      {
        heading: 'Date and Time API (java.time)',
        content: `Java 8+ date/time API — immutable, clear, no more Calendar mess.

<pre><code>// Current date/time
LocalDate today = LocalDate.now();           // 2026-07-19
LocalTime now = LocalTime.now();             // 10:30:00
LocalDateTime dateTime = LocalDateTime.now(); // 2026-07-19T10:30:00

// Creating specific dates
LocalDate delivery = LocalDate.of(2026, 7, 25);
LocalTime departure = LocalTime.of(8, 30);

// Operations (IMMUTABLE — returns new object!)
LocalDate nextWeek = today.plusDays(7);
LocalDate lastMonth = today.minusMonths(1);
// today is UNCHANGED — must assign result

// Formatting
DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
String formatted = dateTime.format(fmt);  // "19/07/2026 10:30"
LocalDateTime parsed = LocalDateTime.parse("19/07/2026 10:30", fmt);

// Period (between dates)
Period period = Period.between(startDate, endDate);
period.getDays();   // days component
period.getMonths(); // months component

// Comparison
today.isBefore(delivery);  // true
today.isAfter(delivery);   // false</code></pre>

<strong>Key point:</strong> All java.time classes are IMMUTABLE. <code>plusDays()</code> returns a NEW object. Same trap as String — must assign the result.`
      },
      {
        heading: 'Lambda Expressions & Predicate',
        content: `A lambda is an anonymous function — a concise way to represent behavior.

<pre><code>// Lambda syntax:
(parameters) -> expression          // single expression
(parameters) -> { statements; }     // block with return

// Examples:
Predicate&lt;Delivery&gt; isLate = d -> d.isLate();
Function&lt;Delivery, String&gt; getName = d -> d.getDriverName();
Consumer&lt;Delivery&gt; print = d -> System.out.println(d);
Supplier&lt;Delivery&gt; create = () -> new Delivery();
Comparator&lt;Delivery&gt; byDist = (a, b) -> a.getDistance() - b.getDistance();

// Using with collections:
deliveries.removeIf(d -> d.isCancelled());        // Predicate
deliveries.forEach(d -> process(d));               // Consumer
deliveries.sort((a, b) -> a.compareTo(b));         // Comparator

// Method references (shorthand):
deliveries.forEach(System.out::println);           // equivalent to d -> System.out.println(d)
deliveries.sort(Comparator.comparing(Delivery::getDistance));  // comparing by field</code></pre>

<strong>Predicate:</strong> A function that takes one argument and returns boolean.
<pre><code>Predicate&lt;Delivery&gt; isUrgent = d -> d.getPriority() > 8;
Predicate&lt;Delivery&gt; isLocal = d -> d.getDistance() < 50;

// Combining predicates:
Predicate&lt;Delivery&gt; urgentLocal = isUrgent.and(isLocal);
Predicate&lt;Delivery&gt; notUrgent = isUrgent.negate();

// Using in streams:
List&lt;Delivery&gt; filtered = deliveries.stream()
    .filter(isUrgent.and(isLocal))
    .collect(Collectors.toList());</code></pre>`
      }
    ]
  }
];
