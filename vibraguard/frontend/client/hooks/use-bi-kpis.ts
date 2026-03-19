import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface BIKPIs {
  mtbf: number;
  mtbfTrend: string;
  mtbfUp: boolean;
  mttr: number;
  mttrTrend: string;
  mttrUp: boolean;
  availability: number;
  availabilityTrend: string;
  availabilityUp: boolean;
  maintenanceCost: number;
  maintenanceCostTrend: string;
  maintenanceCostUp: boolean;
  sitesConnected: number;
  activeAlerts: number;
}

export function useBIKPIs() {
  return useQuery<BIKPIs>({
    queryKey: ["/api/v1/bi/kpis"],
    queryFn: () => apiRequest("GET", "/api/v1/bi/kpis"),
  });
}
