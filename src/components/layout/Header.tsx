import React from 'react';
import {
  ArrowLeft,
  BookOpen,
  Compass,
  FileCheck2,
  HardDriveDownload,
  HelpCircle,
  Languages,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { ActiveTab, LanguageMode, ThemeMode } from '../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  inActiveSession?: boolean;
  onTabChange: (tab: ActiveTab) => void;
  languageMode: LanguageMode;
  onLanguageModeChange: (mode: LanguageMode) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  onOpenOnboarding: () => void;
  onOpenBackup: () => void;
  dueBadgeCount: number;
}

const TABS: Array<{ id: ActiveTab; label: string; shortLabel: string; icon: React.ReactNode }> = [
  {
    id: 'dashboard',
    label: 'Меню',
    shortLabel: 'Меню',
    icon: <Compass className="h-4 w-4" />,
  },
  {
    id: 'modules',
    label: 'Уроки (8 тем)',
    shortLabel: 'Уроки',
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    id: 'exam',
    label: 'Экзамен',
    shortLabel: 'Экзамен',
    icon: <FileCheck2 className="h-4 w-4" />,
  },
  {
    id: 'dictionary',
    label: 'Словарь и знаки',
    shortLabel: 'Словарь',
    icon: <Search className="h-4 w-4" />,
  },
];

const LANG_OPTIONS: Array<{ id: LanguageMode; label: string; hint: string }> = [
  { id: 'both', label: 'DA / RU', hint: 'Сразу оба языка' },
  { id: 'spoiler', label: 'Spoiler', hint: 'Русский по клику' },
  { id: 'da_only', label: 'Kun DA', hint: 'Чистый датский экзамен' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  inActiveSession = false,
  onTabChange,
  languageMode,
  onLanguageModeChange,
  theme,
  onThemeToggle,
  onOpenOnboarding,
  onOpenBackup,
  dueBadgeCount,
}) => {
  const showBackToMenu = activeTab !== 'dashboard' || inActiveSession;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex h-14 items-center justify-between gap-2 sm:gap-3">
          {/* Left: Brand + Quick Return to Main Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {showBackToMenu && (
              <button
                type="button"
                onClick={() => onTabChange('dashboard')}
                className="inline-flex h-8 items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                title="Вернуться в главное меню"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Меню</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2 text-left transition-opacity hover:opacity-85"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-xs font-extrabold tracking-tight text-white shadow-sm">
                DK
              </span>
              <div className={showBackToMenu ? 'hidden sm:block' : ''}>
                <div className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  <span>Kørekort B</span>
                  <span className="hidden rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 md:inline-block dark:bg-zinc-800 dark:text-zinc-400">
                    Дания
                  </span>
                </div>
                <p className="hidden text-[11px] text-zinc-500 sm:block dark:text-zinc-400">
                  ПДД и техосмотр
                </p>
              </div>
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5">
            {/* Language Switcher */}
            <div
              className="flex items-center rounded-xl border border-zinc-200 bg-zinc-100/80 p-0.5 dark:border-zinc-800 dark:bg-zinc-900"
              role="group"
              aria-label="Режим языка"
            >
              <Languages className="mx-1.5 hidden h-3.5 w-3.5 text-zinc-400 md:block" />
              {LANG_OPTIONS.map((opt) => {
                const active = languageMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    title={opt.hint}
                    onClick={() => onLanguageModeChange(opt.id)}
                    className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all sm:px-2.5 ${
                      active
                        ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Backup / Sync (compact icon) */}
            <button
              type="button"
              onClick={onOpenBackup}
              title="Бэкап и перенос прогресса"
              aria-label="Бэкап и перенос прогресса"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <HardDriveDownload className="h-4 w-4" />
            </button>

            {/* Onboarding / Guide (compact icon) */}
            <button
              type="button"
              onClick={onOpenOnboarding}
              title="Как работает тренажёр и правила экзамена?"
              aria-label="Как работает тренажёр"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={onThemeToggle}
              title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
              aria-label="Переключить тему"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* 4-Tab Navigation */}
        <nav className="-mb-px flex gap-1 overflow-x-auto pb-1.5 pt-0.5 sm:gap-2" aria-label="Разделы">
          {TABS.map((tab) => {
            const active = !inActiveSession && activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                  active
                    ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {tab.id === 'dashboard' && dueBadgeCount > 0 && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                      active
                        ? 'bg-rose-500 text-white'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {dueBadgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
