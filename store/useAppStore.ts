import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AppState {
  selectedLanguageCode: string | null;
  setSelectedLanguageCode: (code: string | null) => void;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedLanguageCode: null,
      setSelectedLanguageCode: (code) => set({ selectedLanguageCode: code }),
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "lingua-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedLanguageCode: state.selectedLanguageCode,
      }),
      onRehydrateStorage: (state) => {
        return (state, error) => {
          if (!error && state) {
            state.setHasHydrated(true);
          }
        };
      },
    }
  )
);

export default useAppStore;
