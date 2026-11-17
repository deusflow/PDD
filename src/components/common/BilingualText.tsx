import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { LanguageMode } from '../../types';

interface BilingualTextProps {
  da: string;
  ru: string;
  mode: LanguageMode;
  /** When true (e.g. inside answer breakdown), allows showing Russian even in 'da_only' mode */
  revealInExplanation?: boolean;
  /** 'slash' renders "DA / RU", 'stacked' renders DA above muted RU */
  variant?: 'slash' | 'stacked';
  daClassName?: string;
  ruClassName?: string;
  className?: string;
}

export const BilingualText: React.FC<BilingualTextProps> = ({
  da,
  ru,
  mode,
  revealInExplanation = false,
  variant = 'stacked',
  daClassName = '',
  ruClassName = '',
  className = '',
}) => {
  const [revealed, setRevealed] = useState(false);

  // Mode 3: Kun Dansk (hidden unless inside post-answer explanation block)
  if (mode === 'da_only' && !revealInExplanation) {
    return <span className={`text-zinc-900 dark:text-zinc-100 ${daClassName} ${className}`}>{da}</span>;
  }

  // Mode 1: Both visible (or post-answer breakdown in da_only)
  if (mode === 'both' || (mode === 'da_only' && revealInExplanation)) {
    if (variant === 'slash') {
      return (
        <span className={className}>
          <span className={`font-medium text-zinc-900 dark:text-zinc-100 ${daClassName}`}>{da}</span>
          <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">/</span>
          <span className={`text-zinc-500 dark:text-zinc-400 ${ruClassName}`}>{ru}</span>
        </span>
      );
    }

    return (
      <span className={`block ${className}`}>
        <span className={`block font-medium text-zinc-900 dark:text-zinc-100 ${daClassName}`}>
          {da}
        </span>
        <span
          className={`mt-1 block text-sm leading-snug text-zinc-500 dark:text-zinc-400 ${ruClassName}`}
        >
          <span className="mr-1.5 text-zinc-300 dark:text-zinc-600">/</span>
          {ru}
        </span>
      </span>
    );
  }

  // Mode 2: Spoiler Mode — Danish visible, Russian hidden behind interactive pill
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealed((prev) => !prev);
  };

  return (
    <span className={`block ${className}`}>
      <span className={`block font-medium text-zinc-900 dark:text-zinc-100 ${daClassName}`}>
        {da}
      </span>
      <span className="mt-1.5 inline-flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={handleToggle}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-left text-xs transition-all ${
            revealed
              ? 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300'
              : 'border-dashed border-zinc-300 bg-zinc-100/80 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200'
          }`}
          title={revealed ? 'Скрыть перевод' : 'Показать перевод на русский'}
        >
          {revealed ? (
            <>
              <EyeOff className="h-3 w-3 shrink-0 text-zinc-400" />
              <span className={`text-xs sm:text-sm ${ruClassName}`}>{ru}</span>
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 shrink-0" />
              <span>Показать перевод</span>
            </>
          )}
        </button>
      </span>
    </span>
  );
};
