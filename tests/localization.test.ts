import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { MODULES_DATA } from '../src/data/modulesData';
import { QUESTIONS_BANK } from '../src/data/questionsBank';
import { DICTIONARY_ENTRIES } from '../src/data/signsAndGlossary';
import { applyDictionaryUk, applyModuleUk, applyQuestionUk } from '../src/data/localizedData';
import { DICTIONARY_UK, MODULES_UK, QUESTIONS_UK } from '../src/data/uk/index';
import {
  CAR_HOTSPOTS_UK,
  CAR_TABS_UK,
  DRIVER_POV_LABELS_UK,
  KONTROL_QUESTIONS_UK,
  LESSON_HERO_UK,
  NUMBER_GROUPS_UK,
} from '../src/data/uk/visualsUk';

test('DICTIONARY_UK covers every dictionary entry with non-empty Ukrainian text', () => {
  assert.equal(Object.keys(DICTIONARY_UK).length, DICTIONARY_ENTRIES.length);
  for (const entry of DICTIONARY_ENTRIES) {
    const uk = DICTIONARY_UK[entry.id];
    assert.ok(uk, `Missing DICTIONARY_UK entry for ${entry.id}`);
    assert.ok(uk.uk.trim().length > 0, `Empty uk title for dictionary ${entry.id}`);
    assert.ok(uk.detailsUk.trim().length > 0, `Empty detailsUk for dictionary ${entry.id}`);

    const localized = applyDictionaryUk(entry, uk);
    assert.equal(localized.ru, uk.uk);
    assert.equal(localized.detailsRu, uk.detailsUk);
  }
});

test('MODULES_UK covers all 8 modules, goals, metrics, cheatSheet rules, and algorithms', () => {
  assert.equal(Object.keys(MODULES_UK).length, MODULES_DATA.length);
  for (const mod of MODULES_DATA) {
    const uk = MODULES_UK[mod.id];
    assert.ok(uk, `Missing MODULES_UK overlay for module ${mod.id}`);
    assert.ok(uk.titleUk.trim().length > 0, `Empty titleUk for module ${mod.id}`);
    assert.ok(uk.subtitleUk.trim().length > 0, `Empty subtitleUk for module ${mod.id}`);

    if (mod.schoolStageLabelRu) {
      assert.ok(
        uk.schoolStageLabelUk && uk.schoolStageLabelUk.trim().length > 0,
        `Missing schoolStageLabelUk for module ${mod.id}`
      );
    }

    for (const goal of mod.officialGoals ?? []) {
      assert.ok(
        uk.officialGoalsUk?.[goal.code]?.trim().length,
        `Missing officialGoalsUk[${goal.code}] in module ${mod.id}`
      );
    }

    assert.equal(
      uk.keyMetricsUk.length,
      mod.keyMetrics.length,
      `keyMetricsUk length mismatch in module ${mod.id}`
    );

    assert.equal(
      uk.cheatSheetUk.length,
      mod.cheatSheet.length,
      `cheatSheetUk length mismatch in module ${mod.id}`
    );

    mod.cheatSheet.forEach((rule, idx) => {
      const ruleUk = uk.cheatSheetUk[idx];
      assert.ok(ruleUk, `Missing cheatSheetUk[${idx}] in module ${mod.id}`);
      assert.ok(ruleUk.titleUk.trim().length > 0);
      assert.ok(ruleUk.bodyUk.trim().length > 0);
      if (rule.whyRu) {
        assert.ok(ruleUk.whyUk?.trim().length, `Missing whyUk in module ${mod.id} rule ${idx}`);
      }
      if (rule.pointsRu) {
        assert.equal(
          ruleUk.pointsUk?.length,
          rule.pointsRu.length,
          `pointsUk length mismatch in module ${mod.id} rule ${idx}`
        );
      }
      if (rule.attentionStepsRu) {
        assert.equal(
          ruleUk.attentionStepsUk?.length,
          rule.attentionStepsRu.length,
          `attentionStepsUk length mismatch in module ${mod.id} rule ${idx}`
        );
      }
      if (rule.comparePair) {
        assert.ok(ruleUk.comparePair, `Missing comparePair in module ${mod.id} rule ${idx}`);
        assert.ok(ruleUk.comparePair.headingUk.trim().length > 0);
        assert.ok(ruleUk.comparePair.left.labelUk.trim().length > 0);
        assert.ok(ruleUk.comparePair.left.summaryUk.trim().length > 0);
        assert.ok(ruleUk.comparePair.right.labelUk.trim().length > 0);
        assert.ok(ruleUk.comparePair.right.summaryUk.trim().length > 0);
      }
      if (rule.exceptionsRu) {
        assert.ok(
          ruleUk.exceptionsUk?.trim().length,
          `Missing exceptionsUk in module ${mod.id} rule ${idx}`
        );
      }
      if (rule.trapRu) {
        assert.ok(ruleUk.trapUk?.trim().length, `Missing trapUk in module ${mod.id} rule ${idx}`);
      }
    });

    for (const alg of mod.algorithms ?? []) {
      assert.ok(
        uk.algorithmsUk?.[alg.step]?.trim().length,
        `Missing algorithmsUk[${alg.step}] in module ${mod.id}`
      );
    }

    const localized = applyModuleUk(mod, uk);
    assert.equal(localized.titleRu, uk.titleUk);
    assert.equal(localized.subtitleRu, uk.subtitleUk);
  }
});

