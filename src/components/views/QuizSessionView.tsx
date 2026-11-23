import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  RotateCcw,
  Scale,
  XCircle,
} from 'lucide-react';
import { QUESTIONS_BANK } from '../../data/questionsBank';
import { useUiLang } from '../../i18n/UiLangContext';
import {
  clearQuizDraft,
  loadQuizDraft,
  saveQuizDraft,
} from '../../services/sessionPersistence';
import { BOX_META, getSRSRecord } from '../../services/srsEngine';
import { LanguageMode, SRSRecord, TeoriQuestion } from '../../types';
import { BilingualText } from '../common/BilingualText';
import { SpeakButton } from '../common/SpeakButton';
import { TheoryBilingual } from '../common/TheoryBilingual';
import { CarTechnicalSVG } from '../visuals/CarTechnicalSVG';
import { DanishRoadSignSVG, PSkiveSVG } from '../visuals/DanishRoadSignSVG';
import { TrafficSceneSVG } from '../visuals/TrafficSceneSVG';

interface QuizSessionViewProps {
  title: string;
  subtitle?: string;
  moduleId?: number;
  mode?: 'free' | 'course';
  draftKey?: string;
  initialQuestions: TeoriQuestion[];
  srsMap: Record<string, SRSRecord>;
  languageMode: LanguageMode;
  requeueFailuresInSession?: boolean;
  onRecordResult: (questionId: string, isAllCorrect: boolean) => SRSRecord;
  onCompleteSession: () => void;
  onFreeQuizComplete?: (moduleId: number, firstTryScore: number) => void;
  onCourseFinish?: (result: {
    firstTryScore: number;
    total: number;
    failedQuestionIds: string[];
  }) => void;
  onContinueToNextModule?: (nextModuleId: number) => void;
  onReturnToLessons?: () => void;
  onRestartWithQuestions?: (
    title: string,
    subtitle: string,
    questions: TeoriQuestion[],
    moduleId?: number
  ) => void;
  onExit: () => void;
}

interface SessionHistoryItem {
  question: TeoriQuestion;
  passed: boolean;
  wasRetry: boolean;
}

interface ResolvedQuizInit {
  queue: Array<{ question: TeoriQuestion; isRetry: boolean }>;
  currentIndex: number;
  answers: Record<string, boolean | undefined>;
  submittedRecord: SRSRecord | null;
  history: SessionHistoryItem[];
  finished: boolean;
}

function resolveInitialQuizState(
  draftKey: string | undefined,
  initialQuestions: TeoriQuestion[],
  moduleId: number | undefined,
  srsMap: Record<string, SRSRecord>
): ResolvedQuizInit {
  const fallback: ResolvedQuizInit = {
    queue: initialQuestions.map((question) => ({ question, isRetry: false })),
    currentIndex: 0,
    answers: {},
    submittedRecord: null,
    history: [],
    finished: false,
  };

  if (!draftKey || initialQuestions.length === 0) return fallback;
  const draft = loadQuizDraft(draftKey);
  if (!draft) return fallback;

  const bankById = new Map(QUESTIONS_BANK.map((q) => [q.id, q]));
  const initialIdSet = new Set(initialQuestions.map((q) => q.id));

  const restoredQueue: Array<{ question: TeoriQuestion; isRetry: boolean }> = [];
  for (const item of draft.queue) {
    const q = bankById.get(item.questionId);
    if (!q) return fallback;
    if (moduleId !== undefined && !initialIdSet.has(q.id)) {
      return fallback;
    }
    restoredQueue.push({ question: q, isRetry: item.isRetry });
  }
  if (restoredQueue.length === 0) return fallback;

  const safeIndex = Math.min(Math.max(0, draft.currentIndex), restoredQueue.length - 1);
  const restoredHistory: SessionHistoryItem[] = [];
  for (const h of draft.history) {
    const q = bankById.get(h.questionId);
    if (q) {
      restoredHistory.push({ question: q, passed: h.passed, wasRetry: h.wasRetry });
    }
  }

  const activeQ = restoredQueue[safeIndex].question;
  const submittedRecord = draft.isSubmitted ? getSRSRecord(srsMap, activeQ.id) : null;

  return {
    queue: restoredQueue,
    currentIndex: safeIndex,
    answers: draft.answers,
    submittedRecord,
    history: restoredHistory,
    finished: draft.finished,
  };
}

