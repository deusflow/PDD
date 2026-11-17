import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Play,
  RotateCcw,
  Scale,
  ShieldAlert,
  Volume2,
  XCircle,
} from 'lucide-react';
import { QUESTIONS_BANK } from '../../data/questionsBank';
import { danishSpeech } from '../../services/speech';
import { buildExamQuestions } from '../../services/srsEngine';
import { ExamAttemptSummary, LanguageMode, SRSRecord, TeoriQuestion } from '../../types';
import { BilingualText } from '../common/BilingualText';
import { SpeakButton } from '../common/SpeakButton';
import { CarTechnicalSVG } from '../visuals/CarTechnicalSVG';
import { DanishRoadSignSVG, PSkiveSVG } from '../visuals/DanishRoadSignSVG';
import { TrafficSceneSVG } from '../visuals/TrafficSceneSVG';

interface ExamSimulatorViewProps {
  languageMode: LanguageMode;
  examHistory: ExamAttemptSummary[];
  srsMap?: Record<string, SRSRecord>;
  autoStart?: boolean;
  onBackToCourse?: () => void;
  onFinishExam: (
    summary: ExamAttemptSummary,
    results: Array<{ questionId: string; passed: boolean }>
  ) => void;
  onTrainFailedQuestions: (questions: TeoriQuestion[]) => void;
}

const EXAM_DURATION_SEC = 25 * 60; // 25 minutes
const PASS_THRESHOLD = 20; // minimum 20 / 25
const EXAM_DRAFT_KEY = 'dk_exam_draft_v1';

interface ExamDraft {
  questionIds: string[];
  answers: Record<string, boolean | undefined>;
  currentIndex: number;
  secondsLeft: number;
  officialMode: boolean;
  savedAt: number;
}

function buildFullTicketSequence(q: TeoriQuestion): string[] {
  return [q.situationDa, ...q.subQuestions.map((s, i) => `${i + 1}. ${s.da}`)];
}

