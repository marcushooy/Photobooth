export interface HistoryEntry {
  id: string;
  timestamp: number;
  photos: string[];
  layout: string;
  themeId: string;
  filterId: string;
  themeName: string;
  filterName: string;
  caption: string;
}

const STORAGE_KEY = 'photobooth_history';

export function getEntries(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addEntry(entry: HistoryEntry): void {
  try {
    const entries = getEntries();
    entries.unshift(entry);
    // Keep at most 50 entries to avoid blowing up localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 50)));
  } catch {
    // localStorage might be full or unavailable; fail silently
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
