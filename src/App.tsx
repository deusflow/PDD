import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import type { CategoryFilter } from './components/views/DictionaryView';

const BackupSyncModal = lazy(() =>
  import('./components/layout/BackupSyncModal').then((m) => ({ default: m.BackupSyncModal }))
);
const OnboardingModal = lazy(() =>
  import('./components/layout/OnboardingModal').then((m) => ({ default: m.OnboardingModal }))
);
const CourseView = lazy(() =>
  import('./components/views/CourseView').then((m) => ({ default: m.CourseView }))
);
const ModulesView = lazy(() =>
  import('./components/views/ModulesView').then((m) => ({ default: m.ModulesView }))
);
const ExamSimulatorView = lazy(() =>
  import('./components/views/ExamSimulatorView').then((m) => ({ default: m.ExamSimulatorView }))
);
const DictionaryView = lazy(() =>
  import('./components/views/DictionaryView').then((m) => ({ default: m.DictionaryView }))
);
const QuizSessionView = lazy(() =>
  import('./components/views/QuizSessionView').then((m) => ({ default: m.QuizSessionView }))
);
import { QUESTIONS_BANK } from './data/questionsBank';
import { DICTIONARY_ENTRIES } from './data/signsAndGlossary';
import {
  canModulePass,
  getModuleProgress,
  getModuleQuestions,
  getPendingFlashcardIdsForModule,
} from './services/coursePlanner';
import { danishSpeech } from './services/speech';
import {
  buildSmartSession,
  computeProgressStats,
  updateSRSRecord,
} from './services/srsEngine';
import {
  clearFreeSessionMeta,
  clearQuizDraft,
  loadFreeSessionMeta,
  loadNavState,
  PersistedNavState,
  saveFreeSessionMeta,
  saveNavState,
} from './services/sessionPersistence';
import { StorageManager } from './services/storage';
import {
  ActiveTab,
  ExamAttemptSummary,
  LanguageMode,
  LessonTab,
  ModuleCourseProgress,
  SRSRecord,
  TeoriQuestion,
  UserAppState,
} from './types';

interface ActiveQuizSession {
  key: string;
  title: string;
  subtitle?: string;
  moduleId?: number;
  questions: TeoriQuestion[];
  requeueFailures: boolean;
}

function restoreInitialSession(): ActiveQuizSession | null {
  const meta = loadFreeSessionMeta();
  if (!meta) return null;
  const byId = new Map(QUESTIONS_BANK.map((q) => [q.id, q]));
  const questions = meta.questionIds
    .map((id) => byId.get(id))
    .filter((q): q is TeoriQuestion => Boolean(q));
  if (questions.length !== meta.questionIds.length || questions.length === 0) {
    clearFreeSessionMeta();
    return null;
  }
  return {
    key: meta.key,
    title: meta.title,
    subtitle: meta.subtitle,
    moduleId: meta.moduleId,
    questions,
    requeueFailures: meta.requeueFailures,
  };
}

function syncRelatedDictionaryItems(
  srsMap: Record<string, SRSRecord>,
  questionId: string,
  isAllCorrect: boolean,
  now: number
): void {
  const q = QUESTIONS_BANK.find((item) => item.id === questionId);
  if (!q) return;

  for (const entry of DICTIONARY_ENTRIES) {
    const matchesSign = Boolean(q.visual.signCode && entry.signCode === q.visual.signCode);
    const matchesHotspot = Boolean(
      q.visual.technicalHotspot && entry.technicalHotspot === q.visual.technicalHotspot
    );
    if (matchesSign || matchesHotspot) {
      srsMap[entry.id] = updateSRSRecord(srsMap[entry.id], entry.id, isAllCorrect, now);
    }
  }
}

