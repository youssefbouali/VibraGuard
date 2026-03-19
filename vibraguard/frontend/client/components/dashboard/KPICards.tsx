import { cn } from "@/lib/utils";
import { useKPIs } from "@/hooks/use-kpis";

interface KPICardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  trendColor: string;
  icon: React.ReactNode;
  iconBg: string;
}

function KPICard({ title, value, trend, trendUp, trendColor, icon, iconBg }: KPICardProps) {
  return (
    <div className="relative rounded-xl sm:rounded-2xl border border-white/[0.08] bg-[rgba(17,26,36,0.50)] backdrop-blur-xl p-4 sm:p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.30)] overflow-hidden min-h-[140px] sm:min-h-[156px] flex flex-col justify-between">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-[#94A3B8] text-xs sm:text-sm font-medium leading-tight">{title}</span>
        <div className={cn("flex w-9 sm:w-10 h-9 sm:h-10 items-center justify-center rounded-lg sm:rounded-[10px] shrink-0", iconBg)}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="text-white text-2xl sm:text-[28px] font-bold leading-[1.2]">{value}</div>

      {/* Trend */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {trendUp ? (
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="sm:w-[14px] sm:h-[14px]">
            <path d="M9.33337 4.08331H12.8334V7.58331" stroke={trendColor} strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.8333 4.08331L7.87496 9.04165L4.95829 6.12498L1.16663 9.91665" stroke={trendColor} strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="sm:w-[14px] sm:h-[14px]">
            <path d="M9.33325 9.91669H12.8333V6.41669" stroke={trendColor} strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.8332 9.91665L7.87484 4.95831L4.95817 7.87498L1.1665 4.08331" stroke={trendColor} strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span className="text-[12px] sm:text-[13px] font-medium leading-tight" style={{ color: trendColor }}>{trend}</span>
      </div>
    </div>
  );
}

export function KPICards() {
  const { data: kpis, isLoading } = useKPIs();

  if (isLoading) return <div className="text-white">Chargement...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <KPICard
        title="Moteurs Totaux"
        value={String(kpis?.totalMotors ?? "")}
        trend={kpis?.totalMotorsTrend ?? ""}
        trendUp={true}
        trendColor="#10B981"
        iconBg="bg-[rgba(14,165,233,0.10)]"
        icon={
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <g clipPath="url(#kpi-clock-clip)">
              <path d="M1.6665 10C1.6665 14.5993 5.40055 18.3334 9.99984 18.3334C14.5991 18.3334 18.3332 14.5993 18.3332 10C18.3332 5.40073 14.5991 1.66669 9.99984 1.66669C5.40055 1.66669 1.6665 5.40073 1.6665 10V10" stroke="#0EA5E9" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 5V10L13.3333 11.6667" stroke="#0EA5E9" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs><clipPath id="kpi-clock-clip"><rect width="20" height="20" fill="white" /></clipPath></defs>
          </svg>
        }
      />
      <KPICard
        title="Moteurs Critiques"
        value={String(kpis?.criticalMotors ?? "")}
        trend={kpis?.criticalMotorsTrend ?? ""}
        trendUp={true}
        trendColor="#EF4444"
        iconBg="bg-[rgba(239,68,68,0.10)]"
        icon={
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M18.1083 15L11.4416 3.33332C11.1457 2.81113 10.5918 2.4884 9.99161 2.4884C9.3914 2.4884 8.83754 2.81113 8.54161 3.33332L1.87494 15C1.57585 15.518 1.57726 16.1565 1.87865 16.6732C2.18003 17.1898 2.73516 17.5054 3.33327 17.5H16.6666C17.2617 17.4994 17.8114 17.1815 18.1087 16.6659C18.406 16.1504 18.4058 15.5154 18.1083 15M9.99994 7.49998V10.8333M9.99994 14.1666H10.0083" stroke="#EF4444" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      />
      <KPICard
        title="Disponibilité"
        value={String(kpis?.uptime ?? "")}
        trend={kpis?.uptimeTrend ?? ""}
        trendUp={kpis?.uptimeTrendUp !== undefined ? kpis.uptimeTrendUp : true}
        trendColor="#10B981"
        iconBg="bg-[rgba(16,185,129,0.10)]"
        icon={
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <g clipPath="url(#kpi-wave-clip)">
              <path d="M18.3334 10H16.2667C15.5183 9.99842 14.8605 10.496 14.6584 11.2167L12.7001 18.1834C12.6742 18.2722 12.5927 18.3334 12.5001 18.3334C12.4075 18.3334 12.326 18.2722 12.3001 18.1834L7.70008 1.81669C7.67416 1.7278 7.59267 1.66669 7.50008 1.66669C7.40749 1.66669 7.32601 1.7278 7.30008 1.81669L5.34175 8.78335C5.14049 9.50107 4.48715 9.99789 3.74175 10H1.66675" stroke="#10B981" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs><clipPath id="kpi-wave-clip"><rect width="20" height="20" fill="white" /></clipPath></defs>
          </svg>
        }
      />
      <KPICard
        title="Alertes Totales"
        value={String(kpis?.alerts ?? "")}
        trend={kpis?.alertsTrend ?? ""}
        trendUp={true}
        trendColor="#EF4444"
        iconBg="bg-[rgba(239,68,68,0.10)]"
        icon={
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M18.1083 15L11.4416 3.33332C11.1457 2.81113 10.5918 2.4884 9.99161 2.4884C9.3914 2.4884 8.83754 2.81113 8.54161 3.33332L1.87494 15C1.57585 15.518 1.57726 16.1565 1.87865 16.6732C2.18003 17.1898 2.73516 17.5054 3.33327 17.5H16.6666C17.2617 17.4994 17.8114 17.1815 18.1087 16.6659C18.406 16.1504 18.4058 15.5154 18.1083 15M9.99994 7.49998V10.8333M9.99994 14.1666H10.0083" stroke="#EF4444" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      />
    </div>
  );
}
