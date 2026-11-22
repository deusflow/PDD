import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Play,
  RotateCcw,
  ShieldCheck,
  Signpost,
} from 'lucide-react';
import { MODULES_DATA } from '../../data/modulesData';
import { QUESTIONS_BANK } from '../../data/questionsBank';
import { DICTIONARY_ENTRIES } from '../../data/signsAndGlossary';
import { shuffleItems } from '../../services/coursePlanner';
import { loadAllTheorySlideIndices } from '../../services/sessionPersistence';
import { BOX_META, computeProgressStats, getSRSRecord } from '../../services/srsEngine';
import { LanguageMode, LessonTab, ModuleCourseProgress, SRSRecord, TeoriQuestion } from '../../types';
import { extractOrdnetLookupWords, getOrdnetUrl } from '../../utils/ordnet';
import { BilingualText } from '../common/BilingualText';
import { RuleVisualBlock } from '../common/RuleVisualBlock';
import { SpeakButton } from '../common/SpeakButton';
import { LessonTheory } from '../course/LessonTheory';
import { CarTechnicalSVG } from '../visuals/CarTechnicalSVG';
import { DanishRoadSignSVG } from '../visuals/DanishRoadSignSVG';
import { DictionaryVisualThumbnail } from '../visuals/DictionaryVisualThumbnail';
import { LessonHeroIllustration } from '../visuals/LessonHeroIllustration';

interface ModulesViewProps {
  selectedModuleId: number;
  initialViewMode?: 'list' | 'lesson';
  initialLessonTab?: LessonTab;
  onSelectModule: (id: number) => void;
  onViewModeChange?: (mode: 'list' | 'lesson') => void;
  onLessonTabChange?: (tab: LessonTab) => void;
  srsMap: Record<string, SRSRecord>;
  courseModules?: Record<number, ModuleCourseProgress>;
  languageMode: LanguageMode;
  onStartModuleQuiz: (
    title: string,
    subtitle: string,
    questions: TeoriQuestion[],
    moduleId?: number
  ) => void;
  onMarkTheoryRead?: (moduleId: number) => void;
  onRecordEntryReview: (entryId: string, passed: boolean) => void;
  onOpenCourse: () => void;
}

