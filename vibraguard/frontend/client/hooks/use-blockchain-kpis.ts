import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

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
    queryKey: ["/api/v1/blockchain/kpis"],
    queryFn: () => apiRequest("GET", "/api/v1/blockchain/kpis"),
  });
}
