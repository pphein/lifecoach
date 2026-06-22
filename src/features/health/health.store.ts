import { create } from "zustand";
import type { HealthRecord } from "./health.types";

interface State {
  records: HealthRecord[];
  setRecords: (data: HealthRecord[]) => void;
  add: (data: HealthRecord) => void;
  update: (data: HealthRecord) => void;
}

export const useHealthStore = create<State>((set) => ({
  records: [],

  setRecords(data) {
    set({ records: data });
  },

  add(data) {
    set((state) => ({ records: [...state.records, data] }));
  },

  update(data) {
    set((state) => ({
      records: state.records.map((r) => (r.id === data.id ? data : r)),
    }));
  },
}));
