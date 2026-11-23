import React, { useEffect, useState } from 'react';
import { useUiLang } from '../../i18n/UiLangContext';
import {
  CHECKPOINT_MIN_PASS_SCORE,
  CourseStep,
  getCourseOverview,
  getModulePassThreshold,
  getModuleProgress,
  getModuleQuestions,
  getNextCourseStep,
  REQUIRED_MOCK_EXAM_STREAK,
} from '../../services/coursePlanner';
import {
  hasResumableQuizDraft,
  loadNavState,
  saveNavState,
} from '../../services/sessionPersistence';
import { danishSpeech } from '../../services/speech';
import { SRSRecord, TeoriQuestion, UserAppState } from '../../types';
import { CourseInterstitial } from '../course/CourseInterstitial';
import { CourseProgressBar } from '../course/CourseProgressBar';
import { LessonFlashcards } from '../course/LessonFlashcards';
import { LessonTheory } from '../course/LessonTheory';
import { ExamSimulatorView } from './ExamSimulatorView';
import { QuizSessionView } from './QuizSessionView';

interface CourseViewProps {
  appState: UserAppState;
  onRecordResult: (itemId: string, isAllCorrect: boolean) => SRSRecord;
  onCompleteSession: () => void;
  onCompleteTheory: (moduleId: number) => void;
  onCompleteFlashcards: (moduleId: number) => void;
  onCompleteCourseQuiz: (moduleId: number, isFullQuiz: boolean, firstTryScore: number) => void;
  onCompleteCheckpoint: (passed: boolean) => void;
  onFinishExam: Parameters<typeof ExamSimulatorView>[0]['onFinishExam'];
  onTrainFailedQuestions: (questions: TeoriQuestion[]) => void;
  onOpenSmartTraining: () => void;
  onExit: () => void;
}

type PendingTransition =
  | { kind: 'advance' }
  | {
      kind: 'after_lesson_quiz';
      moduleId: number;
      wasPassedBefore: boolean;
      scoreText: string;
    }
  | {
      kind: 'after_checkpoint';
      passed: boolean;
      score: number;
      total: number;
    }
  | null;

function getDraftKeyForStep(step: CourseStep): string | undefined {
  switch (step.kind) {
    case 'quiz':
      return `course_quiz_m${step.moduleId}`;
    case 'fix':
      return `course_fix_m${step.moduleId}`;
    case 'review':
      return 'course_review';
    case 'checkpoint':
      return 'course_checkpoint';
    default:
      return undefined;
  }
}

function shouldShowInterstitial(step: CourseStep, state: UserAppState): boolean {
  const draftKey = getDraftKeyForStep(step);
  if (draftKey && hasResumableQuizDraft(draftKey)) {
    return false;
  }
  if (
    step.kind === 'review' ||
    step.kind === 'fix' ||
    step.kind === 'checkpoint' ||
    step.kind === 'mock_exam'
  ) {
    return true;
  }
  if (step.kind === 'quiz') {
    const modProg = getModuleProgress(state.course, step.moduleId);
    return modProg.quizAttempts > 0 && !modProg.passed;
  }
  return false;
}

