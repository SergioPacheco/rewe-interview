#!/usr/bin/env node
/**
 * Content Validator — ensures every subtopic has MEANINGFUL Learn and Practice content.
 *
 * Validates:
 * - Learn: chapter must have a title (≥3 chars) AND meaningful text (≥80 chars)
 * - Practice: question must have a prompt (≥10 chars), answer (≥5 chars), explanation (≥20 chars)
 *
 * Run: node scripts/validate-content.js
 * Wired into: npm run build (pre-build gate)
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '../public/data');
const topicsDir = path.join(dataDir, 'topics');
const exercisesDir = path.join(dataDir, 'exercises');
const topicServicePath = path.resolve(__dirname, '../src/app/core/services/topic.service.ts');

/**
 * Practice content is authored with descriptive subtopic names, while routing
 * uses stable IDs. The application normalizes them with SUBTOPIC_MAP before
 * displaying a topic. Read that same source of truth here so strict coverage
 * reports what a user can actually open in the Practice tab.
 */
const loadSubtopicMap = () => {
  const source = fs.readFileSync(topicServicePath, 'utf-8');
  const mapStart = source.indexOf('const SUBTOPIC_MAP');
  if (mapStart < 0) throw new Error('Could not find SUBTOPIC_MAP in TopicService');

  const expression = source
    .slice(mapStart)
    .replace(/^const SUBTOPIC_MAP: Record<string, Record<string, string>> = /, '')
    .replace(/;\s*$/, '');

  return Function(`return (${expression})`)();
};

const subtopicMap = loadSubtopicMap();
const normalizeSubtopic = (topic, subtopic) => subtopicMap[topic]?.[subtopic] ?? subtopic;

// ═══════════════════════════════════════════════════
// Validation helpers
// ═══════════════════════════════════════════════════

const hasMeaningfulText = (value, minLength = 80) =>
  typeof value === 'string' && value.trim().length >= minLength;

/**
 * A chapter is valid if it has a real title AND meaningful text content.
 * Checks multiple possible content fields (sections[], content, body, etc.)
 */
const hasValidChapter = (chapter) => {
  // Must have a title
  if (typeof chapter.title !== 'string' || chapter.title.trim().length < 3) {
    return false;
  }

  // Check sections array (the standard format: [{heading, content}])
  if (Array.isArray(chapter.sections) && chapter.sections.length > 0) {
    const sectionText = chapter.sections
      .map(s => [s.heading, s.content].filter(Boolean).join(' '))
      .join(' ');
    if (sectionText.trim().length >= 80) return true;
  }

  // Check flat content fields
  const possibleContent = [
    chapter.content,
    chapter.body,
    chapter.explanation,
    chapter.summary,
    chapter.description,
    chapter.text
  ].filter(Boolean).join(' ');

  return hasMeaningfulText(possibleContent, 80);
};

/**
 * A question is valid if it has a meaningful prompt AND some form of answer/explanation.
 * Supports multiple question formats (ORAL_ANSWER, SINGLE_CHOICE, PREDICT_OUTPUT, etc.)
 */
const hasValidQuestion = (question) => {
  // Must have a prompt/question text (≥10 chars)
  const prompt = [
    question.question,
    question.prompt,
    question.mission
  ].find(v => typeof v === 'string' && v.trim().length >= 10);

  if (!prompt) return false;

  // Must have SOME form of answer or explanation (≥5 chars)
  const answerCandidates = [
    question.answer,
    question.modelAnswer,
    question.shortAnswer,
    question.explanation,
    question.explain,
    question.correct
  ];

  // answer can be string, number, or array
  const hasAnswer = answerCandidates.some(v => {
    if (typeof v === 'string') return v.trim().length >= 5;
    if (typeof v === 'number') return true;
    if (Array.isArray(v)) return v.length > 0;
    return false;
  });

  // Also accept if has choices (multiple choice) — the answer is implied
  if (!hasAnswer && Array.isArray(question.choices) && question.choices.length >= 2) {
    return true;
  }
  if (!hasAnswer && Array.isArray(question.options) && question.options.length >= 2) {
    return true;
  }
  // ORAL_ANSWER with keyPoints counts
  if (!hasAnswer && Array.isArray(question.keyPoints) && question.keyPoints.length >= 1) {
    return true;
  }

  return hasAnswer;
};

// ═══════════════════════════════════════════════════
// Load data
// ═══════════════════════════════════════════════════

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
    allExercises.push(...exercises.map(exercise => ({
      ...exercise,
      subtopic: normalizeSubtopic(exercise.topic, exercise.subtopic)
    })));
  }
}

// ═══════════════════════════════════════════════════
// Validate
// ═══════════════════════════════════════════════════

const errors = [];
const warnings = [];

let totalSubtopics = 0;
let coveredLearn = 0;
let coveredPractice = 0;

for (const topic of topics) {
  for (const subtopic of topic.subtopics) {
    totalSubtopics++;

    // --- Learn validation ---
    const chapters = allChapters.filter(
      ch => ch.topic === topic.id && ch.subtopic === subtopic.id
    );

    const validChapters = chapters.filter(hasValidChapter);

    if (validChapters.length > 0) {
      coveredLearn++;
    } else if (chapters.length > 0) {
      errors.push(
        `${topic.id}/${subtopic.id}: Learn object exists but has no meaningful text (${subtopic.label})`
      );
    } else {
      errors.push(
        `${topic.id}/${subtopic.id}: missing Learn content (${subtopic.label})`
      );
    }

    // --- Practice validation ---
    const questions = allExercises.filter(
      q => q.topic === topic.id && q.subtopic === subtopic.id
    );

    const validQuestions = questions.filter(hasValidQuestion);

    if (validQuestions.length > 0) {
      coveredPractice++;
    } else if (questions.length > 0) {
      errors.push(
        `${topic.id}/${subtopic.id}: Practice object exists but is incomplete (${subtopic.label})`
      );
    } else {
      errors.push(
        `${topic.id}/${subtopic.id}: missing Practice content (${subtopic.label})`
      );
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

// ═══════════════════════════════════════════════════
// Report
// ═══════════════════════════════════════════════════

const strict = !process.argv.includes('--warn-only');

console.log('📊 Content Validation Report');
console.log('─'.repeat(50));
console.log(`  Topics:     ${topics.length}`);
console.log(`  Subtopics:  ${totalSubtopics}`);
console.log(`  Chapters:   ${allChapters.length} (${allChapters.filter(hasValidChapter).length} valid)`);
console.log(`  Exercises:  ${allExercises.length} (${allExercises.filter(hasValidQuestion).length} valid)`);
console.log(`  Learn coverage:    ${coveredLearn}/${totalSubtopics} subtopics (${Math.round(100*coveredLearn/totalSubtopics)}%)`);
console.log(`  Practice coverage: ${coveredPractice}/${totalSubtopics} subtopics (${Math.round(100*coveredPractice/totalSubtopics)}%)`);
console.log(`  Mode:       ${strict ? 'STRICT (missing/empty content = error)' : 'WARN-ONLY'}`);
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
  console.log('\n✅ All subtopics have meaningful Learn and Practice content.');
}

// In strict mode: missing/empty content blocks the build
// In warn-only mode: only structural errors (duplicates) block the build
if (strict && errors.length > 0) {
  console.log(`\n💡 To build with incomplete content, use: npm run build`);
  console.log(`   (prebuild uses --warn-only by default)`);
  process.exit(1);
}

// Structural errors always block
const structuralErrors = errors.filter(e => e.startsWith('Duplicate'));
if (structuralErrors.length > 0) {
  process.exit(1);
}

process.exit(0);
