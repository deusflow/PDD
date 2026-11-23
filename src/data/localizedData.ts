import type {
  DictionaryEntry,
  ModuleCheatRule,
  ModuleInfo,
  TeoriQuestion,
  UiLanguage,
} from '../types';
import type {
  DictionaryUkEntry,
  ModuleUkOverlay,
  QuestionUkOverlay,
} from './uk/types';

export interface UkDataBundle {
  dictionaryUk: Record<string, DictionaryUkEntry>;
  modulesUk: Record<number, ModuleUkOverlay>;
  questionsUk: Record<string, QuestionUkOverlay>;
}

export function applyRuleUk(
  rule: ModuleCheatRule,
  uk?: ModuleUkOverlay['cheatSheetUk'][number]
): ModuleCheatRule {
  if (!uk) return rule;
  return {
    ...rule,
    titleRu: uk.titleUk,
    bodyRu: uk.bodyUk,
    whyRu: uk.whyUk ?? rule.whyRu,
    pointsRu: uk.pointsUk ?? rule.pointsRu,
    attentionStepsRu: uk.attentionStepsUk ?? rule.attentionStepsRu,
    comparePair:
      rule.comparePair && uk.comparePair
        ? {
            ...rule.comparePair,
            headingRu: uk.comparePair.headingUk,
            left: {
              ...rule.comparePair.left,
              labelRu: uk.comparePair.left.labelUk,
              summaryRu: uk.comparePair.left.summaryUk,
            },
            right: {
              ...rule.comparePair.right,
              labelRu: uk.comparePair.right.labelUk,
              summaryRu: uk.comparePair.right.summaryUk,
            },
          }
        : rule.comparePair,
    exceptionsRu: uk.exceptionsUk ?? rule.exceptionsRu,
    trapRu: uk.trapUk ?? rule.trapRu,
  };
}

export function applyModuleUk(mod: ModuleInfo, uk?: ModuleUkOverlay): ModuleInfo {
  if (!uk) return mod;
  return {
    ...mod,
    titleRu: uk.titleUk,
    subtitleRu: uk.subtitleUk,
    schoolStageLabelRu: uk.schoolStageLabelUk ?? mod.schoolStageLabelRu,
    officialGoals: mod.officialGoals?.map((g) => ({
      ...g,
      titleRu: uk.officialGoalsUk?.[g.code] ?? g.titleRu,
    })),
    keyMetrics: mod.keyMetrics.map((m, idx) => ({
      ...m,
      labelRu: uk.keyMetricsUk[idx] ?? m.labelRu,
    })),
    cheatSheet: mod.cheatSheet.map((rule, idx) => applyRuleUk(rule, uk.cheatSheetUk[idx])),
    algorithms: mod.algorithms?.map((alg) => ({
      ...alg,
      ru: uk.algorithmsUk?.[alg.step] ?? alg.ru,
    })),
  };
}

export function applyQuestionUk(q: TeoriQuestion, uk?: QuestionUkOverlay): TeoriQuestion {
  if (!uk) return q;
  return {
    ...q,
    situationRu: uk.situationUk,
    keyRuleRu: uk.keyRuleUk,
    visual: {
      ...q.visual,
      captionRu: uk.captionUk ?? q.visual.captionRu,
    },
    subQuestions: q.subQuestions.map((sq) => {
      const subUk = uk.subQuestionsUk[sq.id];
      return subUk
        ? {
            ...sq,
            ru: subUk.uk,
            explanationRu: subUk.explanationUk,
          }
        : sq;
    }),
  };
}

export function applyDictionaryUk(
  entry: DictionaryEntry,
  uk?: DictionaryUkEntry
): DictionaryEntry {
  if (!uk) return entry;
  return {
    ...entry,
    ru: uk.uk,
    detailsRu: uk.detailsUk,
  };
}

export function localizeAllData(
  base: {
    modules: ModuleInfo[];
    questions: TeoriQuestion[];
    dictionary: DictionaryEntry[];
  },
  uiLang: UiLanguage,
  ukBundle: UkDataBundle | null
): {
  modules: ModuleInfo[];
  questions: TeoriQuestion[];
  dictionary: DictionaryEntry[];
} {
  if (uiLang !== 'uk' || !ukBundle) return base;
  return {
    modules: base.modules.map((m) => applyModuleUk(m, ukBundle.modulesUk[m.id])),
    questions: base.questions.map((q) => applyQuestionUk(q, ukBundle.questionsUk[q.id])),
    dictionary: base.dictionary.map((d) => applyDictionaryUk(d, ukBundle.dictionaryUk[d.id])),
  };
}
