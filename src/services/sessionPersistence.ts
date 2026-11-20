import {
  ActiveTab,
  DictionaryCategoryFilter,
  LessonTab,
} from '../types';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  readonly length?: number;
  key?(index: number): string | null;
}

export const NAV_STATE_KEY = 'dk_nav_state_v1';
export const THEORY_SLIDES_KEY = 'dk_theory_slides_v1';
export const FLASHCARDS_DRAFT_KEY = 'dk_flashcards_draft_v1';
export const FREE_SESSION_META_KEY = 'dk_free_session_meta_v1';
export const QUIZ_DRAFT_PREFIX = 'dk_quiz_draft_v1_';
export const EXAM_DRAFT_KEY = 'dk_exam_draft_v1';
export const COURSE_EXAM_DRAFT_KEY = 'dk_course_exam_draft_v1';

export interface PersistedNavState {
  activeTab: ActiveTab;
  selectedModuleId: number;
  modulesViewMode: 'list' | 'lesson';
  lessonTab: LessonTab;
  dictionaryCategory: DictionaryCategoryFilter;
  courseBrowsingModuleId: number | null;
}

export const DEFAULT_NAV_STATE: PersistedNavState = {
  activeTab: 'dashboard',
  selectedModuleId: 1,
  modulesViewMode: 'list',
  lessonTab: 'slides',
  dictionaryCategory: 'all',
  courseBrowsingModuleId: null,
};

export interface PersistedFlashcardsDraft {
  moduleId: number;
  queueIds: string[];
  retriedIds: Record<string, boolean>;
  index: number;
}

export interface PersistedFreeSessionMeta {
  key: string;
  title: string;
  subtitle?: string;
  moduleId?: number;
  questionIds: string[];
  requeueFailures: boolean;
}

export interface PersistedQuizDraft {
  queue: Array<{ questionId: string; isRetry: boolean }>;
  currentIndex: number;
  answers: Record<string, boolean | undefined>;
  isSubmitted: boolean;
  history: Array<{ questionId: string; passed: boolean; wasRetry: boolean }>;
  finished: boolean;
  savedAt: number;
}

const VALID_ACTIVE_TABS = new Set<ActiveTab>([
  'dashboard',
  'course',
  'modules',
  'exam',
  'dictionary',
]);
const VALID_LESSON_TABS = new Set<LessonTab>(['slides', 'sheet', 'signs']);
const VALID_DICTIONARY_CATEGORIES = new Set<DictionaryCategoryFilter>([
  'all',
  'term',
  'sign',
  'kontrol',
  'sign_kontrol',
]);

function resolveStorage(storage?: StorageLike): StorageLike | null {
  if (storage) return storage;
  if (typeof localStorage !== 'undefined') return localStorage;
  return null;
}

function isValidModuleId(val: unknown): val is number {
  return typeof val === 'number' && Number.isInteger(val) && val >= 1 && val <= 8;
}

function safeReadJson(key: string, storage?: StorageLike): unknown {
  const store = resolveStorage(storage);
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function safeWriteJson(key: string, value: unknown, storage?: StorageLike): void {
  const store = resolveStorage(storage);
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota / disabled storage errors gracefully
  }
}

function safeRemove(key: string, storage?: StorageLike): void {
  const store = resolveStorage(storage);
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    // Ignore storage errors gracefully
  }
}

export function loadNavState(storage?: StorageLike): PersistedNavState {
  const raw = safeReadJson(NAV_STATE_KEY, storage);
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_NAV_STATE };
  }
  const obj = raw as Partial<PersistedNavState>;

  return {
    activeTab:
      typeof obj.activeTab === 'string' && VALID_ACTIVE_TABS.has(obj.activeTab as ActiveTab)
        ? (obj.activeTab as ActiveTab)
        : DEFAULT_NAV_STATE.activeTab,
    selectedModuleId: isValidModuleId(obj.selectedModuleId)
      ? obj.selectedModuleId
      : DEFAULT_NAV_STATE.selectedModuleId,
    modulesViewMode:
      obj.modulesViewMode === 'list' || obj.modulesViewMode === 'lesson'
        ? obj.modulesViewMode
        : DEFAULT_NAV_STATE.modulesViewMode,
    lessonTab:
      typeof obj.lessonTab === 'string' && VALID_LESSON_TABS.has(obj.lessonTab as LessonTab)
        ? (obj.lessonTab as LessonTab)
        : DEFAULT_NAV_STATE.lessonTab,
    dictionaryCategory:
      typeof obj.dictionaryCategory === 'string' &&
      VALID_DICTIONARY_CATEGORIES.has(obj.dictionaryCategory as DictionaryCategoryFilter)
        ? (obj.dictionaryCategory as DictionaryCategoryFilter)
        : DEFAULT_NAV_STATE.dictionaryCategory,
    courseBrowsingModuleId: isValidModuleId(obj.courseBrowsingModuleId)
      ? obj.courseBrowsingModuleId
      : null,
  };
}

