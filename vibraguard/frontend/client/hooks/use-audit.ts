import { useQuery } from "@tanstack/react-query";

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
    queryKey: ["blockchain-audit-events"],
    queryFn: async () => {
      try {
        const { fetchWorkOrderEvents } = await import("@/lib/blockchain");
        return await fetchWorkOrderEvents() || [];
      } catch (e) {
        console.warn("Blockchain not accessible", e);
        return [];
      }
    },
    refetchInterval: 15000, // Auto-refresh every 15s
  });
}
