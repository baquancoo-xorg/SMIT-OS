export type DraftPayload = {
  completedYesterday: string;
  doingYesterday: string;
  blockers: string;
  planToday: string;
  savedAt: string;
};

const KEY_PREFIX = 'smitos.dailyReport.draft';

function keyFor(userId: string, date: string): string {
  return `${KEY_PREFIX}.${userId}.${date}`;
}

export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function loadDraft(userId: string, date: string): DraftPayload | null {
  try {
    const raw = localStorage.getItem(keyFor(userId, date));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftPayload;
    if (!parsed.savedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(
  userId: string,
  date: string,
  payload: Omit<DraftPayload, 'savedAt'>
): DraftPayload | null {
  try {
    const full: DraftPayload = { ...payload, savedAt: new Date().toISOString() };
    localStorage.setItem(keyFor(userId, date), JSON.stringify(full));
    return full;
  } catch {
    return null;
  }
}

export function clearDraft(userId: string, date: string): void {
  try {
    localStorage.removeItem(keyFor(userId, date));
  } catch {
    // Ignore errors in incognito mode
  }
}
