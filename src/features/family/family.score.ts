import type { FamilyRecord, FamilyMember } from "./family.types";

export function minutesToScore(minutes: number): number {
  if (minutes >= 60) return 100;
  if (minutes >= 30) return 80;
  if (minutes >= 15) return 60;
  if (minutes >= 5)  return 40;
  return 20;
}

export function familyScore(records: FamilyRecord[]): number {
  if (!records.length) return 0;
  const total = records.reduce((a, b) => a + b.score, 0);
  return Math.min(100, Math.round(total / records.length));
}

export function todayMinutes(records: FamilyRecord[], type: FamilyMember): number {
  const today = new Date().toISOString().substring(0, 10);
  return records
    .filter((r) => r.date === today && r.type === type)
    .reduce((a, b) => a + b.minutes, 0);
}

export function weeklyMinutes(records: FamilyRecord[], type: FamilyMember): number {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return records
    .filter((r) => r.type === type && new Date(r.date) >= weekAgo)
    .reduce((a, b) => a + b.minutes, 0);
}
