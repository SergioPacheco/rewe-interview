#!/usr/bin/env node
/**
 * Content Validator — ensures every subtopic has Learn and Practice content.
 * Run: node scripts/validate-content.js
 * Wired into: npm run build (pre-build gate)
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '../public/data');
const topicsDir = path.join(dataDir, 'topics');
const exercisesDir = path.join(dataDir, 'exercises');

// Load index
const topics = JSON.parse(fs.readFileSync(path.join(topicsDir, 'index.json'), 'utf-8'));

// Load all theory chapters
const theoryFiles = fs.readdirSync(topicsDir).filter(f => f.startsWith('theory-') && f.endsWith('.json'));
const allChapters = [];
for (const file of theoryFiles) {
  const chapters = JSON.parse(fs.readFileSync(path.join(topicsDir, file), 'utf-8'));
  if (Array.isArray(chapters)) {
    allChapters.push(...chapters);
  }
}

// Load all exercises
const exerciseFiles = fs.readdirSync(exercisesDir).filter(f => f.endsWith('.json'));
const allExercises = [];
for (const file of exerciseFiles) {
  const exercises = JSON.parse(fs.readFileSync(path.join(exercisesDir, file), 'utf-8'));
  if (Array.isArray(exercises)) {
    allExercises.push(...exercises);
  }
}

// Validate
const errors = [];
const warnings = [];

let totalSubtopics = 0;
let coveredLearn = 0;
let coveredPractice = 0;

for (const topic of topics) {
  for (const subtopic of topic.subtopics) {
    totalSubtopics++;

    const chapters = allChapters.filter(
      ch => ch.topic === topic.id && ch.subtopic === subtopic.id
    );

    const questions = allExercises.filter(
      q => q.topic === topic.id && q.subtopic === subtopic.id
    );

    if (chapters.length > 0) coveredLearn++;
    if (questions.length > 0) coveredPractice++;

    if (chapters.length === 0) {
      errors.push(`${topic.id}/${subtopic.id}: missing Learn content (${subtopic.label})`);
    }

    if (questions.length === 0) {
      errors.push(`${topic.id}/${subtopic.id}: missing Practice content (${subtopic.label})`);
    }
  }
}

// Check for orphan chapters (topic/subtopic that doesn't exist in index)
const validSubtopicIds = new Set();
for (const topic of topics) {
  for (const sub of topic.subtopics) {
    validSubtopicIds.add(`${topic.id}/${sub.id}`);
  }
}

const orphanChapters = allChapters.filter(ch =>
  ch.topic && ch.subtopic && !validSubtopicIds.has(`${ch.topic}/${ch.subtopic}`)
);
for (const ch of orphanChapters) {
  warnings.push(`Orphan chapter: ${ch.id} (topic=${ch.topic}, subtopic=${ch.subtopic})`);
}

// Check for duplicate IDs
const chapterIds = allChapters.map(ch => ch.id);
const dupChapters = chapterIds.filter((id, i) => chapterIds.indexOf(id) !== i);
for (const dup of [...new Set(dupChapters)]) {
  errors.push(`Duplicate chapter ID: ${dup}`);
}

const exerciseIds = allExercises.map(q => q.id);
const dupExercises = exerciseIds.filter((id, i) => exerciseIds.indexOf(id) !== i);
for (const dup of [...new Set(dupExercises)]) {
  errors.push(`Duplicate exercise ID: ${dup}`);
}

// Report
const strict = !process.argv.includes('--warn-only');

console.log('📊 Content Validation Report');
console.log('─'.repeat(50));
console.log(`  Topics:     ${topics.length}`);
console.log(`  Subtopics:  ${totalSubtopics}`);
console.log(`  Chapters:   ${allChapters.length}`);
console.log(`  Exercises:  ${allExercises.length}`);
console.log(`  Learn coverage:    ${coveredLearn}/${totalSubtopics} subtopics (${Math.round(100*coveredLearn/totalSubtopics)}%)`);
console.log(`  Practice coverage: ${coveredPractice}/${totalSubtopics} subtopics (${Math.round(100*coveredPractice/totalSubtopics)}%)`);
console.log(`  Mode:       ${strict ? 'STRICT (missing content = error)' : 'WARN-ONLY'}`);
console.log('─'.repeat(50));

if (errors.length > 0) {
  console.log(`\n❌ ERRORS (${errors.length}):`);
  errors.forEach(e => console.log(`  • ${e}`));
}

if (warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
  warnings.forEach(w => console.log(`  • ${w}`));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ All subtopics have Learn and Practice content.');
}

// In strict mode: missing content blocks the build
// In warn-only mode: only structural errors (duplicates) block the build
if (strict && errors.length > 0) {
  console.log(`\n💡 To build with incomplete content, use: npm run build:dev`);
  process.exit(1);
}

// Structural errors always block
const structuralErrors = errors.filter(e => e.startsWith('Duplicate'));
if (structuralErrors.length > 0) {
  process.exit(1);
}

process.exit(0);
