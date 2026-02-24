
export interface OfflineContent {
  id: string;
  topic: string;
  content: string;
  quiz: any[];
  savedAt: number;
}

const STORAGE_KEY = 'drstone_offline_content';

export const storageService = {
  saveContent: (id: string, topic: string, content: string, quiz: any[]) => {
    const saved = storageService.getAllSaved();
    saved[id] = { id, topic, content, quiz, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  },

  getContent: (id: string): OfflineContent | null => {
    const saved = storageService.getAllSaved();
    return saved[id] || null;
  },

  getAllSaved: (): Record<string, OfflineContent> => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  removeContent: (id: string) => {
    const saved = storageService.getAllSaved();
    delete saved[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  },

  isSaved: (id: string): boolean => {
    const saved = storageService.getAllSaved();
    return !!saved[id];
  }
};
