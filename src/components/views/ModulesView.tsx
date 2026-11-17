import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Play,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { MODULES_DATA } from '../../data/modulesData';
import { QUESTIONS_BANK } from '../../data/questionsBank';
import { DICTIONARY_ENTRIES } from '../../data/signsAndGlossary';
import { BOX_META, computeProgressStats, getSRSRecord } from '../../services/srsEngine';
import { LanguageMode, SRSRecord, TeoriQuestion } from '../../types';
import { BilingualText } from '../common/BilingualText';
import { SpeakButton } from '../common/SpeakButton';
import { CarTechnicalSVG } from '../visuals/CarTechnicalSVG';
import { DanishRoadSignSVG } from '../visuals/DanishRoadSignSVG';

interface ModulesViewProps {
  selectedModuleId: number;
  initialViewMode?: 'list' | 'lesson';
  onSelectModule: (id: number) => void;
  srsMap: Record<string, SRSRecord>;
  languageMode: LanguageMode;
  onStartModuleQuiz: (
    title: string,
    subtitle: string,
    questions: TeoriQuestion[],
    moduleId?: number
  ) => void;
  onRecordEntryReview: (entryId: string, passed: boolean) => void;
  onOpenCourse: () => void;
}

export const ModulesView: React.FC<ModulesViewProps> = ({
  selectedModuleId,
  initialViewMode = 'list',
  onSelectModule,
  srsMap,
  languageMode,
  onStartModuleQuiz,
  onRecordEntryReview,
  onOpenCourse,
}) => {
  const [activeId, setActiveId] = useState<number>(selectedModuleId);
  const [viewMode, setViewMode] = useState<'list' | 'lesson'>(initialViewMode);
  const [showGlossary, setShowGlossary] = useState<boolean>(false);

  useEffect(() => {
    setActiveId(selectedModuleId);
  }, [selectedModuleId]);

  useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode]);

  const handleOpenLesson = (id: number) => {
    setActiveId(id);
    onSelectModule(id);
    setViewMode('lesson');
    setShowGlossary(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (viewMode === 'list') {
    return (
      <div className="mx-auto max-w-5xl space-y-5 animate-fade-in">
        <section className="nordic-card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100">
              Справочник курса: 8 обязательных тем
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Свободное чтение любого модуля или последовательное прохождение в управляемом курсе.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCourse}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-teal-500 sm:text-sm"
          >
            <span>Пройти в режиме курса</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          {MODULES_DATA.map((item) => {
            const qs = QUESTIONS_BANK.filter((q) => q.moduleId === item.id);
            const st = computeProgressStats(
              qs.map((q) => q.id),
              srsMap
            );

            const hasErrors = st.boxCounts[1] > 0;
            const isPassed = !hasErrors && st.totalItems > 0 && st.seenItems === st.totalItems;
            const isInProgress = !hasErrors && !isPassed && st.seenItems > 0;

            return (
              <div
                key={item.id}
                className="nordic-card flex flex-col justify-between p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-zinc-900 px-2.5 py-0.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      Урок {item.id}
                    </span>

                    {hasErrors ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        <AlertTriangle className="h-3 w-3" />
                        Есть ошибки ({st.boxCounts[1]})
                      </span>
                    ) : isPassed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Пройден
                      </span>
                    ) : isInProgress ? (
                      <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                        В процессе ({st.seenItems}/{st.totalItems})
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        Не начат
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    {languageMode !== 'da_only' ? (
                      <>
                        <h2 className="text-base font-bold leading-snug text-zinc-900 dark:text-zinc-100">
                          {item.titleRu}
                        </h2>
                        <div className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {item.titleDa}
                        </div>
                      </>
                    ) : (
                      <h2 className="text-base font-bold leading-snug text-zinc-900 dark:text-zinc-100">
                        {item.titleDa}
                      </h2>
                    )}
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {languageMode !== 'da_only' ? item.subtitleRu : item.subtitleDa}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {/* Micro progress bar */}
                  <div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="flex h-full">
                        <div
                          className="bg-emerald-500 transition-all"
                          style={{ width: `${st.masteryPercent}%` }}
                        />
                        <div
                          className="bg-sky-400 transition-all"
                          style={{
                            width: `${Math.max(0, st.coveragePercent - st.masteryPercent)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-zinc-400">
                      <span>Пройдено: {st.seenItems} из {st.totalItems} билетов</span>
                      <span>Усвоено: {st.masteredItems}/{st.totalItems}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenLesson(item.id)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      <span>Читать урок</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onStartModuleQuiz(
                          `Урок ${item.id}: ${item.titleRu}`,
                          `${item.titleDa} (${qs.length} вопр.)`,
                          qs,
                          item.id
                        )
                      }
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Сразу к тесту ({qs.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Lesson detail mode
  const mod = MODULES_DATA.find((m) => m.id === activeId) ?? MODULES_DATA[0];
  const modQuestions = QUESTIONS_BANK.filter((q) => q.moduleId === mod.id);
  const modFailedQuestions = modQuestions.filter((q) => getSRSRecord(srsMap, q.id).box === 1);
  const modEntries = DICTIONARY_ENTRIES.filter((d) => d.moduleId === mod.id);
  const modStats = computeProgressStats(
    modQuestions.map((q) => q.id),
    srsMap
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5 animate-fade-in">
      {/* Top Lesson Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            setViewMode('list');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Ко всем урокам (8 тем)</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={mod.id <= 1}
            onClick={() => handleOpenLesson(mod.id - 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-35 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Пред.</span>
          </button>

          <span className="rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            Урок {mod.id} из {MODULES_DATA.length}
          </span>

          <button
            type="button"
            disabled={mod.id >= MODULES_DATA.length}
            onClick={() => handleOpenLesson(mod.id + 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-35 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <span className="hidden sm:inline">След.</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Lesson Header Card */}
      <section className="nordic-card p-5 sm:p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
              {mod.code}
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Пройдено билетов: {modStats.seenItems}/{modStats.totalItems} • Усвоено: {modStats.masteryPercent}%
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              {languageMode !== 'da_only' ? (
                <>
                  <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100">
                    {mod.titleRu}
                  </h1>
                  <div className="mt-0.5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {mod.titleDa}
                  </div>
                </>
              ) : (
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100">
                  {mod.titleDa}
                </h1>
              )}
            </div>
            <SpeakButton id={`mod_title_${mod.id}`} text={mod.titleDa} size="md" />
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {languageMode !== 'da_only' ? mod.subtitleRu : mod.subtitleDa}
          </p>

          <div className="pt-1">
            <button
              type="button"
              onClick={onOpenCourse}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-900/60"
            >
              <span>Пройти в режиме курса</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {mod.keyMetrics.map((metric, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/60"
            >
              <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                {metric.value}
              </div>
              {languageMode !== 'da_only' ? (
                <>
                  <div className="mt-0.5 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                    {metric.labelRu}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {metric.labelDa}
                  </div>
                </>
              ) : (
                <div className="mt-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  {metric.labelDa}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Special interactive visual for Module 1 (CarTechnicalSVG) */}
      {mod.id === 1 && (
        <section className="nordic-card p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Интерактивная схема Kontrolprøven (нажмите на любой узел)
            </h2>
          </div>
          <CarTechnicalSVG initialTab="motorrum" languageMode={languageMode} />
        </section>
      )}

      {/* Special sign gallery for Module 5 */}
      {mod.id === 5 && (
        <section className="nordic-card p-5 sm:p-6">
          <h2 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Основные датские дорожные знаки (A, B, C, D, E)
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {DICTIONARY_ENTRIES.filter((d) => d.category === 'sign' && d.signCode).map((sign) => (
              <div
                key={sign.id}
                className="relative flex flex-col items-center rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-3 text-center dark:border-zinc-800 dark:bg-zinc-950/60"
              >
                <div className="mb-1 self-end">
                  <SpeakButton id={`mod5_sign_${sign.id}`} text={sign.da} />
                </div>
                <DanishRoadSignSVG code={sign.signCode!} subPlaque={sign.subPlaque} size={72} />
                <div className="mt-2 text-[11px] font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
                  {sign.da}
                </div>
                {languageMode !== 'da_only' && (
                  <div className="mt-0.5 text-[10px] leading-tight text-zinc-500 dark:text-zinc-400">
                    {sign.ru}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 1. Main Rules Cheat Sheet (clear Russian + Danish) */}
      <section className="nordic-card p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            1. Главные правила и цифры урока
          </h2>
        </div>

        <div className="space-y-3">
          {mod.cheatSheet.map((rule, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/50"
            >
              <div className="flex items-start justify-between gap-2">
                {languageMode === 'both' ? (
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {rule.titleRu}
                    </div>
                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {rule.titleDa}
                    </div>
                  </div>
                ) : (
                  <BilingualText
                    da={rule.titleDa}
                    ru={rule.titleRu}
                    mode={languageMode}
                    daClassName="text-sm font-bold"
                    ruClassName="text-xs font-medium"
                  />
                )}
                <SpeakButton id={`cheat_${mod.id}_${idx}`} text={`${rule.titleDa}. ${rule.bodyDa}`} />
              </div>

              <div className="mt-2.5 border-t border-zinc-200/70 pt-2.5 dark:border-zinc-800">
                {languageMode === 'both' ? (
                  <div className="space-y-1.5">
                    <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                      {rule.bodyRu}
                    </p>
                    <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {rule.bodyDa}
                    </p>
                  </div>
                ) : (
                  <BilingualText
                    da={rule.bodyDa}
                    ru={rule.bodyRu}
                    mode={languageMode}
                    daClassName="text-xs sm:text-sm font-normal leading-relaxed"
                    ruClassName="text-xs leading-relaxed"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Step-by-step algorithm if present */}
        {mod.algorithms && mod.algorithms.length > 0 && (
          <div className="mt-5 rounded-2xl border border-sky-200/80 bg-sky-50/50 p-4 dark:border-sky-900/50 dark:bg-sky-950/25">
            <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
              Обязательный алгоритм действий
            </h3>
            <div className="space-y-2">
              {mod.algorithms.map((alg) => (
                <div key={alg.step} className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[11px] font-bold text-white">
                      {alg.step}
                    </span>
                    <BilingualText
                      da={languageMode === 'both' ? alg.ru : alg.da}
                      ru={languageMode === 'both' ? alg.da : alg.ru}
                      mode={languageMode}
                      daClassName="text-xs sm:text-sm"
                      ruClassName="text-xs"
                    />
                  </div>
                  <SpeakButton id={`alg_${mod.id}_${alg.step}`} text={alg.da} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 2. Collapsible Dictionary & Flashcards for this lesson */}
      {modEntries.length > 0 && (
        <section className="nordic-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowGlossary((v) => !v)}
            className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-zinc-50/70 dark:hover:bg-zinc-900/70"
          >
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. Словарь и карточки этого урока ({modEntries.length})
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {showGlossary
                  ? 'Нажмите, чтобы свернуть карточки терминов'
                  : 'Необязательно к чтению — нажмите, чтобы посмотреть термины и знаки урока'}
              </p>
            </div>
            {showGlossary ? (
              <ChevronUp className="h-5 w-5 shrink-0 text-zinc-400" />
            ) : (
              <ChevronDown className="h-5 w-5 shrink-0 text-zinc-400" />
            )}
          </button>

          {showGlossary && (
            <div className="grid gap-3 border-t border-zinc-200/80 p-5 md:grid-cols-2 dark:border-zinc-800">
              {modEntries.map((entry) => {
                const rec = getSRSRecord(srsMap, entry.id);
                const meta = BOX_META[rec.box];
                return (
                  <div
                    key={entry.id}
                    className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40"
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badgeClass}`}
                        >
                          Box {rec.box} • {meta.labelRu}
                        </span>
                        <SpeakButton id={`entry_${entry.id}`} text={`${entry.da}. ${entry.detailsDa}`} />
                      </div>

                      <div className="flex items-start gap-3">
                        {entry.signCode && (
                          <div className="shrink-0">
                            <DanishRoadSignSVG
                              code={entry.signCode}
                              subPlaque={entry.subPlaque}
                              size={56}
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <BilingualText
                            da={entry.da}
                            ru={entry.ru}
                            mode={languageMode}
                            daClassName="text-sm font-bold"
                            ruClassName="text-xs"
                          />
                          <BilingualText
                            da={entry.detailsDa}
                            ru={entry.detailsRu}
                            mode={languageMode}
                            daClassName="text-xs font-normal text-zinc-600 dark:text-zinc-300"
                            ruClassName="text-[11px]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 border-t border-zinc-200/70 pt-2.5 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => onRecordEntryReview(entry.id, false)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-rose-200 bg-white py-1.5 text-[11px] font-semibold text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:bg-zinc-900 dark:text-rose-400"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Повторить (Box 1)
                      </button>
                      <button
                        type="button"
                        onClick={() => onRecordEntryReview(entry.id, true)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50/80 py-1.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Знаю (+Box)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Final Guided Call-To-Action Card */}
      <section className="rounded-3xl border border-zinc-200 bg-zinc-900 p-6 text-white shadow-lg sm:p-8 dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Следующий шаг • Урок {mod.id}
            </div>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
              Готовы проверить себя по теме «{mod.titleRu}»?
            </h2>
            <p className="text-xs text-zinc-300 sm:text-sm dark:text-zinc-600">
              Закрепите правила на {modQuestions.length} экзаменационных ситуациях этой темы.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <button
              type="button"
              onClick={() =>
                onStartModuleQuiz(
                  `Урок ${mod.id}: ${mod.titleRu}`,
                  `${mod.titleDa} (${modQuestions.length} вопр.)`,
                  modQuestions,
                  mod.id
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-400"
            >
              <span>Перейти к тесту по Уроку {mod.id} ({modQuestions.length} вопр.)</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {modFailedQuestions.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  onStartModuleQuiz(
                    `Ошибки Урока ${mod.id}`,
                    `${mod.titleRu} (${modFailedQuestions.length} вопр. из Box 1)`,
                    modFailedQuestions,
                    mod.id
                  )
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-400/50 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/30 dark:border-rose-300 dark:bg-rose-100 dark:text-rose-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Отработать только ошибки урока ({modFailedQuestions.length})</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
