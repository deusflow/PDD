import React, { useEffect, useMemo, useState } from 'react';
import { BackupSyncModal } from './components/layout/BackupSyncModal';
import { Header } from './components/layout/Header';
import { OnboardingModal } from './components/layout/OnboardingModal';
import { DashboardView } from './components/views/DashboardView';
import { CategoryFilter, DictionaryView } from './components/views/DictionaryView';
import { ExamSimulatorView } from './components/views/ExamSimulatorView';
import { ModulesView } from './components/views/ModulesView';
import { QuizSessionView } from './components/views/QuizSessionView';
import { QUESTIONS_BANK } from './data/questionsBank';
import { DICTIONARY_ENTRIES } from './data/signsAndGlossary';
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

export const App: React.FC = () => {
  const [appState, setAppState] = useState<UserAppState>(() => StorageManager.load());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [dictionaryCategory, setDictionaryCategory] = useState<CategoryFilter>('all');
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
    if (tab === 'dictionary') {
      setDictionaryCategory('all');
    }
    setActiveTab(tab);
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
        syncRelatedDictionaryItems(nextSrs, r.questionId, r.passed, now);
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

  const handleOpenSignsAndKontrol = () => {
    danishSpeech.stop();
    setDictionaryCategory('sign_kontrol');
    setActiveTab('dictionary');
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
                onOpenSignsAndKontrol={handleOpenSignsAndKontrol}
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
                key={dictionaryCategory}
                srsMap={appState.srs}
                languageMode={appState.languageMode}
                initialCategory={dictionaryCategory}
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
