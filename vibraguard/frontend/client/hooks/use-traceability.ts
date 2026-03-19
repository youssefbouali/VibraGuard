import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface TraceabilityStep {
  label: string;
  sublabel: string;
  status: "done" | "active" | "pending";
  borderColor: string;
  bgColor: string;
  sublabelColor: string;
  iconType: "alert" | "order" | "intervention" | "contract" | "block";
}

export function useTraceability() {
  return useQuery<TraceabilityStep[]>({
    queryKey: ["/api/v1/blockchain/traceability"],
    queryFn: () => apiRequest("GET", "/api/v1/blockchain/traceability"),
  });
}