function loadExamDraft(): { draft: ExamDraft; questions: TeoriQuestion[] } | null {
  try {
    const raw = sessionStorage.getItem(EXAM_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ExamDraft;
    if (!Array.isArray(parsed.questionIds) || parsed.questionIds.length === 0) return null;
    const byId = new Map(QUESTIONS_BANK.map((q) => [q.id, q]));
    const questions = parsed.questionIds
      .map((id) => byId.get(id))
      .filter((q): q is TeoriQuestion => Boolean(q));
    if (questions.length !== parsed.questionIds.length || parsed.secondsLeft <= 0) return null;
    return { draft: parsed, questions };
  } catch {
    return null;
  }
}

function clearExamDraft(): void {
  try {
    sessionStorage.removeItem(EXAM_DRAFT_KEY);
  } catch {
    // ignore storage errors
  }
}

function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const ExamSimulatorView: React.FC<ExamSimulatorViewProps> = ({
  languageMode,
  examHistory,
  srsMap,
  autoStart = false,
  onBackToCourse,
  onFinishExam,
  onTrainFailedQuestions,
}) => {
  const [phase, setPhase] = useState<'intro' | 'active' | 'review'>(() =>
    autoStart ? 'active' : 'intro'
  );
  const [officialMode, setOfficialMode] = useState(false);
  const [examQuestions, setExamQuestions] = useState<TeoriQuestion[]>(() =>
    autoStart ? buildExamQuestions(QUESTIONS_BANK, 25, srsMap) : []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean | undefined>>({});
  const [secondsLeft, setSecondsLeft] = useState(EXAM_DURATION_SEC);
  const [lastSummary, setLastSummary] = useState<ExamAttemptSummary | null>(null);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [confirmIncomplete, setConfirmIncomplete] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<{
    draft: ExamDraft;
    questions: TeoriQuestion[];
  } | null>(() => (autoStart ? null : loadExamDraft()));

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const examQuestionsRef = useRef(examQuestions);
  examQuestionsRef.current = examQuestions;

  const finalizeExam = useCallback(
    (
      questionsList: TeoriQuestion[],
      currentAnswers: Record<string, boolean | undefined>,
      remainingSec: number
    ) => {
      clearExamDraft();
      setPendingDraft(null);
      const results = questionsList.map((q) => {
        const passed = q.subQuestions.every(
          (sq) => currentAnswers[sq.id] === sq.correctAnswer
        );
        return { questionId: q.id, passed };
      });

      const score = results.filter((r) => r.passed).length;
      const summary: ExamAttemptSummary = {
        id: `exam_${Date.now()}`,
        date: Date.now(),
        score,
        total: questionsList.length,
        passed: score >= PASS_THRESHOLD,
        durationSeconds: EXAM_DURATION_SEC - remainingSec,
      };

      setLastSummary(summary);
      setPhase('review');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onFinishExam(summary, results);
    },
    [onFinishExam]
  );

  useEffect(() => {
    if (phase !== 'active') return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'active' && secondsLeft === 0) {
      finalizeExam(examQuestionsRef.current, answersRef.current, 0);
    }
  }, [phase, secondsLeft, finalizeExam]);

  useEffect(() => {
    if (autoStart || phase !== 'active' || examQuestions.length === 0) return;
    try {
      const payload: ExamDraft = {
        questionIds: examQuestions.map((q) => q.id),
        answers,
        currentIndex,
        secondsLeft,
        officialMode,
        savedAt: Date.now(),
      };
      sessionStorage.setItem(EXAM_DRAFT_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
  }, [autoStart, phase, examQuestions, answers, currentIndex, secondsLeft, officialMode]);

  useEffect(() => {
    if (phase !== 'active' || !officialMode) return;
    const q = examQuestions[currentIndex];
    if (!q) return;
    danishSpeech.stop();
    danishSpeech.speakSequence(buildFullTicketSequence(q), `exam_auto_${q.id}`);
    return () => {
      danishSpeech.stop();
    };
  }, [phase, officialMode, currentIndex, examQuestions]);

  useEffect(() => {
    if (phase !== 'active') return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const currentQ = examQuestionsRef.current[currentIndex];
      const lowerKey = e.key.toLowerCase();

      if ((e.key === '1' || lowerKey === 'j') && currentQ) {
        const subIdx = currentQ.subQuestions.findIndex(
          (sq) => answersRef.current[sq.id] === undefined
        );
        if (subIdx !== -1) {
          e.preventDefault();
          const targetSq = currentQ.subQuestions[subIdx];
          setAnswers((prev) => ({ ...prev, [targetSq.id]: true }));
        }
        return;
      }

      if ((e.key === '2' || lowerKey === 'n') && currentQ) {
        const subIdx = currentQ.subQuestions.findIndex(
          (sq) => answersRef.current[sq.id] === undefined
        );
        if (subIdx !== -1) {
          e.preventDefault();
          const targetSq = currentQ.subQuestions[subIdx];
          setAnswers((prev) => ({ ...prev, [targetSq.id]: false }));
        }
        return;
      }

      if (e.key === 'Enter' && tag !== 'BUTTON' && currentQ) {
        const allAnswered = currentQ.subQuestions.every(
          (sq) => answersRef.current[sq.id] !== undefined
        );
        if (allAnswered && currentIndex + 1 < examQuestions.length) {
          e.preventDefault();
          goToQuestion(currentIndex + 1);
        }
        return;
      }

      if (e.key === 'ArrowRight' && currentIndex + 1 < examQuestions.length) {
        e.preventDefault();
        goToQuestion(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' && !officialMode && currentIndex > 0) {
        e.preventDefault();
        goToQuestion(currentIndex - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, officialMode, currentIndex, examQuestions.length]);

  const goToQuestion = (nextIndex: number) => {
    setCurrentIndex(nextIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderVisualForQuestion = (q: TeoriQuestion) => {
    const { visual } = q;
    if (visual.type === 'sign' && visual.signCode) {
      return (
        <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl border border-zinc-200 bg-zinc-50 py-5 dark:border-zinc-800 dark:bg-zinc-950/60">
          <DanishRoadSignSVG code={visual.signCode} subPlaque={visual.subPlaque} size={128} />
          {visual.signCode === 'E33' && <PSkiveSVG size={110} />}
        </div>
      );
    }
    if (visual.type === 'technical') {
      return (
        <CarTechnicalSVG
          key={q.id}
          initialTab={visual.technicalTab ?? 'motorrum'}
          activeHotspot={visual.technicalHotspot}
          languageMode={languageMode}
          compact
        />
      );
    }
    return (
      <TrafficSceneSVG
        presetId={visual.presetId}
        signCode={visual.signCode}
        subPlaque={visual.subPlaque}
        maneuverBadge={visual.maneuverBadge}
      />
    );
  };

  const startExam = () => {
    clearExamDraft();
    setPendingDraft(null);
    const selected = buildExamQuestions(QUESTIONS_BANK, 25, srsMap);
    setExamQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setSecondsLeft(EXAM_DURATION_SEC);
    setLastSummary(null);
    setExpandedReviewId(null);
    setConfirmIncomplete(false);
    setPhase('active');
  };

  const resumeExamDraft = () => {
    if (!pendingDraft) return;
    const { draft, questions } = pendingDraft;
    setOfficialMode(Boolean(draft.officialMode));
    setExamQuestions(questions);
    setAnswers(draft.answers ?? {});
    setCurrentIndex(Math.min(Math.max(0, draft.currentIndex ?? 0), questions.length - 1));
    setSecondsLeft(Math.max(1, draft.secondsLeft));
    setLastSummary(null);
    setExpandedReviewId(null);
    setConfirmIncomplete(false);
    setPendingDraft(null);
    setPhase('active');
  };

  const discardExamDraft = () => {
    clearExamDraft();
    setPendingDraft(null);
  };

  if (phase === 'intro') {
    const draftAnswered = pendingDraft
      ? pendingDraft.questions.filter((q) =>
          q.subQuestions.every((sq) => pendingDraft.draft.answers[sq.id] !== undefined)
        ).length
      : 0;

    return (
      <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
        <div className="nordic-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Симулятор реального экзамена (Teoriprøven)
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Официальный формат Færdselsstyrelsen • Kategori B
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-center dark:border-zinc-800 dark:bg-zinc-950/60">
              <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">25</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Билетов</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-center dark:border-zinc-800 dark:bg-zinc-950/60">
              <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">25:00</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Лимит времени</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-center dark:border-zinc-800 dark:bg-zinc-950/60">
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                ≥ 20 / 25
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Для сдачи</div>
            </div>
          </div>

          <div className="mt-5 space-y-2 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <div className="font-bold">Строгие правила оценки:</div>
            <ul className="list-disc space-y-1 pl-4">
              <li>В каждой ситуации 3–4 вопроса «Ja / Nej».</li>
              <li>Ошибка хотя бы в одном подпункте обнуляет весь вопрос (0 баллов).</li>
              <li>Во время экзамена подсказки и разбор скрыты до завершения.</li>
              <li>Все билеты с ошибками автоматически отправятся в <strong>Box 1</strong> для проработки.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setOfficialMode((v) => !v)}
            className={`mt-4 flex w-full items-start justify-between gap-3 rounded-2xl border p-4 text-left transition-all ${
              officialMode
                ? 'border-teal-500 bg-teal-50/70 dark:border-teal-500 dark:bg-teal-950/30'
                : 'border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/70 dark:border-zinc-800 dark:bg-zinc-950/50'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Volume2 className={`mt-0.5 h-4 w-4 shrink-0 ${officialMode ? 'text-teal-600 dark:text-teal-400' : 'text-zinc-500'}`} />
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Официальный режим Teoriprøven (строгий)
                </div>
                <div className="mt-0.5 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Автоматически зачитывает ситуацию на датском (da-DK) и отключает возврат на прошлые билеты — как на реальном экзамене.
                </div>
              </div>
            </div>
            <span
              className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                officialMode
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {officialMode ? 'ВКЛ' : 'ВЫКЛ'}
            </span>
          </button>

          {pendingDraft && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50/80 p-3.5 text-xs dark:border-teal-800/70 dark:bg-teal-950/35">
              <div className="text-teal-900 dark:text-teal-200">
                <div className="font-bold">Найден незавершённый экзамен</div>
                <div className="mt-0.5 text-[11px] opacity-85">
                  Заполнено {draftAnswered}/{pendingDraft.questions.length} • Осталось{' '}
                  {formatTimer(pendingDraft.draft.secondsLeft)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={discardExamDraft}
                  className="rounded-xl border border-teal-300/80 bg-white px-3 py-1.5 font-semibold text-teal-800 transition-colors hover:bg-teal-50 dark:border-teal-700 dark:bg-zinc-900 dark:text-teal-300"
                >
                  Сбросить
                </button>
                <button
                  type="button"
                  onClick={resumeExamDraft}
                  className="rounded-xl bg-teal-600 px-3.5 py-1.5 font-bold text-white transition-colors hover:bg-teal-500"
                >
                  Продолжить ({draftAnswered}/{pendingDraft.questions.length})
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={startExam}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Play className="h-4 w-4 fill-current" />
            Начать новый экзамен (25 вопросов)
          </button>
        </div>

        {/* History */}
        {examHistory.length > 0 && (
          <div className="nordic-card p-5">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              История попыток
            </h2>
            <div className="space-y-2">
              {examHistory.slice(0, 6).map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200/80 px-3.5 py-2 text-xs dark:border-zinc-800"
                >
                  <div className="flex items-center gap-2">
                    {attempt.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-500" />
                    )}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {attempt.passed ? 'Bestået (Сдал)' : 'Ikke bestået (Не сдал)'}
                    </span>
                    <span className="text-zinc-400">
                      • {new Date(attempt.date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <div className="font-bold tabular-nums text-zinc-800 dark:text-zinc-200">
                    {attempt.score} / {attempt.total} ({formatTimer(attempt.durationSeconds)})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'review' && lastSummary) {
    const failedQuestions = examQuestions.filter(
      (q) => !q.subQuestions.every((sq) => answers[sq.id] === sq.correctAnswer)
    );

    return (
      <div className="mx-auto max-w-3xl space-y-5 animate-slide-up">
        <div className="nordic-card p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  lastSummary.passed
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                }`}
              >
                {lastSummary.passed ? (
                  <Award className="h-7 w-7" />
                ) : (
                  <AlertTriangle className="h-7 w-7" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Результат экзамена
                </div>
                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {lastSummary.passed
                    ? 'Bestået! Экзамен сдан'
                    : 'Ikke bestået — Не сдан'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Верных билетов: <strong>{lastSummary.score}</strong> из {lastSummary.total}{' '}
                  (минимум {PASS_THRESHOLD}) • Время: {formatTimer(lastSummary.durationSeconds)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {onBackToCourse && (
                <button
                  type="button"
                  onClick={onBackToCourse}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-teal-500"
                >
                  Вернуться к курсу
                </button>
              )}
              {failedQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => onTrainFailedQuestions(failedQuestions)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-rose-500"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Разобрать ошибки ({failedQuestions.length})
                </button>
              )}
              {!onBackToCourse && (
                <button
                  type="button"
                  onClick={startExam}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  Новый экзамен
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Breakdown of all 25 questions */}
        <div className="nordic-card p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Детальный разбор всех 25 билетов по Færdselsloven
            </h3>
            {failedQuestions.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setExpandedReviewId(
                    expandedReviewId === 'all_failed' ? 'none' : 'all_failed'
                  )
                }
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
              >
                {expandedReviewId === 'all_failed'
                  ? 'Свернуть ошибки'
                  : `Раскрыть все ошибки (${failedQuestions.length})`}
              </button>
            )}
          </div>
          <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
            Все билеты с ошибками автоматически перенесены в Box 1 (Критическая зона). Нажмите на любой билет, чтобы раскрыть подробный разбор.
          </p>

          <div className="space-y-2.5">
            {examQuestions.map((q, idx) => {
              const passed = q.subQuestions.every((sq) => answers[sq.id] === sq.correctAnswer);
              const isOpen =
                (expandedReviewId === 'all_failed' && !passed) ||
                expandedReviewId === q.id ||
                (!passed &&
                  expandedReviewId === null &&
                  idx ===
                    examQuestions.findIndex(
                      (x) => !x.subQuestions.every((s) => answers[s.id] === s.correctAnswer)
                    ));

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border transition-all ${
                    passed
                      ? 'border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                      : 'border-rose-200 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedReviewId(isOpen ? 'none' : q.id)}
                    className="flex w-full items-center justify-between gap-3 p-3.5 text-left"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {passed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      )}
                      <span className="shrink-0 text-xs font-bold text-zinc-400">#{idx + 1}</span>
                      <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100 sm:text-sm">
                        {q.situationDa}
                      </span>
                    </div>
                    <span className="shrink-0 text-[11px] font-semibold text-zinc-500">
                      {passed ? '+1 балл' : '0 баллов → Box 1'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-zinc-200/80 p-4 dark:border-zinc-800">
                      <div className="mb-3">{renderVisualForQuestion(q)}</div>

                      <div className="mb-3 flex items-start justify-between gap-2">
                        <BilingualText
                          da={q.situationDa}
                          ru={q.situationRu}
                          mode={languageMode}
                          revealInExplanation
                          daClassName="text-xs sm:text-sm"
                          ruClassName="text-xs"
                        />
                        <SpeakButton id={`rev_sit_${q.id}`} text={q.situationDa} />
                      </div>

                      <div className="space-y-2">
                        {q.subQuestions.map((sq) => {
                          const userAns = answers[sq.id];
                          const ok = userAns === sq.correctAnswer;
                          return (
                            <div
                              key={sq.id}
                              className={`rounded-xl border p-3 text-xs ${
                                ok
                                  ? 'border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/25'
                                  : 'border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/35'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <BilingualText
                                  da={sq.da}
                                  ru={sq.ru}
                                  mode={languageMode}
                                  revealInExplanation
                                  daClassName="font-semibold text-xs"
                                  ruClassName="text-[11px]"
                                />
                                <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                                  Ответ: {userAns === undefined ? '—' : userAns ? 'Ja' : 'Nej'} •{' '}
                                  Верно: {sq.correctAnswer ? 'Ja' : 'Nej'}
                                </span>
                              </div>
                              <div className="mt-1.5 border-t border-zinc-200/60 pt-1.5 dark:border-zinc-800">
                                <BilingualText
                                  da={sq.explanationDa}
                                  ru={sq.explanationRu}
                                  mode={languageMode}
                                  revealInExplanation
                                  daClassName="text-[11px] font-normal"
                                  ruClassName="text-[11px]"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                        <Scale className="h-3.5 w-3.5" />
                        <span>{q.lawReference}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active exam view
  const question = examQuestions[currentIndex];
  const focusedSubIdx = question.subQuestions.findIndex((sq) => answers[sq.id] === undefined);
  const answeredCount = examQuestions.filter((q) =>
    q.subQuestions.every((sq) => answers[sq.id] !== undefined)
  ).length;
  const unansweredCount = examQuestions.length - answeredCount;

  const handleRequestFinish = () => {
    if (unansweredCount > 0 && !confirmIncomplete) {
      setConfirmIncomplete(true);
      return;
    }
    setConfirmIncomplete(false);
    finalizeExam(examQuestions, answers, secondsLeft);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 animate-fade-in">
      {/* Top Exam Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <Clock
            className={`h-4 w-4 ${
              secondsLeft < 60
                ? 'text-rose-600 animate-pulse-soft'
                : secondsLeft < 300
                  ? 'text-amber-500'
                  : 'text-zinc-500'
            }`}
          />
          <span
            className={`font-mono text-sm font-bold tabular-nums ${
              secondsLeft < 60
                ? 'text-rose-600'
                : secondsLeft < 300
                  ? 'text-amber-600'
                  : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {formatTimer(secondsLeft)}
          </span>
        </div>

        <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          Вопрос {currentIndex + 1} из {examQuestions.length} • Заполнено: {answeredCount}/
          {examQuestions.length}
        </div>

        <button
          type="button"
          onClick={handleRequestFinish}
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-rose-500"
        >
          <Flag className="h-3.5 w-3.5" />
          Завершить
        </button>
      </div>

      {confirmIncomplete && unansweredCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <span>
            Не заполнено билетов: <strong>{unansweredCount}</strong>. Неотвеченные билеты будут засчитаны как ошибки.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmIncomplete(false)}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1 font-semibold text-amber-900 dark:border-amber-700 dark:bg-zinc-900 dark:text-amber-200"
            >
              Вернуться
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmIncomplete(false);
                finalizeExam(examQuestions, answers, secondsLeft);
              }}
              className="rounded-lg bg-rose-600 px-3 py-1 font-semibold text-white hover:bg-rose-500"
            >
              Всё равно сдать
            </button>
          </div>
        </div>
      )}

      {/* Question Number Strip */}
      <div className="flex flex-wrap items-center gap-1">
        {examQuestions.map((q, idx) => {
          const isComplete = q.subQuestions.every((sq) => answers[sq.id] !== undefined);
          const isCurrent = idx === currentIndex;
          const lockedBack = officialMode && idx < currentIndex;
          return (
            <button
              key={q.id}
              type="button"
              disabled={lockedBack}
              onClick={() => goToQuestion(idx)}
              title={lockedBack ? 'В официальном режиме возврат назад отключён' : undefined}
              className={`h-7 min-w-[28px] rounded-lg border text-[11px] font-bold transition-all ${
                lockedBack
                  ? 'cursor-not-allowed border-zinc-200/50 bg-zinc-100/70 text-zinc-400 opacity-60 dark:border-zinc-800/60 dark:bg-zinc-900/40'
                  : isCurrent
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : isComplete
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
        {officialMode && (
          <span className="ml-2 rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
            Официальный режим · без возврата назад
          </span>
        )}
      </div>

      {/* Question Card */}
      <div className="nordic-card p-4 sm:p-6">
        <div className="mb-4">{renderVisualForQuestion(question)}</div>

        <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
          <BilingualText
            da={question.situationDa}
            ru={question.situationRu}
            mode={languageMode}
            daClassName="text-sm sm:text-base"
            ruClassName="text-xs sm:text-sm"
          />
          <div className="flex shrink-0 items-center gap-1.5">
            <SpeakButton
              id={`ex_all_${question.id}`}
              text={question.situationDa}
              sequence={buildFullTicketSequence(question)}
              label="Озвучить билет"
            />
            <SpeakButton id={`ex_sit_${question.id}`} text={question.situationDa} />
          </div>
        </div>

        <div className="space-y-2.5">
          {question.subQuestions.map((sq, idx) => {
            const chosen = answers[sq.id];
            const isFocused = idx === focusedSubIdx;
            return (
              <div
                key={sq.id}
                className={`flex flex-col gap-3 rounded-2xl border bg-white p-3.5 transition-all sm:flex-row sm:items-start sm:justify-between dark:bg-zinc-900 ${
                  isFocused
                    ? 'border-teal-400 ring-2 ring-teal-500/20 dark:border-teal-500'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex min-w-0 flex-1 items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[11px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <BilingualText
                      da={sq.da}
                      ru={sq.ru}
                      mode={languageMode}
                      daClassName="text-sm"
                      ruClassName="text-xs"
                    />
                  </div>
                  <SpeakButton id={`ex_sq_${sq.id}`} text={sq.da} />
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
                  {[
                    { val: true, label: 'Ja' },
                    { val: false, label: 'Nej' },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [sq.id]: opt.val }))}
                      className={`min-w-[64px] rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                        chosen === opt.val
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation footer */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentIndex === 0 || officialMode}
            onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-35 dark:border-zinc-800 dark:text-zinc-300"
          >
            <ChevronLeft className="h-4 w-4" />
            Предыдущий
          </button>

          {currentIndex + 1 < examQuestions.length ? (
            <button
              type="button"
              onClick={() => goToQuestion(Math.min(examQuestions.length - 1, currentIndex + 1))}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Следующий
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRequestFinish}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-500"
            >
              Сдать экзамен ({answeredCount}/{examQuestions.length})
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-2.5 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
          Клавиатура: 1 / J = Ja · 2 / N = Nej · → / Enter = Далее
        </p>
      </div>
    </div>
  );
};
