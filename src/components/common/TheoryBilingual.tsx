import React from 'react';
import { LanguageMode } from '../../types';
import { BilingualText } from './BilingualText';

interface TheoryBilingualProps {
  ru: string;
  da?: string;
  mode: LanguageMode;
  ruClassName?: string;
  daClassName?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Unified RU-first bilingual display for theory modules, diagrams, and handbooks.
 * Keeps Danish clearly readable below Russian with a subtle teal DA badge in 'both' mode.
 */
export const TheoryBilingual: React.FC<TheoryBilingualProps> = ({
  ru,
  da,
  mode,
  ruClassName = '',
  daClassName = '',
  className = '',
  compact = false,
}) => {
  const danishText = da?.trim() || ru;

  if (mode === 'da_only') {
    return (
      <span className={`block text-zinc-900 dark:text-zinc-100 ${ruClassName} ${className}`}>
        {danishText}
      </span>
    );
  }

  if (mode === 'spoiler') {
    return (
      <BilingualText
        da={danishText}
        ru={ru}
        mode="spoiler"
        daClassName={ruClassName}
        ruClassName={daClassName}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <div className={`text-zinc-900 dark:text-zinc-100 ${ruClassName}`}>{ru}</div>
      {da && da.trim().length > 0 && (
        <div
          className={`flex items-start gap-1.5 text-teal-950/85 dark:text-teal-200/90 ${
            compact ? 'mt-1 text-xs leading-snug' : 'mt-1.5 text-[13px] leading-relaxed'
          } ${daClassName}`}
        >
          <span className="mt-0.5 inline-flex shrink-0 items-center rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-teal-800 dark:bg-teal-950 dark:text-teal-300">
            DA
          </span>
          <span className="min-w-0 flex-1">{da}</span>
        </div>
      )}
    </div>
  );
};
