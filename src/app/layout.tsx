import { useState } from "react";
import { Download, Bell } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useAppStore } from "../store/app.store";
import { usePWA } from "../hooks/usePWA";
import { useAlarmEngine } from "../hooks/useAlarmEngine";
import Dashboard from "../features/dashboard/Dashboard";
import Schedule from "../features/schedule/Schedule";
import Habit from "../features/habit/Habit";
import AwardPage from "../features/award/Award";
import Health from "../features/health/Health";
import Finance from "../features/finance/Finance";
import Family from "../features/family/Family";
import Settings from "../features/settings/Settings";

export default function Layout() {
  const { currentPage, showSettings } = useAppStore();
  const { canInstall, install } = usePWA();
  const [notifGranted, setNotifGranted] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );

  useAlarmEngine();

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard": return <Dashboard />;
      case "schedule":  return <Schedule />;
      case "habit":     return <Habit />;
      case "health":    return <Health />;
      case "finance":   return <Finance />;
      case "family":    return <Family />;
      case "award":     return <AwardPage />;
      default:          return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col max-w-md mx-auto relative">
      {/* Notification permission banner */}
      {!notifGranted && (
        <div className="bg-amber-50 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-700 px-4 py-2.5 flex items-center gap-3">
          <Bell size={16} className="text-amber-500 flex-shrink-0" />
          <span className="flex-1 text-xs text-amber-800 dark:text-amber-300">Enable notifications to get task reminders</span>
          <button
            onClick={() =>
              Notification.requestPermission().then((p) =>
                setNotifGranted(p === "granted")
              )
            }
            className="text-xs bg-amber-500 text-white font-semibold px-3 py-1 rounded-full"
          >
            Allow
          </button>
        </div>
      )}
      {/* PWA install banner */}
      {canInstall && (
        <div className="bg-indigo-600 text-white px-4 py-2.5 flex items-center gap-3">
          <Download size={16} className="flex-shrink-0" />
          <span className="flex-1 text-sm">Install Life100 app on your device</span>
          <button
            onClick={install}
            className="text-xs bg-white text-indigo-600 font-semibold px-3 py-1 rounded-full"
          >
            Install
          </button>
        </div>
      )}
      <main className="flex-1 pb-20 overflow-y-auto">
        {renderPage()}
      </main>
      <BottomNav />
      {showSettings && <Settings />}
    </div>
  );
}
