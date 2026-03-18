import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface AuditTransaction {
  hash: string;
  bloc?: string;
  moteur?: string;
  action?: string;
  intervention?: string;
  date: string;
  user?: string;
}

export function useAudit() {
  return useQuery<AuditTransaction[]>({
    queryKey: ["/api/v1/blockchain/audit"],
    queryFn: () => apiRequest("GET", "/api/v1/blockchain/audit"),
  });
}
