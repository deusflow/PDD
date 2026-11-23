import React, { createContext, useContext, useMemo } from 'react';
import { MODULES_DATA } from '../data/modulesData';
import { QUESTIONS_BANK } from '../data/questionsBank';
import { DICTIONARY_ENTRIES } from '../data/signsAndGlossary';
import {
  applyDictionaryUk,
  applyModuleUk,
  applyQuestionUk,
  localizeAllData,
  UkDataBundle,
} from '../data/localizedData';
import type { DictionaryEntry, ModuleInfo, TeoriQuestion, UiLanguage } from '../types';

interface UiLangContextValue {
  uiLang: UiLanguage;
  pick: <T>(ru: T, uk: T) => T;
  modules: ModuleInfo[];
  questions: TeoriQuestion[];
  dictionary: DictionaryEntry[];
  getModule: (id: number) => ModuleInfo | undefined;
  getQuestion: (q: TeoriQuestion) => TeoriQuestion;
  getEntry: (id: string) => DictionaryEntry | undefined;
  localizeQuestions: (qs: TeoriQuestion[]) => TeoriQuestion[];
}

const BASE_DATA = {
  modules: MODULES_DATA,
  questions: QUESTIONS_BANK,
  dictionary: DICTIONARY_ENTRIES,
};

const UiLangContext = createContext<UiLangContextValue>({
  uiLang: 'ru',
  pick: (ru) => ru,
  modules: MODULES_DATA,
  questions: QUESTIONS_BANK,
  dictionary: DICTIONARY_ENTRIES,
  getModule: (id) => MODULES_DATA.find((m) => m.id === id),
  getQuestion: (q) => q,
  getEntry: (id) => DICTIONARY_ENTRIES.find((d) => d.id === id),
  localizeQuestions: (qs) => qs,
});

export const UiLangProvider: React.FC<{
  uiLang: UiLanguage;
  ukBundle: UkDataBundle | null;
  children: React.ReactNode;
}> = ({ uiLang, ukBundle, children }) => {
  const value = useMemo<UiLangContextValue>(() => {
    const localized = localizeAllData(BASE_DATA, uiLang, ukBundle);
    const modMap = new Map(localized.modules.map((m) => [m.id, m]));
    const qMap = new Map(localized.questions.map((q) => [q.id, q]));
    const dictMap = new Map(localized.dictionary.map((d) => [d.id, d]));

    return {
      uiLang,
      pick: (ru, uk) => (uiLang === 'uk' ? uk : ru),
      modules: localized.modules,
      questions: localized.questions,
      dictionary: localized.dictionary,
      getModule: (id) => modMap.get(id),
      getQuestion: (q) => {
        if (uiLang !== 'uk' || !ukBundle) return qMap.get(q.id) ?? q;
        return qMap.get(q.id) ?? applyQuestionUk(q, ukBundle.questionsUk[q.id]);
      },
      getEntry: (id) => {
        const hit = dictMap.get(id);
        if (hit) return hit;
        const base = DICTIONARY_ENTRIES.find((d) => d.id === id);
        if (!base) return undefined;
        return uiLang === 'uk' && ukBundle ? applyDictionaryUk(base, ukBundle.dictionaryUk[id]) : base;
      },
      localizeQuestions: (qs) => {
        if (uiLang !== 'uk' || !ukBundle) return qs;
        return qs.map((q) => qMap.get(q.id) ?? applyQuestionUk(q, ukBundle.questionsUk[q.id]));
      },
    };
  }, [uiLang, ukBundle]);

  return <UiLangContext.Provider value={value}>{children}</UiLangContext.Provider>;
};

export function useUiLang(): UiLangContextValue {
  return useContext(UiLangContext);
}

export { applyModuleUk };
