import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useWorkOrders } from "@/hooks/use-work-orders";

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
            Budget Alloué: {formatK(p.value)} MAD
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function parseDate(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function groupByMonth(workOrders: any[]) {
  const map = new Map<string, number>();
  for (const wo of workOrders) {
    const date = parseDate(wo.dueDate) || parseDate(wo.createdAt);
    if (!date) continue;
    const key = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    const cost = typeof wo.cost === "number" ? wo.cost : 0;
    map.set(key, (map.get(key) || 0) + cost);
  }
  return Array.from(map.entries())
    .sort((a, b) => {
      const [ma, ya] = a[0].split(" ");
      const [mb, yb] = b[0].split(" ");
      return new Date(`${ya}-${MONTH_NAMES.indexOf(ma) + 1}-01`).getTime() - new Date(`${yb}-${MONTH_NAMES.indexOf(mb) + 1}-01`).getTime();
    })
    .map(([month, budget]) => ({ month, budget }));
}

const FALLBACK_DATA = [
  { month: "Jan 2026", budget: 42000 },
  { month: "Fév 2026", budget: 40000 },
  { month: "Mar 2026", budget: 45000 },
  { month: "Avr 2026", budget: 46000 },
  { month: "Mai 2026", budget: 50000 },
  { month: "Juin 2026", budget: 52000 },
];

export function MaintenanceCostChart({ tab, date }: { tab: string; date: string }) {
  const { data: workOrders = [], isLoading } = useWorkOrders();

  const groupedData = groupByMonth(workOrders);
  const effectiveData = groupedData.length > 0 ? groupedData : FALLBACK_DATA;

  // Simulated data modification for different tabs
  const simulatedData = effectiveData.map((d: any, idx: number) => {
    if (tab === "quotidien") return { ...d, month: `Jour ${idx + 1}`, budget: d.budget / 30 };
    if (tab === "hebdomadaire") return { ...d, month: `Sem ${idx + 1}`, budget: d.budget / 4 };
    return d;
  });

  return (
    <div className="flex flex-col rounded-lg border border-black/[0.08] bg-[#0B1518] h-full shadow-sm hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.08]">
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2.25 2.25V15.75H15.75" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.25 6.75L10.5 10.5L7.5 7.5L5.25 9.75" stroke="#98A6A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#E6F0F2] text-[15px] font-semibold">
            Coûts de Maintenance - {date} ({tab})
          </span>
        </div>
        <div className="flex items-center gap-5">
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
            <LineChart data={simulatedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                domain={['auto', 'auto']}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
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
