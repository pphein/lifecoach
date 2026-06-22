import type { Habit } from "./habit.types";

const WEIGHTS = {
  health: 0.4,
  family: 0.3,
  wealth: 0.3,
};

export function calculateScore(habits: Habit[]): number {
  if (!habits.length) return 0;

  const byCategory = {
    health: habits.filter((h) => h.category === "health"),
    family: habits.filter((h) => h.category === "family"),
    wealth: habits.filter((h) => h.category === "wealth"),
  };

  let total = 0;
  let totalWeight = 0;

  for (const cat of ["health", "family", "wealth"] as const) {
    const group = byCategory[cat];
    if (!group.length) continue;
    const done = group.filter((h) => h.completed).length;
    total += (done / group.length) * WEIGHTS[cat] * 100;
    totalWeight += WEIGHTS[cat];
  }

  if (!totalWeight) return 0;
  return Math.round(total / totalWeight);
}

export function calculateCategoryScore(
  habits: Habit[],
  category: "health" | "family" | "wealth"
): number {
  const group = habits.filter((h) => h.category === category);
  if (!group.length) return 0;
  return Math.round((group.filter((h) => h.completed).length / group.length) * 100);
}
