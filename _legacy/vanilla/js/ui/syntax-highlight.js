/**
 * Single-pass Java syntax highlighter for theory code blocks.
 * Tokenizes with one master regex — no placeholder issues.
 */
function highlightTheoryCode() {
  var blocks = document.querySelectorAll('.theory-section pre code');
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (block.getAttribute('data-hl')) continue;
    block.setAttribute('data-hl', '1');
    block.innerHTML = highlightJava(block.innerHTML);
  }
}

function highlightJava(code) {
  var KW = 'abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|record|return|short|static|super|switch|synchronized|this|throw|throws|transient|try|var|void|volatile|while|yield|sealed|permits|true|false|null';

  var TYPES = 'String|Integer|Long|Double|Float|Boolean|Character|Byte|Short|Number|List|ArrayList|LinkedList|Map|HashMap|TreeMap|ConcurrentHashMap|Set|HashSet|TreeSet|Queue|Deque|Optional|Stream|Collectors|Collections|Arrays|Objects|Object|Throwable|Exception|RuntimeException|Error|IOException|SQLException|NullPointerException|IllegalArgumentException|IllegalStateException|ArrayIndexOutOfBoundsException|ClassCastException|ArithmeticException|UnsupportedOperationException|LocalDate|LocalTime|LocalDateTime|DateTimeFormatter|Period|Instant|Duration|ZonedDateTime|StringBuilder|StringBuffer|Math|System|Predicate|Function|Consumer|Supplier|Comparator|BiFunction|CompletableFuture|Future|Callable|Runnable|Thread|UUID|URI|URL|Path|File|Files|Response|ResponseEntity|HttpStatus|BigDecimal|BigInteger|Service|Component|Repository|Controller|RestController|Configuration|Bean|Autowired|Value|Transactional|SpringBootApplication|SpringApplication|KafkaTemplate|KafkaListener|MockMvc|MockBean|WebMvcTest|SpringBootTest|DataJpaTest|Test|ExtendWith|Mock|InjectMocks|Nested|DisplayName|Inject|Stateless|ApplicationScoped|RequestScoped|ViewScoped|Named|Entity|Table|Column|Id|ManyToOne|OneToMany|MappedSuperclass|PersistenceContext|EntityManager|JpaRepository|MessageDriven|MessageListener|Message|Override|Deprecated|FunctionalInterface';

  // Master regex — order matters! First match wins.
  var master = new RegExp(
    '(\\/\\/[^\\n]*)'           +  // group 1: line comment
    '|(\\/\\*[\\s\\S]*?\\*\\/)' +  // group 2: block comment
    '|("(?:[^"\\\\]|\\\\.)*")'  +  // group 3: string
    "|('(?:[^'\\\\]|\\\\.)*')"  +  // group 4: char
    '|(@\\w+)'                  +  // group 5: annotation
    '|\\b(' + KW + ')\\b'      +  // group 6: keyword
    '|\\b(' + TYPES + ')\\b'   +  // group 7: type
    '|(\\b\\d+\\.?\\d*[fFLld]?\\b)' + // group 8: number
    '|(-&gt;|::)',                     // group 9: operator
    'g'
  );

  return code.replace(master, function(match, cmt1, cmt2, str, chr, ann, kw, type, num, op) {
    if (cmt1) return '<span class="cmt">' + cmt1 + '</span>';
    if (cmt2) return '<span class="cmt">' + cmt2 + '</span>';
    if (str)  return '<span class="str">' + str + '</span>';
    if (chr)  return '<span class="str">' + chr + '</span>';
    if (ann)  return '<span class="ann">' + ann + '</span>';
    if (kw)   return '<span class="kw">' + kw + '</span>';
    if (type) return '<span class="type">' + type + '</span>';
    if (num)  return '<span class="num">' + num + '</span>';
    if (op)   return '<span class="op">' + op + '</span>';
    return match;
  });
}
