import React, { useEffect, useState } from 'react';
import { MODULES_DATA } from '../../data/modulesData';
import {
  CHECKPOINT_MIN_PASS_SCORE,
  CourseStep,
  getCourseOverview,
  getModuleProgress,
  getNextCourseStep,
  REQUIRED_MOCK_EXAM_STREAK,
} from '../../services/coursePlanner';
import { danishSpeech } from '../../services/speech';
import { SRSRecord, UserAppState } from '../../types';
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

function shouldShowInterstitial(step: CourseStep): boolean {
  return (
    step.kind === 'review' ||
    step.kind === 'fix' ||
    step.kind === 'checkpoint' ||
    step.kind === 'mock_exam'
  );
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
  onOpenSmartTraining,
  onExit,
}) => {
  const [activeStep, setActiveStep] = useState<CourseStep>(() => getNextCourseStep(appState));
  const [stepKey, setStepKey] = useState<string>(() => `step_${Date.now()}`);
  const [showInterstitial, setShowInterstitial] = useState<boolean>(() =>
    shouldShowInterstitial(getNextCourseStep(appState))
  );
  const [celebrating, setCelebrating] = useState<{
    moduleId: number;
    scoreText: string;
  } | null>(null);
  const [checkpointRetryBanner, setCheckpointRetryBanner] = useState<string | null>(null);
  const [extraMockExam, setExtraMockExam] = useState<boolean>(false);
  const [pendingTransition, setPendingTransition] = useState<PendingTransition>(null);

  useEffect(() => {
    if (!pendingTransition) return;

    const nextStep = getNextCourseStep(appState);

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
          `Результат: ${pendingTransition.score} из ${pendingTransition.total}. Для прохождения нужно минимум ${CHECKPOINT_MIN_PASS_SCORE}. Ошибки добавлены к повторению — попробуйте ещё раз.`
        );
      } else {
        setCheckpointRetryBanner(null);
      }
    }

    setActiveStep(nextStep);
    setStepKey(`step_${Date.now()}`);
    setShowInterstitial(shouldShowInterstitial(nextStep));
    setPendingTransition(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [appState, pendingTransition]);

  const overview = getCourseOverview(appState);
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

  // Extra mock exam launched from 'ready' screen
  if (extraMockExam) {
    return (
      <div className="space-y-5">
        <CourseProgressBar
          step={{ kind: 'mock_exam' }}
          celebratingModuleId={null}
          percent={overview.percent}
          onExit={handleExit}
        />
        <ExamSimulatorView
          languageMode={appState.languageMode}
          examHistory={appState.examHistory}
          autoStart
          onFinishExam={onFinishExam}
          onTrainFailedQuestions={() => {}}
          onBackToCourse={() => {
            setExtraMockExam(false);
            const next = getNextCourseStep(appState);
            setActiveStep(next);
            setShowInterstitial(shouldShowInterstitial(next));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  // Celebration screen after closing a module
  if (celebrating !== null) {
    const mod = MODULES_DATA.find((m) => m.id === celebrating.moduleId);
    const nextButtonText =
      activeStep.kind === 'checkpoint'
        ? 'К контрольной по урокам 1–4'
        : activeStep.kind === 'mock_exam'
          ? 'К финальному экзамену'
          : activeStep.kind === 'review'
            ? 'Продолжить'
            : `Урок ${celebrating.moduleId + 1}`;

    return (
      <div className="space-y-6">
        <CourseProgressBar
          step={activeStep}
          celebratingModuleId={celebrating.moduleId}
          percent={overview.percent}
          moduleProgress={getModuleProgress(appState.course, celebrating.moduleId)}
          onExit={handleExit}
        />
        <CourseInterstitial
          variant="lesson_passed"
          title={`Урок ${celebrating.moduleId} пройден`}
          description={`Тема «${mod?.titleRu ?? ''}» успешно закреплена.`}
          statsText={celebrating.scoreText}
          buttonLabel={nextButtonText}
          onPrimary={() => {
            danishSpeech.stop();
            setCelebrating(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  // Course fully completed ('ready')
  if (activeStep.kind === 'ready') {
    const examsCount = appState.examHistory.length;
    const passedCount = appState.examHistory.filter((e) => e.passed).length;

    return (
      <div className="space-y-6">
        <CourseProgressBar
          step={activeStep}
          celebratingModuleId={null}
          percent={100}
          onExit={handleExit}
        />
        <CourseInterstitial
          variant="ready"
          title="Вы готовы к Teoriprøven"
          description="Все 8 уроков, контрольная и серия из 3 пробных экзаменов подряд успешно пройдены."
          statsText={`Пройдено уроков: 8/8 • Экзаменов сдано: ${passedCount} из ${examsCount}`}
          buttonLabel="Ещё один пробный экзамен"
          onPrimary={() => {
            setExtraMockExam(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          secondaryLabel="Умная тренировка"
          onSecondary={onOpenSmartTraining}
          tertiaryLabel="Вернуться в главное меню"
          onTertiary={handleExit}
        />
      </div>
    );
  }

  // Interstitial screens before review, fix, checkpoint, mock_exam
  if (showInterstitial) {
    if (activeStep.kind === 'review') {
      return (
        <div className="space-y-6">
          <CourseProgressBar
            step={activeStep}
            celebratingModuleId={null}
            percent={overview.percent}
            onExit={handleExit}
          />
          <CourseInterstitial
            variant="review"
            title="Сначала повторим"
            description={activeStep.reason}
            buttonLabel={`Повторить (${activeStep.questions.length} вопр.)`}
            onPrimary={() => {
              setShowInterstitial(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      );
    }

    if (activeStep.kind === 'fix') {
      return (
        <div className="space-y-6">
          <CourseProgressBar
            step={activeStep}
            celebratingModuleId={null}
            percent={overview.percent}
            moduleProgress={moduleProgress}
            onExit={handleExit}
          />
          <CourseInterstitial
            variant="fix"
            title={`Исправим ошибки урока ${activeStep.moduleId}`}
            description={`Осталось разобрать проблемные билеты (${activeStep.questions.length} шт.), чтобы уверенно закрыть тему.`}
            buttonLabel={`Исправить (${activeStep.questions.length} вопр.)`}
            onPrimary={() => {
              setShowInterstitial(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      );
    }

    if (activeStep.kind === 'checkpoint') {
      return (
        <div className="space-y-6">
          <CourseProgressBar
            step={activeStep}
            celebratingModuleId={null}
            percent={overview.percent}
            onExit={handleExit}
          />
          <CourseInterstitial
            variant="checkpoint"
            title="Контрольная: уроки 1–4"
            description={
              checkpointRetryBanner ??
              `12 вопросов по первым четырём темам. Для перехода к Уроку 5 нужно ответить верно минимум на ${CHECKPOINT_MIN_PASS_SCORE}.`
            }
            buttonLabel="Начать контрольную (12 вопр.)"
            onPrimary={() => {
              setCheckpointRetryBanner(null);
              setShowInterstitial(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      );
    }

    if (activeStep.kind === 'mock_exam') {
      const streak = appState.course.mockExamStreak;
      return (
        <div className="space-y-6">
          <CourseProgressBar
            step={activeStep}
            celebratingModuleId={null}
            percent={overview.percent}
            onExit={handleExit}
          />
          <CourseInterstitial
            variant="mock_exam"
            title="Пробный экзамен Teoriprøven"
            description="Все уроки пройдены. Время экзамена: 25 вопросов, 25 минут, нужно минимум 20 верных."
            statsText={`Сдано подряд: ${streak} из ${REQUIRED_MOCK_EXAM_STREAK}`}
            buttonLabel="Начать экзамен (25 вопр.)"
            onPrimary={() => {
              setShowInterstitial(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      );
    }
  }

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
                ? 'Я прочитал — к тесту'
                : 'Я прочитал — к карточкам и тесту'
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
        const mod = MODULES_DATA.find((m) => m.id === mId);
        return (
          <QuizSessionView
            key={stepKey}
            mode="course"
            title={
              isFullQuiz
                ? `Тест · Урок ${mId}: ${mod?.titleRu ?? ''}`
                : `Работа над ошибками · Урок ${mId}`
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
                  ? `Результат с 1-й попытки: ${firstTryScore} из ${total}`
                  : `Ошибки исправлены (${total} вопр.)`,
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
            title="Повторение пройденных тем"
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
            title="Контрольная · Уроки 1–4"
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
            autoStart
            onFinishExam={onFinishExam}
            onTrainFailedQuestions={() => {}}
            onBackToCourse={() => {
              danishSpeech.stop();
              const next = getNextCourseStep(appState);
              setActiveStep(next);
              setStepKey(`step_${Date.now()}`);
              setShowInterstitial(shouldShowInterstitial(next));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
    }
  };

  return (
    <div className="space-y-5">
      <CourseProgressBar
        step={activeStep}
        celebratingModuleId={null}
        percent={overview.percent}
        moduleProgress={moduleProgress}
        onExit={handleExit}
      />
      {renderStepContent()}
    </div>
  );
};
