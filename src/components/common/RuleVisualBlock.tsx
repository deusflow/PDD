import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  BookMarked,
  CheckCircle2,
  Compass,
  ExternalLink,
  Info,
  Lightbulb,
} from 'lucide-react';
import { DICTIONARY_ENTRIES } from '../../data/signsAndGlossary';
import { LanguageMode, ModuleCheatRule } from '../../types';
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
  languageMode: LanguageMode;
  compactVisual?: boolean;
}

export const RuleVisualBlock: React.FC<RuleVisualBlockProps> = ({
  rule,
  moduleId,
  languageMode,
}) => {
  const matchedTerms = useMemo(() => {
    const haystack = [
      rule.titleDa,
      rule.bodyDa,
      rule.whyDa ?? '',
      ...(rule.pointsDa ?? []),
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

    return [...preferred, ...fallback].slice(0, 5);
  }, [rule, moduleId]);

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
      {/* Zone 1: Full-Width Top Intro Banner ("Why we learn this") */}
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

      {/* Zones 2 & 3: Balanced Visual+Steps Left Column & Scannable Rules Right Column */}
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

      {/* Bottom Footer: Clean Slide Vocabulary Strip */}
      {matchedTerms.length > 0 && (
        <div className="border-t border-zinc-200/75 pt-3.5 dark:border-zinc-800">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            <BookMarked className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>
              {languageMode === 'da_only'
                ? 'Nøgleord på dette slide'
                : 'Словарь этого слайда (для датской автошколы)'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchedTerms.map((term) => {
              const lookupWord = extractOrdnetLookupWords(term.da, 1)[0] ?? term.da;
              return (
                <div
                  key={term.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-zinc-50/80 px-2.5 py-1 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span className="font-semibold text-teal-900 dark:text-teal-300">{term.da}</span>
                  {languageMode !== 'da_only' && (
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400">— {term.ru}</span>
                  )}
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
        </div>
      )}
    </div>
  );
};
