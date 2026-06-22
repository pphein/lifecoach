import { create } from "zustand";
import type { Habit } from "./habit.types";

interface State {
  items: Habit[];
  setItems: (data: Habit[]) => void;
  toggle: (id: number) => void;
  add: (data: Habit) => void;
  remove: (id: number) => void;
}

export const useHabitStore = create<State>((set) => ({
  items: [],

  setItems(data) {
    set({ items: data });
  },

  add(data) {
    set((state) => ({ items: [...state.items, data] }));
  },

  remove(id) {
    set((state) => ({ items: state.items.filter((h) => h.id !== id) }));
  },

  toggle(id) {
    set((state) => ({
      items: state.items.map((h) =>
        h.id === id ? { ...h, completed: !h.completed } : h
      ),
    }));
  },
}));
