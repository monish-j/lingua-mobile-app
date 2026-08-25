import { create } from "zustand";

interface AppState {
  selectedLanguageCode: string | null;
  setSelectedLanguageCode: (code: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedLanguageCode: null,
  setSelectedLanguageCode: (code) => set({ selectedLanguageCode: code }),
}));

export default useAppStore;