test('QUESTIONS_UK covers all 200 questions, captions, and subQuestions with matching IDs', () => {
  assert.equal(Object.keys(QUESTIONS_UK).length, QUESTIONS_BANK.length);
  for (const q of QUESTIONS_BANK) {
    const uk = QUESTIONS_UK[q.id];
    assert.ok(uk, `Missing QUESTIONS_UK overlay for ${q.id}`);
    assert.ok(uk.situationUk.trim().length > 0, `Empty situationUk for ${q.id}`);
    assert.ok(uk.keyRuleUk.trim().length > 0, `Empty keyRuleUk for ${q.id}`);
    if (q.visual.captionRu) {
      assert.ok(
        uk.captionUk && uk.captionUk.trim().length > 0,
        `Missing captionUk for ${q.id}`
      );
    }

    assert.equal(
      Object.keys(uk.subQuestionsUk).length,
      q.subQuestions.length,
      `subQuestionsUk count mismatch for ${q.id}`
    );

    for (const sq of q.subQuestions) {
      const subUk = uk.subQuestionsUk[sq.id];
      assert.ok(subUk, `Missing subQuestionsUk[${sq.id}] in ${q.id}`);
      assert.ok(subUk.uk.trim().length > 0, `Empty subQuestion uk for ${sq.id}`);
      assert.ok(subUk.explanationUk.trim().length > 0, `Empty explanationUk for ${sq.id}`);
    }

    const localized = applyQuestionUk(q, uk);
    assert.equal(localized.situationRu, uk.situationUk);
    assert.equal(localized.keyRuleRu, uk.keyRuleUk);
  }
});

test('visualsUk overlays cover tabs, hotspots, kontrol questions, numbers, heroes, and POV labels', () => {
  assert.equal(Object.keys(CAR_TABS_UK).length, 5);
  assert.equal(Object.keys(CAR_HOTSPOTS_UK).length, 26);
  assert.equal(Object.keys(KONTROL_QUESTIONS_UK).length, 10);
  assert.equal(Object.keys(NUMBER_GROUPS_UK).length, 5);
  assert.equal(Object.keys(LESSON_HERO_UK).length, 8);
  assert.ok(Object.keys(DRIVER_POV_LABELS_UK).length >= 130);
});

test('src/data/uk/*.ts contains zero Russian-specific Cyrillic characters [ыэёъЫЭЁЪ] in Ukrainian strings', () => {
  const ukDir = path.resolve(process.cwd(), 'src/data/uk');
  const pureUkFiles = [
    'dictionaryUk.ts',
    'index.ts',
    'modulesUk.ts',
    'questionsUk_1_4.ts',
    'questionsUk_5_8.ts',
    'types.ts',
  ];

  for (const file of pureUkFiles) {
    const abs = path.join(ukDir, file);
    const content = fs.readFileSync(abs, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line: string, idx: number) => {
      const match = line.match(/[ыэёъЫЭЁЪ]/);
      assert.equal(
        match,
        null,
        `Found Russian character "${match?.[0]}" in src/data/uk/${file}:${idx + 1}: ${line.trim()}`
      );
    });
  }

  const assertCleanValue = (label: string, val: unknown): void => {
    if (typeof val === 'string') {
      const match = val.match(/[ыэёъЫЭЁЪ]/);
      assert.equal(match, null, `Found Russian character "${match?.[0]}" in ${label}: ${val}`);
    } else if (Array.isArray(val)) {
      val.forEach((item, i) => assertCleanValue(`${label}[${i}]`, item));
    } else if (val && typeof val === 'object') {
      for (const [k, v] of Object.entries(val)) {
        assertCleanValue(`${label}.${k}`, v);
      }
    }
  };

  assertCleanValue('CAR_TABS_UK', CAR_TABS_UK);
  assertCleanValue('CAR_HOTSPOTS_UK', CAR_HOTSPOTS_UK);
  assertCleanValue('KONTROL_QUESTIONS_UK', KONTROL_QUESTIONS_UK);
  assertCleanValue('NUMBER_GROUPS_UK', NUMBER_GROUPS_UK);
  assertCleanValue('LESSON_HERO_UK', LESSON_HERO_UK);
  for (const [k, v] of Object.entries(DRIVER_POV_LABELS_UK)) {
    assertCleanValue(`DRIVER_POV_LABELS_UK[${k}]`, v);
  }
});
