import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  data: any[];
  dataKey: string;
  color?: string;
  unit?: string;
  referenceValue?: number;
  referenceLabel?: string;
}

export default function LineChart({
  data,
  dataKey,
  color = "#6366f1",
  unit = "",
  referenceValue,
  referenceLabel,
}: Props) {
  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-300 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickFormatter={(v: string) => v.substring(5)}
          />
          <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <Tooltip
            formatter={(value) => [`${value}${unit}`, dataKey]}
            labelStyle={{ color: "#374151", fontSize: 12 }}
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
          />
          {referenceValue !== undefined && (
            <ReferenceLine
              y={referenceValue}
              stroke="#ef4444"
              strokeDasharray="4 2"
              label={{ value: referenceLabel ?? "", fontSize: 10, fill: "#ef4444" }}
            />
          )}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
