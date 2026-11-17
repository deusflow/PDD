import React, { useMemo, useState } from 'react';
import { CheckCircle2, RotateCw, XCircle } from 'lucide-react';
import { DICTIONARY_ENTRIES } from '../../data/signsAndGlossary';
import { DictionaryEntry, LanguageMode } from '../../types';
import { SpeakButton } from '../common/SpeakButton';
import { DanishRoadSignSVG } from '../visuals/DanishRoadSignSVG';

interface LessonFlashcardsProps {
  entryIds: string[];
  languageMode: LanguageMode;
  onAnswer: (entryId: string, passed: boolean) => void;
  onComplete: () => void;
}

export const LessonFlashcards: React.FC<LessonFlashcardsProps> = ({
  entryIds,
  languageMode,
  onAnswer,
  onComplete,
}) => {
  const initialCards = useMemo(() => {
    const map = new Map<string, DictionaryEntry>();
    for (const d of DICTIONARY_ENTRIES) {
      map.set(d.id, d);
    }
    return entryIds
      .map((id) => map.get(id))
      .filter((entry): entry is DictionaryEntry => Boolean(entry));
  }, [entryIds]);

  const [queue, setQueue] = useState<DictionaryEntry[]>(initialCards);
  const [retriedIds, setRetriedIds] = useState<Record<string, boolean>>({});
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (queue.length === 0) {
    return null;
  }

  const card = queue[index];

  const handleGrade = (known: boolean) => {
    onAnswer(card.id, known);

    let nextQueue = queue;
    if (!known && !retriedIds[card.id]) {
      setRetriedIds((prev) => ({ ...prev, [card.id]: true }));
      nextQueue = [...queue, card];
      setQueue(nextQueue);
    }

    if (index + 1 < nextQueue.length) {
      setFlipped(false);
      setIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onComplete();
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>Карточки урока</span>
        <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
          {index + 1} из {queue.length}
        </span>
      </div>

      {/* 3D Flip Card */}
      <div className="perspective-1000">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
          className={`relative grid w-full cursor-pointer rounded-2xl preserve-3d motion-safe:transition-transform motion-safe:duration-300 ${
            flipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front face */}
          <div className="nordic-card col-start-1 row-start-1 flex min-h-[290px] flex-col justify-between p-6 sm:p-8 backface-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">
                {card.category === 'sign'
                  ? 'Дорожный знак'
                  : card.category === 'kontrol'
                    ? 'Технический опрос'
                    : 'Термин ПДД'}
              </span>
              <SpeakButton id={`fc_front_${card.id}`} text={card.da} size="md" />
            </div>

            <div className="my-auto flex flex-col items-center py-4 text-center">
              {card.signCode && (
                <div className="mb-4">
                  <DanishRoadSignSVG
                    code={card.signCode}
                    subPlaque={card.subPlaque}
                    size={104}
                  />
                </div>
              )}
              <div className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100">
                {card.da}
              </div>
              {languageMode === 'both' && (
                <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{card.ru}</div>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
              <RotateCw className="h-3.5 w-3.5" />
              <span>Нажмите на карточку, чтобы увидеть объяснение</span>
            </div>
          </div>

          {/* Back face */}
          <div className="nordic-card col-start-1 row-start-1 flex min-h-[290px] flex-col justify-between p-6 sm:p-8 backface-hidden rotate-y-180">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                Объяснение
              </span>
              <SpeakButton
                id={`fc_back_${card.id}`}
                text={`${card.da}. ${card.detailsDa}`}
                size="md"
              />
            </div>

            <div className="my-auto space-y-3 py-3">
              <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {languageMode !== 'da_only' ? card.ru : card.da}
              </div>
              <p className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
                {languageMode !== 'da_only' ? card.detailsRu : card.detailsDa}
              </p>
              {languageMode !== 'da_only' && (
                <p className="border-t border-zinc-200/70 pt-2.5 text-xs leading-relaxed text-zinc-400 dark:border-zinc-800">
                  {card.detailsDa}
                </p>
              )}
            </div>

            <div className="text-center text-xs text-zinc-400">
              Оцените, насколько уверенно вы это знаете
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-zinc-200/70 bg-zinc-50/90 px-4 py-3 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none dark:border-zinc-800/80 dark:bg-zinc-950/90">
        {!flipped ? (
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <RotateCw className="h-4 w-4" />
            <span>Показать ответ</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleGrade(false)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
            >
              <XCircle className="h-4 w-4" />
              <span>Не знаю</span>
            </button>
            <button
              type="button"
              onClick={() => handleGrade(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-500"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Знаю</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
