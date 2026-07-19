/**
 * Java Core Module — Part 3 (20 exercises)
 * Methods, Access Modifiers, Constructors, Inheritance mechanics, ArrayList, Lambda
 */
const javaCoreExercises3 = [

  // ===== METHODS & ENCAPSULATION (7) =====

  {
    id: 'core-methods-01',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Pass by Value',
    difficulty: 'INTERMEDIATE',
    mission: 'What prints? Java is <strong>pass by value</strong> — but what does that mean for objects?',
    code: `public static void changeName(Driver driver) {
    driver.setName("Carlos");
}

Driver d = new Driver("Maria");
changeName(d);
System.out.println(d.getName());`,
    choices: ['Maria', 'Carlos', 'null', 'Compile Error'],
    answer: 'Carlos',
    explain: 'Java passes the REFERENCE by value. The method receives a copy of the reference pointing to the same object. Modifying the object through that reference changes the original. But reassigning the reference inside the method (driver = new Driver()) does NOT affect the caller.'
  },
  {
    id: 'core-methods-02',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Pass by Value — reassignment',
    difficulty: 'INTERMEDIATE',
    mission: 'What prints? Focus on <strong>reference reassignment</strong> inside a method.',
    code: `public static void replace(Driver driver) {
    driver = new Driver("Carlos"); // reassign local ref
}

Driver d = new Driver("Maria");
replace(d);
System.out.println(d.getName());`,
    choices: ['Maria', 'Carlos', 'null', 'Compile Error'],
    answer: 'Maria',
    explain: 'Reassigning the parameter (driver = new Driver()) only changes the LOCAL copy of the reference. The caller still points to the original object. This proves Java is pass-by-value (of references), not pass-by-reference. Modify through ref = changes original. Reassign ref = only local effect.'
  },
  {
    id: 'core-methods-03',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Method Overloading',
    difficulty: 'BASIC',
    mission: 'Which overload is called?',
    code: `class Calculator {
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
}

Calculator c = new Calculator();
System.out.println(c.add(3, 4));`,
    choices: ['7', '7.0', 'Compile Error: ambiguous', 'Exception'],
    answer: '7',
    explain: 'Exact match wins: 3 and 4 are int literals → add(int, int) is called, returns int 7. If you passed 3.0 and 4.0, add(double, double) would be called. Overload resolution is compile-time based on parameter types.'
  },
  {
    id: 'core-methods-04',
    type: 'FILL_BLANK',
    subtopic: 'Static',
    difficulty: 'BASIC',
    mission: 'A counter shared across ALL instances — must be <strong>static</strong>.',
    code: 'public class DeliveryTracker {\n    private _____ int totalDeliveries = 0;\n\n    public void trackDelivery() {\n        totalDeliveries++; // shared across all instances\n    }\n}',
    blank: '_____',
    choices: ['static', 'final', 'volatile', 'transient'],
    answer: 'static',
    explain: 'static = belongs to the CLASS, not instances. One copy shared by all objects. Without static, each DeliveryTracker instance has its own counter. static fields: counters, constants (static final), utility methods, factory methods.'
  },
  {
    id: 'core-methods-05',
    type: 'PICK_INVALID',
    subtopic: 'Access Modifiers',
    difficulty: 'INTERMEDIATE',
    mission: 'Which access modifier is <strong>most restrictive</strong> while still allowing subclass access in another package?',
    snippets: [
      { id: 'a', code: 'private\n// Only same class\n// Subclasses cannot access', valid: true },
      { id: 'b', code: 'protected\n// Same package + subclasses\n// Even in different packages', valid: false },
      { id: 'c', code: 'public\n// Everyone everywhere\n// No restriction', valid: true }
    ],
    answer: 'b',
    explain: 'protected is the ANSWER — most restrictive while allowing subclass access across packages. Order from most to least restrictive: private → default (package) → protected → public. Default (no modifier) allows same-package only — subclasses in other packages cannot access.'
  },
  {
    id: 'core-methods-06',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Constructors',
    difficulty: 'INTERMEDIATE',
    mission: 'What prints? Think about <strong>constructor chaining</strong>.',
    code: `class Route {
    String name;
    int stops;

    Route() {
        this("Default", 0);
        System.out.print("A");
    }
    Route(String name, int stops) {
        this.name = name;
        this.stops = stops;
        System.out.print("B");
    }
}

Route r = new Route();`,
    choices: ['A', 'B', 'BA', 'AB'],
    answer: 'BA',
    explain: 'this() calls the other constructor FIRST, then continues with the rest of the current constructor. Flow: new Route() → this("Default",0) → prints B → returns → prints A. Constructor chaining with this() must be the FIRST statement.'
  },
  {
    id: 'core-methods-07',
    type: 'FILL_BLANK',
    subtopic: 'Constructors — Default',
    difficulty: 'BASIC',
    mission: 'When does Java <strong>NOT</strong> provide a default constructor?',
    code: 'class Delivery {\n    private String id;\n    // Java provides no-arg constructor ONLY if:\n    // _____\n}',
    blank: '_____',
    choices: ['no constructor is defined', 'class is public', 'class has fields', 'class extends Object'],
    answer: 'no constructor is defined',
    explain: 'Java provides a default no-arg constructor ONLY if you define NO constructors at all. The moment you write any constructor (even with parameters), the default disappears. If you need both: write the parameterized one AND an explicit no-arg constructor.'
  },

  // ===== INHERITANCE MECHANICS (6) =====

  {
    id: 'core-inherit-01',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Inheritance — super',
    difficulty: 'INTERMEDIATE',
    mission: 'What prints? Think about <strong>super()</strong> and constructor order.',
    code: `class Vehicle {
    Vehicle() { System.out.print("V"); }
}
class Truck extends Vehicle {
    Truck() { System.out.print("T"); }
}

new Truck();`,
    choices: ['T', 'V', 'VT', 'TV'],
    answer: 'VT',
    explain: 'Java always calls the parent constructor FIRST (implicit super() if not explicit). Flow: new Truck() → super() [Vehicle()] → prints V → Truck() body → prints T. Parent is ALWAYS initialized before child. This is fundamental to inheritance.'
  },
  {
    id: 'core-inherit-02',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Inheritance — Override',
    difficulty: 'INTERMEDIATE',
    mission: 'What prints? Think about <strong>dynamic dispatch</strong>.',
    code: `class Vehicle {
    String type() { return "Vehicle"; }
}
class Truck extends Vehicle {
    @Override
    String type() { return "Truck"; }
}

Vehicle v = new Truck();
System.out.println(v.type());`,
    choices: ['Vehicle', 'Truck', 'Compile Error', 'null'],
    answer: 'Truck',
    explain: 'Dynamic dispatch: the ACTUAL object type (Truck) determines which method runs, not the reference type (Vehicle). This is runtime polymorphism. v.type() calls Truck.type() because the object IS a Truck. The reference type only affects which methods are VISIBLE at compile time.'
  },
  {
    id: 'core-inherit-03',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Inheritance — Casting',
    difficulty: 'INTERMEDIATE',
    mission: 'What happens at <strong>runtime</strong>?',
    code: `Vehicle v = new Vehicle();
Truck t = (Truck) v;  // Compiles fine!`,
    choices: ['Works fine', 'ClassCastException', 'Compile Error', 'null'],
    answer: 'ClassCastException',
    explain: 'Downcasting (Vehicle → Truck) compiles because the compiler allows it (v COULD be a Truck). But at runtime, v is actually a Vehicle, not a Truck → ClassCastException. Always check with instanceof before downcasting: if (v instanceof Truck t) { ... }'
  },
  {
    id: 'core-inherit-04',
    type: 'FILL_BLANK',
    subtopic: 'Abstract classes',
    difficulty: 'BASIC',
    mission: 'A class with at least one abstract method must be declared:',
    code: '_____ class DeliveryHandler {\n    abstract void process(Delivery d);\n    \n    void log(String msg) {\n        System.out.println(msg); // concrete method OK\n    }\n}',
    blank: '_____',
    choices: ['abstract', 'interface', 'final', 'static'],
    answer: 'abstract',
    explain: 'abstract class can have both abstract methods (no body, subclasses must implement) AND concrete methods (with body, inherited as-is). Cannot be instantiated directly. Use when subtypes share state + partial behavior. interface is for pure contract (pre-Java 8) or default methods.'
  },
  {
    id: 'core-inherit-05',
    type: 'PICK_INVALID',
    subtopic: 'Interface',
    difficulty: 'INTERMEDIATE',
    mission: 'Which is <strong>NOT valid</strong> in a Java 11 interface?',
    snippets: [
      { id: 'a', code: 'interface Trackable {\n  void track(); // abstract method\n}', valid: true },
      { id: 'b', code: 'interface Trackable {\n  default String status() {\n    return "UNKNOWN";\n  }\n}', valid: true },
      { id: 'c', code: 'interface Trackable {\n  private int counter = 0;\n  void increment() {\n    counter++;\n  }\n}', valid: false }
    ],
    answer: 'c',
    explain: 'Interfaces CANNOT have mutable instance fields. Fields in interfaces are implicitly public static final (constants only). Interfaces define behavior contracts, not state. Since Java 9, interfaces can have private methods (helper for default methods), but still no mutable state.'
  },
  {
    id: 'core-inherit-06',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Interface — multiple',
    difficulty: 'INTERMEDIATE',
    mission: 'Does this <strong>compile</strong>? A class implementing two interfaces.',
    code: `interface Dispatchable { void dispatch(); }
interface Trackable { void track(); }

class Delivery implements Dispatchable, Trackable {
    public void dispatch() { System.out.print("D"); }
    public void track() { System.out.print("T"); }
}

Delivery d = new Delivery();
d.dispatch();
d.track();`,
    choices: ['DT', 'Compile Error: multiple interfaces', 'D', 'Exception'],
    answer: 'DT',
    explain: 'Java supports multiple interface implementation (but single class inheritance). A class can implement any number of interfaces. This is how Java achieves "multiple inheritance of type" without the diamond problem of multiple class inheritance.'
  },

  // ===== ARRAYLIST & LAMBDA (7) =====

  {
    id: 'core-arraylist-01',
    type: 'FILL_BLANK',
    subtopic: 'ArrayList',
    difficulty: 'BASIC',
    mission: 'Create a <strong>typed ArrayList</strong> of delivery IDs.',
    code: 'List<Long> deliveryIds = new _____<>();\ndeliveryIds.add(1001L);\ndeliveryIds.add(1002L);',
    blank: '_____',
    choices: ['ArrayList', 'List', 'LinkedList', 'Array'],
    answer: 'ArrayList',
    explain: 'ArrayList is the standard List implementation — backed by a resizable array. O(1) random access, O(1) amortized add at end, O(n) insert in middle. Declare as List<> (interface) on the left, instantiate as ArrayList<> on the right — program to the interface.'
  },
  {
    id: 'core-arraylist-02',
    type: 'PREDICT_OUTPUT',
    subtopic: 'ArrayList — remove',
    difficulty: 'INTERMEDIATE',
    mission: 'What prints? Be careful with <strong>remove()</strong> overloads.',
    code: `List<Integer> list = new ArrayList<>(List.of(10, 20, 30));
list.remove(1);  // remove by INDEX, not value!
System.out.println(list);`,
    choices: ['[10, 30]', '[20, 30]', '[10, 20]', '[10, 20, 30]'],
    answer: '[10, 30]',
    explain: 'remove(1) removes element at INDEX 1 (which is 20), not the value 1. To remove by value: list.remove(Integer.valueOf(1)). This autoboxing trap is a classic interview question. With List<Integer>, remove(int) = by index, remove(Integer) = by value.'
  },
  {
    id: 'core-arraylist-03',
    type: 'FILL_BLANK',
    subtopic: 'Lambda — forEach',
    difficulty: 'BASIC',
    mission: 'Print each delivery using a <strong>method reference</strong>.',
    code: 'deliveries.forEach(System.out_____);',
    blank: '_____',
    choices: ['::println', '.println', '->println', '::print'],
    answer: '::println',
    explain: 'System.out::println is a method reference — shorthand for (d) -> System.out.println(d). :: refers to an existing method by name. Types: ClassName::staticMethod, object::instanceMethod, ClassName::new (constructor reference).'
  },
  {
    id: 'core-arraylist-04',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Lambda — sort',
    difficulty: 'INTERMEDIATE',
    mission: 'What is the <strong>sorted order</strong>?',
    code: `List<String> drivers = new ArrayList<>(List.of("Carlos", "Ana", "Bruno"));
drivers.sort((a, b) -> a.compareTo(b));
System.out.println(drivers);`,
    choices: ['[Ana, Bruno, Carlos]', '[Carlos, Bruno, Ana]', '[Carlos, Ana, Bruno]', 'Exception'],
    answer: '[Ana, Bruno, Carlos]',
    explain: 'The lambda (a, b) -> a.compareTo(b) is a Comparator — returns negative (a before b), zero (equal), positive (a after b). String.compareTo uses alphabetical order. Shorthand: drivers.sort(Comparator.naturalOrder()) or drivers.sort(String::compareTo).'
  },
  {
    id: 'core-arraylist-05',
    type: 'FILL_BLANK',
    subtopic: 'Lambda — Predicate',
    difficulty: 'INTERMEDIATE',
    mission: 'Remove all <strong>cancelled deliveries</strong> from the list using removeIf.',
    code: 'deliveries.removeIf(d -> d.getStatus() == DeliveryStatus._____);',
    blank: '_____',
    choices: ['CANCELLED', 'ACTIVE', 'null', 'PENDING'],
    answer: 'CANCELLED',
    explain: 'removeIf(Predicate) removes all elements matching the condition. The lambda d -> d.getStatus() == CANCELLED is a Predicate<Delivery> (takes Delivery, returns boolean). This is cleaner than iterating with Iterator and calling remove().'
  },
  {
    id: 'core-arraylist-06',
    type: 'PREDICT_OUTPUT',
    subtopic: 'Lambda — Functional Interface',
    difficulty: 'INTERMEDIATE',
    mission: 'What does this <strong>Function</strong> return?',
    code: `Function<String, Integer> length = s -> s.length();
System.out.println(length.apply("REWE"));`,
    choices: ['4', 'REWE', '0', 'Compile Error'],
    answer: '4',
    explain: 'Function<T, R> takes T and returns R. Function<String, Integer> takes a String and returns an Integer. length.apply("REWE") returns "REWE".length() = 4. Key functional interfaces: Function (T→R), Predicate (T→boolean), Consumer (T→void), Supplier (→T).'
  },
  {
    id: 'core-arraylist-07',
    type: 'COMPARE_CONCEPTS',
    subtopic: 'Functional Interfaces',
    difficulty: 'INTERMEDIATE',
    mission: 'Compare the 4 core <strong>functional interfaces</strong>.',
    conceptA: { name: 'Function & Predicate', definition: 'Function<T,R>: takes T, returns R. Example: Delivery → String (get name). Predicate<T>: takes T, returns boolean. Example: Delivery → is it late?' },
    conceptB: { name: 'Consumer & Supplier', definition: 'Consumer<T>: takes T, returns void. Example: Delivery → print it. Supplier<T>: takes nothing, returns T. Example: () → create new Delivery.' },
    keyDifference: 'Function transforms (T→R). Predicate tests (T→boolean). Consumer acts (T→void). Supplier produces (→T). These are the building blocks of the Streams API.',
    javaExample: 'filter(Predicate), map(Function), forEach(Consumer), orElseGet(Supplier). Every Stream operation uses one of these four.',
    interviewAnswer: 'The four core functional interfaces cover all lambda signatures: Function transforms data, Predicate filters, Consumer performs side effects, and Supplier provides values lazily. The Streams API is built entirely on these abstractions.'
  }
];
