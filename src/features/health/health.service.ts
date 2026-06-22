import { db } from "../../database/db";
import type { HealthRecord } from "./health.types";

export async function getHealthRecords(): Promise<HealthRecord[]> {
  return db.health.orderBy("date").toArray() as Promise<HealthRecord[]>;
}

export async function addHealthRecord(data: Omit<HealthRecord, "id">): Promise<number> {
  return db.health.add(data);
}

export async function updateHealthRecord(data: HealthRecord): Promise<void> {
  await db.health.put(data);
}

export function todayStr(): string {
  return new Date().toISOString().substring(0, 10);
}

export async function getTodayRecord(): Promise<HealthRecord | undefined> {
  return db.health.where("date").equals(todayStr()).first() as Promise<HealthRecord | undefined>;
}

export async function getRecordByDate(date: string): Promise<HealthRecord | undefined> {
  return db.health.where("date").equals(date).first() as Promise<HealthRecord | undefined>;
}
