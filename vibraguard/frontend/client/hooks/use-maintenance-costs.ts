import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface MaintenanceCost {
  month: string;
  reel: number;
  budget: number;
}

export function useMaintenanceCosts() {
  return useQuery<MaintenanceCost[]>({
    queryKey: ["/api/v1/bi/maintenance-costs"],
    queryFn: () => apiRequest("GET", "/api/v1/bi/maintenance-costs"),
  });
}