export function saveNavState(patch: Partial<PersistedNavState>, storage?: StorageLike): void {
  const current = loadNavState(storage);
  const merged: PersistedNavState = {
    activeTab:
      typeof patch.activeTab === 'string' && VALID_ACTIVE_TABS.has(patch.activeTab)
        ? patch.activeTab
        : current.activeTab,
    selectedModuleId:
      patch.selectedModuleId !== undefined && isValidModuleId(patch.selectedModuleId)
        ? patch.selectedModuleId
        : current.selectedModuleId,
    modulesViewMode:
      patch.modulesViewMode === 'list' || patch.modulesViewMode === 'lesson'
        ? patch.modulesViewMode
        : current.modulesViewMode,
    lessonTab:
      typeof patch.lessonTab === 'string' && VALID_LESSON_TABS.has(patch.lessonTab)
        ? patch.lessonTab
        : current.lessonTab,
    dictionaryCategory:
      typeof patch.dictionaryCategory === 'string' &&
      VALID_DICTIONARY_CATEGORIES.has(patch.dictionaryCategory)
        ? patch.dictionaryCategory
        : current.dictionaryCategory,
    courseBrowsingModuleId:
      patch.courseBrowsingModuleId === undefined
        ? current.courseBrowsingModuleId
        : isValidModuleId(patch.courseBrowsingModuleId)
          ? patch.courseBrowsingModuleId
          : null,
  };
  safeWriteJson(NAV_STATE_KEY, merged, storage);
}

export function loadAllTheorySlideIndices(storage?: StorageLike): Record<number, number> {
  const raw = safeReadJson(THEORY_SLIDES_KEY, storage);
  if (!raw || typeof raw !== 'object') return {};

  const result: Record<number, number> = {};
  for (let m = 1; m <= 8; m += 1) {
    const val = (raw as Record<string, unknown>)[String(m)];
    if (typeof val === 'number' && Number.isFinite(val) && val >= 0) {
      result[m] = Math.floor(val);
    }
  }
  return result;
}

export function loadTheorySlideIndex(
  moduleId: number,
  slideCount: number,
  storage?: StorageLike
): number {
  if (slideCount <= 0) return 0;
  const all = loadAllTheorySlideIndices(storage);
  const saved = all[moduleId];
  if (typeof saved !== 'number' || !Number.isFinite(saved)) return 0;
  return Math.max(0, Math.min(Math.floor(saved), slideCount - 1));
}

export function saveTheorySlideIndex(
  moduleId: number,
  slideIndex: number,
  storage?: StorageLike
): void {
  if (!isValidModuleId(moduleId)) return;
  const all = loadAllTheorySlideIndices(storage);
  all[moduleId] = Math.max(0, Math.floor(slideIndex));
  safeWriteJson(THEORY_SLIDES_KEY, all, storage);
}

export function clearTheorySlideIndex(moduleId: number, storage?: StorageLike): void {
  const all = loadAllTheorySlideIndices(storage);
  if (!(moduleId in all)) return;
  delete all[moduleId];
  safeWriteJson(THEORY_SLIDES_KEY, all, storage);
}

export function loadFlashcardsDraft(
  moduleId: number,
  validEntryIds: string[],
  storage?: StorageLike
): PersistedFlashcardsDraft | null {
  const raw = safeReadJson(FLASHCARDS_DRAFT_KEY, storage);
  if (!raw || typeof raw !== 'object') return null;

  const obj = raw as Partial<PersistedFlashcardsDraft>;
  if (obj.moduleId !== moduleId) return null;
  if (!Array.isArray(obj.queueIds) || obj.queueIds.length === 0) return null;

  const validSet = new Set(validEntryIds);
  if (!obj.queueIds.every((id) => typeof id === 'string' && validSet.has(id))) {
    return null;
  }

  if (
    typeof obj.index !== 'number' ||
    !Number.isInteger(obj.index) ||
    obj.index < 0 ||
    obj.index >= obj.queueIds.length
  ) {
    return null;
  }

  const retriedIds: Record<string, boolean> = {};
  if (obj.retriedIds && typeof obj.retriedIds === 'object') {
    for (const [k, v] of Object.entries(obj.retriedIds)) {
      if (typeof v === 'boolean' && v) {
        retriedIds[k] = true;
      }
    }
  }

  return {
    moduleId,
    queueIds: [...obj.queueIds],
    retriedIds,
    index: obj.index,
  };
}

export function saveFlashcardsDraft(
  draft: PersistedFlashcardsDraft,
  storage?: StorageLike
): void {
  safeWriteJson(FLASHCARDS_DRAFT_KEY, draft, storage);
}

export function clearFlashcardsDraft(storage?: StorageLike): void {
  safeRemove(FLASHCARDS_DRAFT_KEY, storage);
}

