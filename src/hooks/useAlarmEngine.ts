import { useEffect, useRef } from "react";
import { db } from "../database/db";

function playBeep() {
  try {
    const ctx = new AudioContext();
    const times = [0, 0.35, 0.7];
    times.forEach((start) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.25);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 0.25);
    });
    // close context after beeps finish
    setTimeout(() => ctx.close(), 1500);
  } catch {
    // AudioContext not available (e.g. SSR)
  }
}

async function showAlarmNotification(title: string, body: string) {
  // Use SW registration for vibrate support; fall back to plain Notification
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.ready.catch(() => null);
    if (reg) {
      await reg.showNotification("Life100 — " + title, {
        body,
        icon: "/icon.png",
        // vibrate: [300, 100, 300, 100, 300],
        requireInteraction: false,
      });
      return;
    }
  }
  new Notification("Life100 — " + title, { body, icon: "/icon.png" });
}

export function useAlarmEngine() {
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function check() {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const today = now.toISOString().substring(0, 10);

      const tasks = await db.schedules
        .where("date")
        .equals(today)
        .filter((t) => t.time === hhmm && !t.completed && t.notifyEnabled)
        .toArray();

      for (const task of tasks) {
        const key = `${task.id}_${hhmm}_${today}`;
        if (!firedRef.current.has(key)) {
          firedRef.current.add(key);
          playBeep();
          if ("vibrate" in navigator) navigator.vibrate([300, 100, 300, 100, 300]);
          await showAlarmNotification(
            task.title,
            task.notifyMessage ?? `Time for: ${task.title}`
          );
        }
      }
    }

    check();
    const id = setInterval(check, 10_000);
    return () => clearInterval(id);
  }, []);
}
