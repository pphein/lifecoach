import { db } from "../../database/db";

export async function getRecentScores(days = 30): Promise<number[]> {
  const rows = await db.history.orderBy("date").last() !== undefined
    ? await db.history.orderBy("date").reverse().limit(days).toArray()
    : [];
  return rows.map((r) => r.score).reverse();
}

export async function saveScore(score: number, healthScore: number, familyScore: number, wealthScore: number): Promise<void> {
  const date = new Date().toISOString().substring(0, 10);
  const existing = await db.history.where("date").equals(date).first();
  if (existing) {
    await db.history.put({ ...existing, score, healthScore, familyScore, wealthScore });
  } else {
    await db.history.add({ date, score, healthScore, familyScore, wealthScore });
  }
}

export function calculateStreak(scores: number[]): number {
  let streak = 0;
  for (let i = scores.length - 1; i >= 0; i--) {
    if (scores[i] >= 70) streak++;
    else break;
  }
  return streak;
}
