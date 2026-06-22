import { useEffect, useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { format } from "date-fns";
import { useFinanceStore } from "./finance.store";
import { getFinanceRecords, addFinanceRecord, deleteFinanceRecord, currentMonth } from "./finance.service";
import { calculateSummary, categoryTotals, monthlyTrend } from "./finance.calculate";
import { CategoryBarChart, MonthlyBarChart } from "../../components/BarChart";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "./finance.types";
import type { FinanceRecord } from "./finance.types";

type EntryType = "income" | "expense";
type Tab = "overview" | "add" | "history";

function formatMMK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

export default function Finance() {
  const { records, setRecords, add, remove } = useFinanceStore();
  const [tab, setTab] = useState<Tab>("overview");
  const [type, setType] = useState<EntryType>("income");
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    getFinanceRecords().then(setRecords);
  }, []);

  // Switch default category when type changes
  useEffect(() => {
    setCategory(type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  }, [type]);

  async function handleSave() {
    const n = parseFloat(amount);
    if (!n || !category) return;
    const data: Omit<FinanceRecord, "id"> = {
      date: new Date().toISOString().substring(0, 10),
      type,
      category,
      amount: n,
      note,
    };
    const id = await addFinanceRecord(data);
    add({ ...data, id });
    setAmount("");
    setNote("");
    setSaved(true);
    setTimeout(() => { setSaved(false); setTab("overview"); }, 1200);
  }

  async function handleDelete(r: FinanceRecord) {
    remove(r.id!);
    await deleteFinanceRecord(r.id!);
  }

  const thisMonth = currentMonth();
  const monthRecords = records.filter((r) => r.date.startsWith(thisMonth));
  const summary = calculateSummary(monthRecords);
  const allSummary = calculateSummary(records);
  const incomeCats = categoryTotals(monthRecords, "income");
  const expenseCats = categoryTotals(monthRecords, "expense");
  const trend = monthlyTrend(records);

  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(), "MMMM yyyy")}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
          <TrendingUp size={16} className="text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-emerald-700">{formatMMK(summary.income)}</p>
          <p className="text-xs text-emerald-600">Income</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
          <TrendingDown size={16} className="text-red-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-red-600">{formatMMK(summary.expense)}</p>
          <p className="text-xs text-red-500">Expense</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
          <PiggyBank size={16} className="text-indigo-500 mx-auto mb-1" />
          <p className={`text-lg font-bold ${summary.saving >= 0 ? "text-indigo-700" : "text-red-600"}`}>
            {formatMMK(summary.saving)}
          </p>
          <p className="text-xs text-indigo-500">Saving</p>
        </div>
      </div>

      {/* Saving rate */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Saving Rate (this month)</span>
          <span className={`text-2xl font-bold ${summary.rate >= 20 ? "text-emerald-600" : summary.rate >= 0 ? "text-yellow-500" : "text-red-500"}`}>
            {summary.rate}%
          </span>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`rounded-full h-3 transition-all ${summary.rate >= 20 ? "bg-emerald-500" : summary.rate >= 0 ? "bg-yellow-400" : "bg-red-400"}`}
            style={{ width: `${Math.min(100, Math.max(0, summary.rate))}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span className="text-emerald-500">Goal: 20%+</span>
          <span>100%</span>
        </div>
        {records.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between text-xs text-gray-500">
            <span>All-time saving: <strong>{formatMMK(allSummary.saving)}</strong></span>
            <span>Rate: <strong>{allSummary.rate}%</strong></span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["overview", "add", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            }`}
          >
            {t === "overview" ? "Charts" : t === "add" ? "+ Add" : "History"}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === "overview" && (
        <>
          {trend.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">Monthly Trend</h2>
              <MonthlyBarChart data={trend} />
            </div>
          )}
          {incomeCats.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">Income by Category</h2>
              <CategoryBarChart data={incomeCats} color="#10b981" />
            </div>
          )}
          {expenseCats.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">Expense by Category</h2>
              <CategoryBarChart data={expenseCats} color="#ef4444" />
            </div>
          )}
          {!records.length && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">💰</p>
              <p>No entries yet. Add income or expense!</p>
            </div>
          )}
        </>
      )}

      {/* Tab: Add */}
      {tab === "add" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setType("income")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${type === "income" ? "bg-emerald-500 text-white" : "text-gray-500"}`}
            >
              Income
            </button>
            <button
              onClick={() => setType("expense")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${type === "expense" ? "bg-red-500 text-white" : "text-gray-500"}`}
            >
              Expense
            </button>
          </div>

          {/* Category pills */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    category === c
                      ? type === "income"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-red-500 text-white border-red-500"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Amount</p>
            <input
              type="number"
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl p-3 text-lg font-bold focus:outline-none focus:border-indigo-400"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Note */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Note (optional)</p>
            <input
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-400"
              placeholder="e.g. Monthly salary"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
              saved
                ? "bg-green-500 text-white"
                : type === "income"
                ? "bg-emerald-600 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <Plus size={16} />
            {saved ? "Saved!" : `Add ${type === "income" ? "Income" : "Expense"}`}
          </button>
        </div>
      )}

      {/* Tab: History */}
      {tab === "history" && (
        <div className="space-y-3">
          {/* Date range filter */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setFromDate(thisMonth + "-01"); setToDate(new Date().toISOString().substring(0, 10)); }}
                className="flex-1 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
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

          {records.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p>No records yet</p>
            </div>
          )}
          {records
            .filter((r) => (!fromDate || r.date >= fromDate) && (!toDate || r.date <= toDate))
            .map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                r.type === "income" ? "bg-emerald-100" : "bg-red-100"
              }`}>
                {r.type === "income" ? (
                  <TrendingUp size={14} className="text-emerald-600" />
                ) : (
                  <TrendingDown size={14} className="text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{r.category}</p>
                <p className="text-xs text-gray-400">{r.date}{r.note ? ` · ${r.note}` : ""}</p>
              </div>
              <span className={`font-bold text-sm ${r.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                {r.type === "income" ? "+" : "-"}{formatMMK(r.amount)}
              </span>
              <button
                onClick={() => handleDelete(r)}
                className="p-1.5 text-gray-300 hover:text-red-400"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
