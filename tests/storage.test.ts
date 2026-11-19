import assert from 'node:assert/strict';
import test from 'node:test';
import { StorageManager } from '../src/services/storage';
import { updateSRSRecord } from '../src/services/srsEngine';

test('encodeSyncString and decodeSyncString round-trip course, srs (12+ score), and preferences', () => {
  const state = StorageManager.load();
  state.languageMode = 'spoiler';
  state.theme = 'dark';
  state.sessionsCompleted = 7;
  state.srs['q_m1_1'] = updateSRSRecord(undefined, 'q_m1_1', true, 1_700_000_000_000);
  state.course.modules[1] = {
    theoryCompleted: true,
    flashcardsCompleted: true,
    quizAttempts: 1,
    bestFirstTryScore: 11,
    passed: true,
    passedAt: 1_700_000_000_000,
  };
  state.course.checkpointMidPassed = true;
  state.course.mockExamStreak = 2;

  const code = StorageManager.encodeSyncString(state);
  assert.ok(code.startsWith('DKK1:'));

  const decoded = StorageManager.decodeSyncString(code);
  assert.equal(decoded.languageMode, 'spoiler');
  assert.equal(decoded.theme, 'dark');
  assert.equal(decoded.sessionsCompleted, 7);
  assert.equal(decoded.srs['q_m1_1'].box, 2);
  assert.equal(decoded.course.modules[1].bestFirstTryScore, 11);
  assert.equal(decoded.course.modules[1].passed, true);
  assert.equal(decoded.course.checkpointMidPassed, true);
  assert.equal(decoded.course.mockExamStreak, 2);
});

test('decodeSyncString throws clear errors on invalid sync codes', () => {
  assert.throws(() => StorageManager.decodeSyncString('INVALID:abc'));
  assert.throws(() => StorageManager.decodeSyncString('DKK1:not-valid-base64-json'));
});

test('importFromJson migrates missing course fields cleanly without throwing', () => {
  const legacyPayload = JSON.stringify({
    version: 1,
    hasSeenOnboarding: true,
    languageMode: 'da_only',
    theme: 'light',
    srs: {},
    examHistory: [],
    sessionsCompleted: 3,
  });

  const migrated = StorageManager.importFromJson(legacyPayload);
  assert.equal(migrated.languageMode, 'da_only');
  assert.equal(migrated.sessionsCompleted, 3);
  assert.equal(Object.keys(migrated.course.modules).length, 8);
  assert.equal(migrated.course.modules[1].passed, false);
});

test('v1 state remaps old modules 3/4/5 to new progressive M3(signs)/M4(priority)/M5(users) and preserves 25/25 scores', () => {
  const base = StorageManager.load();
  base.version = 1;
  base.course.modules[3].passed = true; // old Priority
  base.course.modules[3].bestFirstTryScore = 24;
  base.course.modules[5].passed = true; // old Signs
  base.course.modules[5].bestFirstTryScore = 25;

  const migrated = StorageManager.importFromJson(JSON.stringify(base));
  assert.equal(migrated.version, 2);
  assert.equal(migrated.course.modules[3].bestFirstTryScore, 25); // new M3 Signs
  assert.equal(migrated.course.modules[4].bestFirstTryScore, 24); // new M4 Priority
  assert.equal(migrated.course.modules[5].passed, false); // new M5 Users
});