export const CourseView: React.FC<CourseViewProps> = ({
  appState,
  onRecordResult,
  onCompleteSession,
  onCompleteTheory,
  onCompleteFlashcards,
  onCompleteCourseQuiz,
  onCompleteCheckpoint,
  onFinishExam,
  onTrainFailedQuestions,
  onOpenSmartTraining,
  onExit,
}) => {
  const { uiLang, pick, modules } = useUiLang();
  const [activeStep, setActiveStep] = useState<CourseStep>(() =>
    getNextCourseStep(appState, Date.now(), uiLang)
  );
  const [stepKey, setStepKey] = useState<string>(() => `step_${Date.now()}`);
  const [showInterstitial, setShowInterstitial] = useState<boolean>(() =>
    shouldShowInterstitial(getNextCourseStep(appState, Date.now(), uiLang), appState)
  );
  const [celebrating, setCelebrating] = useState<{
    moduleId: number;
    scoreText: string;
  } | null>(null);
  const [checkpointRetryBanner, setCheckpointRetryBanner] = useState<string | null>(null);
  const [extraMockExam, setExtraMockExam] = useState<boolean>(false);
  const [pendingTransition, setPendingTransition] = useState<PendingTransition>(null);
  const [browsingModuleId, setBrowsingModuleId] = useState<number | null>(
    () => loadNavState().courseBrowsingModuleId
  );

  useEffect(() => {
    saveNavState({ courseBrowsingModuleId: browsingModuleId });
  }, [browsingModuleId]);

  useEffect(() => {
    if (!pendingTransition) return;

    const nextStep = getNextCourseStep(appState, Date.now(), uiLang);

    if (pendingTransition.kind === 'after_lesson_quiz') {
      const nowPassed = getModuleProgress(appState.course, pendingTransition.moduleId).passed;
      if (!pendingTransition.wasPassedBefore && nowPassed) {
        setCelebrating({
          moduleId: pendingTransition.moduleId,
          scoreText: pendingTransition.scoreText,
        });
        setShowInterstitial(false);
        setActiveStep(nextStep);
        setStepKey(`step_${Date.now()}`);
        setPendingTransition(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (pendingTransition.kind === 'after_checkpoint') {
      if (!pendingTransition.passed) {
        setCheckpointRetryBanner(
          pick(
            `Результат: ${pendingTransition.score} из ${pendingTransition.total}. Для прохождения нужно минимум ${CHECKPOINT_MIN_PASS_SCORE}. Ошибки добавлены к повторению — попробуйте ещё раз.`,
            `Результат: ${pendingTransition.score} із ${pendingTransition.total}. Для проходження потрібно щонайменше ${CHECKPOINT_MIN_PASS_SCORE}. Помилки додані до повторення — спробуйте ще раз.`
          )
        );
      } else {
        setCheckpointRetryBanner(null);
      }
    }

    setActiveStep(nextStep);
    setStepKey(`step_${Date.now()}`);
    setShowInterstitial(shouldShowInterstitial(nextStep, appState));
    setPendingTransition(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [appState, pendingTransition, pick, uiLang]);

  const overview = getCourseOverview(appState, Date.now(), uiLang, modules);
  const activeModuleId =
    celebrating?.moduleId ??
    (activeStep.kind === 'theory' ||
    activeStep.kind === 'flashcards' ||
    activeStep.kind === 'quiz' ||
    activeStep.kind === 'fix'
      ? activeStep.moduleId
      : undefined);

  const moduleProgress =
    activeModuleId !== undefined ? getModuleProgress(appState.course, activeModuleId) : undefined;

  const handleExit = () => {
    danishSpeech.stop();
    onExit();
  };

  const effectiveStep: CourseStep = extraMockExam ? { kind: 'mock_exam' } : activeStep;
  const effectivePercent = activeStep.kind === 'ready' && !extraMockExam ? 100 : overview.percent;

  const renderMainBody = (): React.ReactNode => {
    // Extra mock exam launched from 'ready' screen
    if (extraMockExam) {
      return (
        <ExamSimulatorView
          languageMode={appState.languageMode}
          examHistory={appState.examHistory}
          srsMap={appState.srs}
          autoStart
          onFinishExam={onFinishExam}
          onTrainFailedQuestions={onTrainFailedQuestions}
          onBackToCourse={() => {
            setExtraMockExam(false);
            const next = getNextCourseStep(appState, Date.now(), uiLang);
            setActiveStep(next);
            setShowInterstitial(shouldShowInterstitial(next, appState));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
    }

    // Celebration screen after closing a module
    if (celebrating !== null) {
      const mod = modules.find((m) => m.id === celebrating.moduleId);
      const nextButtonText =
        activeStep.kind === 'checkpoint'
          ? pick('К контрольной по урокам 1–4', 'До контрольної за уроками 1–4')
          : activeStep.kind === 'mock_exam'
            ? pick('К финальному экзамену', 'До фінального іспиту')
            : activeStep.kind === 'review'
              ? pick('Продолжить', 'Продовжити')
              : `${pick('Урок', 'Урок')} ${celebrating.moduleId + 1}`;

      return (
        <CourseInterstitial
          variant="lesson_passed"
          title={pick(`Урок ${celebrating.moduleId} пройден`, `Урок ${celebrating.moduleId} пройдено`)}
          description={pick(
            `Тема «${mod?.titleRu ?? ''}» успешно закреплена.`,
            `Тему «${mod?.titleRu ?? ''}» успішно закріплено.`
          )}
          statsText={celebrating.scoreText}
          buttonLabel={nextButtonText}
          onPrimary={() => {
            danishSpeech.stop();
            setCelebrating(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
    }

    // Course fully completed ('ready')
    if (activeStep.kind === 'ready') {
      const examsCount = appState.examHistory.length;
      const passedCount = appState.examHistory.filter((e) => e.passed).length;

      return (
        <CourseInterstitial
          variant="ready"
          title={pick('Вы готовы к Teoriprøven', 'Ви готові до Teoriprøven')}
          description={pick(
            `Все 8 уроков, контрольная и серия из ${REQUIRED_MOCK_EXAM_STREAK} пробных экзаменов подряд успешно пройдены.`,
            `Усі 8 уроків, контрольна та серія з ${REQUIRED_MOCK_EXAM_STREAK} пробних іспитів поспіль успішно пройдено.`
          )}
          statsText={pick(
            `Пройдено уроков: 8/8 • Экзаменов сдано: ${passedCount} из ${examsCount}`,
            `Пройдено уроків: 8/8 • Іспитів складено: ${passedCount} із ${examsCount}`
          )}
          buttonLabel={pick('Ещё один пробный экзамен', 'Ще один пробний іспит')}
          onPrimary={() => {
            setExtraMockExam(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          secondaryLabel={pick('Умная тренировка', 'Розумне тренування')}
          onSecondary={onOpenSmartTraining}
          tertiaryLabel={pick('Вернуться в главное меню', 'Повернутися до головного меню')}
          onTertiary={handleExit}
        />
      );
    }

    // Interstitial screens before review, fix, checkpoint, mock_exam
    if (showInterstitial) {
      if (activeStep.kind === 'review') {
        const freshReview = getNextCourseStep(appState, Date.now(), uiLang);
        const reviewReason = freshReview.kind === 'review' ? freshReview.reason : activeStep.reason;
        return (
          <CourseInterstitial
            variant="review"
            title={pick('Сначала повторим', 'Спочатку повторимо')}
            description={reviewReason}
            buttonLabel={`${pick('Повторить', 'Повторити')} (${activeStep.questions.length} ${pick('вопр.', 'пит.')})`}
            onPrimary={() => {
              setShowInterstitial(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      }

      if (activeStep.kind === 'fix') {
        return (
          <CourseInterstitial
            variant="fix"
            title={pick(`Исправим ошибки урока ${activeStep.moduleId}`, `Виправимо помилки уроку ${activeStep.moduleId}`)}
            description={pick(
              `Осталось разобрать проблемные билеты (${activeStep.questions.length} шт.), чтобы уверенно закрыть тему.`,
              `Залишилося розібрати проблемні білети (${activeStep.questions.length} шт.), щоб упевнено закрити тему.`
            )}
            buttonLabel={`${pick('Исправить', 'Виправити')} (${activeStep.questions.length} ${pick('вопр.', 'пит.')})`}
            onPrimary={() => {
              setShowInterstitial(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      }

      if (activeStep.kind === 'quiz') {
        const modProg = getModuleProgress(appState.course, activeStep.moduleId);
        const modTotal = getModuleQuestions(activeStep.moduleId).length;
        const modThreshold = getModulePassThreshold(activeStep.moduleId);
        return (
          <CourseInterstitial
            variant="retake_quiz"
            title={pick(`Закрепим Урок ${activeStep.moduleId} ещё раз`, `Закріпимо Урок ${activeStep.moduleId} ще раз`)}
            description={pick(
              `Ошибки разобраны, но с 1-й попытки было ${modProg.bestFirstTryScore} из ${modTotal} (нужно минимум ${modThreshold}). Пройдите тест ещё раз без подсказок.`,
              `Помилки розібрані, але з 1-ї спроби було ${modProg.bestFirstTryScore} із ${modTotal} (потрібно щонайменше ${modThreshold}). Пройдіть тест ще раз без підказок.`
            )}
            buttonLabel={`${pick('Пройти тест', 'Пройти тест')} (${activeStep.questions.length} ${pick('вопр.', 'пит.')})`}
            onPrimary={() => {
              setShowInterstitial(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      }

      if (activeStep.kind === 'checkpoint') {
        return (
          <CourseInterstitial
            variant="checkpoint"
            title={pick('Контрольная: уроки 1–4', 'Контрольна: уроки 1–4')}
            description={
              checkpointRetryBanner ??
              pick(
                `12 вопросов по первым четырём темам. Для перехода к Уроку 5 нужно ответить верно минимум на ${CHECKPOINT_MIN_PASS_SCORE}.`,
                `12 питань із перших чотирьох тем. Для переходу до Уроку 5 потрібно відповісти правильно щонайменше на ${CHECKPOINT_MIN_PASS_SCORE}.`
              )
            }
            buttonLabel={pick('Начать контрольную (12 вопр.)', 'Почати контрольну (12 пит.)')}
            onPrimary={() => {
              setCheckpointRetryBanner(null);
              setShowInterstitial(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      }

      if (activeStep.kind === 'mock_exam') {
        const streak = appState.course.mockExamStreak;
        return (
          <CourseInterstitial
            variant="mock_exam"
            title={pick('Пробный экзамен Teoriprøven', 'Пробний іспит Teoriprøven')}
            description={pick(
              'Все уроки пройдены. Время экзамена: 25 вопросов, 25 минут, нужно минимум 20 верных.',
              'Усі уроки пройдено. Час іспиту: 25 питань, 25 хвилин, потрібно щонайменше 20 правильних.'
            )}
            statsText={pick(
              `Сдано подряд: ${streak} из ${REQUIRED_MOCK_EXAM_STREAK}`,
              `Складено поспіль: ${streak} із ${REQUIRED_MOCK_EXAM_STREAK}`
            )}
            buttonLabel={pick('Начать экзамен (25 вопр.)', 'Почати іспит (25 пит.)')}
            onPrimary={() => {
              setShowInterstitial(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      }
    }

    return renderStepContent();
  };

  // Active Step Rendering
  const renderStepContent = () => {
    switch (activeStep.kind) {
      case 'theory': {
        const modProgress = getModuleProgress(appState.course, activeStep.moduleId);
        return (
          <LessonTheory
            key={stepKey}
            moduleId={activeStep.moduleId}
            languageMode={appState.languageMode}
            nextButtonLabel={
              modProgress.flashcardsCompleted
                ? pick('Я прочитал — к тесту', 'Я прочитав — до тесту')
                : pick('Я прочитал — к карточкам и тесту', 'Я прочитав — до карток і тесту')
            }
            onComplete={() => {
              danishSpeech.stop();
              onCompleteTheory(activeStep.moduleId);
              setPendingTransition({ kind: 'advance' });
            }}
          />
        );
      }

      case 'flashcards':
        return (
          <LessonFlashcards
            key={stepKey}
            moduleId={activeStep.moduleId}
            entryIds={activeStep.entryIds}
            languageMode={appState.languageMode}
            onAnswer={(entryId, passed) => {
              onRecordResult(entryId, passed);
            }}
            onComplete={() => {
              danishSpeech.stop();
              onCompleteFlashcards(activeStep.moduleId);
              setPendingTransition({ kind: 'advance' });
            }}
          />
        );

      case 'quiz':
      case 'fix': {
        const mId = activeStep.moduleId;
        const isFullQuiz = activeStep.kind === 'quiz';
        const mod = modules.find((m) => m.id === mId);
        return (
          <QuizSessionView
            key={stepKey}
            mode="course"
            draftKey={getDraftKeyForStep(activeStep)}
            title={
              isFullQuiz
                ? `${pick('Тест · Урок', 'Тест · Урок')} ${mId}: ${mod?.titleRu ?? ''}`
                : `${pick('Работа над ошибками · Урок', 'Робота над помилками · Урок')} ${mId}`
            }
            moduleId={mId}
            initialQuestions={activeStep.questions}
            srsMap={appState.srs}
            languageMode={appState.languageMode}
            requeueFailuresInSession
            onRecordResult={onRecordResult}
            onCompleteSession={onCompleteSession}
            onCourseFinish={({ firstTryScore, total }) => {
              danishSpeech.stop();
              const wasPassedBefore = getModuleProgress(appState.course, mId).passed;
              onCompleteCourseQuiz(mId, isFullQuiz, firstTryScore);
              setPendingTransition({
                kind: 'after_lesson_quiz',
                moduleId: mId,
                wasPassedBefore,
                scoreText: isFullQuiz
                  ? pick(
                      `Результат с 1-й попытки: ${firstTryScore} из ${total}`,
                      `Результат з 1-ї спроби: ${firstTryScore} із ${total}`
                    )
                  : pick(
                      `Ошибки исправлены (${total} вопр.)`,
                      `Помилки виправлено (${total} пит.)`
                    ),
              });
            }}
            onExit={handleExit}
          />
        );
      }

      case 'review':
        return (
          <QuizSessionView
            key={stepKey}
            mode="course"
            draftKey="course_review"
            title={pick('Повторение пройденных тем', 'Повторення пройдених тем')}
            initialQuestions={activeStep.questions}
            srsMap={appState.srs}
            languageMode={appState.languageMode}
            requeueFailuresInSession
            onRecordResult={onRecordResult}
            onCompleteSession={onCompleteSession}
            onCourseFinish={() => {
              danishSpeech.stop();
              setPendingTransition({ kind: 'advance' });
            }}
            onExit={handleExit}
          />
        );

      case 'checkpoint':
        return (
          <QuizSessionView
            key={stepKey}
            mode="course"
            draftKey="course_checkpoint"
            title={pick('Контрольная · Уроки 1–4', 'Контрольна · Уроки 1–4')}
            initialQuestions={activeStep.questions}
            srsMap={appState.srs}
            languageMode={appState.languageMode}
            requeueFailuresInSession={false}
            onRecordResult={onRecordResult}
            onCompleteSession={onCompleteSession}
            onCourseFinish={({ firstTryScore, total }) => {
              danishSpeech.stop();
              const passed = firstTryScore >= CHECKPOINT_MIN_PASS_SCORE;
              onCompleteCheckpoint(passed);
              setPendingTransition({
                kind: 'after_checkpoint',
                passed,
                score: firstTryScore,
                total,
              });
            }}
            onExit={handleExit}
          />
        );

      case 'mock_exam':
        return (
          <ExamSimulatorView
            key={stepKey}
            languageMode={appState.languageMode}
            examHistory={appState.examHistory}
            srsMap={appState.srs}
            autoStart
            onFinishExam={onFinishExam}
            onTrainFailedQuestions={onTrainFailedQuestions}
            onBackToCourse={() => {
              danishSpeech.stop();
              const next = getNextCourseStep(appState, Date.now(), uiLang);
              setActiveStep(next);
              setStepKey(`step_${Date.now()}`);
              setShowInterstitial(shouldShowInterstitial(next, appState));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
    }
  };

  return (
    <div className="space-y-5">
      <CourseProgressBar
        step={effectiveStep}
        celebratingModuleId={celebrating?.moduleId ?? null}
        percent={effectivePercent}
        course={appState.course}
        moduleProgress={moduleProgress}
        browsingModuleId={browsingModuleId}
        onSelectModuleInMap={(mId) => {
          danishSpeech.stop();
          setBrowsingModuleId(mId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onExit={handleExit}
      />
      {browsingModuleId !== null ? (
        <div className="space-y-4 animate-slide-up">
          <div className="nordic-card flex flex-wrap items-center justify-between gap-3 border-teal-200/80 bg-teal-50/50 px-4 py-3 dark:border-teal-900/50 dark:bg-teal-950/20">
            <div className="text-xs font-medium text-teal-900 dark:text-teal-200">
              {pick(
                'Режим повторения теории · прогресс основного курса сохранён',
                'Режим повторення теорії · прогрес основного курсу збережено'
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                danishSpeech.stop();
                setBrowsingModuleId(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {pick('← Вернуться к текущему шагу курса', '← Повернутися до поточного кроку курсу')}
            </button>
          </div>
          <LessonTheory
            key={`browse_${browsingModuleId}`}
            moduleId={browsingModuleId}
            languageMode={appState.languageMode}
            nextButtonLabel={pick('Вернуться к текущему шагу', 'Повернутися до поточного кроку')}
            onComplete={() => {
              danishSpeech.stop();
              setBrowsingModuleId(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      ) : (
        renderMainBody()
      )}
    </div>
  );
};