export function loadFreeSessionMeta(storage?: StorageLike): PersistedFreeSessionMeta | null {
  const raw = safeReadJson(FREE_SESSION_META_KEY, storage);
  if (!raw || typeof raw !== 'object') return null;

  const obj = raw as Partial<PersistedFreeSessionMeta>;
  if (typeof obj.key !== 'string' || !obj.key.trim()) return null;
  if (typeof obj.title !== 'string' || !obj.title.trim()) return null;
  if (
    !Array.isArray(obj.questionIds) ||
    obj.questionIds.length === 0 ||
    !obj.questionIds.every((id) => typeof id === 'string' && id.trim().length > 0)
  ) {
    return null;
  }

  return {
    key: obj.key,
    title: obj.title,
    subtitle: typeof obj.subtitle === 'string' ? obj.subtitle : undefined,
    moduleId: isValidModuleId(obj.moduleId) ? obj.moduleId : undefined,
    questionIds: [...obj.questionIds],
    requeueFailures: Boolean(obj.requeueFailures),
  };
}

export function saveFreeSessionMeta(
  meta: PersistedFreeSessionMeta,
  storage?: StorageLike
): void {
  safeWriteJson(FREE_SESSION_META_KEY, meta, storage);
}

export function clearFreeSessionMeta(storage?: StorageLike): void {
  safeRemove(FREE_SESSION_META_KEY, storage);
}

export function loadQuizDraft(
  draftKey: string,
  storage?: StorageLike
): PersistedQuizDraft | null {
  if (!draftKey) return null;
  const raw = safeReadJson(`${QUIZ_DRAFT_PREFIX}${draftKey}`, storage);
  if (!raw || typeof raw !== 'object') return null;

  const obj = raw as Partial<PersistedQuizDraft>;
  if (!Array.isArray(obj.queue) || obj.queue.length === 0) return null;

  const queue: Array<{ questionId: string; isRetry: boolean }> = [];
  for (const item of obj.queue) {
    if (!item || typeof item !== 'object' || typeof item.questionId !== 'string') {
      return null;
    }
    queue.push({ questionId: item.questionId, isRetry: Boolean(item.isRetry) });
  }

  if (
    typeof obj.currentIndex !== 'number' ||
    !Number.isInteger(obj.currentIndex) ||
    obj.currentIndex < 0 ||
    obj.currentIndex >= queue.length
  ) {
    return null;
  }

  if (!obj.answers || typeof obj.answers !== 'object' || Array.isArray(obj.answers)) {
    return null;
  }
  const answers: Record<string, boolean | undefined> = {};
  for (const [k, v] of Object.entries(obj.answers)) {
    if (typeof v === 'boolean') {
      answers[k] = v;
    }
  }

  if (!Array.isArray(obj.history)) return null;
  const history: Array<{ questionId: string; passed: boolean; wasRetry: boolean }> = [];
  for (const h of obj.history) {
    if (!h || typeof h !== 'object' || typeof h.questionId !== 'string') {
      return null;
    }
    history.push({
      questionId: h.questionId,
      passed: Boolean(h.passed),
      wasRetry: Boolean(h.wasRetry),
    });
  }

  return {
    queue,
    currentIndex: obj.currentIndex,
    answers,
    isSubmitted: Boolean(obj.isSubmitted),
    history,
    finished: Boolean(obj.finished),
    savedAt: typeof obj.savedAt === 'number' && Number.isFinite(obj.savedAt) ? obj.savedAt : 0,
  };
}

export function hasResumableQuizDraft(draftKey: string, storage?: StorageLike): boolean {
  const draft = loadQuizDraft(draftKey, storage);
  if (!draft) return false;
  return (
    draft.finished ||
    draft.currentIndex > 0 ||
    draft.isSubmitted ||
    Object.keys(draft.answers).length > 0
  );
}

export function saveQuizDraft(
  draftKey: string,
  draft: PersistedQuizDraft,
  storage?: StorageLike
): void {
  if (!draftKey) return;
  safeWriteJson(`${QUIZ_DRAFT_PREFIX}${draftKey}`, draft, storage);
}

export function clearQuizDraft(draftKey: string, storage?: StorageLike): void {
  if (!draftKey) return;
  safeRemove(`${QUIZ_DRAFT_PREFIX}${draftKey}`, storage);
}

export function clearAllSessionPersistence(storage?: StorageLike): void {
  const store = resolveStorage(storage);
  if (!store) return;

  safeRemove(NAV_STATE_KEY, store);
  safeRemove(THEORY_SLIDES_KEY, store);
  safeRemove(FLASHCARDS_DRAFT_KEY, store);
  safeRemove(FREE_SESSION_META_KEY, store);
  safeRemove(EXAM_DRAFT_KEY, store);
  safeRemove(COURSE_EXAM_DRAFT_KEY, store);

  if (typeof store.length === 'number' && typeof store.key === 'function') {
    try {
      const prefixKeys: string[] = [];
      for (let i = 0; i < store.length; i += 1) {
        const k = store.key(i);
        if (k && k.startsWith(QUIZ_DRAFT_PREFIX)) {
          prefixKeys.push(k);
        }
      }
      for (const k of prefixKeys) {
        safeRemove(k, store);
      }
    } catch {
      // Fallback below
    }
  }

  clearQuizDraft('free_active', store);
  clearQuizDraft('course_review', store);
  clearQuizDraft('course_checkpoint', store);
  for (let m = 1; m <= 8; m += 1) {
    clearQuizDraft(`course_quiz_m${m}`, store);
    clearQuizDraft(`course_fix_m${m}`, store);
  }
}
