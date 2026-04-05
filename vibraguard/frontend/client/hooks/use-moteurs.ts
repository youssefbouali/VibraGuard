import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface Moteur {
  id: string;
  type: string;
  zone: string;
  localisation: string;
  puissance: string;
  etatSante: string;
  vibrationRMS: number;
  derniereAlerte: string;
  alerteRef?: string;
  // Legacy fields if still used
  etatLabel?: string;
  vibration?: string;
}

export function useMoteurs() {
  return useQuery<Moteur[]>({
    queryKey: ["/api/v1/iot/moteurs"],
    queryFn: () => apiRequest("GET", "/api/v1/iot/motors"),
  });
}
