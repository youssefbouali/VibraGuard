import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface DashboardKPIs {
  totalMotors: number;
  criticalMotors: number;
  alerts: number;
  uptime: string;
}

export function useKPIs() {
  return useQuery<DashboardKPIs>({
    queryKey: ["/api/v1/iot/kpis"],
    queryFn: () => apiRequest("GET", "/api/v1/iot/kpis"),
  });
}
