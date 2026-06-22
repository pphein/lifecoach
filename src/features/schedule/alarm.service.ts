import type { Schedule } from "./schedule.types";

let alarmInterval: ReturnType<typeof setInterval> | null = null;

export function startAlarm(
  tasks: Schedule[],
  notify: (title: string, message: string) => void
) {
  if (alarmInterval) clearInterval(alarmInterval);

  alarmInterval = setInterval(() => {
    const now = new Date();
    const current = now.toTimeString().substring(0, 5); // "HH:MM"

    tasks.forEach((task) => {
      if (task.time === current && !task.completed && task.notifyEnabled) {
        notify(
          "Life100 - " + task.title,
          task.notifyMessage ?? `Time for: ${task.title}`
        );
      }
    });
  }, 60000); // check every minute
}

export function stopAlarm() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}
