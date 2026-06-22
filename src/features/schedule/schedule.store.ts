import { create } from "zustand";
import type { Schedule } from "./schedule.types";

interface State {
  items: Schedule[];
  setItems: (data: Schedule[]) => void;
  add: (item: Schedule) => void;
  remove: (id: number) => void;
  toggle: (id: number) => void;
  update: (item: Schedule) => void;
}

export const useScheduleStore = create<State>((set) => ({
  items: [],

  setItems(data) {
    set({ items: data });
  },

  add(item) {
    set((state) => ({ items: [...state.items, item] }));
  },

  remove(id) {
    set((state) => ({ items: state.items.filter((x) => x.id !== id) }));
  },

  toggle(id) {
    set((state) => ({
      items: state.items.map((x) =>
        x.id === id ? { ...x, completed: !x.completed } : x
      ),
    }));
  },

  update(item) {
    set((state) => ({
      items: state.items.map((x) => (x.id === item.id ? item : x)),
    }));
  },
}));
