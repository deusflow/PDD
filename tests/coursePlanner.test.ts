import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COURSE_REVIEW_THRESHOLD,
  REQUIRED_MOCK_EXAM_STREAK,
  canModulePass,
  getCourseOverview,
  getModulePassThreshold,
  getModuleQuestions,
  getNextCourseStep,
} from '../src/services/coursePlanner';
import { updateSRSRecord } from '../src/services/srsEngine';
import { StorageManager } from '../src/services/storage';
import { UserAppState } from '../src/types';

function freshState(): UserAppState {
  return StorageManager.load();
}

test('fresh state starts at Module 1 theory with 0% progress', () => {
  const state = freshState();
  const step = getNextCourseStep(state);
  assert.equal(step.kind, 'theory');
  if (step.kind === 'theory') {
    assert.equal(step.moduleId, 1);
  }
  const overview = getCourseOverview(state);
  assert.equal(overview.percent, 0);
  assert.equal(overview.completedModules, 0);
});

test('module progression flows theory -> flashcards -> quiz -> fix -> pass', () => {
  const state = freshState();
  const m1 = state.course.modules[1];

  // After theory -> flashcards
  m1.theoryCompleted = true;
  let step = getNextCourseStep(state);
  assert.equal(step.kind, 'flashcards');

  // After flashcards -> quiz (all 18 questions)
  m1.flashcardsCompleted = true;
  step = getNextCourseStep(state);
  assert.equal(step.kind, 'quiz');
  if (step.kind === 'quiz') {
    assert.equal(step.questions.length, getModuleQuestions(1).length);
  }

  // Simulate 1 failed question -> fix step before module can pass
  const qs = getModuleQuestions(1);
  const threshold = getModulePassThreshold(1);
  assert.equal(threshold, Math.ceil(qs.length * 0.75)); // 14 out of 18
  state.srs[qs[0].id] = updateSRSRecord(undefined, qs[0].id, false);
  m1.quizAttempts = 1;
  m1.bestFirstTryScore = threshold;
  assert.equal(canModulePass(m1, state.srs, 1), false);

  step = getNextCourseStep(state);
  assert.equal(step.kind, 'fix');
  if (step.kind === 'fix') {
    assert.equal(step.questions.length, 1);
    assert.equal(step.questions[0].id, qs[0].id);
  }

  // Fixing the Box 1 failure unlocks passing
  state.srs[qs[0].id] = updateSRSRecord(state.srs[qs[0].id], qs[0].id, true);
  assert.equal(canModulePass(m1, state.srs, 1), true);
});

test('checkpoint triggers after module 4 before module 5 theory', () => {
  const state = freshState();
  for (let m = 1; m <= 4; m += 1) {
    state.course.modules[m].theoryCompleted = true;
    state.course.modules[m].flashcardsCompleted = true;
    state.course.modules[m].passed = true;
  }

  const step = getNextCourseStep(state);
  assert.equal(step.kind, 'checkpoint');
  if (step.kind === 'checkpoint') {
    assert.deepEqual(step.moduleIds, [1, 2, 3, 4]);
    assert.equal(step.questions.length, 12);
  }
});

test('spaced repetition review triggers before starting a new module when due >= threshold', () => {
  const now = 1_700_000_000_000;
  const state = freshState();
  state.course.modules[1].theoryCompleted = true;
  state.course.modules[1].flashcardsCompleted = true;
  state.course.modules[1].passed = true;

  const m1Qs = getModuleQuestions(1);
  for (let i = 0; i < COURSE_REVIEW_THRESHOLD; i += 1) {
    state.srs[m1Qs[i].id] = {
      id: m1Qs[i].id,
      box: 2,
      streak: 1,
      lastReviewedAt: now - 10_000_000,
      nextReviewAt: now - 1000,
      totalAttempts: 1,
      totalFailures: 0,
    };
  }

  const step = getNextCourseStep(state, now);
  assert.equal(step.kind, 'review');
  if (step.kind === 'review') {
    assert.equal(step.questions.length, COURSE_REVIEW_THRESHOLD);
  }
});

test('completing all 8 modules, checkpoint, and required mock exams reaches 100% and ready state', () => {
  const state = freshState();
  for (let m = 1; m <= 8; m += 1) {
    state.course.modules[m].theoryCompleted = true;
    state.course.modules[m].flashcardsCompleted = true;
    state.course.modules[m].passed = true;
  }
  state.course.checkpointMidPassed = true;

  let step = getNextCourseStep(state);
  assert.equal(step.kind, 'mock_exam');

  state.course.mockExamStreak = REQUIRED_MOCK_EXAM_STREAK;
  step = getNextCourseStep(state);
  assert.equal(step.kind, 'ready');

  const overview = getCourseOverview(state);
  assert.equal(overview.percent, 100);
  assert.equal(overview.completedModules, 8);
});
