import { BoxLevel, SRSRecord, TeoriQuestion } from '../types';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const BOX_INTERVALS_MS: Record<BoxLevel, number> = {
  0: 0,
  1: 0, // Immediate repeat in current and next session
  2: 4 * HOUR_MS, // 1 session / 4 hours
  3: 1 * DAY_MS, // 1 day
  4: 3 * DAY_MS, // 3 days
  5: 7 * DAY_MS, // 7 days
};

export const BOX_META: Record<
  BoxLevel,
  {
    labelRu: string;
    labelDa: string;
    intervalRu: string;
    colorClass: string;
    badgeClass: string;
  }
> = {
  0: {
    labelRu: 'Не изучено',
    labelDa: 'Ny / Ikke set',
    intervalRu: 'Ещё не открыто',
    colorClass: 'bg-zinc-300 dark:bg-zinc-700',
    badgeClass:
      'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  },
  1: {
    labelRu: 'Критическая зона',
    labelDa: 'Fejl / Kritisk',
    intervalRu: 'Сейчас и след. сессия',
    colorClass: 'bg-rose-500',
    badgeClass:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300',
  },
  2: {
    labelRu: 'На закреплении',
    labelDa: 'Indlæring',
    intervalRu: 'Через 4 ч / 1 сессию',
    colorClass: 'bg-amber-500',
    badgeClass:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300',
  },
  3: {
    labelRu: 'Знакомо',
    labelDa: 'Kendt',
    intervalRu: 'Через 1 день',
    colorClass: 'bg-sky-500',
    badgeClass:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-300',
  },
  4: {
    labelRu: 'Уверенно',
    labelDa: 'Sikker',
    intervalRu: 'Через 3 дня',
    colorClass: 'bg-emerald-500',
    badgeClass:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  5: {
    labelRu: 'Готов к экзамену',
    labelDa: 'Mestret',
    intervalRu: 'Через 7 дней',
    colorClass: 'bg-teal-600 dark:bg-teal-400',
    badgeClass:
      'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/50 dark:text-teal-300',
  },
};

export function createEmptySRSRecord(id: string): SRSRecord {
  return {
    id,
    box: 0,
    streak: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
    totalAttempts: 0,
    totalFailures: 0,
  };
}

export function getSRSRecord(srsMap: Record<string, SRSRecord>, id: string): SRSRecord {
  return srsMap[id] ?? createEmptySRSRecord(id);
}

/**
 * Leitner / SM-2 transition with strict reset rule:
 * Any mistake drops Box 4 / Box 5 (or any box) immediately back to Box 1.
 */
export function updateSRSRecord(
  prev: SRSRecord | undefined,
  id: string,
  isAllCorrect: boolean,
  now: number = Date.now()
): SRSRecord {
  const base = prev ?? createEmptySRSRecord(id);

  if (!isAllCorrect) {
    return {
      id,
      box: 1,
      streak: 0,
      lastReviewedAt: now,
      nextReviewAt: now,
      totalAttempts: base.totalAttempts + 1,
      totalFailures: base.totalFailures + 1,
    };
  }

  const nextStreak = base.streak + 1;
  let nextBox: BoxLevel;

  if (base.box <= 1) {
    nextBox = 2; // 1st correct answer -> Box 2
  } else if (base.box === 2) {
    nextBox = 3; // 2nd consecutive -> Box 3
  } else if (base.box === 3) {
    nextBox = 4; // 3rd consecutive -> Box 4
  } else {
    nextBox = 5; // 4th+ consecutive -> Box 5
  }

  // Ensure streak reflects box level consistently if jumped from Box 0
  const adjustedStreak = Math.max(nextStreak, nextBox - 1);

  return {
    id,
    box: nextBox,
    streak: adjustedStreak,
    lastReviewedAt: now,
    nextReviewAt: now + BOX_INTERVALS_MS[nextBox],
    totalAttempts: base.totalAttempts + 1,
    totalFailures: base.totalFailures,
  };
}

/**
 * Builds a Smart Session prioritizing:
 * 1) Box 1 (Failed / Critical)
 * 2) Due Box 2-3 (Learning / Familiar) + remaining Box 2
 * 3) Box 0 (Unseen, interleaved across modules for balanced coverage)
 * 4) Due Box 4-5, then remaining questions if pool is smaller than count
 */
export function buildSmartSession(
  questions: TeoriQuestion[],
  srsMap: Record<string, SRSRecord>,
  count: number,
  now: number = Date.now()
): TeoriQuestion[] {
  const box1: TeoriQuestion[] = [];
  const dueBox23: TeoriQuestion[] = [];
  const learningBox2: TeoriQuestion[] = [];
  const unseenByModule = new Map<number, TeoriQuestion[]>();
  const dueBox45: TeoriQuestion[] = [];
  const rest: TeoriQuestion[] = [];

  for (const q of questions) {
    const rec = getSRSRecord(srsMap, q.id);
    if (rec.box === 1) {
      box1.push(q);
    } else if ((rec.box === 2 || rec.box === 3) && (rec.nextReviewAt ?? 0) <= now) {
      dueBox23.push(q);
    } else if (rec.box === 2) {
      learningBox2.push(q);
    } else if (rec.box === 0) {
      const list = unseenByModule.get(q.moduleId) ?? [];
      list.push(q);
      unseenByModule.set(q.moduleId, list);
    } else if ((rec.box === 4 || rec.box === 5) && (rec.nextReviewAt ?? 0) <= now) {
      dueBox45.push(q);
    } else {
      rest.push(q);
    }
  }

  // Sort Box 1 by most failures first
  box1.sort((a, b) => {
    const fa = getSRSRecord(srsMap, a.id).totalFailures;
    const fb = getSRSRecord(srsMap, b.id).totalFailures;
    return fb - fa;
  });

  // Sort due items by earliest nextReviewAt
  dueBox23.sort((a, b) => {
    const na = getSRSRecord(srsMap, a.id).nextReviewAt ?? 0;
    const nb = getSRSRecord(srsMap, b.id).nextReviewAt ?? 0;
    return na - nb;
  });

  // Interleave unseen questions round-robin across modules 1..8
  const interleavedUnseen: TeoriQuestion[] = [];
  const moduleIds = Array.from(unseenByModule.keys()).sort((a, b) => a - b);
  let hasMore = true;
  let idx = 0;
  while (hasMore) {
    hasMore = false;
    for (const mId of moduleIds) {
      const list = unseenByModule.get(mId);
      if (list && idx < list.length) {
        interleavedUnseen.push(list[idx]);
        hasMore = true;
      }
    }
    idx += 1;
  }

  const ordered = [
    ...box1,
    ...dueBox23,
    ...learningBox2,
    ...interleavedUnseen,
    ...dueBox45,
    ...rest,
  ];

  return ordered.slice(0, Math.min(count, ordered.length));
}

export interface ProgressStats {
  totalItems: number;
  seenItems: number;
  masteredItems: number; // Box 4 & Box 5
  coveragePercent: number;
  masteryPercent: number;
  dueCount: number;
  failedCount: number;
  boxCounts: Record<BoxLevel, number>;
}

export function computeProgressStats(
  itemIds: string[],
  srsMap: Record<string, SRSRecord>,
  now: number = Date.now()
): ProgressStats {
  const boxCounts: Record<BoxLevel, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let seenItems = 0;
  let masteredItems = 0;
  let dueCount = 0;
  let failedCount = 0;

  for (const id of itemIds) {
    const rec = getSRSRecord(srsMap, id);
    boxCounts[rec.box] += 1;
    if (rec.box > 0 || rec.totalAttempts > 0) {
      seenItems += 1;
    }
    if (rec.box === 4 || rec.box === 5) {
      masteredItems += 1;
    }
    if (rec.box === 1) {
      failedCount += 1;
      dueCount += 1;
    } else if (rec.box > 1 && rec.nextReviewAt !== null && rec.nextReviewAt <= now) {
      dueCount += 1;
    }
  }

  const totalItems = itemIds.length;
  const coveragePercent = totalItems > 0 ? Math.round((seenItems / totalItems) * 100) : 0;
  const masteryPercent = totalItems > 0 ? Math.round((masteredItems / totalItems) * 100) : 0;

  return {
    totalItems,
    seenItems,
    masteredItems,
    coveragePercent,
    masteryPercent,
    dueCount,
    failedCount,
    boxCounts,
  };
}

function shuffleSlice<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Selects 25 balanced questions for the official Teoriprøve simulator.
 * When `srsMap` is passed, prioritizes weak (Box 1) and unseen (Box 0) items within each module.
 */
export function buildExamQuestions(
  allQuestions: TeoriQuestion[],
  count: number = 25,
  srsMap?: Record<string, SRSRecord>
): TeoriQuestion[] {
  const byModule = new Map<number, TeoriQuestion[]>();
  for (const q of allQuestions) {
    const arr = byModule.get(q.moduleId) ?? [];
    arr.push(q);
    byModule.set(q.moduleId, arr);
  }

  for (const [mId, arr] of byModule) {
    if (!srsMap) {
      byModule.set(mId, shuffleSlice(arr));
      continue;
    }

    const box1: TeoriQuestion[] = [];
    const box0: TeoriQuestion[] = [];
    const learning: TeoriQuestion[] = [];
    const mastered: TeoriQuestion[] = [];

    for (const q of arr) {
      const box = getSRSRecord(srsMap, q.id).box;
      if (box === 1) box1.push(q);
      else if (box === 0) box0.push(q);
      else if (box <= 3) learning.push(q);
      else mastered.push(q);
    }

    byModule.set(mId, [
      ...shuffleSlice(box1),
      ...shuffleSlice(box0),
      ...shuffleSlice(learning),
      ...shuffleSlice(mastered),
    ]);
  }

  const selected: TeoriQuestion[] = [];
  const moduleIds = Array.from(byModule.keys()).sort((a, b) => a - b);

  // Pick round-robin so all 8 Færdselsstyrelsen topics are represented
  let round = 0;
  while (selected.length < count) {
    let addedInRound = false;
    for (const mId of moduleIds) {
      if (selected.length >= count) break;
      const arr = byModule.get(mId);
      if (arr && round < arr.length) {
        selected.push(arr[round]);
        addedInRound = true;
      }
    }
    if (!addedInRound) break;
    round += 1;
  }

  // Lightly shuffle selected order for realistic exam unpredictability
  for (let i = selected.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }

  return selected;
}

const HARDCORE_TRAP_MODULES = new Set([3, 4, 6, 7, 8]);

/**
 * Selects 25 high-difficulty exam questions for the serious "Hardcore Traps" simulator:
 * prioritizes Box 1 errors, unseen advanced items, and high-trap Færdselsloven topics
 * (vigepligt, vulnerable road users, tunnels/motorway, parking distances, glatbane/laws).
 */
export function buildHardcoreExamQuestions(
  allQuestions: TeoriQuestion[],
  count: number = 25,
  srsMap?: Record<string, SRSRecord>
): TeoriQuestion[] {
  const scored = allQuestions.map((q) => {
    const rec = srsMap ? getSRSRecord(srsMap, q.id) : null;
    let weight = 0;

    if (rec) {
      if (rec.box === 1) weight += 100 + rec.totalFailures * 15;
      else if (rec.box === 0) weight += 45;
      else if (rec.box <= 3) weight += 25;
      else weight += 5;
    }

    if (HARDCORE_TRAP_MODULES.has(q.moduleId)) {
      weight += 30;
    }
    if (/_2[1-5]$/.test(q.id)) {
      weight += 20;
    }

    // Add bounded jitter for variety between attempts while keeping priority tiers meaningful
    weight += Math.random() * 18;
    return { q, weight };
  });

  scored.sort((a, b) => b.weight - a.weight);
  const picked = scored.slice(0, count).map((item) => item.q);

  for (let i = picked.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }

  return picked;
}
