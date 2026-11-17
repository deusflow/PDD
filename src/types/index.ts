export type LanguageMode = 'both' | 'spoiler' | 'da_only';
export type ThemeMode = 'light' | 'dark';
export type BoxLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type ActiveTab = 'dashboard' | 'modules' | 'exam' | 'dictionary';

export type TechnicalTabId = 'motorrum' | 'daek_bremser' | 'lygter' | 'instrumentpanel';

export interface SRSRecord {
  id: string;
  box: BoxLevel;
  streak: number;
  lastReviewedAt: number | null;
  nextReviewAt: number | null;
  totalAttempts: number;
  totalFailures: number;
}

export interface SubQuestion {
  id: string;
  da: string;
  ru: string;
  correctAnswer: boolean; // true = Ja, false = Nej
  explanationDa: string;
  explanationRu: string;
}

export interface TeoriQuestion {
  id: string;
  moduleId: number; // 1..8
  situationDa: string;
  situationRu: string;
  visual: {
    type: 'scene' | 'sign' | 'technical';
    presetId: string;
    signCode?: string;
    subPlaque?: string;
    technicalTab?: TechnicalTabId;
    technicalHotspot?: string;
    captionDa?: string;
    captionRu?: string;
  };
  subQuestions: SubQuestion[]; // 3 or 4 Ja / Nej items
  lawReference: string;
  keyRuleDa: string;
  keyRuleRu: string;
}

export interface DictionaryEntry {
  id: string;
  moduleId: number;
  category: 'term' | 'sign' | 'kontrol';
  da: string;
  ru: string;
  detailsDa: string;
  detailsRu: string;
  signCode?: string;
  subPlaque?: string;
  technicalPart?: TechnicalTabId;
  technicalHotspot?: string;
}

export interface ModuleCheatRule {
  titleDa: string;
  titleRu: string;
  bodyDa: string;
  bodyRu: string;
}

export interface ModuleInfo {
  id: number;
  code: string;
  titleDa: string;
  titleRu: string;
  subtitleDa: string;
  subtitleRu: string;
  keyMetrics: Array<{
    labelDa: string;
    labelRu: string;
    value: string;
  }>;
  cheatSheet: ModuleCheatRule[];
  algorithms?: Array<{
    step: string;
    da: string;
    ru: string;
  }>;
}

export interface ExamAttemptSummary {
  id: string;
  date: number;
  score: number;
  total: number;
  passed: boolean;
  durationSeconds: number;
}

export interface UserAppState {
  version: 1;
  hasSeenOnboarding: boolean;
  languageMode: LanguageMode;
  theme: ThemeMode;
  srs: Record<string, SRSRecord>;
  examHistory: ExamAttemptSummary[];
  sessionsCompleted: number;
}
