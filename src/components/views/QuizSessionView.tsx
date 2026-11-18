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
import { BOX_META, getSRSRecord } from '../../services/srsEngine';
import { LanguageMode, SRSRecord, TeoriQuestion } from '../../types';
import { BilingualText } from '../common/BilingualText';
import { SpeakButton } from '../common/SpeakButton';
import { CarTechnicalSVG } from '../visuals/CarTechnicalSVG';
import { DanishRoadSignSVG, PSkiveSVG } from '../visuals/DanishRoadSignSVG';
import { TrafficSceneSVG } from '../visuals/TrafficSceneSVG';

interface QuizSessionViewProps {
  title: string;
  subtitle?: string;
  moduleId?: number;
  mode?: 'free' | 'course';
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

export const QuizSessionView: React.FC<QuizSessionViewProps> = ({
  title,
  subtitle,
  moduleId,
  mode = 'free',
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
  const [queue, setQueue] = useState<Array<{ question: TeoriQuestion; isRetry: boolean }>>(() =>
    initialQuestions.map((question) => ({ question, isRetry: false }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean | undefined>>({});
  const [submittedRecord, setSubmittedRecord] = useState<SRSRecord | null>(null);
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);
  const [finished, setFinished] = useState(false);

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
          В этой выборке пока нет вопросов.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          В главное меню
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
      .map((h) => h.question);

    const hasNextModule =
      moduleId !== undefined && moduleId < 8 && Boolean(onContinueToNextModule);

    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-slide-up">
        <div className="nordic-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {moduleId ? `Тест Урока ${moduleId} завершён` : 'Тренировка завершена'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{title}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-center dark:border-zinc-800 dark:bg-zinc-950/60">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {passedCount}/{totalCount}
              </div>
              <div className="mt-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Верно с 1-го раза
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-center dark:border-zinc-800 dark:bg-zinc-950/60">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0}%
              </div>
              <div className="mt-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Точность
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-center dark:border-zinc-800 dark:bg-zinc-950/60">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {retriesCount}
              </div>
              <div className="mt-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Повторов ошибок
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Итоги по билетам
            </h3>
            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              {firstPassAttempts.map((item, idx) => {
                const rec = getSRSRecord(srsMap, item.question.id);
                const meta = BOX_META[rec.box];
                return (
                  <div
                    key={`${item.question.id}_${idx}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 px-3 py-2 dark:border-zinc-800"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {item.passed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      )}
                      <span className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                        {languageMode !== 'da_only'
                          ? item.question.situationRu
                          : item.question.situationDa}
                      </span>
                    </div>
                    {mode !== 'course' && (
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badgeClass}`}
                      >
                        Box {rec.box} • {meta.labelRu}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guided Next Step Actions */}
          {mode === 'course' && onCourseFinish ? (
            <div className="mt-6">
              <button
                type="button"
                onClick={() =>
                  onCourseFinish({
                    firstTryScore: passedCount,
                    total: totalCount,
                    failedQuestionIds: failedInThisSession.map((q) => q.id),
                  })
                }
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-500"
              >
                <span>Продолжить</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-2.5">
              {hasNextModule && moduleId !== undefined && onContinueToNextModule && (
                <button
                  type="button"
                  onClick={() => onContinueToNextModule(moduleId + 1)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-500"
                >
                  <span>Перейти к следующему уроку (Урок {moduleId + 1})</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {failedInThisSession.length > 0 && onRestartWithQuestions && (
                <button
                  type="button"
                  onClick={() =>
                    onRestartWithQuestions(
                      moduleId
                        ? `Исправление ошибок Урока ${moduleId}`
                        : 'Повтор билетов с ошибками',
                      `Повторное закрепление (${failedInThisSession.length} вопр.)`,
                      failedInThisSession,
                      moduleId
                    )
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Повторить только билеты с ошибками ({failedInThisSession.length})</span>
                </button>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                {onReturnToLessons && (
                  <button
                    type="button"
                    onClick={onReturnToLessons}
                    className="flex-1 rounded-2xl border border-zinc-200 bg-white py-3 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    К списку уроков
                  </button>
                )}
                <button
                  type="button"
                  onClick={onExit}
                  className="flex-1 rounded-2xl bg-zinc-900 py-3 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 sm:text-sm dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  В главное меню
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentItem = queue[currentIndex];
  const question = currentItem.question;
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
        <CarTechnicalSVG
          key={question.id}
          initialTab={visual.technicalTab ?? 'motorrum'}
          activeHotspot={visual.technicalHotspot}
          languageMode={languageMode}
          compact
        />
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
    <div className="mx-auto max-w-3xl space-y-4 animate-fade-in">
      {/* Top session bar (hidden in course mode to keep focus) */}
      {mode !== 'course' && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Выйти
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
                Повтор Box 1
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
                Повтор ошибки
              </span>
            )}
            <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
              Вопрос {currentIndex + 1} из {queue.length}
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
              label="Озвучить билет"
              title="Прослушать ситуацию и все утверждения подряд"
            />
          </div>
          {mode !== 'course' && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${boxMeta.badgeClass}`}
            >
              Box {currentRecord.box} • {boxMeta.labelRu}
            </span>
          )}
        </div>

        {/* Visual */}
        <div className="mb-4">{renderVisual()}</div>

        {/* Situation description + speech */}
        <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
          <BilingualText
            da={question.situationDa}
            ru={question.situationRu}
            mode={languageMode}
            daClassName="text-sm sm:text-base leading-relaxed"
            ruClassName="text-xs sm:text-sm"
          />
          <SpeakButton id={`sit_${question.id}`} text={question.situationDa} size="md" />
        </div>

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
                      { val: true, da: 'Ja', ru: 'Да' },
                      { val: false, da: 'Nej', ru: 'Нет' },
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
                      <BilingualText
                        da={sq.explanationDa}
                        ru={sq.explanationRu}
                        mode={languageMode}
                        revealInExplanation
                        daClassName="text-xs font-medium"
                        ruClassName="text-xs"
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
              Ответьте на все «Ja / Nej» · Клавиши: <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] dark:bg-zinc-800">1</kbd> Ja /{' '}
              <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] dark:bg-zinc-800">2</kbd> Nej ·{' '}
              <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] dark:bg-zinc-800">Enter</kbd> Проверить
            </span>
            <button
              type="button"
              disabled={!allAnswered}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Проверить ответ
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
                      ? 'Билет полностью верен (+1 балл)!'
                      : 'Ошибка в подпункте — билет не засчитан (0 баллов)'}
                  </div>
                  <div className="mt-0.5 text-xs opacity-90">
                    {isQuestionPassed
                      ? mode === 'course'
                        ? 'Верно! Билет зачтён.'
                        : `Перемещено в Box ${currentRecord.box} (${boxMeta.intervalRu}).`
                      : mode === 'course'
                        ? !currentItem.isRetry
                          ? 'Допущена ошибка — мы вернём этот билет в конце теста.'
                          : 'Разберите пояснение и двигайтесь дальше.'
                        : requeueFailuresInSession && !currentItem.isRetry
                          ? 'Отправлено в Box 1 (Критическая зона) и добавлено на повтор в конце этой сессии.'
                          : 'Отправлено в Box 1 (Критическая зона) для немедленного повторения.'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {currentIndex + 1 < queue.length ? 'Следующий вопрос' : 'Завершить сессию'}
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
                <BilingualText
                  da={question.keyRuleDa}
                  ru={question.keyRuleRu}
                  mode={languageMode}
                  revealInExplanation
                  daClassName="text-xs sm:text-sm font-semibold"
                  ruClassName="text-xs"
                />
                <SpeakButton id={`rule_${question.id}`} text={question.keyRuleDa} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
