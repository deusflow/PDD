import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Flame,
  Layers,
  Play,
  Sparkles,
  Target,
} from 'lucide-react';
import { MODULES_DATA } from '../../data/modulesData';
import { QUESTIONS_BANK } from '../../data/questionsBank';
import { DICTIONARY_ENTRIES } from '../../data/signsAndGlossary';
import {
  BOX_META,
  computeProgressStats,
  getSRSRecord,
} from '../../services/srsEngine';
import { BoxLevel, LanguageMode, SRSRecord, TeoriQuestion } from '../../types';

interface DashboardViewProps {
  srsMap: Record<string, SRSRecord>;
  languageMode: LanguageMode;
  sessionsCompleted: number;
  onStartSmartSession: (count: 10 | 20) => void;
  onStartCustomSession: (title: string, subtitle: string, questions: TeoriQuestion[]) => void;
  onOpenModule: (moduleId: number) => void;
  onOpenSignsAndKontrol: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  srsMap,
  languageMode,
  sessionsCompleted,
  onStartSmartSession,
  onStartCustomSession,
  onOpenModule,
  onOpenSignsAndKontrol,
}) => {
  const [sessionSize, setSessionSize] = useState<10 | 20>(10);

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
  const unseenQuestions = QUESTIONS_BANK.filter((q) => getSRSRecord(srsMap, q.id).box === 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Smart Session Card */}
      <section className="nordic-card relative overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Færdselsstyrelsen • Персональный алгоритм (SRS)</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
              Умная тренировка на сегодня
            </h1>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Система автоматически собирает идеальный сет:{' '}
              <span className="font-medium text-rose-600 dark:text-rose-400">
                ошибки из Box 1 ({failedQuestions.length})
              </span>{' '}
              +{' '}
              <span className="font-medium text-amber-600 dark:text-amber-400">
                подошедшие повторения ({Math.max(0, questionStats.dueCount - failedQuestions.length)})
              </span>{' '}
              +{' '}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                новые непройденные темы ({unseenQuestions.length})
              </span>
              .
            </p>
          </div>

          {/* Action area */}
          <div className="flex flex-col items-stretch gap-3 sm:min-w-[290px]">
            <div className="flex rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-950">
              {([10, 20] as const).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setSessionSize(cnt)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    sessionSize === cnt
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {cnt} вопросов
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onStartSmartSession(sessionSize)}
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-900 px-6 py-4 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-zinc-800 active:translate-y-0 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Play className="h-5 w-5 fill-current" />
              <span>Умная тренировка ({sessionSize})</span>
            </button>

            <div className="flex gap-2">
              {failedQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onStartCustomSession(
                      'Разбор ошибок (Box 1)',
                      'Критическая зона: ошибки сбрасываются в Box 1',
                      failedQuestions
                    )
                  }
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  Ошибки ({failedQuestions.length})
                </button>
              )}
              {unseenQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onStartCustomSession(
                      'Новые билеты (Box 0)',
                      'Закрытие белых пятен по всем темам',
                      unseenQuestions.slice(0, sessionSize)
                    )
                  }
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  Новые ({unseenQuestions.length})
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onOpenSignsAndKontrol}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <BookMarked className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span>Тренировать знаки и Kontrolprøven</span>
            </button>
          </div>
        </div>
      </section>

      {/* Two Main Progress Bars (Coverage & Mastery across ENTIRE base) */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* 1. Coverage */}
        <div className="nordic-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Охват базы (Coverage)
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Вопросы, знаки, Kontrolprøven и термины пройдены хотя бы 1 раз
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold tabular-nums text-sky-600 dark:text-sky-400">
                {overallStats.coveragePercent}%
              </span>
            </div>
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-500"
              style={{ width: `${overallStats.coveragePercent}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              Изучено: <strong className="text-zinc-800 dark:text-zinc-200">{overallStats.seenItems}</strong> из{' '}
              {overallStats.totalItems} карточек
            </span>
            <span>Цель: 100% без сюрпризов</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>
              Билеты: <strong className="text-zinc-600 dark:text-zinc-300">{questionStats.seenItems}/{questionStats.totalItems}</strong>
            </span>
            <span>
              Знаки/Термины/Kontrol: <strong className="text-zinc-600 dark:text-zinc-300">{dictionaryStats.seenItems}/{dictionaryStats.totalItems}</strong>
            </span>
          </div>
        </div>

        {/* 2. Mastery */}
        <div className="nordic-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Усвоение (Mastery • Box 4–5)
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Отвечены без единой ошибки минимум 3 раза подряд
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                {overallStats.masteryPercent}%
              </span>
            </div>
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${overallStats.masteryPercent}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              Закреплено в Box 4–5:{' '}
              <strong className="text-zinc-800 dark:text-zinc-200">{overallStats.masteredItems}</strong> из{' '}
              {overallStats.totalItems}
            </span>
            <span>Сессий завершено: {sessionsCompleted}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>
              Билеты: <strong className="text-zinc-600 dark:text-zinc-300">{questionStats.masteredItems}/{questionStats.totalItems}</strong>
            </span>
            <span>
              Знаки/Термины/Kontrol: <strong className="text-zinc-600 dark:text-zinc-300">{dictionaryStats.masteredItems}/{dictionaryStats.totalItems}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Leitner 5 Boxes Distribution */}
      <section className="nordic-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Распределение билетов по коробкам Лейтнера (Box 0–5)
            </h2>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {QUESTIONS_BANK.length} ситуационных билетов
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {([0, 1, 2, 3, 4, 5] as BoxLevel[]).map((box) => {
            const meta = BOX_META[box];
            const count = questionStats.boxCounts[box];
            return (
              <div
                key={box}
                className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-950/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Box {box}
                  </span>
                  <span className={`h-2.5 w-2.5 rounded-full ${meta.colorClass}`} />
                </div>
                <div className="mt-1 text-xl font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {count}
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  {meta.labelRu}
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {meta.intervalRu}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8 Modules Matrix */}
      <section className="nordic-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Матрица прогресса по 8 модулям программы
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Нажмите на модуль, чтобы открыть шпаргалку или потренировать конкретную тему
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {MODULES_DATA.map((mod) => {
            const modQuestions = QUESTIONS_BANK.filter((q) => q.moduleId === mod.id);
            const modStats = computeProgressStats(
              modQuestions.map((q) => q.id),
              srsMap
            );

            return (
              <div
                key={mod.id}
                onClick={() => onOpenModule(mod.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onOpenModule(mod.id);
                }}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-zinc-50/50 p-4 text-left transition-all hover:border-zinc-300 hover:bg-white hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-zinc-900 px-2 py-0.5 text-[11px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      {mod.code}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium">
                      {modStats.boxCounts[1] > 0 && (
                        <span className="rounded-md bg-rose-100 px-1.5 py-0.5 font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          {modStats.boxCounts[1]} ошиб.
                        </span>
                      )}
                      {modStats.boxCounts[0] > 0 && (
                        <span className="rounded-md bg-zinc-200/80 px-1.5 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {modStats.boxCounts[0]} нов.
                        </span>
                      )}
                      <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {modStats.masteredItems}/{modStats.totalItems} выуч.
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {mod.titleDa}
                      </div>
                      {languageMode !== 'da_only' && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {mod.titleRu}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
                  </div>
                </div>

                {/* Module dual micro-bar */}
                <div className="mt-3 space-y-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div className="flex h-full">
                      <div
                        className="bg-emerald-500 transition-all duration-300"
                        style={{ width: `${modStats.masteryPercent}%` }}
                      />
                      <div
                        className="bg-sky-400 transition-all duration-300"
                        style={{
                          width: `${Math.max(0, modStats.coveragePercent - modStats.masteryPercent)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
                    <span>Охват: {modStats.coveragePercent}%</span>
                    <span>Усвоено (Box 4–5): {modStats.masteryPercent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
