import { db } from "../../database/db";
import type { FinanceRecord } from "./finance.types";

export async function getFinanceRecords(): Promise<FinanceRecord[]> {
  return db.finance.orderBy("date").reverse().toArray() as Promise<FinanceRecord[]>;
}

export async function addFinanceRecord(data: Omit<FinanceRecord, "id">): Promise<number> {
  return db.finance.add(data);
}

export async function deleteFinanceRecord(id: number): Promise<void> {
  await db.finance.delete(id);
}

export function currentMonth(): string {
  return new Date().toISOString().substring(0, 7); // "YYYY-MM"
}
