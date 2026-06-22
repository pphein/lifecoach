import { create } from "zustand";
import type { FinanceRecord } from "./finance.types";

interface State {
  records: FinanceRecord[];
  setRecords: (data: FinanceRecord[]) => void;
  add: (data: FinanceRecord) => void;
  remove: (id: number) => void;
}

export const useFinanceStore = create<State>((set) => ({
  records: [],

  setRecords(data) {
    set({ records: data });
  },

  add(data) {
    set((state) => ({ records: [data, ...state.records] }));
  },

  remove(id) {
    set((state) => ({ records: state.records.filter((x) => x.id !== id) }));
  },
}));
