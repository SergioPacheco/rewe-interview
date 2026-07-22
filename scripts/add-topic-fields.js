#!/usr/bin/env node
/**
 * Adds topic and subtopic fields to theory chapter JSONs.
 * Maps filename -> topicId, and derives subtopic from chapter ID.
 */
const fs = require('fs');
const path = require('path');

const topicsDir = path.resolve(__dirname, '../public/data/topics/en');

// Map filename to topicId
const fileTopicMap = {
  'theory-java-basics.json': 'collections',    // Topic ID is 'collections' (Java Core OCA)
  'theory-java-modern.json': 'collections',    // Subtopic java-modern is under collections
  'theory-rewe.json': 'rewe',
  'theory-portfolio.json': 'rewe',             // Portfolio is loaded but linked to REWE context
  'theory-spring-boot.json': 'spring',
  'theory-kafka.json': 'kafka',
  'theory-rest.json': 'rest',
  'theory-sql.json': 'sql',
  'theory-solid.json': 'solid',
  'theory-concurrency.json': 'concurrency',
  'theory-patterns.json': 'patterns',
  'theory-jpa.json': 'jpa',
  'theory-docker.json': 'docker',
  'theory-kubernetes.json': 'k8s',
  'theory-testing.json': 'testing',
  'theory-kotlin.json': 'kotlin',
  'theory-angular.json': 'angular',
  'theory-collections.json': 'collections',
  'theory-oop.json': 'oop',
  'theory-security.json': 'security',
  'theory-system-design.json': 'system-design',
  'theory-behavioral.json': 'behavioral'
};

