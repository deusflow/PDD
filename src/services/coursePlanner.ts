import { MODULES_DATA } from '../data/modulesData';
import { QUESTIONS_BANK } from '../data/questionsBank';
import { DICTIONARY_ENTRIES } from '../data/signsAndGlossary';
import {
  CourseState,
  DictionaryEntry,
  ModuleCourseProgress,
  SRSRecord,
  TeoriQuestion,
  UserAppState,
} from '../types';
import { getSRSRecord } from './srsEngine';
import { createEmptyModuleProgress } from './storage';

export const COURSE_MIN_PASS_RATIO = 0.75; // 75% first-try accuracy (e.g. 6/8, 10/13)
export const CHECKPOINT_MIN_PASS_SCORE = 10; // out of 12
export const COURSE_REVIEW_THRESHOLD = 3;
export const COURSE_REVIEW_MAX_QUESTIONS = 8;
export const COURSE_FLASHCARDS_MAX = 8;
export const REQUIRED_MOCK_EXAM_STREAK = 2;

export function getModulePassThreshold(moduleId: number): number {
  const total = getModuleQuestions(moduleId).length;
  return total === 0 ? 0 : Math.ceil(total * COURSE_MIN_PASS_RATIO);
}

export type CourseStep =
  | { kind: 'review'; questions: TeoriQuestion[]; reason: string }
  | { kind: 'theory'; moduleId: number }
  | { kind: 'flashcards'; moduleId: number; entryIds: string[] }
  | { kind: 'quiz'; moduleId: number; questions: TeoriQuestion[] }
  | { kind: 'fix'; moduleId: number; questions: TeoriQuestion[] }
  | { kind: 'checkpoint'; moduleIds: number[]; questions: TeoriQuestion[] }
  | { kind: 'mock_exam' }
  | { kind: 'ready' };

export interface CourseOverview {
  currentModuleId: number;
  completedModules: number;
  percent: number;
  stepLabel: string;
  stepDescription: string;
}

export function getModuleProgress(course: CourseState, moduleId: number): ModuleCourseProgress {
  return course?.modules?.[moduleId] ?? createEmptyModuleProgress();
}

export function getModuleQuestions(moduleId: number): TeoriQuestion[] {
  return QUESTIONS_BANK.filter((q) => q.moduleId === moduleId);
}

export function getModuleFailedQuestions(
  srsMap: Record<string, SRSRecord>,
  moduleId: number
): TeoriQuestion[] {
  return getModuleQuestions(moduleId).filter((q) => getSRSRecord(srsMap, q.id).box === 1);
}

export function canModulePass(
  progress: ModuleCourseProgress,
  srsMap: Record<string, SRSRecord>,
  moduleId: number
): boolean {
  const failed = getModuleFailedQuestions(srsMap, moduleId);
  return progress.bestFirstTryScore >= getModulePassThreshold(moduleId) && failed.length === 0;
}

function pluralizeQuestions(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'вопрос';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'вопроса';
  return 'вопросов';
}

function getCategoryWeight(category: DictionaryEntry['category']): number {
  if (category === 'kontrol') return 0;
  if (category === 'sign') return 1;
  return 2;
}

export function getPendingFlashcardIdsForModule(
  srsMap: Record<string, SRSRecord>,
  moduleId: number
): string[] {
  return DICTIONARY_ENTRIES.filter((d) => {
    if (d.moduleId !== moduleId) return false;
    return getSRSRecord(srsMap, d.id).box < 4;
  })
    .sort((a, b) => getCategoryWeight(a.category) - getCategoryWeight(b.category))
    .slice(0, COURSE_FLASHCARDS_MAX)
    .map((d) => d.id);
}

