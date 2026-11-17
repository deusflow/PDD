import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
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
  onSelectModule: (id: number) => void;
  srsMap: Record<string, SRSRecord>;
  languageMode: LanguageMode;
  onStartModuleQuiz: (title: string, subtitle: string, questions: TeoriQuestion[]) => void;
  onRecordEntryReview: (entryId: string, passed: boolean) => void;
}

export const ModulesView: React.FC<ModulesViewProps> = ({
  selectedModuleId,
  onSelectModule,
  srsMap,
  languageMode,
  onStartModuleQuiz,
  onRecordEntryReview,
}) => {
  const [activeId, setActiveId] = useState<number>(selectedModuleId);

  useEffect(() => {
    setActiveId(selectedModuleId);
  }, [selectedModuleId]);

  const mod = MODULES_DATA.find((m) => m.id === activeId) ?? MODULES_DATA[0];
  const modQuestions = QUESTIONS_BANK.filter((q) => q.moduleId === mod.id);
  const modEntries = DICTIONARY_ENTRIES.filter((d) => d.moduleId === mod.id);
  const modStats = computeProgressStats(
    modQuestions.map((q) => q.id),
    srsMap
  );

  const handleSelect = (id: number) => {
    setActiveId(id);
    onSelectModule(id);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Module selector bar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {MODULES_DATA.map((item) => {
          const qs = QUESTIONS_BANK.filter((q) => q.moduleId === item.id);
          const st = computeProgressStats(
            qs.map((q) => q.id),
            srsMap
          );
          const isSelected = item.id === mod.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-left transition-all ${
                isSelected
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white dark:bg-zinc-900/15 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {item.code}
              </span>
              <span className="max-w-[140px] truncate text-xs font-semibold">{item.titleDa}</span>
              <span className="text-[10px] opacity-75">
                {st.masteredItems}/{st.totalItems}
              </span>
            </button>
          );
        })}
      </div>

      {/* Module Overview Header */}
      <section className="nordic-card p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
                {mod.code}
              </span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Охват билетов: {modStats.coveragePercent}% • Усвоено: {modStats.masteryPercent}%
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <BilingualText
                da={mod.titleDa}
                ru={mod.titleRu}
                mode={languageMode}
                daClassName="text-xl font-bold tracking-tight"
                ruClassName="text-sm"
              />
              <SpeakButton id={`mod_title_${mod.id}`} text={mod.titleDa} />
            </div>

            <BilingualText
              da={mod.subtitleDa}
              ru={mod.subtitleRu}
              mode={languageMode}
              daClassName="text-xs sm:text-sm font-normal text-zinc-600 dark:text-zinc-300"
              ruClassName="text-xs"
            />
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                onStartModuleQuiz(
                  `${mod.code}: ${mod.titleDa}`,
                  `Все вопросы модуля (${modQuestions.length})`,
                  modQuestions
                )
              }
              className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Play className="h-4 w-4 fill-current" />
              Тренировать тему ({modQuestions.length})
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
              <div className="mt-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                {metric.labelDa}
              </div>
              {languageMode !== 'da_only' && (
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {metric.labelRu}
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
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Интерактивная схема Kontrolprøven (нажмите на любой узел)
            </h3>
          </div>
          <CarTechnicalSVG initialTab="motorrum" languageMode={languageMode} />
        </section>
      )}

      {/* Special sign gallery for Module 5 */}
      {mod.id === 5 && (
        <section className="nordic-card p-5 sm:p-6">
          <h3 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Основные датские дорожные знаки (A, B, C, D, E)
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {DICTIONARY_ENTRIES.filter((d) => d.category === 'sign' && d.signCode)
              .slice(0, 12)
              .map((sign) => (
                <div
                  key={sign.id}
                  className="flex flex-col items-center rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-3 text-center dark:border-zinc-800 dark:bg-zinc-950/60"
                >
                  <DanishRoadSignSVG
                    code={sign.signCode!}
                    subPlaque={sign.subPlaque}
                    size={72}
                  />
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

      {/* Cheat Sheet Rules */}
      <section className="nordic-card p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-zinc-500" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Шпаргалка правил (без воды — только законы и цифры)
          </h3>
        </div>
        <div className="space-y-3">
          {mod.cheatSheet.map((rule, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/50"
            >
              <div className="flex items-start justify-between gap-2">
                <BilingualText
                  da={rule.titleDa}
                  ru={rule.titleRu}
                  mode={languageMode}
                  daClassName="text-sm font-bold"
                  ruClassName="text-xs font-medium"
                />
                <SpeakButton id={`cheat_${mod.id}_${idx}`} text={`${rule.titleDa}. ${rule.bodyDa}`} />
              </div>
              <div className="mt-2 border-t border-zinc-200/70 pt-2 dark:border-zinc-800">
                <BilingualText
                  da={rule.bodyDa}
                  ru={rule.bodyRu}
                  mode={languageMode}
                  daClassName="text-xs sm:text-sm font-normal leading-relaxed"
                  ruClassName="text-xs leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Step-by-step algorithm if present */}
        {mod.algorithms && mod.algorithms.length > 0 && (
          <div className="mt-5 rounded-2xl border border-sky-200/80 bg-sky-50/50 p-4 dark:border-sky-900/50 dark:bg-sky-950/25">
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
              Обязательный алгоритм действий
            </h4>
            <div className="space-y-2">
              {mod.algorithms.map((alg) => (
                <div key={alg.step} className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[11px] font-bold text-white">
                      {alg.step}
                    </span>
                    <BilingualText
                      da={alg.da}
                      ru={alg.ru}
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

      {/* Module Flashcards (Terms / Signs / Kontrolprøven) */}
      {modEntries.length > 0 && (
        <section className="nordic-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Термины, знаки и узлы модуля ({modEntries.length})
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Отмечайте карточки — они учитываются в общем охвате и коробках Лейтнера
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
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
        </section>
      )}
    </div>
  );
};