// Subtopic derivation rules per topic
// These map chapter ID patterns to subtopic IDs from index.json
const subtopicRules = {
  'collections': (id) => {
    if (id.includes('java-basics') || id.includes('declarations') || id.includes('variables') || id.includes('package') || id.includes('class-structure')) return 'java-basics';
    if (id.includes('types') || id.includes('primitives') || id.includes('casting') || id.includes('wrapper')) return 'java-types';
    if (id.includes('operator') || id.includes('decision') || id.includes('switch') || id.includes('ternary')) return 'java-operators';
    if (id.includes('array')) return 'java-arrays';
    if (id.includes('loop') || id.includes('iteration')) return 'java-loops';
    if (id.includes('method') || id.includes('encapsulation') || id.includes('access-modifier')) return 'java-methods';
    if (id.includes('inheritance') || id.includes('override') || id.includes('super') || id.includes('extends')) return 'java-inheritance';
    if (id.includes('exception') || id.includes('try') || id.includes('catch') || id.includes('throw')) return 'java-exceptions';
    if (id.includes('string') || id.includes('date') || id.includes('lambda') || id.includes('api')) return 'java-api';
    if (id.includes('modern') || id.includes('record') || id.includes('sealed') || id.includes('pattern') || id.includes('stream') || id.includes('optional')) return 'java-modern';
    if (id.includes('collection') || id.includes('list') || id.includes('set') || id.includes('map') || id.includes('equals') || id.includes('hash') || id.includes('comparable') || id.includes('generics')) return 'java-basics';
    return null;
  },
  'oop': (id) => {
    if (id.includes('encapsulation')) return 'oop-encapsulation';
    if (id.includes('abstraction')) return 'oop-abstraction';
    if (id.includes('inheritance') || id.includes('extends')) return 'oop-inheritance';
    if (id.includes('polymorphism')) return 'oop-polymorphism';
    if (id.includes('composition')) return 'oop-composition';
    return null;
  },
  'solid': (id) => {
    if (id.includes('srp') || id.includes('single')) return 'solid-srp';
    if (id.includes('ocp') || id.includes('open')) return 'solid-ocp';
    if (id.includes('lsp') || id.includes('liskov')) return 'solid-lsp';
    if (id.includes('isp') || id.includes('interface-seg')) return 'solid-isp';
    if (id.includes('dip') || id.includes('dependency-inv')) return 'solid-dip';
    return null;
  },
  'spring': (id) => {
    if (id.includes('di') || id.includes('bean') || id.includes('ioc') || id.includes('injection') || id.includes('stereotype')) return 'spring-di';
    if (id.includes('data') || id.includes('jpa') || id.includes('repository')) return 'spring-data';
    if (id.includes('rest') || id.includes('controller') || id.includes('web')) return 'spring-rest';
    if (id.includes('config') || id.includes('profile') || id.includes('properties')) return 'spring-config';
    if (id.includes('test')) return 'spring-testing';
    if (id.includes('actuator') || id.includes('health') || id.includes('observ')) return 'spring-actuator';
    return null;
  },
  'kafka': (id) => {
    if (id.includes('overview') || id.includes('jms') || id.includes('vs') || id.includes('fundamentals') || id.includes('messaging')) return 'kafka-overview';
    if (id.includes('architect') || id.includes('topic') || id.includes('partition') || id.includes('broker')) return 'kafka-architecture';
    if (id.includes('consumer') || id.includes('group') || id.includes('offset') || id.includes('rebalance')) return 'kafka-consumers';
    if (id.includes('delivery') || id.includes('semantic') || id.includes('exactly') || id.includes('idempoten')) return 'kafka-delivery';
    if (id.includes('producer') || id.includes('pattern') || id.includes('schema') || id.includes('avro')) return 'kafka-producer';
    return null;
  },
  'rest': (id) => {
    if (id.includes('verb') || id.includes('status') || id.includes('method') || id.includes('http')) return 'rest-verbs';
    if (id.includes('design') || id.includes('pagination') || id.includes('error') || id.includes('resource')) return 'rest-design';
    if (id.includes('version') || id.includes('idempoten') || id.includes('hateoas')) return 'rest-versioning';
    return null;
  },
  'security': (id) => {
    if (id.includes('fundamental') || id.includes('auth') && !id.includes('spring')) return 'security-auth';
    if (id.includes('spring')) return 'security-spring';
    if (id.includes('owasp') || id.includes('xss') || id.includes('csrf') || id.includes('cors') || id.includes('web')) return 'security-web';
    if (id.includes('api') || id.includes('mtls') || id.includes('service')) return 'security-api';
    if (id.includes('gdpr') || id.includes('data') || id.includes('privacy')) return 'security-data';
    return null;
  },
  'sql': (id) => {
    if (id.includes('join')) return 'sql-joins';
    if (id.includes('index') || id.includes('explain') || id.includes('plan')) return 'sql-indexes';
    if (id.includes('transaction') || id.includes('isolation') || id.includes('lock')) return 'sql-transactions';
    if (id.includes('n+1') || id.includes('performance') || id.includes('optim')) return 'sql-performance';
    return null;
  },
  'jpa': (id) => {
    if (id.includes('basics') || id.includes('mapping') || id.includes('entity') || id.includes('lifecycle')) return 'jpa-basics';
    if (id.includes('relation') || id.includes('fetch') || id.includes('lazy') || id.includes('eager')) return 'jpa-relations';
    if (id.includes('query') || id.includes('jpql') || id.includes('criteria')) return 'jpa-queries';
    return null;
  },
  'concurrency': (id) => {
    if (id.includes('thread') || id.includes('pool') || id.includes('executor')) return 'conc-threads';
    if (id.includes('completable') || id.includes('future') || id.includes('async')) return 'conc-completable';
    if (id.includes('safety') || id.includes('synchroniz') || id.includes('volatile') || id.includes('atomic') || id.includes('concurrent')) return 'conc-safety';
    return null;
  },
  'patterns': (id) => {
    if (id.includes('strategy')) return 'pat-strategy';
    if (id.includes('factory')) return 'pat-factory';
    if (id.includes('observer')) return 'pat-observer';
    if (id.includes('builder')) return 'pat-builder';
    return null;
  },
  'testing': (id) => {
    if (id.includes('pyramid') || id.includes('strategy') || id.includes('tdd')) return 'test-pyramid';
    if (id.includes('junit') || id.includes('mockito') || id.includes('unit')) return 'test-junit';
    if (id.includes('integration') || id.includes('testcontainer') || id.includes('container')) return 'test-integration';
    return null;
  },
  'docker': (id) => {
    if (id.includes('basics') || id.includes('image') || id.includes('container') || id.includes('layers')) return 'docker-basics';
    if (id.includes('compose') || id.includes('volume') || id.includes('network')) return 'docker-compose';
    return null;
  },
  'k8s': (id) => {
    if (id.includes('pods') || id.includes('deployment') || id.includes('manifest')) return 'k8s-pods';
    if (id.includes('service') || id.includes('probe') || id.includes('scaling') || id.includes('graceful') || id.includes('shutdown')) return 'k8s-services';
    return null;
  },
  'kotlin': (id) => {
    if (id.includes('basics') || id.includes('vs-java') || id.includes('comparison')) return 'kotlin-basics';
    if (id.includes('null')) return 'kotlin-null';
    if (id.includes('class') || id.includes('extension') || id.includes('data-class')) return 'kotlin-classes';
    return null;
  },
  'angular': (id) => {
    if (id.includes('basics') || id.includes('component') || id.includes('core')) return 'ng-basics';
    if (id.includes('service') || id.includes('http') || id.includes('state') || id.includes('signal')) return 'ng-services';
    if (id.includes('routing') || id.includes('primeng') || id.includes('prime')) return 'ng-routing';
    return null;
  },
  'rewe': (id) => {
    if (id.includes('job') || id.includes('description') || id.includes('requirements')) return 'rewe-job';
    if (id.includes('trab') || id.includes('team')) return 'rewe-trab';
    if (id.includes('problem') || id.includes('challenge') || id.includes('business')) return 'rewe-problem';
    if (id.includes('neo') || id.includes('platform')) return 'rewe-neo';
    if (id.includes('connection') || id.includes('experience') || id.includes('your') || id.includes('fit')) return 'rewe-connection';
    if (id.includes('question') || id.includes('ask')) return 'rewe-questions';
    return null;
  },
  'system-design': (id) => {
    if (id.includes('event')) return 'sd-events';
    if (id.includes('data') || id.includes('consistency')) return 'sd-data';
    if (id.includes('scal') || id.includes('performance') || id.includes('cache')) return 'sd-scaling';
    if (id.includes('deploy') || id.includes('observ') || id.includes('ops') || id.includes('monitor')) return 'sd-ops';
    return null;
  },
  'behavioral': (id) => {
    if (id.includes('adapt') || id.includes('learn')) return 'beh-adaptability';
    if (id.includes('conflict') || id.includes('communicat')) return 'beh-conflict';
    if (id.includes('leadership') || id.includes('initiative') || id.includes('mentor')) return 'beh-leadership';
    if (id.includes('pressure') || id.includes('deadline') || id.includes('stress')) return 'beh-pressure';
    if (id.includes('culture') || id.includes('motivation') || id.includes('value')) return 'beh-culture';
    return null;
  }
};

