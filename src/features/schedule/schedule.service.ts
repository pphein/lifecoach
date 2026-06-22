import { db } from "../../database/db";
import type { Schedule } from "./schedule.types";

export async function getSchedules(date: string): Promise<Schedule[]> {
  const rows = await db.schedules.where("date").equals(date).toArray();
  if (rows.length > 0) return rows as Schedule[];

  // Seed default schedule on first load for a new day
  const defaults: Omit<Schedule, "id">[] = [
    { title: "Wake Up",       time: "05:30", category: "health", completed: false, repeat: true, date, notifyEnabled: true, notifyMessage: "Good morning! Start your day strong." },
    { title: "Exercise",      time: "05:35", category: "health", completed: false, repeat: true, date, notifyEnabled: true, notifyMessage: "30 mins exercise today = stronger you tomorrow!" },
    { title: "Cook + Child Care", time: "06:00", category: "family", completed: false, repeat: true, date, notifyEnabled: false },
    { title: "Breakfast",     time: "07:15", category: "health", completed: false, repeat: true, date, notifyEnabled: false },
    { title: "Work",          time: "07:30", category: "wealth", completed: false, repeat: true, date, notifyEnabled: true, notifyMessage: "Focus time. Deep work!" },
    { title: "Lunch + Walk",  time: "12:00", category: "health", completed: false, repeat: true, date, notifyEnabled: true, notifyMessage: "Time for lunch and a walk!" },
    { title: "Return Home",   time: "17:15", category: "family", completed: false, repeat: true, date, notifyEnabled: false },
    { title: "Family + Cook", time: "18:00", category: "family", completed: false, repeat: true, date, notifyEnabled: true, notifyMessage: "Family time. Be present!" },
    { title: "Couple Time",   time: "20:30", category: "family", completed: false, repeat: true, date, notifyEnabled: false },
    { title: "Learning",      time: "21:00", category: "wealth", completed: false, repeat: true, date, notifyEnabled: true, notifyMessage: "1 hour of learning = skills that compound." },
    { title: "Sleep",         time: "22:15", category: "health", completed: false, repeat: true, date, notifyEnabled: true, notifyMessage: "Sleep well. Rest is part of the plan." },
  ];

  const ids = await db.schedules.bulkAdd(defaults, { allKeys: true });
  return defaults.map((d, i) => ({ ...d, id: ids[i] as number }));
}

export async function createSchedule(data: Omit<Schedule, "id">): Promise<number> {
  return await db.schedules.add(data);
}

export async function deleteSchedule(id: number): Promise<void> {
  await db.schedules.delete(id);
}

export async function updateSchedule(data: Schedule): Promise<void> {
  await db.schedules.put(data);
}

export async function toggleSchedule(item: Schedule): Promise<void> {
  await db.schedules.put({ ...item, completed: !item.completed });
}
