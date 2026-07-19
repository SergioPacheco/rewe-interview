#!/usr/bin/env node
/**
 * Converts vanilla JS data files to typed JSON for Angular.
 * Reads each .js file, evaluates the array, outputs as JSON.
 *
 * Usage: node convert-data.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SOURCE_DIR = path.join(__dirname, 'js', 'data');
const OUTPUT_EXERCISES = path.join(__dirname, 'angular', 'public', 'data', 'exercises');
const OUTPUT_TOPICS = path.join(__dirname, 'angular', 'public', 'data', 'topics');

// Ensure output dirs exist
fs.mkdirSync(OUTPUT_EXERCISES, { recursive: true });
fs.mkdirSync(OUTPUT_TOPICS, { recursive: true });

// Map file → output category
const EXERCISE_FILES = {
  'java-core-1.js': 'java-core.json',
  'java-core-2.js': 'java-core.json',
  'java-core-3.js': 'java-core.json',
  'oop-questions.js': 'oop.json',
  'unit1-encapsulation.js': 'oop.json',
  'unit2-abstraction.js': 'oop.json',
  'unit3-inheritance.js': 'oop.json',
  'unit4-polymorphism.js': 'oop.json',
  'unit5-composition.js': 'oop.json',
  'unit6-solid.js': 'oop.json',
  'spring-boot-1.js': 'spring-boot.json',
  'spring-boot-2.js': 'spring-boot.json',
  'kafka-1.js': 'kafka.json',
  'kafka-2.js': 'kafka.json',
  'behavioral-1.js': 'behavioral.json',
  'behavioral-2.js': 'behavioral.json',
  'system-design-1.js': 'system-design.json',
  'design-patterns-1.js': 'design-patterns.json',
  'sql-exercises-1.js': 'sql.json',
  'concurrency-exercises.js': 'concurrency.json',
  'rest-exercises.js': 'rest.json',
  'jpa-exercises.js': 'jpa.json',
  'rewe-exercises.js': 'rewe.json',
};

const THEORY_FILES = {
  'theory.js': 'theory-general.json',
  'theory-angular.js': 'theory-angular.json',
  'theory-concurrency.js': 'theory-concurrency.json',
  'theory-docker-k8s.js': 'theory-docker-k8s.json',
  'theory-java-basics.js': 'theory-java-basics.json',
  'theory-java-modern.js': 'theory-java-modern.json',
  'theory-jpa.js': 'theory-jpa.json',
  'theory-kafka.js': 'theory-kafka.json',
  'theory-kotlin.js': 'theory-kotlin.json',
  'theory-patterns.js': 'theory-patterns.json',
  'theory-portfolio.js': 'theory-portfolio.json',
  'theory-rest.js': 'theory-rest.json',
  'theory-rewe.js': 'theory-rewe.json',
  'theory-solid.js': 'theory-solid.json',
  'theory-spring-boot.js': 'theory-spring-boot.json',
  'theory-sql.js': 'theory-sql.json',
  'theory-testing.js': 'theory-testing.json',
};

/**
 * Extracts array data from a JS file that declares a `const varName = [...]`
 */
function extractData(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');

  // Replace `const` and `let` with `var` so they become sandbox-accessible
  code = code.replace(/\bconst\s+/g, 'var ');
  code = code.replace(/\blet\s+/g, 'var ');

  // Create a sandbox to safely evaluate the JS
  const sandbox = {};
  try {
    vm.runInNewContext(code, sandbox, { timeout: 10000 });
  } catch (e) {
    console.warn(`  ⚠️  Could not evaluate ${path.basename(filePath)}: ${e.message}`);
    return null;
  }

  // Find the first array in the sandbox
  const keys = Object.keys(sandbox);
  for (const key of keys) {
    if (Array.isArray(sandbox[key])) {
      return sandbox[key];
    }
  }

  console.warn(`  ⚠️  No array found in ${path.basename(filePath)}`);
  return null;
}

/**
 * Preserve exercise data EXACTLY as it is — no normalization, no type mapping.
 * Only adds 'topic' field derived from filename for routing purposes.
 */
function normalizeExercise(item, sourceFile) {
  const topicFromFile = sourceFile.replace(/[-_]\d+\.js$/, '').replace(/-exercises/, '');

  // Clone and add only the routing field — NOTHING ELSE changes
  const result = { ...item };
  result.topic = result.topic || topicFromFile;

  // Normalize difficulty to lowercase (for filtering only)
  if (result.difficulty) {
    result.difficulty = result.difficulty.toLowerCase();
  }

  return result;
}

// === MAIN ===
console.log('🔄 Converting JS data files to JSON...\n');

// Process exercises (merge files targeting same output)
const exerciseAccumulator = {};
let totalExercises = 0;

for (const [file, output] of Object.entries(EXERCISE_FILES)) {
  const filePath = path.join(SOURCE_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  Missing: ${file}`);
    continue;
  }

  const data = extractData(filePath);
  if (!data) continue;

  if (!exerciseAccumulator[output]) {
    exerciseAccumulator[output] = [];
  }

  const normalized = data.map(item => normalizeExercise(item, file));
  exerciseAccumulator[output].push(...normalized);
  totalExercises += normalized.length;
  console.log(`  ✓ ${file} → ${output} (${normalized.length} exercises)`);
}

// Write merged exercise files
for (const [output, exercises] of Object.entries(exerciseAccumulator)) {
  const outPath = path.join(OUTPUT_EXERCISES, output);
  fs.writeFileSync(outPath, JSON.stringify(exercises, null, 2));
  console.log(`  📦 Wrote ${output}: ${exercises.length} exercises`);
}

console.log(`\n  Total exercises: ${totalExercises}\n`);

// Process theory files
let totalChapters = 0;

for (const [file, output] of Object.entries(THEORY_FILES)) {
  const filePath = path.join(SOURCE_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  Missing: ${file}`);
    continue;
  }

  const data = extractData(filePath);
  if (!data) continue;

  const outPath = path.join(OUTPUT_TOPICS, output);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  totalChapters += data.length;
  console.log(`  ✓ ${file} → ${output} (${data.length} chapters)`);
}

console.log(`\n  Total theory chapters: ${totalChapters}`);
console.log('\n✅ Conversion complete!');
