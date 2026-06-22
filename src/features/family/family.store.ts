import { create } from "zustand";
import type { FamilyRecord } from "./family.types";

interface State {
  records: FamilyRecord[];
  setRecords: (data: FamilyRecord[]) => void;
  add: (data: FamilyRecord) => void;
  remove: (id: number) => void;
}

export const useFamilyStore = create<State>((set) => ({
  records: [],

  setRecords(data) {
    set({ records: data });
  },

  add(data) {
    set((state) => ({ records: [data, ...state.records] }));
  },

  remove(id) {
    set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
  },
}));
