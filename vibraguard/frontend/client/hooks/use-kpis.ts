import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface DashboardKPIs {
  totalMotors: number;
  totalMotorsTrend: string;
  criticalMotors: number;
  criticalMotorsTrend: string;
  alerts: number;
  alertsTrend: string;
  uptime: string;
  uptimeTrend: string;
  uptimeTrendUp: boolean;
}

export function useKPIs() {
  return useQuery<DashboardKPIs>({
    queryKey: ["/api/v1/iot/kpis"],
    queryFn: () => apiRequest("GET", "/api/v1/iot/kpis"),
  });
}
