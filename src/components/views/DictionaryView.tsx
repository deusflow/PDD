import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Search,
  Signpost,
  Volume2,
  X,
} from 'lucide-react';
import { DICTIONARY_ENTRIES } from '../../data/signsAndGlossary';
import { BOX_META, getSRSRecord } from '../../services/srsEngine';
import { LanguageMode, SRSRecord } from '../../types';
import { extractOrdnetLookupWords, getOrdnetUrl } from '../../utils/ordnet';
import { BilingualText } from '../common/BilingualText';
import { SpeakButton } from '../common/SpeakButton';
import { DictionaryVisualThumbnail } from '../visuals/DictionaryVisualThumbnail';
import { SignBlitzModal } from './SignBlitzModal';

interface DictionaryViewProps {
  srsMap: Record<string, SRSRecord>;
  languageMode: LanguageMode;
  initialCategory?: CategoryFilter;
  onRecordEntryReview: (entryId: string, passed: boolean) => void;
}

export type CategoryFilter = 'all' | 'term' | 'sign' | 'kontrol' | 'sign_kontrol';
type StatusFilter = 'all' | 'unknown' | 'learning' | 'mastered';

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  srsMap,
  languageMode,
  initialCategory = 'all',
  onRecordEntryReview,
}) => {
  const [query, setQuery] = useState('');
  const [customPhrase, setCustomPhrase] = useState('Anvisninger for færdslen');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(initialCategory);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isSignBlitzOpen, setIsSignBlitzOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DICTIONARY_ENTRIES.filter((entry) => {
      if (categoryFilter === 'sign_kontrol') {
        if (entry.category !== 'sign' && entry.category !== 'kontrol') return false;
      } else if (categoryFilter !== 'all' && entry.category !== categoryFilter) {
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

  const signCount = useMemo(
    () => DICTIONARY_ENTRIES.filter((entry) => entry.category === 'sign').length,
    []
  );

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
              {DICTIONARY_ENTRIES.length} карточек: датские термины, {signCount} дорожных знаков и весь Kontrolprøven
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSignBlitzOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-teal-500"
            >
              <Signpost className="h-3.5 w-3.5" />
              Блиц по знакам (10)
            </button>
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Найдено: <span className="text-zinc-900 dark:text-zinc-100">{filtered.length}</span>
            </div>
          </div>
        </div>

        {/* Search + Live Danish Pronouncer & DDO (ordnet.dk) side-by-side on desktop */}
        <div className="mt-4 grid gap-3 lg:grid-cols-12">
          <div className="relative lg:col-span-6">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по базе (hajtænder, C62, vigepligt, manøvre)..."
              className="h-10 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
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

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 px-3 py-1.5 lg:col-span-6 dark:border-zinc-800 dark:bg-zinc-950/60">
            <Volume2 className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
            <input
              type="text"
              value={customPhrase}
              onChange={(e) => setCustomPhrase(e.target.value)}
              placeholder="Вставьте слово/фразу (напр. Anvisninger for færdslen)"
              className="min-w-[160px] flex-1 bg-transparent text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
            />
            {customPhrase.trim() && (
              <>
                <SpeakButton
                  id="dict_custom_phrase"
                  text={customPhrase.trim()}
                  label="Озвучить"
                  title="Озвучить введённую фразу по-датски (da-DK)"
                />
                {extractOrdnetLookupWords(customPhrase, 2).map((w) => (
                  <a
                    key={w}
                    href={getOrdnetUrl(w)}
                    target="_blank"
                    rel="noreferrer"
                    title={`Открыть «${w}» на ordnet.dk/ddo (студийная озвучка и формы слова)`}
                    className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-800 transition-colors hover:bg-teal-100 dark:border-teal-800/70 dark:bg-teal-950/50 dark:text-teal-300"
                  >
                    <span>DDO: {w}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Category + Status Filters */}
        <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Все' },
              { id: 'sign_kontrol', label: 'Знаки + Kontrolprøven' },
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((entry) => {
            const rec = getSRSRecord(srsMap, entry.id);
            const meta = BOX_META[rec.box];
            const catLabel =
              entry.category === 'sign'
                ? 'Знак'
                : entry.category === 'kontrol'
                  ? 'Kontrolprøven'
                  : 'Термин';
            const ddoWords = extractOrdnetLookupWords(entry.da, 3);

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
                    <DictionaryVisualThumbnail entry={entry} size="sm" />
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

                <div className="mt-3 space-y-2 border-t border-zinc-200/80 pt-2.5 dark:border-zinc-800">
                  {ddoWords.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-zinc-400">ordnet.dk:</span>
                      {ddoWords.map((w) => (
                        <a
                          key={w}
                          href={getOrdnetUrl(w)}
                          target="_blank"
                          rel="noreferrer"
                          title={`Открыть «${w}» на Den Danske Ordbog (аудио и транскрипция)`}
                          className="inline-flex items-center gap-0.5 rounded-md border border-zinc-200/80 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700 transition-colors hover:border-teal-300 hover:bg-teal-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-teal-400 dark:hover:border-teal-800"
                        >
                          <span>{w}</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* SRS quick self-check actions */}
                  <div className="flex gap-2">
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
              </div>
            );
          })}
        </div>
      )}

      <SignBlitzModal
        isOpen={isSignBlitzOpen}
        srsMap={srsMap}
        languageMode={languageMode}
        onRecordEntryReview={onRecordEntryReview}
        onClose={() => setIsSignBlitzOpen(false)}
      />
    </div>
  );
};
