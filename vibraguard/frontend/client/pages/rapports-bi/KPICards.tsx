import { cn } from "@/lib/utils";
import { useBIKPIs } from "@/hooks/use-bi-kpis";

interface KPICardProps {
  title: string;
  value: string;
  unit: string;
  trend: string;
  trendUp: boolean;
  trendColor?: string;
  icon: React.ReactNode;
  iconBg: string;
}

function KPICard({ title, value, unit, trend, trendUp, trendColor = "#007A3D", icon, iconBg }: KPICardProps) {
  return (
    <div className="flex flex-col flex-1 min-w-[200px] rounded-lg border border-black/[0.08] bg-[#0B1518] p-6 shadow-sm hover:border-white/10 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[#C9E7E6] text-[13px] font-semibold uppercase tracking-[0.5px] leading-[1.4] max-w-[160px]">
          {title}
        </p>
        <div
          className="flex w-11 h-11 shrink-0 items-center justify-center rounded-md"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-[#E6F0F2] text-[32px] font-bold leading-none">{value}</span>
        <span className="text-[#98A6A8] text-[15px] font-medium">{unit}</span>
      </div>

      <div className="flex items-center gap-1.5">
        {trendUp ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10.6666 4.667H14.6666V8.667" stroke={trendColor} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.6667 4.667L9.00004 10.334L5.66671 7.001L1.33337 11.334" stroke={trendColor} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10.6667 11.333H14.6667V7.333" stroke={trendColor} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.6668 11.334L9.00016 5.667L5.66683 9.001L1.3335 4.667" stroke={trendColor} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        <span className="text-[13px] font-semibold" style={{ color: trendColor }}>
          {trend}
        </span>
      </div>
    </div>
  );
}

export function KPICards({ tab, date }: { tab: string; date: string }) {
  const { data: kpis, isLoading } = useBIKPIs();

  if (isLoading) return <div className="text-white p-6">Chargement...</div>;

  // Simulate variations for demo
  const getSimValue = (val: any) => {
    if (!val) return "0";
    const base = parseFloat(val.toString().replace(/[^0-9.]/g, ""));
    if (tab === "quotidien") return (base / 30).toFixed(1);
    if (tab === "hebdomadaire") return (base / 4).toFixed(1);
    return base.toLocaleString();
  };

  return (
    <div className="flex flex-wrap gap-4 px-6 lg:px-12">
      <KPICard
        title={`MTBF (${tab})`}
        value={getSimValue(kpis?.mtbf ?? "0")}
        unit="h"
        trend={kpis?.mtbfTrend ?? "Stable"}
        trendUp={kpis?.mtbfUp ?? true}
        trendColor="#007A3D"
        iconBg="rgba(0, 122, 61, 0.15)"
        icon={
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M20.1666 10.9997H17.8933C17.0699 10.9979 16.3464 11.5452 16.1241 12.338L13.9699 20.0013C13.9414 20.0991 13.8518 20.1663 13.7499 20.1663C13.6481 20.1663 13.5584 20.0991 13.5299 20.0013L8.46992 1.99801C8.4414 1.90023 8.35177 1.83301 8.24992 1.83301C8.14807 1.83301 8.05844 1.90023 8.02992 1.99801L5.87575 9.66134C5.65437 10.4508 4.93569 10.9973 4.11575 10.9997H1.83325" stroke="#007A3D" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        }
      />

      <KPICard
        title={`MTTR (${tab})`}
        value={String(kpis?.mttr ?? "0")}
        unit="h"
        trend={kpis?.mttrTrend ?? "Stable"}
        trendUp={kpis?.mttrUp ?? false}
        trendColor="#007A3D"
        iconBg="rgba(12, 108, 242, 0.15)"
        icon={
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M13.4751 5.77533L14.9418 8.52533L16.2251 8.52533C16.5239 2.13708 16.6174 2.63392 16.3232 2.92908L13.4751 5.77533" stroke="#0C6CF2" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        }
      />

      <KPICard
        title="Disponibilité"
        value={String(kpis?.availability ?? "0")}
        unit="%"
        trend={kpis?.availabilityTrend ?? "N/A"}
        trendUp={true}
        iconBg="rgba(230, 240, 242, 0.05)"
        icon={
           <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 20C15.9706 20 20 15.9706 20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20Z" stroke="#E6F0F2" strokeWidth="1.5" />
           </svg>
        }
      />

      <KPICard
        title={`Coût ${date}`}
        value={getSimValue(kpis?.maintenanceCost ?? "0")}
        unit="MAD"
        trend={kpis?.maintenanceCostTrend ?? "Stable"}
        trendUp={false}
        iconBg="rgba(242, 169, 0, 0.1)"
        icon={
           <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="#F2A900" strokeWidth="1.5" />
           </svg>
        }
      />
    </div>
  );
}