// Process all theory files
const files = fs.readdirSync(topicsDir).filter(f => f.startsWith('theory-') && f.endsWith('.json'));

let totalUpdated = 0;
let totalChapters = 0;

for (const file of files) {
  const topicId = fileTopicMap[file];
  if (!topicId) {
    console.log(`⚠️  Skipping ${file} — no topic mapping`);
    continue;
  }

  const filePath = path.join(topicsDir, file);
  const chapters = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (!Array.isArray(chapters)) {
    console.log(`⚠️  Skipping ${file} — not an array`);
    continue;
  }

  let modified = false;
  for (const chapter of chapters) {
    totalChapters++;
    // Only add if not already present
    if (!chapter.topic) {
      chapter.topic = topicId;
      modified = true;
    }
    if (!chapter.subtopic && subtopicRules[topicId]) {
      const subtopic = subtopicRules[topicId](chapter.id.toLowerCase());
      if (subtopic) {
        chapter.subtopic = subtopic;
        modified = true;
      }
    }
    if (modified) totalUpdated++;
  }

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(chapters, null, 2) + '\n');
    console.log(`✅ Updated ${file} (${chapters.length} chapters)`);
  } else {
    console.log(`— ${file} (already has fields)`);
  }
}

console.log(`\nDone: ${totalUpdated}/${totalChapters} chapters updated across ${files.length} files.`);
