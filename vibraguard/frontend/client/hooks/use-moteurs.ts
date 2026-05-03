import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const queryKey = ["/api/v1/iot/moteurs"];

  const query = useQuery<Moteur[]>({
    queryKey,
    queryFn: () => apiRequest("GET", "/api/v1/iot/motors"),
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    
    // Vibration WebSocket
    const vibSocket = new WebSocket(`${protocol}//${host}/ws/vibrations`);
    vibSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        queryClient.setQueryData<Moteur[]>(queryKey, (oldData) => {
          if (!oldData) return oldData;
          return oldData.map(m => 
            m.id === data.motorId 
              ? { ...m, vibrationRMS: Math.round(data.x * 100) / 100 } 
              : m
          );
        });
      } catch (e) {
        console.error("Vib WS error:", e);
      }
    };

    // Alert WebSocket
    const alertSocket = new WebSocket(`${protocol}//${host}/ws/alerts`);
    alertSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        queryClient.setQueryData<Moteur[]>(queryKey, (oldData) => {
          if (!oldData) return oldData;
          return oldData.map(m => {
            if (m.id === data.motorId || data.message?.includes(m.id)) {
              return { 
                ...m, 
                derniereAlerte: data.time,
                etatSante: data.priority === "high" ? "Critique" : "Alerte"
              };
            }
            return m;
          });
        });
      } catch (e) {
        console.error("Alert WS error:", e);
      }
    };

    return () => {
      vibSocket.close();
      alertSocket.close();
    };
  }, [queryClient]);

  return query;
}
