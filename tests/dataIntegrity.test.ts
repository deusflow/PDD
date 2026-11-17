import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { MODULES_DATA } from '../src/data/modulesData';
import { QUESTIONS_BANK } from '../src/data/questionsBank';
import { DICTIONARY_ENTRIES } from '../src/data/signsAndGlossary';

function extractSwitchCases(relPath: string): Set<string> {
  const abs = path.resolve(process.cwd(), relPath);
  const content = fs.readFileSync(abs, 'utf8');
  const matches = content.matchAll(/case '([^']+)':/g);
  return new Set(Array.from(matches, (m) => m[1]));
}

function extractHotspotIds(): Set<string> {
  const abs = path.resolve(process.cwd(), 'src/components/visuals/CarTechnicalSVG.tsx');
  const content = fs.readFileSync(abs, 'utf8');
  const matches = content.matchAll(/id:\s*'([^']+)'/g);
  return new Set(Array.from(matches, (m) => m[1]));
}

test('QUESTIONS_BANK has 160 unique questions evenly distributed across modules 1..8 with balanced Ja/Nej', () => {
  assert.equal(QUESTIONS_BANK.length, 160);
  const qIds = new Set<string>();
  const sqIds = new Set<string>();
  const counts = new Map<number, number>();
  let trueCount = 0;
  let falseCount = 0;

  for (const q of QUESTIONS_BANK) {
    assert.ok(!qIds.has(q.id), `Duplicate question id: ${q.id}`);
    qIds.add(q.id);
    assert.ok(q.moduleId >= 1 && q.moduleId <= 8, `Invalid moduleId for ${q.id}`);
    counts.set(q.moduleId, (counts.get(q.moduleId) ?? 0) + 1);
    assert.ok(q.situationDa.trim().length > 0);
    assert.ok(q.situationRu.trim().length > 0);
    assert.ok(q.lawReference.trim().length > 0);
    assert.ok(q.subQuestions.length >= 3 && q.subQuestions.length <= 4);

    for (const sq of q.subQuestions) {
      assert.ok(!sqIds.has(sq.id), `Duplicate subQuestion id: ${sq.id}`);
      sqIds.add(sq.id);
      if (sq.correctAnswer) trueCount += 1;
      else falseCount += 1;
      assert.ok(sq.da.trim().length > 0 && sq.ru.trim().length > 0);
      assert.ok(sq.explanationDa.trim().length > 0 && sq.explanationRu.trim().length > 0);
    }
  }

  for (let m = 1; m <= 8; m += 1) {
    assert.equal(counts.get(m), 20, `Expected 20 questions in module ${m}`);
  }

  const trueRatio = trueCount / (trueCount + falseCount);
  assert.ok(
    trueRatio >= 0.45 && trueRatio <= 0.56,
    `Expected balanced Ja/Nej ratio (45-56%), got ${(trueRatio * 100).toFixed(1)}%`
  );
});

