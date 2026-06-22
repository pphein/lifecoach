import { useEffect, useState } from "react";
import { Save, TrendingDown, TrendingUp, Activity } from "lucide-react";
import { format } from "date-fns";
import { useHealthStore } from "./health.store";
import { getHealthRecords, addHealthRecord, updateHealthRecord, getRecordByDate, todayStr } from "./health.service";
import LineChart from "../../components/LineChart";
import ExerciseVideos from "./ExerciseVideos";
import type { HealthRecord } from "./health.types";

interface Field { key: keyof Omit<HealthRecord, "id" | "date">; label: string; unit: string; color: string; icon: string; reference?: number; referenceLabel?: string; good: "low" | "high"; }
const FIELDS: Field[] = [
  { key: "weight",   label: "Weight",    unit: "kg",    color: "#6366f1", icon: "⚖️", good: "low" },
  { key: "waist",    label: "Waist",     unit: "in",    color: "#ec4899", icon: "📏", good: "low" },
  { key: "fbs",      label: "Blood Sugar (FBS)", unit: "mg/dL", color: "#f59e0b", icon: "🩸", reference: 100, referenceLabel: "100", good: "low" },
  { key: "sleep",    label: "Sleep",     unit: "h",     color: "#8b5cf6", icon: "😴", good: "high", reference: 7, referenceLabel: "goal 7h" },
  { key: "exercise", label: "Exercise",  unit: "min",   color: "#10b981", icon: "🏃", good: "high", reference: 30, referenceLabel: "goal 30m" },
];
function trend(records: HealthRecord[], key: keyof Omit<HealthRecord, "id" | "date">, good: "low" | "high") {
  if (records.length < 2) return null;
  const diff = (records[records.length - 1][key] as number) - (records[records.length - 2][key] as number);
  if (diff === 0) return null;
  return { diff, isGood: good === "low" ? diff < 0 : diff > 0 };
}
const CARD = "bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700";
const INPUT_NUM = "w-16 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2 text-center text-sm focus:outline-none focus:border-indigo-400";

export default function Health() {
  const { records, setRecords, add, update } = useHealthStore();
  const [weight, setWeight] = useState(51);
  const [waist, setWaist] = useState(33);
  const [fbs, setFbs] = useState(95);
  const [sleep, setSleep] = useState(7);
  const [exercise, setExercise] = useState(30);
  const [saved, setSaved] = useState(false);
  const [existingId, setExistingId] = useState<number | undefined>();
  const [selectedDate, setSelectedDate] = useState(todayStr());

  useEffect(() => {
    getHealthRecords().then(setRecords);
  }, []);

  useEffect(() => {
    setExistingId(undefined);
    setWeight(51); setWaist(33); setFbs(95); setSleep(7); setExercise(30);
    getRecordByDate(selectedDate).then((r) => {
      if (r) { setWeight(r.weight); setWaist(r.waist); setFbs(r.fbs); setSleep(r.sleep); setExercise(r.exercise); setExistingId(r.id); }
    });
  }, [selectedDate]);

  async function handleSave() {
    const data = { date: selectedDate, weight, waist, fbs, sleep, exercise };
    if (existingId !== undefined) { const u = { ...data, id: existingId }; await updateHealthRecord(u); update(u); }
    else { const id = await addHealthRecord(data); add({ ...data, id }); setExistingId(id); }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  const latest = records[records.length - 1];
  const setters: Record<string, (v: number) => void> = { weight: setWeight, waist: setWaist, fbs: setFbs, sleep: setSleep, exercise: setExercise };
  const values: Record<string, number> = { weight, waist, fbs, sleep, exercise };

  return (
    <div className="p-5 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(), "EEEE, MMM d")}</p>
      </div>

      {latest && (
        <div className="grid grid-cols-3 gap-2">
          {FIELDS.map((f) => {
            const t = trend(records, f.key, f.good);
            return (
              <div key={f.key} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-lg mb-0.5">{f.icon}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{latest[f.key]}<span className="text-xs text-gray-400 ml-0.5">{f.unit}</span></p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{f.label}</p>
                {t && <div className={`flex items-center justify-center gap-0.5 mt-1 text-xs ${t.isGood ? "text-green-500" : "text-red-500"}`}>{t.isGood ? <TrendingDown size={12} /> : <TrendingUp size={12} />}{Math.abs(t.diff).toFixed(1)}</div>}
              </div>
            );
          })}
        </div>
      )}

      <div className={CARD + " space-y-4"}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-gray-900 dark:text-white shrink-0">Log</h2>
          <input
            type="date"
            value={selectedDate}
            max={todayStr()}
            onChange={(e) => { if (e.target.value) setSelectedDate(e.target.value); }}
            className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
          />
          {existingId && <span className="text-xs text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full shrink-0">Updating</span>}
        </div>
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{f.icon} {f.label} ({f.unit})</label>
            <div className="flex items-center gap-3">
              <input type="range"
                min={f.key === "weight" ? 30 : f.key === "waist" ? 20 : f.key === "fbs" ? 60 : f.key === "sleep" ? 3 : 0}
                max={f.key === "weight" ? 120 : f.key === "waist" ? 60 : f.key === "fbs" ? 300 : f.key === "sleep" ? 12 : 180}
                step={f.key === "sleep" ? 0.5 : 1} value={values[f.key]}
                onChange={(e) => setters[f.key](+e.target.value)} className="flex-1 accent-indigo-600" />
              <input type="number" value={values[f.key]} onChange={(e) => setters[f.key](+e.target.value)}
                className={INPUT_NUM} step={f.key === "sleep" ? 0.5 : 1} />
            </div>
          </div>
        ))}
        <button onClick={handleSave} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${saved ? "bg-green-500 text-white" : "bg-indigo-600 text-white"}`}>
          <Save size={16} />{saved ? "Saved!" : selectedDate === todayStr() ? "Save Today's Data" : `Save ${selectedDate}`}
        </button>
      </div>

      {records.length > 0 && FIELDS.map((f) => (
        <div key={f.key} className={CARD}>
          <div className="flex items-center gap-2 mb-4"><Activity size={16} style={{ color: f.color }} /><h2 className="font-bold text-gray-900 dark:text-white">{f.label}</h2></div>
          <LineChart data={records} dataKey={f.key} color={f.color} unit={f.unit} referenceValue={f.reference} referenceLabel={f.referenceLabel} />
        </div>
      ))}
      {records.length === 0 && <div className="text-center py-10 text-gray-400"><p className="text-4xl mb-2">📊</p><p>Log your first entry to see graphs</p></div>}

      <ExerciseVideos />
    </div>
  );
}