export const QuizSessionView: React.FC<QuizSessionViewProps> = ({
  title,
  subtitle,
  moduleId,
  mode = 'free',
  draftKey,
  initialQuestions,
  srsMap,
  languageMode,
  requeueFailuresInSession = true,
  onRecordResult,
  onCompleteSession,
  onFreeQuizComplete,
  onCourseFinish,
  onContinueToNextModule,
  onReturnToLessons,
  onRestartWithQuestions,
  onExit,
}) => {
  const { uiLang, pick, getQuestion } = useUiLang();
  const [initialQuiz] = useState<ResolvedQuizInit>(() =>
    resolveInitialQuizState(draftKey, initialQuestions, moduleId, srsMap)
  );
  const [queue, setQueue] = useState<Array<{ question: TeoriQuestion; isRetry: boolean }>>(
    initialQuiz.queue
  );
  const [currentIndex, setCurrentIndex] = useState(initialQuiz.currentIndex);
  const [answers, setAnswers] = useState<Record<string, boolean | undefined>>(initialQuiz.answers);
  const [submittedRecord, setSubmittedRecord] = useState<SRSRecord | null>(
    initialQuiz.submittedRecord
  );
  const [history, setHistory] = useState<SessionHistoryItem[]>(initialQuiz.history);
  const [finished, setFinished] = useState(initialQuiz.finished);

  useEffect(() => {
    if (!draftKey || queue.length === 0) return;
    saveQuizDraft(draftKey, {
      queue: queue.map((item) => ({ questionId: item.question.id, isRetry: item.isRetry })),
      currentIndex,
      answers,
      isSubmitted: submittedRecord !== null,
      history: history.map((h) => ({
        questionId: h.question.id,
        passed: h.passed,
        wasRetry: h.wasRetry,
      })),
      finished,
      savedAt: Date.now(),
    });
  }, [draftKey, queue, currentIndex, answers, submittedRecord, history, finished]);

  const handleExitWithCleanup = () => {
    if (draftKey) clearQuizDraft(draftKey);
    onExit();
  };

  const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {});

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      keyHandlerRef.current(e);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (queue.length === 0) {
    keyHandlerRef.current = () => {};
    return (
      <div className="nordic-card mx-auto max-w-2xl p-8 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {pick('В этой выборке пока нет вопросов.', 'У цій вибірці поки що немає питань.')}
        </p>
        <button
          type="button"
          onClick={handleExitWithCleanup}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {pick('В главное меню', 'До головного меню')}
        </button>
      </div>
    );
  }

  if (finished) {
    keyHandlerRef.current = () => {};
    const firstPassAttempts = history.filter((h) => !h.wasRetry);
    const passedCount = firstPassAttempts.filter((h) => h.passed).length;
    const totalCount = firstPassAttempts.length;
    const retriesCount = history.filter((h) => h.wasRetry).length;
    const failedInThisSession = firstPassAttempts
      .filter((h) => !h.passed)
      .map((h) => getQuestion(h.question));

    const hasNextModule =
      moduleId !== undefined && moduleId < 8 && Boolean(onContinueToNextModule);

    return (
      <div className="mx-auto max-w-5xl space-y-6 animate-slide-up">
        <div className="nordic-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/70 pb-5 dark:border-zinc-800">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-100">
                  {moduleId
                    ? pick(`Тест Урока ${moduleId} завершён`, `Тест Уроку ${moduleId} завершено`)
                    : pick('Тренировка завершена', 'Тренування завершено')}
                </h2>
                <p className="text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">{title}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="space-y-5 lg:col-span-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-center dark:border-zinc-800 dark:bg-zinc-950/60">
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {passedCount}/{totalCount}
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {pick('Верно с 1-го раза', 'Правильно з 1-го разу')}
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-center dark:border-zinc-800 dark:bg-zinc-950/60">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0}%
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {pick('Точность', 'Точність')}
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-center dark:border-zinc-800 dark:bg-zinc-950/60">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {retriesCount}
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {pick('Повторов ошибок', 'Повторів помилок')}
                  </div>
                </div>
              </div>

              {/* Guided Next Step Actions */}
              {mode === 'course' && onCourseFinish ? (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (draftKey) clearQuizDraft(draftKey);
                      onCourseFinish({
                        firstTryScore: passedCount,
                        total: totalCount,
                        failedQuestionIds: failedInThisSession.map((q) => q.id),
                      });
                    }}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-500"
                  >
                    <span>{pick('Продолжить', 'Продовжити')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {hasNextModule && moduleId !== undefined && onContinueToNextModule && (
                    <button
                      type="button"
                      onClick={() => {
                        if (draftKey) clearQuizDraft(draftKey);
                        onContinueToNextModule(moduleId + 1);
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-500"
                    >
                      <span>{pick(`Перейти к следующему уроку (Урок ${moduleId + 1})`, `Перейти до наступного уроку (Урок ${moduleId + 1})`)}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  {failedInThisSession.length > 0 && onRestartWithQuestions && (
                    <button
                      type="button"
                      onClick={() => {
                        if (draftKey) clearQuizDraft(draftKey);
                        onRestartWithQuestions(
                          moduleId
                            ? pick(`Исправление ошибок Урока ${moduleId}`, `Виправлення помилок Уроку ${moduleId}`)
                            : pick('Повтор билетов с ошибками', 'Повтор білетів із помилками'),
                          `${pick('Повторное закрепление', 'Повторне закріплення')} (${failedInThisSession.length} ${pick('вопр.', 'пит.')})`,
                          failedInThisSession,
                          moduleId
                        );
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>{pick('Повторить только билеты с ошибками', 'Повторити лише білети з помилками')} ({failedInThisSession.length})</span>
                    </button>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row">
                    {onReturnToLessons && (
                      <button
                        type="button"
                        onClick={() => {
                          if (draftKey) clearQuizDraft(draftKey);
                          onReturnToLessons();
                        }}
                        className="flex-1 rounded-2xl border border-zinc-200 bg-white py-3 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        {pick('К списку уроков', 'До списку уроків')}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleExitWithCleanup}
                      className="flex-1 rounded-2xl bg-zinc-900 py-3 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 sm:text-sm dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      {pick('В главное меню', 'До головного меню')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2.5 lg:col-span-7">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {pick('Итоги по билетам', 'Підсумки за білетами')} ({firstPassAttempts.length})
              </h3>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1 lg:max-h-[420px]">
                {firstPassAttempts.map((item, idx) => {
                  const localizedQ = getQuestion(item.question);
                  const rec = getSRSRecord(srsMap, localizedQ.id);
                  const meta = BOX_META[rec.box];
                  return (
                    <div
                      key={`${localizedQ.id}_${idx}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 px-3.5 py-2.5 dark:border-zinc-800"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        {item.passed ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                        )}
                        <span className="truncate text-xs font-medium text-zinc-800 sm:text-sm dark:text-zinc-200">
                          {languageMode !== 'da_only'
                            ? localizedQ.situationRu
                            : localizedQ.situationDa}
                        </span>
                      </div>
                      {mode !== 'course' && (
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badgeClass}`}
                        >
                          Box {rec.box} • {uiLang === 'uk' ? meta.labelUk : meta.labelRu}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = queue[currentIndex];
  const question = getQuestion(currentItem.question);
  const currentRecord = submittedRecord ?? getSRSRecord(srsMap, question.id);
  const boxMeta = BOX_META[currentRecord.box];

  const allAnswered = question.subQuestions.every((sq) => answers[sq.id] !== undefined);
  const focusedSubIdx = question.subQuestions.findIndex((sq) => answers[sq.id] === undefined);
  const isSubmitted = submittedRecord !== null;
  const isQuestionPassed =
    isSubmitted &&
    question.subQuestions.every((sq) => answers[sq.id] === sq.correctAnswer);

  const handleSelectAnswer = (subId: string, val: boolean) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [subId]: val }));
  };

  const handleSubmit = () => {
    if (!allAnswered || isSubmitted) return;
    const passed = question.subQuestions.every((sq) => answers[sq.id] === sq.correctAnswer);
    const nextRec = onRecordResult(question.id, passed);
    setSubmittedRecord(nextRec);
    setHistory((prev) => [
      ...prev,
      { question, passed, wasRetry: currentItem.isRetry },
    ]);

    // Immediate Box 1 repeat within the same session (once per failed item)
    if (!passed && requeueFailuresInSession && !currentItem.isRetry) {
      setQueue((prev) => [...prev, { question, isRetry: true }]);
    }
  };

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((i) => i + 1);
      setAnswers({});
      setSubmittedRecord(null);
    } else {
      onCompleteSession();
      if (mode === 'free' && moduleId !== undefined && onFreeQuizComplete) {
        const firstPassCorrect = history.filter((h) => !h.wasRetry && h.passed).length;
        onFreeQuizComplete(moduleId, firstPassCorrect);
      }
      setFinished(true);
    }
  };

  keyHandlerRef.current = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (!isSubmitted && focusedSubIdx !== -1) {
      if (k === '1' || k === 'j') {
        e.preventDefault();
        handleSelectAnswer(question.subQuestions[focusedSubIdx].id, true);
        return;
      }
      if (k === '2' || k === 'n') {
        e.preventDefault();
        handleSelectAnswer(question.subQuestions[focusedSubIdx].id, false);
        return;
      }
    }
    if (e.key === 'Enter') {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'BUTTON') return;
      e.preventDefault();
      if (!isSubmitted && allAnswered) {
        handleSubmit();
      } else if (isSubmitted) {
        handleNext();
      }
    }
  };

  const renderVisual = () => {
    const { visual } = question;
    if (visual.type === 'sign' && visual.signCode) {
      return (
        <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl border border-zinc-200 bg-zinc-50 py-6 dark:border-zinc-800 dark:bg-zinc-950/60">
          <DanishRoadSignSVG code={visual.signCode} subPlaque={visual.subPlaque} size={136} />
          {visual.signCode === 'E33' && <PSkiveSVG size={118} />}
        </div>
      );
    }

    if (visual.type === 'technical') {
      return (
        <div className="space-y-3">
          {visual.imageSrc && visual.technicalTab !== 'motorrum' && (
            <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-900 dark:border-zinc-800">
              <img
                src={visual.imageSrc}
                alt={question.situationRu}
                loading="lazy"
                className="aspect-[16/9] w-full object-cover object-center"
              />
            </div>
          )}
          <CarTechnicalSVG
            key={question.id}
            initialTab={visual.technicalTab ?? 'motorrum'}
            activeHotspot={visual.technicalHotspot}
            languageMode={languageMode}
            compact
            lockedTab
          />
        </div>
      );
    }

    return (
      <TrafficSceneSVG
        presetId={visual.presetId}
        imageSrc={visual.imageSrc}
        signCode={visual.signCode}
        subPlaque={visual.subPlaque}
        maneuverBadge={isSubmitted ? visual.maneuverBadge : undefined}
        hideHints={!isSubmitted}
      />
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 animate-fade-in">
      {/* Top session bar (hidden in course mode to keep focus) */}
      {mode !== 'course' && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleExitWithCleanup}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {pick('Выйти', 'Вийти')}
          </button>

          <div className="text-center">
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
            {subtitle && (
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{subtitle}</div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentItem.isRetry && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <RotateCcw className="h-3 w-3" />
                {pick('Повтор Box 1', 'Повтор Box 1')}
              </span>
            )}
            <span className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1 text-xs font-bold tabular-nums text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              {currentIndex + 1} / {queue.length}
            </span>
          </div>
        </div>
      )}

      {mode === 'course' && (
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{title}</span>
          <div className="flex items-center gap-2">
            {currentItem.isRetry && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {pick('Повтор ошибки', 'Повтор помилки')}
              </span>
            )}
            <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
              {pick('Вопрос', 'Питання')} {currentIndex + 1} {pick('из', 'із')} {queue.length}
            </span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-teal-600 transition-all duration-300 dark:bg-teal-400"
          style={{ width: `${((currentIndex + (isSubmitted ? 1 : 0)) / queue.length) * 100}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="nordic-card overflow-hidden p-4 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="nordic-pill">Урок {question.moduleId}</span>
            <SpeakButton
              id={`quiz_all_${question.id}`}
              text={question.situationDa}
              sequence={[
                question.situationDa,
                ...question.subQuestions.map((s, i) => `${i + 1}. ${s.da}`),
              ]}
              label={pick('Озвучить билет', 'Озвучити білет')}
              title={pick('Прослушать ситуацию и все утверждения подряд', 'Прослухати ситуацію та всі твердження поспіль')}
            />
          </div>
          {mode !== 'course' && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${boxMeta.badgeClass}`}
            >
              Box {currentRecord.box} • {uiLang === 'uk' ? boxMeta.labelUk : boxMeta.labelRu}
            </span>
          )}
        </div>

        {/* Desktop 2-column Cockpit (Visual + Situation on left, Ja/Nej decisions on right) */}
        <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
          <div className="space-y-4 lg:sticky lg:top-20 lg:col-span-7">
            {/* Visual */}
            <div>{renderVisual()}</div>

            {/* Situation description + speech */}
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
              <BilingualText
                da={question.situationDa}
                ru={question.situationRu}
                mode={languageMode}
                daClassName="text-sm sm:text-base leading-relaxed"
                ruClassName="text-xs sm:text-sm"
              />
              <SpeakButton id={`sit_${question.id}`} text={question.situationDa} size="md" />
            </div>
          </div>

          <div className="lg:col-span-5">
            {/* Sub-questions (Ja / Nej) */}
            <div className="space-y-3">
          {question.subQuestions.map((sq, idx) => {
            const chosen = answers[sq.id];
            const isCorrectSub = isSubmitted && chosen === sq.correctAnswer;
            const isWrongSub = isSubmitted && chosen !== sq.correctAnswer;
            const isActiveFocus = !isSubmitted && idx === focusedSubIdx;

            return (
              <div
                key={sq.id}
                className={`rounded-2xl border p-3.5 transition-all sm:p-4 ${
                  isSubmitted
                    ? isCorrectSub
                      ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-900/70 dark:bg-emerald-950/25'
                      : 'border-rose-300 bg-rose-50/60 dark:border-rose-900/70 dark:bg-rose-950/30'
                    : isActiveFocus
                      ? 'border-teal-400 bg-white ring-2 ring-teal-500/20 dark:border-teal-700 dark:bg-zinc-900'
                      : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[11px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <BilingualText
                        da={sq.da}
                        ru={sq.ru}
                        mode={languageMode}
                        daClassName="text-sm leading-snug"
                        ruClassName="text-xs"
                      />
                    </div>
                    <SpeakButton id={`sq_${sq.id}`} text={sq.da} />
                  </div>

                  {/* Ja / Nej toggles */}
                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
                    {[
                      { val: true, da: 'Ja', ru: pick('Да', 'Так') },
                      { val: false, da: 'Nej', ru: pick('Нет', 'Ні') },
                    ].map((btn) => {
                      const selected = chosen === btn.val;
                      const isTargetCorrect = isSubmitted && sq.correctAnswer === btn.val;

                      let btnStyle =
                        'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200';
                      if (selected && !isSubmitted) {
                        btnStyle =
                          'border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900';
                      } else if (isSubmitted && isTargetCorrect) {
                        btnStyle =
                          'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500';
                      } else if (isSubmitted && selected && !isTargetCorrect) {
                        btnStyle =
                          'border-rose-600 bg-rose-600 text-white dark:border-rose-500 dark:bg-rose-500';
                      } else if (isSubmitted) {
                        btnStyle =
                          'border-zinc-200 bg-zinc-100 text-zinc-400 opacity-60 dark:border-zinc-800 dark:bg-zinc-900';
                      }

                      return (
                        <button
                          key={String(btn.val)}
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => handleSelectAnswer(sq.id, btn.val)}
                          className={`min-w-[68px] rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${btnStyle}`}
                        >
                          {btn.da}
                          {languageMode === 'both' ? ` / ${btn.ru}` : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation shown after submission (always includes Russian in breakdown) */}
                {isSubmitted && (
                  <div className="mt-3 flex items-start justify-between gap-2 border-t border-zinc-200/70 pt-2.5 dark:border-zinc-800">
                    <div className="flex items-start gap-2">
                      {isWrongSub ? (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                      ) : (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      )}
                      <TheoryBilingual
                        ru={sq.explanationRu}
                        da={sq.explanationDa}
                        mode={languageMode === 'da_only' ? 'both' : languageMode}
                        compact
                        ruClassName="text-xs font-medium leading-relaxed"
                      />
                    </div>
                    <SpeakButton id={`exp_${sq.id}`} text={sq.explanationDa} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit or Post-answer Law Reference & Next */}
        {!isSubmitted ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {pick('Ответьте на все «Ja / Nej» · Клавиши:', 'Відповідайте на всі «Ja / Nej» · Клавіші:')} <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] dark:bg-zinc-800">1</kbd> Ja /{' '}
              <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] dark:bg-zinc-800">2</kbd> Nej ·{' '}
              <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] dark:bg-zinc-800">Enter</kbd> {pick('Проверить', 'Перевірити')}
            </span>
            <button
              type="button"
              disabled={!allAnswered}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {pick('Проверить ответ', 'Перевірити відповідь')}
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-3 animate-slide-up">
            {/* Overall ticket verdict banner */}
            <div
              className={`flex flex-col justify-between gap-2 rounded-2xl border p-4 sm:flex-row sm:items-center ${
                isQuestionPassed
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200'
                  : 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {isQuestionPassed ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                )}
                <div>
                  <div className="text-sm font-bold">
                    {isQuestionPassed
                      ? pick('Билет полностью верен (+1 балл)!', 'Білет повністю правильний (+1 бал)!')
                      : pick('Ошибка в подпункте — билет не засчитан (0 баллов)', 'Помилка в підпункті — білет не зараховано (0 балів)')}
                  </div>
                  <div className="mt-0.5 text-xs opacity-90">
                    {isQuestionPassed
                      ? mode === 'course'
                        ? pick('Верно! Билет зачтён.', 'Правильно! Білет зараховано.')
                        : `${pick('Перемещено в', 'Переміщено в')} Box ${currentRecord.box} (${uiLang === 'uk' ? boxMeta.intervalUk : boxMeta.intervalRu}).`
                      : mode === 'course'
                        ? !currentItem.isRetry
                          ? pick('Допущена ошибка — мы вернём этот билет в конце теста.', 'Допущено помилку — ми повернемо цей білет наприкінці тесту.')
                          : pick('Разберите пояснение и двигайтесь дальше.', 'Розберіть пояснення і рухайтеся далі.')
                        : requeueFailuresInSession && !currentItem.isRetry
                          ? pick('Отправлено в Box 1 (Критическая зона) и добавлено на повтор в конце этой сессии.', 'Відправлено в Box 1 (Критична зона) і додано на повтор наприкінці цієї сесії.')
                          : pick('Отправлено в Box 1 (Критическая зона) для немедленного повторения.', 'Відправлено в Box 1 (Критична зона) для негайного повторення.')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {currentIndex + 1 < queue.length
                  ? pick('Следующий вопрос', 'Наступне питання')
                  : pick('Завершить сессию', 'Завершити сесію')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Key Rule & Law Reference */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/60">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <Scale className="h-3.5 w-3.5" />
                <span>{question.lawReference}</span>
              </div>
              <div className="mt-1.5 flex items-start justify-between gap-2">
                <TheoryBilingual
                  ru={question.keyRuleRu}
                  da={question.keyRuleDa}
                  mode={languageMode === 'da_only' ? 'both' : languageMode}
                  compact
                  ruClassName="text-xs sm:text-sm font-semibold leading-relaxed"
                />
                <SpeakButton id={`rule_${question.id}`} text={question.keyRuleDa} />
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};
