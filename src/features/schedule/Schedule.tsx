import { useEffect, useRef, useState } from "react";
import { format, addDays, isToday, parseISO } from "date-fns";
import { Plus, Trash2, Bell, BellOff, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useScheduleStore } from "./schedule.store";
import { getSchedules, createSchedule, deleteSchedule, updateSchedule } from "./schedule.service";
import type { Schedule } from "./schedule.types";

const categoryColor: Record<string, string> = {
  health: "bg-green-100 text-green-700 border-green-200",
  family: "bg-pink-100 text-pink-700 border-pink-200",
  wealth: "bg-yellow-100 text-yellow-700 border-yellow-200",
};
const categoryDot: Record<string, string> = {
  health: "bg-green-500", family: "bg-pink-500", wealth: "bg-yellow-500",
};

const toStr = (d: Date) => format(d, "yyyy-MM-dd");

const INPUT = "w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-400 dark:placeholder-gray-400";

export default function Schedule() {
  const { items, setItems, add, remove, toggle, update } = useScheduleStore();
  const [selectedDate, setSelectedDate] = useState(toStr(new Date()));
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState<"health" | "family" | "wealth">("health");
  const [notifyMsg, setNotifyMsg] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [notifGranted, setNotifGranted] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSchedules(selectedDate).then(setItems);
  }, [selectedDate]);

  function shiftDay(delta: number) {
    const d = addDays(parseISO(selectedDate), delta);
    setSelectedDate(toStr(d));
    setShowForm(false);
  }

  async function handleSubmit() {
    if (!title.trim() || !time) return;
    const data: Omit<Schedule, "id"> = {
      title: title.trim(), time, category,
      completed: false, repeat: true, date: selectedDate,
      notifyEnabled, notifyMessage: notifyMsg || `Time for: ${title.trim()}`,
    };
    const id = await createSchedule(data);
    add({ ...data, id });
    setTitle(""); setTime(""); setNotifyMsg(""); setNotifyEnabled(true); setShowForm(false);
  }

  async function handleToggle(item: Schedule) {
    toggle(item.id!);
    await updateSchedule({ ...item, completed: !item.completed });
  }
  async function handleDelete(item: Schedule) { remove(item.id!); await deleteSchedule(item.id!); }
  async function handleToggleNotify(item: Schedule) {
    const updated = { ...item, notifyEnabled: !item.notifyEnabled };
    update(updated); await updateSchedule(updated);
  }

  const sorted = [...items].sort((a, b) => a.time.localeCompare(b.time));
  const doneCount = items.filter((t) => t.completed).length;
  const isSelectedToday = isToday(parseISO(selectedDate));
  const displayDate = isSelectedToday
    ? "Today"
    : format(parseISO(selectedDate), "EEE, MMM d");

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(), "EEEE, MMM d")}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
          <Plus size={20} />
        </button>
      </div>

      {/* Date navigator */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => shiftDay(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => dateInputRef.current?.showPicker?.()}
          className={`flex-1 py-2 px-3 rounded-xl border text-sm font-semibold text-center transition-colors ${
            isSelectedToday
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700"
          }`}
        >
          {displayDate}
        </button>
        <button
          onClick={() => shiftDay(1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300"
        >
          <ChevronRight size={18} />
        </button>
        {/* Hidden native date input — triggered by tapping the date button */}
        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate}
          onChange={(e) => { if (e.target.value) { setSelectedDate(e.target.value); setShowForm(false); } }}
          className="sr-only"
        />
      </div>

      {!isSelectedToday && (
        <button
          onClick={() => { setSelectedDate(toStr(new Date())); setShowForm(false); }}
          className="w-full py-2 rounded-xl text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800"
        >
          Back to Today
        </button>
      )}

      {!notifGranted && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-4 flex items-center gap-3">
          <Bell size={18} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-800 dark:text-amber-300">Enable notifications</p>
            <p className="text-amber-600 dark:text-amber-400">Get reminders for your schedule</p>
          </div>
          <button onClick={() => Notification.requestPermission().then((p) => setNotifGranted(p === "granted"))}
            className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-medium">Allow</button>
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700 dark:text-gray-200">{displayDate}'s progress</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{doneCount}/{items.length}</span>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-indigo-500 rounded-full h-2 transition-all duration-500"
            style={{ width: items.length ? `${(doneCount / items.length) * 100}%` : "0%" }} />
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-indigo-100 dark:border-gray-700 space-y-3">
          <h2 className="font-bold text-gray-900 dark:text-white">Add Task</h2>
          <input className={INPUT} placeholder="Task name" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="flex gap-2">
            <input type="date" className={INPUT} value={selectedDate} onChange={(e) => { if (e.target.value) setSelectedDate(e.target.value); }} />
            <input type="time" className={INPUT} value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <select className={INPUT} value={category} onChange={(e) => setCategory(e.target.value as "health" | "family" | "wealth")}>
            <option value="health">Health</option>
            <option value="family">Family</option>
            <option value="wealth">Wealth</option>
          </select>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="notifyEnabled" checked={notifyEnabled} onChange={(e) => setNotifyEnabled(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
            <label htmlFor="notifyEnabled" className="text-sm text-gray-600 dark:text-gray-300">Enable reminder</label>
          </div>
          {notifyEnabled && <input className={INPUT} placeholder="Reminder message (optional)" value={notifyMsg} onChange={(e) => setNotifyMsg(e.target.value)} />}
          <div className="flex gap-3">
            <button onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm">Add Task</button>
            <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2.5 rounded-lg font-medium text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-3">
        {sorted.map((item) => (
          <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700 transition-opacity ${item.completed ? "opacity-60 border-gray-100" : "border-gray-100"}`}>
            <div className="flex items-center gap-3">
              <button onClick={() => handleToggle(item)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.completed ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 dark:border-gray-500"}`}>
                {item.completed && <Check size={14} />}
              </button>
              <div className="w-12 text-center">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{item.time}</span>
              </div>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${categoryDot[item.category]}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.completed ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-100"}`}>{item.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColor[item.category]}`}>{item.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleToggleNotify(item)} className={`p-1.5 rounded-lg ${item.notifyEnabled ? "text-indigo-500" : "text-gray-300 dark:text-gray-600"}`}>
                  {item.notifyEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                </button>
                <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">📅</p><p>No tasks for {displayDate.toLowerCase()}.</p></div>}
    </div>
  );
}
