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
    queryFn: async () => {
      // Fetch from traditional backend DB
      const dbAudits = await apiRequest("GET", "/api/v1/blockchain/audit");
      
      // Fetch verified events straight from local smart contract
      let bcAudits: any[] = [];
      try {
        const { fetchWorkOrderEvents } = await import("@/lib/blockchain");
        bcAudits = await fetchWorkOrderEvents() || [];
      } catch (e) { console.warn("Local blockchain not running/accessible", e); }
      
      // Merge, prioritizing blockchain verified
      return [...bcAudits, ...dbAudits];
    },
  });
}
