import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

interface SingleBarProps {
  data: { category: string; amount: number }[];
  color?: string;
}

export function CategoryBarChart({ data, color = "#6366f1" }: SingleBarProps) {
  if (!data.length) {
    return <div className="h-40 flex items-center justify-center text-gray-300 text-sm">No data yet</div>;
  }
  const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#0ea5e9", "#14b8a6"];
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <Tooltip
            formatter={(v) => [(v as number).toLocaleString(), "Amount"]}
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={color !== "#6366f1" ? color : COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MonthlyBarProps {
  data: { month: string; income: number; expense: number; saving: number }[];
}

export function MonthlyBarChart({ data }: MonthlyBarProps) {
  if (!data.length) {
    return <div className="h-40 flex items-center justify-center text-gray-300 text-sm">No data yet</div>;
  }
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={(v: string) => v.substring(5)} />
          <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <Tooltip
            formatter={(v) => (v as number).toLocaleString()}
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="income" fill="#10b981" radius={[3, 3, 0, 0]} name="Income" />
          <Bar dataKey="expense" fill="#ef4444" radius={[3, 3, 0, 0]} name="Expense" />
          <Bar dataKey="saving" fill="#6366f1" radius={[3, 3, 0, 0]} name="Saving" />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
