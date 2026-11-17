import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  RotateCcw,
  Signpost,
  X,
  XCircle,
} from 'lucide-react';
import { DICTIONARY_ENTRIES } from '../../data/signsAndGlossary';
import { shuffleItems } from '../../services/coursePlanner';
import { getSRSRecord } from '../../services/srsEngine';
import { DictionaryEntry, LanguageMode, SRSRecord } from '../../types';
import { SpeakButton } from '../common/SpeakButton';
import { DanishRoadSignSVG } from '../visuals/DanishRoadSignSVG';

interface SignBlitzModalProps {
  isOpen: boolean;
  srsMap: Record<string, SRSRecord>;
  languageMode: LanguageMode;
  onRecordEntryReview: (entryId: string, passed: boolean) => void;
  onClose: () => void;
}

interface BlitzRound {
  target: DictionaryEntry;
  options: DictionaryEntry[];
}

function buildBlitzRounds(srsMap: Record<string, SRSRecord>, count: number = 10): BlitzRound[] {
  const allSigns = DICTIONARY_ENTRIES.filter((e) => e.category === 'sign' && Boolean(e.signCode));
  const sorted = [...allSigns].sort((a, b) => {
    const ba = getSRSRecord(srsMap, a.id).box;
    const bb = getSRSRecord(srsMap, b.id).box;
    if (ba === 1 && bb !== 1) return -1;
    if (bb === 1 && ba !== 1) return 1;
    if (ba === 0 && bb !== 0) return -1;
    if (bb === 0 && ba !== 0) return 1;
    return ba - bb;
  });

  const pool = shuffleItems(sorted.slice(0, Math.min(allSigns.length, count + 8))).slice(0, count);

  return pool.map((target) => {
    const distractors = shuffleItems(allSigns.filter((s) => s.id !== target.id)).slice(0, 3);
    return {
      target,
      options: shuffleItems([target, ...distractors]),
    };
  });
}

export const SignBlitzModal: React.FC<SignBlitzModalProps> = ({
  isOpen,
  srsMap,
  languageMode,
  onRecordEntryReview,
  onClose,
}) => {
  const [rounds, setRounds] = useState<BlitzRound[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setRounds(buildBlitzRounds(srsMap, 10));
    setIndex(0);
    setSelectedId(null);
    setScore(0);
    setFinished(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (finished || rounds.length === 0) return;
      const currentRound = rounds[index];
      if (!currentRound) return;

      if (selectedId === null && ['1', '2', '3', '4'].includes(e.key)) {
        const opt = currentRound.options[Number(e.key) - 1];
        if (opt) {
          e.preventDefault();
          setSelectedId(opt.id);
          const ok = opt.id === currentRound.target.id;
          if (ok) setScore((s) => s + 1);
          onRecordEntryReview(currentRound.target.id, ok);
        }
      } else if (e.key === 'Enter' && selectedId !== null) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'BUTTON') return;
        e.preventDefault();
        if (index + 1 >= rounds.length) {
          setFinished(true);
        } else {
          setIndex((i) => i + 1);
          setSelectedId(null);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, finished, rounds, index, selectedId, onRecordEntryReview]);

  if (!isOpen || rounds.length === 0) return null;

  const current = rounds[index];
  const isAnswered = selectedId !== null;
  const isCorrect = selectedId === current.target.id;

  const handleChoose = (optId: string) => {
    if (isAnswered) return;
    setSelectedId(optId);
    const ok = optId === current.target.id;
    if (ok) setScore((s) => s + 1);
    onRecordEntryReview(current.target.id, ok);
  };

  const handleNext = () => {
    if (index + 1 >= rounds.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelectedId(null);
    }
  };

  const handleRestart = () => {
    setRounds(buildBlitzRounds(srsMap, 10));
    setIndex(0);
    setSelectedId(null);
    setScore(0);
    setFinished(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-blitz-title"
    >
      <div
        className="nordic-card flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200/80 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
              <Signpost className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="sign-blitz-title"
                className="text-base font-bold text-zinc-900 dark:text-zinc-50"
              >
                Блиц-тест по дорожным знакам Дании
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                10 знаков с приоритетом ещё не выученных (обновляет SRS-коробки)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!finished && (
              <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {index + 1} / {rounds.length} · Верно: {score}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть блиц-тест"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {finished ? (
          <div className="flex flex-col items-center space-y-4 px-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Результат блица: {score} из {rounds.length}
            </h3>
            <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              Ошибки автоматически отправлены в Box 1, а верные знаки продвинулись выше.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                <RotateCcw className="h-4 w-4" />
                Ещё 10 знаков
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-200 px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200"
              >
                Закрыть
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 overflow-y-auto px-6 py-5">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-zinc-50/70 py-6 dark:border-zinc-800 dark:bg-zinc-950/60">
              <DanishRoadSignSVG
                code={current.target.signCode ?? 'B11'}
                subPlaque={current.target.subPlaque}
                size={132}
              />
              <p className="mt-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Что означает этот датский знак?
              </p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {current.options.map((opt) => {
                const chosen = selectedId === opt.id;
                const right = opt.id === current.target.id;
                let cls =
                  'border-zinc-200/90 bg-white hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600';
                if (isAnswered) {
                  if (right) {
                    cls =
                      'border-teal-500 bg-teal-50/70 dark:border-teal-500 dark:bg-teal-950/40';
                  } else if (chosen) {
                    cls =
                      'border-rose-400 bg-rose-50/70 dark:border-rose-500 dark:bg-rose-950/40';
                  } else {
                    cls = 'border-zinc-200/60 opacity-55 dark:border-zinc-800';
                  }
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleChoose(opt.id)}
                    className={`flex items-start justify-between gap-2.5 rounded-xl border p-3.5 text-left transition-all ${cls}`}
                  >
                    <div className="space-y-0.5">
                      {languageMode !== 'da_only' && (
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {opt.ru}
                        </div>
                      )}
                      <div
                        className={
                          languageMode === 'da_only'
                            ? 'text-xs font-bold text-zinc-900 dark:text-zinc-100'
                            : 'text-[11px] text-zinc-500 dark:text-zinc-400'
                        }
                      >
                        {opt.da}
                      </div>
                    </div>
                    {isAnswered && right && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                    )}
                    {isAnswered && chosen && !right && (
                      <XCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div
                className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 text-xs leading-relaxed animate-slide-up ${
                  isCorrect
                    ? 'border-teal-200 bg-teal-50/70 text-teal-900 dark:border-teal-900/60 dark:bg-teal-950/30 dark:text-teal-200'
                    : 'border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200'
                }`}
              >
                <div className="space-y-1">
                  {languageMode !== 'da_only' && <p>{current.target.detailsRu}</p>}
                  <p className="text-[11px] opacity-85">{current.target.detailsDa}</p>
                </div>
                <SpeakButton id={`blitz_${current.target.id}`} text={current.target.da} size="sm" />
              </div>
            )}
          </div>
        )}

        {!finished && (
          <div className="flex items-center justify-between border-t border-zinc-200/80 bg-zinc-50/70 px-6 py-3.5 dark:border-zinc-800 dark:bg-zinc-950/50">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {isAnswered
                ? 'Enter — следующий знак · Esc — закрыть'
                : 'Клавиши 1–4 — быстрый выбор ответа'}
            </span>
            <button
              type="button"
              disabled={!isAnswered}
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {index + 1 >= rounds.length ? 'Итоги блица' : 'Дальше'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
