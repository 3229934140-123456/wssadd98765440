const KEY = 'dental-sealant-app-v1';

export interface PersistedData {
  children: any[];
  toothRecords: any[];
  followups: any[];
  currentOperator: string;
}

export const loadFromStorage = (): PersistedData | null => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedData;
  } catch {
    return null;
  }
};

export const saveToStorage = (data: PersistedData) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
};

export const clearStorage = () => {
  localStorage.removeItem(KEY);
};
