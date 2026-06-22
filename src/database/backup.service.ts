import { db } from "./db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripId(records: any[]): any[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return records.map(({ id: _id, ...rest }) => rest);
}

export async function exportAllData(): Promise<void> {
  const [schedules, habits, history, health, finance, family] = await Promise.all([
    db.schedules.toArray(),
    db.habits.toArray(),
    db.history.toArray(),
    db.health.toArray(),
    db.finance.toArray(),
    db.family.toArray(),
  ]);

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    schedules, habits, history, health, finance, family,
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `life100-backup-${new Date().toISOString().substring(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importAllData(json: string): Promise<void> {
  const data = JSON.parse(json);
  await db.transaction("rw", [db.schedules, db.habits, db.history, db.health, db.finance, db.family], async () => {
    if (Array.isArray(data.schedules)) {
      await db.schedules.clear();
      if (data.schedules.length) await db.schedules.bulkAdd(stripId(data.schedules));
    }
    if (Array.isArray(data.habits)) {
      await db.habits.clear();
      if (data.habits.length) await db.habits.bulkAdd(stripId(data.habits));
    }
    if (Array.isArray(data.history)) {
      await db.history.clear();
      if (data.history.length) await db.history.bulkAdd(stripId(data.history));
    }
    if (Array.isArray(data.health)) {
      await db.health.clear();
      if (data.health.length) await db.health.bulkAdd(stripId(data.health));
    }
    if (Array.isArray(data.finance)) {
      await db.finance.clear();
      if (data.finance.length) await db.finance.bulkAdd(stripId(data.finance));
    }
    if (Array.isArray(data.family)) {
      await db.family.clear();
      if (data.family.length) await db.family.bulkAdd(stripId(data.family));
    }
  });
}

export async function clearAllData(): Promise<void> {
  await db.transaction("rw", [db.schedules, db.habits, db.history, db.health, db.finance, db.family], async () => {
    await Promise.all([
      db.schedules.clear(),
      db.habits.clear(),
      db.history.clear(),
      db.health.clear(),
      db.finance.clear(),
      db.family.clear(),
    ]);
  });
}
