import assert from 'node:assert/strict';
import test from 'node:test';
import { QUESTIONS_BANK } from '../src/data/questionsBank';
import {
  BOX_INTERVALS_MS,
  buildExamQuestions,
  buildHardcoreExamQuestions,
  buildSmartSession,
  computeProgressStats,
  updateSRSRecord,
} from '../src/services/srsEngine';
import { SRSRecord } from '../src/types';

test('updateSRSRecord advances from Box 0 -> Box 2 -> 3 -> 4 -> 5 and resets to Box 1 on mistake', () => {
  const t0 = 1_700_000_000_000;

  // Box 0 -> Box 2 on first correct
  const r1 = updateSRSRecord(undefined, 'q1', true, t0);
  assert.equal(r1.box, 2);
  assert.equal(r1.totalAttempts, 1);
  assert.equal(r1.totalFailures, 0);
  assert.equal(r1.nextReviewAt, t0 + BOX_INTERVALS_MS[2]);

  // Box 2 -> 3 -> 4 -> 5
  const r2 = updateSRSRecord(r1, 'q1', true, t0 + 1000);
  assert.equal(r2.box, 3);
  const r3 = updateSRSRecord(r2, 'q1', true, t0 + 2000);
  assert.equal(r3.box, 4);
  const r4 = updateSRSRecord(r3, 'q1', true, t0 + 3000);
  assert.equal(r4.box, 5);
  assert.equal(r4.streak, 4);

  // Strict reset back to Box 1 from Box 5 on mistake
  const rFail = updateSRSRecord(r4, 'q1', false, t0 + 4000);
  assert.equal(rFail.box, 1);
  assert.equal(rFail.streak, 0);
  assert.equal(rFail.totalAttempts, 5);
  assert.equal(rFail.totalFailures, 1);
});

test('computeProgressStats tracks coverage, mastery, and dueCount accurately', () => {
  const now = 1_700_000_000_000;
  const ids = ['a', 'b', 'c', 'd'];
  const srs: Record<string, SRSRecord> = {
    a: {
      id: 'a',
      box: 1,
      streak: 0,
      lastReviewedAt: now - 1000,
      nextReviewAt: now - 1000,
      totalAttempts: 1,
      totalFailures: 1,
    },
    b: {
      id: 'b',
      box: 3,
      streak: 2,
      lastReviewedAt: now - 100_000,
      nextReviewAt: now - 100, // due
      totalAttempts: 2,
      totalFailures: 0,
    },
    c: {
      id: 'c',
      box: 5,
      streak: 4,
      lastReviewedAt: now - 1000,
      nextReviewAt: now + 999_999, // not due
      totalAttempts: 4,
      totalFailures: 0,
    },
  };

  const stats = computeProgressStats(ids, srs, now);
  assert.equal(stats.totalItems, 4);
  assert.equal(stats.seenItems, 3);
  assert.equal(stats.masteredItems, 1);
  assert.equal(stats.coveragePercent, 75);
  assert.equal(stats.masteryPercent, 25);
  assert.equal(stats.failedCount, 1);
  assert.equal(stats.dueCount, 2); // 'a' (Box 1) + 'b' (due Box 3)
  assert.equal(stats.boxCounts[0], 1);
});

test('buildSmartSession prioritizes Box 1 failures before due Box 2-3 and unseen Box 0', () => {
  const now = 1_700_000_000_000;
  const sample = QUESTIONS_BANK.slice(0, 6);
  const srs: Record<string, SRSRecord> = {
    [sample[2].id]: {
      id: sample[2].id,
      box: 1,
      streak: 0,
      lastReviewedAt: now,
      nextReviewAt: now,
      totalAttempts: 2,
      totalFailures: 2,
    },
    [sample[4].id]: {
      id: sample[4].id,
      box: 2,
      streak: 1,
      lastReviewedAt: now - 100_000,
      nextReviewAt: now - 1,
      totalAttempts: 1,
      totalFailures: 0,
    },
  };

  const picked = buildSmartSession(sample, srs, 4, now);
  assert.equal(picked.length, 4);
  assert.equal(picked[0].id, sample[2].id);
  assert.equal(picked[1].id, sample[4].id);
});

test('buildExamQuestions returns 25 unique questions spanning all 8 modules', () => {
  const exam = buildExamQuestions(QUESTIONS_BANK, 25);
  assert.equal(exam.length, 25);
  const uniqueIds = new Set(exam.map((q) => q.id));
  assert.equal(uniqueIds.size, 25);
  const coveredModules = new Set(exam.map((q) => q.moduleId));
  assert.equal(coveredModules.size, 8);
});

test('buildExamQuestions prioritizes Box 1 / unseen questions over Box 5 when srsMap is supplied', () => {
  const now = 1_700_000_000_000;
  const srs: Record<string, SRSRecord> = {};
  for (const q of QUESTIONS_BANK) {
    srs[q.id] = {
      id: q.id,
      box: 5,
      streak: 5,
      lastReviewedAt: now,
      nextReviewAt: now + 999_999,
      totalAttempts: 5,
      totalFailures: 0,
    };
  }
  const priorityTarget = QUESTIONS_BANK.find((q) => q.moduleId === 1)!;
  srs[priorityTarget.id] = {
    id: priorityTarget.id,
    box: 1,
    streak: 0,
    lastReviewedAt: now,
    nextReviewAt: now,
    totalAttempts: 1,
    totalFailures: 1,
  };

  const exam = buildExamQuestions(QUESTIONS_BANK, 25, srs);
  assert.ok(exam.some((q) => q.id === priorityTarget.id));
});

test('buildHardcoreExamQuestions prioritizes Box 1 and trap modules cleanly', () => {
  const now = 1_700_000_000_000;
  const srs: Record<string, SRSRecord> = {};
  for (const q of QUESTIONS_BANK) {
    srs[q.id] = {
      id: q.id,
      box: 5,
      streak: 5,
      lastReviewedAt: now,
      nextReviewAt: now + 999_999,
      totalAttempts: 5,
      totalFailures: 0,
    };
  }
  const trapFail = QUESTIONS_BANK.find((q) => q.id === 'q_m8_21')!;
  srs[trapFail.id] = {
    id: trapFail.id,
    box: 1,
    streak: 0,
    lastReviewedAt: now,
    nextReviewAt: now,
    totalAttempts: 3,
    totalFailures: 3,
  };

  const hardcore = buildHardcoreExamQuestions(QUESTIONS_BANK, 25, srs);
  assert.equal(hardcore.length, 25);
  assert.equal(new Set(hardcore.map((q) => q.id)).size, 25);
  assert.ok(hardcore.some((q) => q.id === trapFail.id));
});
