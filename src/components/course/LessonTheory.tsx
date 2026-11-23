import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useUiLang } from '../../i18n/UiLangContext';
import {
  clearTheorySlideIndex,
  loadTheorySlideIndex,
  saveTheorySlideIndex,
} from '../../services/sessionPersistence';
import { LanguageMode, ModuleCheatRule } from '../../types';
import { BilingualText } from '../common/BilingualText';
import { RuleVisualBlock } from '../common/RuleVisualBlock';
import { SpeakButton } from '../common/SpeakButton';
import { TheoryBilingual } from '../common/TheoryBilingual';
import { CarTechnicalSVG } from '../visuals/CarTechnicalSVG';
import { DanishRoadSignSVG } from '../visuals/DanishRoadSignSVG';
import { LessonHeroIllustration } from '../visuals/LessonHeroIllustration';

interface LessonTheoryProps {
  moduleId: number;
  languageMode: LanguageMode;
  nextButtonLabel: string;
  onComplete: () => void;
}

type TheorySlide =
  | { kind: 'cover' }
  | { kind: 'rule'; rule: ModuleCheatRule; index: number }
  | { kind: 'visual' }
  | { kind: 'algorithms' }
  | { kind: 'summary' };

export const LessonTheory: React.FC<LessonTheoryProps> = ({
  moduleId,
  languageMode,
  nextButtonLabel,
  onComplete,
}) => {
  const { modules, questions, dictionary, pick } = useUiLang();

  const mod = useMemo(
    () => modules.find((m) => m.id === moduleId) ?? modules[0],
    [modules, moduleId]
  );

  const modQuestions = useMemo(
    () => questions.filter((q) => q.moduleId === mod.id),
    [questions, mod.id]
  );

  const moduleSigns = useMemo(
    () =>
      dictionary.filter(
        (d) => d.moduleId === mod.id && d.category === 'sign' && Boolean(d.signCode)
      ),
    [dictionary, mod.id]
  );

  const slides: TheorySlide[] = useMemo(() => {
    const list: TheorySlide[] = [{ kind: 'cover' }];
    mod.cheatSheet.forEach((rule, index) => {
      list.push({ kind: 'rule', rule, index });
    });
    if (mod.id === 1 || moduleSigns.length > 0) {
      list.push({ kind: 'visual' });
    }
    if (mod.algorithms && mod.algorithms.length > 0) {
      list.push({ kind: 'algorithms' });
    }
    list.push({ kind: 'summary' });
    return list;
  }, [mod, moduleSigns.length]);

  const [slideIndex, setSlideIndex] = useState(() =>
    loadTheorySlideIndex(moduleId, slides.length)
  );
  const prevModuleIdRef = useRef(moduleId);

  useEffect(() => {
    if (prevModuleIdRef.current !== moduleId) {
      prevModuleIdRef.current = moduleId;
      setSlideIndex(loadTheorySlideIndex(moduleId, slides.length));
    }
  }, [moduleId, slides.length]);

  const isFirst = slideIndex === 0;
  const isLast = slideIndex === slides.length - 1;

  const goToSlide = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, slides.length - 1));
    setSlideIndex(clamped);
    saveTheorySlideIndex(moduleId, clamped);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' && slideIndex < slides.length - 1) {
        e.preventDefault();
        const nextIdx = Math.min(slides.length - 1, slideIndex + 1);
        setSlideIndex(nextIdx);
        saveTheorySlideIndex(moduleId, nextIdx);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft' && slideIndex > 0) {
        e.preventDefault();
        const prevIdx = Math.max(0, slideIndex - 1);
        setSlideIndex(prevIdx);
        saveTheorySlideIndex(moduleId, prevIdx);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [moduleId, slideIndex, slides.length]);

  const currentSlide = slides[slideIndex];

  const renderSlideBody = () => {
    switch (currentSlide.kind) {
      case 'cover':
        return (
          <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 lg:col-span-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {languageMode === 'both' ? (
                    <>
                      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
                        {mod.titleRu}
                      </h1>
                      <div className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-teal-900/85 dark:text-teal-300">
                        <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                          DA
                        </span>
                        <span>{mod.titleDa}</span>
                      </div>
                    </>
                  ) : (
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
                      {languageMode === 'da_only' ? mod.titleDa : mod.titleRu}
                    </h1>
                  )}
                </div>
                <SpeakButton
                  id={`course_cov_${mod.id}`}
                  text={mod.subtitleDa ? `${mod.titleDa}. ${mod.subtitleDa}` : mod.titleDa}
                  size="md"
                />
              </div>

              <p className="text-[15px] leading-7 text-zinc-600 sm:text-base dark:text-zinc-300">
                {languageMode !== 'da_only' ? mod.subtitleRu : mod.subtitleDa}
              </p>

              {(mod.teacherIntroRu || mod.teacherIntroDa) && (
                <div className="rounded-2xl border border-teal-200/80 bg-teal-50/55 p-3.5 dark:border-teal-900/60 dark:bg-teal-950/25">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                      {languageMode === 'da_only'
                        ? 'Lærerens introduktion'
                        : pick(
                            'Вводная преподавателя: что к чему в этом уроке',
                            'Вступ від викладача: що до чого в цьому уроці'
                          )}
                    </span>
                    {mod.teacherIntroDa && (
                      <SpeakButton id={`course_intro_${mod.id}`} text={mod.teacherIntroDa} />
                    )}
                  </div>
                  <TheoryBilingual
                    ru={mod.teacherIntroRu ?? mod.teacherIntroDa ?? ''}
                    da={mod.teacherIntroDa}
                    mode={languageMode}
                    compact
                    ruClassName="text-xs sm:text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-200"
                  />
                </div>
              )}

              {mod.prereqTerms && mod.prereqTerms.length > 0 && (
                <div className="space-y-2 pt-0.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {languageMode === 'da_only'
                      ? '3 grundbegreber før start'
                      : pick('3 базовых понятия до старта', '3 базові поняття до старту')}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {mod.prereqTerms.map((term, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col justify-between gap-1.5 rounded-xl border border-zinc-200/80 bg-white/85 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/70"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0">
                            <div className="text-xs font-bold leading-snug text-zinc-900 dark:text-zinc-100">
                              {languageMode === 'da_only' ? term.termDa : term.termRu}
                            </div>
                            {languageMode === 'both' && (
                              <div className="text-[10px] font-medium text-teal-800/85 dark:text-teal-300">
                                {term.termDa}
                              </div>
                            )}
                          </div>
                          <SpeakButton
                            id={`course_pre_${mod.id}_${idx}`}
                            text={`${term.termDa}. ${term.explainDa}`}
                            className="h-5 w-5 shrink-0 border-transparent bg-transparent"
                          />
                        </div>
                        <TheoryBilingual
                          ru={term.explainRu}
                          da={term.explainDa}
                          mode={languageMode}
                          compact
                          ruClassName="text-[11px] leading-snug text-zinc-600 dark:text-zinc-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(mod.schoolStageLabelRu || (mod.officialGoals && mod.officialGoals.length > 0)) && (
                <div className="space-y-1.5 pt-1">
                  {mod.schoolStageLabelRu && (
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200/80 bg-teal-50/80 px-2.5 py-1 text-[11px] font-semibold text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300">
                      <span>{languageMode === 'da_only' ? mod.schoolStageLabelDa : mod.schoolStageLabelRu}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {mod.officialGoals?.map((goal) => (
                      <div
                        key={goal.code}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/80 bg-zinc-100/80 py-0.5 pl-2 pr-1 text-[11px] font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                      >
                        <span title={languageMode === 'da_only' ? goal.titleDa : `${goal.titleRu} (${goal.titleDa})`}>
                          🎯 {goal.code}
                        </span>
                        <SpeakButton
                          id={`goal_${mod.id}_${goal.code}`}
                          text={goal.titleDa}
                          title={`${pick('Озвучить датскую цель', 'Озвучити данську ціль')}: ${goal.titleDa}`}
                          className="h-5 w-5 border-transparent bg-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                {mod.keyMetrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/60"
                  >
                    <div className="text-lg font-bold tracking-tight text-teal-700 sm:text-xl dark:text-teal-400">
                      {metric.value}
                    </div>
                    <div className="mt-1 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      {languageMode !== 'da_only' ? metric.labelRu : metric.labelDa}
                    </div>
                    {languageMode === 'both' && (
                      <div className="mt-1 flex items-start gap-1 text-[11px] text-teal-900/80 dark:text-teal-300/85">
                        <span className="inline-flex shrink-0 items-center rounded bg-teal-100 px-1 py-0.5 text-[9px] font-bold tracking-wide text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                          DA
                        </span>
                        <span>{metric.labelDa}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <LessonHeroIllustration moduleId={mod.id} languageMode={languageMode} />
            </div>
          </div>
        );

      case 'rule': {
        const { rule, index } = currentSlide;
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              {languageMode === 'both' ? (
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100">
                    {rule.titleRu}
                  </h2>
                  <div className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-teal-950/85 dark:text-teal-200/90">
                    <span className="inline-flex shrink-0 items-center rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      DA
                    </span>
                    <span>{rule.titleDa}</span>
                  </div>
                </div>
              ) : languageMode === 'spoiler' ? (
                <BilingualText
                  da={rule.titleDa}
                  ru={rule.titleRu}
                  mode="spoiler"
                  daClassName="text-xl sm:text-2xl font-semibold tracking-tight"
                  ruClassName="text-xs"
                />
              ) : (
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100">
                  {rule.titleDa}
                </h2>
              )}

              <SpeakButton
                id={`course_rule_${mod.id}_${index}`}
                text={`${rule.titleDa}. ${rule.bodyDa}`}
                size="md"
              />
            </div>

            <RuleVisualBlock
              rule={rule}
              moduleId={mod.id}
              ruleIndex={index}
              languageMode={languageMode}
              compactVisual
            />
          </div>
        );
      }

      case 'visual':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100">
              {mod.id === 1
                ? pick('Интерактивная схема авто для Kontrolprøven', 'Інтерактивна схема авто для Kontrolprøven')
                : pick('Все знаки этого урока', 'Усі знаки цього уроку')}
            </h2>

            {mod.id === 1 && (
              <CarTechnicalSVG initialTab="motorrum" languageMode={languageMode} />
            )}

            {mod.id !== 1 && moduleSigns.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {moduleSigns.map((sign) => (
                  <div
                    key={sign.id}
                    className="flex flex-col items-center rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-3 text-center dark:border-zinc-800 dark:bg-zinc-950/50"
                  >
                    <div className="mb-1 self-end">
                      <SpeakButton id={`theory_sign_${sign.id}`} text={sign.da} />
                    </div>
                    <DanishRoadSignSVG
                      code={sign.signCode!}
                      subPlaque={sign.subPlaque}
                      size={68}
                    />
                    <div className="mt-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {sign.da}
                    </div>
                    {languageMode !== 'da_only' && (
                      <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                        {sign.ru}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'algorithms':
        return (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
              {pick('Пошаговый алгоритм', 'Покроковий алгоритм')}
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              {mod.algorithms?.map((alg) => (
                <div
                  key={alg.step}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                        {alg.step}
                      </span>
                      <SpeakButton id={`course_alg_${mod.id}_${alg.step}`} text={alg.da} />
                    </div>
                    <div>
                      {languageMode === 'both' ? (
                        <>
                          <div className="text-[15px] font-medium leading-6 text-zinc-900 dark:text-zinc-100">
                            {alg.ru}
                          </div>
                          <div className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-snug text-teal-950/85 dark:text-teal-200/90">
                            <span className="mt-0.5 inline-flex shrink-0 items-center rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                              DA
                            </span>
                            <span>{alg.da}</span>
                          </div>
                        </>
                      ) : (
                        <BilingualText
                          da={alg.da}
                          ru={alg.ru}
                          mode={languageMode}
                          daClassName="text-[15px] leading-6"
                          ruClassName="text-xs"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'summary': {
        const pickedIndices = Array.from(
          new Set([
            0,
            Math.floor(modQuestions.length * 0.35),
            Math.floor(modQuestions.length * 0.65),
            Math.max(0, modQuestions.length - 2),
            Math.max(0, modQuestions.length - 1),
          ])
        ).filter((idx) => idx < modQuestions.length);
        const keyRules = pickedIndices.map((idx) => modQuestions[idx]);
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {pick('Итог урока', 'Підсумок уроку')}
              </span>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
              {pick('Главное за 30 секунд', 'Головне за 30 секунд')}
            </h2>

            <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
              <ul className="space-y-2.5">
                {mod.cheatSheet.map((r, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-2.5 text-[15px] leading-6">
                    <div className="flex min-w-0 flex-1 items-start gap-2.5">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                      <TheoryBilingual
                        ru={r.titleRu}
                        da={r.titleDa}
                        mode={languageMode}
                        compact
                        ruClassName="font-medium"
                      />
                    </div>
                    <SpeakButton id={`sum_r_${mod.id}_${idx}`} text={r.titleDa} />
                  </li>
                ))}
              </ul>

              {keyRules.length > 0 && (
                <div className="space-y-2.5 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {pick('Ловушки на экзамене', 'Пастки на іспиті')}
                  </div>
                  {keyRules.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-start justify-between gap-2 rounded-xl border border-zinc-200/70 bg-white px-3.5 py-2.5 text-xs leading-relaxed sm:text-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <TheoryBilingual
                        ru={q.keyRuleRu}
                        da={q.keyRuleDa}
                        mode={languageMode}
                        compact
                      />
                      <SpeakButton id={`sum_q_${q.id}`} text={q.keyRuleDa} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Slide Card */}
      <div
        key={`${mod.id}_${slideIndex}`}
        className="nordic-card p-6 sm:p-8 motion-safe:animate-slide-step"
      >
        <div className="mb-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {pick('Шаг', 'Крок')} {slideIndex + 1} {pick('из', 'із')} {slides.length} · {pick('Маршрут урока', 'Маршрут уроку')}
            </span>
            <span className="text-[11px] font-medium text-teal-700 dark:text-teal-400">
              {Math.round(((slideIndex + 1) / slides.length) * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {slides.map((s, idx) => {
              const label =
                s.kind === 'cover'
                  ? languageMode === 'da_only'
                    ? 'Oversigt'
                    : pick('Введение', 'Вступ')
                  : s.kind === 'rule'
                    ? `${s.index + 1}. ${(languageMode === 'da_only' ? s.rule.titleDa : s.rule.titleRu).split(/[:(—]/)[0].trim().slice(0, 20)}`
                    : s.kind === 'visual'
                      ? mod.id === 1
                        ? languageMode === 'da_only'
                          ? 'Bilskema'
                          : pick('Схема авто', 'Схема авто')
                        : languageMode === 'da_only'
                          ? 'Skilte'
                          : pick('Знаки', 'Знаки')
                      : s.kind === 'algorithms'
                        ? languageMode === 'da_only'
                          ? 'Trin'
                          : pick('Алгоритм', 'Алгоритм')
                        : languageMode === 'da_only'
                          ? 'Opsummering'
                          : pick('Итог', 'Підсумок');
              const isCurrent = idx === slideIndex;
              const isVisited = idx < slideIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={`shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    isCurrent
                      ? 'border-teal-600 bg-teal-600 text-white shadow-sm dark:border-teal-500 dark:bg-teal-500'
                      : isVisited
                        ? 'border-teal-200/80 bg-teal-50/70 text-teal-800 hover:bg-teal-100 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300'
                        : 'border-zinc-200/80 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {renderSlideBody()}
      </div>

      {/* Navigation bar */}
      <div className="flex items-center gap-3">
        {!isFirst && (
          <button
            type="button"
            onClick={() => goToSlide(slideIndex - 1)}
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{pick('Назад', 'Назад')}</span>
          </button>
        )}

        {!isLast ? (
          <button
            type="button"
            onClick={() => goToSlide(slideIndex + 1)}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-500"
          >
            <span>{pick('Дальше', 'Далі')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              clearTheorySlideIndex(moduleId);
              onComplete();
            }}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-500"
          >
            <span>{nextButtonLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
