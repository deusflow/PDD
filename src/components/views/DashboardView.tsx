import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Layers,
  Play,
  Signpost,
  Zap,
} from 'lucide-react';
import { MODULES_DATA } from '../../data/modulesData';
import { QUESTIONS_BANK } from '../../data/questionsBank';
import { DICTIONARY_ENTRIES } from '../../data/signsAndGlossary';
import {
  BOX_META,
  computeProgressStats,
  getSRSRecord,
} from '../../services/srsEngine';
import { BoxLevel, SRSRecord, TeoriQuestion } from '../../types';

interface DashboardViewProps {
  srsMap: Record<string, SRSRecord>;
  sessionsCompleted: number;
  onStartSmartSession: (count: 10 | 20) => void;
  onStartCustomSession: (title: string, subtitle: string, questions: TeoriQuestion[]) => void;
  onOpenLessonsList: () => void;
  onContinueLesson: (moduleId: number) => void;
  onOpenExam: () => void;
  onOpenSignsAndKontrol: () => void;
  onOpenDictionary: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  srsMap,
  sessionsCompleted,
  onStartSmartSession,
  onStartCustomSession,
  onOpenLessonsList,
  onContinueLesson,
  onOpenExam,
  onOpenSignsAndKontrol,
  onOpenDictionary,
}) => {
  const [sessionSize, setSessionSize] = useState<10 | 20>(10);
  const [showStats, setShowStats] = useState(false);

  const allDatabaseIds = [
    ...QUESTIONS_BANK.map((q) => q.id),
    ...DICTIONARY_ENTRIES.map((d) => d.id),
  ];

  const overallStats = computeProgressStats(allDatabaseIds, srsMap);
  const questionStats = computeProgressStats(
    QUESTIONS_BANK.map((q) => q.id),
    srsMap
  );
  const dictionaryStats = computeProgressStats(
    DICTIONARY_ENTRIES.map((d) => d.id),
    srsMap
  );

  const failedQuestions = QUESTIONS_BANK.filter((q) => getSRSRecord(srsMap, q.id).box === 1);

  // Calculate module mastery & find next lesson to continue
  const moduleStatuses = MODULES_DATA.map((mod) => {
    const qs = QUESTIONS_BANK.filter((q) => q.moduleId === mod.id);
    const st = computeProgressStats(
      qs.map((q) => q.id),
      srsMap
    );
    const isMastered = st.totalItems > 0 && st.masteredItems === st.totalItems;
    return { mod, st, isMastered };
  });

  const masteredModulesCount = moduleStatuses.filter((m) => m.isMastered).length;
  const nextUnfinishedModule = moduleStatuses.find((m) => !m.isMastered)?.mod;
  const hasAnyProgress = overallStats.seenItems > 0 || sessionsCompleted > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-5 animate-fade-in">
      {/* Compact Welcome + 1-line Progress Header */}
      <section className="nordic-card p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100">
              Подготовка к ПДД Дании (Kategori B)
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              Выберите, с чего начнём сегодня:
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowStats((v) => !v)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <BarChart3 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>Моя статистика</span>
            {showStats ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* 1-line compact progress pill */}
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950/50">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <span>
              Изучено:{' '}
              <strong className="text-zinc-900 dark:text-zinc-100">
                {overallStats.coveragePercent}%
              </strong>
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span>
              Готовность к экзамену:{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {overallStats.masteryPercent}%
              </strong>
            </span>
            {failedQuestions.length > 0 && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  Ошибок на повторе: {failedQuestions.length}
                </span>
              </>
            )}
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 sm:w-44 dark:bg-zinc-800">
            <div className="flex h-full">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${overallStats.masteryPercent}%` }}
              />
              <div
                className="bg-sky-400 transition-all duration-500"
                style={{
                  width: `${Math.max(0, overallStats.coveragePercent - overallStats.masteryPercent)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Collapsible detailed statistics (hidden by default) */}
        {showStats && (
          <div className="mt-4 space-y-4 border-t border-zinc-200/80 pt-4 animate-slide-up dark:border-zinc-800">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900/70">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-700 dark:text-zinc-300">Охват базы (Coverage)</span>
                  <span className="text-sky-600 dark:text-sky-400">{overallStats.coveragePercent}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
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

              <div className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900/70">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-700 dark:text-zinc-300">Усвоение (Box 4–5)</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{overallStats.masteryPercent}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
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

      {/* First-time soft tip */}
      {!hasAnyProgress && (
        <div className="rounded-2xl border border-sky-200/80 bg-sky-50/70 px-4 py-3 text-xs font-medium text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
          Впервые здесь? Начните с карточки <strong>«Пошаговые уроки»</strong> — мы проведём вас от простых правил и цифр к тестам по каждой теме.
        </div>
      )}

      {/* 4 Main Action Cards (2x2 Grid) */}
      <section className="grid gap-4 sm:grid-cols-2">
        {/* Card 1: Step-by-step Lessons */}
        <div className="nordic-card flex flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="nordic-pill">
                Уроков освоено: {masteredModulesCount} из {MODULES_DATA.length}
              </span>
            </div>

            <h2 className="mt-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Пошаговые уроки (С нуля)
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              8 коротких тем по программе автошколы: понятная выжимка правил, схемы и автоматический переход к тесту после чтения.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {nextUnfinishedModule ? (
              <button
                type="button"
                onClick={() => onContinueLesson(nextUnfinishedModule.id)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <span>
                  {hasAnyProgress
                    ? `Продолжить: Урок ${nextUnfinishedModule.id}`
                    : 'Открыть уроки'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLessonsList}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-500"
              >
                <span>Все уроки освоены</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onOpenLessonsList}
              className="rounded-2xl border border-zinc-200 bg-white px-3.5 py-3 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Все 8 тем
            </button>
          </div>
        </div>

        {/* Card 2: Smart Practice */}
        <div className="nordic-card flex flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Zap className="h-5 w-5" />
              </div>

              <div className="flex rounded-xl border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-950">
                {([10, 20] as const).map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setSessionSize(cnt)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                      sessionSize === cnt
                        ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
                    }`}
                  >
                    {cnt} вопр.
                  </button>
                ))}
              </div>
            </div>

            <h2 className="mt-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Умная тренировка
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Быстрый сет вопросов: алгоритм сам подберёт новые билеты и поможет закрыть прошлые ошибки.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onStartSmartSession(sessionSize)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Начать тренировку ({sessionSize})</span>
            </button>

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
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Исправить ошибки ({failedQuestions.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Exam Simulator */}
        <div className="nordic-card flex flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <span className="nordic-pill">25 билетов • 25 минут</span>
            </div>

            <h2 className="mt-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Симулятор экзамена (Teoriprøven)
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Проверка готовности в реальных условиях: 25 случайных билетов, таймер 25 минут, для сдачи нужно минимум 20 из 25.
            </p>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={onOpenExam}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <span>Запустить экзамен</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Card 4: Signs, Kontrolprøven & Dictionary */}
        <div className="nordic-card flex flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Signpost className="h-5 w-5" />
              </div>
              <span className="nordic-pill">{DICTIONARY_ENTRIES.length} карточек</span>
            </div>

            <h2 className="mt-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Знаки, Техосмотр и Словарь
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Все дорожные знаки Дании, устные ответы инспектору перед практикой (Kontrolprøven) и словарь терминов с озвучкой.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenSignsAndKontrol}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-zinc-200 bg-white px-3.5 py-3 text-xs font-bold text-zinc-900 transition-colors hover:bg-zinc-50 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <span>Знаки и техосмотр</span>
            </button>
            <button
              type="button"
              onClick={onOpenDictionary}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 sm:text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Весь словарь
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
