import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jitiPkg from 'jiti';
const createJiti = jitiPkg.createJiti ?? jitiPkg;
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const jiti = createJiti(import.meta.url);
const { MODULES_DATA } = await jiti.import(path.join(ROOT, 'src/data/modulesData.ts'));
const { QUESTIONS_BANK } = await jiti.import(path.join(ROOT, 'src/data/questionsBank.ts'));
const { DICTIONARY_ENTRIES } = await jiti.import(path.join(ROOT, 'src/data/signsAndGlossary.ts'));
const {
  normalizeSpeechKey,
  hashSpeechKey,
  prepareDanishSpeechText,
} = await jiti.import(path.join(ROOT, 'src/utils/speechUtils.ts'));

function astToLiteral(node) {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) {
    return astToLiteral(node.expression);
  }
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((el) => astToLiteral(el)).filter((v) => v !== undefined);
  }
  if (ts.isObjectLiteralExpression(node)) {
    const obj = {};
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop)) {
        let key;
        if (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name) || ts.isNumericLiteral(prop.name)) {
          key = prop.name.text;
        }
        if (key !== undefined) {
          const val = astToLiteral(prop.initializer);
          if (val !== undefined) obj[key] = val;
        }
      }
    }
    return obj;
  }
  return undefined;
}

function extractConstFromTsx(relPath, constName) {
  const fullPath = path.join(ROOT, relPath);
  const src = fs.readFileSync(fullPath, 'utf8');
  const sf = ts.createSourceFile(fullPath, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let result = undefined;
  function visit(node) {
    if (result !== undefined) return;
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === constName) {
      result = astToLiteral(node.initializer);
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return result;
}

function extractInlineArrayLiteral(relPath, markerText) {
  const fullPath = path.join(ROOT, relPath);
  const src = fs.readFileSync(fullPath, 'utf8');
  const sf = ts.createSourceFile(fullPath, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let found = undefined;
  function visit(node) {
    if (found !== undefined) return;
    if (ts.isArrayLiteralExpression(node)) {
      const text = node.getText(sf);
      if (text.includes(markerText)) {
        found = astToLiteral(node);
        return;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return found;
}

function collectAllPhrases() {
  const entries = new Map(); // hash -> { hash, raw, spoken, sources: Set<string> }

  function add(rawText, source) {
    if (!rawText || typeof rawText !== 'string') return;
    const raw = normalizeSpeechKey(rawText);
    if (!raw) return;
    const hash = hashSpeechKey(raw);
    const existing = entries.get(hash);
    if (existing) {
      if (existing.raw !== raw) {
        throw new Error(`Hash collision detected between:\n  "${existing.raw}"\nand\n  "${raw}"`);
      }
      existing.sources.add(source);
      return;
    }
    entries.set(hash, {
      hash,
      raw,
      spoken: prepareDanishSpeechText(raw),
      sources: new Set([source]),
    });
  }

  // 1. ModulesView inline lists (school stages + docs checklist)
  const schoolStages = extractInlineArrayLiteral(
    'src/components/views/ModulesView.tsx',
    'Grundlæggende trafikforståelse'
  );
  if (!Array.isArray(schoolStages) || schoolStages.length === 0) {
    throw new Error('Failed to extract schoolStages from ModulesView.tsx');
  }
  for (const st of schoolStages) add(st.da, 'modules:stage');

  const docChecklist = extractInlineArrayLiteral(
    'src/components/views/ModulesView.tsx',
    'Digital lægeattest'
  );
  if (!Array.isArray(docChecklist) || docChecklist.length === 0) {
    throw new Error('Failed to extract docChecklist from ModulesView.tsx');
  }
  for (const doc of docChecklist) add(doc.daTerm, 'modules:doc');

  // 2. LessonHeroIllustration
  const heroMeta = extractConstFromTsx(
    'src/components/visuals/LessonHeroIllustration.tsx',
    'LESSON_HERO_META'
  );
  if (!heroMeta) throw new Error('Failed to extract LESSON_HERO_META');
  for (const meta of Object.values(heroMeta)) {
    add(`${meta.titleDa}. ${meta.captionDa}`, 'hero');
  }

  // 3. CarTechnicalSVG
  const hotspots = extractConstFromTsx(
    'src/components/visuals/CarTechnicalSVG.tsx',
    'HOTSPOTS'
  );
  if (!Array.isArray(hotspots) || hotspots.length === 0) {
    throw new Error('Failed to extract HOTSPOTS');
  }
  for (const hs of hotspots) {
    add(`${hs.labelDa}. ${hs.whyDa} ${hs.checkDa}`, 'tech:info');
    if (hs.lookDa) add(hs.lookDa, 'tech:look');
    if (hs.okDa) add(hs.okDa, 'tech:ok');
    if (hs.failDa) add(hs.failDa, 'tech:fail');
    add(hs.examDa, 'tech:exam');
  }

  // 4. QuickNumbersModal
  const numberGroups = extractConstFromTsx(
    'src/components/views/QuickNumbersModal.tsx',
    'NUMBER_GROUPS'
  );
  if (!Array.isArray(numberGroups) || numberGroups.length === 0) {
    throw new Error('Failed to extract NUMBER_GROUPS');
  }
  for (const grp of numberGroups) {
    for (const item of grp.items ?? []) {
      if (item.daTerm) add(item.daTerm, 'numbers');
    }
  }

  // 5. KontrolSimulatorModal
  const kontrolQuestions = extractConstFromTsx(
    'src/components/views/KontrolSimulatorModal.tsx',
    'KONTROL_QUESTIONS'
  );
  if (!Array.isArray(kontrolQuestions) || kontrolQuestions.length === 0) {
    throw new Error('Failed to extract KONTROL_QUESTIONS');
  }
  for (const kq of kontrolQuestions) {
    add(kq.promptDa, 'kontrol:prompt');
    if (kq.normDa) add(kq.normDa, 'kontrol:norm');
    for (const opt of kq.options ?? []) {
      if (opt.da) add(opt.da, 'kontrol:option');
    }
  }

  // 6. MODULES_DATA
  for (const mod of MODULES_DATA) {
    add(mod.titleDa, 'mod:title');
    if (mod.subtitleDa) add(`${mod.titleDa}. ${mod.subtitleDa}`, 'mod:cover');
    if (mod.teacherIntroDa) add(mod.teacherIntroDa, 'mod:teacherIntro');
    for (const term of mod.prereqTerms ?? []) {
      add(term.termDa, 'mod:prereqTerm');
      add(`${term.termDa}. ${term.explainDa}`, 'mod:prereqFull');
    }
    for (const goal of mod.officialGoals ?? []) {
      add(goal.titleDa, 'mod:goal');
    }
    for (const rule of mod.cheatSheet ?? []) {
      add(rule.titleDa, 'mod:ruleTitle');
      add(`${rule.titleDa}. ${rule.bodyDa}`, 'mod:ruleComposite');
      if (rule.bodyDa) add(rule.bodyDa, 'mod:ruleBodyCore');
      const introDa = rule.whyDa || rule.bodyDa;
      if (introDa) add(introDa, 'mod:ruleIntro');
      for (const step of rule.attentionStepsDa ?? []) {
        add(step, 'mod:ruleStep');
      }
      if (rule.comparePair) {
        add(`${rule.comparePair.left.labelDa}. ${rule.comparePair.left.summaryDa}`, 'mod:compareLeft');
        add(`${rule.comparePair.right.labelDa}. ${rule.comparePair.right.summaryDa}`, 'mod:compareRight');
      }
      for (const pt of rule.pointsDa ?? []) {
        add(pt, 'mod:rulePoint');
      }
      if (!rule.pointsDa || rule.pointsDa.length === 0) {
        add(rule.bodyDa, 'mod:ruleBodyFallback');
      }
      if (rule.exceptionsDa) add(rule.exceptionsDa, 'mod:ruleExceptions');
      if (rule.trapDa) add(rule.trapDa, 'mod:ruleTrap');
    }
    for (const alg of mod.algorithms ?? []) {
      add(alg.da, 'mod:alg');
    }
  }

  // 7. DICTIONARY_ENTRIES
  for (const entry of DICTIONARY_ENTRIES) {
    add(entry.da, 'dict:term');
    add(`${entry.da}. ${entry.detailsDa}`, 'dict:full');
  }

  // 8. QUESTIONS_BANK + numbered statement prefixes ("1." .. "6.")
  for (const q of QUESTIONS_BANK) {
    add(q.situationDa, 'q:situation');
    add(q.keyRuleDa, 'q:keyRule');
    for (const sq of q.subQuestions ?? []) {
      add(sq.da, 'q:sub');
      add(sq.explanationDa, 'q:explanation');
    }
  }
  for (let i = 1; i <= 6; i += 1) {
    add(`${i}.`, 'seq:prefix');
  }

  return Array.from(entries.values());
}

const args = new Set(process.argv.slice(2));
const items = collectAllPhrases();
const totalChars = items.reduce((acc, it) => acc + it.spoken.length, 0);
const audioDir = path.join(ROOT, 'public', 'audio');
const existingCount = items.filter((it) =>
  fs.existsSync(path.join(audioDir, `${it.hash}.mp3`))
).length;

console.log(`Total unique phrases extracted: ${items.length}`);
console.log(`Already generated MP3s:       ${existingCount}`);
console.log(`Remaining to generate:        ${items.length - existingCount}`);
console.log(`Total spoken characters:      ${totalChars.toLocaleString('en-US')}`);
// Rough Danish speech ~14 chars/sec; edge-tts 48kbps mono = 6 KB/sec
const estSec = totalChars / 14;
const estMb48 = (estSec * 6000) / (1024 * 1024);
console.log(`Est. duration:                ${(estSec / 60).toFixed(1)} min`);
console.log(`Est. size (@48kbps edge-tts): ~${estMb48.toFixed(1)} MB`);

if (args.has('--inspect-tokens')) {
  const suspicious = new Set();
  for (const it of items) {
    const matches = it.spoken.match(/\b[a-zæøå]{1,4}\.|[\/‰%§–—•·→()0-9]+[^\s]*/gi);
    if (matches) {
      for (const m of matches) {
        if (m.length > 1 && /[./‰%§–—•·→]/.test(m)) suspicious.add(m);
      }
    }
  }
  console.log('\nRemaining dotted/symbol tokens sample (first 80):');
  console.log(Array.from(suspicious).slice(0, 80).join(' | '));
}

if (args.has('--write-tasks')) {
  fs.mkdirSync(audioDir, { recursive: true });
  const pending = items
    .filter((it) => {
      const outPath = path.join(audioDir, `${it.hash}.mp3`);
      return !fs.existsSync(outPath) || fs.statSync(outPath).size < 400;
    })
    .map((it) => ({
      hash: it.hash,
      spoken: it.spoken,
      raw: it.raw,
      outPath: path.join(audioDir, `${it.hash}.mp3`),
    }));

  const tasksPath = path.join(__dirname, 'tts_tasks.json');
  fs.writeFileSync(tasksPath, JSON.stringify(pending, null, 2));
  console.log(`\nWrote ${pending.length} pending tasks to ${tasksPath}`);
}

if (args.has('--write-manifest')) {
  const availableHashes = items
    .map((it) => it.hash)
    .filter((hash) => {
      const p = path.join(audioDir, `${hash}.mp3`);
      return fs.existsSync(p) && fs.statSync(p).size >= 400;
    })
    .sort();

  const manifestPath = path.join(ROOT, 'src', 'data', 'speechManifest.ts');
  const content =
    `// Auto-generated by scripts/generate-audio.mjs — do not edit manually.\n` +
    `// Contains ${availableHashes.length} verified pre-generated da-DK MP3 audio hashes in public/audio/.\n` +
    `export const SPEECH_AUDIO_HASHES: readonly string[] = [\n` +
    availableHashes.map((h) => `  '${h}',`).join('\n') +
    `\n];\n`;
  fs.writeFileSync(manifestPath, content);
  console.log(`\nWrote manifest with ${availableHashes.length} hashes to ${manifestPath}`);
}
