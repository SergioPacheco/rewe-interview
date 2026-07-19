#!/usr/bin/env node
/**
 * Fix topic IDs in exercises and theory to match the EXACT topic IDs
 * from the original app.js (now in topics/index.json).
 *
 * Original topic IDs: rewe, portfolio, oop, solid, collections, sql,
 * system-design, behavioral, spring, rest, kafka, jpa, concurrency,
 * patterns, testing, docker, k8s, kotlin, angular
 */
const fs = require('fs');
const path = require('path');

const EXERCISES_DIR = path.join(__dirname, 'angular/public/data/exercises');
const TOPICS_DIR = path.join(__dirname, 'angular/public/data/topics');

// === FIX EXERCISES ===
// Map: exercise filename → correct topic ID (must match index.json)
const EXERCISE_FILE_TO_TOPIC = {
  'java-core.json': 'collections',       // Java Core exercises → "Java Core (OCA)" topic
  'oop.json': null,                       // Needs splitting: OOP + SOLID
  'spring-boot.json': 'spring',           // Spring Boot exercises → "Spring Boot" topic
  'kafka.json': 'kafka',
  'behavioral.json': 'behavioral',
  'system-design.json': 'system-design',
  'design-patterns.json': 'patterns',
  'sql.json': 'sql',
  'concurrency.json': 'concurrency',      // → separate "Concurrency" topic (NOT collections!)
  'rest.json': 'rest',
  'jpa.json': 'jpa',                      // → separate "Hibernate/JPA" topic (NOT spring!)
  'rewe.json': 'rewe',
};

console.log('🔧 Fixing exercise topic IDs...\n');

let totalFixed = 0;

for (const [filename, targetTopic] of Object.entries(EXERCISE_FILE_TO_TOPIC)) {
  if (targetTopic === null) continue; // Handle oop.json separately below

  const filePath = path.join(EXERCISES_DIR, filename);
  if (!fs.existsSync(filePath)) continue;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let fixed = 0;

  for (const q of data) {
    if (q.topic !== targetTopic) {
      q.topic = targetTopic;
      fixed++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  if (fixed > 0) {
    console.log(`  ✓ ${filename}: ${fixed}/${data.length} → topic="${targetTopic}"`);
    totalFixed += fixed;
  }
}

// Handle oop.json — split between 'oop' and 'solid' based on original filenames
const oopPath = path.join(EXERCISES_DIR, 'oop.json');
if (fs.existsSync(oopPath)) {
  const data = JSON.parse(fs.readFileSync(oopPath, 'utf-8'));
  const oopExercises = [];
  const solidExercises = [];

  for (const q of data) {
    // unit6-solid exercises → 'solid' topic
    if (q.id && (q.id.startsWith('solid-') || q.id.includes('solid'))) {
      q.topic = 'solid';
      solidExercises.push(q);
    } else {
      q.topic = 'oop';
      oopExercises.push(q);
    }
  }

  // Write oop.json with only OOP exercises
  fs.writeFileSync(oopPath, JSON.stringify(oopExercises, null, 2));
  console.log(`  ✓ oop.json: ${oopExercises.length} exercises → topic="oop"`);

  // Create solid.json with SOLID exercises
  if (solidExercises.length > 0) {
    fs.writeFileSync(path.join(EXERCISES_DIR, 'solid.json'), JSON.stringify(solidExercises, null, 2));
    console.log(`  ✓ solid.json: ${solidExercises.length} exercises → topic="solid" (CREATED)`);
  }

  totalFixed += data.length;
}

console.log(`\n  Total exercises fixed: ${totalFixed}`);

// === FIX THEORY ===
console.log('\n🔧 Fixing theory chapter IDs...\n');

// Map: theory filename → correct topic ID
const THEORY_FILE_TO_TOPIC = {
  'theory-rewe.json': 'rewe',
  'theory-portfolio.json': 'portfolio',
  'theory-java-basics.json': 'collections',
  'theory-java-modern.json': 'collections',
  'theory-spring-boot.json': 'spring',
  'theory-kafka.json': 'kafka',
  'theory-rest.json': 'rest',
  'theory-sql.json': 'sql',
  'theory-solid.json': 'solid',           // → separate "SOLID Principles" topic!
  'theory-concurrency.json': 'concurrency', // → separate!
  'theory-patterns.json': 'patterns',
  'theory-jpa.json': 'jpa',              // → separate!
  'theory-docker-k8s.json': 'docker',     // maps to docker (k8s shares)
  'theory-testing.json': 'testing',       // → separate!
  'theory-kotlin.json': 'kotlin',
  'theory-angular.json': 'angular',
  'theory-collections.json': 'collections',
  'theory-oop.json': 'oop',
};

let theoryFixed = 0;

for (const [filename, topicId] of Object.entries(THEORY_FILE_TO_TOPIC)) {
  const filePath = path.join(TOPICS_DIR, filename);
  if (!fs.existsSync(filePath)) continue;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  for (const chapter of data) {
    const expectedPrefix = `theory-${topicId}`;
    if (!chapter.id.startsWith(expectedPrefix)) {
      chapter.id = `${expectedPrefix}-${chapter.id.replace(/^theory-[a-z-]+-?/, '')}`;
      theoryFixed++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  ✓ ${filename} → topic="${topicId}" (${data.length} chapters)`);
}

// Also duplicate docker theory for k8s if it has k8s content
const dockerTheoryPath = path.join(TOPICS_DIR, 'theory-docker-k8s.json');
if (fs.existsSync(dockerTheoryPath)) {
  const data = JSON.parse(fs.readFileSync(dockerTheoryPath, 'utf-8'));
  // Create a copy for k8s with fixed IDs
  const k8sChapters = data.map(ch => ({
    ...ch,
    id: ch.id.replace('theory-docker', 'theory-k8s')
  }));
  fs.writeFileSync(path.join(TOPICS_DIR, 'theory-k8s.json'), JSON.stringify(k8sChapters, null, 2));
  console.log(`  ✓ theory-k8s.json → topic="k8s" (${k8sChapters.length} chapters, copied from docker-k8s)`);
}

console.log(`\n  Total theory chapters fixed: ${theoryFixed}`);
console.log('\n✅ Done!');
