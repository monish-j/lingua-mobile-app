import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AppState {
  selectedLanguageCode: string | null;
  setSelectedLanguageCode: (code: string | null) => void;
  completedLessonIds: string[];
  completeLesson: (lessonId: string) => void;
  resetProgress: () => void;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedLanguageCode: null,
      setSelectedLanguageCode: (code) => set({ selectedLanguageCode: code }),
      completedLessonIds: [],
      completeLesson: (lessonId) =>
        set((state) => ({
          completedLessonIds: state.completedLessonIds.includes(lessonId)
            ? state.completedLessonIds
            : [...state.completedLessonIds, lessonId],
        })),
      resetProgress: () => set({ completedLessonIds: [] }),
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "lingua-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedLanguageCode: state.selectedLanguageCode,
        completedLessonIds: state.completedLessonIds,
      }),
      onRehydrateStorage: (state) => {
        return (state, error) => {
          if (state) {
            state.setHasHydrated(true);
          }
        };
      },
    }
  )
);

export default useAppStore;
