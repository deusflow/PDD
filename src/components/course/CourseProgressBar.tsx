import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Map, X } from 'lucide-react';
import { MODULES_DATA } from '../../data/modulesData';
import {
  CourseStep,
  getModuleProgress,
  REQUIRED_MOCK_EXAM_STREAK,
} from '../../services/coursePlanner';
import { CourseState, ModuleCourseProgress } from '../../types';

interface CourseProgressBarProps {
  step: CourseStep;
  celebratingModuleId: number | null;
  percent: number;
  course: CourseState;
  moduleProgress?: ModuleCourseProgress;
  onExit: () => void;
}

export const CourseProgressBar: React.FC<CourseProgressBarProps> = ({
  step,
  celebratingModuleId,
  percent,
  course,
  moduleProgress,
  onExit,
}) => {
  const [showMap, setShowMap] = useState(false);

  const getHeaderTitle = (): string => {
    if (celebratingModuleId !== null) {
      const mod = MODULES_DATA.find((m) => m.id === celebratingModuleId);
      return `Урок ${celebratingModuleId} из 8 · ${mod?.titleRu ?? ''}`;
    }

    switch (step.kind) {
      case 'theory':
      case 'flashcards':
      case 'quiz':
      case 'fix': {
        const mod = MODULES_DATA.find((m) => m.id === step.moduleId);
        return `Урок ${step.moduleId} из 8 · ${mod?.titleRu ?? ''}`;
      }
      case 'review':
        return 'Повторение пройденного';
      case 'checkpoint':
        return 'Контрольная · Уроки 1–4';
      case 'mock_exam':
        return 'Финальный этап · Пробный экзамен';
      case 'ready':
        return 'Курс завершён';
    }
  };

  const currentModuleId =
    celebratingModuleId ??
    (step.kind === 'theory' ||
    step.kind === 'flashcards' ||
    step.kind === 'quiz' ||
    step.kind === 'fix'
      ? step.moduleId
      : null);

  const isLessonStep =
    celebratingModuleId === null &&
    (step.kind === 'theory' ||
      step.kind === 'flashcards' ||
      step.kind === 'quiz' ||
      step.kind === 'fix');

  const theoryDone =
    Boolean(moduleProgress?.theoryCompleted) ||
    step.kind === 'flashcards' ||
    step.kind === 'quiz' ||
    step.kind === 'fix';
  const flashcardsDone =
    Boolean(moduleProgress?.flashcardsCompleted) ||
    step.kind === 'quiz' ||
    step.kind === 'fix';

  const stepperItems = [
    {
      id: 'theory',
      label: 'Теория',
      active: step.kind === 'theory',
      done: step.kind !== 'theory' && theoryDone,
    },
    {
      id: 'flashcards',
      label: 'Карточки',
      active: step.kind === 'flashcards',
      done: (step.kind === 'quiz' || step.kind === 'fix') && flashcardsDone,
    },
    {
      id: 'quiz',
      label: step.kind === 'fix' ? 'Ошибки' : 'Тест',
      active: step.kind === 'quiz' || step.kind === 'fix',
      done: Boolean(moduleProgress?.passed),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {/* Single service row */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {getHeaderTitle()}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white px-2.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title="Посмотреть карту курса"
          >
            <Map className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>Маршрут</span>
            {showMap ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          <span className="text-xs font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
            {percent}%
          </span>

          <button
            type="button"
            onClick={onExit}
            title="Выйти из курса"
            aria-label="Выйти из курса"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200/80 bg-white text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Thin overall course progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200/90 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-teal-600 transition-all duration-500 dark:bg-teal-400"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Collapsible Course Map */}
      {showMap && (
        <div className="nordic-card p-4 animate-slide-up">
          <div className="mb-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Маршрут курса (8 тем → Контрольная → {REQUIRED_MOCK_EXAM_STREAK} экзамена)
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
            {MODULES_DATA.slice(0, 4).map((m) => {
              const p = getModuleProgress(course, m.id);
              const isCurr = currentModuleId === m.id;
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${
                    p.passed
                      ? 'border-teal-200 bg-teal-50/70 text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300'
                      : isCurr
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                        : 'border-zinc-200/80 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400'
                  }`}
                >
                  {p.passed && <Check className="h-3 w-3 shrink-0" />}
                  <span className="truncate">Урок {m.id}</span>
                </div>
              );
            })}

            <div
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${
                course.checkpointMidPassed
                  ? 'border-teal-200 bg-teal-50/70 text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300'
                  : step.kind === 'checkpoint'
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-200/80 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400'
              }`}
            >
              {course.checkpointMidPassed && <Check className="h-3 w-3 shrink-0" />}
              <span className="truncate">Контр. 1–4</span>
            </div>

            {MODULES_DATA.slice(4, 8).map((m) => {
              const p = getModuleProgress(course, m.id);
              const isCurr = currentModuleId === m.id;
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${
                    p.passed
                      ? 'border-teal-200 bg-teal-50/70 text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300'
                      : isCurr
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                        : 'border-zinc-200/80 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400'
                  }`}
                >
                  {p.passed && <Check className="h-3 w-3 shrink-0" />}
                  <span className="truncate">Урок {m.id}</span>
                </div>
              );
            })}

            <div
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${
                course.mockExamStreak >= REQUIRED_MOCK_EXAM_STREAK
                  ? 'border-teal-200 bg-teal-50/70 text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300'
                  : step.kind === 'mock_exam'
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-200/80 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400'
              }`}
            >
              {course.mockExamStreak >= REQUIRED_MOCK_EXAM_STREAK && (
                <Check className="h-3 w-3 shrink-0" />
              )}
              <span className="truncate">
                Экзамен ({course.mockExamStreak}/{REQUIRED_MOCK_EXAM_STREAK})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3-dot lesson stepper */}
      {isLessonStep && (
        <div className="flex items-center justify-center gap-2 pt-1 sm:gap-3">
          {stepperItems.map((item, idx) => (
            <React.Fragment key={item.id}>
              <div className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                    item.done
                      ? 'bg-teal-600 text-white dark:bg-teal-500'
                      : item.active
                        ? 'border-2 border-teal-600 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-950/60 dark:text-teal-300'
                        : 'border border-zinc-300 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500'
                  }`}
                >
                  {item.done ? <Check className="h-3 w-3" /> : idx + 1}
                </span>
                <span
                  className={`text-xs font-medium ${
                    item.active
                      ? 'font-semibold text-zinc-900 dark:text-zinc-100'
                      : item.done
                        ? 'text-teal-700 dark:text-teal-300'
                        : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {idx < stepperItems.length - 1 && (
                <div
                  className={`h-px w-6 sm:w-10 ${
                    item.done ? 'bg-teal-500' : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
