import { db } from "../../database/db";
import type { Habit } from "./habit.types";
import { DEFAULT_HABITS } from "./habit.types";

export function today(): string {
  return new Date().toISOString().substring(0, 10);
}

export async function getHabits(): Promise<Habit[]> {
  const date = today();
  const rows = await db.habits.where("date").equals(date).toArray();

  if (rows.length > 0) return rows as Habit[];

  // Seed default habits on first load for a new day
  const defaults = DEFAULT_HABITS.map((h) => ({
    ...h,
    completed: false,
    date,
  }));

  const ids = await db.habits.bulkAdd(defaults, { allKeys: true });
  return defaults.map((d, i) => ({ ...d, id: ids[i] as number }));
}

export async function addHabit(data: Omit<Habit, "id">): Promise<number> {
  return db.habits.add(data);
}

export async function toggleHabit(habit: Habit): Promise<void> {
  await db.habits.put({ ...habit, completed: !habit.completed });
}

export async function deleteHabit(id: number): Promise<void> {
  await db.habits.delete(id);
}
