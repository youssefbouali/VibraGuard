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
  derniereAlerteType?: string;
  alerteRef?: string;
  actif?: boolean;
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
              ? { 
                  ...m, 
                  vibrationRMS: Math.round(data.vibRms * 100) / 100,
                  vibration: (data.vibRms).toFixed(2),
                  vibrationColor: data.anomalous ? "#EF4444" : "#10B981",
                  // Locally update health to show recovery
                  etatPct: data.anomalous ? Math.max(45, m.etatPct - 5) : Math.min(100, m.etatPct + 2),
                  get etatLabel() { 
                    const p = this.etatPct;
                    const l = p > 80 ? "Normal" : p > 50 ? "Attention" : "Critique";
                    return `${p}% ${l}`;
                  },
                  get etatColor() {
                    return this.etatPct > 80 ? "#10B981" : this.etatPct > 50 ? "#F59E0B" : "#EF4444";
                  }
                } 
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
            // Match by motorId or if message contains motorId
            if (m.id === data.motorId || (data.message && data.message.includes(m.id))) {
              const newHealth = data.priority === "high" ? 45 : 65;
              const newLabel = "Critique";
              const newColor = data.priority === "high" ? "#EF4444" : "#F59E0B";
              
              return { 
                ...m, 
                derniereAlerte: data.time,
                derniereAlerteType: data.anomalyType || "Anomalie",
                etatSante: newLabel,
                etatLabel: `${newHealth}% ${newLabel}`,
                etatPct: newHealth,
                etatColor: newColor
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
