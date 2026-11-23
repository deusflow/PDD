import React, { Suspense, lazy, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Hash,
  Layers,
  Play,
  RefreshCw,
  Signpost,
  Wrench,
  Zap,
} from 'lucide-react';
import { useUiLang } from '../../i18n/UiLangContext';
import {
  getCourseOverview,
  getDueReviewQuestionsForPassedModules,
} from '../../services/coursePlanner';
import {
  BOX_META,
  buildSmartSession,
  computeProgressStats,
  getSRSRecord,
} from '../../services/srsEngine';
import { BoxLevel, TeoriQuestion, UserAppState } from '../../types';

const KontrolSimulatorModal = lazy(() =>
  import('./KontrolSimulatorModal').then((m) => ({ default: m.KontrolSimulatorModal }))
);
const QuickNumbersModal = lazy(() =>
  import('./QuickNumbersModal').then((m) => ({ default: m.QuickNumbersModal }))
);

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
  const { uiLang, pick, modules, questions, dictionary } = useUiLang();
  const [showStats, setShowStats] = useState(false);
  const [isNumbersOpen, setIsNumbersOpen] = useState(false);
  const [isKontrolOpen, setIsKontrolOpen] = useState(false);

  const overview = getCourseOverview(appState, Date.now(), uiLang, modules);
  const dueReviewQuestions = getDueReviewQuestionsForPassedModules(appState);

  const allDatabaseIds = [
    ...questions.map((q) => q.id),
    ...dictionary.map((d) => d.id),
  ];

  const overallStats = computeProgressStats(allDatabaseIds, appState.srs);
  const questionStats = computeProgressStats(
    questions.map((q) => q.id),
    appState.srs
  );
  const dictionaryStats = computeProgressStats(
    dictionary.map((d) => d.id),
    appState.srs
  );

  const failedQuestions = questions.filter((q) => getSRSRecord(appState.srs, q.id).box === 1);
  const unseenQuestions = questions.filter((q) => getSRSRecord(appState.srs, q.id).box === 0);
  const isFreshUser =
    overview.percent === 0 && overallStats.seenItems === 0 && appState.sessionsCompleted === 0;
  const heroModuleId = Math.min(8, Math.max(1, overview.currentModuleId));
  const heroImageSrc = `./images/lessons/module-${heroModuleId}.jpg`;

  return (
    <div className="mx-auto max-w-7xl space-y-5 animate-fade-in">
      {/* Top Desktop Grid: Guided Hero (left) + Live Readiness Summary (right) */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Hero Card: Guided Course */}
        <section className="nordic-card relative flex flex-col justify-between overflow-hidden p-6 sm:p-8 lg:col-span-8">
          {/* Partial faded road illustration backdrop matching the lesson theme */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-full select-none overflow-hidden sm:w-[64%]"
          >
            <img
              src={heroImageSrc}
              alt=""
              className="h-full w-full object-cover object-center opacity-25 saturate-[0.9] sm:opacity-35 dark:opacity-20 sm:dark:opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/25 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-900/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-transparent to-white/50 sm:hidden dark:from-zinc-900/85 dark:to-zinc-900/50" />
          </div>

          <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{overview.stepLabel}</span>
                </span>

                {dueReviewQuestions.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    <RefreshCw className="h-3 w-3" />
                    <span>{pick('Пора повторить:', 'Час повторити:')} {dueReviewQuestions.length}</span>
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
                  {isFreshUser
                    ? pick('Начать обучение по ПДД Дании', 'Почати навчання з ПДР Данії')
                    : pick('Продолжить обучение', 'Продовжити навчання')}
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
                  {pick('Курс', 'Курс')}: {overview.percent}% • {pick('Уроков', 'Уроків')}: {overview.completedModules}/8
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <button
                type="button"
                onClick={onStartCourse}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-7 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-500 sm:w-auto"
              >
                <span>
                  {isFreshUser
                    ? pick('Начать курс', 'Почати курс')
                    : pick('Продолжить курс', 'Продовжити курс')}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onOpenLessonsReference}
                className="rounded-lg bg-white/75 px-2.5 py-1 text-xs font-medium text-zinc-700 backdrop-blur-sm transition-colors hover:bg-white hover:text-zinc-950 dark:bg-zinc-900/75 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              >
                {pick('Открыть справочник 8 тем', 'Відкрити довідник 8 тем')}
              </button>
            </div>
          </div>
        </section>

        {/* Right Desktop Card: At-a-Glance Readiness Telemetry */}
        <aside className="nordic-card flex flex-col justify-between p-5 lg:col-span-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <BarChart3 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                {pick('Готовность к Teoriprøven', 'Готовність до Teoriprøven')}
              </span>
              <span className="text-xs font-bold tabular-nums text-zinc-700 dark:text-zinc-300">
                {questions.length} {pick('билетов', 'білетів')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/50">
                <div className="text-lg font-extrabold tabular-nums text-sky-600 dark:text-sky-400">
                  {overallStats.coveragePercent}%
                </div>
                <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {pick('Охвачено', 'Охоплено')} ({overallStats.seenItems}/{overallStats.totalItems})
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/50">
                <div className="text-lg font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {overallStats.masteryPercent}%
                </div>
                <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {pick('Закреплено (Box 4–5)', 'Закріплено (Box 4–5)')}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-zinc-200/70 pt-3 text-xs dark:border-zinc-800">
            <span className="flex items-center gap-1.5 font-medium text-zinc-600 dark:text-zinc-400">
              <Layers className="h-3.5 w-3.5 text-zinc-400" />
              {failedQuestions.length > 0
                ? `${pick('Ошибок Box 1:', 'Помилок Box 1:')} ${failedQuestions.length}`
                : pick('Ошибок в Box 1 нет', 'Помилок у Box 1 немає')}
            </span>
            <span className="font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
              {appState.examHistory.length > 0
                ? `${pick('Экзамен:', 'Іспит:')} ${Math.max(...appState.examHistory.map((e) => e.score))}/25`
                : `${pick('Сессий:', 'Сесій:')} ${appState.sessionsCompleted}`}
            </span>
          </div>
        </aside>
      </div>

      {/* Secondary Grid: 3 Compact Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* 1. Smart Training */}
        <div className="nordic-card flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                <Zap className="h-5 w-5" />
              </div>
              {failedQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onStartCustomSession(
                      pick('Исправление ошибок', 'Виправлення помилок'),
                      pick('Билеты из Box 1, в которых были ошибки', 'Білети з Box 1, у яких були помилки'),
                      failedQuestions
                    )
                  }
                  className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300"
                >
                  {pick('Ошибок:', 'Помилок:')} {failedQuestions.length}
                </button>
              )}
            </div>

            <h2 className="mt-3.5 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {pick('Умная тренировка', 'Розумне тренування')}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {pick(
                'Ошибки (Box 1), повторения (Box 2–3) и новые билеты — выберите размер сета.',
                'Помилки (Box 1), повторення (Box 2–3) та нові білети — оберіть розмір сету.'
              )}
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onStartSmartSession(10)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{pick('10 вопр.', '10 пит.')}</span>
              </button>
              <button
                type="button"
                onClick={() => onStartSmartSession(20)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200/80 bg-zinc-50 px-3 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <span>{pick('20 вопр.', '20 пит.')}</span>
              </button>
            </div>
            {unseenQuestions.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  onStartCustomSession(
                    pick('Только новые билеты (Box 0)', 'Лише нові білети (Box 0)'),
                    pick(
                      `Ещё не изученные ситуации по всем темам (${Math.min(10, unseenQuestions.length)} из ${unseenQuestions.length})`,
                      `Ще не вивчені ситуації за всіма темами (${Math.min(10, unseenQuestions.length)} з ${unseenQuestions.length})`
                    ),
                    buildSmartSession(unseenQuestions, appState.srs, 10)
                  )
                }
                className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50/70 px-3 text-[11px] font-semibold text-sky-700 transition-colors hover:bg-sky-100 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300"
              >
                {pick('Только новые · Box 0', 'Лише нові · Box 0')} ({unseenQuestions.length})
              </button>
            )}
          </div>
        </div>

        {/* 2. Mock Exam */}
        <div className="nordic-card flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium text-zinc-400">
                {appState.examHistory.length > 0
                  ? `${pick('Лучший:', 'Найкращий:')} ${Math.max(...appState.examHistory.map((e) => e.score))}/25`
                  : pick('25 билетов · 25 мин', '25 білетів · 25 хв')}
              </span>
            </div>

            <h2 className="mt-3.5 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {pick('Пробный экзамен', 'Пробний іспит')}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {pick(
                'Строгий симулятор Teoriprøven: минимум 20 из 25 для сдачи.',
                'Суворий симулятор Teoriprøven: мінімум 20 з 25 для складання.'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenExam}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-4 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <span>{pick('Запустить экзамен', 'Запустити іспит')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 3. Signs & Dictionary */}
        <div className="nordic-card flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                <Signpost className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium text-zinc-400">
                {dictionary.length} {pick('карточек', 'карток')}
              </span>
            </div>

            <h2 className="mt-3.5 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {pick('Знаки и словарь', 'Знаки та словник')}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {pick(
                'Дорожные знаки, устные ответы Kontrolprøven и термины с озвучкой.',
                'Дорожні знаки, усні відповіді Kontrolprøven та терміни з озвучкою.'
              )}
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onOpenSignsAndKontrol}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-zinc-200/90 bg-white px-3 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {pick('Знаки и авто', 'Знаки та авто')}
            </button>
            <button
              type="button"
              onClick={onOpenDictionary}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 px-3 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {pick('Словарь', 'Словник')}
            </button>
          </div>
        </div>
      </section>

      {/* Quick Exam Prep Tools Strip */}
      <section className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setIsNumbersOpen(true)}
          className="nordic-card group flex items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:border-teal-300/90 hover:bg-teal-50/30 dark:hover:border-teal-800 dark:hover:bg-teal-950/20"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
              <Hash className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {pick('Все цифры ПДД за 2 минуты', 'Усі цифри ПДР за 2 хвилини')}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {pick(
                  'Отступы 5/10/12/30 м, скорости, прицеп 3.500 kg, свет, алкоголь и Lovpakke B',
                  'Відступи 5/10/12/30 м, швидкості, причіп 3.500 kg, світло, алкоголь і Lovpakke B'
                )}
              </div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
        </button>

        <button
          type="button"
          onClick={() => setIsKontrolOpen(true)}
          className="nordic-card group flex items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:border-amber-300/90 hover:bg-amber-50/30 dark:hover:border-amber-800 dark:hover:bg-amber-950/20"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {pick('Опрос инспектора · Kontrolprøven', 'Опитування інспектора · Kontrolprøven')}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {pick(
                  '10 устных заданий перед выездом: капот, вакуум тормозов, шины 1,6 мм, фары и лампы',
                  '10 усних завдань перед виїздом: капот, вакуум гальм, шини 1,6 мм, фари та лампи'
                )}
              </div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
        </button>
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
              {pick('Подробная статистика · Охват', 'Детальна статистика · Охоплення')} {overallStats.coveragePercent}% ·{' '}
              {pick('Усвоено', 'Засвоєно')} {overallStats.masteryPercent}%
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
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {pick('Охват базы (Coverage)', 'Охоплення бази (Coverage)')}
                  </span>
                  <span className="text-sky-600 dark:text-sky-400">{overallStats.coveragePercent}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all"
                    style={{ width: `${overallStats.coveragePercent}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>{pick('Билеты:', 'Білети:')} {questionStats.seenItems}/{questionStats.totalItems}</span>
                  <span>{pick('Знаки/Термины/Kontrol:', 'Знаки/Терміни/Kontrol:')} {dictionaryStats.seenItems}/{dictionaryStats.totalItems}</span>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/50">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {pick('Усвоение (Box 4–5)', 'Засвоєння (Box 4–5)')}
                  </span>
                  <span className="text-teal-600 dark:text-teal-400">{overallStats.masteryPercent}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all"
                    style={{ width: `${overallStats.masteryPercent}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>{pick('Билеты:', 'Білети:')} {questionStats.masteredItems}/{questionStats.totalItems}</span>
                  <span>{pick('Карточки:', 'Картки:')} {dictionaryStats.masteredItems}/{dictionaryStats.totalItems}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <Layers className="h-3.5 w-3.5" />
                <span>
                  {pick(
                    'Коробки запоминания Лейтнера (билеты Teoriprøven)',
                    'Коробки запам’ятовування Лейтнера (білети Teoriprøven)'
                  )}
                </span>
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
                        {uiLang === 'uk' ? meta.labelUk : meta.labelRu}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      <Suspense fallback={null}>
        {isNumbersOpen && (
          <QuickNumbersModal
            isOpen={isNumbersOpen}
            languageMode={appState.languageMode}
            onClose={() => setIsNumbersOpen(false)}
          />
        )}
        {isKontrolOpen && (
          <KontrolSimulatorModal
            isOpen={isKontrolOpen}
            languageMode={appState.languageMode}
            onClose={() => setIsKontrolOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
};
