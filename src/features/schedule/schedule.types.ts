export interface Schedule {
  id?: number;
  title: string;
  time: string;
  category: "health" | "family" | "wealth";
  completed: boolean;
  repeat: boolean;
  date: string; // YYYY-MM-DD
  notifyEnabled: boolean;
  notifyMessage?: string;
}
