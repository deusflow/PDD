export { DICTIONARY_UK } from './dictionaryUk';
export { MODULES_UK } from './modulesUk';
import { QUESTIONS_UK_1_4 } from './questionsUk_1_4';
import { QUESTIONS_UK_5_8 } from './questionsUk_5_8';
import type { QuestionUkOverlay } from './types';

export const QUESTIONS_UK: Record<string, QuestionUkOverlay> = {
  ...QUESTIONS_UK_1_4,
  ...QUESTIONS_UK_5_8,
};
