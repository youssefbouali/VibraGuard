import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface DashboardKPIs {
  totalMotors: number;
  totalMotorsTrend: string;
  criticalMotors: number;
  criticalMotorsTrend: string;
  alerts: number;
  alertsTrend: string;
  uptime: string;
  uptimeTrend: string;
  uptimeTrendUp: boolean;
}

export function useKPIs() {
  const queryClient = useQueryClient();
  const queryKey = ["/api/v1/bi/kpis"];

  const query = useQuery<DashboardKPIs>({
    queryKey,
    queryFn: () => apiRequest("GET", "/api/v1/bi/kpis"),
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/alerts`;
    
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const newAlerte = JSON.parse(event.data);
        // Instead of blind incrementing, invalidate the query to get fresh, accurate data from backend
        queryClient.invalidateQueries({ queryKey });
      } catch (err) {
        console.error("KPI Alert WS error:", err);
      }
    };

    return () => socket.close();
  }, [queryClient]);

  return query;
}
