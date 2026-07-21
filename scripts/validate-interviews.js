#!/usr/bin/env node
/**
 * Interview content validator.
 *
 * Guarantees that every indexed subtopic has at least one complete interview
 * question and that question metadata still points to a real topic/subtopic.
 * Run with: node scripts/validate-interviews.js
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '../public/data');
const topicsPath = path.join(dataDir, 'topics', 'index.json');
const interviewsDir = path.join(dataDir, 'interviews');

const difficulties = new Set(['BEGINNER', 'INTERMEDIATE', 'SENIOR']);
const experienceLevels = new Set([
  'PRODUCTION_EXPERIENCE',
  'TRANSFERABLE_EXPERIENCE',
  'STUDIED_NOT_USED',
  'INFERENCE'
]);
const visualBlockTypes = new Set([
  'FLOW',
  'ARCHITECTURE',
  'COMPARISON',
  'SEQUENCE',
  'HIERARCHY'
]);

const errors = [];
const warnings = [];

const readJson = (filePath, label) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`${label}: invalid JSON (${error.message})`);
    return null;
  }
};

const meaningfulString = (value, minimumLength) =>
  typeof value === 'string' && value.trim().length >= minimumLength;

const isPlaceholder = (value) => {
  if (typeof value !== 'string') return false;
  const normalized = value.trim();
  return (
    /^(todo|tbd|coming soon|to be completed|placeholder)$/i.test(normalized) ||
    /^\[(todo|tbd|coming soon|to be completed|placeholder)[^\]]*\]$/i.test(normalized) ||
    /lorem ipsum/i.test(normalized)
  );
};

const validateString = (question, field, minimumLength, label) => {
  const value = question[field];
  if (!meaningfulString(value, minimumLength)) {
    errors.push(`${label}: ${field} must contain at least ${minimumLength} characters`);
  } else if (isPlaceholder(value)) {
    errors.push(`${label}: ${field} contains placeholder content`);
  }
};

const validateStringArray = (value, minimumItems, field, label) => {
  if (!Array.isArray(value) || value.length < minimumItems) {
    errors.push(`${label}: ${field} must contain at least ${minimumItems} items`);
    return;
  }

  value.forEach((item, index) => {
    if (!meaningfulString(item, 3) || isPlaceholder(item)) {
      errors.push(`${label}: ${field}[${index}] must be meaningful text`);
    }
  });
};

const topics = readJson(topicsPath, 'topics/index.json');
if (!Array.isArray(topics)) {
  errors.push('topics/index.json: expected a top-level array');
}

const topicById = new Map();
const validPairs = new Set();
let totalSubtopics = 0;

for (const topic of Array.isArray(topics) ? topics : []) {
  if (!meaningfulString(topic.id, 1)) {
    errors.push('topics/index.json: topic without an id');
    continue;
  }
  if (topicById.has(topic.id)) {
    errors.push(`topics/index.json: duplicate topic id ${topic.id}`);
    continue;
  }

  topicById.set(topic.id, topic);
  const seenSubtopics = new Set();
  for (const subtopic of Array.isArray(topic.subtopics) ? topic.subtopics : []) {
    totalSubtopics++;
    if (!meaningfulString(subtopic.id, 1)) {
      errors.push(`${topic.id}: subtopic without an id`);
      continue;
    }
    if (seenSubtopics.has(subtopic.id)) {
      errors.push(`${topic.id}: duplicate subtopic id ${subtopic.id}`);
    }
    seenSubtopics.add(subtopic.id);
    validPairs.add(`${topic.id}/${subtopic.id}`);
  }
}

const interviewFiles = fs.existsSync(interviewsDir)
  ? fs.readdirSync(interviewsDir).filter(file => file.endsWith('.json')).sort()
  : [];
const allQuestions = [];

for (const file of interviewFiles) {
  const filePath = path.join(interviewsDir, file);
  const fileTopic = path.basename(file, '.json');
  const data = readJson(filePath, `interviews/${file}`);

  if (!topicById.has(fileTopic)) {
    errors.push(`interviews/${file}: filename does not match an indexed topic`);
  }
  if (data !== null && !Array.isArray(data)) {
    errors.push(`interviews/${file}: expected a top-level array`);
    continue;
  }

  for (const question of Array.isArray(data) ? data : []) {
    allQuestions.push({ question, file, fileTopic });
  }
}

for (const topic of topicById.values()) {
  const expectedFile = path.join(interviewsDir, `${topic.id}.json`);
  if (!fs.existsSync(expectedFile)) {
    errors.push(`${topic.id}: missing interviews/${topic.id}.json`);
  }
}

const ids = new Map();
const coverage = new Map();
const normalizedPrompts = new Map();

for (const { question, file, fileTopic } of allQuestions) {
  if (!question || typeof question !== 'object' || Array.isArray(question)) {
    errors.push(`interviews/${file}: question entry must be an object`);
    continue;
  }

  const fallbackId = meaningfulString(question.id, 1) ? question.id : '<missing-id>';
  const label = `interviews/${file}:${fallbackId}`;

  validateString(question, 'id', 3, label);
  validateString(question, 'topic', 1, label);
  validateString(question, 'subtopic', 1, label);
  validateString(question, 'question', 12, label);
  validateString(question, 'shortAnswer', 30, label);
  validateString(question, 'detailedAnswer', 80, label);
  validateStringArray(question.keyPoints, 3, 'keyPoints', label);
  validateStringArray(question.redFlags, 2, 'redFlags', label);

  if (!difficulties.has(question.difficulty)) {
    errors.push(`${label}: unsupported difficulty ${JSON.stringify(question.difficulty)}`);
  }
  if (!experienceLevels.has(question.experienceLevel)) {
    errors.push(`${label}: unsupported or missing experienceLevel ${JSON.stringify(question.experienceLevel)}`);
  }
  if (question.topic !== fileTopic) {
    errors.push(`${label}: topic must match filename topic ${fileTopic}`);
  }

  const pair = `${question.topic}/${question.subtopic}`;
  if (!validPairs.has(pair)) {
    errors.push(`${label}: unknown topic/subtopic pair ${pair}`);
  } else {
    coverage.set(pair, (coverage.get(pair) ?? 0) + 1);
  }

  if (meaningfulString(question.id, 1)) {
    if (ids.has(question.id)) {
      errors.push(`${label}: duplicate id also used in ${ids.get(question.id)}`);
    } else {
      ids.set(question.id, `interviews/${file}`);
    }
  }

  if (!Array.isArray(question.followUps) || question.followUps.length < 2) {
    errors.push(`${label}: followUps must contain at least 2 questions`);
  } else {
    question.followUps.forEach((followUp, index) => {
      if (!followUp || !meaningfulString(followUp.question, 10)) {
        errors.push(`${label}: followUps[${index}].question must be meaningful text`);
      }
      if (followUp?.hint !== undefined && !meaningfulString(followUp.hint, 3)) {
        errors.push(`${label}: followUps[${index}].hint must be meaningful when provided`);
      }
    });
  }

  if (question.realExperience !== undefined) {
    if (!question.realExperience || typeof question.realExperience !== 'object') {
      errors.push(`${label}: realExperience must be an object when provided`);
    } else {
      if (!meaningfulString(question.realExperience.title, 3)) {
        errors.push(`${label}: realExperience.title must be meaningful text`);
      }
      if (!meaningfulString(question.realExperience.description, 20)) {
        errors.push(`${label}: realExperience.description must contain at least 20 characters`);
      }
    }
  }

  for (const [index, example] of (question.codeExamples ?? []).entries()) {
    if (!example || !meaningfulString(example.language, 1) || !meaningfulString(example.code, 10)) {
      errors.push(`${label}: codeExamples[${index}] requires language and code`);
    }
  }

  for (const [index, block] of (question.visualBlocks ?? []).entries()) {
    if (!block || !visualBlockTypes.has(block.type)) {
      errors.push(`${label}: visualBlocks[${index}] has an unsupported type`);
    }
    if (!meaningfulString(block?.title, 3) || !meaningfulString(block?.content, 10)) {
      errors.push(`${label}: visualBlocks[${index}] requires a title and content`);
    }
  }

  if (meaningfulString(question.question, 1)) {
    const normalized = question.question.toLocaleLowerCase('en').replace(/\s+/g, ' ').trim();
    if (normalizedPrompts.has(normalized)) {
      warnings.push(`${label}: duplicate prompt also used by ${normalizedPrompts.get(normalized)}`);
    } else {
      normalizedPrompts.set(normalized, label);
    }
  }
}

for (const pair of validPairs) {
  if (!coverage.has(pair)) {
    errors.push(`${pair}: missing Interview question`);
  }
}

const coveredSubtopics = [...validPairs].filter(pair => coverage.has(pair)).length;
console.log('Interview Content Validation');
console.log('─'.repeat(52));
console.log(`Topics:             ${topicById.size}`);
console.log(`Subtopics covered:  ${coveredSubtopics}/${totalSubtopics}`);
console.log(`Interview files:    ${interviewFiles.length}`);
console.log(`Questions:          ${allQuestions.length}`);
console.log(`Unique IDs:         ${ids.size}`);
console.log('─'.repeat(52));

if (errors.length > 0) {
  console.log(`\nERRORS (${errors.length})`);
  errors.forEach(error => console.log(`- ${error}`));
}
if (warnings.length > 0) {
  console.log(`\nWARNINGS (${warnings.length})`);
  warnings.forEach(warning => console.log(`- ${warning}`));
}
if (errors.length === 0) {
  console.log('\nAll indexed subtopics have complete Interview content.');
}

process.exit(errors.length === 0 ? 0 : 1);
