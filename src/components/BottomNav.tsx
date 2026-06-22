import { LayoutDashboard, CalendarDays, CheckSquare, Heart, Wallet, Users, Award } from "lucide-react";
import { useAppStore } from "../store/app.store";
import type { NavPage } from "../types";

const navItems: { id: NavPage; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Home",     icon: <LayoutDashboard size={20} /> },
  { id: "schedule",  label: "Schedule", icon: <CalendarDays size={20} /> },
  { id: "habit",     label: "Habit",    icon: <CheckSquare size={20} /> },
  { id: "health",    label: "Health",   icon: <Heart size={20} /> },
  { id: "finance",   label: "Finance",  icon: <Wallet size={20} /> },
  { id: "family",    label: "Family",   icon: <Users size={20} /> },
  { id: "award",     label: "Award",    icon: <Award size={20} /> },
];

export default function BottomNav() {
  const { currentPage, setPage } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 z-50">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setPage(item.id)}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
            currentPage === item.id
              ? "text-indigo-600 dark:text-indigo-400 font-semibold"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
