export type HistoryItem = {
  id: string;
  createdAt: string;
  keyword: string;
  businessCategory: string;
  topic: string;
  purpose: string;
  content: string;
};

export type AppSettings = {
  defaultBusinessCategory: string | null;
  keywordPresets: string[];
};

const HISTORY_KEY = 'blog-writer-history';
const SETTINGS_KEY = 'blog-writer-settings';

// --- History ---

export function saveHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem {
  const entry: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const list = getAllHistory();
  list.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  return entry;
}

export function getAllHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteHistory(id: string) {
  const list = getAllHistory().filter((item) => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

export function clearAllHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

// --- Settings ---

const defaultSettings: AppSettings = {
  defaultBusinessCategory: null,
  keywordPresets: [],
};

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
