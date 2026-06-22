import { db } from "../../database/db";
import type { FamilyRecord } from "./family.types";

export async function getFamilyRecords(): Promise<FamilyRecord[]> {
  return db.family.orderBy("date").reverse().toArray() as Promise<FamilyRecord[]>;
}

export async function addFamilyRecord(data: Omit<FamilyRecord, "id">): Promise<number> {
  return db.family.add(data);
}

export async function deleteFamilyRecord(id: number): Promise<void> {
  await db.family.delete(id);
}

export function todayStr(): string {
  return new Date().toISOString().substring(0, 10);
}
