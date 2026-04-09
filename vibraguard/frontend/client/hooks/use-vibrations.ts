import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface VibrationData {
  time: string;
  x: number;
  y: number;
  z: number;
}

export function useVibrations() {
  const queryClient = useQueryClient();
  const queryKey = ["/api/v1/iot/vibrations"];

  const query = useQuery<VibrationData[]>({
    queryKey,
    queryFn: () => apiRequest("GET", "/api/v1/iot/vibrations"),
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/vibrations`;
    
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const newData: VibrationData = JSON.parse(event.data);
        queryClient.setQueryData<VibrationData[]>(queryKey, (oldData = []) => {
          const updated = [...oldData, newData];
          if (updated.length > 40) return updated.slice(updated.length - 40);
          return updated;
        });
      } catch (err) {
        console.error("WS error:", err);
      }
    };

    return () => socket.close();
  }, [queryClient, queryKey]);

  return query;
}
