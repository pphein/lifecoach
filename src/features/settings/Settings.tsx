import { useRef, useState } from "react";
import { X, Moon, Sun, Download, Upload, Trash2, Shield } from "lucide-react";
import { useAppStore } from "../../store/app.store";
import { exportAllData, importAllData, clearAllData } from "../../database/backup.service";

export default function Settings() {
  const { darkMode, toggleDark, setShowSettings } = useAppStore();
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function flash(text: string, ok = true) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportAllData();
      flash("Backup downloaded!");
    } catch {
      flash("Export failed", false);
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const json = await file.text();
      await importAllData(json);
      flash("Data imported! Refresh to see changes.");
    } catch {
      flash("Import failed – invalid file", false);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleClear() {
    if (!confirmClear) { setConfirmClear(true); return; }
    setClearing(true);
    try {
      await clearAllData();
      flash("All data cleared");
      setConfirmClear(false);
    } catch {
      flash("Clear failed", false);
    } finally {
      setClearing(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setShowSettings(false)}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-t-2xl z-50 shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>

        <div className="p-5 space-y-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>

          {/* Flash message */}
          {msg && (
            <div className={`rounded-lg px-4 py-2 text-sm font-medium ${msg.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
              {msg.text}
            </div>
          )}

          {/* Appearance */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Appearance</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-yellow-500" />}
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Dark Mode</p>
                  <p className="text-xs text-gray-400">{darkMode ? "On" : "Off"}</p>
                </div>
              </div>
              <button
                onClick={toggleDark}
                className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? "bg-indigo-600" : "bg-gray-300"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          {/* Backup */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Backup & Restore</p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-left"
            >
              <Download size={18} className="text-indigo-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{exporting ? "Exporting..." : "Export JSON"}</p>
                <p className="text-xs text-gray-400">Download all data as backup file</p>
              </div>
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-left"
            >
              <Upload size={18} className="text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{importing ? "Importing..." : "Import JSON"}</p>
                <p className="text-xs text-gray-400">Restore data from backup file</p>
              </div>
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>

          {/* Danger zone */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wide flex items-center gap-1">
              <Shield size={12} /> Danger Zone
            </p>
            <button
              onClick={handleClear}
              disabled={clearing}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                confirmClear
                  ? "bg-red-500 border-red-500 text-white"
                  : "bg-white dark:bg-gray-700 border-red-200 dark:border-red-800"
              }`}
            >
              <Trash2 size={18} className={confirmClear ? "text-white" : "text-red-500"} />
              <div>
                <p className={`text-sm font-medium ${confirmClear ? "text-white" : "text-red-600 dark:text-red-400"}`}>
                  {clearing ? "Clearing..." : confirmClear ? "Tap again to confirm" : "Clear All Data"}
                </p>
                <p className={`text-xs ${confirmClear ? "text-red-100" : "text-gray-400"}`}>
                  This cannot be undone
                </p>
              </div>
            </button>
          </div>

          {/* Version */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-600">
            Life100 v1.0 · Offline PWA · All data stored locally
          </p>
        </div>
      </div>
    </>
  );
}