export function shuffleItems<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getDueReviewQuestionsForPassedModules(
  state: UserAppState,
  now: number = Date.now()
): TeoriQuestion[] {
  const passedModuleIds = new Set<number>();
  for (let m = 1; m <= 8; m += 1) {
    if (getModuleProgress(state.course, m).passed) {
      passedModuleIds.add(m);
    }
  }
  if (passedModuleIds.size === 0) return [];

  const box1: TeoriQuestion[] = [];
  const dueBox23: TeoriQuestion[] = [];

  for (const q of QUESTIONS_BANK) {
    if (!passedModuleIds.has(q.moduleId)) continue;
    const rec = getSRSRecord(state.srs, q.id);
    if (rec.box === 1) {
      box1.push(q);
    } else if ((rec.box === 2 || rec.box === 3) && (rec.nextReviewAt ?? 0) <= now) {
      dueBox23.push(q);
    }
  }

  dueBox23.sort((a, b) => {
    const na = getSRSRecord(state.srs, a.id).nextReviewAt ?? 0;
    const nb = getSRSRecord(state.srs, b.id).nextReviewAt ?? 0;
    return na - nb;
  });

  return [...box1, ...dueBox23];
}

function buildCheckpointQuestions(srsMap: Record<string, SRSRecord>): TeoriQuestion[] {
  const moduleIds = [1, 2, 3, 4];
  const selected: TeoriQuestion[] = [];
  for (const mId of moduleIds) {
    const qs = getModuleQuestions(mId);
    // Prioritize Box 1 or lower box questions, then shuffle remaining
    const sorted = [...qs].sort((a, b) => {
      const ba = getSRSRecord(srsMap, a.id).box;
      const bb = getSRSRecord(srsMap, b.id).box;
      if (ba === 1 && bb !== 1) return -1;
      if (bb === 1 && ba !== 1) return 1;
      return ba - bb;
    });
    const topPool = sorted.slice(0, 5);
    selected.push(...shuffleItems(topPool).slice(0, 3));
  }
  return shuffleItems(selected);
}

export function getNextCourseStep(state: UserAppState, now: number = Date.now()): CourseStep {
  let firstUnpassedModuleId: number | null = null;
  for (let m = 1; m <= 8; m += 1) {
    if (!getModuleProgress(state.course, m).passed) {
      firstUnpassedModuleId = m;
      break;
    }
  }

  // 3. Checkpoint after modules 1-4 and before module 5 theory
  if (
    (firstUnpassedModuleId === null || firstUnpassedModuleId >= 5) &&
    !state.course.checkpointMidPassed
  ) {
    return {
      kind: 'checkpoint',
      moduleIds: [1, 2, 3, 4],
      questions: buildCheckpointQuestions(state.srs),
    };
  }

  if (firstUnpassedModuleId !== null) {
    const m = firstUnpassedModuleId;
    const prog = getModuleProgress(state.course, m);
    const isStarted = prog.theoryCompleted || prog.flashcardsCompleted || prog.quizAttempts > 0;

    // 1. Review before starting theory of a NEW module (never in the middle of an active lesson)
    if (!isStarted && m > 1) {
      const dueReview = getDueReviewQuestionsForPassedModules(state, now);
      if (dueReview.length >= COURSE_REVIEW_THRESHOLD) {
        const picked = dueReview.slice(0, COURSE_REVIEW_MAX_QUESTIONS);
        return {
          kind: 'review',
          questions: picked,
          reason: `Перед Уроком ${m} закрепим ${picked.length} ${pluralizeQuestions(picked.length)}, которые пора повторить`,
        };
      }
    }

    // 2. Active module progression
    if (!prog.theoryCompleted) {
      return { kind: 'theory', moduleId: m };
    }

    if (!prog.flashcardsCompleted) {
      const entryIds = getPendingFlashcardIdsForModule(state.srs, m);
      if (entryIds.length > 0) {
        return { kind: 'flashcards', moduleId: m, entryIds };
      }
    }

    const modQuestions = getModuleQuestions(m);
    if (prog.quizAttempts === 0) {
      return {
        kind: 'quiz',
        moduleId: m,
        questions: shuffleItems(modQuestions),
      };
    }

    const failedInModule = getModuleFailedQuestions(state.srs, m);
    if (failedInModule.length > 0) {
      return {
        kind: 'fix',
        moduleId: m,
        questions: failedInModule,
      };
    }

    // No Box 1 errors left, but score was < 6
    return {
      kind: 'quiz',
      moduleId: m,
      questions: shuffleItems(modQuestions),
    };
  }

  // 4. All 8 modules passed -> Mock exams until 3 consecutive passes
  if (state.course.mockExamStreak < REQUIRED_MOCK_EXAM_STREAK) {
    return { kind: 'mock_exam' };
  }

  return { kind: 'ready' };
}