export const ModulesView: React.FC<ModulesViewProps> = ({
  selectedModuleId,
  initialViewMode = 'list',
  initialLessonTab = 'slides',
  onSelectModule,
  onViewModeChange,
  onLessonTabChange,
  srsMap,
  courseModules,
  languageMode,
  onStartModuleQuiz,
  onMarkTheoryRead,
  onRecordEntryReview,
  onOpenCourse,
}) => {
  const [activeId, setActiveId] = useState<number>(selectedModuleId);
  const [viewMode, setViewMode] = useState<'list' | 'lesson'>(initialViewMode);
  const [lessonTab, setLessonTab] = useState<LessonTab>(initialLessonTab);
  const [showSchoolPlan, setShowSchoolPlan] = useState(false);
  const [docChecks, setDocChecks] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('dk_pdd_doc_checklist_v1');
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });

  const toggleDocCheck = (key: string) => {
    setDocChecks((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('dk_pdd_doc_checklist_v1', JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  useEffect(() => {
    setActiveId(selectedModuleId);
  }, [selectedModuleId]);

  useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode]);

  useEffect(() => {
    setLessonTab(initialLessonTab);
  }, [initialLessonTab]);

  const handleOpenLesson = (id: number) => {
    setActiveId(id);
    onSelectModule(id);
    setViewMode('lesson');
    onViewModeChange?.('lesson');
    setLessonTab('slides');
    onLessonTabChange?.('slides');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const savedSlideIndices = viewMode === 'list' ? loadAllTheorySlideIndices() : {};

  if (viewMode === 'list') {
    return (
      <div className="mx-auto max-w-7xl space-y-5 animate-fade-in">
        <section className="nordic-card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100">
              Справочник курса: 8 обязательных тем
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Свободное чтение любого модуля или последовательное прохождение в управляемом курсе.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSchoolPlan((v) => !v)}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>План автошколы (M1–M5)</span>
            </button>
            <button
              type="button"
              onClick={onOpenCourse}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-teal-500 sm:text-sm"
            >
              <span>Пройти в режиме курса</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {showSchoolPlan && (
          <section className="nordic-card space-y-5 p-5 sm:p-6 animate-fade-in">
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Структура датской автошколы (Undervisningsplan B • Forløbsplan)
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Как 8 тем курса соответствуют 5 обязательным модулям датской автошколы (29 теория + 4 площадка + 16 дорога + 4 KTA):
                </p>
                <div className="mt-3 space-y-2 text-xs">
                  {[
                    { code: 'M1', da: 'Grundlæggende trafikforståelse', ru: 'Поведение, § 3, восприятие, манёвренность ТС, сигналы (Уроки 1, 2, 3)', lessons: 'Mål 3, 4, 5.1, 6.1–6.2' },
                    { code: 'M2', da: 'Forberedende teori + Manøvrebane', ru: 'Устройство авто, документы + 3–4 ч площадка (Уроки 1, 2)', lessons: 'Mål 1.1–1.3, 2.1–2.9' },
                    { code: 'M3', da: 'Grundlæggende kørsel på vej', ru: 'Базовая езда: знаки, перекрёстки, круги, велосипедисты (Уроки 3, 4, 5)', lessons: 'Mål 7.1–7.4, 7.6–7.15' },
                    { code: 'M4', da: 'Udvidet kørsel på vej', ru: 'Обгон, Motorvej, E43, туннель, Letbane, ночь и парковка (Уроки 4, 6, 7)', lessons: 'Mål 7.5, 7.9, 7.16–7.21, 8' },
                    { code: 'M5', da: 'Afsluttende + Glatbane (KTA)', ru: 'Скользкая площадка, обочина rabat, экзамены (Урок 8 + Контроль)', lessons: 'Mål 9.1–9.5, 7.22, 10' },
                  ].map((st) => (
                    <div key={st.code} className="flex items-start gap-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-950/60">
                      <span className="shrink-0 rounded-md bg-teal-600 px-2 py-0.5 text-[11px] font-bold text-white">
                        {st.code}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{st.da}</div>
                        <div className="text-[11px] text-zinc-600 dark:text-zinc-400">{st.ru}</div>
                        <div className="mt-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-400">{st.lessons}</div>
                      </div>
                      <SpeakButton id={`school_stage_${st.code}`} text={st.da} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Чек-лист допуска к экзамену (Tjekliste)
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Обязательные документы, без которых автошкола не сможет записать вас на Teoriprøve:
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    { id: 'pasfoto', daTerm: 'Pasfoto', title: '📷 Pasfoto (фото 35×45 мм)', desc: 'Строгие требования полиции (лучше фотоателье / Fotoportalen, автоматы часто отклоняют).' },
                    { id: 'laegeattest', daTerm: 'Digital lægeattest', title: '🩺 Digital Lægeattest (справка от врача)', desc: 'Сначала заполните Del A на Borger.dk, затем семейный врач оформит Del B.' },
                    { id: 'forstehjaelp', daTerm: 'Færdselsrelateret førstehjælpsbevis', title: '⛑️ Førstehjælpsbevis (8 ч первой помощи)', desc: 'Сертификат Færdselsrelateret førstehjælp (не старше 12 мес при подаче!).' },
                    { id: 'fuldmagt', daTerm: 'Fuldmagt', title: '✍️ Fuldmagt (доверенность школе)', desc: 'Подписывается через MitID на Borger.dk, чтобы школа могла бронировать экзамены.' },
                  ].map((doc) => {
                    const checked = Boolean(docChecks[doc.id]);
                    return (
                      <div
                        key={doc.id}
                        className={`flex w-full items-start gap-2 rounded-xl border p-3 transition-colors ${
                          checked
                            ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30'
                            : 'border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleDocCheck(doc.id)}
                          className="flex flex-1 items-start gap-3 text-left"
                        >
                          <CheckCircle2
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              checked ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-300 dark:text-zinc-600'
                            }`}
                          />
                          <div>
                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{doc.title}</div>
                            <div className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">{doc.desc}</div>
                          </div>
                        </button>
                        <SpeakButton id={`doc_${doc.id}`} text={doc.daTerm} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MODULES_DATA.map((item) => {
            const qs = QUESTIONS_BANK.filter((q) => q.moduleId === item.id);
            const st = computeProgressStats(
              qs.map((q) => q.id),
              srsMap
            );

            const hasErrors = st.boxCounts[1] > 0;
            const coursePassed = Boolean(courseModules?.[item.id]?.passed);
            const isPassed =
              coursePassed || (!hasErrors && st.totalItems > 0 && st.seenItems === st.totalItems);
            const isInProgress = !hasErrors && !isPassed && st.seenItems > 0;

            return (
              <div
                key={item.id}
                className="nordic-card group flex flex-col justify-between overflow-hidden transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-nordic-lg dark:hover:border-zinc-700"
              >
                <div>
                  {/* Cover Thumbnail Preview */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                    <img
                      src={`./images/lessons/module-${item.id}.jpg`}
                      alt={item.titleRu}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-950/15 to-transparent" />
                    <div className="absolute inset-x-3 top-2.5 flex items-center justify-between gap-2">
                      <span className="rounded-lg bg-zinc-950/80 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                        Урок {item.id}
                      </span>
                      {hasErrors ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-600/90 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                          <AlertTriangle className="h-3 w-3" />
                          Ошибки ({st.boxCounts[1]})
                        </span>
                      ) : isPassed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                          <CheckCircle2 className="h-3 w-3" />
                          Пройден
                        </span>
                      ) : isInProgress ? (
                        <span className="rounded-full bg-sky-600/90 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                          {st.seenItems}/{st.totalItems}
                        </span>
                      ) : null}
                    </div>
                    {item.schoolStage && (
                      <span className="absolute bottom-2.5 left-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-teal-900 backdrop-blur-sm dark:bg-zinc-900/90 dark:text-teal-300">
                        Школа M{item.schoolStage}
                      </span>
                    )}
                  </div>

                  <div className="p-4 pb-0">
                    {languageMode !== 'da_only' ? (
                      <>
                        <h2 className="text-[15px] font-bold leading-snug text-zinc-900 dark:text-zinc-100">
                          {item.titleRu}
                        </h2>
                        <div className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {item.titleDa}
                        </div>
                      </>
                    ) : (
                      <h2 className="text-[15px] font-bold leading-snug text-zinc-900 dark:text-zinc-100">
                        {item.titleDa}
                      </h2>
                    )}

                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {languageMode !== 'da_only' ? item.subtitleRu : item.subtitleDa}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 p-4 pt-0">
                  {/* Micro progress bar */}
                  <div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="flex h-full">
                        <div
                          className="bg-emerald-500 transition-all"
                          style={{ width: `${st.masteryPercent}%` }}
                        />
                        <div
                          className="bg-sky-400 transition-all"
                          style={{
                            width: `${Math.max(0, st.coveragePercent - st.masteryPercent)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-zinc-400">
                      <span>Пройдено: {st.seenItems} из {st.totalItems} билетов</span>
                      <span>Усвоено: {st.masteredItems}/{st.totalItems}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenLesson(item.id)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      <span>
                        {(savedSlideIndices[item.id] ?? 0) > 0
                          ? `Продолжить (слайд ${savedSlideIndices[item.id] + 1})`
                          : 'Читать урок'}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onStartModuleQuiz(
                          `Урок ${item.id}: ${item.titleRu}`,
                          `${item.titleDa} (${qs.length} вопр.)`,
                          qs,
                          item.id
                        )
                      }
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Сразу к тесту ({qs.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Lesson detail mode
  const mod = MODULES_DATA.find((m) => m.id === activeId) ?? MODULES_DATA[0];
  const modQuestions = QUESTIONS_BANK.filter((q) => q.moduleId === mod.id);
  const modFailedQuestions = modQuestions.filter((q) => getSRSRecord(srsMap, q.id).box === 1);
  const modEntries = DICTIONARY_ENTRIES.filter((d) => d.moduleId === mod.id);
  const modSigns = modEntries.filter((d) => d.category === 'sign' && Boolean(d.signCode));
  const modStats = computeProgressStats(
    modQuestions.map((q) => q.id),
    srsMap
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5 animate-fade-in">
      {/* Top Lesson Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            setViewMode('list');
            onViewModeChange?.('list');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Ко всем урокам (8 тем)</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={mod.id <= 1}
            onClick={() => handleOpenLesson(mod.id - 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-35 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Пред.</span>
          </button>

          <span className="rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            Урок {mod.id} из {MODULES_DATA.length}
          </span>

          <button
            type="button"
            disabled={mod.id >= MODULES_DATA.length}
            onClick={() => handleOpenLesson(mod.id + 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-35 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <span className="hidden sm:inline">След.</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Lesson Compact Header + 3-Tab Switcher */}
      <section className="nordic-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
                {mod.code}
              </span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Билетов решено: {modStats.seenItems}/{modStats.totalItems} • Усвоено:{' '}
                {modStats.masteryPercent}%
              </span>
              {courseModules?.[mod.id]?.theoryCompleted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Теория прочитана
                </span>
              )}
            </div>

            {languageMode !== 'da_only' ? (
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100">
                  {mod.titleRu}
                </h1>
                <div className="mt-0.5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {mod.titleDa}
                </div>
              </div>
            ) : (
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100">
                {mod.titleDa}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SpeakButton id={`mod_title_${mod.id}`} text={mod.titleDa} size="md" />
            <button
              type="button"
              onClick={onOpenCourse}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-900/60"
            >
              <span>В курс</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Clean 3-tab Switcher */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-zinc-200/70 pt-4 dark:border-zinc-800">
          {[
            {
              id: 'slides' as LessonTab,
              label: 'Слайды урока',
              icon: <Layers className="h-3.5 w-3.5" />,
            },
            {
              id: 'sheet' as LessonTab,
              label: `Весь конспект (${mod.cheatSheet.length})`,
              icon: <BookOpen className="h-3.5 w-3.5" />,
            },
            {
              id: 'signs' as LessonTab,
              label: `Знаки и словарь (${modEntries.length})`,
              icon: <Signpost className="h-3.5 w-3.5" />,
            },
          ].map((tab) => {
            const active = lessonTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setLessonTab(tab.id);
                  onLessonTabChange?.(tab.id);
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border border-zinc-200/80 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tab Content */}
      {lessonTab === 'slides' && (
        <LessonTheory
          key={`ref_slides_${mod.id}`}
          moduleId={mod.id}
          languageMode={languageMode}
          nextButtonLabel={`Теория прочитана — к тесту (${modQuestions.length} вопр.)`}
          onComplete={() => {
            onMarkTheoryRead?.(mod.id);
            onStartModuleQuiz(
              `Урок ${mod.id}: ${mod.titleRu}`,
              `${mod.titleDa} (${modQuestions.length} вопр.)`,
              modQuestions,
              mod.id
            );
          }}
        />
      )}

      {lessonTab === 'sheet' && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-12 lg:items-stretch">
            <div className="lg:col-span-7">
              <LessonHeroIllustration moduleId={mod.id} languageMode={languageMode} />
            </div>

            {/* Key Metrics 2×2 alongside Hero on MacBook / iMac */}
            <div className="grid grid-cols-2 gap-2.5 lg:col-span-5">
              {mod.keyMetrics.map((metric, i) => (
                <div
                  key={i}
                  className="nordic-card flex flex-col justify-center p-4"
                >
                  <div className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                    {metric.value}
                  </div>
                  {languageMode !== 'da_only' ? (
                    <>
                      <div className="mt-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {metric.labelRu}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {metric.labelDa}
                      </div>
                    </>
                  ) : (
                    <div className="mt-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {metric.labelDa}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <section className="nordic-card p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Все правила и разборы урока ({mod.cheatSheet.length})
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {mod.cheatSheet.map((rule, idx) => (
                  <a
                    key={idx}
                    href={`#mod_rule_${mod.id}_${idx}`}
                    className="rounded-lg border border-zinc-200/80 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-teal-300 hover:bg-teal-50/70 hover:text-teal-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-teal-800 dark:hover:text-teal-300"
                  >
                    {idx + 1}. {(languageMode !== 'da_only' ? rule.titleRu : rule.titleDa).split(/[(:—]/)[0].trim().slice(0, 26)}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {mod.cheatSheet.map((rule, idx) => (
                <div
                  key={idx}
                  id={`mod_rule_${mod.id}_${idx}`}
                  className="scroll-mt-20 rounded-2xl border border-zinc-200/75 bg-zinc-50/40 p-4 sm:p-5 dark:border-zinc-800/80 dark:bg-zinc-950/35"
                >
                  <div className="flex items-start justify-between gap-2">
                    {languageMode === 'both' ? (
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {rule.titleRu}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-teal-950/85 dark:text-teal-200/90">
                          <span className="inline-flex shrink-0 items-center rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                            DA
                          </span>
                          <span>{rule.titleDa}</span>
                        </div>
                      </div>
                    ) : (
                      <BilingualText
                        da={rule.titleDa}
                        ru={rule.titleRu}
                        mode={languageMode}
                        daClassName="text-sm font-bold"
                        ruClassName="text-xs font-medium"
                      />
                    )}
                    <SpeakButton
                      id={`cheat_${mod.id}_${idx}`}
                      text={`${rule.titleDa}. ${rule.bodyDa}`}
                    />
                  </div>

                  <div className="mt-3 border-t border-zinc-200/70 pt-3 dark:border-zinc-800">
                    <RuleVisualBlock rule={rule} moduleId={mod.id} languageMode={languageMode} compactVisual />
                  </div>
                </div>
              ))}
            </div>

            {/* Step-by-step algorithm (fixed DA/RU order!) */}
            {mod.algorithms && mod.algorithms.length > 0 && (
              <div className="mt-5 rounded-2xl border border-sky-200/80 bg-sky-50/50 p-4 dark:border-sky-900/50 dark:bg-sky-950/25">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                  Обязательный алгоритм действий
                </h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {mod.algorithms.map((alg) => (
                    <div key={alg.step} className="flex items-start justify-between gap-2 rounded-xl border border-sky-200/70 bg-white/80 p-3 dark:border-sky-900/40 dark:bg-zinc-900/70">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[11px] font-bold text-white">
                          {alg.step}
                        </span>
                        {languageMode === 'both' ? (
                          <div>
                            <div className="text-xs font-medium text-zinc-900 sm:text-sm dark:text-zinc-100">
                              {alg.ru}
                            </div>
                            <div className="mt-1.5 flex items-start gap-1.5 text-xs leading-snug text-teal-950/85 dark:text-teal-200/90">
                              <span className="mt-0.5 inline-flex shrink-0 items-center rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                                DA
                              </span>
                              <span>{alg.da}</span>
                            </div>
                          </div>
                        ) : (
                          <BilingualText
                            da={alg.da}
                            ru={alg.ru}
                            mode={languageMode}
                            daClassName="text-xs sm:text-sm"
                            ruClassName="text-xs"
                          />
                        )}
                      </div>
                      <SpeakButton id={`alg_${mod.id}_${alg.step}`} text={alg.da} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {lessonTab === 'signs' && (
        <div className="space-y-4">
          {mod.id === 1 && (
            <section className="nordic-card p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Интерактивная схема Kontrolprøven (нажмите на любой узел)
                </h2>
              </div>
              <CarTechnicalSVG initialTab="motorrum" languageMode={languageMode} />
            </section>
          )}

          {modSigns.length > 0 && (
            <section className="nordic-card p-5 sm:p-6">
              <h2 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Дорожные знаки Урока {mod.id} ({modSigns.length})
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {modSigns.map((sign) => (
                  <div
                    key={sign.id}
                    className="relative flex flex-col items-center rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-3 text-center dark:border-zinc-800 dark:bg-zinc-950/60"
                  >
                    <div className="mb-1 self-end">
                      <SpeakButton id={`mod_sign_${sign.id}`} text={sign.da} />
                    </div>
                    <DanishRoadSignSVG code={sign.signCode!} subPlaque={sign.subPlaque} size={72} />
                    <div className="mt-2 text-[11px] font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
                      {sign.da}
                    </div>
                    {languageMode !== 'da_only' && (
                      <div className="mt-0.5 text-[10px] leading-tight text-zinc-500 dark:text-zinc-400">
                        {sign.ru}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {modEntries.length > 0 && (
            <section className="nordic-card p-5 sm:p-6">
              <h2 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Термины и карточки урока ({modEntries.length})
              </h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {modEntries.map((entry) => {
                  const rec = getSRSRecord(srsMap, entry.id);
                  const meta = BOX_META[rec.box];
                  const ddoWords = extractOrdnetLookupWords(entry.da, 2);
                  return (
                    <div
                      key={entry.id}
                      className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40"
                    >
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badgeClass}`}
                          >
                            Box {rec.box} • {meta.labelRu}
                          </span>
                          <SpeakButton id={`entry_${entry.id}`} text={`${entry.da}. ${entry.detailsDa}`} />
                        </div>

                        <div className="flex items-start gap-3">
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
                              daClassName="text-xs font-normal text-zinc-600 dark:text-zinc-300"
                              ruClassName="text-[11px]"
                            />
                          </div>
                        </div>

                        {ddoWords.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-zinc-400">ordnet.dk:</span>
                            {ddoWords.map((w) => (
                              <a
                                key={w}
                                href={getOrdnetUrl(w)}
                                target="_blank"
                                rel="noreferrer"
                                title={`Открыть «${w}» на Den Danske Ordbog (аудио и транскрипция)`}
                                className="inline-flex items-center gap-0.5 rounded-md border border-zinc-200/80 bg-white px-1.5 py-0.5 text-[10px] font-medium text-teal-700 transition-colors hover:border-teal-300 hover:bg-teal-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-teal-400"
                              >
                                <span>{w}</span>
                                <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex gap-2 border-t border-zinc-200/70 pt-2.5 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => onRecordEntryReview(entry.id, false)}
                          className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-rose-200 bg-white py-1.5 text-[11px] font-semibold text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:bg-zinc-900 dark:text-rose-400"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Повторить (Box 1)
                        </button>
                        <button
                          type="button"
                          onClick={() => onRecordEntryReview(entry.id, true)}
                          className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50/80 py-1.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Знаю (+Box)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Final Guided Call-To-Action Card */}
      <section className="rounded-3xl border border-zinc-200 bg-zinc-900 p-6 text-white shadow-lg sm:p-8 dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Практика • Урок {mod.id}
            </div>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
              Проверить знания по теме «{mod.titleRu}»
            </h2>
            <p className="text-xs text-zinc-300 sm:text-sm dark:text-zinc-600">
              Решите все {modQuestions.length} билетов темы или короткий блиц из 10 случайных ситуаций.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onStartModuleQuiz(
                    `Блиц · Урок ${mod.id}: ${mod.titleRu}`,
                    `${mod.titleDa} (10 случайных вопр.)`,
                    shuffleItems(modQuestions).slice(0, 10),
                    mod.id
                  )
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-zinc-700 dark:border-zinc-300 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Блиц (10)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onStartModuleQuiz(
                    `Урок ${mod.id}: ${mod.titleRu}`,
                    `${mod.titleDa} (${modQuestions.length} вопр.)`,
                    modQuestions,
                    mod.id
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-400"
              >
                <span>Полный тест ({modQuestions.length})</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {modFailedQuestions.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  onStartModuleQuiz(
                    `Ошибки Урока ${mod.id}`,
                    `${mod.titleRu} (${modFailedQuestions.length} вопр. из Box 1)`,
                    modFailedQuestions,
                    mod.id
                  )
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-400/50 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/30 dark:border-rose-300 dark:bg-rose-100 dark:text-rose-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Отработать только ошибки урока ({modFailedQuestions.length})</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
