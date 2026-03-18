import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface Moteur {
  id: string;
  type: string;
  etatLabel: string;
  etatColor: string;
  etatPct: number;
  vibration: string;
  vibrationColor: string;
  trendIcon: string;
}

export function useMoteurs() {
  return useQuery<Moteur[]>({
    queryKey: ["/api/v1/iot/moteurs"],
    queryFn: () => apiRequest("GET", "/api/v1/iot/motors"),
  });
}
