import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { MODULES_DATA } from '../../data/modulesData';
import { QUESTIONS_BANK } from '../../data/questionsBank';
import { DICTIONARY_ENTRIES } from '../../data/signsAndGlossary';
import { LanguageMode, ModuleCheatRule } from '../../types';
import { BilingualText } from '../common/BilingualText';
import { RuleVisualBlock } from '../common/RuleVisualBlock';
import { SpeakButton } from '../common/SpeakButton';
import { CarTechnicalSVG } from '../visuals/CarTechnicalSVG';
import { DanishRoadSignSVG } from '../visuals/DanishRoadSignSVG';

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
  const mod = useMemo(
    () => MODULES_DATA.find((m) => m.id === moduleId) ?? MODULES_DATA[0],
    [moduleId]
  );

  const modQuestions = useMemo(
    () => QUESTIONS_BANK.filter((q) => q.moduleId === mod.id),
    [mod.id]
  );

  const moduleSigns = useMemo(
    () =>
      DICTIONARY_ENTRIES.filter(
        (d) => d.moduleId === mod.id && d.category === 'sign' && Boolean(d.signCode)
      ),
    [mod.id]
  );

  const slides: TheorySlide[] = useMemo(() => {
    const list: TheorySlide[] = [{ kind: 'cover' }];
    mod.cheatSheet.forEach((rule, index) => {
      list.push({ kind: 'rule', rule, index });
    });
    if (mod.id === 1 || mod.id === 5) {
      list.push({ kind: 'visual' });
    }
    if (mod.algorithms && mod.algorithms.length > 0) {
      list.push({ kind: 'algorithms' });
    }
    list.push({ kind: 'summary' });
    return list;
  }, [mod]);

  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    setSlideIndex(0);
  }, [moduleId]);

  const isFirst = slideIndex === 0;
  const isLast = slideIndex === slides.length - 1;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' && slideIndex < slides.length - 1) {
        e.preventDefault();
        setSlideIndex((i) => Math.min(slides.length - 1, i + 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft' && slideIndex > 0) {
        e.preventDefault();
        setSlideIndex((i) => Math.max(0, i - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [slideIndex, slides.length]);

  const goToSlide = (idx: number) => {
    setSlideIndex(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentSlide = slides[slideIndex];

  const renderSlideBody = () => {
    switch (currentSlide.kind) {
      case 'cover':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {languageMode !== 'da_only' ? (
                    <>
                      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
                        {mod.titleRu}
                      </h1>
                      <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        {mod.titleDa}
                      </p>
                    </>
                  ) : (
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
                      {mod.titleDa}
                    </h1>
                  )}
                </div>
                <SpeakButton id={`course_cov_${mod.id}`} text={mod.titleDa} size="md" />
              </div>

              <p className="pt-1 text-[15px] leading-7 text-zinc-600 sm:text-base dark:text-zinc-300">
                {languageMode !== 'da_only' ? mod.subtitleRu : mod.subtitleDa}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {mod.keyMetrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/60"
                >
                  <div className="text-xl font-bold tracking-tight text-teal-700 sm:text-2xl dark:text-teal-400">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    {languageMode !== 'da_only' ? metric.labelRu : metric.labelDa}
                  </div>
                  {languageMode === 'both' && (
                    <div className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                      {metric.labelDa}
                    </div>
                  )}
                </div>
              ))}
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
                  <div className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {rule.titleDa}
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

            <RuleVisualBlock rule={rule} languageMode={languageMode} compactVisual />

            {languageMode === 'both' && (
              <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/50">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  На датском (для экзамена)
                </div>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {rule.bodyDa}
                </p>
              </div>
            )}
          </div>
        );
      }

      case 'visual':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100">
              {mod.id === 1 ? 'Интерактивная схема авто для Kontrolprøven' : 'Все знаки этого урока'}
            </h2>

            {mod.id === 1 && (
              <CarTechnicalSVG initialTab="motorrum" languageMode={languageMode} />
            )}

            {mod.id === 5 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
              Пошаговый алгоритм
            </h2>
            <div className="space-y-3">
              {mod.algorithms?.map((alg) => (
                <div
                  key={alg.step}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                      {alg.step}
                    </span>
                    <div>
                      {languageMode === 'both' ? (
                        <>
                          <div className="text-[15px] font-medium leading-6 text-zinc-900 dark:text-zinc-100">
                            {alg.ru}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {alg.da}
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
                  <SpeakButton id={`course_alg_${mod.id}_${alg.step}`} text={alg.da} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'summary': {
        const keyRules = modQuestions.slice(0, 3);
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Итог урока</span>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
              Главное за 30 секунд
            </h2>

            <ul className="space-y-2.5">
              {mod.cheatSheet.map((r, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-[15px] leading-6">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {languageMode !== 'da_only' ? r.titleRu : r.titleDa}
                  </span>
                </li>
              ))}
            </ul>

            {keyRules.length > 0 && (
              <div className="space-y-2.5 border-t border-zinc-200/80 pt-4 dark:border-zinc-800">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Ловушки на экзамене
                </div>
                {keyRules.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-zinc-700 sm:text-sm dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300"
                  >
                    {languageMode !== 'da_only' ? q.keyRuleRu : q.keyRuleDa}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Slide Card */}
      <div
        key={`${mod.id}_${slideIndex}`}
        className="nordic-card p-6 sm:p-8 motion-safe:animate-slide-step"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">
            Слайд {slideIndex + 1} из {slides.length}
          </span>
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Слайд ${idx + 1}`}
                onClick={() => goToSlide(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === slideIndex
                    ? 'w-5 bg-teal-600 dark:bg-teal-400'
                    : idx < slideIndex
                      ? 'w-2 bg-teal-300 dark:bg-teal-800'
                      : 'w-2 bg-zinc-200 dark:bg-zinc-700'
                }`}
              />
            ))}
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
            <span>Назад</span>
          </button>
        )}

        {!isLast ? (
          <button
            type="button"
            onClick={() => goToSlide(slideIndex + 1)}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-500"
          >
            <span>Дальше</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onComplete}
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
