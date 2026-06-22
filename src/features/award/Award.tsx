import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { getAwards } from "./award.service";
import { getRecentScores, calculateStreak } from "./streak.service";
import type { Award } from "./award.service";

export default function AwardPage() {
  const [streak, setStreak] = useState(0);
  const [awards, setAwards] = useState<Award[]>([]);
  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    getRecentScores(30).then((s) => {
      setScores(s);
      const str = calculateStreak(s);
      setStreak(str);
      setAwards(getAwards(str));
    });
  }, []);

  const unlocked = awards.filter((a) => a.unlocked).length;

  return (
    <div className="p-5 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Awards</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your achievements</p>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <Flame size={48} className="opacity-90" />
          <div>
            <p className="text-sm opacity-80">Current Streak</p>
            <p className="text-5xl font-bold">{streak}</p>
            <p className="text-sm opacity-80 mt-1">consecutive days (70%+ score)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-3xl font-bold text-indigo-600">{unlocked}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Badges Earned</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-3xl font-bold text-orange-500">{scores.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Days Tracked</p>
        </div>
      </div>

      {scores.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Last {scores.length} days</p>
          <div className="flex items-end gap-1 h-12">
            {scores.slice(-14).map((s, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <div className={`rounded-sm ${s >= 70 ? "bg-indigo-500" : "bg-gray-200 dark:bg-gray-600"}`} style={{ height: `${Math.max(4, (s / 100) * 48)}px` }} />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">← recent</p>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-bold text-gray-900 dark:text-white">Badges</h2>
        {awards.map((award) => (
          <div key={award.id} className={`rounded-xl p-4 border flex items-center gap-4 transition-all ${award.unlocked ? "bg-white dark:bg-gray-800 shadow-sm border-indigo-100 dark:border-indigo-900" : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-60"}`}>
            <div className={`text-4xl ${award.unlocked ? "" : "grayscale"}`}>{award.icon}</div>
            <div className="flex-1">
              <p className={`font-semibold ${award.unlocked ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>{award.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{award.description}</p>
              <div className="mt-2 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                <div className={`rounded-full h-1.5 transition-all ${award.unlocked ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"}`} style={{ width: `${Math.min(100, (streak / award.requiredStreak) * 100)}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{Math.min(streak, award.requiredStreak)} / {award.requiredStreak} days</p>
            </div>
            {award.unlocked && <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center"><svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
