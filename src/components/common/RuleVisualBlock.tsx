import React from 'react';
import { AlertTriangle, ArrowLeftRight, CheckCircle2, Compass, Eye, Info } from 'lucide-react';
import { LanguageMode, ModuleCheatRule } from '../../types';
import { CarTechnicalSVG } from '../visuals/CarTechnicalSVG';
import { DanishRoadSignSVG } from '../visuals/DanishRoadSignSVG';
import { DriverPOVSceneSVG } from '../visuals/DriverPOVSceneSVG';
import { TrafficSceneSVG } from '../visuals/TrafficSceneSVG';
import { BilingualText } from './BilingualText';

interface RuleVisualBlockProps {
  rule: ModuleCheatRule;
  languageMode: LanguageMode;
  compactVisual?: boolean;
}

export const RuleVisualBlock: React.FC<RuleVisualBlockProps> = ({
  rule,
  languageMode,
  compactVisual = false,
}) => {
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
        <CarTechnicalSVG
          initialTab={visual.technicalTab ?? 'motorrum'}
          activeHotspot={visual.technicalHotspot}
          languageMode={languageMode}
          compact={compactVisual}
        />
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

  const pointsRu = rule.pointsRu ?? [];
  const pointsDa = rule.pointsDa ?? [];
  const hasPoints = pointsRu.length > 0 || pointsDa.length > 0;
  const attentionRu = rule.attentionStepsRu ?? [];
  const attentionDa = rule.attentionStepsDa ?? [];
  const hasAttention = attentionRu.length > 0 || attentionDa.length > 0;

  return (
    <div className="space-y-4">
      {rule.visual && <div>{renderVisual()}</div>}

      {/* Situation description directly attached to the illustration */}
      {(rule.bodyRu || rule.bodyDa) && (
        <div className="flex items-start gap-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/60">
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
          <div className="min-w-0 flex-1 text-xs leading-relaxed sm:text-sm">
            <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              {languageMode === 'da_only' ? 'Situation & regel' : 'Описание ситуации'}
            </div>
            {languageMode === 'da_only' ? (
              <p className="text-zinc-800 dark:text-zinc-200">{rule.bodyDa}</p>
            ) : languageMode === 'spoiler' ? (
              <BilingualText
                da={rule.bodyDa}
                ru={rule.bodyRu}
                mode="spoiler"
                daClassName="text-xs sm:text-sm font-normal leading-relaxed"
                ruClassName="text-xs leading-relaxed"
              />
            ) : (
              <div className="space-y-1">
                <p className="text-zinc-800 dark:text-zinc-200">{rule.bodyRu}</p>
                {rule.bodyDa && (
                  <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    DA: {rule.bodyDa}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual scan order markers (1 -> 2 -> 3): "Where to look" */}
      {hasAttention && (
        <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/60 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/25">
          <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            <Compass className="h-3.5 w-3.5" />
            <span>
              {languageMode === 'da_only'
                ? 'Orientering på billedet (1 → 2 → 3)'
                : 'Куда смотреть на картинке (1 → 2 → 3)'}
            </span>
          </div>
          <ol className="grid gap-2 sm:grid-cols-3">
            {(languageMode === 'da_only' ? attentionDa : attentionRu.length > 0 ? attentionRu : attentionDa).map(
              (step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 rounded-lg border border-indigo-200/60 bg-white/80 p-2.5 text-xs leading-snug dark:border-indigo-900/40 dark:bg-zinc-900/70"
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white dark:bg-indigo-500">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    {languageMode === 'spoiler' && attentionDa[idx] ? (
                      <BilingualText
                        da={attentionDa[idx]}
                        ru={attentionRu[idx] ?? ''}
                        mode="spoiler"
                        daClassName="text-xs font-medium leading-snug"
                        ruClassName="text-[11px] leading-snug"
                      />
                    ) : (
                      <>
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">{step}</p>
                        {languageMode === 'both' && attentionDa[idx] && (
                          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                            DA: {attentionDa[idx]}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </li>
              )
            )}
          </ol>
        </div>
      )}

      {/* Main bullet points ("How to do it right") */}
      {hasPoints && (
        <div className="space-y-2">
          {languageMode === 'da_only' ? (
            <ul className="space-y-2">
              {(pointsDa.length > 0 ? pointsDa : [rule.bodyDa]).map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          ) : languageMode === 'spoiler' ? (
            <ul className="space-y-2.5">
              {(pointsDa.length > 0 ? pointsDa : [rule.bodyDa]).map((ptDa, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  <BilingualText
                    da={ptDa}
                    ru={pointsRu[idx] ?? rule.bodyRu}
                    mode="spoiler"
                    daClassName="text-[15px] leading-relaxed font-normal"
                    ruClassName="text-xs leading-relaxed"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2.5">
              {pointsRu.map((pt, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200"
                >
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  <div>
                    <div>{pt}</div>
                    {pointsDa[idx] && (
                      <div className="mt-0.5 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                        DA: {pointsDa[idx]}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Side-by-side comparison card ("Don't confuse!") */}
      {rule.comparePair && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            <ArrowLeftRight className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>
              {languageMode === 'da_only' ? rule.comparePair.headingDa : rule.comparePair.headingRu}
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
                  {languageMode === 'spoiler' ? (
                    <BilingualText
                      da={side.summaryDa}
                      ru={side.summaryRu}
                      mode="spoiler"
                      daClassName="text-xs font-normal leading-snug mt-0.5"
                      ruClassName="text-[11px] leading-snug"
                    />
                  ) : languageMode === 'da_only' ? (
                    <p className="mt-0.5 text-xs leading-snug text-zinc-600 dark:text-zinc-400">
                      {side.summaryDa}
                    </p>
                  ) : (
                    <>
                      <p className="mt-0.5 text-xs leading-snug text-zinc-600 dark:text-zinc-400">
                        {side.summaryRu}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">
                        DA: {side.summaryDa}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exceptions callout */}
      {(rule.exceptionsRu || rule.exceptionsDa) && (
        <div className="flex items-start gap-2.5 rounded-xl border border-sky-200/80 bg-sky-50/70 p-3.5 dark:border-sky-900/60 dark:bg-sky-950/30">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <div className="text-xs leading-relaxed sm:text-sm">
            <span className="font-semibold text-sky-900 dark:text-sky-200">Исключение: </span>
            {languageMode === 'da_only' ? (
              <span className="text-sky-900/90 dark:text-sky-100">{rule.exceptionsDa}</span>
            ) : languageMode === 'spoiler' ? (
              <BilingualText
                da={rule.exceptionsDa ?? ''}
                ru={rule.exceptionsRu ?? ''}
                mode="spoiler"
                daClassName="text-xs sm:text-sm font-normal"
                ruClassName="text-xs"
              />
            ) : (
              <div>
                <span className="text-sky-900/90 dark:text-sky-100">{rule.exceptionsRu}</span>
                {rule.exceptionsDa && (
                  <div className="mt-1 text-[11px] text-sky-800/75 dark:text-sky-300/80">
                    DA: {rule.exceptionsDa}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Common trap / Exam mistake callout */}
      {(rule.trapRu || rule.trapDa) && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/90 bg-amber-50/80 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/35">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-xs leading-relaxed sm:text-sm">
            <span className="font-semibold text-amber-900 dark:text-amber-200">
              Где обычно путаются:{' '}
            </span>
            {languageMode === 'da_only' ? (
              <span className="text-amber-900/90 dark:text-amber-100">{rule.trapDa}</span>
            ) : languageMode === 'spoiler' ? (
              <BilingualText
                da={rule.trapDa ?? ''}
                ru={rule.trapRu ?? ''}
                mode="spoiler"
                daClassName="text-xs sm:text-sm font-normal"
                ruClassName="text-xs"
              />
            ) : (
              <div>
                <span className="text-amber-900/90 dark:text-amber-100">{rule.trapRu}</span>
                {rule.trapDa && (
                  <div className="mt-1 text-[11px] text-amber-800/75 dark:text-amber-300/80">
                    DA: {rule.trapDa}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
