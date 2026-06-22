import { create } from "zustand";
import type { NavPage } from "../types";

const savedDark =
  typeof window !== "undefined" && localStorage.getItem("life100_dark") === "true";

interface AppState {
  lifeScore: number;
  currentPage: NavPage;
  darkMode: boolean;
  showSettings: boolean;
  setPage: (page: NavPage) => void;
  toggleDark: () => void;
  setShowSettings: (v: boolean) => void;
  increaseScore: (value: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  lifeScore: 85,
  currentPage: "dashboard",
  darkMode: savedDark,
  showSettings: false,

  setPage: (page) => set({ currentPage: page }),

  toggleDark: () =>
    set((s) => {
      const next = !s.darkMode;
      localStorage.setItem("life100_dark", String(next));
      document.documentElement.classList.toggle("dark", next);
      return { darkMode: next };
    }),

  setShowSettings: (v) => set({ showSettings: v }),

  increaseScore: (value) =>
    set((state) => ({ lifeScore: state.lifeScore + value })),
}));

// Apply saved dark mode immediately on load
if (savedDark) {
  document.documentElement.classList.add("dark");
}
