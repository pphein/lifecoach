import Dexie, { type Table } from "dexie";

export interface User {
  id?: number;
  name: string;
  age: number;
  goal: string;
}

export interface ScheduleItem {
  id?: number;
  time: string;
  title: string;
  category: "health" | "family" | "wealth";
  completed: boolean;
  repeat: boolean;
  date: string;
  notifyEnabled: boolean;
  notifyMessage?: string;
}

export interface Habit {
  id?: number;
  title: string;
  category: "health" | "family" | "wealth";
  completed: boolean;
  date: string;
}

export interface History {
  id?: number;
  date: string;
  score: number;
  healthScore: number;
  familyScore: number;
  wealthScore: number;
}

export interface HealthRecord {
  id?: number;
  date: string;
  weight: number;
  waist: number;
  fbs: number;
  sleep: number;
  exercise: number;
}

export interface FinanceRecord {
  id?: number;
  date: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  note: string;
}

export interface FamilyRecord {
  id?: number;
  date: string;
  type: "wife" | "daughter" | "family";
  activity: string;
  minutes: number;
  score: number;
}

class LifeDatabase extends Dexie {
  users!: Table<User>;
  schedules!: Table<ScheduleItem>;
  habits!: Table<Habit>;
  history!: Table<History>;
  health!: Table<HealthRecord>;
  finance!: Table<FinanceRecord>;
  family!: Table<FamilyRecord>;

  constructor() {
    super("life100");
    this.version(5).stores({
      users: "++id",
      schedules: "++id, date, category",
      habits: "++id, date, category",
      history: "++id, date",
      health: "++id, date",
      finance: "++id, date, type, category",
      family: "++id, date, type",
    });
  }
}

export const db = new LifeDatabase();
