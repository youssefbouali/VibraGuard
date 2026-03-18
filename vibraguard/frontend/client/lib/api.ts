export async function apiRequest<T>(
  method: string,
  url: string,
  data?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem("token")
        ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
        : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (res.status === 401) {
    // Optional: handle unauthorized
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || "An error occurred");
  }

  return res.json();
}

export const api = {
  getMotors: () => apiRequest<any[]>("GET", "/api/v1/iot/motors"),
  getAlerts: () => apiRequest<any[]>("GET", "/api/v1/ml/alerts"),
  getKPIs: () => apiRequest<any>("GET", "/api/v1/iot/kpis"),
  getWorkOrders: () => apiRequest<any[]>("GET", "/api/v1/iot/work-orders"),
  getAudit: () => apiRequest<any[]>("GET", "/api/v1/blockchain/audit"),
};
