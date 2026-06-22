import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Activity, Flame, Heart, Wallet, Users, Settings, CalendarDays, CheckSquare } from "lucide-react";
import { useAppStore } from "../../store/app.store";
import { getHabits } from "../habit/habit.service";
import { calculateScore, calculateCategoryScore } from "../habit/score.service";
import { getSchedules } from "../schedule/schedule.service";
import { getTodayRecord } from "../health/health.service";
import { getFinanceRecords, currentMonth } from "../finance/finance.service";
import { calculateSummary } from "../finance/finance.calculate";
import { getFamilyRecords, todayStr } from "../family/family.service";
import { getRecentScores, calculateStreak } from "../award/streak.service";

interface Live {
  score: number;
  streak: number;
  schedDone: number;
  schedTotal: number;
  habitsDone: number;
  habitsTotal: number;
  healthWeight?: number;
  healthWaist?: number;
  savingRate: number;
  familyMin: number;
  healthScore: number;
  familyScore: number;
  wealthScore: number;
}

const EMPTY: Live = {
  score: 0, streak: 0, schedDone: 0, schedTotal: 0,
  habitsDone: 0, habitsTotal: 0, savingRate: 0, familyMin: 0,
  healthScore: 0, familyScore: 0, wealthScore: 0,
};

export default function Dashboard() {
  const { setShowSettings } = useAppStore();
  const [live, setLive] = useState<Live>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = todayStr();
    Promise.all([
      getHabits(),
      getSchedules(today),
      getTodayRecord(),
      getFinanceRecords(),
      getFamilyRecords(),
      getRecentScores(30),
    ]).then(([habits, sched, health, finance, family, scores]) => {
      const score = calculateScore(habits);
      const healthScore = calculateCategoryScore(habits, "health");
      const familyScore = calculateCategoryScore(habits, "family");
      const wealthScore = calculateCategoryScore(habits, "wealth");
      const streak = calculateStreak(scores);
      const month = currentMonth();
      const monthFin = finance.filter((f) => f.date.startsWith(month));
      const { rate } = calculateSummary(monthFin);
      const famMin = family.filter((f) => f.date === today).reduce((a, b) => a + b.minutes, 0);

      setLive({
        score,
        streak,
        schedDone: sched.filter((s) => s.completed).length,
        schedTotal: sched.length,
        habitsDone: habits.filter((h) => h.completed).length,
        habitsTotal: habits.length,
        healthWeight: health?.weight,
        healthWaist: health?.waist,
        savingRate: rate,
        familyMin: famMin,
        healthScore,
        familyScore,
        wealthScore,
      });
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(), "EEEE, MMM d")}</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Good Morning!</h1>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Life Score card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Life Score</p>
            <p className={`font-bold mt-1 ${loading ? "text-4xl opacity-50" : "text-5xl"}`}>
              {loading ? "..." : live.score}
            </p>
            <p className="text-sm opacity-70 mt-0.5">/ 100</p>
          </div>
          <div className="text-right">
            <Activity size={40} className="opacity-50 ml-auto" />
            <div className="flex items-center gap-1 mt-2 justify-end">
              <Flame size={14} className="text-orange-300" />
              <span className="text-sm opacity-80">{live.streak} day streak</span>
            </div>
          </div>
        </div>
        <div className="bg-white/20 rounded-full h-2 mt-4">
          <div
            className="bg-white rounded-full h-2 transition-all duration-700"
            style={{ width: `${live.score}%` }}
          />
        </div>
      </div>

      {/* Pillar scores */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-3 text-center">
          <Heart size={16} className="text-green-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{live.healthScore}%</p>
          <p className="text-xs text-green-600 dark:text-green-500">Health</p>
        </div>
        <div className="bg-pink-50 dark:bg-pink-900/30 rounded-xl p-3 text-center">
          <Users size={16} className="text-pink-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-pink-600 dark:text-pink-400">{live.familyScore}%</p>
          <p className="text-xs text-pink-600 dark:text-pink-500">Family</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-3 text-center">
          <Wallet size={16} className="text-yellow-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{live.wealthScore}%</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-500">Wealth</p>
        </div>
      </div>

      {/* Today summary row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays size={14} className="text-indigo-500" />
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Schedule</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {live.schedDone}<span className="text-sm text-gray-400 font-normal">/{live.schedTotal}</span>
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2">
            <div
              className="bg-indigo-500 rounded-full h-1.5"
              style={{ width: live.schedTotal ? `${(live.schedDone / live.schedTotal) * 100}%` : "0%" }}
            />
          </div>
        </div>

        {/* Habits */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare size={14} className="text-purple-500" />
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Habits</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {live.habitsDone}<span className="text-sm text-gray-400 font-normal">/{live.habitsTotal}</span>
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2">
            <div
              className="bg-purple-500 rounded-full h-1.5"
              style={{ width: live.habitsTotal ? `${(live.habitsDone / live.habitsTotal) * 100}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* Health + Finance + Family snapshot */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">Today's Snapshot</h2>

        <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>⚖️</span> Weight / Waist
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {live.healthWeight ? `${live.healthWeight}kg · ${live.healthWaist}in` : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>💰</span> Saving Rate
          </div>
          <span className={`text-sm font-semibold ${live.savingRate >= 20 ? "text-emerald-600" : live.savingRate >= 0 ? "text-yellow-500" : "text-red-500"}`}>
            {live.savingRate}%
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>❤️</span> Family Time Today
          </div>
          <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
            {live.familyMin > 0 ? `${live.familyMin} min` : "—"}
          </span>
        </div>
      </div>

      {/* 4 pillars progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">Life Pillars</h2>
        <div className="space-y-3">
          {[
            { label: "Health",     pct: live.healthScore, color: "bg-green-400",  emoji: "💪" },
            { label: "Family",     pct: live.familyScore, color: "bg-pink-400",   emoji: "❤️" },
            { label: "Wealth",     pct: live.wealthScore, color: "bg-yellow-400", emoji: "💰" },
          ].map(({ label, pct, color, emoji }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xl w-6">{emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
                  <span className="text-gray-400 dark:text-gray-500">{pct}%</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className={`${color} rounded-full h-2 transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
