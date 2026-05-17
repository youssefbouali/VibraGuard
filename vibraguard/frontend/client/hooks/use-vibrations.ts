import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface VibrationData {
  id?: string;
  motorId?: string;
  time: string;
  vibRms: number;
  vibPeak: number;
  vibKurtosis: number;
  temperature: number;
  currentRms: number;
  isAnomalous: boolean;
}

export function useVibrations(motorId?: string) {
  const queryClient = useQueryClient();
  // If motorId is provided, use motor-specific endpoint
  const queryKey = motorId
    ? ["/api/v1/iot/motors", motorId, "vibration"]
    : ["/api/v1/iot/vibrations"];

  const query = useQuery<VibrationData[]>({
    queryKey,
    queryFn: () =>
      motorId
        ? apiRequest("GET", `/api/v1/iot/motors/${motorId}/vibration`)
        : apiRequest("GET", "/api/v1/iot/motors/vibrations"),
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/vibrations`;
    
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const newData: VibrationData = JSON.parse(event.data);
        // If filtering by motorId, only append matching data
        if (motorId && newData.motorId && newData.motorId !== motorId) return;
        queryClient.setQueryData<VibrationData[]>(queryKey, (oldData) => {
          const safeOldData = Array.isArray(oldData) ? oldData : [];
          const updated = [...safeOldData, newData];
          if (updated.length > 200) return updated.slice(updated.length - 200);
          return updated;
        });
      } catch (err) {
        console.error("WS error:", err);
      }
    };

    return () => socket.close();
  }, [queryClient, motorId]);

  return query;
}
