import { useEffect, useState } from "react";
import { Plus, Trash2, Heart, Clock } from "lucide-react";
import { format } from "date-fns";
import { useFamilyStore } from "./family.store";
import { getFamilyRecords, addFamilyRecord, deleteFamilyRecord, todayStr } from "./family.service";
import { familyScore, minutesToScore, todayMinutes, weeklyMinutes } from "./family.score";
import { ACTIVITY_SUGGESTIONS } from "./family.types";
import type { FamilyMember, FamilyRecord } from "./family.types";

const MEMBER_CONFIG: Record<FamilyMember, { label: string; emoji: string; color: string; bg: string; ring: string }> = {
  wife:     { label: "Wife",     emoji: "❤️",  color: "text-rose-600",   bg: "bg-rose-50",   ring: "ring-rose-400" },
  daughter: { label: "Daughter", emoji: "👧",  color: "text-purple-600", bg: "bg-purple-50", ring: "ring-purple-400" },
  family:   { label: "Family",   emoji: "👨‍👩‍👧", color: "text-amber-600",  bg: "bg-amber-50",  ring: "ring-amber-400" },
};

export default function Family() {
  const { records, setRecords, add, remove } = useFamilyStore();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<FamilyMember>("wife");
  const [activity, setActivity] = useState(ACTIVITY_SUGGESTIONS.wife[0]);
  const [minutes, setMinutes] = useState(30);
  const [customActivity, setCustomActivity] = useState(false);
  const [customText, setCustomText] = useState("");
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | FamilyMember>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    getFamilyRecords().then(setRecords);
  }, []);

  // Reset activity when type changes
  const handleTypeChange = (t: FamilyMember) => {
    setType(t);
    setActivity(ACTIVITY_SUGGESTIONS[t][0]);
    setCustomActivity(false);
    setCustomText("");
  };

  async function handleSave() {
    const finalActivity = customActivity ? customText.trim() : activity;
    if (!finalActivity || !minutes) return;
    const data: Omit<FamilyRecord, "id"> = {
      date: todayStr(),
      type,
      activity: finalActivity,
      minutes,
      score: minutesToScore(minutes),
    };
    const id = await addFamilyRecord(data);
    add({ ...data, id });
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); }, 1200);
  }

  async function handleDelete(r: FamilyRecord) {
    remove(r.id!);
    await deleteFamilyRecord(r.id!);
  }

  const score = familyScore(records);
  const today = todayStr();
  const todayRecords = records.filter((r) => r.date === today);

  const thisMonth = today.substring(0, 7);
  const filtered = records
    .filter((r) => activeTab === "all" || r.type === activeTab)
    .filter((r) => (!fromDate || r.date >= fromDate) && (!toDate || r.date <= toDate));

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Family</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(), "EEEE, MMM d")}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-md"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Score card */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Family Score</p>
            <p className="text-5xl font-bold mt-1">{score}</p>
            <p className="text-sm opacity-70 mt-1">/ 100</p>
          </div>
          <Heart size={48} className="opacity-50" />
        </div>
        <div className="bg-white/20 rounded-full h-2 mt-4">
          <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${score}%` }} />
        </div>
      </div>

      {/* Today's time summary */}
      <div className="grid grid-cols-3 gap-3">
        {(["wife", "daughter", "family"] as FamilyMember[]).map((m) => {
          const c = MEMBER_CONFIG[m];
          const mins = todayMinutes(records, m);
          const weekMins = weeklyMinutes(records, m);
          return (
            <div key={m} className={`${c.bg} rounded-xl p-3 text-center`}>
              <p className="text-2xl mb-1">{c.emoji}</p>
              <p className={`text-lg font-bold ${c.color}`}>{mins}m</p>
              <p className={`text-xs ${c.color} opacity-70`}>today</p>
              <p className="text-xs text-gray-400 mt-0.5">{weekMins}m/week</p>
            </div>
          );
        })}
      </div>

      {/* Today's log */}
      {todayRecords.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-rose-100 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Heart size={14} className="text-rose-400" /> Today's Activities
          </p>
          <div className="space-y-2">
            {todayRecords.map((r) => {
              const c = MEMBER_CONFIG[r.type];
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="text-xl">{c.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{r.activity}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} /> {r.minutes} min · score {r.score}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-rose-100 dark:border-gray-700 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Log Activity</h2>

          {/* Member selector */}
          <div className="flex gap-2">
            {(["wife", "daughter", "family"] as FamilyMember[]).map((m) => {
              const c = MEMBER_CONFIG[m];
              return (
                <button
                  key={m}
                  onClick={() => handleTypeChange(m)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium flex flex-col items-center gap-1 border-2 transition-all ${
                    type === m ? `${c.bg} border-current ${c.color}` : "border-gray-100 text-gray-400"
                  }`}
                >
                  <span className="text-xl">{c.emoji}</span>
                  <span className="text-xs">{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Activity suggestions */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Activity</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {ACTIVITY_SUGGESTIONS[type].map((a) => (
                <button
                  key={a}
                  onClick={() => { setActivity(a); setCustomActivity(false); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    !customActivity && activity === a
                      ? "bg-rose-500 text-white border-rose-500"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  {a}
                </button>
              ))}
              <button
                onClick={() => setCustomActivity(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  customActivity ? "bg-rose-500 text-white border-rose-500" : "border-gray-200 text-gray-500"
                }`}
              >
                Other...
              </button>
            </div>
            {customActivity && (
              <input
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-rose-400"
                placeholder="Enter activity..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                autoFocus
              />
            )}
          </div>

          {/* Minutes slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs font-medium text-gray-500">Time spent</p>
              <p className="text-sm font-bold text-rose-600">{minutes} min</p>
            </div>
            <input
              type="range"
              min={5} max={180} step={5}
              value={minutes}
              onChange={(e) => setMinutes(+e.target.value)}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              {[15, 30, 60, 90, 120].map((m) => (
                <button key={m} onClick={() => setMinutes(m)} className="hover:text-rose-500 transition-colors">
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Score preview */}
          <div className="bg-rose-50 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-rose-700">Activity score</span>
            <span className="text-xl font-bold text-rose-600">{minutesToScore(minutes)} pts</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${
                saved ? "bg-green-500 text-white" : "bg-rose-500 text-white"
              }`}
            >
              {saved ? "Saved!" : "Save Activity"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 rounded-xl font-medium text-sm bg-gray-100 text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "wife", "daughter", "family"] as Array<"all" | FamilyMember>).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === t ? "bg-rose-500 text-white" : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            }`}
          >
            {t === "all" ? "All" : `${MEMBER_CONFIG[t].emoji} ${MEMBER_CONFIG[t].label}`}
          </button>
        ))}
      </div>

      {/* Date range filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-rose-400"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-rose-400"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setFromDate(thisMonth + "-01"); setToDate(today); }}
            className="flex-1 py-1 rounded-lg text-xs font-medium bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
          >
            This month
          </button>
          <button
            onClick={() => { setFromDate(""); setToDate(""); }}
            className="flex-1 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
          >
            All time
          </button>
        </div>
      </div>

      {/* History list */}
      <div className="space-y-3">
        {filtered.map((r) => {
          const c = MEMBER_CONFIG[r.type];
          return (
            <div key={r.id} className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3`}>
              <div className={`w-10 h-10 ${c.bg} rounded-full flex items-center justify-center text-xl flex-shrink-0`}>
                {c.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{r.activity}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                  <Clock size={10} /> {r.minutes} min
                  <span>·</span>
                  <span className={c.color}>{c.label}</span>
                  <span>·</span>
                  {r.date}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${c.color}`}>{r.score}</p>
                <p className="text-xs text-gray-400">pts</p>
              </div>
              <button onClick={() => handleDelete(r)} className="p-1.5 text-gray-300 hover:text-red-400">
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>

      {!filtered.length && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-5xl mb-3">❤️</p>
          <p className="font-medium">No family activities yet</p>
          <p className="text-sm mt-1">Tap + to log time with your family</p>
        </div>
      )}
    </div>
  );
}
