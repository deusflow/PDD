import React, { useEffect, useMemo, useState } from 'react';
import { BackupSyncModal } from './components/layout/BackupSyncModal';
import { Header } from './components/layout/Header';
import { OnboardingModal } from './components/layout/OnboardingModal';
import { DashboardView } from './components/views/DashboardView';
import { DictionaryView } from './components/views/DictionaryView';
import { ExamSimulatorView } from './components/views/ExamSimulatorView';
import { ModulesView } from './components/views/ModulesView';
import { QuizSessionView } from './components/views/QuizSessionView';
import { QUESTIONS_BANK } from './data/questionsBank';
import { danishSpeech } from './services/speech';
import {
  buildSmartSession,
  computeProgressStats,
  updateSRSRecord,
} from './services/srsEngine';
import { StorageManager } from './services/storage';
import {
  ActiveTab,
  ExamAttemptSummary,
  LanguageMode,
  SRSRecord,
  TeoriQuestion,
  UserAppState,
} from './types';

interface ActiveQuizSession {
  key: string;
  title: string;
  subtitle?: string;
  questions: TeoriQuestion[];
  requeueFailures: boolean;
}

export const App: React.FC = () => {
  const [appState, setAppState] = useState<UserAppState>(() => StorageManager.load());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [activeSession, setActiveSession] = useState<ActiveQuizSession | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(
    () => !StorageManager.load().hasSeenOnboarding
  );
  const [isBackupOpen, setIsBackupOpen] = useState<boolean>(false);

  // Persist to localStorage whenever appState updates
  useEffect(() => {
    StorageManager.save(appState);
  }, [appState]);

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
    setActiveSession(null);
    setActiveTab(tab);
  };

  const handleRecordResult = (itemId: string, isAllCorrect: boolean): SRSRecord => {
    const updatedRecord = updateSRSRecord(appState.srs[itemId], itemId, isAllCorrect);
    setAppState((prev) => ({
      ...prev,
      srs: {
        ...prev.srs,
        [itemId]: updateSRSRecord(prev.srs[itemId], itemId, isAllCorrect),
      },
    }));
    return updatedRecord;
  };

  const handleStartSmartSession = (count: 10 | 20) => {
    danishSpeech.stop();
    const selected = buildSmartSession(QUESTIONS_BANK, appState.srs, count);
    setActiveSession({
      key: `smart_${Date.now()}`,
      title: `Умная тренировка (${selected.length} вопр.)`,
      subtitle: 'Ошибки Box 1 + Повторения Box 2–3 + Новые Box 0',
      questions: selected,
      requeueFailures: true,
    });
  };

  const handleStartCustomSession = (
    title: string,
    subtitle: string,
    questions: TeoriQuestion[]
  ) => {
    danishSpeech.stop();
    setActiveSession({
      key: `custom_${Date.now()}`,
      title,
      subtitle,
      questions,
      requeueFailures: true,
    });
  };

  const handleCompleteSession = () => {
    setAppState((prev) => ({
      ...prev,
      sessionsCompleted: prev.sessionsCompleted + 1,
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
      }
      return {
        ...prev,
        srs: nextSrs,
        examHistory: [summary, ...prev.examHistory].slice(0, 50),
        sessionsCompleted: prev.sessionsCompleted + 1,
      };
    });
  };

  const handleOpenModuleFromDashboard = (moduleId: number) => {
    danishSpeech.stop();
    setSelectedModuleId(moduleId);
    setActiveTab('modules');
  };

  const handleRestoreState = (next: UserAppState) => {
    setAppState(next);
  };

  const handleResetAll = () => {
    const fresh = StorageManager.clear();
    setAppState(fresh);
    setActiveSession(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        languageMode={appState.languageMode}
        onLanguageModeChange={handleLanguageChange}
        theme={appState.theme}
        onThemeToggle={handleThemeToggle}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        dueBadgeCount={questionStats.dueCount}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {activeSession ? (
          <QuizSessionView
            key={activeSession.key}
            title={activeSession.title}
            subtitle={activeSession.subtitle}
            initialQuestions={activeSession.questions}
            srsMap={appState.srs}
            languageMode={appState.languageMode}
            requeueFailuresInSession={activeSession.requeueFailures}
            onRecordResult={handleRecordResult}
            onCompleteSession={handleCompleteSession}
            onExit={() => {
              danishSpeech.stop();
              setActiveSession(null);
            }}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                srsMap={appState.srs}
                languageMode={appState.languageMode}
                sessionsCompleted={appState.sessionsCompleted}
                onStartSmartSession={handleStartSmartSession}
                onStartCustomSession={handleStartCustomSession}
                onOpenModule={handleOpenModuleFromDashboard}
              />
            )}

            {activeTab === 'modules' && (
              <ModulesView
                selectedModuleId={selectedModuleId}
                onSelectModule={setSelectedModuleId}
                srsMap={appState.srs}
                languageMode={appState.languageMode}
                onStartModuleQuiz={handleStartCustomSession}
                onRecordEntryReview={(entryId, passed) => {
                  handleRecordResult(entryId, passed);
                }}
              />
            )}

            {activeTab === 'exam' && (
              <ExamSimulatorView
                languageMode={appState.languageMode}
                examHistory={appState.examHistory}
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
                onRecordEntryReview={(entryId, passed) => {
                  handleRecordResult(entryId, passed);
                }}
              />
            )}
          </>
        )}
      </main>

      <OnboardingModal isOpen={isOnboardingOpen} onClose={handleCloseOnboarding} />

      <BackupSyncModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        appState={appState}
        onRestoreState={handleRestoreState}
        onResetAll={handleResetAll}
      />
    </div>
  );
};

export default App;
