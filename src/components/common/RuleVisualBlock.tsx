import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  BookMarked,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  ExternalLink,
  Info,
  Lightbulb,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { QUESTIONS_BANK } from '../../data/questionsBank';
import { DICTIONARY_ENTRIES } from '../../data/signsAndGlossary';
import { LanguageMode, ModuleCheatRule, TeoriQuestion } from '../../types';
import { extractOrdnetLookupWords, getOrdnetUrl } from '../../utils/ordnet';
import { CarTechnicalSVG } from '../visuals/CarTechnicalSVG';
import { DanishRoadSignSVG } from '../visuals/DanishRoadSignSVG';
import { DriverPOVSceneSVG } from '../visuals/DriverPOVSceneSVG';
import { TrafficSceneSVG } from '../visuals/TrafficSceneSVG';
import { SpeakButton } from './SpeakButton';
import { TheoryBilingual } from './TheoryBilingual';

interface RuleVisualBlockProps {
  rule: ModuleCheatRule;
  moduleId?: number;
  ruleIndex?: number;
  languageMode: LanguageMode;
  compactVisual?: boolean;
}

export const RuleVisualBlock: React.FC<RuleVisualBlockProps> = ({
  rule,
  moduleId,
  ruleIndex = 0,
  languageMode,
}) => {
  const [activeTermId, setActiveTermId] = useState<string | null>(null);
  const [microAnswer, setMicroAnswer] = useState<boolean | null>(null);
  const [checkVariant, setCheckVariant] = useState(0);

  useEffect(() => {
    setActiveTermId(null);
    setMicroAnswer(null);
    setCheckVariant(0);
  }, [rule.titleDa]);

  const matchedTerms = useMemo(() => {
    const compareText = rule.comparePair
      ? [
          rule.comparePair.headingDa,
          rule.comparePair.left.labelDa,
          rule.comparePair.left.summaryDa,
          rule.comparePair.right.labelDa,
          rule.comparePair.right.summaryDa,
        ].join(' ')
      : '';

    const haystack = [
      rule.titleDa,
      rule.bodyDa,
      rule.whyDa ?? '',
      ...(rule.pointsDa ?? []),
      ...(rule.attentionStepsDa ?? []),
      compareText,
      rule.trapDa ?? '',
      rule.exceptionsDa ?? '',
    ]
      .join(' ')
      .toLowerCase();

    const preferred: typeof DICTIONARY_ENTRIES = [];
    const fallback: typeof DICTIONARY_ENTRIES = [];

    for (const entry of DICTIONARY_ENTRIES) {
      const signMatch =
        Boolean(entry.signCode) && haystack.includes(entry.signCode!.toLowerCase());
      const head = entry.da
        .split(/[—(,/]/)[0]
        .trim()
        .toLowerCase();
      const firstWord = head.split(/\s+/)[0] ?? '';
      const wordMatch =
        (head.length >= 4 && haystack.includes(head)) ||
        (firstWord.length >= 5 && haystack.includes(firstWord));

      if (!signMatch && !wordMatch) continue;

      if (moduleId !== undefined && entry.moduleId === moduleId) {
        preferred.push(entry);
      } else {
        fallback.push(entry);
      }
    }

    return [...preferred, ...fallback].slice(0, 6);
  }, [rule, moduleId]);

  const activeTerm = useMemo(
    () => matchedTerms.find((t) => t.id === activeTermId) ?? null,
    [matchedTerms, activeTermId]
  );

  const microCandidates = useMemo<TeoriQuestion[]>(() => {
    const pool =
      moduleId !== undefined
        ? QUESTIONS_BANK.filter((q) => q.moduleId === moduleId)
        : QUESTIONS_BANK;
    if (pool.length === 0) return [];

    const ruleTokens = new Set(
      [rule.titleDa, rule.bodyDa, ...(rule.pointsDa ?? [])]
        .join(' ')
        .toLowerCase()
        .split(/[^a-zæøå0-9]+/i)
        .filter((w) => w.length >= 4)
    );

    const scored = pool.map((q, idx) => {
      let score = 0;
      if (
        rule.visual?.technicalHotspot &&
        q.visual.technicalHotspot === rule.visual.technicalHotspot
      ) {
        score += 120;
      }
      if (rule.visual?.signCode && q.visual.signCode === rule.visual.signCode) {
        score += 110;
      }
      if (rule.visual?.presetId && q.visual.presetId === rule.visual.presetId) {
        score += 90;
      }
      const qWords = [q.situationDa, q.keyRuleDa]
        .join(' ')
        .toLowerCase()
        .split(/[^a-zæøå0-9]+/i)
        .filter((w) => w.length >= 4);
      for (const w of qWords) {
        if (ruleTokens.has(w)) score += 12;
      }
      return { q, score, idx };
    });

    scored.sort((a, b) => b.score - a.score || a.idx - b.idx);
    const bestScore = scored[0]?.score ?? 0;
    if (bestScore >= 12) {
      return scored.slice(0, 3).map((s) => s.q);
    }

    // Deterministic spread across module rules if no direct keyword hit
    const startIdx = (ruleIndex * 3) % pool.length;
    return [
      pool[startIdx],
      pool[(startIdx + 1) % pool.length],
      pool[(startIdx + 2) % pool.length],
    ].filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i);
  }, [moduleId, rule, ruleIndex]);

  const microQuestion =
    microCandidates.length > 0
      ? microCandidates[checkVariant % microCandidates.length]
      : null;
  const microSub = microQuestion?.subQuestions[0] ?? null;

  const renderVisual = () => {
    if (!rule.visual) return null;
    const { visual } = rule;

    if (visual.kind === 'pov') {
      return (
        <DriverPOVSceneSVG
          presetId={visual.presetId}
          imageSrc={visual.imageSrc}
          signCode={visual.signCode}
          subPlaque={visual.subPlaque}
          maneuverBadge={visual.maneuverBadge}
        />
      );
    }

    if (visual.kind === 'technical') {
      return (
        <div className="space-y-3">
          {visual.imageSrc && visual.technicalTab !== 'motorrum' && (
            <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-900 dark:border-zinc-800">
              <img
                src={visual.imageSrc}
                alt={rule.titleRu}
                loading="lazy"
                className="aspect-[16/9] w-full object-cover object-center"
              />
            </div>
          )}
          <CarTechnicalSVG
            initialTab={visual.technicalTab ?? 'motorrum'}
            activeHotspot={visual.technicalHotspot}
            languageMode={languageMode}
            compact={false}
            lockedTab={true}
          />
        </div>
      );
    }

    if (visual.kind === 'sign' && visual.signCode) {
      return (
        <div className="flex justify-center rounded-xl border border-zinc-200 bg-zinc-50 py-5 dark:border-zinc-800 dark:bg-zinc-950/60">
          <DanishRoadSignSVG code={visual.signCode} subPlaque={visual.subPlaque} size={116} />
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <TrafficSceneSVG
          presetId={visual.presetId}
          imageSrc={visual.imageSrc}
          signCode={visual.signCode}
          subPlaque={visual.subPlaque}
        />
        {visual.maneuverBadge && (
          <div className="border-t border-zinc-200/80 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            {visual.maneuverBadge}
          </div>
        )}
      </div>
    );
  };

  const introRu = rule.whyRu || rule.bodyRu;
  const introDa = rule.whyDa || rule.bodyDa;
  const pointsRu = rule.pointsRu ?? [];
  const pointsDa = rule.pointsDa ?? [];
  const hasPoints = pointsRu.length > 0 || pointsDa.length > 0;
  const attentionRu = rule.attentionStepsRu ?? [];
  const attentionDa = rule.attentionStepsDa ?? [];
  const hasAttention = attentionRu.length > 0 || attentionDa.length > 0;

  return (
    <div className="space-y-5">
      {/* Stage 1: Full-Width Top Intro Banner ("Why we learn this") */}
      {(introRu || introDa) && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-teal-200/75 bg-teal-50/55 px-4 py-3.5 dark:border-teal-900/50 dark:bg-teal-950/25">
          <div className="flex min-w-0 flex-1 items-start gap-2.5">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                {languageMode === 'da_only'
                  ? 'Hvorfor lærer vi dette?'
                  : 'Зачем мы это учим (суть простыми словами)'}
              </div>
              <TheoryBilingual
                ru={introRu}
                da={introDa}
                mode={languageMode}
                ruClassName="text-sm sm:text-[15px] leading-relaxed font-medium"
              />
            </div>
          </div>
          {introDa && (
            <SpeakButton id={`rule_intro_${rule.titleDa.slice(0, 12)}`} text={introDa} />
          )}
        </div>
      )}

      {/* Stages 2 & 3: Balanced Visual+Steps Left Column & Scannable Rules Right Column */}
      <div className={rule.visual ? 'grid gap-6 lg:grid-cols-12 lg:items-start' : 'space-y-5'}>
        <div className={rule.visual ? 'space-y-4 lg:col-span-6' : 'space-y-4'}>
          {rule.visual && <div>{renderVisual()}</div>}

          {/* Clean vertical 1 -> 2 -> 3 practical action steps */}
          {hasAttention && (
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-950/45">
              <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                <Compass className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>
                  {languageMode === 'da_only'
                    ? 'Trin for trin i praksis (1 → 2 → 3)'
                    : 'Как делать шаг за шагом (1 → 2 → 3)'}
                </span>
              </div>
              <ol className="space-y-2">
                {(attentionRu.length > 0 ? attentionRu : attentionDa).map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-lg bg-white px-3 py-2.5 shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-900/80 dark:ring-zinc-800"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[11px] font-bold text-white dark:bg-teal-500">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <TheoryBilingual
                        ru={step}
                        da={attentionDa[idx]}
                        mode={languageMode}
                        compact
                        ruClassName="text-xs sm:text-[13px] font-medium leading-snug"
                      />
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className={rule.visual ? 'space-y-4 lg:col-span-6' : 'space-y-4'}>
          {/* Scannable main rules */}
          {hasPoints && (
            <ul className="space-y-3">
              {(pointsRu.length > 0 ? pointsRu : pointsDa).map((pt, idx) => {
                const daText = pointsDa[idx] ?? rule.bodyDa;
                return (
                  <li
                    key={idx}
                    className="flex items-start justify-between gap-2.5 rounded-xl border border-zinc-200/70 bg-white/80 p-3 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-2.5">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                      <div className="min-w-0 flex-1">
                        <TheoryBilingual
                          ru={pt}
                          da={daText}
                          mode={languageMode}
                          ruClassName="text-[15px] leading-relaxed font-normal"
                        />
                      </div>
                    </div>
                    {daText && (
                      <SpeakButton id={`rule_pt_${rule.titleDa.slice(0, 12)}_${idx}`} text={daText} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Side-by-side comparison card ("Don't confuse!") */}
          {rule.comparePair && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/60">
              <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                <ArrowLeftRight className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>
                  {languageMode === 'da_only'
                    ? rule.comparePair.headingDa
                    : rule.comparePair.headingRu}
                </span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[rule.comparePair.left, rule.comparePair.right].map((side, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-lg border border-zinc-200/80 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {side.signCode && (
                      <div className="shrink-0">
                        <DanishRoadSignSVG code={side.signCode} size={42} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {languageMode === 'da_only' ? side.labelDa : side.labelRu}
                      </div>
                      <TheoryBilingual
                        ru={side.summaryRu}
                        da={side.summaryDa}
                        mode={languageMode}
                        compact
                        ruClassName="mt-1 text-xs leading-snug text-zinc-700 dark:text-zinc-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exceptions callout */}
          {(rule.exceptionsRu || rule.exceptionsDa) && (
            <div className="flex items-start justify-between gap-2.5 rounded-r-xl border-l-2 border-sky-500 bg-sky-50/50 py-3 pl-3.5 pr-3 dark:bg-sky-950/25">
              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 text-xs font-bold text-sky-900 dark:text-sky-200">
                    {languageMode === 'da_only' ? 'Undtagelse' : 'Исключение'}
                  </div>
                  <TheoryBilingual
                    ru={rule.exceptionsRu ?? rule.exceptionsDa ?? ''}
                    da={rule.exceptionsDa}
                    mode={languageMode}
                    compact
                    ruClassName="text-xs sm:text-sm leading-relaxed text-sky-950 dark:text-sky-100"
                  />
                </div>
              </div>
              {rule.exceptionsDa && (
                <SpeakButton id={`rule_exc_${rule.titleDa.slice(0, 12)}`} text={rule.exceptionsDa} />
              )}
            </div>
          )}

          {/* Common trap / Exam mistake callout */}
          {(rule.trapRu || rule.trapDa) && (
            <div className="flex items-start justify-between gap-2.5 rounded-r-xl border-l-2 border-amber-500 bg-amber-50/60 py-3 pl-3.5 pr-3 dark:bg-amber-950/25">
              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                    {languageMode === 'da_only' ? 'Typisk fælde til prøven' : 'Ловушка на экзамене'}
                  </div>
                  <TheoryBilingual
                    ru={rule.trapRu ?? rule.trapDa ?? ''}
                    da={rule.trapDa}
                    mode={languageMode}
                    compact
                    ruClassName="text-xs sm:text-sm leading-relaxed text-amber-950 dark:text-amber-100"
                  />
                </div>
              </div>
              {rule.trapDa && (
                <SpeakButton id={`rule_trap_${rule.titleDa.slice(0, 12)}`} text={rule.trapDa} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stage 4: Clickable In-Context Slide Vocabulary Strip + Popover */}
      {matchedTerms.length > 0 && (
        <div className="border-t border-zinc-200/75 pt-3.5 dark:border-zinc-800">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            <BookMarked className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>
              {languageMode === 'da_only'
                ? 'Nøgleord på dette slide (klik for forklaring)'
                : 'Словарь этого слайда (нажмите на слово, чтобы открыть простое объяснение)'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchedTerms.map((term) => {
              const lookupWord = extractOrdnetLookupWords(term.da, 1)[0] ?? term.da;
              const isOpen = activeTermId === term.id;
              return (
                <div
                  key={term.id}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs shadow-sm transition-colors ${
                    isOpen
                      ? 'border-teal-500 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/60'
                      : 'border-zinc-200/90 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTermId(isOpen ? null : term.id)}
                    className="inline-flex items-center gap-1 text-left"
                  >
                    <span className="font-semibold text-teal-900 dark:text-teal-300">
                      {term.da}
                    </span>
                    {languageMode !== 'da_only' && (
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        — {term.ru}
                      </span>
                    )}
                    {isOpen ? (
                      <ChevronUp className="h-3 w-3 shrink-0 text-teal-700 dark:text-teal-300" />
                    ) : (
                      <ChevronDown className="h-3 w-3 shrink-0 text-zinc-400" />
                    )}
                  </button>
                  <SpeakButton
                    id={`slide_term_${term.id}`}
                    text={term.da}
                    className="h-5 w-5 border-transparent bg-transparent"
                  />
                  <a
                    href={getOrdnetUrl(lookupWord)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Открыть «${lookupWord}» на ordnet.dk/ddo`}
                    className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-bold text-teal-700 hover:bg-teal-100/70 dark:text-teal-400 dark:hover:bg-teal-950/50"
                  >
                    DDO
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              );
            })}
          </div>

          {activeTerm && (
            <div className="mt-2.5 flex items-start justify-between gap-3 rounded-xl border border-teal-200/80 bg-teal-50/65 p-3.5 animate-slide-up dark:border-teal-900/60 dark:bg-teal-950/30">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-xs font-bold text-teal-900 dark:text-teal-200">
                  {activeTerm.da}
                  {languageMode !== 'da_only' && (
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {' '}
                      — {activeTerm.ru}
                    </span>
                  )}
                </div>
                <TheoryBilingual
                  ru={activeTerm.detailsRu}
                  da={activeTerm.detailsDa}
                  mode={languageMode}
                  compact
                  ruClassName="text-xs sm:text-[13px] leading-relaxed"
                />
              </div>
              <SpeakButton
                id={`slide_term_det_${activeTerm.id}`}
                text={`${activeTerm.da}. ${activeTerm.detailsDa}`}
              />
            </div>
          )}
        </div>
      )}

      {/* Stage 5: 5-Second Active Retrieval Micro-Check */}
      {microQuestion && microSub && (
        <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/75 p-4 dark:border-zinc-800 dark:bg-zinc-950/55">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              <Brain className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>
                {languageMode === 'da_only'
                  ? 'Hurtigt tjek: sådan spørges der til prøven'
                  : 'Проверь себя за 5 секунд: реальный вопрос из базы экзамена'}
              </span>
            </div>
            {microCandidates.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setMicroAnswer(null);
                  setCheckVariant((v) => v + 1);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/80 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <RefreshCw className="h-3 w-3" />
                <span>{languageMode === 'da_only' ? 'Nyt tjek' : 'Другой вопрос'}</span>
              </button>
            )}
          </div>

          <div className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">
            {languageMode === 'da_only' ? microQuestion.situationDa : microQuestion.situationRu}
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-zinc-200/80 bg-white p-3.5 sm:flex-row sm:items-start sm:justify-between dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <TheoryBilingual
                ru={microSub.ru}
                da={microSub.da}
                mode={languageMode}
                compact
                ruClassName="text-sm font-semibold leading-snug"
              />
              <SpeakButton id={`micro_q_${microSub.id}`} text={microSub.da} />
            </div>

            <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
              {[
                { val: true, da: 'Ja', ru: 'Да' },
                { val: false, da: 'Nej', ru: 'Нет' },
              ].map((btn) => {
                const chosen = microAnswer === btn.val;
                const isTarget = microAnswer !== null && microSub.correctAnswer === btn.val;
                let cls =
                  'border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-teal-400 hover:bg-teal-50/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200';
                if (microAnswer !== null && isTarget) {
                  cls =
                    'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500';
                } else if (microAnswer !== null && chosen && !isTarget) {
                  cls = 'border-rose-600 bg-rose-600 text-white dark:border-rose-500 dark:bg-rose-500';
                } else if (microAnswer !== null) {
                  cls =
                    'border-zinc-200 bg-zinc-100 text-zinc-400 opacity-60 dark:border-zinc-800 dark:bg-zinc-950';
                }
                return (
                  <button
                    key={String(btn.val)}
                    type="button"
                    disabled={microAnswer !== null}
                    onClick={() => setMicroAnswer(btn.val)}
                    className={`min-w-[68px] rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${cls}`}
                  >
                    {btn.da}
                    {languageMode !== 'da_only' ? ` / ${btn.ru}` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {microAnswer !== null && (
            <div
              className={`mt-2.5 flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs animate-slide-up ${
                microAnswer === microSub.correctAnswer
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100'
                  : 'border-rose-200 bg-rose-50/70 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100'
              }`}
            >
              {microAnswer === microSub.correctAnswer ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="font-bold">
                  {microAnswer === microSub.correctAnswer
                    ? languageMode === 'da_only'
                      ? 'Rigtigt!'
                      : 'Верно!'
                    : languageMode === 'da_only'
                      ? `Forkert — det rigtige svar er ${microSub.correctAnswer ? 'Ja' : 'Nej'}`
                      : `Не совсем — правильный ответ: ${microSub.correctAnswer ? 'Ja / Да' : 'Nej / Нет'}`}
                </div>
                <TheoryBilingual
                  ru={microSub.explanationRu}
                  da={microSub.explanationDa}
                  mode={languageMode === 'da_only' ? 'both' : languageMode}
                  compact
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
