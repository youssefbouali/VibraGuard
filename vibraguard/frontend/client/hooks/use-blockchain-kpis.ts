import { useQuery } from "@tanstack/react-query";

export interface BlockchainKPIs {
  secureBlocks: number;
  secureBlocksTrend: string;
  secureBlocksUp: boolean;
  smartContracts: number;
  integrityRate: number;
  validationTime: number;
}

export function useBlockchainKPIs() {
  return useQuery<BlockchainKPIs>({
    queryKey: ["blockchain-kpis-derived"],
    queryFn: async () => {
      let events: any[] = [];
      let blockchainReachable = false;

      try {
        const { fetchWorkOrderEvents, getBlockchainStats } = await import("@/lib/blockchain");
        events = await fetchWorkOrderEvents() || [];
        blockchainReachable = true;
      } catch (e) {
        console.warn("Blockchain not accessible for KPIs", e);
      }

      // Blocs Sécurisés: unique block numbers that have OT transactions
      const blockNumbers = new Set(events.map((e: any) => e.bloc).filter(Boolean));
      const secureBlocks = blockNumbers.size;

      // Contrats Intelligents: 1 deployed contract (WorkOrderRegistry)
      // Only count as active if blockchain is reachable
      const smartContracts = blockchainReachable ? 1 : 0;

      // Taux d'Intégrité: 100% if blockchain responds, 0% if unreachable
      const integrityRate = blockchainReachable ? 100 : 0;

      // Temps de Synthèse: average milliseconds between block timestamps (from event dates)
      let validationTime = 0;
      if (events.length > 1) {
        const timestamps = events
          .map((e: any) => {
            // Parse the French locale date string back to ms
            try { return new Date(e.date).getTime(); } catch { return null; }
          })
          .filter((t): t is number => t !== null && !isNaN(t))
          .sort((a, b) => a - b);

        if (timestamps.length > 1) {
          const diffs = timestamps.slice(1).map((t, i) => t - timestamps[i]);
          const avgMs = diffs.reduce((acc, d) => acc + d, 0) / diffs.length;
          validationTime = Math.round((avgMs / 1000) * 10) / 10; // convert to seconds, 1 decimal
        }
      }

      return {
        secureBlocks,
        secureBlocksTrend: `+${secureBlocks} total`,
        secureBlocksUp: secureBlocks > 0,
        smartContracts,
        integrityRate,
        validationTime,
      };
    },
    refetchInterval: 10000,
  });
}
