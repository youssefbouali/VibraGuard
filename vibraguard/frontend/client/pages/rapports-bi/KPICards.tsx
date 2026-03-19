import { cn } from "@/lib/utils";

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
    <div className="flex flex-col flex-1 min-w-[200px] rounded-lg border border-black/[0.08] bg-[#0B1518] p-6">
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

import { useBIKPIs } from "@/hooks/use-bi-kpis";

export function KPICards() {
  const { data: kpis, isLoading } = useBIKPIs();

  if (isLoading) return <div className="text-white p-6">Chargement...</div>;

  return (
    <div className="flex flex-wrap gap-4 px-6 lg:px-12">
      <KPICard
        title="MTBF Global (Temps Moyen Entre Pannes)"
        value={String(kpis?.mtbf ?? "")}
        unit="h"
        trend={kpis?.mtbfTrend ?? ""}
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
        title="MTTR Global (Temps Moyen de Réparation)"
        value={String(kpis?.mttr ?? "")}
        unit="h"
        trend={kpis?.mttrTrend ?? ""}
        trendUp={kpis?.mttrUp ?? false}
        trendColor="#007A3D"
        iconBg="rgba(12, 108, 242, 0.15)"
        icon={
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <g clipPath="url(#mttr-clip)">
              <path d="M13.4751 5.77533C13.1257 6.13177 13.1257 6.70223 13.4751 7.05867L14.9418 8.52533C15.2982 8.87472 15.8687 8.87472 16.2251 8.52533L19.0723 5.67908C19.3656 5.38392 19.8634 5.47742 19.9734 5.87892C20.5387 7.93525 19.8644 10.1331 18.243 11.5185C16.6217 12.9039 14.3456 13.2271 12.4026 12.3478L5.15177 19.5987C4.39289 20.3573 3.16086 20.3571 2.40223 19.5982C1.6436 18.8393 1.6438 17.6073 2.40269 16.8487L9.65352 9.59783C8.77427 7.65488 9.09749 5.37877 10.4829 3.7574C11.8683 2.13603 14.0661 1.4617 16.1224 2.02708C16.5239 2.13708 16.6174 2.63392 16.3232 2.92908L13.4751 5.77533" stroke="#0C6CF2" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs><clipPath id="mttr-clip"><rect width="22" height="22" fill="white"/></clipPath></defs>
          </svg>
        }
      />

      <KPICard
        title="Disponibilité Globale du Parc"
        value={String(kpis?.availability ?? "")}
        unit="%"
        trend={kpis?.availabilityTrend ?? ""}
        trendUp={kpis?.availabilityUp ?? true}
        trendColor="#007A3D"
        iconBg="transparent"
        icon={
          <div className="flex w-11 h-11 items-center justify-center rounded-md border border-black/[0.08] bg-[#0D1316]">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <g clipPath="url(#dispo-clip)">
                <path d="M1.83325 10.9997C1.83325 16.0589 5.9407 20.1663 10.9999 20.1663C16.0591 20.1663 20.1666 16.0589 20.1666 10.9997C20.1666 5.94045 16.0591 1.83301 10.9999 1.83301C5.9407 1.83301 1.83325 5.94045 1.83325 10.9997V10.9997" stroke="#E6F0F2" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.25 11.0003L10.0833 12.8337L13.75 9.16699" stroke="#E6F0F2" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs><clipPath id="dispo-clip"><rect width="22" height="22" fill="white"/></clipPath></defs>
            </svg>
          </div>
        }
      />

      <KPICard
        title="Coût de Maintenance (Période Actuelle)"
        value={String(kpis?.maintenanceCost ?? "")}
        unit="MAD"
        trend={kpis?.maintenanceCostTrend ?? ""}
        trendUp={kpis?.maintenanceCostUp ?? false}
        trendColor="#007A3D"
        iconBg="rgba(242, 169, 0, 0.15)"
        icon={
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <g clipPath="url(#cout-clip)">
              <path d="M3.66659 5.5H18.3333C19.3451 5.5 20.1666 6.32149 20.1666 7.33333V14.6667C20.1666 15.6785 19.3451 16.5 18.3333 16.5H3.66659C2.65474 16.5 1.83325 15.6785 1.83325 14.6667V7.33333C1.83325 6.32149 2.65474 5.5 3.66659 5.5V5.5" stroke="#F2A900" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.16675 11.0003C9.16675 12.0122 9.98824 12.8337 11.0001 12.8337C12.0119 12.8337 12.8334 12.0122 12.8334 11.0003C12.8334 9.98848 12.0119 9.16699 11.0001 9.16699C9.98824 9.16699 9.16675 9.98848 9.16675 11.0003V11.0003" stroke="#F2A900" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.5 11H5.50917M16.5 11H16.5092" stroke="#F2A900" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs><clipPath id="cout-clip"><rect width="22" height="22" fill="white"/></clipPath></defs>
          </svg>
        }
      />
    </div>
  );
}
