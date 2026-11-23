import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { MODULES_DATA } from '../src/data/modulesData';
import { QUESTIONS_BANK } from '../src/data/questionsBank';
import { DICTIONARY_ENTRIES } from '../src/data/signsAndGlossary';
import { SPEECH_AUDIO_HASHES } from '../src/data/speechManifest';
import {
  hashSpeechKey,
  normalizeSpeechKey,
  prepareDanishSpeechText,
  splitNumberedSpeechItem,
} from '../src/utils/speechUtils';

test('hashSpeechKey normalizes whitespace and produces deterministic 16-hex ids', () => {
  const h1 = hashSpeechKey('  Du kører   på landevej  ');
  const h2 = hashSpeechKey('Du kører på landevej');
  assert.equal(h1, h2);
  assert.match(h1, /^[0-9a-f]{16}$/);
  assert.notEqual(hashSpeechKey('a'), hashSpeechKey('b'));
});

test('prepareDanishSpeechText normalizes abbreviations and symbols naturally', () => {
  assert.equal(normalizeSpeechKey('  Hej   verden '), 'Hej verden');
  assert.equal(prepareDanishSpeechText('1.'), 'Et:');
  assert.equal(prepareDanishSpeechText('4.'), 'Fire:');
  assert.equal(
    prepareDanishSpeechText('Max. 80 km/t · min. 1,6 mm & fx 0,20 ‰'),
    'maksimum 80 kilometer i timen, mindst 1,6 millimeter og for eksempel 0,20 promille'
  );
  assert.equal(
    prepareDanishSpeechText('ABS/ESP og vinter-/helårsdæk (200–300 m)'),
    'A B S eller E S P og vinter eller helårsdæk (200 til 300 meter)'
  );
  assert.equal(
    prepareDanishSpeechText('Standen mellem MIN og MAX i ca. 5 min.'),
    'Standen mellem minimum og maksimum i cirka 5 minutter'
  );
  assert.equal(
    prepareDanishSpeechText('Fra 01.07.2025: ~1–2 cm «slør»'),
    'Fra 1. juli 2025: cirka 1 til 2 centimeter "slør"'
  );
});

test('splitNumberedSpeechItem extracts ticket statement index cleanly', () => {
  assert.deepEqual(splitNumberedSpeechItem('1. Du skal blinke til højre.'), {
    prefix: '1.',
    body: 'Du skal blinke til højre.',
  });
  assert.equal(splitNumberedSpeechItem('Du skal blinke til højre.'), null);
});

test('speechManifest covers core dataset when populated and has valid MP3 files on disk', () => {
  if (SPEECH_AUDIO_HASHES.length === 0) return;

  const manifestSet = new Set(SPEECH_AUDIO_HASHES);
  const audioDir = path.resolve(process.cwd(), 'public', 'audio');

  for (const hash of SPEECH_AUDIO_HASHES) {
    const filePath = path.join(audioDir, `${hash}.mp3`);
    assert.ok(fs.existsSync(filePath), `Missing MP3 referenced in manifest: ${hash}.mp3`);
    const stat = fs.statSync(filePath);
    assert.ok(stat.size >= 400, `Corrupt/too small MP3 file: ${hash}.mp3 (${stat.size} bytes)`);
  }

  for (let i = 1; i <= 6; i += 1) {
    assert.ok(manifestSet.has(hashSpeechKey(`${i}.`)), `Missing numbered prefix ${i}.`);
  }

  for (const q of QUESTIONS_BANK) {
    assert.ok(manifestSet.has(hashSpeechKey(q.situationDa)), `Missing audio for ${q.id} situationDa`);
    assert.ok(manifestSet.has(hashSpeechKey(q.keyRuleDa)), `Missing audio for ${q.id} keyRuleDa`);
    for (const sq of q.subQuestions) {
      assert.ok(manifestSet.has(hashSpeechKey(sq.da)), `Missing audio for ${sq.id}`);
      assert.ok(manifestSet.has(hashSpeechKey(sq.explanationDa)), `Missing explanation audio for ${sq.id}`);
    }
  }

  for (const entry of DICTIONARY_ENTRIES) {
    assert.ok(manifestSet.has(hashSpeechKey(entry.da)), `Missing audio for dictionary term ${entry.id}`);
    assert.ok(
      manifestSet.has(hashSpeechKey(`${entry.da}. ${entry.detailsDa}`)),
      `Missing full audio for dictionary entry ${entry.id}`
    );
  }

  for (const mod of MODULES_DATA) {
    assert.ok(manifestSet.has(hashSpeechKey(mod.titleDa)), `Missing module title audio for mod ${mod.id}`);
    for (const rule of mod.cheatSheet) {
      assert.ok(
        manifestSet.has(hashSpeechKey(`${rule.titleDa}. ${rule.bodyDa}`)),
        `Missing rule audio in mod ${mod.id}: ${rule.titleDa}`
      );
    }
  }
});
