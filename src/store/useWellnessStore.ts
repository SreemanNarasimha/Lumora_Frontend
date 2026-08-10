import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedItem {
  id: string;
  contentItemId: string;
  savedAt: string;
}

interface WellnessState {
  // Streaks & Stats
  journalStreak: number;
  ritualsCompleted: number;
  
  // Library / Saves
  savedContent: SavedItem[];
  
  // Actions
  incrementJournalStreak: () => void;
  resetJournalStreak: () => void;
  incrementRituals: () => void;
  toggleSaveContent: (contentItemId: string) => void;
  isSaved: (contentItemId: string) => boolean;
}

export const useWellnessStore = create<WellnessState>()(
  persist(
    (set, get) => ({
      journalStreak: 0,
      ritualsCompleted: 0,
      savedContent: [],
      
      incrementJournalStreak: () => set((state) => ({ journalStreak: state.journalStreak + 1 })),
      resetJournalStreak: () => set({ journalStreak: 0 }),
      incrementRituals: () => set((state) => ({ ritualsCompleted: state.ritualsCompleted + 1 })),
      
      toggleSaveContent: (contentItemId: string) => set((state) => {
        const exists = state.savedContent.find(item => item.contentItemId === contentItemId);
        if (exists) {
          return { savedContent: state.savedContent.filter(item => item.contentItemId !== contentItemId) };
        } else {
          return { 
            savedContent: [
              ...state.savedContent, 
              { id: crypto.randomUUID(), contentItemId, savedAt: new Date().toISOString() }
            ] 
          };
        }
      }),
      
      isSaved: (contentItemId: string) => {
        return !!get().savedContent.find(item => item.contentItemId === contentItemId);
      }
    }),
    {
      name: 'lumora-wellness-storage',
    }
  )
);
