import type { OfficialGoalRef } from '../../types';

export interface DictionaryUkEntry {
  uk: string;
  detailsUk: string;
}

export interface ModuleRuleUkOverlay {
  titleUk: string;
  bodyUk: string;
  whyUk?: string;
  pointsUk?: string[];
  attentionStepsUk?: string[];
  comparePair?: {
    headingUk: string;
    left: {
      labelUk: string;
      summaryUk: string;
    };
    right: {
      labelUk: string;
      summaryUk: string;
    };
  };
  exceptionsUk?: string;
  trapUk?: string;
}

export interface ModuleUkOverlay {
  titleUk: string;
  subtitleUk: string;
  schoolStageLabelUk?: string;
  officialGoalsUk?: Record<string, string>; // code -> titleUk
  keyMetricsUk: string[]; // aligned by index with keyMetrics
  cheatSheetUk: ModuleRuleUkOverlay[]; // aligned by index with cheatSheet
  algorithmsUk?: Record<string, string>; // step -> uk
}

export interface QuestionUkOverlay {
  situationUk: string;
  keyRuleUk: string;
  captionUk?: string;
  subQuestionsUk: Record<
    string,
    {
      uk: string;
      explanationUk: string;
    }
  >;
}

export type { OfficialGoalRef };