function applyModuleQuizUpdate(
  prev: UserAppState,
  moduleId: number,
  isFullQuiz: boolean,
  firstTryScore: number,
  now: number
): UserAppState {
  const prevMod = getModuleProgress(prev.course, moduleId);
  const nextBestScore = isFullQuiz
    ? Math.max(prevMod.bestFirstTryScore, firstTryScore)
    : prevMod.bestFirstTryScore;

  const candidateMod: ModuleCourseProgress = {
    ...prevMod,
    quizAttempts: prevMod.quizAttempts + 1,
    bestFirstTryScore: nextBestScore,
  };

  const nowPassed = prevMod.passed || canModulePass(candidateMod, prev.srs, moduleId);
  const updatedMod: ModuleCourseProgress = {
    ...candidateMod,
    theoryCompleted: prevMod.theoryCompleted || nowPassed,
    flashcardsCompleted: prevMod.flashcardsCompleted || nowPassed,
    passed: nowPassed,
    passedAt: nowPassed ? (prevMod.passedAt ?? now) : null,
  };

  return {
    ...prev,
    course: {
      ...prev.course,
      lastActiveAt: now,
      modules: {
        ...prev.course.modules,
        [moduleId]: updatedMod,
      },
    },
  };
}

export const App: React.FC = () => {
  const [appState, setAppState] = useState<UserAppState>(() => StorageManager.load());
  const [initialNav] = useState<PersistedNavState>(() => loadNavState());
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialNav.activeTab);
  const [selectedModuleId, setSelectedModuleId] = useState<number>(initialNav.selectedModuleId);
  const [modulesViewMode, setModulesViewMode] = useState<'list' | 'lesson'>(
    initialNav.modulesViewMode
  );
  const [lessonTab, setLessonTab] = useState<LessonTab>(initialNav.lessonTab);
  const [dictionaryCategory, setDictionaryCategory] = useState<CategoryFilter>(
    initialNav.dictionaryCategory
  );
  const [activeSession, setActiveSession] = useState<ActiveQuizSession | null>(() =>
    restoreInitialSession()
  );
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isBackupOpen, setIsBackupOpen] = useState<boolean>(false);

  // Persist to localStorage whenever appState updates
  useEffect(() => {
    StorageManager.save(appState);
  }, [appState]);

  // Persist navigation state whenever location/tab/module updates
  useEffect(() => {
    saveNavState({
      activeTab,
      selectedModuleId,
      modulesViewMode,
      lessonTab,
      dictionaryCategory,
    });
  }, [activeTab, selectedModuleId, modulesViewMode, lessonTab, dictionaryCategory]);

  // Persist active free-quiz session metadata across page reloads
  useEffect(() => {
    if (activeSession) {
      saveFreeSessionMeta({
        key: activeSession.key,
        title: activeSession.title,
        subtitle: activeSession.subtitle,
        moduleId: activeSession.moduleId,
        questionIds: activeSession.questions.map((q) => q.id),
        requeueFailures: activeSession.requeueFailures,
      });
    } else {
      clearFreeSessionMeta();
    }
  }, [activeSession]);

  // Apply light / dark theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (appState.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [appState.theme]);

  const questionStats = useMemo(
    () =>
      computeProgressStats(
        QUESTIONS_BANK.map((q) => q.id),
        appState.srs
      ),
    [appState.srs]
  );

  const handleLanguageChange = (languageMode: LanguageMode) => {
    setAppState((prev) => ({ ...prev, languageMode }));
  };

  const handleThemeToggle = () => {
    setAppState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
    if (!appState.hasSeenOnboarding) {
      setAppState((prev) => ({ ...prev, hasSeenOnboarding: true }));
    }
  };

  const handleTabChange = (tab: ActiveTab) => {
    danishSpeech.stop();
    clearQuizDraft('free_active');
    setActiveSession(null);
    if (tab === 'dictionary') {
      setDictionaryCategory('all');
    }
    if (tab === 'modules') {
      setModulesViewMode('list');
      setLessonTab('slides');
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecordResult = (itemId: string, isAllCorrect: boolean): SRSRecord => {
    const now = Date.now();
    const updatedRecord = updateSRSRecord(appState.srs[itemId], itemId, isAllCorrect, now);
    setAppState((prev) => {
      const nextSrs: Record<string, SRSRecord> = {
        ...prev.srs,
        [itemId]: updateSRSRecord(prev.srs[itemId], itemId, isAllCorrect, now),
      };
      syncRelatedDictionaryItems(nextSrs, itemId, isAllCorrect, now);
      return {
        ...prev,
        srs: nextSrs,
      };
    });
    return updatedRecord;
  };

  const handleStartSmartSession = (count: 10 | 20) => {
    danishSpeech.stop();
    clearQuizDraft('free_active');
    const selected = buildSmartSession(QUESTIONS_BANK, appState.srs, count);
    setActiveSession({
      key: `smart_${Date.now()}`,
      title: `Умная тренировка (${selected.length} вопр.)`,
      subtitle: 'Ошибки Box 1 + Повторения Box 2–3 + Новые Box 0',
      questions: selected,
      requeueFailures: true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartCustomSession = (
    title: string,
    subtitle: string,
    questions: TeoriQuestion[],
    moduleId?: number
  ) => {
    danishSpeech.stop();
    clearQuizDraft('free_active');
    setActiveSession({
      key: `custom_${Date.now()}`,
      title,
      subtitle,
      moduleId,
      questions,
      requeueFailures: true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteSession = () => {
    setAppState((prev) => ({
      ...prev,
      sessionsCompleted: prev.sessionsCompleted + 1,
    }));
  };

  const handleFreeQuizComplete = (moduleId: number, firstTryScore: number) => {
    const now = Date.now();
    const fullCount = getModuleQuestions(moduleId).length;
    const isFullQuiz = (activeSession?.questions.length ?? 0) >= fullCount;
    setAppState((prev) => applyModuleQuizUpdate(prev, moduleId, isFullQuiz, firstTryScore, now));
  };

  const handleCompleteTheory = (moduleId: number) => {
    const now = Date.now();
    setAppState((prev) => {
      const prevMod = getModuleProgress(prev.course, moduleId);
      const pendingFlashcards = getPendingFlashcardIdsForModule(prev.srs, moduleId);
      return {
        ...prev,
        course: {
          ...prev.course,
          lastActiveAt: now,
          modules: {
            ...prev.course.modules,
            [moduleId]: {
              ...prevMod,
              theoryCompleted: true,
              flashcardsCompleted:
                prevMod.flashcardsCompleted || pendingFlashcards.length === 0,
            },
          },
        },
      };
    });
  };

  const handleCompleteFlashcards = (moduleId: number) => {
    const now = Date.now();
    setAppState((prev) => {
      const prevMod = getModuleProgress(prev.course, moduleId);
      return {
        ...prev,
        course: {
          ...prev.course,
          lastActiveAt: now,
          modules: {
            ...prev.course.modules,
            [moduleId]: {
              ...prevMod,
              flashcardsCompleted: true,
            },
          },
        },
      };
    });
  };

  const handleCompleteCourseQuiz = (
    moduleId: number,
    isFullQuiz: boolean,
    firstTryScore: number
  ) => {
    const now = Date.now();
    setAppState((prev) => applyModuleQuizUpdate(prev, moduleId, isFullQuiz, firstTryScore, now));
  };

  const handleCompleteCheckpoint = (passed: boolean) => {
    const now = Date.now();
    setAppState((prev) => ({
      ...prev,
      course: {
        ...prev.course,
        checkpointMidPassed: prev.course.checkpointMidPassed || passed,
        lastActiveAt: now,
      },
    }));
  };

  const handleFinishExam = (
    summary: ExamAttemptSummary,
    results: Array<{ questionId: string; passed: boolean }>
  ) => {
    setAppState((prev) => {
      const nextSrs = { ...prev.srs };
      const now = Date.now();
      for (const r of results) {
        nextSrs[r.questionId] = updateSRSRecord(nextSrs[r.questionId], r.questionId, r.passed, now);
        syncRelatedDictionaryItems(nextSrs, r.questionId, r.passed, now);
      }
      return {
        ...prev,
        srs: nextSrs,
        examHistory: [summary, ...prev.examHistory].slice(0, 50),
        sessionsCompleted: prev.sessionsCompleted + 1,
        course: {
          ...prev.course,
          mockExamStreak: summary.passed ? prev.course.mockExamStreak + 1 : 0,
          lastActiveAt: now,
        },
      };
    });
  };

  const handleOpenCourse = () => {
    danishSpeech.stop();
    setActiveSession(null);
    setActiveTab('course');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLessonsList = () => {
    danishSpeech.stop();
    setModulesViewMode('list');
    setActiveTab('modules');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToNextModule = (nextModuleId: number) => {
    danishSpeech.stop();
    setActiveSession(null);
    setSelectedModuleId(nextModuleId);
    setModulesViewMode('lesson');
    setLessonTab('slides');
    setActiveTab('modules');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToLessons = () => {
    danishSpeech.stop();
    setActiveSession(null);
    setModulesViewMode('list');
    setActiveTab('modules');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenExam = () => {
    danishSpeech.stop();
    setActiveTab('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSignsAndKontrol = () => {
    danishSpeech.stop();
    setDictionaryCategory('sign_kontrol');
    setActiveTab('dictionary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDictionary = () => {
    danishSpeech.stop();
    setDictionaryCategory('all');
    setActiveTab('dictionary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestoreState = (next: UserAppState) => {
    setAppState(next);
  };

  const handleResetAll = () => {
    const fresh = StorageManager.clear();
    setAppState(fresh);
    setActiveSession(null);
    setSelectedModuleId(1);
    setModulesViewMode('list');
    setLessonTab('slides');
    setDictionaryCategory('all');
    setActiveTab('dashboard');
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#F7F8F7] text-zinc-900 dark:bg-[#0B1117] dark:text-zinc-100">
      {/* Partial atmospheric site background matching Danish driving-school visuals */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
        {/* Soft Nordic teal & warm sunlight ambient glows */}
        <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-teal-400/15 blur-3xl dark:bg-teal-500/[0.08]" />
        <div className="absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-amber-300/15 blur-3xl dark:bg-amber-400/[0.05]" />

        {/* Partial faded country-road illustration in top-right */}
        <div
          className="absolute right-0 top-0 h-[58vh] w-full sm:w-[68%] lg:w-[56%]"
          style={{
            WebkitMaskImage: 'radial-gradient(ellipse at top right, rgba(0,0,0,0.95) 8%, rgba(0,0,0,0.4) 42%, transparent 74%)',
            maskImage: 'radial-gradient(ellipse at top right, rgba(0,0,0,0.95) 8%, rgba(0,0,0,0.4) 42%, transparent 74%)',
          }}
        >
          <img
            src="./images/rules/country-lanes.jpg"
            alt=""
            className="h-full w-full object-cover object-center opacity-[0.14] saturate-[0.85] dark:opacity-[0.18]"
          />
        </div>

        {/* Subtle minimalist road-lane perspective accent in bottom-left */}
        <svg
          viewBox="0 0 600 220"
          className="absolute bottom-0 left-0 h-44 w-[480px] opacity-[0.04] dark:opacity-[0.06]"
          fill="none"
        >
          <path d="M 30 220 L 210 20" stroke="currentColor" strokeWidth="2" />
          <path d="M 380 220 L 290 20" stroke="currentColor" strokeWidth="2" />
          <path d="M 205 220 L 250 20" stroke="currentColor" strokeWidth="3" strokeDasharray="16 14" />
        </svg>
      </div>

      <div className="relative z-10">
        <Header
          activeTab={activeTab}
          inActiveSession={Boolean(activeSession)}
          onTabChange={handleTabChange}
          languageMode={appState.languageMode}
          onLanguageModeChange={handleLanguageChange}
          theme={appState.theme}
          onThemeToggle={handleThemeToggle}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenBackup={() => setIsBackupOpen(true)}
          dueBadgeCount={questionStats.dueCount}
        />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-8">
        <Suspense
          fallback={
            <div className="nordic-card mx-auto max-w-3xl p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Загрузка раздела...
            </div>
          }
        >
          {activeSession ? (
          <QuizSessionView
            key={activeSession.key}
            mode="free"
            draftKey="free_active"
            title={activeSession.title}
            subtitle={activeSession.subtitle}
            moduleId={activeSession.moduleId}
            initialQuestions={activeSession.questions}
            srsMap={appState.srs}
            languageMode={appState.languageMode}
            requeueFailuresInSession={activeSession.requeueFailures}
            onRecordResult={handleRecordResult}
            onCompleteSession={handleCompleteSession}
            onFreeQuizComplete={handleFreeQuizComplete}
            onContinueToNextModule={handleContinueToNextModule}
            onReturnToLessons={
              activeSession.moduleId !== undefined ? handleReturnToLessons : undefined
            }
            onRestartWithQuestions={handleStartCustomSession}
            onExit={() => {
              danishSpeech.stop();
              setActiveSession(null);
              setActiveTab('dashboard');
            }}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                appState={appState}
                onStartCourse={handleOpenCourse}
                onStartSmartSession={handleStartSmartSession}
                onStartCustomSession={handleStartCustomSession}
                onOpenExam={handleOpenExam}
                onOpenSignsAndKontrol={handleOpenSignsAndKontrol}
                onOpenDictionary={handleOpenDictionary}
                onOpenLessonsReference={handleOpenLessonsList}
              />
            )}

            {activeTab === 'course' && (
              <CourseView
                appState={appState}
                onRecordResult={handleRecordResult}
                onCompleteSession={handleCompleteSession}
                onCompleteTheory={handleCompleteTheory}
                onCompleteFlashcards={handleCompleteFlashcards}
                onCompleteCourseQuiz={handleCompleteCourseQuiz}
                onCompleteCheckpoint={handleCompleteCheckpoint}
                onFinishExam={handleFinishExam}
                onTrainFailedQuestions={(failedQs) => {
                  handleStartCustomSession(
                    'Отработка ошибок экзамена (Box 1)',
                    'Повтор билетов, в которых были допущены ошибки',
                    failedQs
                  );
                }}
                onOpenSmartTraining={() => {
                  setActiveTab('dashboard');
                  handleStartSmartSession(10);
                }}
                onExit={() => handleTabChange('dashboard')}
              />
            )}

            {activeTab === 'modules' && (
              <ModulesView
                selectedModuleId={selectedModuleId}
                initialViewMode={modulesViewMode}
                initialLessonTab={lessonTab}
                onSelectModule={setSelectedModuleId}
                onViewModeChange={setModulesViewMode}
                onLessonTabChange={setLessonTab}
                srsMap={appState.srs}
                courseModules={appState.course.modules}
                languageMode={appState.languageMode}
                onStartModuleQuiz={handleStartCustomSession}
                onMarkTheoryRead={handleCompleteTheory}
                onRecordEntryReview={(entryId, passed) => {
                  handleRecordResult(entryId, passed);
                }}
                onOpenCourse={handleOpenCourse}
              />
            )}

            {activeTab === 'exam' && (
              <ExamSimulatorView
                languageMode={appState.languageMode}
                examHistory={appState.examHistory}
                srsMap={appState.srs}
                onFinishExam={handleFinishExam}
                onTrainFailedQuestions={(failedQs) => {
                  handleStartCustomSession(
                    'Отработка ошибок экзамена (Box 1)',
                    'Повтор билетов, в которых были допущены ошибки',
                    failedQs
                  );
                }}
              />
            )}

            {activeTab === 'dictionary' && (
              <DictionaryView
                srsMap={appState.srs}
                languageMode={appState.languageMode}
                initialCategory={dictionaryCategory}
                onCategoryChange={setDictionaryCategory}
                onRecordEntryReview={(entryId, passed) => {
                  handleRecordResult(entryId, passed);
                }}
              />
            )}
          </>
        )}
        </Suspense>
      </main>
      </div>

      <Suspense fallback={null}>
        {isOnboardingOpen && (
          <OnboardingModal isOpen={isOnboardingOpen} onClose={handleCloseOnboarding} />
        )}

        {isBackupOpen && (
          <BackupSyncModal
            isOpen={isBackupOpen}
            onClose={() => setIsBackupOpen(false)}
            appState={appState}
            onRestoreState={handleRestoreState}
            onResetAll={handleResetAll}
          />
        )}
      </Suspense>
    </div>
  );
};

export default App;