test('all visuals (POV presets, traffic scenes, signs, hotspots) referenced in data exist in SVG renderers', () => {
  const povPresets = extractSwitchCases('src/components/visuals/DriverPOVSceneSVG.tsx');
  const trafficScenes = extractSwitchCases('src/components/visuals/TrafficSceneSVG.tsx');
  const signCodes = extractSwitchCases('src/components/visuals/DanishRoadSignSVG.tsx');
  const hotspots = extractHotspotIds();
  const allScenes = new Set([...povPresets, ...trafficScenes]);

  for (const q of QUESTIONS_BANK) {
    if (q.visual.type === 'scene') {
      assert.ok(allScenes.has(q.visual.presetId), `Missing scene ${q.visual.presetId} for ${q.id}`);
    }
    if (q.visual.signCode) {
      assert.ok(signCodes.has(q.visual.signCode), `Missing sign ${q.visual.signCode} for ${q.id}`);
    }
    if (q.visual.technicalHotspot) {
      assert.ok(
        hotspots.has(q.visual.technicalHotspot),
        `Missing hotspot ${q.visual.technicalHotspot} for ${q.id}`
      );
    }
  }

  assert.equal(MODULES_DATA.length, 8);
  for (const mod of MODULES_DATA) {
    assert.ok(mod.cheatSheet.length >= 5, `Expected at least 5 lecture rules in module ${mod.id}`);
    assert.ok(
      mod.algorithms && mod.algorithms.length >= 3,
      `Expected at least 3 algorithm steps in module ${mod.id}`
    );
    for (const rule of mod.cheatSheet) {
      assert.ok(rule.visual, `Missing visual in module ${mod.id} rule: ${rule.titleRu}`);
      if (rule.visual.kind === 'pov') {
        assert.ok(povPresets.has(rule.visual.presetId), `Missing POV preset ${rule.visual.presetId}`);
      } else if (rule.visual.kind === 'scene') {
        assert.ok(allScenes.has(rule.visual.presetId), `Missing scene ${rule.visual.presetId}`);
      } else if (rule.visual.kind === 'sign' && rule.visual.signCode) {
        assert.ok(signCodes.has(rule.visual.signCode), `Missing sign ${rule.visual.signCode}`);
      } else if (rule.visual.kind === 'technical' && rule.visual.technicalHotspot) {
        assert.ok(
          hotspots.has(rule.visual.technicalHotspot),
          `Missing hotspot ${rule.visual.technicalHotspot}`
        );
      }
      assert.ok((rule.pointsRu?.length ?? 0) > 0, `Missing pointsRu in ${mod.id}: ${rule.titleRu}`);
      assert.ok((rule.pointsDa?.length ?? 0) > 0, `Missing pointsDa in ${mod.id}: ${rule.titleRu}`);
    }
  }

  const dictIds = new Set<string>();
  const dictPerModule = new Map<number, number>();
  const dictSignCodes = new Set<string>();
  for (const entry of DICTIONARY_ENTRIES) {
    assert.ok(!dictIds.has(entry.id), `Duplicate dictionary id: ${entry.id}`);
    dictIds.add(entry.id);
    assert.ok(entry.moduleId >= 1 && entry.moduleId <= 8);
    dictPerModule.set(entry.moduleId, (dictPerModule.get(entry.moduleId) ?? 0) + 1);
    if (entry.signCode) {
      dictSignCodes.add(entry.signCode);
      assert.ok(signCodes.has(entry.signCode), `Missing dictionary sign ${entry.signCode}`);
    }
    if (entry.technicalHotspot) {
      assert.ok(
        hotspots.has(entry.technicalHotspot),
        `Missing dictionary hotspot ${entry.technicalHotspot}`
      );
    }
  }

  for (let m = 1; m <= 8; m += 1) {
    assert.ok(
      (dictPerModule.get(m) ?? 0) >= 8,
      `Expected >= 8 dictionary entries in module ${m}, got ${dictPerModule.get(m) ?? 0}`
    );
  }

  // Every SVG road sign and every Driver's POV scene is covered
  const usedSignsInQuestions = new Set(
    QUESTIONS_BANK.map((q) => q.visual.signCode).filter((s): s is string => Boolean(s))
  );
  const usedPovsInQuestions = new Set(
    QUESTIONS_BANK.map((q) => q.visual.presetId).filter((p) => p.startsWith('pov_'))
  );

  for (const sc of signCodes) {
    assert.ok(dictSignCodes.has(sc), `SVG sign ${sc} is missing from dictionary`);
    assert.ok(usedSignsInQuestions.has(sc), `SVG sign ${sc} is never tested in QUESTIONS_BANK`);
  }
  for (const pov of povPresets) {
    assert.ok(usedPovsInQuestions.has(pov), `POV preset ${pov} is never tested in QUESTIONS_BANK`);
  }
});
