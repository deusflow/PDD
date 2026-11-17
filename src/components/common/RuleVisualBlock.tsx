import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
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

  return (
    <div className="space-y-4">
      {rule.visual && <div>{renderVisual()}</div>}

      {/* Main bullet points ("How to do it right") */}
      {pointsRu.length > 0 || pointsDa.length > 0 ? (
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
            <ul className="space-y-2">
              {pointsRu.map((pt, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-[15px] leading-7 text-zinc-800 dark:text-zinc-200"
                >
                  <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-[15px] leading-7 text-zinc-800 dark:text-zinc-200">
          {languageMode === 'da_only' ? rule.bodyDa : rule.bodyRu}
        </p>
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
              <span className="text-sky-900/90 dark:text-sky-100">{rule.exceptionsRu}</span>
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
              <span className="text-amber-900/90 dark:text-amber-100">{rule.trapRu}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
