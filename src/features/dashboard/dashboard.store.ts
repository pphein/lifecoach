import { create } from "zustand";

interface TodayTask {
  title: string;
  done: boolean;
  category: "health" | "family" | "wealth";
}

interface DashboardState {
  todayTasks: TodayTask[];
  toggleTask: (title: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  todayTasks: [
    { title: "Exercise", done: false, category: "health" },
    { title: "Water 2L", done: false, category: "health" },
    { title: "Family Time", done: false, category: "family" },
    { title: "Learning", done: false, category: "wealth" },
    { title: "Walk", done: false, category: "health" },
  ],
  toggleTask: (title) =>
    set((state) => ({
      todayTasks: state.todayTasks.map((t) =>
        t.title === title ? { ...t, done: !t.done } : t
      ),
    })),
}));
