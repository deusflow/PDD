import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Layers,
  Play,
  RefreshCw,
  Signpost,
  Zap,
} from 'lucide-react';
import { QUESTIONS_BANK } from '../../data/questionsBank';
import { DICTIONARY_ENTRIES } from '../../data/signsAndGlossary';
import {
  getCourseOverview,
  getDueReviewQuestionsForPassedModules,
} from '../../services/coursePlanner';
import {
  BOX_META,
  computeProgressStats,
  getSRSRecord,
} from '../../services/srsEngine';
import { BoxLevel, TeoriQuestion, UserAppState } from '../../types';

interface DashboardViewProps {
  appState: UserAppState;
  onStartCourse: () => void;
  onStartSmartSession: (count: 10 | 20) => void;
  onStartCustomSession: (title: string, subtitle: string, questions: TeoriQuestion[]) => void;
  onOpenExam: () => void;
  onOpenSignsAndKontrol: () => void;
  onOpenDictionary: () => void;
  onOpenLessonsReference: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  appState,
  onStartCourse,
  onStartSmartSession,
  onStartCustomSession,
  onOpenExam,
  onOpenSignsAndKontrol,
  onOpenDictionary,
  onOpenLessonsReference,
}) => {
  const [showStats, setShowStats] = useState(false);

  const overview = getCourseOverview(appState);
  const dueReviewQuestions = getDueReviewQuestionsForPassedModules(appState);

  const allDatabaseIds = [
    ...QUESTIONS_BANK.map((q) => q.id),
    ...DICTIONARY_ENTRIES.map((d) => d.id),
  ];

  const overallStats = computeProgressStats(allDatabaseIds, appState.srs);
  const questionStats = computeProgressStats(
    QUESTIONS_BANK.map((q) => q.id),
    appState.srs
  );
  const dictionaryStats = computeProgressStats(
    DICTIONARY_ENTRIES.map((d) => d.id),
    appState.srs
  );

  const failedQuestions = QUESTIONS_BANK.filter((q) => getSRSRecord(appState.srs, q.id).box === 1);
  const isFreshUser =
    overview.percent === 0 && overallStats.seenItems === 0 && appState.sessionsCompleted === 0;

  return (
    <div className="mx-auto max-w-4xl space-y-5 animate-fade-in">
      {/* Hero Card: Guided Course */}
      <section className="nordic-card overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{overview.stepLabel}</span>
              </span>

              {dueReviewQuestions.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                  <RefreshCw className="h-3 w-3" />
                  <span>Пора повторить: {dueReviewQuestions.length}</span>
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
                {isFreshUser ? 'Начать обучение по ПДД Дании' : 'Продолжить обучение'}
              </h1>
              <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                {overview.stepDescription}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="h-1.5 w-44 overflow-hidden rounded-full bg-zinc-200 sm:w-56 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-teal-600 transition-all duration-500 dark:bg-teal-400"
                  style={{ width: `${overview.percent}%` }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
                Курс: {overview.percent}% • Уроков: {overview.completedModules}/8
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <button
              type="button"
              onClick={onStartCourse}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-7 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-500 sm:w-auto"
            >
              <span>{isFreshUser ? 'Начать курс' : 'Продолжить курс'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onOpenLessonsReference}
              className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Открыть справочник 8 тем
            </button>
          </div>
        </div>
      </section>

      {/* Secondary Grid: 3 Compact Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* 1. Smart Training */}
        <div className="nordic-card flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                <Zap className="h-5 w-5" />
              </div>
              {failedQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onStartCustomSession(
                      'Исправление ошибок',
                      'Билеты из Box 1, в которых были ошибки',
                      failedQuestions
                    )
                  }
                  className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300"
                >
                  Ошибок: {failedQuestions.length}
                </button>
              )}
            </div>

            <h2 className="mt-3.5 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Умная тренировка
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              10 билетов: система смешает ваши ошибки, повторения и новые вопросы.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onStartSmartSession(10)}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-4 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Тренировка (10 вопр.)</span>
          </button>
        </div>

        {/* 2. Mock Exam */}
        <div className="nordic-card flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium text-zinc-400">25 билетов · 25 мин</span>
            </div>

            <h2 className="mt-3.5 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Пробный экзамен
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Строгий симулятор Teoriprøven: минимум 20 из 25 для сдачи.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenExam}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-4 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <span>Запустить экзамен</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 3. Signs & Dictionary */}
        <div className="nordic-card flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                <Signpost className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium text-zinc-400">
                {DICTIONARY_ENTRIES.length} карточек
              </span>
            </div>

            <h2 className="mt-3.5 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Знаки и словарь
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Дорожные знаки, устные ответы Kontrolprøven и термины с озвучкой.
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onOpenSignsAndKontrol}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-zinc-200/90 bg-white px-3 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Знаки и авто
            </button>
            <button
              type="button"
              onClick={onOpenDictionary}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Словарь
            </button>
          </div>
        </div>
      </section>

      {/* Collapsible Detailed Statistics */}
      <section className="nordic-card overflow-hidden">
        <button
          type="button"
          onClick={() => setShowStats((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-zinc-50/70 dark:hover:bg-zinc-900/70"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <BarChart3 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>
              Подробная статистика · Охват {overallStats.coveragePercent}% · Усвоено{' '}
              {overallStats.masteryPercent}%
            </span>
          </div>
          {showStats ? (
            <ChevronUp className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          )}
        </button>

        {showStats && (
          <div className="space-y-4 border-t border-zinc-200/80 p-5 animate-slide-up dark:border-zinc-800">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/50">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-700 dark:text-zinc-300">Охват базы (Coverage)</span>
                  <span className="text-sky-600 dark:text-sky-400">{overallStats.coveragePercent}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all"
                    style={{ width: `${overallStats.coveragePercent}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Билеты: {questionStats.seenItems}/{questionStats.totalItems}</span>
                  <span>Знаки/Термины/Kontrol: {dictionaryStats.seenItems}/{dictionaryStats.totalItems}</span>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/50">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-700 dark:text-zinc-300">Усвоение (Box 4–5)</span>
                  <span className="text-teal-600 dark:text-teal-400">{overallStats.masteryPercent}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all"
                    style={{ width: `${overallStats.masteryPercent}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Билеты: {questionStats.masteredItems}/{questionStats.totalItems}</span>
                  <span>Карточки: {dictionaryStats.masteredItems}/{dictionaryStats.totalItems}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <Layers className="h-3.5 w-3.5" />
                <span>Коробки запоминания Лейтнера (билеты Teoriprøven)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {([0, 1, 2, 3, 4, 5] as BoxLevel[]).map((box) => {
                  const meta = BOX_META[box];
                  return (
                    <div
                      key={box}
                      className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-950/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                          Box {box}
                        </span>
                        <span className={`h-2 w-2 rounded-full ${meta.colorClass}`} />
                      </div>
                      <div className="mt-0.5 text-lg font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">
                        {questionStats.boxCounts[box]}
                      </div>
                      <div className="truncate text-[10px] text-zinc-500 dark:text-zinc-400">
                        {meta.labelRu}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
