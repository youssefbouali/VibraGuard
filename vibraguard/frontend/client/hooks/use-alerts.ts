import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface Alerte {
  id: string;
  message: string;
  level: string;
  time: string;
  color: string;
  priority: string;
}

export function useAlerts() {
  return useQuery<Alerte[]>({
    queryKey: ["/api/v1/ml/alerts"],
    queryFn: () => apiRequest("GET", "/api/v1/ml/alerts"),
  });
}