export function getCourseOverview(state: UserAppState, now: number = Date.now()): CourseOverview {
  let completedModules = 0;
  let firstUnpassed = 8;
  let foundUnpassed = false;

  // 8 modules * 10% + checkpoint 6% + 2 mock exams * 7% = 100%
  let rawPercent = 0;

  for (let m = 1; m <= 8; m += 1) {
    const prog = getModuleProgress(state.course, m);
    if (prog.passed) {
      completedModules += 1;
      rawPercent += 10;
    } else {
      if (!foundUnpassed) {
        firstUnpassed = m;
        foundUnpassed = true;
      }
      if (prog.theoryCompleted) rawPercent += 2;
      if (prog.flashcardsCompleted) rawPercent += 2;
      if (prog.quizAttempts > 0) rawPercent += 2;
    }
  }

  if (state.course.checkpointMidPassed) rawPercent += 6;
  rawPercent += Math.min(REQUIRED_MOCK_EXAM_STREAK, state.course.mockExamStreak) * 7;

  const percent = Math.min(100, Math.round(rawPercent));
  const nextStep = getNextCourseStep(state, now);

  let stepLabel = 'Курс пройден';
  let stepDescription = `Все уроки и ${REQUIRED_MOCK_EXAM_STREAK} пробных экзамена успешно сданы.`;

  switch (nextStep.kind) {
    case 'review':
      stepLabel = `Повторение · ${nextStep.questions.length} ${pluralizeQuestions(nextStep.questions.length)}`;
      stepDescription = nextStep.reason;
      break;
    case 'theory': {
      const mod = MODULES_DATA.find((x) => x.id === nextStep.moduleId);
      stepLabel = `Урок ${nextStep.moduleId} · Теория`;
      stepDescription = mod
        ? `Изучите ключевые правила темы «${mod.titleRu}».`
        : 'Короткая лекция перед практикой.';
      break;
    }
    case 'flashcards':
      stepLabel = `Урок ${nextStep.moduleId} · Карточки`;
      stepDescription = `Закрепите ${nextStep.entryIds.length} важных терминов и знаков темы.`;
      break;
    case 'quiz': {
      const mod = MODULES_DATA.find((x) => x.id === nextStep.moduleId);
      const minScore = getModulePassThreshold(nextStep.moduleId);
      stepLabel = `Урок ${nextStep.moduleId} · Тест (${nextStep.questions.length} вопр.)`;
      stepDescription = mod
        ? `Проверьте знания по теме «${mod.titleRu}» (нужно ≥ ${minScore} из ${nextStep.questions.length}).`
        : 'Тест по изученной теме.';
      break;
    }
    case 'fix':
      stepLabel = `Урок ${nextStep.moduleId} · Работа над ошибками`;
      stepDescription = `Исправьте ${nextStep.questions.length} ${pluralizeQuestions(nextStep.questions.length)}, чтобы закрыть урок.`;
      break;
    case 'checkpoint':
      stepLabel = 'Контрольная · Уроки 1–4';
      stepDescription = '12 смешанных билетов по первым четырём темам (нужно ≥ 10).';
      break;
    case 'mock_exam':
      stepLabel = `Пробный экзамен · ${state.course.mockExamStreak + 1} из ${REQUIRED_MOCK_EXAM_STREAK}`;
      stepDescription = `Сдайте ${REQUIRED_MOCK_EXAM_STREAK} экзамена подряд (≥ 20/25), чтобы подтвердить полную готовность.`;
      break;
    case 'ready':
      stepLabel = 'Вы готовы к Teoriprøven';
      stepDescription = 'Весь курс пройден: поддерживайте форму пробными экзаменами.';
      break;
  }

  return {
    currentModuleId: firstUnpassed,
    completedModules,
    percent,
    stepLabel,
    stepDescription,
  };
}
