import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface InterventionType {
  type: string;
  value: number;
  color: string;
}

export function useInterventions() {
  return useQuery<InterventionType[]>({
    queryKey: ["/api/v1/bi/interventions"],
    queryFn: () => apiRequest("GET", "/api/v1/bi/interventions"),
  });
}
