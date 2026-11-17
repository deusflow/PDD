import React from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  RefreshCw,
  Wrench,
  Zap,
} from 'lucide-react';

export interface InterstitialConfig {
  variant: 'review' | 'fix' | 'checkpoint' | 'mock_exam' | 'lesson_passed' | 'ready';
  title: string;
  description: string;
  buttonLabel: string;
  statsText?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  secondaryLabel?: string;
  onTertiary?: () => void;
  tertiaryLabel?: string;
}

export const CourseInterstitial: React.FC<InterstitialConfig> = ({
  variant,
  title,
  description,
  buttonLabel,
  statsText,
  onPrimary,
  onSecondary,
  secondaryLabel,
  onTertiary,
  tertiaryLabel,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'review':
        return (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <RefreshCw className="h-7 w-7" />
          </div>
        );
      case 'fix':
        return (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <Wrench className="h-7 w-7" />
          </div>
        );
      case 'checkpoint':
        return (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            <ClipboardCheck className="h-7 w-7" />
          </div>
        );
      case 'mock_exam':
        return (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            <FileCheck2 className="h-7 w-7" />
          </div>
        );
      case 'lesson_passed':
        return (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 motion-safe:animate-pop-check dark:bg-teal-950 dark:text-teal-400">
            <CheckCircle2 className="h-9 w-9" />
          </div>
        );
      case 'ready':
        return (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 motion-safe:animate-pop-check dark:bg-teal-950 dark:text-teal-400">
            <Award className="h-9 w-9" />
          </div>
        );
    }
  };

  return (
    <div className="mx-auto max-w-2xl motion-safe:animate-slide-up">
      <div className="nordic-card flex flex-col items-center p-7 text-center sm:p-10">
        {getIcon()}

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
          {title}
        </h1>

        <p className="mt-2.5 max-w-md text-[15px] leading-7 text-zinc-600 sm:text-base dark:text-zinc-400">
          {description}
        </p>

        {statsText && (
          <div className="mt-4 rounded-xl border border-zinc-200/70 bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300">
            {statsText}
          </div>
        )}

        <div className="mt-7 flex w-full max-w-sm flex-col gap-2.5">
          <button
            type="button"
            onClick={onPrimary}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-500"
          >
            <span>{buttonLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {onSecondary && secondaryLabel && (
            <button
              type="button"
              onClick={onSecondary}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Zap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>{secondaryLabel}</span>
            </button>
          )}

          {onTertiary && tertiaryLabel && (
            <button
              type="button"
              onClick={onTertiary}
              className="inline-flex h-10 w-full items-center justify-center rounded-xl text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {tertiaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
