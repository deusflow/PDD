import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clearAllSessionPersistence,
  clearFlashcardsDraft,
  clearFreeSessionMeta,
  clearQuizDraft,
  clearTheorySlideIndex,
  COURSE_EXAM_DRAFT_KEY,
  DEFAULT_NAV_STATE,
  EXAM_DRAFT_KEY,
  hasResumableQuizDraft,
  loadAllTheorySlideIndices,
  loadFlashcardsDraft,
  loadFreeSessionMeta,
  loadNavState,
  loadQuizDraft,
  loadTheorySlideIndex,
  saveFlashcardsDraft,
  saveFreeSessionMeta,
  saveNavState,
  saveQuizDraft,
  saveTheorySlideIndex,
  StorageLike,
} from '../src/services/sessionPersistence';

function createMemoryStorage(): StorageLike & { keys: () => string[] } {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    keys() {
      return Array.from(store.keys());
    },
  };
}

test('loadNavState and saveNavState persist valid UI location and sanitize invalid inputs', () => {
  const storage = createMemoryStorage();
  assert.deepEqual(loadNavState(storage), DEFAULT_NAV_STATE);

  saveNavState(
    {
      activeTab: 'modules',
      selectedModuleId: 4,
      modulesViewMode: 'lesson',
      lessonTab: 'sheet',
      dictionaryCategory: 'sign_kontrol',
      courseBrowsingModuleId: 2,
    },
    storage
  );

  assert.deepEqual(loadNavState(storage), {
    activeTab: 'modules',
    selectedModuleId: 4,
    modulesViewMode: 'lesson',
    lessonTab: 'sheet',
    dictionaryCategory: 'sign_kontrol',
    courseBrowsingModuleId: 2,
  });

  // Corrupted JSON or invalid ranges fall back safely
  storage.setItem(
    'dk_nav_state_v1',
    JSON.stringify({
      activeTab: 'unknown_tab',
      selectedModuleId: 99,
      modulesViewMode: 'invalid',
      lessonTab: 'bad_tab',
      dictionaryCategory: 'bad_cat',
      courseBrowsingModuleId: 0,
    })
  );
  assert.deepEqual(loadNavState(storage), DEFAULT_NAV_STATE);
});

test('theory slide persistence tracks each module independently, clamps bounds, and clears on completion', () => {
  const storage = createMemoryStorage();
  assert.equal(loadTheorySlideIndex(3, 10, storage), 0);

  saveTheorySlideIndex(3, 6, storage);
  saveTheorySlideIndex(5, 2, storage);

  assert.equal(loadTheorySlideIndex(3, 10, storage), 6);
  // Clamps if slide count shrinks
  assert.equal(loadTheorySlideIndex(3, 4, storage), 3);
  assert.equal(loadTheorySlideIndex(5, 10, storage), 2);

  clearTheorySlideIndex(3, storage);
  assert.equal(loadTheorySlideIndex(3, 10, storage), 0);
  assert.equal(loadTheorySlideIndex(5, 10, storage), 2);
  assert.deepEqual(loadAllTheorySlideIndices(storage), { 5: 2 });
});

test('flashcards draft persistence validates moduleId and entryIds cleanly', () => {
  const storage = createMemoryStorage();
  const validIds = ['d1', 'd2', 'd3'];

  saveFlashcardsDraft(
    {
      moduleId: 2,
      queueIds: ['d1', 'd2', 'd3', 'd1'],
      retriedIds: { d1: true },
      index: 2,
    },
    storage
  );

  const restored = loadFlashcardsDraft(2, validIds, storage);
  assert.ok(restored);
  assert.equal(restored.index, 2);
  assert.deepEqual(restored.queueIds, ['d1', 'd2', 'd3', 'd1']);
  assert.equal(restored.retriedIds['d1'], true);

  // Different module or missing entryId rejects stale draft
  assert.equal(loadFlashcardsDraft(3, validIds, storage), null);
  assert.equal(loadFlashcardsDraft(2, ['d1', 'd2'], storage), null);

  clearFlashcardsDraft(storage);
  assert.equal(loadFlashcardsDraft(2, validIds, storage), null);
});

test('quiz draft and free session meta round-trip and distinguish resumable progress', () => {
  const storage = createMemoryStorage();

  saveFreeSessionMeta(
    {
      key: 'smart_123',
      title: 'Умная тренировка (10 вопр.)',
      subtitle: 'Тест',
      moduleId: 4,
      questionIds: ['q_m4_1', 'q_m4_2'],
      requeueFailures: true,
    },
    storage
  );
  const meta = loadFreeSessionMeta(storage);
  assert.ok(meta);
  assert.equal(meta.moduleId, 4);
  assert.deepEqual(meta.questionIds, ['q_m4_1', 'q_m4_2']);

  saveQuizDraft(
    'course_quiz_m4',
    {
      queue: [
        { questionId: 'q_m4_1', isRetry: false },
        { questionId: 'q_m4_2', isRetry: false },
      ],
      currentIndex: 0,
      answers: {},
      isSubmitted: false,
      history: [],
      finished: false,
      savedAt: 1000,
    },
    storage
  );
  assert.equal(hasResumableQuizDraft('course_quiz_m4', storage), false);

  saveQuizDraft(
    'course_quiz_m4',
    {
      queue: [
        { questionId: 'q_m4_1', isRetry: false },
        { questionId: 'q_m4_2', isRetry: false },
      ],
      currentIndex: 1,
      answers: { q_m4_2_a: true },
      isSubmitted: false,
      history: [{ questionId: 'q_m4_1', passed: true, wasRetry: false }],
      finished: false,
      savedAt: 2000,
    },
    storage
  );
  assert.equal(hasResumableQuizDraft('course_quiz_m4', storage), true);
  const loadedDraft = loadQuizDraft('course_quiz_m4', storage);
  assert.equal(loadedDraft?.currentIndex, 1);
  assert.equal(loadedDraft?.answers['q_m4_2_a'], true);

  clearFreeSessionMeta(storage);
  clearQuizDraft('course_quiz_m4', storage);
  assert.equal(loadFreeSessionMeta(storage), null);
  assert.equal(loadQuizDraft('course_quiz_m4', storage), null);
});

test('clearAllSessionPersistence removes nav, slides, flashcards, quizzes, and exam drafts', () => {
  const storage = createMemoryStorage();

  saveNavState({ activeTab: 'modules', selectedModuleId: 7 }, storage);
  saveTheorySlideIndex(7, 4, storage);
  saveFlashcardsDraft(
    { moduleId: 7, queueIds: ['d1'], retriedIds: {}, index: 0 },
    storage
  );
  saveFreeSessionMeta(
    { key: 's', title: 't', questionIds: ['q1'], requeueFailures: false },
    storage
  );
  saveQuizDraft(
    'free_active',
    {
      queue: [{ questionId: 'q1', isRetry: false }],
      currentIndex: 0,
      answers: { q1_a: true },
      isSubmitted: true,
      history: [],
      finished: false,
      savedAt: 1,
    },
    storage
  );
  storage.setItem(EXAM_DRAFT_KEY, '{"questionIds":["q1"]}');
  storage.setItem(COURSE_EXAM_DRAFT_KEY, '{"questionIds":["q2"]}');

  clearAllSessionPersistence(storage);
  assert.equal(storage.keys().length, 0);
});
