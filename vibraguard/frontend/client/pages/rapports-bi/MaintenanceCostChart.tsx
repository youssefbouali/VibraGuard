import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useMaintenanceCosts } from "@/hooks/use-maintenance-costs";

function formatK(value: number) {
  return `${Math.round(value / 1000)}k`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-white/10 bg-[#0D1316] px-3 py-2 text-xs shadow-lg">
        <p className="text-[#E6F0F2] font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
            {p.name === "reel" ? "Coût Réel" : "Budget"}: {formatK(p.value)} MAD
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function MaintenanceCostChart() {
  const { data: chartData = [], isLoading } = useMaintenanceCosts();

  return (
    <div className="flex flex-col rounded-lg border border-black/[0.08] bg-[#0B1518] h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.08]">
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2.25 2.25V15.75H15.75" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.25 6.75L10.5 10.5L7.5 7.5L5.25 9.75" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#E6F0F2] text-[15px] font-semibold">
            Évolution des Coûts de Maintenance
          </span>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-[3px] bg-[#007A3D]" />
            <span className="text-[#C9E7E6] text-[13px] font-medium">Coût Réel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0 border-t-2 border-dashed border-[#0C6CF2]" />
            <span className="text-[#C9E7E6] text-[13px] font-medium">Budget Alloué</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-6 min-h-0">
        {isLoading ? (
          <div className="text-white">Chargement...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={200}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#98A6A8", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                tickFormatter={formatK}
                tick={{ fill: "#98A6A8", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={[10000, 50000]}
                ticks={[10000, 20000, 30000, 40000, 50000]}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="reel"
                name="reel"
                stroke="#007A3D"
                strokeWidth={2.5}
                dot={{ fill: "#0B1518", stroke: "#007A3D", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 5, fill: "#007A3D" }}
              />
              <Line
                type="monotone"
                dataKey="budget"
                name="budget"
                stroke="#0C6CF2"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4, fill: "#0C6CF2" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
