import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface VibrationData {
  time: string;
  x: number;
  y: number;
  z: number;
}

export function useVibrations() {
  return useQuery<VibrationData[]>({
    queryKey: ["/api/v1/iot/vibrations"],
    queryFn: () => apiRequest("GET", "/api/v1/iot/vibrations"),
  });
}
