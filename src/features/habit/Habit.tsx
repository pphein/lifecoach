import { useEffect, useState } from "react";
import { Plus, Trash2, Flame } from "lucide-react";
import { format } from "date-fns";
import { useHabitStore } from "./habit.store";
import { getHabits, addHabit, toggleHabit, deleteHabit, today } from "./habit.service";
import { calculateScore, calculateCategoryScore } from "./score.service";
import { saveScore } from "../award/streak.service";
import type { Habit } from "./habit.types";

const categoryStyle: Record<string, { bg: string; text: string; bar: string; label: string }> = {
  health: { bg: "bg-green-50 dark:bg-green-900/30",  text: "text-green-700 dark:text-green-400",  bar: "bg-green-500",  label: "Health" },
  family: { bg: "bg-pink-50 dark:bg-pink-900/30",    text: "text-pink-700 dark:text-pink-400",    bar: "bg-pink-500",   label: "Family" },
  wealth: { bg: "bg-yellow-50 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", bar: "bg-yellow-500", label: "Wealth" },
};
type Category = "health" | "family" | "wealth";
const INPUT = "w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-400";

export default function Habit() {
  const { items, setItems, toggle, add, remove } = useHabitStore();
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState<Category>("health");
  const [activeTab, setActiveTab] = useState<"all" | Category>("all");

  useEffect(() => { getHabits().then(setItems); }, []);

  useEffect(() => {
    if (!items.length) return;
    const score = calculateScore(items);
    const h = calculateCategoryScore(items, "health");
    const f = calculateCategoryScore(items, "family");
    const w = calculateCategoryScore(items, "wealth");
    saveScore(score, h, f, w);
  }, [items]);

  async function handleToggle(habit: Habit) { toggle(habit.id!); await toggleHabit(habit); }
  async function handleAdd() {
    if (!newTitle.trim()) return;
    const data = { title: newTitle.trim(), category: newCat, completed: false, date: today() };
    const id = await addHabit(data);
    add({ ...data, id });
    setNewTitle(""); setShowForm(false);
  }
  async function handleDelete(habit: Habit) { remove(habit.id!); await deleteHabit(habit.id!); }

  const score = calculateScore(items);
  const healthScore = calculateCategoryScore(items, "health");
  const familyScore = calculateCategoryScore(items, "family");
  const wealthScore = calculateCategoryScore(items, "wealth");
  const filtered = activeTab === "all" ? items : items.filter((h) => h.category === activeTab);
  const doneCount = filtered.filter((h) => h.completed).length;
  const tabs: Array<"all" | Category> = ["all", "health", "family", "wealth"];

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habits</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(), "EEEE, MMM d")}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md"><Plus size={20} /></button>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div><p className="text-sm opacity-80">Life Score</p><p className="text-5xl font-bold">{score}</p></div>
          <div className="text-right"><Flame size={36} className="opacity-60 ml-auto" /><p className="text-sm opacity-80 mt-1">{doneCount}/{filtered.length} done</p></div>
        </div>
        <div className="bg-white/20 rounded-full h-2"><div className="bg-white rounded-full h-2 transition-all" style={{ width: `${score}%` }} /></div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(["health", "family", "wealth"] as Category[]).map((cat) => {
          const s = { health: healthScore, family: familyScore, wealth: wealthScore }[cat];
          const c = categoryStyle[cat];
          return (
            <div key={cat} className={`${c.bg} rounded-xl p-3 text-center`}>
              <p className={`text-xs font-medium ${c.text} mb-1`}>{c.label}</p>
              <p className={`text-2xl font-bold ${c.text}`}>{s}%</p>
              <div className="bg-white/60 dark:bg-white/10 rounded-full h-1 mt-2"><div className={`${c.bar} rounded-full h-1`} style={{ width: `${s}%` }} /></div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-indigo-100 dark:border-gray-700 space-y-3">
          <h2 className="font-bold text-gray-900 dark:text-white">Add Habit</h2>
          <input className={INPUT} placeholder="Habit name" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <select className={INPUT} value={newCat} onChange={(e) => setNewCat(e.target.value as Category)}>
            <option value="health">Health</option><option value="family">Family</option><option value="wealth">Wealth</option>
          </select>
          <div className="flex gap-3">
            <button onClick={handleAdd} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm">Add</button>
            <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2.5 rounded-lg font-medium text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600"}`}>
            {tab === "all" ? "All" : categoryStyle[tab].label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((habit) => {
          const c = categoryStyle[habit.category];
          return (
            <div key={habit.id} className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 ${habit.completed ? "opacity-70" : ""}`}>
              <button onClick={() => handleToggle(habit)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${habit.completed ? `${c.bar} border-transparent text-white` : "border-gray-300 dark:border-gray-500"}`}>
                {habit.completed && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </button>
              <span className={`flex-1 text-sm font-medium ${habit.completed ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-100"}`}>{habit.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{c.label}</span>
              <button onClick={() => handleDelete(habit)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
            </div>
          );
        })}
      </div>
      {!filtered.length && <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">✏️</p><p>No habits yet.</p></div>}
    </div>
  );
}
