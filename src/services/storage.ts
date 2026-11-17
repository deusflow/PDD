import { BoxLevel, LanguageMode, SRSRecord, ThemeMode, UserAppState } from '../types';

const STORAGE_KEY = 'dk_korekort_state_v1';
const SYNC_PREFIX = 'DKK1:';

export function getDefaultState(): UserAppState {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  return {
    version: 1,
    hasSeenOnboarding: false,
    languageMode: 'both',
    theme: prefersDark ? 'dark' : 'light',
    srs: {},
    examHistory: [],
    sessionsCompleted: 0,
  };
}

function isValidBoxLevel(val: unknown): val is BoxLevel {
  return typeof val === 'number' && Number.isInteger(val) && val >= 0 && val <= 5;
}

function sanitizeSRSMap(raw: unknown): Record<string, SRSRecord> {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<string, SRSRecord> = {};
  for (const [id, entry] of Object.entries(raw as Record<string, unknown>)) {
    if (!entry || typeof entry !== 'object') continue;
    const rec = entry as Partial<SRSRecord>;
    if (!isValidBoxLevel(rec.box)) continue;
    result[id] = {
      id,
      box: rec.box,
      streak: typeof rec.streak === 'number' ? Math.max(0, rec.streak) : 0,
      lastReviewedAt: typeof rec.lastReviewedAt === 'number' ? rec.lastReviewedAt : null,
      nextReviewAt: typeof rec.nextReviewAt === 'number' ? rec.nextReviewAt : null,
      totalAttempts: typeof rec.totalAttempts === 'number' ? Math.max(0, rec.totalAttempts) : 0,
      totalFailures: typeof rec.totalFailures === 'number' ? Math.max(0, rec.totalFailures) : 0,
    };
  }
  return result;
}

function validateAndMigrateState(raw: unknown): UserAppState | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<UserAppState>;
  const defaults = getDefaultState();

  const languageMode: LanguageMode =
    obj.languageMode === 'both' || obj.languageMode === 'spoiler' || obj.languageMode === 'da_only'
      ? obj.languageMode
      : defaults.languageMode;

  const theme: ThemeMode =
    obj.theme === 'light' || obj.theme === 'dark' ? obj.theme : defaults.theme;

  const examHistory = Array.isArray(obj.examHistory)
    ? obj.examHistory
        .filter(
          (item) =>
            item &&
            typeof item === 'object' &&
            typeof item.id === 'string' &&
            typeof item.score === 'number' &&
            typeof item.total === 'number'
        )
        .slice(0, 50)
    : [];

  return {
    version: 1,
    hasSeenOnboarding: Boolean(obj.hasSeenOnboarding),
    languageMode,
    theme,
    srs: sanitizeSRSMap(obj.srs),
    examHistory,
    sessionsCompleted:
      typeof obj.sessionsCompleted === 'number' ? Math.max(0, obj.sessionsCompleted) : 0,
  };
}

export const StorageManager = {
  load(): UserAppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultState();
      const parsed = JSON.parse(raw);
      return validateAndMigrateState(parsed) ?? getDefaultState();
    } catch {
      return getDefaultState();
    }
  },

  save(state: UserAppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors gracefully
    }
  },

  clear(): UserAppState {
    const fresh = {
      ...getDefaultState(),
      hasSeenOnboarding: true,
    };
    this.save(fresh);
    return fresh;
  },

  exportToJson(state: UserAppState): string {
    return JSON.stringify(state, null, 2);
  },

  importFromJson(jsonText: string): UserAppState {
    const parsed = JSON.parse(jsonText);
    const validated = validateAndMigrateState(parsed);
    if (!validated) {
      throw new Error('Неверный формат файла резервной копии JSON.');
    }
    this.save(validated);
    return validated;
  },

  /**
   * Compact Base64 Sync String (UTF-8 safe) prefixed with DKK1:
   */
  encodeSyncString(state: UserAppState): string {
    // Store compact srs array tuples when box > 0 or attempts > 0 to keep code short
    const compactSrs: Record<string, [number, number, number | null, number | null, number, number]> = {};
    for (const [id, rec] of Object.entries(state.srs)) {
      if (rec.box === 0 && rec.totalAttempts === 0) continue;
      compactSrs[id] = [
        rec.box,
        rec.streak,
        rec.lastReviewedAt,
        rec.nextReviewAt,
        rec.totalAttempts,
        rec.totalFailures,
      ];
    }

    const payload = {
      v: 1,
      o: state.hasSeenOnboarding ? 1 : 0,
      l: state.languageMode,
      t: state.theme,
      sc: state.sessionsCompleted,
      eh: state.examHistory,
      s: compactSrs,
    };

    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return SYNC_PREFIX + btoa(binary);
  },

  decodeSyncString(rawCode: string): UserAppState {
    const trimmed = rawCode.trim();
    if (!trimmed.startsWith(SYNC_PREFIX)) {
      throw new Error('Код синхронизации должен начинаться с DKK1:');
    }
    const base64 = trimmed.slice(SYNC_PREFIX.length);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const payload = JSON.parse(json);

    if (!payload || payload.v !== 1 || typeof payload.s !== 'object') {
      throw new Error('Повреждённый или устаревший код синхронизации.');
    }

    const srs: Record<string, SRSRecord> = {};
    for (const [id, tuple] of Object.entries(payload.s as Record<string, unknown>)) {
      if (!Array.isArray(tuple) || tuple.length < 6) continue;
      const box = tuple[0];
      if (!isValidBoxLevel(box)) continue;
      srs[id] = {
        id,
        box,
        streak: Number(tuple[1]) || 0,
        lastReviewedAt: typeof tuple[2] === 'number' ? tuple[2] : null,
        nextReviewAt: typeof tuple[3] === 'number' ? tuple[3] : null,
        totalAttempts: Number(tuple[4]) || 0,
        totalFailures: Number(tuple[5]) || 0,
      };
    }

    const reconstructed = validateAndMigrateState({
      version: 1,
      hasSeenOnboarding: Boolean(payload.o),
      languageMode: payload.l,
      theme: payload.t,
      sessionsCompleted: payload.sc,
      examHistory: payload.eh,
      srs,
    });

    if (!reconstructed) {
      throw new Error('Не удалось восстановить состояние из кода синхронизации.');
    }

    this.save(reconstructed);
    return reconstructed;
  },
};
