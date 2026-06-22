interface Props {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatCard({ title, value, subtitle, icon, color = "text-gray-900 dark:text-white" }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
      </div>
      <h2 className={`text-3xl font-bold ${color}`}>{value}</h2>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
