import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { DICTIONARY_ENTRIES } from '../../data/signsAndGlossary';
import { BOX_META, getSRSRecord } from '../../services/srsEngine';
import { LanguageMode, SRSRecord } from '../../types';
import { BilingualText } from '../common/BilingualText';
import { SpeakButton } from '../common/SpeakButton';
import { DanishRoadSignSVG } from '../visuals/DanishRoadSignSVG';

interface DictionaryViewProps {
  srsMap: Record<string, SRSRecord>;
  languageMode: LanguageMode;
  onRecordEntryReview: (entryId: string, passed: boolean) => void;
}

type CategoryFilter = 'all' | 'term' | 'sign' | 'kontrol';
type StatusFilter = 'all' | 'unknown' | 'learning' | 'mastered';

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  srsMap,
  languageMode,
  onRecordEntryReview,
}) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DICTIONARY_ENTRIES.filter((entry) => {
      if (categoryFilter !== 'all' && entry.category !== categoryFilter) {
        return false;
      }

      const rec = getSRSRecord(srsMap, entry.id);
      if (statusFilter === 'unknown' && rec.box > 1) return false;
      if (statusFilter === 'learning' && (rec.box < 2 || rec.box > 3)) return false;
      if (statusFilter === 'mastered' && rec.box < 4) return false;

      if (!q) return true;
      return (
        entry.da.toLowerCase().includes(q) ||
        entry.ru.toLowerCase().includes(q) ||
        entry.detailsDa.toLowerCase().includes(q) ||
        entry.detailsRu.toLowerCase().includes(q) ||
        (entry.signCode?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [query, categoryFilter, statusFilter, srsMap]);

  const counts = useMemo(() => {
    let unknown = 0;
    let learning = 0;
    let mastered = 0;
    for (const e of DICTIONARY_ENTRIES) {
      const box = getSRSRecord(srsMap, e.id).box;
      if (box <= 1) unknown += 1;
      else if (box <= 3) learning += 1;
      else mastered += 1;
    }
    return { unknown, learning, mastered };
  }, [srsMap]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Search and Filter Controls */}
      <section className="nordic-card p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Словарь и Шпаргалка (Ordbog &amp; Hurtig-Tjek)
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {DICTIONARY_ENTRIES.length} карточек: датские термины, 32 дорожных знака и весь Kontrolprøven
            </p>
          </div>
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Найдено: <span className="text-zinc-900 dark:text-zinc-100">{filtered.length}</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по-датски или по-русски (напр.: hajtænder, 1,6 mm, C62, vigepligt)..."
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Очистить поиск"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category + Status Filters */}
        <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Все' },
              { id: 'term', label: 'Термины' },
              { id: 'sign', label: 'Знаки' },
              { id: 'kontrol', label: 'Kontrolprøven' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                  categoryFilter === cat.id
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: `Любой статус` },
              { id: 'unknown', label: `Не знаю (${counts.unknown})` },
              { id: 'learning', label: `Повторяю (${counts.learning})` },
              { id: 'mastered', label: `Выучил (${counts.mastered})` },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id as StatusFilter)}
                className={`rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === st.id
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Grid */}
      {filtered.length === 0 ? (
        <div className="nordic-card p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          По вашему запросу ничего не найдено. Попробуйте изменить фильтры.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((entry) => {
            const rec = getSRSRecord(srsMap, entry.id);
            const meta = BOX_META[rec.box];
            const catLabel =
              entry.category === 'sign'
                ? 'Знак'
                : entry.category === 'kontrol'
                  ? 'Kontrolprøven'
                  : 'Термин';

            return (
              <div
                key={entry.id}
                className="nordic-card flex flex-col justify-between p-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div>
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="nordic-pill">{catLabel}</span>
                      <span className="text-[10px] font-semibold text-zinc-400">
                        M{entry.moduleId}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badgeClass}`}
                      >
                        Box {rec.box} • {meta.labelRu}
                      </span>
                      <SpeakButton
                        id={`dict_${entry.id}`}
                        text={`${entry.da}. ${entry.detailsDa}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    {entry.signCode && (
                      <div className="shrink-0 rounded-xl border border-zinc-200/80 bg-zinc-50 p-1.5 dark:border-zinc-800 dark:bg-zinc-950">
                        <DanishRoadSignSVG
                          code={entry.signCode}
                          subPlaque={entry.subPlaque}
                          size={60}
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <BilingualText
                        da={entry.da}
                        ru={entry.ru}
                        mode={languageMode}
                        daClassName="text-sm font-bold"
                        ruClassName="text-xs"
                      />
                      <BilingualText
                        da={entry.detailsDa}
                        ru={entry.detailsRu}
                        mode={languageMode}
                        daClassName="text-xs font-normal leading-relaxed text-zinc-600 dark:text-zinc-300"
                        ruClassName="text-[11px] leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* SRS quick self-check actions */}
                <div className="mt-3 flex gap-2 border-t border-zinc-200/80 pt-2.5 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => onRecordEntryReview(entry.id, false)}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-rose-200 bg-white py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:bg-zinc-900 dark:text-rose-400"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Не знаю (Box 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => onRecordEntryReview(entry.id, true)}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50/80 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Выучил (+Box)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
