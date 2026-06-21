import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export interface Alerte {
  id: string;
  message: string;
  level: string;
  time: string;
  color: string;
  status: string;
  priority: string;
  motorId: string;
  title: string;
  type?: string;
  velociteRms?: number;
  accelerationPeak?: number;
  temperature?: number;
  scoreConfianceIA?: number;
  depassementSeuil?: number;
  anomalyType?: string;
}

export function useAlerts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const minConfidence = user?.confidenceThreshold ?? 51;
  const queryKey = ["/api/v1/ml/alerts", minConfidence];

  const query = useQuery<Alerte[]>({
    queryKey,
    queryFn: () => apiRequest("GET", `/api/v1/ml/alerts?minConfidence=${minConfidence}`),
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/alerts`;

    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const newAlerte: Alerte = JSON.parse(event.data);
        queryClient.setQueryData<Alerte[]>(queryKey, (oldData) => {
          const safeOldData = Array.isArray(oldData) ? oldData : [];
          if (safeOldData.some(a => a.id === newAlerte.id)) return safeOldData;
          return [newAlerte, ...safeOldData];
        });
      } catch (err) {
        console.error("Alert WS error:", err);
      }
    };

    return () => socket.close();
  }, [queryClient, queryKey]);

  return query;
}
