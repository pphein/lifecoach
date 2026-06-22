import type { FinanceRecord } from "./finance.types";

export interface Summary {
  income: number;
  expense: number;
  saving: number;
  rate: number;
}

export function calculateSummary(data: FinanceRecord[]): Summary {
  const income = data.filter((x) => x.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = data.filter((x) => x.type === "expense").reduce((a, b) => a + b.amount, 0);
  return {
    income,
    expense,
    saving: income - expense,
    rate: income === 0 ? 0 : Math.round(((income - expense) / income) * 100),
  };
}

export interface CategoryTotal {
  category: string;
  amount: number;
}

export function categoryTotals(data: FinanceRecord[], type: "income" | "expense"): CategoryTotal[] {
  const map: Record<string, number> = {};
  data
    .filter((r) => r.type === type)
    .forEach((r) => {
      map[r.category] = (map[r.category] ?? 0) + r.amount;
    });
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function monthlyTrend(data: FinanceRecord[]): { month: string; income: number; expense: number; saving: number }[] {
  const map: Record<string, { income: number; expense: number }> = {};
  data.forEach((r) => {
    const month = r.date.substring(0, 7);
    if (!map[month]) map[month] = { income: 0, expense: 0 };
    map[month][r.type] += r.amount;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      income: v.income,
      expense: v.expense,
      saving: v.income - v.expense,
    }));
}
